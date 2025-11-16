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

# Shared data sources and provider for building and pushing Docker images to ECR.
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

# API Gateway CloudWatch Logs Role (Account-level setting)
# This is required for API Gateway to write logs to CloudWatch
resource "aws_api_gateway_account" "main" {
  cloudwatch_role_arn = data.aws_iam_role.lab_role.arn
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

# Security Group for Lambda Functions
# Created before RDS so it can be referenced in RDS allowed_security_groups
resource "aws_security_group" "lambda_sg" {
  name        = "${var.project_name}-lambda-sg"
  description = "Security group for Lambda functions"
  vpc_id      = module.vpc.vpc_id

  # Allow all outbound traffic (Lambda needs to reach RDS, APIs, etc.)
  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(
    local.tags,
    {
      Name = "${var.project_name}-lambda-sg"
    }
  )

  depends_on = [module.vpc]
}

# RDS Database Module
module "rds" {
  source = "./rds"

  name            = "${var.project_name}-database"
  region          = var.region
  role_arn        = data.aws_iam_role.lab_role.arn
  database_name   = var.rds_config.database_name
  master_username = var.rds_config.master_username

  # Network configuration
  vpc_id = module.vpc.vpc_id
  subnet_ids = [
    module.vpc.subnets[var.rds_config.subnet_names[0]],
    module.vpc.subnets[var.rds_config.subnet_names[1]]
  ]

  # Allow access from backend and Lambda functions
  allowed_security_groups = concat(
    var.backend_config.enabled ? [module.backend[0].security_group_id] : [],
    [aws_security_group.lambda_sg.id]
  )

  # Database engine configuration
  engine            = var.rds_config.engine
  engine_version    = var.rds_config.engine_version
  instance_class    = var.rds_config.instance_class
  port              = var.rds_config.port
  allocated_storage = var.rds_config.allocated_storage

  # High availability configuration
  multi_az            = var.rds_config.multi_az
  create_read_replica = var.rds_config.create_read_replica

  # RDS Proxy configuration
  create_rds_proxy    = var.rds_config.create_rds_proxy
  proxy_engine_family = var.rds_config.proxy_engine_family

  # Backup configuration
  backup_retention_period = var.rds_config.backup_retention_period
  skip_final_snapshot     = var.rds_config.skip_final_snapshot

  # Security
  deletion_protection = var.rds_config.deletion_protection
  storage_encrypted   = var.rds_config.storage_encrypted

  tags = local.tags

  depends_on = [module.vpc]
}

# DynamoDB Module
module "dynamodb_shots" {
  source = "./dynamodb"

  name          = var.dynamodb_shots_table.name
  billing_mode  = var.dynamodb_shots_table.billing_mode
  partition_key = var.dynamodb_shots_table.partition_key
  sort_key      = var.dynamodb_shots_table.sort_key

  attributes = var.dynamodb_shots_table.attributes

  global_secondary_indexes = var.dynamodb_shots_table.global_secondary_indexes

  encryption = {
    enabled = var.dynamodb_shots_table.encryption_enabled
  }

  point_in_time_recovery = var.dynamodb_shots_table.point_in_time_recovery

  ttl = {
    enabled        = var.dynamodb_shots_table.ttl_enabled
    attribute_name = var.dynamodb_shots_table.ttl_attribute_name
  }

  tags = local.tags
}

# SQS queue for events (e.g. S3 notifications -> queue -> lambda)
resource "aws_sqs_queue" "events" {
  name                       = var.events_queue_name
  visibility_timeout_seconds = 900
}

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

  # Environment variables including RDS connection info
  environment_variables = merge(
    each.value.environment_variables,
    {
      REGION                    = var.region
      DB_HOST                   = module.rds.proxy_endpoint
      DB_PORT                   = tostring(module.rds.primary_instance_port)
      DB_NAME                   = module.rds.database_name
      DB_USER                   = module.rds.master_username
      DB_PASSWORD               = module.rds.db_password
      DB_SSL                    = "true", # Enable SSL/TLS for RDS connections
      VIDEO_REPLAYS_BUCKET_NAME = var.video_replays_bucket.name
    }
  )

  # VPC configuration (optional)
  vpc_config = each.value.vpc_enabled ? {
    subnet_ids = [
      for subnet_name in each.value.subnet_names :
      module.vpc.subnets[subnet_name]
    ]
    # Lambda functions use dedicated Lambda security group
    # This security group is allowed by RDS Proxy security group
    security_group_ids = concat(
      each.value.security_group_ids,
      [aws_security_group.lambda_sg.id]
    )
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
  # ECS tasks in private subnets
  subnet_ids = [
    for subnet_name in var.backend_config.subnet_names :
    module.vpc.subnets[subnet_name]
  ]
  # ALB in public subnets
  alb_subnet_ids = length(var.backend_config.alb_subnet_names) > 0 ? [
    for subnet_name in var.backend_config.alb_subnet_names :
    module.vpc.subnets[subnet_name]
  ] : []

  # Use private subnets with VPC endpoints (no public IP needed)
  assign_public_ip = false

  # Additional security groups (include RDS Proxy for DB access)
  # Backend connects to proxy, not directly to RDS
  security_group_ids = concat(
    var.backend_config.security_group_ids,
    var.rds_config.create_rds_proxy ? [module.rds.proxy_security_group_id] : [module.rds.rds_security_group_id]
  )

  # Health check configuration
  health_check_path                = var.backend_config.health_check_path
  health_check_interval            = 30
  health_check_timeout             = 5
  health_check_healthy_threshold   = 2
  health_check_unhealthy_threshold = 3

  # Environment variables including RDS connection info
  # Use proxy endpoint if available for connection pooling and better performance
  environment_variables = merge(
    var.backend_config.environment_variables,
    {
      REGION      = var.region
      DB_HOST     = var.rds_config.create_rds_proxy ? module.rds.proxy_endpoint : module.rds.primary_instance_address
      DB_PORT     = tostring(module.rds.primary_instance_port)
      DB_NAME     = module.rds.database_name
      DB_USER     = module.rds.master_username
      DB_PASSWORD = module.rds.db_password
      DB_SSL      = "true" # Enable SSL/TLS for RDS connections
      # S3 Configuration
      BUCKET_NAME = var.text_replays_bucket.name
      # DynamoDB Configuration
      DYNAMO_TABLE_NAME = module.dynamodb_shots.table_name
      DYNAMO_REGION     = var.region
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

# REST API Gateway for Lambda Functions
module "rest_api" {
  source = "./api-gateway/rest-api"

  api_name        = "${var.project_name}-rest-api"
  api_description = "REST API Gateway for Turtle Battleships Lambda functions"
  stage_name      = var.environment

  # Lambda integrations - create endpoints for each Lambda function
  lambda_integrations = [
    {
      path_part    = "users"
      http_methods = ["POST"]
      lambda_arn   = module.lambda_functions["turtle-battleships-create-user"].function_invoke_arn
      lambda_name  = module.lambda_functions["turtle-battleships-create-user"].function_name
      enable_cors  = true
    },
    {
      path_part    = "games"
      http_methods = ["POST"]
      lambda_arn   = module.lambda_functions["turtle-battleships-create-game-room"].function_invoke_arn
      lambda_name  = module.lambda_functions["turtle-battleships-create-game-room"].function_name
      enable_cors  = true
    },
    {
      path_part    = "games"
      http_methods = ["GET"]
      lambda_arn   = module.lambda_functions["turtle-battleships-list-game-rooms"].function_invoke_arn
      lambda_name  = module.lambda_functions["turtle-battleships-list-game-rooms"].function_name
      enable_cors  = true
    },
    {
      path_part    = "games"
      http_methods = ["PUT"]
      lambda_arn   = module.lambda_functions["turtle-battleships-join-room"].function_invoke_arn
      lambda_name  = module.lambda_functions["turtle-battleships-join-room"].function_name
      enable_cors  = true
    },
    {
      path_part    = "callback"
      http_methods = ["GET"]
      lambda_arn   = module.lambda_functions["turtle-battleships-auth-callback"].function_invoke_arn
      lambda_name  = module.lambda_functions["turtle-battleships-auth-callback"].function_name
      enable_cors  = false # No CORS needed for redirect endpoints
    }
  ]

  # CloudWatch logging configuration
  logging_level      = "INFO"
  log_retention_days = 14
  metrics_enabled    = true

  # Throttling configuration
  throttling_burst_limit = 5000
  throttling_rate_limit  = 10000

  tags = merge(
    local.tags,
    {
      Service = "rest-api"
    }
  )

  depends_on = [
    aws_api_gateway_account.main,
    module.lambda_functions
  ]
}

# S3 Bucket for Game Replays
module "text_replays_bucket" {
  source  = "terraform-aws-modules/s3-bucket/aws"
  version = "~> 3.15"

  bucket = var.text_replays_bucket.name

  versioning = {
    enabled = var.text_replays_bucket.versioning_enabled
  }

  server_side_encryption_configuration = var.text_replays_bucket.encryption_enabled ? {
    rule = {
      apply_server_side_encryption_by_default = {
        sse_algorithm = var.text_replays_bucket.sse_algorithm
      }
    }
  } : null

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true

  force_destroy = true

  tags = local.tags
}

# Allow S3 replays bucket to notify SQS queue on new object creation
resource "aws_s3_bucket_notification" "replays_to_sqs" {
  bucket = module.text_replays_bucket.s3_bucket_id

  queue {
    queue_arn = aws_sqs_queue.events.arn
    events    = ["s3:ObjectCreated:*"]
  }

  depends_on = [aws_sqs_queue.events, module.text_replays_bucket]
}

# SQS policy to allow S3 to send messages to the queue
resource "aws_sqs_queue_policy" "allow_s3_send" {
  queue_url = aws_sqs_queue.events.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Sid       = "Allow-All-From-LabRole",
        Effect    = "Allow",
        Principal = { AWS = data.aws_iam_role.lab_role.arn },
        Action    = "SQS:*",
        Resource  = aws_sqs_queue.events.arn
      },
      {
        Sid       = "Allow-S3-SendMessage",
        Effect    = "Allow",
        Principal = { Service = "s3.amazonaws.com" },
        Action    = "sqs:SendMessage",
        Resource  = aws_sqs_queue.events.arn,
        Condition = {
          ArnLike = {
            "aws:SourceArn" = "arn:aws:s3:::${module.text_replays_bucket.s3_bucket_id}"
          }
        }
      }
    ]
  })
}

# S3 bucket to store rendered video replays
module "video_replays_bucket" {
  source  = "terraform-aws-modules/s3-bucket/aws"
  version = "~> 3.15"

  bucket = var.video_replays_bucket.name

  versioning = {
    enabled = var.video_replays_bucket.versioning_enabled
  }

  server_side_encryption_configuration = var.video_replays_bucket.encryption_enabled ? {
    rule = {
      apply_server_side_encryption_by_default = {
        sse_algorithm = var.video_replays_bucket.sse_algorithm
      }
    }
  } : null

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true

  force_destroy = true

  tags = local.tags
}

# Lambda (video renderer) that consumes messages from the SQS events queue
module "lambda_video_renderer" {
  source = "./lambda-with-ecr"

  function_name   = var.video_renderer_lambda.function_name
  dockerfile_path = var.video_renderer_lambda.dockerfile_path
  role_arn        = data.aws_iam_role.lab_role.arn
  region          = var.region

  memory_size = lookup(var.video_renderer_lambda, "memory_size", 512)
  timeout     = lookup(var.video_renderer_lambda, "timeout", 60)

  environment_variables = merge(
    lookup(var.video_renderer_lambda, "environment_variables", {}),
    {
      REGION = var.region
    }
  )

  tags = merge(local.tags, { Function = var.video_renderer_lambda.function_name })

  depends_on = [aws_sqs_queue.events, module.text_replays_bucket, module.video_replays_bucket]
}

# Event source mapping so the Lambda consumes messages from the SQS queue
resource "aws_lambda_event_source_mapping" "video_renderer_from_sqs" {
  event_source_arn = aws_sqs_queue.events.arn
  function_name    = module.lambda_video_renderer.function_arn
  batch_size       = 1
  enabled          = true

  depends_on = [module.lambda_video_renderer, aws_sqs_queue.events]
}

# Cognito Module (conditional creation)
module "cognito" {
  count  = var.cognito_config.enabled ? 1 : 0
  source = "./cognito"

  project_name  = var.project_name
  callback_urls = var.cognito_config.callback_urls
  logout_urls   = var.cognito_config.logout_urls
  tags          = local.tags
}

# Build Frontend React Project
resource "terraform_data" "build_frontend" {
  triggers_replace = {
    # Use API Gateway invoke URLs (not ARNs)
    backend_url    = var.backend_config.enabled ? module.rest_api.invoke_url : "http://localhost:3000"
    websockets_url = var.backend_config.enabled ? "ws://${module.backend[0].alb_dns_name}" : "ws://localhost:3001"

    # Also rebuild if the build script itself changes
    build_script_hash = filesha256("${path.module}/build-frontend.sh")
  }

  provisioner "local-exec" {
    command     = "${path.module}/build-frontend.sh '${self.triggers_replace.backend_url}' '${self.triggers_replace.websockets_url}' '${path.module}/../frontend'"
    working_dir = path.module
  }

  depends_on = [
    module.backend,
    module.lambda_functions,
    module.rest_api,
    module.lambda_video_renderer,
  ]
}

# S3 Bucket for Frontend (SPA)
module "frontend_bucket" {
  source  = "terraform-aws-modules/s3-bucket/aws"
  version = "~> 3.15"

  bucket = var.frontend_bucket.name

  website = {
    index_document = var.frontend_bucket.index_document
    error_document = var.frontend_bucket.error_document
  }

  cors_rule = [
    {
      allowed_methods = ["GET", "HEAD"]
      allowed_origins = ["*"]
    }
  ]

  block_public_acls       = true
  ignore_public_acls      = true
  block_public_policy     = false
  restrict_public_buckets = false

  # Política pública de solo lectura
  attach_policy = true
  policy = jsonencode({
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

  tags = local.tags
}

locals {
  # Only scan for files if the dist directory exists, otherwise return empty set
  # Using try() to catch the error if directory doesn't exist
  frontend_files = try(fileset("../frontend/dist", "**"), [])
}

resource "aws_s3_object" "frontend_upload" {
  for_each = toset(local.frontend_files)

  bucket = module.frontend_bucket.s3_bucket_id
  key    = each.value
  source = "../frontend/dist/${each.value}"
  etag   = filemd5("../frontend/dist/${each.value}")

  content_type = lookup(
    {
      js   = "application/javascript",
      css  = "text/css",
      html = "text/html",
      png  = "image/png",
      jpg  = "image/jpeg",
      jpeg = "image/jpeg",
      svg  = "image/svg+xml",
      json = "application/json",
      ico  = "image/x-icon",
      txt  = "text/plain"
    },
    split(".", each.value)[length(split(".", each.value)) - 1],
    "binary/octet-stream"
  )

  depends_on = [
    terraform_data.build_frontend,
    module.frontend_bucket
  ]
}
