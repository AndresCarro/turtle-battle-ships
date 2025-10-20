variable "bucket_name" {
  description = "Name of the S3 bucket"
  type        = string
}

variable "acl" {
  description = "ACL for the bucket"
  type        = string
  default     = "private"
}

variable "versioning_enabled" {
  description = "Enable versioning for the bucket"
  type        = bool
  default     = false
}

variable "public_access_block" {
  description = "Public access block configuration"
  type = object({
    block_public_acls       = bool
    block_public_policy     = bool
    ignore_public_acls      = bool
    restrict_public_buckets = bool
  })
  default = {
    block_public_acls       = true
    block_public_policy     = true
    ignore_public_acls      = true
    restrict_public_buckets = true
  }
}

variable "encryption_enabled" {
  description = "Enable server-side encryption for the bucket"
  type        = bool
  default     = false
}

variable "sse_algorithm" {
  description = "Server-side encryption algorithm (AES256 or aws:kms)"
  type        = string
  default     = "AES256"
}

variable "kms_master_key_id" {
  description = "KMS master key ID for encryption (required if sse_algorithm is aws:kms)"
  type        = string
  default     = null
}

variable "website_enabled" {
  description = "Enable static website hosting"
  type        = bool
  default     = false
}

variable "index_document" {
  description = "Index document for website"
  type        = string
  default     = "index.html"
}

variable "error_document" {
  description = "Error document for website"
  type        = string
  default     = "error.html"
}

variable "cors_rules" {
  description = "List of CORS rules for the bucket"
  type = list(object({
    allowed_methods = list(string)
    allowed_origins = list(string)
    allowed_headers = optional(list(string))
    expose_headers  = optional(list(string))
    max_age_seconds = optional(number)
  }))
  default = []
}

variable "bucket_policy" {
  description = "JSON policy document for the bucket"
  type        = string
  default     = null
}

variable "upload_enabled" {
  description = "Enable uploading files from a local directory"
  type        = bool
  default     = false
}

variable "upload_source_dir" {
  description = "Source directory for files to upload"
  type        = string
  default     = ""
}

variable "tags" {
  description = "Tags comunes para aplicar a todos los buckets"
  type        = map(string)
  default     = {}
}

variable "mime_types" {
  description = "Mapeo de extensiones → content-type para uploads"
  type        = map(string)
  default = {
    html = "text/html"
    js   = "application/javascript"
    css  = "text/css"
    json = "application/json"
    png  = "image/png"
    jpg  = "image/jpeg"
    svg  = "image/svg+xml"
    ico  = "image/x-icon"
    txt  = "text/plain"
  }
}
