output "bucket_ids" {
  description = "ID de cada bucket creado"
  value = {
    for name, bucket in aws_s3_bucket.this :
    name => bucket.id
  }
}

output "bucket_arns" {
  description = "ARN de cada bucket creado"
  value = {
    for name, bucket in aws_s3_bucket.this :
    name => bucket.arn
  }
}

output "bucket_names" {
  description = "Nombres de buckets creados"
  value = [for b in aws_s3_bucket.this : b.bucket]
}
