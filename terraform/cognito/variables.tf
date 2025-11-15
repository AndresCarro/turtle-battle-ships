variable "project_name" {
  description = "Name of the project (used for resource naming)"
  type        = string
}

variable "callback_urls" {
  description = "List of allowed callback URLs for Cognito"
  type        = list(string)
  default     = []
}

variable "logout_urls" {
  description = "List of allowed logout URLs for Cognito"
  type        = list(string)
  default     = []
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default     = {}
}

variable "enable_identity_pool" {
  description = "Whether to create Cognito Identity Pool (requires IAM permissions not available in AWS Labs)"
  type        = bool
  default     = false
}

variable "user_pool_password_policy" {
  description = "Password policy configuration for the user pool"
  type = object({
    minimum_length                   = number
    require_lowercase                = bool
    require_numbers                  = bool
    require_symbols                  = bool
    require_uppercase                = bool
    temporary_password_validity_days = number
  })
  default = {
    minimum_length                   = 8
    require_lowercase                = true
    require_numbers                  = true
    require_symbols                  = false
    require_uppercase                = true
    temporary_password_validity_days = 7
  }
}