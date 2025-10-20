# DynamoDB Table Module

This Terraform module creates a DynamoDB table with support for Global Secondary Indexes (GSI), encryption, Point-in-Time Recovery (PITR), and Time-to-Live (TTL).

## Features

- **Flexible Billing**: Support for both PAY_PER_REQUEST (on-demand) and PROVISIONED billing modes
- **Global Secondary Indexes**: Configure multiple GSIs with custom projection types
- **Encryption**: Optional server-side encryption with AWS-managed or customer-managed KMS keys
- **Point-in-Time Recovery**: Enable continuous backups for disaster recovery
- **Time-to-Live**: Automatic item expiration based on a TTL attribute
- **Custom Attributes**: Define multiple attributes with String, Number, or Binary types

## Usage

### Basic Table

```hcl
module "basic_table" {
  source = "./dynamodb"

  name         = "my-basic-table"
  billing_mode = "PAY_PER_REQUEST"
  partition_key = "id"

  attributes = [
    {
      name = "id"
      type = "S"
    }
  ]

  tags = {
    Environment = "dev"
    Project     = "my-project"
  }
}
```

### Table with Sort Key

```hcl
module "table_with_sort" {
  source = "./dynamodb"

  name         = "users-table"
  billing_mode = "PAY_PER_REQUEST"
  partition_key = "userId"
  sort_key      = "timestamp"

  attributes = [
    {
      name = "userId"
      type = "S"
    },
    {
      name = "timestamp"
      type = "N"
    }
  ]

  tags = {
    Environment = "prod"
    Project     = "user-management"
  }
}
```

### Table with Global Secondary Index

```hcl
module "table_with_gsi" {
  source = "./dynamodb"

  name         = "shots-table"
  billing_mode = "PAY_PER_REQUEST"
  partition_key = "gameId"
  sort_key      = "shotId"

  attributes = [
    {
      name = "gameId"
      type = "S"
    },
    {
      name = "shotId"
      type = "S"
    },
    {
      name = "playerId"
      type = "S"
    },
    {
      name = "timestamp"
      type = "N"
    }
  ]

  global_secondary_indexes = [
    {
      name               = "player-timestamp-index"
      partition_key      = "playerId"
      sort_key           = "timestamp"
      projection_type    = "ALL"
      non_key_attributes = []
    }
  ]

  tags = {
    Environment = "prod"
    Project     = "battleships-game"
  }
}
```

### Table with Encryption and PITR

```hcl
module "encrypted_table" {
  source = "./dynamodb"

  name         = "sensitive-data-table"
  billing_mode = "PAY_PER_REQUEST"
  partition_key = "id"

  attributes = [
    {
      name = "id"
      type = "S"
    }
  ]

  encryption = {
    enabled     = true
    kms_key_arn = "arn:aws:kms:us-east-1:123456789012:key/12345678-1234-1234-1234-123456789012"
  }

  point_in_time_recovery = {
    enabled = true
  }

  tags = {
    Environment = "prod"
    Compliance  = "HIPAA"
  }
}
```

### Table with TTL

```hcl
module "table_with_ttl" {
  source = "./dynamodb"

  name         = "sessions-table"
  billing_mode = "PAY_PER_REQUEST"
  partition_key = "sessionId"

  attributes = [
    {
      name = "sessionId"
      type = "S"
    }
  ]

  ttl = {
    enabled        = true
    attribute_name = "expirationTime"
  }

  tags = {
    Environment = "prod"
    Purpose     = "session-management"
  }
}
```

### Provisioned Capacity Table

```hcl
module "provisioned_table" {
  source = "./dynamodb"

  name         = "high-traffic-table"
  billing_mode = "PROVISIONED"
  partition_key = "id"

  attributes = [
    {
      name = "id"
      type = "S"
    }
  ]

  read_capacity  = 10
  write_capacity = 5

  tags = {
    Environment = "prod"
    Capacity    = "provisioned"
  }
}
```

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| `name` | Name of the DynamoDB table | `string` | n/a | yes |
| `billing_mode` | Billing mode (PAY_PER_REQUEST or PROVISIONED) | `string` | `"PAY_PER_REQUEST"` | no |
| `partition_key` | Name of the partition key attribute | `string` | n/a | yes |
| `sort_key` | Name of the sort key attribute (optional) | `string` | `null` | no |
| `attributes` | List of attribute definitions | `list(object)` | n/a | yes |
| `global_secondary_indexes` | List of Global Secondary Index configurations | `list(object)` | `[]` | no |
| `encryption` | Encryption configuration for the table | `object` | `{ enabled = false, kms_key_arn = null }` | no |
| `point_in_time_recovery` | Point-in-Time Recovery configuration | `object` | `{ enabled = false }` | no |
| `ttl` | Time-to-Live configuration | `object` | `{ enabled = false, attribute_name = null }` | no |
| `read_capacity` | Read capacity units (required for PROVISIONED billing) | `number` | `null` | no |
| `write_capacity` | Write capacity units (required for PROVISIONED billing) | `number` | `null` | no |
| `tags` | Tags to apply to the DynamoDB table | `map(string)` | `{}` | no |

### Attribute Object Structure

```hcl
{
  name = string  # Attribute name
  type = string  # Attribute type: S (String), N (Number), or B (Binary)
}
```

### Global Secondary Index Object Structure

```hcl
{
  name               = string       # Name of the GSI
  partition_key      = string       # Partition key for the GSI
  sort_key           = string       # Sort key for the GSI (optional)
  projection_type    = string       # Projection type: ALL, KEYS_ONLY, or INCLUDE
  non_key_attributes = list(string) # List of non-key attributes to include (for INCLUDE projection type)
}
```

## Outputs

| Name | Description |
|------|-------------|
| `table_name` | Name of the created DynamoDB table |
| `table_arn` | ARN of the created DynamoDB table |
| `table_id` | ID of the created DynamoDB table |
| `table_stream_arn` | ARN of the DynamoDB table stream (if enabled) |

## Best Practices

### Billing Mode Selection

- **PAY_PER_REQUEST (On-Demand)**: 
  - Best for unpredictable or intermittent workloads
  - No need to specify read/write capacity
  - Automatically scales with application demand
  - Pay only for what you use

- **PROVISIONED**: 
  - Best for predictable, consistent workloads
  - Requires specification of read and write capacity units
  - More cost-effective for sustained high-traffic applications
  - Consider enabling auto-scaling for provisioned capacity

### Global Secondary Index Design

- **Partition Key Selection**: Choose a partition key that distributes queries evenly across partitions
- **Sort Key Selection**: Use a sort key when you need to query items in a specific order
- **Projection Types**:
  - `ALL`: Projects all attributes (highest storage cost, no need for additional reads)
  - `KEYS_ONLY`: Projects only the index and primary keys (lowest storage cost)
  - `INCLUDE`: Projects specific attributes (balance between storage and read costs)

### Encryption

- **AWS-Managed Keys**: Default encryption with `encryption.enabled = true` and no `kms_key_arn`
- **Customer-Managed Keys**: Provide a KMS key ARN for more control over key rotation and access policies
- Always enable encryption for tables containing sensitive data

### Point-in-Time Recovery (PITR)

- Enable PITR for production tables to protect against accidental deletes or writes
- PITR allows you to restore a table to any point in time within the last 35 days
- Small additional cost per GB stored

### Time-to-Live (TTL)

- Use TTL for automatic cleanup of expired items (sessions, temporary data, logs)
- TTL attribute must be a Number type representing Unix epoch time in seconds
- Items are typically deleted within 48 hours after expiration
- No additional cost for TTL deletions

### Attribute Design

- Only define attributes that are used in keys (partition key, sort key, or GSI keys)
- DynamoDB is schemaless; you can store any attributes in items without defining them
- Use appropriate types:
  - `S` (String): For text data
  - `N` (Number): For numeric data (stored as strings internally)
  - `B` (Binary): For binary data

## Notes

- This module uses AWS Academy LabRole for IAM permissions
- Table names must be unique within an AWS account and region
- GSI creation can take several minutes for large tables
- Changing partition or sort keys requires table recreation
- Consider using DynamoDB Streams for change data capture requirements

## Example from Root Configuration

```hcl
module "shots_table" {
  source = "./dynamodb"

  name          = var.dynamodb_shots_table.name
  billing_mode  = var.dynamodb_shots_table.billing_mode
  partition_key = var.dynamodb_shots_table.partition_key
  sort_key      = var.dynamodb_shots_table.sort_key
  attributes    = var.dynamodb_shots_table.attributes

  global_secondary_indexes = var.dynamodb_shots_table.global_secondary_indexes

  encryption = var.dynamodb_shots_table.encryption
  point_in_time_recovery = var.dynamodb_shots_table.point_in_time_recovery
  ttl = var.dynamodb_shots_table.ttl

  tags = merge(
    var.common_tags,
    {
      Name = var.dynamodb_shots_table.name
    }
  )
}
```
