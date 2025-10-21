terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# WebSocket API Gateway
resource "aws_apigatewayv2_api" "websocket_api" {
  name                       = var.api_name
  protocol_type              = "WEBSOCKET"
  route_selection_expression = var.route_selection_expression
  description                = var.api_description

  tags = var.tags
}

# CloudWatch Log Group for WebSocket API
resource "aws_cloudwatch_log_group" "websocket_logs" {
  name              = "/aws/apigatewayv2/${var.api_name}"
  retention_in_days = var.log_retention_days

  tags = var.tags
}

# VPC Link for API Gateway to access existing ALB
resource "aws_apigatewayv2_vpc_link" "vpc_link" {
  name               = var.vpc_link_name
  security_group_ids = var.vpc_link_security_group_ids
  subnet_ids         = var.vpc_link_subnet_ids

  tags = merge(
    var.tags,
    {
      Name = var.vpc_link_name
    }
  )
}

# API Gateway Integration with existing ALB via VPC Link
resource "aws_apigatewayv2_integration" "alb_integration" {
  api_id             = aws_apigatewayv2_api.websocket_api.id
  integration_type   = "HTTP_PROXY"
  integration_method = "ANY"
  integration_uri    = var.alb_listener_arn
  connection_type    = "VPC_LINK"
  connection_id      = aws_apigatewayv2_vpc_link.vpc_link.id

  request_parameters = var.integration_request_parameters
}

# WebSocket Routes
resource "aws_apigatewayv2_route" "connect_route" {
  api_id    = aws_apigatewayv2_api.websocket_api.id
  route_key = "$connect"
  target    = "integrations/${aws_apigatewayv2_integration.alb_integration.id}"
}

resource "aws_apigatewayv2_route" "disconnect_route" {
  api_id    = aws_apigatewayv2_api.websocket_api.id
  route_key = "$disconnect"
  target    = "integrations/${aws_apigatewayv2_integration.alb_integration.id}"
}

resource "aws_apigatewayv2_route" "default_route" {
  api_id    = aws_apigatewayv2_api.websocket_api.id
  route_key = "$default"
  target    = "integrations/${aws_apigatewayv2_integration.alb_integration.id}"
}

# Additional custom routes (optional)
resource "aws_apigatewayv2_route" "custom_routes" {
  for_each = var.custom_routes

  api_id    = aws_apigatewayv2_api.websocket_api.id
  route_key = each.key
  target    = "integrations/${aws_apigatewayv2_integration.alb_integration.id}"

  # Optional route response
  route_response_selection_expression = each.value.route_response_selection_expression
}

# API Gateway Stage
resource "aws_apigatewayv2_stage" "websocket_stage" {
  api_id      = aws_apigatewayv2_api.websocket_api.id
  name        = var.stage_name
  auto_deploy = var.auto_deploy

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.websocket_logs.arn
    format = jsonencode({
      requestId               = "$context.requestId"
      ip                      = "$context.identity.sourceIp"
      requestTime             = "$context.requestTime"
      routeKey                = "$context.routeKey"
      status                  = "$context.status"
      protocol                = "$context.protocol"
      responseLength          = "$context.responseLength"
      integrationErrorMessage = "$context.integrationErrorMessage"
    })
  }

  default_route_settings {
    throttling_burst_limit = var.throttling_burst_limit
    throttling_rate_limit  = var.throttling_rate_limit
    logging_level          = var.logging_level
    data_trace_enabled     = var.data_trace_enabled
  }

  tags = var.tags

  depends_on = [
    aws_apigatewayv2_route.connect_route,
    aws_apigatewayv2_route.disconnect_route,
    aws_apigatewayv2_route.default_route,
  ]
}

# API Gateway Deployment (if auto_deploy is false)
resource "aws_apigatewayv2_deployment" "websocket_deployment" {
  count = var.auto_deploy ? 0 : 1

  api_id      = aws_apigatewayv2_api.websocket_api.id
  description = "Deployment for ${var.stage_name}"

  triggers = {
    redeployment = sha1(jsonencode([
      aws_apigatewayv2_route.connect_route.id,
      aws_apigatewayv2_route.disconnect_route.id,
      aws_apigatewayv2_route.default_route.id,
      aws_apigatewayv2_integration.alb_integration.id,
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }

  depends_on = [
    aws_apigatewayv2_route.connect_route,
    aws_apigatewayv2_route.disconnect_route,
    aws_apigatewayv2_route.default_route,
  ]
}
