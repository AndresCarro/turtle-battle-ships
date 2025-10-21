# General Configuration
variable "name" {
  description = "Base name for RDS resources"
  type        = string
}

variable "region" {
  description = "AWS region"
  type        = string
}

variable "role_arn" {
  description = "IAM role ARN to use for RDS Proxy (required for AWS Academy/Learner Lab)"
  type        = string
}

variable "tags" {
  description = "Common tags to apply to all RDS resources"
  type        = map(string)
  default     = {}
}

# Network Configuration
variable "vpc_id" {
  description = "VPC ID where RDS instances will be created"
  type        = string
}

variable "subnet_ids" {
  description = "List of subnet IDs for RDS subnet group (should be in different AZs)"
  type        = list(string)
}

variable "allowed_security_groups" {
  description = "List of security group IDs allowed to access RDS"
  type        = list(string)
  default     = []
}

variable "publicly_accessible" {
  description = "Whether the RDS instances should be publicly accessible"
  type        = bool
  default     = false
}

# Database Engine Configuration
variable "engine" {
  description = "Database engine (postgres, mysql, mariadb, etc.)"
  type        = string
  default     = "postgres"
}

variable "engine_version" {
  description = "Database engine version"
  type        = string
  default     = "15.4"
}

variable "instance_class" {
  description = "Instance class for primary database"
  type        = string
  default     = "db.t3.micro"
}

variable "database_name" {
  description = "Name of the initial database"
  type        = string
}

variable "master_username" {
  description = "Master username for the database"
  type        = string
  default     = "dbadmin"
}

variable "port" {
  description = "Database port"
  type        = number
  default     = 5432
}

# Storage Configuration
variable "allocated_storage" {
  description = "Initial allocated storage in GB"
  type        = number
  default     = 20
}

variable "max_allocated_storage" {
  description = "Maximum storage for autoscaling in GB"
  type        = number
  default     = 100
}

variable "storage_type" {
  description = "Storage type (gp2, gp3, io1, io2)"
  type        = string
  default     = "gp3"
}

variable "storage_encrypted" {
  description = "Enable storage encryption"
  type        = bool
  default     = true
}

variable "kms_key_id" {
  description = "KMS key ID for encryption (optional, uses default if not specified)"
  type        = string
  default     = null
}

# High Availability Configuration
variable "multi_az" {
  description = "Enable multi-AZ deployment for high availability"
  type        = bool
  default     = false
}

# Backup Configuration
variable "backup_retention_period" {
  description = "Number of days to retain backups (0-35)"
  type        = number
  default     = 7
}

variable "backup_window" {
  description = "Preferred backup window (UTC)"
  type        = string
  default     = "03:00-04:00"
}

variable "maintenance_window" {
  description = "Preferred maintenance window (UTC)"
  type        = string
  default     = "mon:04:00-mon:05:00"
}

variable "skip_final_snapshot" {
  description = "Skip final snapshot when destroying database"
  type        = bool
  default     = false
}

# Read Replica Configuration
variable "create_read_replica" {
  description = "Whether to create a read replica"
  type        = bool
  default     = true
}

variable "replica_instance_class" {
  description = "Instance class for read replica (uses primary instance class if not specified)"
  type        = string
  default     = null
}

variable "replica_backup_retention_period" {
  description = "Backup retention period for read replica (enables promotion capability)"
  type        = number
  default     = 7
}

# Monitoring Configuration
variable "enabled_cloudwatch_logs_exports" {
  description = "List of log types to export to CloudWatch (postgresql: postgresql, upgrade)"
  type        = list(string)
  default     = []
}

variable "monitoring_interval" {
  description = "Enhanced monitoring interval in seconds (0, 1, 5, 10, 15, 30, 60)"
  type        = number
  default     = 0
}

variable "monitoring_role_arn" {
  description = "IAM role ARN for enhanced monitoring"
  type        = string
  default     = null
}

variable "performance_insights_enabled" {
  description = "Enable Performance Insights"
  type        = bool
  default     = false
}

variable "performance_insights_retention" {
  description = "Performance Insights retention period in days (7 or 731)"
  type        = number
  default     = 7
}

# Database Configuration
variable "parameter_group_name" {
  description = "Name of DB parameter group (optional)"
  type        = string
  default     = null
}

variable "option_group_name" {
  description = "Name of DB option group (optional)"
  type        = string
  default     = null
}

variable "auto_minor_version_upgrade" {
  description = "Enable automatic minor version upgrades"
  type        = bool
  default     = true
}

variable "deletion_protection" {
  description = "Enable deletion protection"
  type        = bool
  default     = false
}

# RDS Proxy Configuration
variable "create_rds_proxy" {
  description = "Whether to create RDS Proxy"
  type        = bool
  default     = true
}

variable "proxy_engine_family" {
  description = "Engine family for RDS Proxy (MYSQL, POSTGRESQL, SQLSERVER)"
  type        = string
  default     = "POSTGRESQL"
}

variable "proxy_iam_auth" {
  description = "Enable IAM authentication for RDS Proxy"
  type        = string
  default     = "DISABLED"
}

variable "proxy_require_tls" {
  description = "Require TLS for RDS Proxy connections"
  type        = bool
  default     = false
}

variable "proxy_debug_logging" {
  description = "Enable debug logging for RDS Proxy"
  type        = bool
  default     = false
}

variable "proxy_idle_client_timeout" {
  description = "Idle client timeout in seconds for RDS Proxy"
  type        = number
  default     = 1800
}

variable "proxy_connection_borrow_timeout" {
  description = "Connection borrow timeout in seconds"
  type        = number
  default     = 120
}

variable "proxy_max_connections_percent" {
  description = "Maximum connections percent for connection pool"
  type        = number
  default     = 100
}

variable "proxy_max_idle_connections_percent" {
  description = "Maximum idle connections percent for connection pool"
  type        = number
  default     = 50
}

variable "proxy_session_pinning_filters" {
  description = "Session pinning filters for RDS Proxy"
  type        = list(string)
  default     = []
}

variable "proxy_include_read_replica" {
  description = "Include read replica in RDS Proxy target group"
  type        = bool
  default     = false
}
