# REST API Gateway Outputs
output "rest_api_id" {
  description = "ID of the REST API Gateway"
  value       = module.rest_api.api_id
}

output "rest_api_invoke_url" {
  description = "Invoke URL for the REST API Gateway"
  value       = module.rest_api.invoke_url
}

output "rest_api_stage_name" {
  description = "Name of the REST API Gateway stage"
  value       = module.rest_api.stage_name
}

# WebSocket API Gateway Outputs
output "websocket_api_id" {
  description = "ID of the WebSocket API Gateway"
  value       = var.backend_config.enabled ? module.websocket_api[0].websocket_api_id : null
}

output "websocket_api_endpoint" {
  description = "WebSocket API endpoint URL"
  value       = var.backend_config.enabled ? module.websocket_api[0].websocket_api_endpoint : null
}

output "websocket_api_invoke_url" {
  description = "Invoke URL for the WebSocket API Gateway (use this for frontend WebSocket connections)"
  value       = var.backend_config.enabled ? module.websocket_api[0].websocket_stage_invoke_url : null
}

# Backend Service Outputs
output "backend_alb_dns" {
  description = "DNS name of the backend Application Load Balancer"
  value       = var.backend_config.enabled ? module.backend[0].alb_dns_name : null
}

output "backend_service_name" {
  description = "Name of the backend ECS service"
  value       = var.backend_config.enabled ? module.backend[0].service_name : null
}

# Frontend Outputs
output "frontend_website_url" {
  description = "URL of the frontend website hosted on S3"
  value       = module.frontend_bucket.website_endpoint
}

# RDS Database Outputs
output "rds_primary_endpoint" {
  description = "Primary RDS instance endpoint"
  value       = module.rds.primary_instance_endpoint
  sensitive   = true
}

output "rds_primary_address" {
  description = "Primary RDS instance address (hostname)"
  value       = module.rds.primary_instance_address
}

output "rds_proxy_endpoint" {
  description = "RDS Proxy endpoint (use this for applications)"
  value       = module.rds.proxy_endpoint
}

output "rds_read_endpoint" {
  description = "Read endpoint (read replica if available, otherwise primary)"
  value       = module.rds.read_endpoint
}

output "rds_database_name" {
  description = "Name of the database"
  value       = module.rds.database_name
}

output "rds_master_username" {
  description = "Master username for the database"
  value       = module.rds.master_username
}

output "rds_password_ssm_parameter" {
  description = "SSM Parameter name containing the database password"
  value       = module.rds.db_password_ssm_parameter
}

output "rds_security_group_id" {
  description = "Security group ID for RDS instances"
  value       = module.rds.rds_security_group_id
}

output "rds_connection_info" {
  description = "Complete RDS connection information"
  value = {
    endpoint       = module.rds.proxy_endpoint != null ? module.rds.proxy_endpoint : module.rds.primary_instance_endpoint
    host           = module.rds.proxy_endpoint != null ? module.rds.proxy_endpoint : module.rds.primary_instance_address
    port           = module.rds.primary_instance_port
    database       = module.rds.database_name
    username       = module.rds.master_username
    password_param = module.rds.db_password_ssm_parameter
  }
  sensitive = true
}

