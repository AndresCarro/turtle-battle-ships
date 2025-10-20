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
}

locals {
  ecr_repo_name = var.ecr_repository_name != "" ? var.ecr_repository_name : var.function_name
}

# ECR Repository
resource "aws_ecr_repository" "lambda_repo" {
  name                 = local.ecr_repo_name
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = merge(
    var.tags,
    {
      Name = local.ecr_repo_name
    }
  )
}

# ECR Lifecycle Policy to keep only recent images
resource "aws_ecr_lifecycle_policy" "lambda_repo_policy" {
  repository = aws_ecr_repository.lambda_repo.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last 5 images"
        selection = {
          tagStatus     = "any"
          countType     = "imageCountMoreThan"
          countNumber   = 5
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

# Get AWS account ID
data "aws_caller_identity" "current" {}

# Get ECR authorization token
data "aws_ecr_authorization_token" "token" {}

provider "docker" {
  registry_auth {
    address  = "${data.aws_caller_identity.current.account_id}.dkr.ecr.${var.region}.amazonaws.com"
    username = data.aws_ecr_authorization_token.token.user_name
    password = data.aws_ecr_authorization_token.token.password
  }
}

# Build and push Docker image
resource "docker_image" "lambda_image" {
  name = "${aws_ecr_repository.lambda_repo.repository_url}:${var.image_tag}"
  
  build {
    context    = var.dockerfile_path
    dockerfile = "Dockerfile"
    platform   = var.architectures[0] == "arm64" ? "linux/arm64" : "linux/amd64"
  }

  triggers = {
    # Rebuild if Dockerfile changes
    dockerfile_hash = filemd5("${var.dockerfile_path}/Dockerfile")
    # You can add more file hashes here to trigger rebuilds
    package_json_hash = fileexists("${var.dockerfile_path}/package.json") ? filemd5("${var.dockerfile_path}/package.json") : ""
  }
}

resource "docker_registry_image" "lambda_image" {
  name = docker_image.lambda_image.name

  depends_on = [
    docker_image.lambda_image
  ]
}

# Lambda Function
resource "aws_lambda_function" "function" {
  function_name = var.function_name
  role          = var.role_arn
  package_type  = "Image"
  image_uri     = "${aws_ecr_repository.lambda_repo.repository_url}@${docker_registry_image.lambda_image.sha256_digest}"
  
  memory_size                    = var.memory_size
  timeout                        = var.timeout
  architectures                  = var.architectures
  reserved_concurrent_executions = var.reserved_concurrent_executions
  publish                        = var.publish

  dynamic "environment" {
    for_each = length(var.environment_variables) > 0 ? [1] : []
    content {
      variables = var.environment_variables
    }
  }

  dynamic "vpc_config" {
    for_each = var.vpc_config != null ? [var.vpc_config] : []
    content {
      subnet_ids         = vpc_config.value.subnet_ids
      security_group_ids = vpc_config.value.security_group_ids
    }
  }

  tags = merge(
    var.tags,
    {
      Name = var.function_name
    }
  )

  depends_on = [docker_registry_image.lambda_image]
}

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "lambda_log_group" {
  name              = "/aws/lambda/${var.function_name}"
  retention_in_days = 14

  tags = merge(
    var.tags,
    {
      Name = "${var.function_name}-logs"
    }
  )
}
