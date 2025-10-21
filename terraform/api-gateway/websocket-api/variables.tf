variable "api_name" {
  description = "Name of the WebSocket API Gateway"
  type        = string
}

variable "api_description" {
  description = "Description of the WebSocket API Gateway"
  type        = string
  default     = ""
}

variable "route_selection_expression" {
  description = "Route selection expression for the WebSocket API"
  type        = string
  default     = "$request.body.action"
}

variable "stage_name" {
  description = "Name of the API Gateway stage"
  type        = string
  default     = "prod"
}

variable "auto_deploy" {
  description = "Whether to automatically deploy the API on changes"
  type        = bool
  default     = true
}

# Existing ALB Integration
variable "alb_dns_name" {
  description = "DNS name of the existing Application Load Balancer to integrate with"
  type        = string
}

# Integration Configuration
variable "integration_request_parameters" {
  description = "Request parameters for the integration"
  type        = map(string)
  default     = {}
}

# Custom Routes
variable "custom_routes" {
  description = "Custom WebSocket routes beyond $connect, $disconnect, and $default"
  type = map(object({
    route_response_selection_expression = optional(string)
  }))
  default = {}
}

# Logging and Monitoring
variable "log_retention_days" {
  description = "CloudWatch log retention in days"
  type        = number
  default     = 14
}

variable "logging_level" {
  description = "Logging level for the API Gateway (OFF, ERROR, INFO)"
  type        = string
  default     = "INFO"
}

variable "data_trace_enabled" {
  description = "Enable data trace logging for the API Gateway"
  type        = bool
  default     = false
}

variable "throttling_burst_limit" {
  description = "Throttling burst limit for the API Gateway"
  type        = number
  default     = 5000
}

variable "throttling_rate_limit" {
  description = "Throttling rate limit for the API Gateway (requests per second)"
  type        = number
  default     = 10000
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}
