resource "aws_dynamodb_table" "this" {
  name           = var.name
  billing_mode   = var.billing_mode


  read_capacity  = var.billing_mode == "PROVISIONED" ? var.read_capacity : null
  write_capacity = var.billing_mode == "PROVISIONED" ? var.write_capacity : null

  hash_key  = var.partition_key
  range_key = var.sort_key

  dynamic "attribute" {
    for_each = var.attributes
    content {
      name = attribute.value.name
      type = attribute.value.type
    }
  }

  dynamic "global_secondary_index" {
    for_each = var.global_secondary_indexes
    content {
      name               = global_secondary_index.value.name
      hash_key           = global_secondary_index.value.partition_key
      range_key          = try(global_secondary_index.value.sort_key, null)
      projection_type    = global_secondary_index.value.projection_type
      read_capacity      = try(global_secondary_index.value.read_capacity, null)
      write_capacity     = try(global_secondary_index.value.write_capacity, null)
    }
  }

  server_side_encryption {
    enabled     = var.encryption.enabled
    kms_key_arn = try(var.encryption.kms_key_arn, null)
  }

  point_in_time_recovery {
    enabled = var.point_in_time_recovery
  }

  ttl {
    enabled        = var.ttl.enabled
    attribute_name = var.ttl.attribute_name
  }

  tags = merge(
    var.tags,
    { Name = var.name }
  )
}