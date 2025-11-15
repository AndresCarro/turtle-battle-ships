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
