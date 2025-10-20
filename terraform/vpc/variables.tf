variable "vpc_config" {
  description = "Basic VPC configuration"
  type = object({
    name   = string
    cidr   = string
    region = string
  })
}

variable "subnets_config" {
  description = "List of subnets to create"
  type = list(object({
    name = string
    cidr = string
    az   = string
    type = string # public | private
  }))
}

variable "route_tables_config" {
  description = "Map of route tables to associated subnets"
  type        = map(list(string))
}

variable "vpc_endpoints_config" {
  description = "List of VPC endpoints"
  type = list(object({
    service     = string
    type        = string
    subnets     = optional(list(string))
    private_dns = optional(bool, true)
  }))
}

variable "tags" {
  type    = map(string)
  default = {}
}
