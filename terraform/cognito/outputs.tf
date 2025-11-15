# User Pool outputs
output "user_pool_id" {
  description = "ID of the Cognito User Pool"
  value       = aws_cognito_user_pool.main.id
}

output "user_pool_arn" {
  description = "ARN of the Cognito User Pool"
  value       = aws_cognito_user_pool.main.arn
}

output "user_pool_endpoint" {
  description = "Endpoint of the Cognito User Pool"
  value       = aws_cognito_user_pool.main.endpoint
}

output "user_pool_name" {
  description = "Name of the Cognito User Pool"
  value       = aws_cognito_user_pool.main.name
}

# User Pool Client outputs
output "user_pool_client_id" {
  description = "ID of the Cognito User Pool Client"
  value       = aws_cognito_user_pool_client.main.id
}

output "user_pool_client_name" {
  description = "Name of the Cognito User Pool Client"
  value       = aws_cognito_user_pool_client.main.name
}

# User Pool Domain outputs
output "user_pool_domain" {
  description = "Domain prefix of the Cognito User Pool"
  value       = aws_cognito_user_pool_domain.main.domain
}

output "user_pool_hosted_ui_url" {
  description = "Complete URL for the Cognito Hosted UI"
  value       = "https://${aws_cognito_user_pool_domain.main.domain}.auth.${data.aws_region.current.name}.amazoncognito.com"
}

output "user_pool_login_url" {
  description = "Complete login URL for the Cognito Hosted UI"
  value = length(var.callback_urls) > 0 ? "https://${aws_cognito_user_pool_domain.main.domain}.auth.${data.aws_region.current.name}.amazoncognito.com/login?client_id=${aws_cognito_user_pool_client.main.id}&response_type=code&scope=email+openid+profile&redirect_uri=${var.callback_urls[0]}" : ""
}

# Identity Pool outputs (DISABLED for AWS Academy)
output "identity_pool_id" {
  description = "ID of the Cognito Identity Pool (disabled in AWS Academy)"
  value       = null # var.enable_identity_pool ? aws_cognito_identity_pool.main[0].id : null
}

output "identity_pool_arn" {
  description = "ARN of the Cognito Identity Pool (disabled in AWS Academy)"
  value       = null # var.enable_identity_pool ? aws_cognito_identity_pool.main[0].arn : null
}

# IAM Role outputs (DISABLED for AWS Academy)
output "authenticated_role_arn" {
  description = "ARN of the IAM role for authenticated users (disabled in AWS Academy)"
  value       = null # var.enable_identity_pool ? aws_iam_role.authenticated[0].arn : null
}

# Configuration outputs for frontend
output "cognito_config" {
  description = "Cognito configuration object for frontend applications (AWS Academy compatible)"
  value = {
    region         = data.aws_region.current.name
    userPoolId     = aws_cognito_user_pool.main.id
    userPoolWebClientId = aws_cognito_user_pool_client.main.id
    domain         = aws_cognito_user_pool_domain.main.domain
    hostedUIUrl    = "https://${aws_cognito_user_pool_domain.main.domain}.auth.${data.aws_region.current.name}.amazoncognito.com"
    # Identity Pool disabled for AWS Academy
    identityPoolId = null
    oauth = {
      domain       = "${aws_cognito_user_pool_domain.main.domain}.auth.${data.aws_region.current.name}.amazoncognito.com"
      scope        = ["email", "openid", "profile"]
      redirectSignIn  = var.callback_urls
      redirectSignOut = var.logout_urls
      responseType    = "code"
    }
    # Note: Callback URLs should point to API Gateway endpoint, not S3
    callbackStrategy = "api-gateway-lambda"
    # Authentication flow for AWS Academy Labs:
    # 1. Frontend redirects to Cognito Hosted UI
    # 2. Cognito redirects to API Gateway /auth/callback endpoint
    # 3. Lambda processes code and redirects to frontend with tokens
    # 4. Frontend stores tokens and uses them for API calls
  }
}

# Data source for current AWS region
data "aws_region" "current" {}