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


# Modulo externo de RDS y RDS Proxy
module "rds" {
  source  = "terraform-aws-modules/rds/aws"
  version                 = var.rds.version
  
  region                  = var.region

  identifier              = var.rds.identifier
  engine                  = var.rds.engine
  engine_version          = var.rds.engine_version
  instance_class          = var.rds.instance_class
  allocated_storage       = var.rds.allocated_storage
  max_allocated_storage   = var.rds.max_allocated_storage
  backup_retention_period = var.rds.backup_retention_days
  deletion_protection     = var.rds.deletion_protection

  db_name                 = var.rds.database_name
  username                = var.rds.master_username
  password                = var.rds.master_password
  port                    = 5432

  multi_az               = true
  publicly_accessible    = false
  storage_encrypted      = true
  skip_final_snapshot    = true
  vpc_security_group_ids = var.rds.vpc_security_group_ids
  db_subnet_group_name   = var.rds.db_subnet_group_name
}

module "rds_proxy" {
  source  = "terraform-aws-modules/rds-proxy/aws"
  version                = = var.rds.proxy.version

  name                   = "${var.rds.identifier}-proxy"
  engine_family          = var.rds.engine 
  role_arn               = var.rds.proxy.role_arn
  vpc_security_group_ids = var.rds.vpc_security_group_ids
  vpc_subnet_ids         = var.rds.vpc_subnet_group_ids

  auth = [{
    auth_scheme = "SECRETS"
    secret_arn  = var.rds.secret_arn
    iam_auth    = "DISABLED"
  }]
}