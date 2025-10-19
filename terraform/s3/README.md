# 🪣 Módulo S3 — Kairos

Este módulo permite crear múltiples buckets S3 con configuraciones avanzadas, incluyendo soporte para hosting de SPA y upload de archivos estáticos.

## ✨ Features

- ✅ Versioning opcional  
- 🔐 Public Access Block configurable  
- 🧾 Bucket Policy  
- 🪩 Website hosting (SPA)  
- 🌍 **CORS configurable (con bloques dinámicos)**  
- 🔒 Server-side encryption  
- 🪙 ACL opcional  
- 📤 Upload automático de archivos SPA (index, manifest, assets)

---

## 🧾 Ejemplo de uso

```hcl
module "s3" {
  source = "./s3"

  buckets = [
    # 🪣 Bucket de replays (cerrado)
    {
      name = "kairos-replays"
      versioning = { enabled = true }
      encryption = {
        enabled       = true
        sse_algorithm = "AES256"
      }
      public_access_block = {
        block_public_acls       = true
        block_public_policy     = true
        ignore_public_acls      = true
        restrict_public_buckets = true
      }
    },

    # 🪩 Bucket de frontend (SPA)
    {
      name = "kairos-frontend"
      acl  = "public-read"
      website = {
        enabled         = true
        index_document  = "index.html"
        error_document  = "index.html"
      }
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
      policy = jsonencode({
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
      upload = {
        enabled    = true
        source_dir = "../frontend/dist"
      }
    }
  ]

  tags = {
    Environment = "dev"
    Project     = "Kairos"
  }
}
