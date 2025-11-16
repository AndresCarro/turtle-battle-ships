
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
variable "text_replays_bucket" {
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

# RDS Database Configuration
variable "rds_config" {
  description = "Configuration for the RDS database"
  type = object({
    database_name           = string
    master_username         = string
    engine                  = string
    engine_version          = string
    instance_class          = string
    port                    = number
    allocated_storage       = number
    subnet_names            = list(string)
    multi_az                = bool
    create_read_replica     = bool
    create_rds_proxy        = bool
    proxy_engine_family     = string
    backup_retention_period = number
    skip_final_snapshot     = bool
    deletion_protection     = bool
    storage_encrypted       = bool
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
    alb_subnet_names      = optional(list(string), [])  # ALB subnets (public for internet-facing ALB)
    security_group_ids    = list(string)
    enable_autoscaling    = bool
    autoscaling_min       = number
    autoscaling_max       = number
    autoscaling_cpu       = number
  })
}

# DynamoDB Configuration
variable "dynamodb_shots_table" {
  description = "Configuration for the DynamoDB shots table"
  type = object({
    name          = string
    billing_mode  = string
    partition_key = string
    sort_key      = string
    attributes = list(object({
      name = string
      type = string
    }))
    global_secondary_indexes = list(object({
      name            = string
      partition_key   = string
      sort_key        = string
      projection_type = string
      read_capacity   = number
      write_capacity  = number
    }))
    encryption_enabled     = bool
    point_in_time_recovery = bool
    ttl_enabled            = bool
    ttl_attribute_name     = string
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

# New variables added for SQS, video replays bucket and renderer lambda
variable "events_queue_name" {
  description = "Name for the SQS queue used for events/notifications"
  type        = string
}

variable "video_renderer_lambda" {
  description = "Configuration map for the video renderer lambda"
  type        = object({
    function_name         = string
    dockerfile_path       = string
    memory_size           = number
    timeout               = number
    environment_variables = map(string)
  })
}

variable "video_replays_bucket" {
  description = "S3 bucket configuration for video replays"
  type = object({
    name               = string
    versioning_enabled = bool
    encryption_enabled = bool
    sse_algorithm      = string
  })
}

# Cognito Configuration
variable "cognito_config" {
  description = "Configuration for AWS Cognito"
  type = object({
    enabled       = bool
    callback_url  = string
  })
  default = {
    enabled       = false
    callback_url  = ""
  }
}
