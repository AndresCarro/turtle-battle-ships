# Lambda Docker Module

This Terraform module creates an AWS Lambda function from a Docker image. It handles:
- Creating an ECR repository
- Building and pushing Docker images to ECR
- Creating Lambda function with configurable parameters
- Setting up IAM roles and policies, only using existing AWS role, this is to support AWS Academy Learner Lab restrictions.
- CloudWatch log groups

## Features

- **Automatic Docker Build**: Builds and pushes Docker images to ECR automatically
- **Flexible Configuration**: Supports VPC configuration, environment variables, and custom IAM policies
- **API Gateway Ready**: Returns invoke ARN for easy API Gateway integration
- **Auto-rebuild Triggers**: Automatically rebuilds when Dockerfile or package.json changes
- **AWS Academy Compatible**: Supports using existing IAM roles (LabRole) for AWS Academy Learner Lab

## Requirements

- Terraform >= 1.5.0
- AWS Provider ~> 5.0
- Docker Provider ~> 3.0
- Docker installed locally

## Usage

### Basic Example


```hcl
# Get the LabRole from AWS Academy
data "aws_iam_role" "lab_role" {
  name = "LabRole"
}

module "my_lambda" {
  source = "./lambda-docker"

  function_name   = "my-lambda-function"
  dockerfile_path = "../lambdas/my-lambda"
  region          = "us-east-1"

  role_arn = data.aws_iam_role.lab_role.arn

  environment_variables = {
    STAGE = "production"
  }

  tags = {
    Environment = "production"
    Project     = "my-project"
  }
}
```

### With VPC Configuration

```hcl
# Get the LabRole from AWS Academy
data "aws_iam_role" "lab_role" {
  name = "LabRole"
}

module "my_lambda" {
  source = "./lambda-docker"

  function_name   = "my-lambda-function"
  dockerfile_path = "../lambdas/my-lambda"
  region          = "us-east-1"

  role_arn = data.aws_iam_role.lab_role.arn

  vpc_config = {
    subnet_ids         = ["subnet-123", "subnet-456"]
    security_group_ids = ["sg-789"]
  }

  memory_size = 1024
  timeout     = 60
}
```

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| function_name | Name of the Lambda function | `string` | n/a | yes |
| dockerfile_path | Path to the directory containing the Dockerfile | `string` | n/a | yes |
| ecr_repository_name | Name of the ECR repository | `string` | `""` (uses function_name) | no |
| image_tag | Tag for the Docker image | `string` | `"latest"` | no |
| memory_size | Amount of memory in MB | `number` | `512` | no |
| timeout | Timeout in seconds | `number` | `30` | no |
| environment_variables | Environment variables | `map(string)` | `{}` | no |
| vpc_config | VPC configuration | `object` | `null` | no |
| role_arn | ARN of existing IAM role | `string` | n/a | yes |
| tags | Tags to apply to all resources | `map(string)` | `{}` | no |
| region | AWS region | `string` | `"us-east-1"` | no |
| architectures | Instruction set architecture | `list(string)` | `["x86_64"]` | no |
| reserved_concurrent_executions | Reserved concurrent executions | `number` | `-1` | no |
| publish | Publish as new version | `bool` | `false` | no |

## Outputs

| Name | Description |
|------|-------------|
| function_name | Name of the Lambda function |
| function_arn | ARN of the Lambda function |
| function_invoke_arn | Invoke ARN (for API Gateway) |
| function_qualified_arn | Qualified ARN (includes version) |
| function_version | Latest published version |
| ecr_repository_url | URL of the ECR repository |
| ecr_repository_arn | ARN of the ECR repository |
| image_uri | URI of the Docker image |
| log_group_name | Name of the CloudWatch Log Group |
| log_group_arn | ARN of the CloudWatch Log Group |

## Notes

- The module automatically rebuilds the Docker image when the Dockerfile or package.json changes
- ECR lifecycle policy keeps only the last 5 images
- CloudWatch logs are retained for 14 days by default
- The Docker provider requires Docker to be installed and running locally
