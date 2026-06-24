output "ec2_elastic_ip" {
  value       = aws_eip.ec2_eip.public_ip
  description = "Direccion IP elastica (fija) asociada a la instancia EC2 de produccion"
}

output "rds_endpoint" {
  value       = aws_db_instance.postgres.endpoint
  description = "El endpoint de conexion de la base de datos RDS PostgreSQL (Host:Port)"
}

output "rds_hostname" {
  value       = aws_db_instance.postgres.address
  description = "La direccion de red (host) de la base de datos RDS PostgreSQL"
}

output "s3_bucket_name" {
  value       = aws_s3_bucket.storage.id
  description = "Nombre del bucket S3 de almacenamiento de produccion creado"
}

output "ssh_connection_command" {
  value       = "ssh -i \"~/.ssh/${var.ec2_key_name}.pem\" ubuntu@${aws_eip.ec2_eip.public_ip}"
  description = "Comando rapido para conectarte por SSH a tu nueva VM de produccion"
}
