
variable "region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
}

variable "common_tags" {
  description = "Common tags to apply to all resources"
  type        = map(string)
  default     = {}
}

# VPC Configuration
variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones_count" {
  description = "Number of availability zones to use"
  type        = number
  default     = 2
  validation {
    condition     = var.availability_zones_count >= 1 && var.availability_zones_count <= 4
    error_message = "Must be between 1 and 4 availability zones."
  }
}

variable "private_subnets_per_az" {
  description = "Number of private subnets per availability zone"
  type        = number
}

variable "public_subnets_per_az" {
  description = "Number of public subnets per availability zone"
  type        = number
}

variable "subnet_names" {
  description = "Map of AZ index to list of subnet names. Each AZ can have multiple private and public subnets."
  type = map(object({
    private = list(string)
    public  = list(string)
  }))
}

variable "vpc_endpoints_config" {
  description = "List of VPC endpoints to create"
  type = list(object({
    service     = string
    type        = string
    subnets     = optional(list(string))
    private_dns = optional(bool, true)
  }))
  validation {
    condition = alltrue([
      for ep in var.vpc_endpoints_config : (
        lower(ep.type) != "interface" || length(coalesce(ep.subnets, [])) > 0
      )
    ])
    error_message = "Must define subnets for all interface VPC endpoints."
  }
}

# S3 Buckets Configuration
variable "replays_bucket" {
  description = "Configuration for the game replays bucket"
  type = object({
    name               = string
    versioning_enabled = bool
    encryption_enabled = bool
    sse_algorithm      = string
  })
}

variable "frontend_bucket" {
  description = "Configuration for the frontend SPA bucket"
  type = object({
    name            = string
    website_enabled = bool
    index_document  = string
    error_document  = string
    upload_enabled  = bool
    upload_dir      = string
  })
}

# Backend ECS Configuration
variable "backend_config" {
  description = "Configuration for the backend ECS service"
  type = object({
    enabled               = bool
    service_name          = string
    dockerfile_path       = string
    container_port        = number
    cpu                   = number
    memory                = number
    desired_count         = number
    health_check_path     = string
    environment_variables = map(string)
    subnet_names          = list(string)
    security_group_ids    = list(string)
    enable_autoscaling    = bool
    autoscaling_min       = number
    autoscaling_max       = number
    autoscaling_cpu       = number
  })
}

# Lambda Functions Configuration
variable "lambda_functions" {
  description = "List of Lambda functions to create"
  type = list(object({
    function_name         = string
    dockerfile_path       = string
    memory_size           = number
    timeout               = number
    environment_variables = map(string)
    vpc_enabled           = bool
    subnet_names          = list(string)
    security_group_ids    = list(string)
  }))
}
