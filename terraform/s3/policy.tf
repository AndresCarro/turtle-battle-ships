
resource "aws_s3_bucket_public_access_block" "spa_public_access" {
    bucket = aws_s3_bucket.spa_bucket.id

    block_public_acls       = false
    block_public_policy     = false
    ignore_public_acls      = false
    restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "spa_policy" {
    bucket = aws_s3_bucket.spa_bucket.id
    policy = jsonencode({
        Version = "2012-10-17"
        Statement = [
            {
                Sid       = "PublicReadGetObject",
                Effect    = "Allow",
                Principal = "*",
                Action    = "s3:GetObject",
                Resource  = "${aws_s3_bucket.spa_bucket.arn}/*"
            }
        ]
    })
}
