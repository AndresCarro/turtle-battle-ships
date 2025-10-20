terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
  }
  required_version = ">= 1.5.0"
}

provider "aws" {
  region                   = var.region
  shared_credentials_files = ["${path.module}/aws-credentials"]
  profile                  = "default"
}

# Docker provider configuration
data "aws_caller_identity" "current" {}
data "aws_ecr_authorization_token" "token" {}

provider "docker" {
  registry_auth {
    address  = "${data.aws_caller_identity.current.account_id}.dkr.ecr.${var.region}.amazonaws.com"
    username = data.aws_ecr_authorization_token.token.user_name
    password = data.aws_ecr_authorization_token.token.password
  }
}

# Data Sources
data "aws_iam_role" "lab_role" {
  name = "LabRole"
}

data "aws_availability_zones" "available" {
  state = "available"
}

# Locals for dynamic resource creation
locals {
  # Merge project tags with common tags
  tags = merge(
    var.common_tags,
    {
      Project     = var.project_name
      Environment = var.environment
    }
  )

  # Select the requested number of AZs
  azs = slice(data.aws_availability_zones.available.names, 0, var.availability_zones_count)

  # Generate subnet configurations using provided names
  private_subnets = flatten([
    for az_index, az in local.azs : [
      for subnet_index in range(length(var.subnet_names[tostring(az_index)].private)) : {
        name = var.subnet_names[tostring(az_index)].private[subnet_index]
        cidr = cidrsubnet(var.vpc_cidr, 8, 101 + (az_index * var.private_subnets_per_az) + subnet_index)
        az   = az
        type = "private"
      }
    ]
  ])

  public_subnets = flatten([
    for az_index, az in local.azs : [
      for subnet_index in range(length(var.subnet_names[tostring(az_index)].public)) : {
        name = var.subnet_names[tostring(az_index)].public[subnet_index]
        cidr = cidrsubnet(var.vpc_cidr, 8, 1 + (az_index * var.public_subnets_per_az) + subnet_index)
        az   = az
        type = "public"
      }
    ]
  ])

  all_subnets = concat(local.private_subnets, local.public_subnets)

  # Generate route table associations
  route_tables = {
    for az_index, az in local.azs :
    "rt-${az_index}" => [
      for subnet in local.all_subnets :
      subnet.name if subnet.az == az
    ]
  }
}

# VPC Module
module "vpc" {
  source = "./vpc"

  vpc_config = {
    name   = "${var.project_name}-vpc"
    cidr   = var.vpc_cidr
    region = var.region
  }

  subnets_config       = local.all_subnets
  route_tables_config  = local.route_tables
  vpc_endpoints_config = var.vpc_endpoints_config
  tags                 = local.tags
}

# TODO: GENERATE RDS AND RDS PROXY
# TODO: GENERATE DYNAMODB

# Lambda Functions
module "lambda_functions" {
  source   = "./lambda-with-ecr"
  for_each = { for lambda in var.lambda_functions : lambda.function_name => lambda }

  function_name   = each.value.function_name
  dockerfile_path = "${path.module}/${each.value.dockerfile_path}"
  region          = var.region
  role_arn        = data.aws_iam_role.lab_role.arn

  memory_size = each.value.memory_size
  timeout     = each.value.timeout

  environment_variables = merge(
    each.value.environment_variables,
    {
      REGION = var.region
    }
  )

  # VPC configuration (optional)
  vpc_config = each.value.vpc_enabled ? {
    subnet_ids = [
      for subnet_name in each.value.subnet_names :
      module.vpc.subnets[subnet_name]
    ]
    security_group_ids = each.value.security_group_ids
  } : null

  tags = merge(
    local.tags,
    {
      Function = each.value.function_name
    }
  )
}

# Backend ECS Service
module "backend" {
  count  = var.backend_config.enabled ? 1 : 0
  source = "./ecs-fargate"

  service_name    = var.backend_config.service_name
  dockerfile_path = "${path.module}/${var.backend_config.dockerfile_path}"
  region          = var.region
  role_arn        = data.aws_iam_role.lab_role.arn

  # Container configuration
  container_port = var.backend_config.container_port
  cpu            = var.backend_config.cpu
  memory         = var.backend_config.memory
  desired_count  = var.backend_config.desired_count

  # Network configuration - use configured subnet names
  vpc_id = module.vpc.vpc_id
  subnet_ids = [
    for subnet_name in var.backend_config.subnet_names :
    module.vpc.subnets[subnet_name]
  ]

  # Use private subnets with VPC endpoints (no public IP needed)
  assign_public_ip = false

  # Additional security groups
  security_group_ids = var.backend_config.security_group_ids

  # Health check configuration
  health_check_path                = var.backend_config.health_check_path
  health_check_interval            = 30
  health_check_timeout             = 5
  health_check_healthy_threshold   = 2
  health_check_unhealthy_threshold = 3

  # Environment variables
  environment_variables = merge(
    var.backend_config.environment_variables,
    {
      REGION = var.region
    }
  )

  # Auto-scaling configuration
  enable_autoscaling       = var.backend_config.enable_autoscaling
  autoscaling_min_capacity = var.backend_config.autoscaling_min
  autoscaling_max_capacity = var.backend_config.autoscaling_max
  autoscaling_target_cpu   = var.backend_config.autoscaling_cpu

  tags = merge(
    local.tags,
    {
      Service = "backend"
    }
  )
}

# TODO: GENERATE API GATEWAYS FOR LAMBDAS AND BACKEND

# S3 Bucket for Game Replays
module "replays_bucket" {
  source = "./s3"

  bucket_name        = var.replays_bucket.name
  versioning_enabled = var.replays_bucket.versioning_enabled
  encryption_enabled = var.replays_bucket.encryption_enabled
  sse_algorithm      = var.replays_bucket.sse_algorithm

  public_access_block = {
    block_public_acls       = true
    block_public_policy     = true
    ignore_public_acls      = true
    restrict_public_buckets = true
  }

  tags = local.tags
}

# TODO: GENERATE DIST TO BE UPLOADED TO FRONTEND BUCKET

# S3 Bucket for Frontend (SPA)
module "frontend_bucket" {
  source = "./s3"

  bucket_name     = var.frontend_bucket.name
  acl             = "public-read"
  website_enabled = var.frontend_bucket.website_enabled
  index_document  = var.frontend_bucket.index_document
  error_document  = var.frontend_bucket.error_document

  cors_rules = [
    {
      allowed_methods = ["GET", "HEAD"]
      allowed_origins = ["*"]
    }
  ]

  public_access_block = {
    block_public_acls       = false
    block_public_policy     = false
    ignore_public_acls      = false
    restrict_public_buckets = false
  }

  bucket_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Sid       = "PublicReadGetObject",
        Effect    = "Allow",
        Principal = "*",
        Action    = ["s3:GetObject"],
        Resource  = "arn:aws:s3:::${var.frontend_bucket.name}/*"
      }
    ]
  })

  upload_enabled    = var.frontend_bucket.upload_enabled
  upload_source_dir = var.frontend_bucket.upload_dir

  tags = local.tags
}
