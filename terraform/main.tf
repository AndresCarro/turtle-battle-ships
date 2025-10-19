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

module "network" {
  source               = "./network"
  private_subnet_cidrs = var.private_subnet_cidrs
  azs                  = var.azs
  region               = var.region
}

module "s3" {
  source      = "./s3"
  bucket_name = "turtle-battle-ships-frontend-2"
  project     = "turtle-battle-ships"
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
