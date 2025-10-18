# main.tf
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
    region = "us-east-1"
}

resource "aws_vpc" "main" {
    cidr_block = "10.0.0.0/16"

    tags = {
        Name = "turtle-battle-ships-vpc"
    }
}

variable "public_subnet_cidrs" {
    type        = list(string)
    description = "Public Subnet CIDR values"
    default     = [ "10.0.1.0/24", "10.0.2.0/24" ]
}

variable "private_subnet_cidrs" {
    type        = list(string)
    description = "Private Subnet CIDR values"
    default     = [ "10.0.3.0/24", "10.0.4.0/24", "10.0.5.0/24", "10.0.6.0/24" ]
}

resource "aws_subnet" "public_subnets" {
    count      = length(var.public_subnet_cidrs)
    vpc_id     = aws_vpc.main.id
    cidr_block = element(var.public_subnet_cidrs, count.index)
    
    tags = {
        Name = "turtle-battle-ships-public-${count.index + 1}"
    }
}

resource "aws_subnet" "private_subnets" {
    count      = length(var.private_subnet_cidrs)
    vpc_id     = aws_vpc.main.id
    cidr_block = element(var.private_subnet_cidrs, count.index)
    
    tags = {
        Name = "turtle-battle-ships-private-${count.index + 1}"
    }
}
