terraform {
  required_version = ">= 1.0.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# ==========================================
# 1. NETWORKING (VPC, Subnets, Gateways)
# ==========================================

resource "aws_vpc" "pathfinder_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "pathfinder-vpc"
    Environment = var.environment
  }
}

resource "aws_internet_gateway" "pathfinder_igw" {
  vpc_id = aws_vpc.pathfinder_vpc.id

  tags = {
    Name        = "pathfinder-igw"
    Environment = var.environment
  }
}

# Subredes Públicas (Para la instancia EC2 y Nginx)
resource "aws_subnet" "public_1" {
  vpc_id                  = aws_vpc.pathfinder_vpc.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true

  tags = {
    Name        = "pathfinder-subnet-public-1"
    Environment = var.environment
  }
}

resource "aws_subnet" "public_2" {
  vpc_id                  = aws_vpc.pathfinder_vpc.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = "${var.aws_region}b"
  map_public_ip_on_launch = true

  tags = {
    Name        = "pathfinder-subnet-public-2"
    Environment = var.environment
  }
}

# Subredes Privadas (Para la base de datos RDS - AWS requiere al menos 2 en distintas AZs)
resource "aws_subnet" "private_1" {
  vpc_id            = aws_vpc.pathfinder_vpc.id
  cidr_block        = "10.0.3.0/24"
  availability_zone = "${var.aws_region}a"

  tags = {
    Name        = "pathfinder-subnet-private-1"
    Environment = var.environment
  }
}

resource "aws_subnet" "private_2" {
  vpc_id            = aws_vpc.pathfinder_vpc.id
  cidr_block        = "10.0.4.0/24"
  availability_zone = "${var.aws_region}b"

  tags = {
    Name        = "pathfinder-subnet-private-2"
    Environment = var.environment
  }
}

# Tabla de Enrutamiento para Subredes Públicas
resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.pathfinder_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.pathfinder_igw.id
  }

  tags = {
    Name        = "pathfinder-public-route-table"
    Environment = var.environment
  }
}

resource "aws_route_table_association" "public_1" {
  subnet_id      = aws_subnet.public_1.id
  route_table_id = aws_route_table.public_rt.id
}

resource "aws_route_table_association" "public_2" {
  subnet_id      = aws_subnet.public_2.id
  route_table_id = aws_route_table.public_rt.id
}

# Grupo de subredes para la base de datos RDS
resource "aws_db_subnet_group" "rds_subnet_group" {
  name        = "pathfinder-db-subnet-group"
  subnet_ids  = [aws_subnet.private_1.id, aws_subnet.private_2.id]
  description = "Grupo de subredes privadas para RDS PostgreSQL"

  tags = {
    Name        = "pathfinder-db-subnet-group"
    Environment = var.environment
  }
}

# IP Elástica para la instancia EC2 (Para tener una IP fija que apuntar con DNS)
resource "aws_eip" "ec2_eip" {
  domain = "vpc"

  tags = {
    Name        = "pathfinder-ec2-eip"
    Environment = var.environment
  }
}

resource "aws_eip_association" "ec2_eip_assoc" {
  instance_id   = aws_instance.pathfinder_ec2.id
  allocation_id = aws_eip.ec2_eip.id
}


# ==========================================
# 2. SEGURIDAD (Security Groups)
# ==========================================

# Grupo de Seguridad para la VM EC2 (Permite SSH, HTTP, HTTPS)
resource "aws_security_group" "ec2_sg" {
  name        = "pathfinder-ec2-security-group"
  description = "Permite trafico SSH, HTTP y HTTPS entrante"
  vpc_id      = aws_vpc.pathfinder_vpc.id

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # Recomendado restringir a tu IP en producción
  }

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  tags = {
    Name        = "pathfinder-ec2-sg"
    Environment = var.environment
  }
}

# Grupo de Seguridad para RDS (Permite acceso SOLO desde el EC2)
resource "aws_security_group" "rds_sg" {
  name        = "pathfinder-rds-security-group"
  description = "Permite acceso a PostgreSQL desde la instancia EC2 de Pathfinder"
  vpc_id      = aws_vpc.pathfinder_vpc.id

  ingress {
    description     = "PostgreSQL desde EC2"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ec2_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "pathfinder-rds-sg"
    Environment = var.environment
  }
}


# ==========================================
# 3. ALMACENAMIENTO (S3 & IAM para EC2)
# ==========================================

# Bucket de S3 de Producción
resource "aws_s3_bucket" "storage" {
  bucket        = var.s3_bucket_name
  force_destroy = false # Evita la eliminación accidental en producción si tiene archivos

  tags = {
    Name        = "pathfinder-storage-prod"
    Environment = var.environment
  }
}

# Bloquear acceso público no autorizado al bucket S3
resource "aws_s3_bucket_public_access_block" "storage_block" {
  bucket = aws_s3_bucket.storage.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Rol de IAM para que el EC2 acceda al Bucket S3 sin llaves estáticas
resource "aws_iam_role" "ec2_s3_role" {
  name = "pathfinder-ec2-s3-access-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Environment = var.environment
  }
}

# Política IAM para el Bucket S3 específico de producción
resource "aws_iam_policy" "s3_policy" {
  name        = "PathFinderS3StoragePolicyProd"
  description = "Permite leer, escribir y listar archivos en el bucket de produccion de Pathfinder"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "ListBucket"
        Effect = "Allow"
        Action = [
          "s3:ListBucket"
        ]
        Resource = aws_s3_bucket.storage.arn
      },
      {
        Sid    = "ManageObjects"
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        ]
        Resource = "${aws_s3_bucket.storage.arn}/*"
      }
    ]
  })
}

# Adjuntar la política de S3 al Rol de IAM del EC2
resource "aws_iam_role_policy_attachment" "ec2_s3_attach" {
  role       = aws_iam_role.ec2_s3_role.name
  policy_arn = aws_iam_policy.s3_policy.arn
}

# Crear el Instance Profile que se asocia directamente a la máquina virtual
resource "aws_iam_instance_profile" "ec2_profile" {
  name = "pathfinder-ec2-instance-profile"
  role = aws_iam_role.ec2_s3_role.name
}


# ==========================================
# 4. INSTANCIA DE BASE DE DATOS (RDS PostgreSQL)
# ==========================================

resource "aws_db_instance" "postgres" {
  identifier             = "pathfinder-db-prod"
  engine                 = "postgres"
  engine_version         = "16"
  instance_class         = var.db_instance_class
  allocated_storage      = 20
  max_allocated_storage  = 100 # Auto-escalamiento de almacenamiento activado
  storage_type           = "gp3"
  db_name                = var.db_name
  username               = var.db_username
  password               = var.db_password
  db_subnet_group_name   = aws_db_subnet_group.rds_subnet_group.name
  vpc_security_group_ids = [aws_security_group.rds_sg.id]
  skip_final_snapshot    = true
  publicly_accessible    = false

  tags = {
    Name        = "pathfinder-db-instance"
    Environment = var.environment
  }
}


# ==========================================
# 5. INSTANCIA DE CÓMPUTO (EC2)
# ==========================================

# Buscar la AMI oficial más reciente de Ubuntu 24.04 LTS
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical ID

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# Instancia EC2 con el script User Data para instalar y configurar todo automáticamente
resource "aws_instance" "pathfinder_ec2" {
  ami                  = data.aws_ami.ubuntu.id
  instance_type        = var.ec2_instance_type
  key_name             = var.ec2_key_name
  subnet_id            = aws_subnet.public_1.id
  vpc_security_group_ids = [aws_security_group.ec2_sg.id]
  iam_instance_profile = aws_iam_instance_profile.ec2_profile.name

  root_block_device {
    volume_size           = var.ec2_volume_size
    volume_type           = "gp3"
    delete_on_termination = true
  }

  # Script de configuración automática de la VM
  user_data = <<-EOF
              #!/bin/bash
              set -e

              # 1. Actualizar el sistema operativo
              apt-get update -y
              apt-get upgrade -y

              # 2. Configurar la Memoria Swap (2GB) para prevenir OOM (Out of Memory)
              fallocate -l 2G /swapfile
              chmod 600 /swapfile
              mkswap /swapfile
              swapon /swapfile
              echo '/swapfile none swap sw 0 0' >> /etc/fstab

              # 3. Instalar herramientas comunes y Java 21 OpenJDK
              apt-get install -y openjdk-21-jdk git curl ca-certificates gnupg

              # 4. Instalar Node.js 20.x y npm
              mkdir -p /etc/apt/keyrings
              curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
              echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list
              apt-get update -y
              apt-get install nodejs -y

              # 5. Instalar Docker y habilitar inicio automático
              apt-get install -y docker.io docker-compose
              systemctl start docker
              systemctl enable docker
              usermod -aG docker ubuntu

              # 6. Instalar Nginx y Certbot para el certificado SSL
              apt-get install -y nginx certbot python3-certbot-nginx

              # 7. Crear estructura base de directorios del proyecto
              mkdir -p /home/ubuntu/Proyecto-5-PathFinder/certbot/www
              mkdir -p /home/ubuntu/Proyecto-5-PathFinder/nginx
              chown -R ubuntu:ubuntu /home/ubuntu/Proyecto-5-PathFinder

              echo "=== INSTALACION DE DEPENDENCIAS COMPLETADA ==="
              EOF

  tags = {
    Name        = "pathfinder-ec2-production"
    Environment = var.environment
  }
}


# ==========================================
# 6. CONFIGURACION DNS (Route 53)
# ==========================================

# Buscar la zona hospedada existente en Route 53
data "aws_route53_zone" "selected" {
  count = var.create_route53_records ? 1 : 0
  name  = var.domain_name
}

# Registro DNS A para el dominio principal (ej. pathfinder.com)
resource "aws_route53_record" "apex" {
  count   = var.create_route53_records ? 1 : 0
  zone_id = data.aws_route53_zone.selected[0].zone_id
  name    = var.domain_name
  type    = "A"
  ttl     = 300
  records = [aws_eip.ec2_eip.public_ip]
}

# Registro DNS A para el subdominio www (ej. www.pathfinder.com)
resource "aws_route53_record" "www" {
  count   = var.create_route53_records ? 1 : 0
  zone_id = data.aws_route53_zone.selected[0].zone_id
  name    = "www.${var.domain_name}"
  type    = "A"
  ttl     = 300
  records = [aws_eip.ec2_eip.public_ip]
}
