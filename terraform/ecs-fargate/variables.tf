variable "service_name" {
  description = "Name of the ECS service and task"
  type        = string
}

variable "dockerfile_path" {
  description = "Path to the directory containing the Dockerfile"
  type        = string
}

variable "ecr_repository_name" {
  description = "Name of the ECR repository (defaults to service_name if not provided)"
  type        = string
  default     = ""
}

variable "image_tag" {
  description = "Tag for the Docker image"
  type        = string
  default     = "latest"
}

variable "container_port" {
  description = "Port the container listens on"
  type        = number
  default     = 3000
}

variable "cpu" {
  description = "CPU units for the task (256, 512, 1024, 2048, 4096)"
  type        = number
  default     = 256
}

variable "memory" {
  description = "Memory for the task in MB (512, 1024, 2048, etc.)"
  type        = number
  default     = 512
}

variable "desired_count" {
  description = "Desired number of tasks to run"
  type        = number
  default     = 1
}

variable "environment_variables" {
  description = "Environment variables for the container"
  type        = map(string)
  default     = {}
}

variable "vpc_id" {
  description = "VPC ID where the service will run"
  type        = string
}

variable "subnet_ids" {
  description = "List of subnet IDs for the ECS tasks (typically private subnets)"
  type        = list(string)
}

variable "alb_subnet_ids" {
  description = "List of subnet IDs for the ALB (use public subnets for internet-facing ALB, defaults to subnet_ids if not provided)"
  type        = list(string)
  default     = []
}

variable "security_group_ids" {
  description = "Additional security group IDs to attach (module creates a default one)"
  type        = list(string)
  default     = []
}

variable "role_arn" {
  description = "ARN of an existing IAM role to use for the Lambda function. For AWS Academy, use LabRole ARN."
  type        = string
}

variable "assign_public_ip" {
  description = "Assign public IP to tasks (needed if using public subnets without NAT)"
  type        = bool
  default     = false
}

variable "health_check_path" {
  description = "Path for health check endpoint"
  type        = string
  default     = "/health"
}

variable "health_check_interval" {
  description = "Health check interval in seconds"
  type        = number
  default     = 30
}

variable "health_check_timeout" {
  description = "Health check timeout in seconds"
  type        = number
  default     = 5
}

variable "health_check_healthy_threshold" {
  description = "Number of consecutive health checks successes required"
  type        = number
  default     = 2
}

variable "health_check_unhealthy_threshold" {
  description = "Number of consecutive health check failures required"
  type        = number
  default     = 3
}

variable "enable_load_balancer" {
  description = "Whether to create an Application Load Balancer"
  type        = bool
  default     = true
}

variable "enable_autoscaling" {
  description = "Whether to enable auto scaling"
  type        = bool
  default     = false
}

variable "autoscaling_min_capacity" {
  description = "Minimum number of tasks"
  type        = number
  default     = 1
}

variable "autoscaling_max_capacity" {
  description = "Maximum number of tasks"
  type        = number
  default     = 4
}

variable "autoscaling_target_cpu" {
  description = "Target CPU utilization percentage for auto scaling"
  type        = number
  default     = 70
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
  description = "Instruction set architecture for the container"
  type        = list(string)
  default     = ["X86_64"]
}

variable "enable_execute_command" {
  description = "Enable ECS Exec for debugging"
  type        = bool
  default     = false
}

variable "log_retention_days" {
  description = "CloudWatch log retention in days"
  type        = number
  default     = 14
}

variable "deregistration_delay" {
  description = "Time to wait before deregistering a target in seconds"
  type        = number
  default     = 30
}
