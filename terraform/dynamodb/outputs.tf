output "table_name" {
  value       = aws_dynamodb_table.this.name
  description = "Name of the created DynamoDB table"
}

output "table_arn" {
  value       = aws_dynamodb_table.this.arn
  description = "ARN of the created DynamoDB table"
}

output "table_id" {
  value       = aws_dynamodb_table.this.id
  description = "ID of the created DynamoDB table"
}

output "table_stream_arn" {
  value       = try(aws_dynamodb_table.this.stream_arn, null)
  description = "ARN of the DynamoDB table stream (if enabled)"
}