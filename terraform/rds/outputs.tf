# Primary RDS Instance Outputs
output "primary_instance_id" {
  description = "ID of the primary RDS instance"
  value       = aws_db_instance.primary.id
}

output "primary_instance_arn" {
  description = "ARN of the primary RDS instance"
  value       = aws_db_instance.primary.arn
}

output "primary_instance_endpoint" {
  description = "Connection endpoint for the primary RDS instance"
  value       = aws_db_instance.primary.endpoint
}

output "primary_instance_address" {
  description = "Hostname of the primary RDS instance"
  value       = aws_db_instance.primary.address
}

output "primary_instance_port" {
  description = "Port of the primary RDS instance"
  value       = aws_db_instance.primary.port
}

output "primary_instance_resource_id" {
  description = "Resource ID of the primary RDS instance"
  value       = aws_db_instance.primary.resource_id
}

# Read Replica Outputs
output "read_replica_instance_id" {
  description = "ID of the read replica RDS instance"
  value       = var.create_read_replica ? aws_db_instance.read_replica[0].id : null
}

output "read_replica_instance_arn" {
  description = "ARN of the read replica RDS instance"
  value       = var.create_read_replica ? aws_db_instance.read_replica[0].arn : null
}

output "read_replica_instance_endpoint" {
  description = "Connection endpoint for the read replica RDS instance"
  value       = var.create_read_replica ? aws_db_instance.read_replica[0].endpoint : null
}

output "read_replica_instance_address" {
  description = "Hostname of the read replica RDS instance"
  value       = var.create_read_replica ? aws_db_instance.read_replica[0].address : null
}

# RDS Proxy Outputs
output "proxy_id" {
  description = "ID of the RDS Proxy"
  value       = var.create_rds_proxy ? aws_db_proxy.this[0].id : null
}

output "proxy_arn" {
  description = "ARN of the RDS Proxy"
  value       = var.create_rds_proxy ? aws_db_proxy.this[0].arn : null
}

output "proxy_endpoint" {
  description = "Connection endpoint for the RDS Proxy"
  value       = var.create_rds_proxy ? aws_db_proxy.this[0].endpoint : null
}

output "proxy_target_group_name" {
  description = "Name of the RDS Proxy target group"
  value       = var.create_rds_proxy ? aws_db_proxy_default_target_group.this[0].name : null
}

# Security Group Outputs
output "rds_security_group_id" {
  description = "ID of the RDS security group"
  value       = aws_security_group.rds.id
}

output "rds_security_group_arn" {
  description = "ARN of the RDS security group"
  value       = aws_security_group.rds.arn
}

output "proxy_security_group_id" {
  description = "ID of the RDS Proxy security group"
  value       = var.create_rds_proxy ? aws_security_group.rds_proxy[0].id : null
}

output "proxy_security_group_arn" {
  description = "ARN of the RDS Proxy security group"
  value       = var.create_rds_proxy ? aws_security_group.rds_proxy[0].arn : null
}

# Database Credentials Outputs
output "db_password_ssm_parameter" {
  description = "Name of the SSM Parameter containing the database password"
  value       = aws_ssm_parameter.db_password.name
}

output "db_password" {
  description = "Database password (sensitive - only use for development/testing)"
  value       = random_password.master.result
  sensitive   = true
}

output "master_username" {
  description = "Master username for the database"
  value       = var.master_username
}

output "database_name" {
  description = "Name of the created database"
  value       = var.database_name
}

# Subnet Group Output
output "db_subnet_group_name" {
  description = "Name of the DB subnet group"
  value       = aws_db_subnet_group.this.name
}

output "db_subnet_group_arn" {
  description = "ARN of the DB subnet group"
  value       = aws_db_subnet_group.this.arn
}

# Connection Information (for application configuration)
output "connection_info" {
  description = "Connection information for applications (use proxy endpoint if available)"
  value = {
    endpoint       = var.create_rds_proxy ? aws_db_proxy.this[0].endpoint : aws_db_instance.primary.endpoint
    address        = var.create_rds_proxy ? aws_db_proxy.this[0].endpoint : aws_db_instance.primary.address
    port           = var.port
    database       = var.database_name
    username       = var.master_username
    password_param = aws_ssm_parameter.db_password.name
  }
  sensitive = true
}

# Read Endpoint (for read-only queries)
output "read_endpoint" {
  description = "Endpoint for read-only queries (read replica if available, otherwise primary)"
  value       = var.create_read_replica ? aws_db_instance.read_replica[0].endpoint : aws_db_instance.primary.endpoint
}
