# Cognito User Pool
resource "aws_cognito_user_pool" "main" {
  name = "${var.project_name}-user-pool"

  # Password policy
  password_policy {
    minimum_length                   = var.user_pool_password_policy.minimum_length
    require_lowercase                = var.user_pool_password_policy.require_lowercase
    require_numbers                  = var.user_pool_password_policy.require_numbers
    require_symbols                  = var.user_pool_password_policy.require_symbols
    require_uppercase                = var.user_pool_password_policy.require_uppercase
    temporary_password_validity_days = var.user_pool_password_policy.temporary_password_validity_days
  }

  # Username configuration - allow email as username
  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  # Account recovery
  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  # Email configuration
  email_configuration {
    email_sending_account = "COGNITO_DEFAULT"
  }

  # Schema for user attributes
  schema {
    attribute_data_type = "String"
    name                = "email"
    required            = true
    mutable             = true

    string_attribute_constraints {
      min_length = 1
      max_length = 256
    }
  }

  schema {
    attribute_data_type = "String"
    name                = "name"
    required            = false
    mutable             = true

    string_attribute_constraints {
      min_length = 1
      max_length = 256
    }
  }

  # User pool add-ons
  user_pool_add_ons {
    advanced_security_mode = "OFF" # Set to "ENFORCED" for production
  }

  # Prevent username enumeration attacks
  username_configuration {
    case_sensitive = false
  }

  # Admin create user config
  admin_create_user_config {
    allow_admin_create_user_only = false
  }

  # Device configuration
  device_configuration {
    challenge_required_on_new_device      = false
    device_only_remembered_on_user_prompt = false
  }

  # Verification message template
  verification_message_template {
    default_email_option = "CONFIRM_WITH_CODE"
    email_subject        = "Your verification code for ${var.project_name}"
    email_message        = "Your verification code is {####}"
  }

  tags = merge(var.tags, {
    Name        = "${var.project_name}-user-pool"
    Component   = "cognito"
    Description = "User pool for ${var.project_name} authentication"
  })
}

# Cognito User Pool Client
resource "aws_cognito_user_pool_client" "main" {
  name         = "${var.project_name}-app-client"
  user_pool_id = aws_cognito_user_pool.main.id

  # Client configuration for SPA (Single Page Application)
  generate_secret                      = false # No secret for public clients (SPAs)
  refresh_token_validity               = 30    # 30 days
  access_token_validity                = 60    # 60 minutes
  id_token_validity                    = 60    # 60 minutes
  token_validity_units {
    access_token  = "minutes"
    id_token      = "minutes"
    refresh_token = "days"
  }

  # OAuth flows
  allowed_oauth_flows                  = ["code", "implicit"]
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_scopes                 = ["email", "openid", "profile"]

  # Callback and logout URLs
  callback_urls = var.callback_urls
  logout_urls   = var.logout_urls

  # Supported identity providers
  supported_identity_providers = ["COGNITO"]

  # Prevent user existence errors
  prevent_user_existence_errors = "ENABLED"

  # Enable SRP authentication flow
  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_PASSWORD_AUTH" # Allow for testing, remove in production
  ]

  # Read and write attributes
  read_attributes = [
    "email",
    "email_verified",
    "name"
  ]

  write_attributes = [
    "email",
    "name"
  ]
}

# Cognito User Pool Domain
resource "aws_cognito_user_pool_domain" "main" {
  domain       = "${var.project_name}-${random_string.domain_suffix.result}"
  user_pool_id = aws_cognito_user_pool.main.id
}

# Random string for unique domain naming
resource "random_string" "domain_suffix" {
  length  = 8
  special = false
  upper   = false
}

# Cognito Identity Pool (DISABLED for AWS Academy Labs)
# AWS Academy Labs don't allow IAM role creation (iam:CreateRole)
# This section is commented out but can be enabled in production environments
/*
resource "aws_cognito_identity_pool" "main" {
  count                            = var.enable_identity_pool ? 1 : 0
  identity_pool_name               = "${var.project_name}_identity_pool"
  allow_unauthenticated_identities = false

  cognito_identity_providers {
    client_id               = aws_cognito_user_pool_client.main.id
    provider_name           = aws_cognito_user_pool.main.endpoint
    server_side_token_check = false
  }

  tags = merge(var.tags, {
    Name        = "${var.project_name}-identity-pool"
    Component   = "cognito"
    Description = "Identity pool for ${var.project_name} AWS access"
  })
}
*/

# IAM Role for authenticated users (DISABLED for AWS Academy Labs)
# AWS Academy Labs use LabRole instead of custom IAM roles
/*
resource "aws_iam_role" "authenticated" {
  count = var.enable_identity_pool ? 1 : 0
  name  = "${var.project_name}-cognito-authenticated-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRoleWithWebIdentity"
        Effect = "Allow"
        Principal = {
          Federated = "cognito-identity.amazonaws.com"
        }
        Condition = {
          StringEquals = {
            "cognito-identity.amazonaws.com:aud" = aws_cognito_identity_pool.main[0].id
          }
          "ForAnyValue:StringLike" = {
            "cognito-identity.amazonaws.com:amr" = "authenticated"
          }
        }
      }
    ]
  })

  tags = merge(var.tags, {
    Name        = "${var.project_name}-cognito-authenticated-role"
    Component   = "cognito"
    Description = "IAM role for authenticated Cognito users"
  })
}

# IAM Policy for authenticated users
resource "aws_iam_role_policy" "authenticated" {
  count = var.enable_identity_pool ? 1 : 0
  name  = "${var.project_name}-cognito-authenticated-policy"
  role  = aws_iam_role.authenticated[0].id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "mobileanalytics:PutEvents",
          "cognito-sync:*",
          "cognito-identity:*"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "execute-api:Invoke"
        ]
        Resource = "*" # Restrict to specific API Gateway ARNs in production
      }
    ]
  })
}

# Attach roles to identity pool
resource "aws_cognito_identity_pool_roles_attachment" "main" {
  count            = var.enable_identity_pool ? 1 : 0
  identity_pool_id = aws_cognito_identity_pool.main[0].id

  roles = {
    "authenticated" = aws_iam_role.authenticated[0].arn
  }

  depends_on = [aws_cognito_identity_pool.main, aws_iam_role.authenticated]
}
*/