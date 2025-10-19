variable "buckets" {
  description = "Lista de buckets a crear con configuraciones avanzadas y uploads opcionales"
  type = list(object({
    name = string

    acl = optional(string)

    versioning = optional(object({
      enabled = bool
    }), { enabled = false })

    public_access_block = optional(object({
      block_public_acls       = bool
      block_public_policy     = bool
      ignore_public_acls      = bool
      restrict_public_buckets = bool
    }), {
      block_public_acls       = true
      block_public_policy     = true
      ignore_public_acls      = true
      restrict_public_buckets = true
    })

    encryption = optional(object({
      enabled           = bool
      sse_algorithm     = string
      kms_master_key_id = optional(string)
    }), {
      enabled = false
      sse_algorithm = "AES256"
    })

    website = optional(object({
      enabled         = bool
      index_document  = string
      error_document  = string
    }), {
      enabled        = false
      index_document = ""
      error_document = ""
    })

    cors_rules = optional(list(object({
      allowed_methods = list(string)
      allowed_origins = list(string)
      allowed_headers = optional(list(string))
      expose_headers  = optional(list(string))
      max_age_seconds = optional(number)
    })), [])

    policy = optional(string)

    upload = optional(object({
      enabled    = bool
      source_dir = string
    }), {
      enabled    = false
      source_dir = ""
    })
  }))
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
