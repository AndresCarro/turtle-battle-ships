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
    region = var.region
    profile = "default"
}

module "network" {
    source                  = "./network"
    private_subnet_cidrs    = var.private_subnet_cidrs
    azs                     = var.azs
    region                  = var.region
}

module "s3" {
  source       = "./s3"
  bucket_name  = "turtle-battle-ships-frontend-2"
  project      = "turtle-battle-ships"
}