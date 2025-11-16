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
