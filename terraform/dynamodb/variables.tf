variable "name" {
  description = "Nombre de la tabla DynamoDB"
  type        = string
}

variable "billing_mode" {
  description = "Modo de facturación (PAY_PER_REQUEST o PROVISIONED)"
  type        = string
  default     = "PAY_PER_REQUEST"
}

variable "read_capacity" {
  description = "Capacidad de lectura (solo para PROVISIONED)"
  type        = number
  default     = 0
}

variable "write_capacity" {
  description = "Capacidad de escritura (solo para PROVISIONED)"
  type        = number
  default     = 0
}

variable "partition_key" {
  description = "Partition key (hash key)"
  type        = string
}

variable "sort_key" {
  description = "Sort key (range key, opcional)"
  type        = string
  default     = null
}

variable "attributes" {
  description = "Lista de atributos a declarar en la tabla"
  type = list(object({
    name = string
    type = string # S, N, B
  }))
}

variable "global_secondary_indexes" {
  description = "Lista opcional de índices secundarios globales"
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
  description = "Configuración de encriptación"
  type = object({
    enabled      = bool
    kms_key_arn  = optional(string)
  })
  default = {
    enabled = true
  }
}

variable "point_in_time_recovery" {
  description = "Activar PITR (recuperación punto en el tiempo)"
  type        = bool
  default     = false
}

variable "ttl" {
  description = "TTL opcional para expiración de items"
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
  description = "Tags comunes"
  type        = map(string)
  default     = {}
}