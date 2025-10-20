# Terraform Configuration Guide

This Terraform configuration is designed to be highly configurable through variables, making it easy to customize your infrastructure without modifying the core code.

## 🎯 Quick Start

All configuration is done in `terraform.tfvars`. The main features are:

### 1. **Dynamic VPC and Subnets**
Instead of manually defining each subnet, you just specify:
- **Number of Availability Zones** to use
- **Number of private/public subnets per AZ**
- **VPC CIDR block**

The configuration automatically:
- Queries available AZs using AWS datasource
- Generates subnet CIDRs using `cidrsubnet()`
- Creates route tables (one per AZ)
- Distributes subnets across AZs

```hcl
vpc_cidr                 = "10.0.0.0/16"
availability_zones_count = 2           # Uses first 2 AZs in region
private_subnets_per_az   = 2           # Creates 2 private subnets per AZ
public_subnets_per_az    = 0           # No public subnets
```

**Result**: 4 private subnets (2 per AZ), automatically named and CIDR-allocated.

### 2. **S3 Buckets Configuration**
Two bucket objects, one for each bucket:

```hcl
replays_bucket = {
  name               = "turtle-battle-ships-replays"
  versioning_enabled = false
  encryption_enabled = true
  sse_algorithm      = "AES256"
}

frontend_bucket = {
  name            = "turtle-battle-ships-frontend"
  website_enabled = true
  index_document  = "index.html"
  error_document  = "index.html"
  upload_enabled  = true
  upload_dir      = "./resources"
}
```

### 3. **Backend ECS Service**
Single object with all backend configuration:

```hcl
backend_config = {
  enabled          = false  # Toggle to deploy/destroy
  service_name     = "turtle-battleships-backend"
  dockerfile_path  = "../backend"
  container_port   = 3000
  cpu              = 256
  memory           = 512
  desired_count    = 1
  health_check_path = "/ping"
  environment_variables = {
    NODE_ENV = "production"
    PORT     = "3000"
  }
  enable_autoscaling = true
  autoscaling_min    = 1
  autoscaling_max    = 2
  autoscaling_cpu    = 70
}
```

Set `enabled = true` to deploy the backend.

### 4. **Lambda Functions**
List of lambda function objects:

```hcl
lambda_functions = [
  {
    function_name   = "turtle-battleships-create-user"
    dockerfile_path = "../lambdas/create-user-lambda"
    memory_size     = 512
    timeout         = 30
    environment_variables = {
      ENVIRONMENT = "production"
    }
  },
  {
    function_name   = "turtle-battleships-create-game-room"
    dockerfile_path = "../lambdas/create-game-room-lambda"
    memory_size     = 512
    timeout         = 30
    environment_variables = {
      ENVIRONMENT = "production"
    }
  }
  # Add more Lambda functions as needed
]
```

The module will create all lambdas in the list using `for_each`.

## 🔧 Advanced Configuration

### VPC Endpoints
Default endpoints are defined in `variables.tf`. To customize:

```hcl
vpc_endpoints_config = [
  { service = "s3", type = "Gateway" },
  { service = "dynamodb", type = "Gateway" },
  { service = "ecr.api", type = "Interface", private_dns = true },
  { service = "ecr.dkr", type = "Interface", private_dns = true },
  { service = "logs", type = "Interface", private_dns = true },
  { service = "secretsmanager", type = "Interface", private_dns = true }
]
```

### Subnet CIDR Allocation
Subnets are auto-allocated from `vpc_cidr` using this formula:
- **Private subnets**: Start at `10.0.101.0/24`, increment by 1 per subnet
- **Public subnets**: Start at `10.0.1.0/24`, increment by 1 per subnet

To change this, modify the `cidrsubnet()` calls in `main.tf` locals.

### Tags
Common tags are automatically applied to all resources:

```hcl
common_tags = {
  ManagedBy = "Terraform"
  Owner     = "DevTeam"
}
```

These are merged with:
- `Project = var.project_name`
- `Environment = var.environment`
- Resource-specific tags (e.g., `Service = "backend"`)
