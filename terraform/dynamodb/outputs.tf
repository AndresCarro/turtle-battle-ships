output "table_name" {
  value       = aws_dynamodb_table.this.name
  description = "Nombre de la tabla DynamoDB creada"
}

output "table_arn" {
  value       = aws_dynamodb_table.this.arn
  description = "ARN de la tabla DynamoDB creada"
}