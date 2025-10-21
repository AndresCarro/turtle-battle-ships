# RDS Module

This Terraform module creates a complete AWS RDS setup with:

- **Primary RDS Instance** (read/write operations)
- **Read Replica** (optional, for read scaling and automatic failover)
- **RDS Proxy** (optional, for connection pooling and improved resilience)

## Features

### Primary RDS Instance

- Multi-AZ deployment support for high availability
- Automated backups with configurable retention
- Storage encryption with KMS
- Storage autoscaling
- Performance Insights (optional)
- CloudWatch log exports
- Enhanced monitoring

### Read Replica

- Asynchronous replication from primary instance
- Can be promoted to standalone instance
- Independent backup configuration
- Helps distribute read traffic
- Provides automatic failover capability

### RDS Proxy

- Connection pooling to reduce database load
- Automatic failover with minimal disruption
- IAM authentication support
- TLS encryption support
- Secrets Manager integration for credential management
- Configurable connection pool settings

### Security

- Dedicated security groups for RDS instances and proxy
- Credentials stored in AWS SSM Parameter Store (simpler alternative)
- Automatic password generation
- Network isolation in private subnets
- Optional public accessibility
- **Note**: RDS Proxy still requires a minimal Secrets Manager secret (AWS requirement)

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Application Layer                      │
│                  (Lambda, ECS, EC2, etc.)                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ (Optional)
                     ▼
          ┌──────────────────────┐
          │     RDS Proxy        │
          │  (Connection Pool)   │
          └──────────┬───────────┘
                     │
          ┌──────────┴───────────┐
          │                      │
          ▼                      ▼
  ┌──────────────┐      ┌──────────────┐
  │   Primary    │────▶ │Read Replica  │
  │ RDS Instance │      │ RDS Instance │
  │ (Read/Write) │      │ (Read Only)  │
  └──────────────┘      └──────────────┘
      Multi-AZ              Failover
```

## Usage

### Basic Example

```hcl
module "rds" {
  source = "./rds"

  name              = "myapp-db"
  region            = "us-east-1"
  database_name     = "myappdb"
  master_username   = "dbadmin"

  # Network configuration
  vpc_id            = module.vpc.vpc_id
  subnet_ids        = [
    module.vpc.subnets["private-1"],
    module.vpc.subnets["private-2"]
  ]

  allowed_security_groups = [
    module.backend.security_group_id,
    module.lambda.security_group_id
  ]

  # Database configuration
  engine            = "postgres"
  engine_version    = "15.4"
  instance_class    = "db.t3.micro"
  allocated_storage = 20

  # High availability
  multi_az              = true
  create_read_replica   = true

  # RDS Proxy
  create_rds_proxy      = true
  proxy_engine_family   = "POSTGRESQL"

  tags = {
    Environment = "production"
    Project     = "myapp"
  }
}
```

### Production Example with All Features

```hcl
module "rds_production" {
  source = "./rds"

  name              = "production-db"
  region            = "us-east-1"
  database_name     = "proddb"
  master_username   = "admin"

  # Network configuration
  vpc_id            = module.vpc.vpc_id
  subnet_ids        = module.vpc.private_subnet_ids
  allowed_security_groups = [
    module.app.security_group_id
  ]

  # Database engine
  engine            = "postgres"
  engine_version    = "15.4"
  instance_class    = "db.r6g.xlarge"
  port              = 5432

  # Storage configuration
  allocated_storage     = 100
  max_allocated_storage = 1000
  storage_type          = "gp3"
  storage_encrypted     = true

  # High availability
  multi_az              = true
  create_read_replica   = true
  replica_instance_class = "db.r6g.large"

  # Backup configuration
  backup_retention_period = 30
  backup_window          = "03:00-04:00"
  maintenance_window     = "mon:04:00-mon:05:00"
  skip_final_snapshot    = false

  # Monitoring
  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]
  monitoring_interval             = 60
  monitoring_role_arn            = aws_iam_role.rds_monitoring.arn
  performance_insights_enabled   = true
  performance_insights_retention = 7

  # Security
  deletion_protection = true

  # RDS Proxy configuration
  create_rds_proxy                  = true
  proxy_engine_family               = "POSTGRESQL"
  proxy_require_tls                 = true
  proxy_iam_auth                    = "REQUIRED"
  proxy_max_connections_percent     = 90
  proxy_max_idle_connections_percent = 50
  proxy_connection_borrow_timeout   = 120
  proxy_include_read_replica        = true

  tags = {
    Environment = "production"
    Compliance  = "required"
    Backup      = "daily"
  }
}
```

### Development/Testing Example

```hcl
module "rds_dev" {
  source = "./rds"

  name              = "dev-db"
  region            = "us-east-1"
  database_name     = "devdb"
  master_username   = "devuser"

  vpc_id            = module.vpc.vpc_id
  subnet_ids        = module.vpc.private_subnet_ids
  allowed_security_groups = [module.app.security_group_id]

  # Minimal configuration for cost savings
  engine                  = "postgres"
  engine_version          = "15.4"
  instance_class          = "db.t3.micro"
  allocated_storage       = 20
  max_allocated_storage   = 50

  # No read replica for dev
  create_read_replica     = false

  # No RDS Proxy for dev
  create_rds_proxy        = false

  # Minimal backups
  backup_retention_period = 1
  skip_final_snapshot     = true

  # No high availability
  multi_az                = false
  deletion_protection     = false

  tags = {
    Environment = "development"
  }
}
```

## Accessing the Database

### Using RDS Proxy (Recommended)

```hcl
# Get connection details from module outputs
output "db_connection" {
  value = {
    host           = module.rds.proxy_endpoint
    port           = module.rds.primary_instance_port
    database       = module.rds.database_name
    username       = module.rds.master_username
    password_param = module.rds.db_password_ssm_parameter
  }
  sensitive = true
}
```

### Direct Connection to Primary Instance

```hcl
output "db_connection_direct" {
  value = {
    host     = module.rds.primary_instance_address
    port     = module.rds.primary_instance_port
    database = module.rds.database_name
  }
}
```

### Connection for Read-Only Queries

```hcl
output "db_read_endpoint" {
  value = {
    host = module.rds.read_endpoint
    port = module.rds.primary_instance_port
  }
}
```

## Retrieving Database Credentials

The database password is automatically generated and stored in AWS Systems Manager (SSM) Parameter Store:

```bash
# Using AWS CLI to get password
aws ssm get-parameter \
  --name "/<db-name>/db-password" \
  --with-decryption \
  --query Parameter.Value \
  --output text

# Or use Terraform output (for development only - mark as sensitive)
terraform output -raw rds_db_password

# In application code (Node.js example)
const AWS = require('aws-sdk');
const ssm = new AWS.SSM();

const password = await ssm.getParameter({
  Name: process.env.DB_PASSWORD_PARAM,
  WithDecryption: true
}).promise();

const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: password.Parameter.Value
};
```

### For Applications Using Direct Connection

```javascript
// Node.js with pg (PostgreSQL)
import { Pool } from "pg";
import { SSM } from "aws-sdk";

const ssm = new SSM();

async function getDatabaseConfig() {
  const password = await ssm
    .getParameter({
      Name: process.env.DB_PASSWORD_PARAM,
      WithDecryption: true,
    })
    .promise();

  return {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: password.Parameter.Value,
    ssl: { rejectUnauthorized: false },
  };
}

const pool = new Pool(await getDatabaseConfig());
```

## Variables

### Required Variables

| Name            | Description                                           | Type           |
| --------------- | ----------------------------------------------------- | -------------- |
| `name`          | Base name for RDS resources                           | `string`       |
| `region`        | AWS region                                            | `string`       |
| `database_name` | Name of the initial database                          | `string`       |
| `vpc_id`        | VPC ID where RDS will be created                      | `string`       |
| `subnet_ids`    | List of subnet IDs for RDS (minimum 2, different AZs) | `list(string)` |

### Optional Variables

See [variables.tf](./variables.tf) for complete list of optional variables with descriptions and defaults.

Key optional variables:

- **Database Engine**: `engine`, `engine_version`, `instance_class`, `port`
- **Storage**: `allocated_storage`, `max_allocated_storage`, `storage_type`, `storage_encrypted`
- **High Availability**: `multi_az`, `create_read_replica`
- **Backups**: `backup_retention_period`, `backup_window`, `skip_final_snapshot`
- **Monitoring**: `performance_insights_enabled`, `enabled_cloudwatch_logs_exports`
- **RDS Proxy**: `create_rds_proxy`, `proxy_engine_family`, `proxy_require_tls`

## Outputs

### Primary Outputs

- `primary_instance_endpoint` - Connection endpoint for primary instance
- `primary_instance_address` - Hostname of primary instance
- `proxy_endpoint` - Connection endpoint for RDS Proxy (if enabled)
- `read_endpoint` - Endpoint for read-only queries
- `db_password_ssm_parameter` - Name of SSM parameter containing password
- `db_password` - Database password (sensitive output, for dev/testing only)
- `rds_security_group_id` - Security group ID for RDS instances

See [outputs.tf](./outputs.tf) for complete list of outputs.

## Supported Database Engines

- PostgreSQL (default)
- MySQL
- MariaDB
- Oracle
- SQL Server

For engines other than PostgreSQL, update the following variables:

- `engine` - Database engine name
- `engine_version` - Compatible version
- `port` - Default port for the engine
- `proxy_engine_family` - Compatible family for RDS Proxy

## Best Practices

### Security

1. Always use private subnets for RDS instances
2. Enable storage encryption (`storage_encrypted = true`)
3. Credentials stored in SSM Parameter Store (encrypted at rest)
4. Use least-privilege security group rules
5. Enable deletion protection for production (`deletion_protection = true`)
6. **Note**: For production, consider using AWS Secrets Manager with automatic rotation

### High Availability

1. Enable Multi-AZ for production workloads
2. Create read replicas for read scaling and failover
3. Use RDS Proxy for better failover handling
4. Configure appropriate backup retention

### Performance

1. Use RDS Proxy for connection pooling
2. Enable Performance Insights for troubleshooting
3. Use appropriate instance classes for your workload
4. Configure CloudWatch log exports for query analysis
5. Use read replicas to offload read traffic

### Cost Optimization

1. Use storage autoscaling to avoid over-provisioning
2. Disable read replicas in development environments
3. Disable RDS Proxy if not needed
4. Use appropriate instance classes (t3 for dev, r6g for prod)
5. Adjust backup retention based on requirements

## Troubleshooting

### Connection Issues

1. Check security group rules allow traffic from application
2. Verify subnets have proper routing
3. Ensure credentials are correct (check Secrets Manager)
4. Verify endpoint hostname and port

### Performance Issues

1. Enable Performance Insights
2. Check CloudWatch metrics
3. Review slow query logs
4. Consider scaling instance class
5. Add read replicas for read-heavy workloads

### Backup/Recovery

1. Test backup restoration regularly
2. Verify backup retention meets requirements
3. Consider enabling PITR for point-in-time recovery
4. Document recovery procedures

## Notes

- **Minimum 2 subnets** required in different availability zones
- **Read replicas** use asynchronous replication (eventual consistency)
- **RDS Proxy** requires Secrets Manager (AWS requirement, minimal secret created automatically)
- **Multi-AZ** provides synchronous replication and automatic failover
- **Passwords stored in SSM Parameter Store** (encrypted at rest with KMS)
- **Final snapshots** are created before deletion (unless disabled)
- **For college projects**: Simplified credential management, but less secure than Secrets Manager with rotation

## Example Integration with Application

```hcl
# Lambda function with RDS access
module "lambda" {
  source = "./lambda"

  function_name = "data-processor"

  environment_variables = {
    DB_HOST           = module.rds.primary_instance_address
    DB_PORT           = tostring(module.rds.primary_instance_port)
    DB_NAME           = module.rds.database_name
    DB_USER           = module.rds.master_username
    DB_PASSWORD_PARAM = module.rds.db_password_ssm_parameter
  }

  # Lambda needs access to RDS
  vpc_config = {
    subnet_ids = module.vpc.private_subnet_ids
    security_group_ids = [aws_security_group.lambda.id]
  }
}

# Security group rule to allow Lambda access to RDS
resource "aws_security_group_rule" "lambda_to_rds" {
  type                     = "egress"
  from_port                = module.rds.primary_instance_port
  to_port                  = module.rds.primary_instance_port
  protocol                 = "tcp"
  security_group_id        = aws_security_group.lambda.id
  source_security_group_id = module.rds.rds_security_group_id
}

# Lambda needs SSM permissions to read password
resource "aws_iam_role_policy" "lambda_ssm_access" {
  name = "lambda-ssm-db-password"
  role = aws_iam_role.lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ssm:GetParameter",
          "ssm:GetParameters"
        ]
        Resource = "arn:aws:ssm:${var.region}:${data.aws_caller_identity.current.account_id}:parameter${module.rds.db_password_ssm_parameter}"
      },
      {
        Effect = "Allow"
        Action = [
          "kms:Decrypt"
        ]
        Resource = "*"
        Condition = {
          StringEquals = {
            "kms:ViaService" = "ssm.${var.region}.amazonaws.com"
          }
        }
      }
    ]
  })
}
```

## License

This module is part of the Turtle Battleships project.
