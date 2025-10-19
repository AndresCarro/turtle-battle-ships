variable "function_name" {
  description = "Name of the Lambda function"
  type        = string
}

variable "dockerfile_path" {
  description = "Path to the directory containing the Dockerfile"
  type        = string
}

variable "ecr_repository_name" {
  description = "Name of the ECR repository (defaults to function_name if not provided)"
  type        = string
  default     = ""
}

variable "image_tag" {
  description = "Tag for the Docker image"
  type        = string
  default     = "latest"
}

variable "memory_size" {
  description = "Amount of memory in MB for the Lambda function"
  type        = number
  default     = 512
}

variable "timeout" {
  description = "Timeout in seconds for the Lambda function"
  type        = number
  default     = 30
}

variable "environment_variables" {
  description = "Environment variables for the Lambda function"
  type        = map(string)
  default     = {}
}

variable "vpc_config" {
  description = "VPC configuration for the Lambda function"
  type = object({
    subnet_ids         = list(string)
    security_group_ids = list(string)
  })
  default = null
}

variable "role_arn" {
  description = "ARN of an existing IAM role to use for the Lambda function. For AWS Academy, use LabRole ARN."
  type        = string
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default     = {}
}

variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "architectures" {
  description = "Instruction set architecture for the Lambda function"
  type        = list(string)
  default     = ["x86_64"]
}

variable "reserved_concurrent_executions" {
  description = "Amount of reserved concurrent executions for this Lambda function"
  type        = number
  default     = -1
}

variable "publish" {
  description = "Whether to publish creation/change as new Lambda Function Version"
  type        = bool
  default     = false
}
