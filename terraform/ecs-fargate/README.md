# ECS Fargate Module

This Terraform module deploys a containerized application to AWS ECS Fargate with Application Load Balancer. It handles:
- Creating an ECR repository
- Building and pushing Docker images to ECR
- Creating ECS cluster, task definition, and service
- Setting up Application Load Balancer with health checks
- CloudWatch logging
- Auto-scaling (optional)
- IAM roles and policies using existing roles like AWS Academy's LabRole

## Features

- **Automatic Docker Build**: Builds and pushes Docker images to ECR automatically
- **Production Ready**: ALB with health checks, auto-scaling, CloudWatch logs
- **API Gateway Ready**: Outputs for VPC Link integration
- **AWS Academy Compatible**: Supports using existing IAM roles (LabRole)
- **Auto-rebuild Triggers**: Automatically rebuilds when Dockerfile or package.json changes
- **HTTPS Support**: Optional SSL certificate integration
- **Auto Scaling**: Optional CPU and memory-based auto scaling

## Requirements

- Terraform >= 1.5.0
- AWS Provider ~> 5.0
- Docker Provider ~> 3.0
- Docker installed locally
- VPC with subnets (can use existing or create new)

## Usage

### Basic Example (AWS Academy)

```hcl
# Get the LabRole
data "aws_iam_role" "lab_role" {
  name = "LabRole"
}

# Use existing VPC (or create one)
data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

module "backend" {
  source = "./ecs-fargate"

  service_name    = "turtle-battleships-backend"
  dockerfile_path = "../backend"
  region          = "us-east-1"

  # Container configuration
  container_port = 3000
  cpu            = 256
  desired_count  = 1

  # Network configuration
  vpc_id     = data.aws_vpc.default.id
  subnet_ids = data.aws_subnets.default.ids

  # AWS Academy - use LabRole
  role_arn  = data.aws_iam_role.lab_role.arn

  environment_variables = {
    NODE_ENV = "production"
    PORT     = "3000"
  }

  tags = {
    Project     = "turtle-battleships"
    Environment = "academy"
  }
}

# Access the service
output "backend_url" {
  value = module.backend.service_url
}
```

### With Auto Scaling

```hcl
module "backend" {
  source = "./ecs-fargate"

  service_name    = "my-backend"
  dockerfile_path = "../backend"
  
  # ... other configuration

  # Enable auto scaling
  enable_autoscaling        = true
  autoscaling_min_capacity  = 1
  autoscaling_max_capacity  = 10
  autoscaling_target_cpu    = 70
}
```

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| service_name | Name of the ECS service | `string` | n/a | yes |
| dockerfile_path | Path to directory containing Dockerfile | `string` | n/a | yes |
| vpc_id | VPC ID where service will run | `string` | n/a | yes |
| subnet_ids | List of subnet IDs | `list(string)` | n/a | yes |
| container_port | Port the container listens on | `number` | `3000` | no |
| cpu | CPU units (256, 512, 1024, 2048, 4096) | `number` | `256` | no |
| desired_count | Desired number of tasks | `number` | `1` | no |
| environment_variables | Environment variables | `map(string)` | `{}` | no |
| secrets | Secrets from Parameter Store/Secrets Manager | `map(object)` | `{}` | no |
| enable_load_balancer | Create an ALB | `bool` | `true` | no |
| health_check_path | Health check endpoint path | `string` | `"/health"` | no |
| enable_autoscaling | Enable auto scaling | `bool` | `false` | no |
| role_arn | ARN of existing execution role | `string` | `""` | conditional |
| assign_public_ip | Assign public IP to tasks | `bool` | `true` | no |
| tags | Tags to apply to resources | `map(string)` | `{}` | no |

See `variables.tf` for complete list of inputs.

## Outputs

| Name | Description |
|------|-------------|
| service_name | Name of the ECS service |
| service_arn | ARN of the ECS service |
| cluster_name | Name of the ECS cluster |
| cluster_arn | ARN of the ECS cluster |
| alb_dns_name | DNS name of the ALB |
| alb_arn | ARN of the ALB |
| alb_zone_id | Zone ID of the ALB (for Route53) |
| service_url | URL to access the service |
| vpc_link_config | Configuration for API Gateway VPC Link |
| target_group_arn | ARN of the target group |
| alb_http_listener_arn | ARN of the HTTP listener |
| alb_https_listener_arn | ARN of the HTTPS listener |
| ecr_repository_url | URL of the ECR repository |
| log_group_name | Name of the CloudWatch Log Group |

## Container Requirements

Your Dockerfile should:

1. **Expose the correct port** matching `container_port`
2. **Implement health check endpoint** (default: `/health`)
3. **Handle graceful shutdown** (respond to SIGTERM)

Example health check endpoint (Express.js):

```javascript
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});
```
