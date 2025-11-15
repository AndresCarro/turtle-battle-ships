output "backend_url" {
  description = "URL for the REST API Gateway"
  value       = module.rest_api.invoke_url
}

output "websocket_url" {
  description = "DNS name of the backend Application Load Balancer"
  value       = var.backend_config.enabled ? module.backend[0].alb_dns_name : null
}

output "frontend_website_url" {
  description = "URL of the frontend website hosted on S3"
  value       = module.frontend_bucket.s3_bucket_website_endpoint
}

# Cognito Outputs (conditional)
output "cognito_user_pool_id" {
  description = "ID of the Cognito User Pool"
  value       = var.cognito_config.enabled ? module.cognito[0].user_pool_id : null
}

output "cognito_user_pool_client_id" {
  description = "ID of the Cognito User Pool Client"
  value       = var.cognito_config.enabled ? module.cognito[0].user_pool_client_id : null
}

output "cognito_user_pool_domain" {
  description = "Domain name of the Cognito User Pool"
  value       = var.cognito_config.enabled ? module.cognito[0].user_pool_domain : null
}

output "cognito_hosted_ui_url" {
  description = "Hosted UI URL for Cognito"
  value       = var.cognito_config.enabled ? module.cognito[0].user_pool_hosted_ui_url : null
}

output "cognito_identity_pool_id" {
  description = "ID of the Cognito Identity Pool"
  value       = var.cognito_config.enabled ? module.cognito[0].identity_pool_id : null
}

output "cognito_login_url" {
  description = "Direct login URL for Cognito Hosted UI"
  value       = var.cognito_config.enabled ? module.cognito[0].user_pool_login_url : null
}

output "cognito_config" {
  description = "Complete Cognito configuration for frontend"
  value       = var.cognito_config.enabled ? module.cognito[0].cognito_config : null
  sensitive   = false
}

# URLs para configuración de Cognito (segundo deploy)
output "cognito_callback_urls_needed" {
  description = "URLs that need to be configured in terraform.tfvars for Cognito callback"
  value = var.cognito_config.enabled ? {
    api_gateway_callback_url = "${module.rest_api.invoke_url}/callback"
    frontend_logout_url      = "https://${module.frontend_bucket.s3_bucket_website_endpoint}/"
    instructions = "Update these URLs in terraform.tfvars cognito_config section and redeploy"
  } : null
}

# Database outputs
output "rds_endpoint" {
  description = "RDS instance endpoint"
  value       = module.rds.primary_instance_address
  sensitive   = true
}

output "rds_proxy_endpoint" {
  description = "RDS Proxy endpoint"
  value       = module.rds.proxy_endpoint
  sensitive   = true
}

# DynamoDB outputs
output "dynamodb_table_name" {
  description = "Name of the DynamoDB shots table"
  value       = module.dynamodb_shots.table_name
}

output "dynamodb_table_arn" {
  description = "ARN of the DynamoDB shots table"
  value       = module.dynamodb_shots.table_arn
}

# S3 bucket outputs
output "text_replays_bucket_name" {
  description = "Name of the text replays S3 bucket"
  value       = module.text_replays_bucket.s3_bucket_id
}

output "video_replays_bucket_name" {
  description = "Name of the video replays S3 bucket"
  value       = module.video_replays_bucket.s3_bucket_id
}

output "frontend_bucket_name" {
  description = "Name of the frontend S3 bucket"
  value       = module.frontend_bucket.s3_bucket_id
}

# VPC outputs
output "vpc_id" {
  description = "ID of the VPC"
  value       = module.vpc.vpc_id
}

output "private_subnet_ids" {
  description = "IDs of the private subnets"
  value       = [
    for subnet_name in ["private-logic-1", "private-logic-2", "private-db-1", "private-db-2"] :
    module.vpc.subnets[subnet_name]
  ]
}

output "public_subnet_ids" {
  description = "IDs of the public subnets"
  value       = [
    for subnet_name in ["public-alb-1", "public-alb-2"] :
    module.vpc.subnets[subnet_name]
  ]
}

# Lambda function outputs
output "lambda_function_names" {
  description = "Names of all deployed Lambda functions"
  value       = [for lambda in module.lambda_functions : lambda.function_name]
}

# SQS outputs
output "events_queue_url" {
  description = "URL of the events SQS queue"
  value       = aws_sqs_queue.events.id
}

output "events_queue_arn" {
  description = "ARN of the events SQS queue"
  value       = aws_sqs_queue.events.arn
}
