variable "name" {
  description = "Name of the DynamoDB table"
  type        = string
}

variable "billing_mode" {
  description = "Billing mode (PAY_PER_REQUEST or PROVISIONED)"
  type        = string
  default     = "PAY_PER_REQUEST"
}

variable "read_capacity" {
  description = "Read capacity units (only for PROVISIONED mode)"
  type        = number
  default     = 0
}

variable "write_capacity" {
  description = "Write capacity units (only for PROVISIONED mode)"
  type        = number
  default     = 0
}

variable "partition_key" {
  description = "Partition key (hash key) attribute name"
  type        = string
}

variable "sort_key" {
  description = "Sort key (range key) attribute name (optional)"
  type        = string
  default     = null
}

variable "attributes" {
  description = "List of attributes to declare in the table"
  type = list(object({
    name = string
    type = string # S (String), N (Number), B (Binary)
  }))
}

variable "global_secondary_indexes" {
  description = "List of global secondary indexes"
  type = list(object({
    name               = string
    partition_key      = string
    sort_key           = optional(string)
    projection_type    = string
    read_capacity      = optional(number)
    write_capacity     = optional(number)
  }))
  default = []
}

variable "encryption" {
  description = "Encryption configuration"
  type = object({
    enabled      = bool
    kms_key_arn  = optional(string)
  })
  default = {
    enabled = false
  }
}

variable "point_in_time_recovery" {
  description = "Enable Point-In-Time Recovery (PITR)"
  type        = bool
  default     = false
}

variable "ttl" {
  description = "Time To Live (TTL) configuration for automatic item expiration"
  type = object({
    enabled         = bool
    attribute_name  = string
  })
  default = {
    enabled        = false
    attribute_name = ""
  }
}

variable "tags" {
  description = "Common tags to apply to the table"
  type        = map(string)
  default     = {}
}