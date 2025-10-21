# WebSocket API Gateway Module# WebSocket API Gateway Module for Fargate

This Terraform module creates an AWS API Gateway v2 WebSocket API that integrates with an **existing Application Load Balancer (ALB)** via a VPC Link.This module creates an AWS API Gateway WebSocket API configured to connect to a Fargate service through a Network Load Balancer (NLB) and VPC Link. Perfect for real-time applications like your Socket.io backend.

## Features## Features

- **WebSocket API Gateway**: Creates a WebSocket API for real-time bidirectional communication- ✅ AWS API Gateway V2 (WebSocket)

- **VPC Link Integration**: Securely connects to an existing private ALB without exposing it to the internet- ✅ Network Load Balancer (NLB) for Fargate integration

- **Flexible Routing**: Supports $connect, $disconnect, $default routes, plus custom routes- ✅ VPC Link for private connectivity

- **CloudWatch Logging**: Integrated logging for monitoring and debugging- ✅ Target Group with health checks

- **Auto Deployment**: Optionally auto-deploy changes to the stage- ✅ CloudWatch logging and metrics

- ✅ Standard WebSocket routes ($connect, $disconnect, $default)

## Important Notes- ✅ Support for custom routes

- ✅ Throttling configuration

⚠️ **This module does NOT create an ALB**. It expects you to provide an existing ALB listener ARN (typically from an ECS Fargate module or similar). The WebSocket API Gateway will forward traffic to this existing ALB via a VPC Link.- ✅ Automatic deployment support

## Architecture## Architecture

````

InternetClient (WebSocket)

    │    ↓

    └─→ WebSocket API Gateway (Internet-facing)API Gateway (WebSocket)

            │    ↓

            └─→ VPC LinkVPC Link

                    │    ↓

                    └─→ Existing Application Load Balancer (Private)Network Load Balancer (NLB)

                            │    ↓

                            └─→ Target GroupFargate Service (Socket.io backend)

                                    │```

                                    └─→ ECS Fargate Tasks

```## Usage



## Usage Example with ECS Fargate```hcl

module "websocket_api" {

```hcl  source = "./api-gateway/websocket-api"

# ECS Fargate module (creates ALB)

module "backend" {  # API Configuration

  source = "./ecs-fargate"  api_name        = "turtle-battleships-websocket"

    api_description = "WebSocket API for real-time game communication"

  service_name         = "my-backend"  stage_name      = "prod"

  enable_load_balancer = true  auto_deploy     = true

  # ... other configuration

}  # Network Load Balancer

  nlb_name       = "turtle-battleships-nlb"

# WebSocket API Gateway (uses existing ALB)  nlb_internal   = false  # Set to true if you want internal NLB

module "websocket_api" {  nlb_subnet_ids = module.vpc.public_subnet_ids

  source = "./api-gateway/websocket-api"

  # Target Group (Fargate)

  api_name             = "my-websocket-api"  target_group_name = "turtle-battleships-tg"

  alb_listener_arn     = module.backend.alb_http_listener_arn  # Use existing ALB  fargate_port      = 3000

  vpc_link_name        = "my-vpc-link"  vpc_id            = module.vpc.vpc_id

  vpc_link_subnet_ids  = var.private_subnet_ids

  vpc_link_security_group_ids = [module.backend.security_group_id]  # VPC Link

  vpc_link_name               = "turtle-battleships-vpc-link"

  tags = local.tags  vpc_link_subnet_ids         = module.vpc.private_subnet_ids

}  vpc_link_security_group_ids = [aws_security_group.fargate_sg.id]

```

  # Optional: Custom routes

## Inputs  custom_routes = {

    "joinGame" = {

| Name | Description | Type | Required |      route_response_selection_expression = null

|------|-------------|------|:--------:|    }

| api_name | Name of the WebSocket API Gateway | `string` | yes |    "makeMove" = {

| alb_listener_arn | ARN of existing ALB HTTP listener | `string` | yes |      route_response_selection_expression = null

| vpc_link_name | Name of the VPC Link | `string` | yes |    }

| vpc_link_subnet_ids | Subnet IDs for VPC Link | `list(string)` | yes |  }

| vpc_link_security_group_ids | Security group IDs for VPC Link | `list(string)` | yes |

  # Logging and throttling

## Outputs  log_retention_days     = 7

  logging_level          = "INFO"

| Name | Description |  throttling_burst_limit = 1000

|------|-------------|  throttling_rate_limit  = 500

| websocket_stage_invoke_url | Full WebSocket connection URL |

| websocket_api_id | API Gateway ID |  tags = {

| vpc_link_id | VPC Link ID |    Project     = "turtle-battleships"

    Environment = "production"

See `variables.tf` and `outputs.tf` for complete documentation.  }

}
```

## Integrating with Fargate ECS Service

After creating this module, you need to attach your Fargate service to the target group:

```hcl
resource "aws_ecs_service" "backend" {
  name            = "turtle-battleships-backend"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.backend.arn
  desired_count   = 2
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = module.vpc.private_subnet_ids
    security_groups  = [aws_security_group.fargate_sg.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = module.websocket_api.target_group_arn
    container_name   = "backend"
    container_port   = 3000
  }
}
```

## Inputs

| Name                        | Description                             | Type         | Default | Required |
| --------------------------- | --------------------------------------- | ------------ | ------- | -------- |
| api_name                    | Name of the WebSocket API Gateway       | string       | -       | yes      |
| api_description             | Description of the WebSocket API        | string       | ""      | no       |
| stage_name                  | Name of the API Gateway stage           | string       | "prod"  | no       |
| nlb_name                    | Name of the Network Load Balancer       | string       | -       | yes      |
| nlb_subnet_ids              | Subnet IDs for the NLB                  | list(string) | -       | yes      |
| target_group_name           | Name of the target group                | string       | -       | yes      |
| fargate_port                | Port on which Fargate containers listen | number       | 3000    | no       |
| vpc_id                      | VPC ID where resources will be created  | string       | -       | yes      |
| vpc_link_name               | Name of the VPC Link                    | string       | -       | yes      |
| vpc_link_subnet_ids         | Subnet IDs for the VPC Link             | list(string) | -       | yes      |
| vpc_link_security_group_ids | Security group IDs for VPC Link         | list(string) | -       | yes      |
| custom_routes               | Custom WebSocket routes                 | map(object)  | {}      | no       |
| log_retention_days          | CloudWatch log retention in days        | number       | 14      | no       |
| throttling_burst_limit      | Throttling burst limit                  | number       | 5000    | no       |
| throttling_rate_limit       | Throttling rate limit (req/s)           | number       | 10000   | no       |

## Outputs

| Name                       | Description                                       |
| -------------------------- | ------------------------------------------------- |
| websocket_api_id           | ID of the WebSocket API Gateway                   |
| websocket_stage_invoke_url | WebSocket connection URL                          |
| nlb_arn                    | ARN of the Network Load Balancer                  |
| nlb_dns_name               | DNS name of the NLB                               |
| target_group_arn           | ARN of the target group (use this in ECS service) |
| vpc_link_id                | ID of the VPC Link                                |
| cloudwatch_log_group_name  | Name of the CloudWatch log group                  |

## Important Notes

### WebSocket Routes

The module automatically creates three standard routes:

- `$connect` - Called when client connects
- `$disconnect` - Called when client disconnects
- `$default` - Default route for unmatched messages

For Socket.io, you typically don't need custom routes since Socket.io handles routing internally.

### Security Groups

Make sure your Fargate security group allows inbound traffic from the VPC Link:

```hcl
resource "aws_security_group_rule" "allow_vpc_link" {
  type                     = "ingress"
  from_port                = 3000
  to_port                  = 3000
  protocol                 = "tcp"
  security_group_id        = aws_security_group.fargate_sg.id
  source_security_group_id = aws_security_group.vpc_link_sg.id
}
```

### Connection URL

The WebSocket URL will be in the format:

```
wss://xxxxx.execute-api.us-east-1.amazonaws.com/prod
```

Update your frontend to use this URL:

```typescript
const socket = io(module.websocket_api.websocket_stage_invoke_url);
```

### NLB vs ALB

This module uses NLB (Network Load Balancer) because:

- WebSocket connections are long-lived
- NLB provides better performance for persistent connections
- Lower latency for real-time communication
- Better suited for TCP traffic

## Troubleshooting

1. **Connection timeout**: Check security groups and VPC Link subnet configuration
2. **502 errors**: Verify Fargate service is healthy and target group health checks pass
3. **Integration errors**: Check CloudWatch logs at `/aws/apigatewayv2/[api-name]`
````
