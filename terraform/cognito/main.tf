# Data source for current AWS region
data "aws_region" "current" {}

# Cognito User Pool
resource "aws_cognito_user_pool" "main" {
  name = "${var.project_name}-user-pool"

  # Allow users to sign in using email
  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  # Password policy
  password_policy {
    minimum_length                   = 8
    require_lowercase                = true
    require_numbers                  = true
    require_symbols                  = true
    require_uppercase                = true
    temporary_password_validity_days = 7
  }

  # Account recovery
  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  # User pool policies
  admin_create_user_config {
    allow_admin_create_user_only = false
    
    invite_message_template {
      email_message = "Your username is {username} and temporary password is {####}."
      email_subject = "Your temporary password"
      sms_message   = "Your username is {username} and temporary password is {####}."
    }
  }

  # Email configuration
  email_configuration {
    email_sending_account = "COGNITO_DEFAULT"
  }

  # User attributes
  schema {
    attribute_data_type = "String"
    name                = "email"
    required            = true
    mutable             = true
  }

  schema {
    attribute_data_type = "String"
    name                = "name"
    required            = true
    mutable             = true
  }

  # Device tracking
  device_configuration {
    challenge_required_on_new_device      = false
    device_only_remembered_on_user_prompt = false
  }

  # MFA configuration
  mfa_configuration = "OFF"

  # User pool add-ons
  user_pool_add_ons {
    advanced_security_mode = "OFF"
  }

  tags = var.tags
}

# Cognito User Pool Domain
resource "aws_cognito_user_pool_domain" "main" {
  domain       = "${var.project_name}-auth-${random_string.domain_suffix.result}"
  user_pool_id = aws_cognito_user_pool.main.id
}

# Random string for unique domain
resource "random_string" "domain_suffix" {
  length  = 8
  special = false
  upper   = false
}

# Cognito User Pool Client (App Client)
resource "aws_cognito_user_pool_client" "main" {
  name         = "${var.project_name}-app-client"
  user_pool_id = aws_cognito_user_pool.main.id

  # OAuth settings
  generate_secret                      = false  # For SPA, we don't use client secret
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_flows                  = ["code", "implicit"]
  allowed_oauth_scopes                 = ["email", "openid", "profile"]
  
  # Callback URLs - estas las vas a tener que ajustar según tu setup
  callback_urls = var.callback_urls
  logout_urls   = var.logout_urls

  # Token validity
  access_token_validity                = 60    # 1 hour
  id_token_validity                    = 60    # 1 hour  
  refresh_token_validity               = 30    # 30 days
  token_validity_units {
    access_token  = "minutes"
    id_token      = "minutes"
    refresh_token = "days"
  }

  # Authentication flows
  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_PASSWORD_AUTH"
  ]

  # Prevent user existence errors
  prevent_user_existence_errors = "ENABLED"

  # Supported identity providers
  supported_identity_providers = ["COGNITO"]

  # Read/write attributes
  read_attributes = [
    "email",
    "email_verified",
    "name",
    "preferred_username"
  ]

  write_attributes = [
    "email",
    "name",
    "preferred_username"
  ]
}

# Note: Identity Pool and IAM roles are commented out due to AWS Lab limitations
# AWS Academy Labs don't allow creating IAM roles, so we use only User Pool
# 
# For production environments, uncomment the following resources:
# 
# # Identity Pool for unauth/auth access
# resource "aws_cognito_identity_pool" "main" {
#   identity_pool_name               = "${var.project_name}-identity-pool"
#   allow_unauthenticated_identities = false
#
#   cognito_identity_providers {
#     client_id               = aws_cognito_user_pool_client.main.id
#     provider_name           = aws_cognito_user_pool.main.endpoint
#     server_side_token_check = false
#   }
#
#   tags = var.tags
# }
#
# # IAM roles for identity pool
# resource "aws_iam_role" "authenticated" {
#   name = "${var.project_name}-cognito-authenticated-role"
#
#   assume_role_policy = jsonencode({
#     Version = "2012-10-17"
#     Statement = [
#       {
#         Effect = "Allow"
#         Principal = {
#           Federated = "cognito-identity.amazonaws.com"
#         }
#         Action = "sts:AssumeRoleWithWebIdentity"
#         Condition = {
#           StringEquals = {
#             "cognito-identity.amazonaws.com:aud" = aws_cognito_identity_pool.main.id
#           }
#           "ForAnyValue:StringLike" = {
#             "cognito-identity.amazonaws.com:amr" = "authenticated"
#           }
#         }
#       }
#     ]
#   })
#
#   tags = var.tags
# }
#
# # IAM policy for authenticated users
# resource "aws_iam_role_policy" "authenticated" {
#   name = "${var.project_name}-cognito-authenticated-policy"
#   role = aws_iam_role.authenticated.id
#
#   policy = jsonencode({
#     Version = "2012-10-17"
#     Statement = [
#       {
#         Effect = "Allow"
#         Action = [
#           "cognito-sync:*",
#           "cognito-identity:*"
#         ]
#         Resource = "*"
#       }
#     ]
#   })
# }
#
# # Attach the roles to the identity pool
# resource "aws_cognito_identity_pool_roles_attachment" "main" {
#   identity_pool_id = aws_cognito_identity_pool.main.id
#
#   roles = {
#     authenticated = aws_iam_role.authenticated.arn
#   }
# }