variable "region" {
  description   = "AWS region"
  type          = string
  default       = "us-east-1"
}

variable "private_subnet_cidrs" {
  type          = list(string)
  default       = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24", "10.0.4.0/24"]
}

variable "azs" {
    type        = list(string)
    description = "Availabiliy Zones"
    default     = ["us-east-1a", "us-east-1b"]
}