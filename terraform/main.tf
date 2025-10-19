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
  region  = var.region
  profile = "default"
}

data "aws_iam_role" "lab_role" {
  name = "LabRole"
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
}


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

# 📤 Outputs globales
output "vpc_id" {
  description = "ID de la VPC creada"
  value       = module.vpc.vpc_id
}

output "subnets" {
  description = "IDs de las subnets creadas"
  value       = module.vpc.subnets
}

output "route_tables" {
  description = "IDs de las route tables creadas"
  value       = module.vpc.route_tables
}

output "vpc_endpoints" {
  description = "IDs de los VPC Endpoints creados"
  value       = module.vpc.vpc_endpoints
}

output "s3_bucket_names" {
  description = "Nombres de los buckets creados"
  value       = module.s3.bucket_names
}

output "s3_bucket_arns" {
  description = "ARNs de los buckets creados"
  value       = module.s3.bucket_arns
}
