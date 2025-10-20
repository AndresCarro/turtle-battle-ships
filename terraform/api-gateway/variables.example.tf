# Add these to your main terraform/variables.tf if needed

# API Gateway REST API Variables (optional overrides)
variable "rest_api_name" {
  description = "Name for the REST API Gateway"
  type        = string
  default     = "turtle-battleships-api"
}

variable "rest_api_stage" {
  description = "Stage name for REST API"
  type        = string
  default     = "prod"
}

# WebSocket API Variables (optional overrides)
variable "websocket_api_name" {
  description = "Name for the WebSocket API Gateway"
  type        = string
  default     = "turtle-battleships-websocket"
}

variable "websocket_api_stage" {
  description = "Stage name for WebSocket API"
  type        = string
  default     = "prod"
}

# Fargate Configuration
variable "fargate_backend_port" {
  description = "Port that the backend Fargate service runs on"
  type        = number
  default     = 3000
}

variable "fargate_task_count" {
  description = "Number of Fargate tasks to run"
  type        = number
  default     = 2
}

variable "fargate_cpu" {
  description = "CPU units for Fargate task"
  type        = string
  default     = "512"
}

variable "fargate_memory" {
  description = "Memory for Fargate task in MB"
  type        = string
  default     = "1024"
}

# API Gateway Throttling
variable "api_throttling_burst_limit" {
  description = "API Gateway throttling burst limit"
  type        = number
  default     = 1000
}

variable "api_throttling_rate_limit" {
  description = "API Gateway throttling rate limit (requests per second)"
  type        = number
  default     = 500
}
