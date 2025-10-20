output "api_id" {
  description = "ID of the API Gateway REST API"
  value       = aws_api_gateway_rest_api.api.id
}

output "api_arn" {
  description = "ARN of the API Gateway REST API"
  value       = aws_api_gateway_rest_api.api.arn
}

output "api_name" {
  description = "Name of the API Gateway REST API"
  value       = aws_api_gateway_rest_api.api.name
}

output "api_endpoint" {
  description = "Base URL of the API Gateway"
  value       = aws_api_gateway_rest_api.api.execution_arn
}

output "invoke_url" {
  description = "Invoke URL for the API Gateway stage"
  value       = aws_api_gateway_stage.stage.invoke_url
}

output "stage_name" {
  description = "Name of the API Gateway stage"
  value       = aws_api_gateway_stage.stage.stage_name
}

output "stage_arn" {
  description = "ARN of the API Gateway stage"
  value       = aws_api_gateway_stage.stage.arn
}

output "deployment_id" {
  description = "ID of the API Gateway deployment"
  value       = aws_api_gateway_deployment.deployment.id
}

output "cloudwatch_log_group_name" {
  description = "Name of the CloudWatch log group for API Gateway logs"
  value       = aws_cloudwatch_log_group.api_gateway_logs.name
}

output "cloudwatch_log_group_arn" {
  description = "ARN of the CloudWatch log group for API Gateway logs"
  value       = aws_cloudwatch_log_group.api_gateway_logs.arn
}
