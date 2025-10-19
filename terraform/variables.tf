
variable "region" {
  type    = string
  default = "us-east-1"
}

variable "common_tags" {
  type = map(string)
  default = {
    Environment = "dev"
    Project     = "turtle-battle-ships"
  }
}

variable "vpc_config" {
  type = object({
    name   = string
    cidr   = string
    region = string
  })
}

variable "subnets_config" {
  type = list(object({
    name = string
    cidr = string
    az   = string
    type = string
  }))
}

variable "route_tables_config" {
  type = map(list(string))
}

variable "vpc_endpoints_config" {
  type = list(object({
    service     = string
    type        = string
    subnets     = optional(list(string))
    private_dns = optional(bool, true)
  }))
}


variable "s3_buckets" {
  description = "Lista de buckets S3 a crear con configuración avanzada"
  type = list(object({
    name       = string
    acl        = optional(string)
    versioning = optional(object({ enabled = bool }))
    public_access_block = optional(object({
      block_public_acls       = bool
      block_public_policy     = bool
      ignore_public_acls      = bool
      restrict_public_buckets = bool
    }))
    encryption = optional(object({
      enabled           = bool
      sse_algorithm     = string
      kms_master_key_id = optional(string)
    }))
    website = optional(object({
      enabled        = bool
      index_document = string
      error_document = string
    }))
    cors_rules = optional(list(object({
      allowed_methods = list(string)
      allowed_origins = list(string)
      allowed_headers = optional(list(string))
      expose_headers  = optional(list(string))
      max_age_seconds = optional(number)
    })))
    policy = optional(string)
    upload = optional(object({
      enabled    = bool
      source_dir = string
    }))
  }))
}
