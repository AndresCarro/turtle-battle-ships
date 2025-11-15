variable "project_name" {
  description = "Project name used for resource naming"
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
  description = "Common tags to apply to all resources"
  type        = map(string)
  default     = {}
}