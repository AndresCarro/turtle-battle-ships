terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  required_version = ">= 1.5.0"
}

provider "aws" {
  region                   = var.region
  shared_credentials_files = ["${path.module}/aws-credentials"]
  profile                  = "default"
}

data "aws_iam_role" "lab_role" {
  name = "LabRole"
}

# API Gateway CloudWatch Logs Role
resource "aws_api_gateway_account" "api_gateway_account" {
  cloudwatch_role_arn = data.aws_iam_role.lab_role.arn
}

# Security Group for Lambda functions
resource "aws_security_group" "lambda_sg" {
  name        = "turtle-battleships-lambda-sg"
  description = "Security group for Lambda functions to access RDS and other resources"
  vpc_id      = module.vpc.vpc_id

  # Allow outbound traffic to RDS (PostgreSQL)
  egress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = [var.vpc_config.cidr]
    description = "Allow Lambda to connect to RDS PostgreSQL"
  }

  # Allow outbound HTTPS for API calls and AWS services
  egress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow HTTPS for AWS API calls"
  }

  # Allow outbound HTTP (if needed)
  egress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow HTTP for external calls"
  }

  # Allow all outbound for VPC endpoints
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = [var.vpc_config.cidr]
    description = "Allow all traffic within VPC"
  }

  tags = merge(
    var.common_tags,
    {
      Name = "turtle-battleships-lambda-sg"
    }
  )
}

module "create_user_lambda" {
  source = "./lambda-with-ecr"
  
  function_name   = "turtle-battleships-create-user"
  dockerfile_path = "${path.module}/../lambdas/create-user-lambda"
  region          = var.region
  role_arn        = data.aws_iam_role.lab_role.arn
  
  memory_size = 512
  timeout     = 30
  
  environment_variables = {
    ENVIRONMENT = "production"
    REGION      = var.region
  }

  tags = {
    Project  = "turtle-battleships"
    Function = "create-user"
  }

  vpc_config = {
    subnet_ids         = [for k, v in module.vpc.subnets : v if startswith(k, "private")]
    security_group_ids = [aws_security_group.lambda_sg.id]
  }
}

module "list_game_rooms_lambda" {
  source = "./lambda-with-ecr"

  function_name   = "turtle-battleships-list-rooms"
  dockerfile_path = "${path.module}/../lambdas/list-game-rooms-lambda"
  region          = var.region
  role_arn        = data.aws_iam_role.lab_role.arn

  memory_size = 512
  timeout     = 30

  environment_variables = {
    ENVIRONMENT = "production"
    REGION      = var.region
  }

  tags = {
    Project  = "turtle-battleships"
    Function = "list-rooms"
  }

  vpc_config = {
    subnet_ids         = [for k, v in module.vpc.subnets : v if startswith(k, "private")]
    security_group_ids = [aws_security_group.lambda_sg.id]
  }
}

module "create_game_room_lambda" {
  source = "./lambda-with-ecr"

  function_name   = "turtle-battleships-create-room"
  dockerfile_path = "${path.module}/../lambdas/create-game-room-lambda"
  region          = var.region
  role_arn        = data.aws_iam_role.lab_role.arn

  memory_size = 512
  timeout     = 30

  environment_variables = {
    ENVIRONMENT = "production"
    REGION      = var.region
  }

  tags = {
    Project  = "turtle-battleships"
    Function = "create-room"
  }

  vpc_config = {
    subnet_ids         = [for k, v in module.vpc.subnets : v if startswith(k, "private")]
    security_group_ids = [aws_security_group.lambda_sg.id]
  }
}

module "join_room_lambda" {
  source = "./lambda-with-ecr"

  function_name   = "turtle-battleships-join-room"
  dockerfile_path = "${path.module}/../lambdas/join-room-lambda"
  region          = var.region
  role_arn        = data.aws_iam_role.lab_role.arn

  memory_size = 512
  timeout     = 30

  environment_variables = {
    ENVIRONMENT = "production"
    REGION      = var.region
  }

  tags = {
    Project  = "turtle-battleships"
    Function = "join-room"
  }

  vpc_config = {
    subnet_ids         = [for k, v in module.vpc.subnets : v if startswith(k, "private")]
    security_group_ids = [aws_security_group.lambda_sg.id]
  }
}
#   tags = {
#     Project  = "turtle-battleships"
#     Function = "create-user"
#   }
# }

module "vpc" {
  source = "./vpc"

  vpc_config           = var.vpc_config
  subnets_config       = var.subnets_config
  route_tables_config  = var.route_tables_config
  vpc_endpoints_config = var.vpc_endpoints_config
  tags                 = var.common_tags
}

# 🪣 S3 — Replays y SPA
module "s3" {
  source = "./s3"

  buckets = var.s3_buckets
  tags    = var.common_tags
}

# 🌐 API Gateway REST API — Lambda Functions
module "rest_api_gateway" {
  source = "./api-gateway/rest-api"

  api_name        = "turtle-battleships-api"
  api_description = "REST API for Turtle Battleships game"
  stage_name      = "prod"

  lambda_integrations = [
    {
      path_part    = "users"
      http_methods = ["POST"]
      lambda_arn   = module.create_user_lambda.function_invoke_arn
      lambda_name  = module.create_user_lambda.function_name
      enable_cors  = true
    },
    {
      path_part    = "rooms"
      http_methods = ["GET"]
      lambda_arn   = module.list_game_rooms_lambda.function_invoke_arn
      lambda_name  = module.list_game_rooms_lambda.function_name
      enable_cors  = true
    },
    {
      path_part    = "create-room"
      http_methods = ["POST"]
      lambda_arn   = module.create_game_room_lambda.function_invoke_arn
      lambda_name  = module.create_game_room_lambda.function_name
      enable_cors  = true
    },
    {
      path_part    = "join-room"
      http_methods = ["POST"]
      lambda_arn   = module.join_room_lambda.function_invoke_arn
      lambda_name  = module.join_room_lambda.function_name
      enable_cors  = true
    }
  ]

  xray_tracing_enabled   = false
  log_retention_days     = 7
  throttling_burst_limit = 1000
  throttling_rate_limit  = 500

  tags = var.common_tags
}

# 📤 Outputs globales
# output "vpc_id" {
#   description = "ID de la VPC creada"
#   value       = module.vpc.vpc_id
# }

# output "subnets" {
#   description = "IDs de las subnets creadas"
#   value       = module.vpc.subnets
# }

# output "route_tables" {
#   description = "IDs de las route tables creadas"
#   value       = module.vpc.route_tables
# }

# output "vpc_endpoints" {
#   description = "IDs de los VPC Endpoints creados"
#   value       = module.vpc.vpc_endpoints
# }

# output "s3_bucket_names" {
#   description = "Nombres de los buckets creados"
#   value       = module.s3.bucket_names
# }

# output "s3_bucket_arns" {
#   description = "ARNs de los buckets creados"
#   value       = module.s3.bucket_arns
# }

# module "backend_ws" {
#   source = "./ecs-fargate"

#   service_name    = "turtle-battleships-backend"
#   dockerfile_path = "${path.module}/../backend"
#   region          = var.region
#   role_arn        = data.aws_iam_role.lab_role.arn

#   # Container configuration
#   container_port = 3000 # Make sure your backend listens on this port
#   cpu            = 256  # 1 vCPU
#   memory         = 512  # 512 MB
#   desired_count  = 1    # Number of tasks to run

#   vpc_id     = module.vpc.vpc_id
#   subnet_ids = [module.vpc.subnets["private-a1"], module.vpc.subnets["private-b1"]]
  
#   # Use private subnets with VPC endpoints (no public IP needed)
#   assign_public_ip = false

#   # Health check configuration
#   health_check_path                = "/ping"
#   health_check_interval            = 30
#   health_check_timeout             = 5
#   health_check_healthy_threshold   = 2
#   health_check_unhealthy_threshold = 3

#   # Environment variables for your backend
#   environment_variables = {
#     NODE_ENV = "production"
#     PORT     = "3000"
#   }
  
#   enable_autoscaling        = true
#   autoscaling_min_capacity  = 1
#   autoscaling_max_capacity  = 2
#   autoscaling_target_cpu    = 70

#   tags = {
#     Project     = "turtle-battleships"
#     Environment = "academy"
#     Service     = "backend"
#   }
# }

output "rest_api_url" {
  description = "URL base del API Gateway REST"
  value       = module.rest_api_gateway.invoke_url
}

output "rest_api_endpoints" {
  description = "Endpoints disponibles del REST API"
  value = {
    create_user  = "${module.rest_api_gateway.invoke_url}/users"
    list_rooms   = "${module.rest_api_gateway.invoke_url}/rooms"
    create_room  = "${module.rest_api_gateway.invoke_url}/create-room"
    join_room    = "${module.rest_api_gateway.invoke_url}/join-room"
  }
}

output "lambda_functions" {
  description = "Nombres de las funciones Lambda creadas"
  value = {
    create_user  = module.create_user_lambda.function_name
    list_rooms   = module.list_game_rooms_lambda.function_name
    create_room  = module.create_game_room_lambda.function_name
    join_room    = module.join_room_lambda.function_name
  }
}
