# API Gateway Modules

This directory contains reusable Terraform modules for creating AWS API Gateways.

## Modules

### 1. REST API Gateway (`rest-api/`)

Creates an API Gateway REST API for Lambda function integrations.

**Use case**: RESTful APIs, Lambda functions, HTTP endpoints

[📖 Full Documentation](./rest-api/README.md)

### 2. WebSocket API Gateway (`websocket-api/`)

Creates an API Gateway WebSocket API connected to Fargate via NLB and VPC Link.

**Use case**: Real-time applications, WebSockets, Socket.io, long-lived connections

[📖 Full Documentation](./websocket-api/README.md)

## Quick Start

### Example: REST API for Lambdas

```hcl
module "rest_api" {
  source = "./api-gateway/rest-api"

  api_name = "my-api"

  lambda_integrations = [
    {
      path_part    = "users"
      http_methods = ["POST", "GET"]
      lambda_arn   = module.create_user_lambda.lambda_invoke_arn
      lambda_name  = module.create_user_lambda.lambda_function_name
      enable_cors  = true
    }
  ]

  tags = {
    Project = "my-project"
  }
}

output "api_url" {
  value = module.rest_api.invoke_url
}
```

### Example: WebSocket API for Fargate

```hcl
module "websocket_api" {
  source = "./api-gateway/websocket-api"

  api_name = "my-websocket-api"

  nlb_name       = "my-nlb"
  nlb_subnet_ids = module.vpc.public_subnet_ids

  target_group_name = "my-tg"
  fargate_port      = 3000
  vpc_id            = module.vpc.vpc_id

  vpc_link_name               = "my-vpc-link"
  vpc_link_subnet_ids         = module.vpc.private_subnet_ids
  vpc_link_security_group_ids = [aws_security_group.fargate.id]

  tags = {
    Project = "my-project"
  }
}

output "websocket_url" {
  value = module.websocket_api.websocket_stage_invoke_url
}
```

## Module Selection Guide

| Feature         | REST API              | WebSocket API                   |
| --------------- | --------------------- | ------------------------------- |
| **Protocol**    | HTTP/HTTPS            | WebSocket (wss://)              |
| **Backend**     | Lambda                | Fargate/ECS                     |
| **Connection**  | Request/Response      | Long-lived bidirectional        |
| **Use Case**    | CRUD operations, APIs | Real-time communication, gaming |
| **Integration** | Direct Lambda proxy   | NLB + VPC Link                  |
| **CORS**        | Built-in support      | N/A (WebSocket)                 |

## Architecture Patterns

### Pattern 1: Hybrid Architecture (Recommended for this project)

```
Frontend
   ├── REST API → Lambda (user management, game rooms)
   └── WebSocket → Fargate (real-time gameplay)
```

Benefits:

- Lambda for stateless operations (cost-effective)
- Fargate for stateful WebSocket connections
- Best of both worlds

### Pattern 2: Full Lambda

```
Frontend → REST API → Lambda Functions
```

Benefits:

- Simplest architecture
- Fully serverless
- Pay per request

### Pattern 3: Full Fargate

```
Frontend
   ├── REST API → ALB → Fargate
   └── WebSocket → NLB → Fargate
```

Benefits:

- Single backend codebase
- Easier development
- More control

## Related Modules

- [`lambda-with-ecr/`](../lambda-with-ecr/) - Lambda functions with Docker/ECR
- [`vpc/`](../vpc/) - VPC networking
- [`s3/`](../s3/) - S3 buckets

## Contributing

When adding new features:

1. Update the module's README.md
2. Add example usage
3. Document all variables and outputs
4. Test with `terraform plan` and `terraform apply`
