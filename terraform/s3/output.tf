output "spa_bucket_website_endpoint" {
    description = "URL pública para acceder a la SPA en S3"
    value       = aws_s3_bucket_website_configuration.spa_site.website_endpoint
}

output "spa_bucket_name" {
    description = "Nombre del bucket"
    value       = aws_s3_bucket.spa_bucket.bucket
}
