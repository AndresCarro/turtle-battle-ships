variable "api_name" {
  description = "Name of the API Gateway"
  type        = string
}

variable "api_description" {
  description = "Description of the API Gateway"
  type        = string
  default     = ""
}

variable "stage_name" {
  description = "Name of the API Gateway stage"
  type        = string
  default     = "prod"
}

variable "endpoint_type" {
  description = "Endpoint type for the API Gateway (REGIONAL, EDGE, or PRIVATE)"
  type        = string
  default     = "REGIONAL"
}

variable "lambda_integrations" {
  description = "List of Lambda function integrations"
  type = list(object({
    path_part          = string
    http_methods       = list(string)
    lambda_arn         = string
    lambda_name        = string
    enable_cors        = optional(bool, true)
    authorization      = optional(string, "NONE")
    authorizer_id      = optional(string, null)
    request_parameters = optional(map(bool), {})
  }))
  default = []
}

variable "xray_tracing_enabled" {
  description = "Enable X-Ray tracing for the API Gateway stage"
  type        = bool
  default     = false
}

variable "log_retention_days" {
  description = "CloudWatch log retention in days"
  type        = number
  default     = 14
}

variable "metrics_enabled" {
  description = "Enable CloudWatch metrics for the API Gateway"
  type        = bool
  default     = true
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
