variable "rds" {
  type = object({
    identifier             = string
    family                 = string
    engine                 = string
    engine_version         = string
    instance_class         = string
    allocated_storage      = number
    max_allocated_storage  = number
    backup_retention_days  = number
    deletion_protection    = bool
    master_username        = string
    master_password        = string
    database_name          = string
    port                   = optional(number, 5432)
    subnet_names           = list(string)
    subnet_map             = map(string)
    vpc_security_group_ids = list(string)
  })
}

variable "my_ip_cidr" {
  description = "Your IP address in CIDR notation to allow temporary access to RDS"
  type        = string
  default     = "0.0.0.0/32"
}