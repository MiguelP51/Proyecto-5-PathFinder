variable "aws_region" {
  type        = string
  description = "Región de AWS para desplegar la infraestructura"
  default     = "us-east-1"
}

variable "environment" {
  type        = string
  description = "Nombre del entorno (ej. dev, prod)"
  default     = "prod"
}

variable "ec2_instance_type" {
  type        = string
  description = "Tipo de instancia EC2"
  default     = "t3.small"
}

variable "ec2_volume_size" {
  type        = number
  description = "Tamaño del disco de la instancia EC2 (en GB)"
  default     = 30
}

variable "ec2_key_name" {
  type        = string
  description = "Nombre de la clave SSH (KeyPair) registrada en tu AWS para acceder a la instancia"
}

variable "db_instance_class" {
  type        = string
  description = "Clase de la instancia RDS de PostgreSQL"
  default     = "db.t3.micro"
}

variable "db_name" {
  type        = string
  description = "Nombre de la base de datos de PostgreSQL"
  default     = "pathfinder_prod"
}

variable "db_username" {
  type        = string
  description = "Usuario administrador de la base de datos"
  default     = "pathfinder_prod"
}

variable "db_password" {
  type        = string
  description = "Contraseña de la base de datos (mínimo 8 caracteres)"
  sensitive   = true
}

variable "s3_bucket_name" {
  type        = string
  description = "Nombre del bucket S3 para almacenamiento de PDFs/CVs"
  default     = "pathfinder-storage-prod"
}

variable "domain_name" {
  type        = string
  description = "Dominio principal del proyecto (ej. pathfinder.com)"
  default     = "pathfinder.com"
}

variable "create_route53_records" {
  type        = bool
  description = "Indica si se deben crear los registros DNS en Route 53 para el dominio. Requiere que la zona hospedada ya exista."
  default     = false
}
