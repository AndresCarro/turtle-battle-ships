# REST API Gateway Module for Lambda

This module creates an AWS API Gateway REST API configured to integrate with Lambda functions. It includes support for CORS, multiple HTTP methods, logging, and throttling.

## Features

- ✅ AWS API Gateway REST API
- ✅ Lambda proxy integrations with automatic permissions
- ✅ CORS support (automatic OPTIONS method)
- ✅ CloudWatch logging and metrics
- ✅ X-Ray tracing support
- ✅ Throttling configuration
- ✅ Multiple HTTP methods per endpoint
- ✅ Automatic redeployment on changes

## Usage

```hcl
module "api_gateway" {
  source = "./api-gateway/rest-api"

  api_name        = "turtle-battleships-api"
  api_description = "API Gateway for Turtle Battleships game"
  stage_name      = "prod"

  lambda_integrations = [
    {
      path_part    = "users"
      http_methods = ["POST", "GET"]
      lambda_arn   = module.create_user_lambda.lambda_invoke_arn
      lambda_name  = module.create_user_lambda.lambda_function_name
      enable_cors  = true
    },
    {
      path_part    = "rooms"
      http_methods = ["GET", "POST"]
      lambda_arn   = module.list_rooms_lambda.lambda_invoke_arn
      lambda_name  = module.list_rooms_lambda.lambda_function_name
      enable_cors  = true
    }
  ]

  # Optional settings
  xray_tracing_enabled   = true
  log_retention_days     = 7
  throttling_burst_limit = 1000
  throttling_rate_limit  = 500

  tags = {
    Project     = "turtle-battleships"
    Environment = "production"
  }
}
```

## Inputs

| Name                   | Description                                | Type         | Default    | Required |
| ---------------------- | ------------------------------------------ | ------------ | ---------- | -------- |
| api_name               | Name of the API Gateway                    | string       | -          | yes      |
| api_description        | Description of the API Gateway             | string       | ""         | no       |
| stage_name             | Name of the API Gateway stage              | string       | "prod"     | no       |
| endpoint_type          | Endpoint type (REGIONAL, EDGE, or PRIVATE) | string       | "REGIONAL" | no       |
| lambda_integrations    | List of Lambda function integrations       | list(object) | []         | no       |
| xray_tracing_enabled   | Enable X-Ray tracing                       | bool         | false      | no       |
| log_retention_days     | CloudWatch log retention in days           | number       | 14         | no       |
| metrics_enabled        | Enable CloudWatch metrics                  | bool         | true       | no       |
| logging_level          | Logging level (OFF, ERROR, INFO)           | string       | "INFO"     | no       |
| throttling_burst_limit | Throttling burst limit                     | number       | 5000       | no       |
| throttling_rate_limit  | Throttling rate limit (req/s)              | number       | 10000      | no       |
| tags                   | Tags to apply to resources                 | map(string)  | {}         | no       |

## Outputs

| Name                      | Description                          |
| ------------------------- | ------------------------------------ |
| api_id                    | ID of the API Gateway REST API       |
| api_arn                   | ARN of the API Gateway REST API      |
| invoke_url                | Invoke URL for the API Gateway stage |
| stage_name                | Name of the API Gateway stage        |
| cloudwatch_log_group_name | Name of the CloudWatch log group     |

## Lambda Integration Object

```hcl
{
  path_part      = string           # URL path (e.g., "users", "rooms")
  http_methods   = list(string)     # HTTP methods (e.g., ["GET", "POST"])
  lambda_arn     = string           # Lambda function invoke ARN
  lambda_name    = string           # Lambda function name
  enable_cors    = bool             # Enable CORS (default: true)
  authorization  = string           # Authorization type (default: "NONE")
  authorizer_id  = string           # Custom authorizer ID (optional)
  request_parameters = map(bool)    # Request parameters (optional)
}
```

## Notes

- Lambda functions must output the ARN in the format expected by `lambda_invoke_arn`
- CORS is enabled by default for all endpoints
- The module automatically creates OPTIONS methods for CORS preflight requests
- API Gateway will automatically redeploy when Lambda integrations change
