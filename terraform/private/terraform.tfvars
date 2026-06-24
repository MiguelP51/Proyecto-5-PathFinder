# Región de AWS donde se creará la infraestructura
aws_region = "us-east-1"

# Nombre del entorno
environment = "prod"

# Tipo de instancia EC2 (t3.small tiene 2 vCPUs y 2GB de RAM)
ec2_instance_type = "t3.small"

# Tamaño del disco raíz de la EC2 en GB
ec2_volume_size = 30

#MODIFICADO!!!!
# Nombre de tu archivo KeyPair (.pem) de AWS (debe existir previamente en tu consola de AWS)
# NO incluyas la extensión .pem, solo el nombre (ej. "PathFinder_production")
ec2_key_name = "test_lab"

# Clase de instancia de base de datos para RDS PostgreSQL
db_instance_class = "db.t3.micro"

# Nombre inicial de la base de datos PostgreSQL
db_name = "pathfinder_prod_test"

# Usuario administrador de la base de datos
db_username = "pathfinder_prod"

#MODIFICADO!!!!!
# Contraseña de la base de datos (¡Recomendable usar una muy segura!)
db_password = "test2026!"

#MODIFICADO!!!!
# Nombre único para el bucket de S3
s3_bucket_name = "pathfinder-storage-test"

# Tu dominio registrado en Route 53 (ej. pathfinder.com)
domain_name = "pathfinder.com"

# Cambiar a true si deseas que Terraform asocie automáticamente tu dominio a la IP de la VM.
# NOTA: Requiere que ya tengas configurado una "Hosted Zone" en Route 53 con el mismo domain_name.
create_route53_records = false
