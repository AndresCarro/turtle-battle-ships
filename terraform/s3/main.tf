resource "aws_s3_bucket" "spa_bucket" {
    bucket = var.bucket_name
}

resource "aws_s3_bucket_website_configuration" "spa_site" {
    bucket = aws_s3_bucket.spa_bucket.id

    index_document {
        suffix = "index.html"
    }

    error_document {
        key = "index.html"
    }
}
