output "websocket_api_id" {
  description = "ID of the WebSocket API Gateway"
  value       = aws_apigatewayv2_api.websocket_api.id
}

output "websocket_api_arn" {
  description = "ARN of the WebSocket API Gateway"
  value       = aws_apigatewayv2_api.websocket_api.arn
}

output "websocket_api_endpoint" {
  description = "WebSocket API endpoint URL"
  value       = aws_apigatewayv2_api.websocket_api.api_endpoint
}

output "websocket_stage_invoke_url" {
  description = "Invoke URL for the WebSocket API Gateway stage"
  value       = aws_apigatewayv2_stage.websocket_stage.invoke_url
}

output "stage_name" {
  description = "Name of the API Gateway stage"
  value       = aws_apigatewayv2_stage.websocket_stage.name
}

output "stage_arn" {
  description = "ARN of the API Gateway stage"
  value       = aws_apigatewayv2_stage.websocket_stage.arn
}

output "vpc_link_id" {
  description = "ID of the VPC Link"
  value       = aws_apigatewayv2_vpc_link.vpc_link.id
}

output "vpc_link_arn" {
  description = "ARN of the VPC Link"
  value       = aws_apigatewayv2_vpc_link.vpc_link.arn
}

output "integration_id" {
  description = "ID of the API Gateway integration"
  value       = aws_apigatewayv2_integration.alb_integration.id
}

output "cloudwatch_log_group_name" {
  description = "Name of the CloudWatch log group for WebSocket API logs"
  value       = aws_cloudwatch_log_group.websocket_logs.name
}

output "cloudwatch_log_group_arn" {
  description = "ARN of the CloudWatch log group for WebSocket API logs"
  value       = aws_cloudwatch_log_group.websocket_logs.arn
}
