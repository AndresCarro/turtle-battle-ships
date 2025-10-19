output "function_name" {
  description = "Name of the Lambda function"
  value       = aws_lambda_function.function.function_name
}

output "function_arn" {
  description = "ARN of the Lambda function"
  value       = aws_lambda_function.function.arn
}

output "function_invoke_arn" {
  description = "Invoke ARN of the Lambda function (for API Gateway integration)"
  value       = aws_lambda_function.function.invoke_arn
}

output "function_qualified_arn" {
  description = "Qualified ARN of the Lambda function (includes version)"
  value       = aws_lambda_function.function.qualified_arn
}

output "function_version" {
  description = "Latest published version of the Lambda function"
  value       = aws_lambda_function.function.version
}

output "ecr_repository_url" {
  description = "URL of the ECR repository"
  value       = aws_ecr_repository.lambda_repo.repository_url
}

output "ecr_repository_arn" {
  description = "ARN of the ECR repository"
  value       = aws_ecr_repository.lambda_repo.arn
}

output "image_uri" {
  description = "URI of the Docker image used by the Lambda function"
  value       = aws_lambda_function.function.image_uri
}

output "log_group_name" {
  description = "Name of the CloudWatch Log Group"
  value       = aws_cloudwatch_log_group.lambda_log_group.name
}

output "log_group_arn" {
  description = "ARN of the CloudWatch Log Group"
  value       = aws_cloudwatch_log_group.lambda_log_group.arn
}
