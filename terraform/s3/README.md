# 🪣 S3 Module — Reusable

This module creates a single S3 bucket with optional advanced configurations, including support for SPA hosting and automatic file uploads.

## ✨ Features

- ✅ Optional versioning  
- 🔐 Configurable Public Access Block  
- 🧾 Bucket Policy support  
- 🪩 Website hosting (SPA)  
- 🌍 **Configurable CORS rules**  
- 🔒 Server-side encryption (AES256 or KMS)  
- 🪙 Optional ACL  
- 📤 Automatic file upload from local directory

---

## 🧾 Usage Examples

### Example 1: Private Bucket with Versioning and Encryption

```hcl
module "replays_bucket" {
  source = "./s3"

  bucket_name        = "kairos-replays"
  versioning_enabled = true
  encryption_enabled = true
  sse_algorithm      = "AES256"

  public_access_block = {
    block_public_acls       = true
    block_public_policy     = true
    ignore_public_acls      = true
    restrict_public_buckets = true
  }

  tags = {
    Environment = "dev"
    Project     = "Kairos"
  }
}
```

### Example 2: Public SPA Bucket with Website Hosting and File Upload

```hcl
module "frontend_bucket" {
  source = "./s3"

  bucket_name     = "kairos-frontend"
  acl             = "public-read"
  website_enabled = true
  index_document  = "index.html"
  error_document  = "index.html"

  cors_rules = [
    {
      allowed_methods = ["GET", "HEAD"]
      allowed_origins = ["*"]
    }
  ]

  public_access_block = {
    block_public_acls       = false
    block_public_policy     = false
    ignore_public_acls      = false
    restrict_public_buckets = false
  }

  bucket_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Sid       = "PublicReadGetObject",
        Effect    = "Allow",
        Principal = "*",
        Action    = ["s3:GetObject"],
        Resource  = "arn:aws:s3:::kairos-frontend/*"
      }
    ]
  })

  upload_enabled    = true
  upload_source_dir = "../frontend/dist"

  tags = {
    Environment = "dev"
    Project     = "Kairos"
  }
}
```

### Example 3: Creating Multiple Buckets

To create multiple buckets, instantiate the module multiple times:

```hcl
module "replays_bucket" {
  source = "./s3"

  bucket_name        = "kairos-replays"
  versioning_enabled = true
  encryption_enabled = true
  sse_algorithm      = "AES256"

  tags = {
    Environment = "dev"
    Project     = "Kairos"
    Purpose     = "replays"
  }
}

module "assets_bucket" {
  source = "./s3"

  bucket_name = "kairos-assets"

  tags = {
    Environment = "dev"
    Project     = "Kairos"
    Purpose     = "assets"
  }
}
```

---

## 📥 Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|----------|
| `bucket_name` | Name of the S3 bucket | `string` | - | yes |
| `acl` | ACL for the bucket | `string` | `"private"` | no |
| `versioning_enabled` | Enable versioning for the bucket | `bool` | `false` | no |
| `public_access_block` | Public access block configuration | `object` | See below | no |
| `encryption_enabled` | Enable server-side encryption | `bool` | `false` | no |
| `sse_algorithm` | Encryption algorithm (AES256 or aws:kms) | `string` | `"AES256"` | no |
| `kms_master_key_id` | KMS key ID (required if using aws:kms) | `string` | `null` | no |
| `website_enabled` | Enable static website hosting | `bool` | `false` | no |
| `index_document` | Index document for website | `string` | `"index.html"` | no |
| `error_document` | Error document for website | `string` | `"error.html"` | no |
| `cors_rules` | List of CORS rules | `list(object)` | `[]` | no |
| `bucket_policy` | JSON policy document | `string` | `null` | no |
| `upload_enabled` | Enable file upload from local directory | `bool` | `false` | no |
| `upload_source_dir` | Source directory for file uploads | `string` | `""` | no |
| `tags` | Common tags for the bucket | `map(string)` | `{}` | no |
| `mime_types` | File extension to content-type mapping | `map(string)` | See variables.tf | no |

### Default `public_access_block` value:
```hcl
{
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
```

---

## 📤 Outputs

| Name | Description |
|------|-------------|
| `bucket_id` | ID of the S3 bucket |
| `bucket_arn` | ARN of the S3 bucket |
| `bucket_name` | Name of the S3 bucket |
| `bucket_domain_name` | Domain name of the bucket |
| `bucket_regional_domain_name` | Regional domain name of the bucket |
| `website_endpoint` | Website endpoint (if website hosting is enabled) |
