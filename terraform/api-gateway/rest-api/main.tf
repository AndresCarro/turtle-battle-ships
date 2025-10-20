terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# API Gateway REST API
resource "aws_api_gateway_rest_api" "api" {
  name        = var.api_name
  description = var.api_description

  endpoint_configuration {
    types = [var.endpoint_type]
  }

  tags = var.tags
}

# API Gateway Deployment
resource "aws_api_gateway_deployment" "deployment" {
  rest_api_id = aws_api_gateway_rest_api.api.id

  # Force new deployment on any change
  triggers = {
    redeployment = sha1(jsonencode([
      aws_api_gateway_rest_api.api.body,
      var.lambda_integrations,
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }

  depends_on = [
    aws_api_gateway_integration.lambda_integration,
    aws_api_gateway_integration_response.lambda_integration_response,
    aws_api_gateway_method.method,
    aws_api_gateway_method_response.method_response,
  ]
}

# API Gateway Stage
resource "aws_api_gateway_stage" "stage" {
  deployment_id = aws_api_gateway_deployment.deployment.id
  rest_api_id   = aws_api_gateway_rest_api.api.id
  stage_name    = var.stage_name

  xray_tracing_enabled = var.xray_tracing_enabled

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gateway_logs.arn
    format = jsonencode({
      requestId      = "$context.requestId"
      ip             = "$context.identity.sourceIp"
      caller         = "$context.identity.caller"
      user           = "$context.identity.user"
      requestTime    = "$context.requestTime"
      httpMethod     = "$context.httpMethod"
      resourcePath   = "$context.resourcePath"
      status         = "$context.status"
      protocol       = "$context.protocol"
      responseLength = "$context.responseLength"
    })
  }

  tags = var.tags
}

# CloudWatch Log Group for API Gateway
resource "aws_cloudwatch_log_group" "api_gateway_logs" {
  name              = "/aws/apigateway/${var.api_name}"
  retention_in_days = var.log_retention_days

  tags = var.tags
}

# Method Settings (throttling, logging, etc.)
resource "aws_api_gateway_method_settings" "settings" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  stage_name  = aws_api_gateway_stage.stage.stage_name
  method_path = "*/*"

  settings {
    metrics_enabled        = var.metrics_enabled
    logging_level          = var.logging_level
    data_trace_enabled     = var.data_trace_enabled
    throttling_burst_limit = var.throttling_burst_limit
    throttling_rate_limit  = var.throttling_rate_limit
  }
}

# Lambda Integrations
locals {
  # Flatten lambda integrations for resource creation
  lambda_routes = flatten([
    for integration in var.lambda_integrations : [
      for method in integration.http_methods : {
        key                = "${integration.path_part}-${method}"
        path_part          = integration.path_part
        http_method        = method
        lambda_arn         = integration.lambda_arn
        lambda_name        = integration.lambda_name
        enable_cors        = integration.enable_cors
        authorization      = integration.authorization
        authorizer_id      = integration.authorizer_id
        request_parameters = integration.request_parameters
      }
    ]
  ])

  lambda_routes_map = {
    for route in local.lambda_routes : route.key => route
  }
}

# API Gateway Resource (path)
resource "aws_api_gateway_resource" "resource" {
  for_each = {
    for integration in var.lambda_integrations :
    integration.path_part => integration
  }

  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_rest_api.api.root_resource_id
  path_part   = each.value.path_part
}

# API Gateway Method
resource "aws_api_gateway_method" "method" {
  for_each = local.lambda_routes_map

  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.resource[each.value.path_part].id
  http_method   = each.value.http_method
  authorization = each.value.authorization

  authorizer_id = each.value.authorizer_id

  request_parameters = each.value.request_parameters
}

# API Gateway Integration (Lambda)
resource "aws_api_gateway_integration" "lambda_integration" {
  for_each = local.lambda_routes_map

  rest_api_id             = aws_api_gateway_rest_api.api.id
  resource_id             = aws_api_gateway_resource.resource[each.value.path_part].id
  http_method             = aws_api_gateway_method.method[each.key].http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = each.value.lambda_arn
}

# Lambda Permission for API Gateway
resource "aws_lambda_permission" "api_gateway_permission" {
  for_each = local.lambda_routes_map

  statement_id  = "AllowAPIGatewayInvoke-${each.key}"
  action        = "lambda:InvokeFunction"
  function_name = each.value.lambda_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.api.execution_arn}/*/*"
}

# Method Response
resource "aws_api_gateway_method_response" "method_response" {
  for_each = local.lambda_routes_map

  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.resource[each.value.path_part].id
  http_method = aws_api_gateway_method.method[each.key].http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }

  response_models = {
    "application/json" = "Empty"
  }
}

# Integration Response
resource "aws_api_gateway_integration_response" "lambda_integration_response" {
  for_each = local.lambda_routes_map

  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.resource[each.value.path_part].id
  http_method = aws_api_gateway_method.method[each.key].http_method
  status_code = aws_api_gateway_method_response.method_response[each.key].status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }

  depends_on = [
    aws_api_gateway_integration.lambda_integration
  ]
}

# CORS Support - OPTIONS method
resource "aws_api_gateway_method" "options_method" {
  for_each = {
    for integration in var.lambda_integrations :
    integration.path_part => integration
    if integration.enable_cors
  }

  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.resource[each.key].id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "options_integration" {
  for_each = {
    for integration in var.lambda_integrations :
    integration.path_part => integration
    if integration.enable_cors
  }

  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.resource[each.key].id
  http_method = aws_api_gateway_method.options_method[each.key].http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "options_response" {
  for_each = {
    for integration in var.lambda_integrations :
    integration.path_part => integration
    if integration.enable_cors
  }

  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.resource[each.key].id
  http_method = aws_api_gateway_method.options_method[each.key].http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }

  response_models = {
    "application/json" = "Empty"
  }
}

resource "aws_api_gateway_integration_response" "options_integration_response" {
  for_each = {
    for integration in var.lambda_integrations :
    integration.path_part => integration
    if integration.enable_cors
  }

  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.resource[each.key].id
  http_method = aws_api_gateway_method.options_method[each.key].http_method
  status_code = aws_api_gateway_method_response.options_response[each.key].status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'${join(",", each.value.http_methods)},OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }

  depends_on = [
    aws_api_gateway_integration.options_integration
  ]
}
