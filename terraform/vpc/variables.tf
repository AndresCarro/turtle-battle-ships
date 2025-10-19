variable "vpc_config" {
  description = "Configuración básica de la VPC"
  type = object({
    name   = string
    cidr   = string
    region = string
  })
}

variable "subnets_config" {
  description = "Lista de subnets a crear"
  type = list(object({
    name = string
    cidr = string
    az   = string
    type = string # public | private
  }))
}

variable "route_tables_config" {
  description = "Mapa de route tables a subnets asociadas"
  type        = map(list(string))
}

variable "vpc_endpoints_config" {
  description = "Lista de endpoints VPC"
  type = list(object({
    service      = string
    type         = string
    subnets      = optional(list(string))
    private_dns  = optional(bool, true)
  }))
}

variable "tags" {
  type    = map(string)
  default = {}
}
