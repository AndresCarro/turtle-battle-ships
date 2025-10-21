# DB Subnet Group - required for RDS instances
resource "aws_db_subnet_group" "this" {
  name       = "${var.name}-subnet-group"
  subnet_ids = var.subnet_ids

  tags = merge(
    var.tags,
    {
      Name = "${var.name}-subnet-group"
    }
  )
}

# Security Group for RDS instances
resource "aws_security_group" "rds" {
  name        = "${var.name}-rds-sg"
  description = "Security group for RDS database instances"
  vpc_id      = var.vpc_id

  ingress {
    description = "Allow database access from application security groups"
    from_port   = var.port
    to_port     = var.port
    protocol    = "tcp"
    security_groups = var.allowed_security_groups
  }

  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(
    var.tags,
    {
      Name = "${var.name}-rds-sg"
    }
  )
}

# Random password generation for master user
resource "random_password" "master" {
  length  = 16
  special = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

# Store password in SSM Parameter Store (simpler than Secrets Manager for college projects)
resource "aws_ssm_parameter" "db_password" {
  name        = "/${var.name}/db-password"
  description = "Database password for ${var.name}"
  type        = "SecureString"
  value       = random_password.master.result

  tags = merge(
    var.tags,
    {
      Name = "${var.name}-db-password"
    }
  )
}

# Primary RDS instance (read/write)
resource "aws_db_instance" "primary" {
  identifier     = "${var.name}-primary"
  engine         = var.engine
  engine_version = var.engine_version
  instance_class = var.instance_class

  allocated_storage     = var.allocated_storage
  max_allocated_storage = var.max_allocated_storage
  storage_type          = var.storage_type
  storage_encrypted     = var.storage_encrypted
  kms_key_id            = var.kms_key_id

  db_name  = var.database_name
  username = var.master_username
  password = random_password.master.result
  port     = var.port

  db_subnet_group_name   = aws_db_subnet_group.this.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  # High availability and backup configuration
  multi_az               = var.multi_az
  backup_retention_period = var.backup_retention_period
  backup_window          = var.backup_window
  maintenance_window     = var.maintenance_window
  
  # Enable automated backups for read replica creation
  skip_final_snapshot       = var.skip_final_snapshot
  final_snapshot_identifier = var.skip_final_snapshot ? null : "${var.name}-final-snapshot-${formatdate("YYYY-MM-DD-hhmm", timestamp())}"
  copy_tags_to_snapshot     = true

  # Performance and monitoring
  enabled_cloudwatch_logs_exports = var.enabled_cloudwatch_logs_exports
  monitoring_interval             = var.monitoring_interval
  monitoring_role_arn             = var.monitoring_role_arn
  performance_insights_enabled    = var.performance_insights_enabled
  performance_insights_retention_period = var.performance_insights_enabled ? var.performance_insights_retention : null

  # Parameter and option groups
  parameter_group_name = var.parameter_group_name
  option_group_name    = var.option_group_name

  # Auto minor version upgrade
  auto_minor_version_upgrade = var.auto_minor_version_upgrade

  # Deletion protection
  deletion_protection = var.deletion_protection

  # Public access - typically false for security
  publicly_accessible = var.publicly_accessible

  tags = merge(
    var.tags,
    {
      Name = "${var.name}-primary"
      Role = "primary"
    }
  )
}

# Read Replica (for read scaling and failover)
resource "aws_db_instance" "read_replica" {
  count = var.create_read_replica ? 1 : 0

  identifier             = "${var.name}-read-replica"
  replicate_source_db    = aws_db_instance.primary.identifier
  instance_class         = var.replica_instance_class != null ? var.replica_instance_class : var.instance_class

  # Storage configuration is inherited from primary
  storage_encrypted = var.storage_encrypted
  kms_key_id        = var.kms_key_id

  # Network configuration
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = var.publicly_accessible

  # Replica can be promoted to standalone instance
  backup_retention_period = var.replica_backup_retention_period
  skip_final_snapshot    = var.skip_final_snapshot
  final_snapshot_identifier = var.skip_final_snapshot ? null : "${var.name}-replica-final-snapshot-${formatdate("YYYY-MM-DD-hhmm", timestamp())}"

  # Performance and monitoring
  enabled_cloudwatch_logs_exports = var.enabled_cloudwatch_logs_exports
  monitoring_interval             = var.monitoring_interval
  monitoring_role_arn             = var.monitoring_role_arn
  performance_insights_enabled    = var.performance_insights_enabled
  performance_insights_retention_period = var.performance_insights_enabled ? var.performance_insights_retention : null

  # Auto minor version upgrade
  auto_minor_version_upgrade = var.auto_minor_version_upgrade

  tags = merge(
    var.tags,
    {
      Name = "${var.name}-read-replica"
      Role = "read-replica"
    }
  )

  depends_on = [aws_db_instance.primary]
}

# Security Group for RDS Proxy
resource "aws_security_group" "rds_proxy" {
  count = var.create_rds_proxy ? 1 : 0

  name        = "${var.name}-rds-proxy-sg"
  description = "Security group for RDS Proxy"
  vpc_id      = var.vpc_id

  ingress {
    description = "Allow database access from application security groups"
    from_port   = var.port
    to_port     = var.port
    protocol    = "tcp"
    security_groups = var.allowed_security_groups
  }

  egress {
    description = "Allow connection to RDS instances"
    from_port   = var.port
    to_port     = var.port
    protocol    = "tcp"
    security_groups = [aws_security_group.rds.id]
  }

  tags = merge(
    var.tags,
    {
      Name = "${var.name}-rds-proxy-sg"
    }
  )
}

# Allow RDS Proxy to connect to RDS instances
resource "aws_security_group_rule" "rds_from_proxy" {
  count = var.create_rds_proxy ? 1 : 0

  type                     = "ingress"
  from_port                = var.port
  to_port                  = var.port
  protocol                 = "tcp"
  security_group_id        = aws_security_group.rds.id
  source_security_group_id = aws_security_group.rds_proxy[0].id
  description              = "Allow access from RDS Proxy"
}

# Note: Using provided IAM role (LabRole) instead of creating one
# AWS Academy/Learner Lab accounts don't have permission to create IAM roles

# Store credentials in a secret for RDS Proxy (required by RDS Proxy)
resource "aws_secretsmanager_secret" "proxy_credentials" {
  count = var.create_rds_proxy ? 1 : 0

  name                    = "${var.name}-proxy-credentials"
  description             = "RDS Proxy credentials for ${var.name}"
  recovery_window_in_days = 0  # Immediate deletion for college project

  tags = merge(
    var.tags,
    {
      Name = "${var.name}-proxy-credentials"
    }
  )
}

resource "aws_secretsmanager_secret_version" "proxy_credentials" {
  count = var.create_rds_proxy ? 1 : 0

  secret_id = aws_secretsmanager_secret.proxy_credentials[0].id
  secret_string = jsonencode({
    username = var.master_username
    password = random_password.master.result
  })
}

# Note: IAM policies are managed by LabRole, which already has necessary permissions
# for Secrets Manager and KMS access

# RDS Proxy
resource "aws_db_proxy" "this" {
  count = var.create_rds_proxy ? 1 : 0

  name                   = "${var.name}-proxy"
  engine_family          = var.proxy_engine_family
  auth {
    auth_scheme = "SECRETS"
    iam_auth    = var.proxy_iam_auth
    secret_arn  = aws_secretsmanager_secret.proxy_credentials[0].arn
  }

  role_arn               = var.role_arn
  vpc_subnet_ids         = var.subnet_ids
  vpc_security_group_ids = [aws_security_group.rds_proxy[0].id]

  require_tls            = var.proxy_require_tls
  debug_logging          = var.proxy_debug_logging

  # Connection pool configuration
  idle_client_timeout = var.proxy_idle_client_timeout

  tags = merge(
    var.tags,
    {
      Name = "${var.name}-proxy"
    }
  )

  depends_on = [
    aws_secretsmanager_secret_version.proxy_credentials
  ]
}

# RDS Proxy Target Group - attach primary instance
resource "aws_db_proxy_default_target_group" "this" {
  count = var.create_rds_proxy ? 1 : 0

  db_proxy_name = aws_db_proxy.this[0].name

  connection_pool_config {
    connection_borrow_timeout    = var.proxy_connection_borrow_timeout
    max_connections_percent      = var.proxy_max_connections_percent
    max_idle_connections_percent = var.proxy_max_idle_connections_percent
    session_pinning_filters      = var.proxy_session_pinning_filters
  }
}

# Attach primary RDS instance to proxy
resource "aws_db_proxy_target" "primary" {
  count = var.create_rds_proxy ? 1 : 0

  db_proxy_name          = aws_db_proxy.this[0].name
  target_group_name      = aws_db_proxy_default_target_group.this[0].name
  db_instance_identifier = aws_db_instance.primary.identifier
}

# Optionally attach read replica to proxy
resource "aws_db_proxy_target" "read_replica" {
  count = var.create_rds_proxy && var.create_read_replica && var.proxy_include_read_replica ? 1 : 0

  db_proxy_name          = aws_db_proxy.this[0].name
  target_group_name      = aws_db_proxy_default_target_group.this[0].name
  db_instance_identifier = aws_db_instance.read_replica[0].identifier
}
