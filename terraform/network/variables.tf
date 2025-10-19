variable "private_subnet_cidrs" {
  type = list(string)
}

variable "azs" {
    type = list(string)
}

variable "region" {
  type = string
}