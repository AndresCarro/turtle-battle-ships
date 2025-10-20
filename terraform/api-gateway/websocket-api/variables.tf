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

# Application Load Balancer Configuration
variable "alb_name" {
  description = "Name of the Application Load Balancer"
  type        = string
}

variable "alb_internal" {
  description = "Whether the ALB is internal"
  type        = bool
  default     = true
}

variable "alb_subnet_ids" {
  description = "Subnet IDs for the Application Load Balancer"
  type        = list(string)
}

variable "alb_security_group_ids" {
  description = "Security group IDs for the Application Load Balancer"
  type        = list(string)
}

variable "alb_deletion_protection" {
  description = "Enable deletion protection for the ALB"
  type        = bool
  default     = false
}

# Target Group Configuration
variable "target_group_name" {
  description = "Name of the target group"
  type        = string
}

variable "fargate_port" {
  description = "Port on which Fargate containers are listening"
  type        = number
  default     = 3000
}

variable "vpc_id" {
  description = "VPC ID where the target group will be created"
  type        = string
}

variable "health_check_healthy_threshold" {
  description = "Number of consecutive health checks successes required"
  type        = number
  default     = 3
}

variable "health_check_unhealthy_threshold" {
  description = "Number of consecutive health check failures required"
  type        = number
  default     = 3
}

variable "health_check_interval" {
  description = "Interval between health checks in seconds"
  type        = number
  default     = 30
}

variable "health_check_timeout" {
  description = "Timeout for health checks in seconds"
  type        = number
  default     = 5
}

variable "health_check_path" {
  description = "Path for HTTP health checks"
  type        = string
  default     = "/health"
}

variable "health_check_matcher" {
  description = "HTTP status codes to consider healthy"
  type        = string
  default     = "200,301,302"
}

variable "deregistration_delay" {
  description = "Time to wait before deregistering a target"
  type        = number
  default     = 30
}

# # Sticky Sessions
# variable "enable_sticky_sessions" {
#   description = "Enable sticky sessions for Socket.io compatibility"
#   type        = bool
#   default     = true
# }
# 
# variable "sticky_session_duration" {
#   description = "Duration of sticky session in seconds"
#   type        = number
#   default     = 86400  # 24 hours
# }

# SSL/TLS Configuration
variable "ssl_certificate_arn" {
  description = "ARN of SSL certificate for HTTPS listener (optional)"
  type        = string
  default     = null
}

variable "ssl_policy" {
  description = "SSL policy for HTTPS listener"
  type        = string
  default     = "ELBSecurityPolicy-TLS13-1-2-2021-06"
}

# VPC Link Configuration
variable "vpc_link_name" {
  description = "Name of the VPC Link"
  type        = string
}

variable "vpc_link_subnet_ids" {
  description = "Subnet IDs for the VPC Link"
  type        = list(string)
}

variable "vpc_link_security_group_ids" {
  description = "Security group IDs for the VPC Link"
  type        = list(string)
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
