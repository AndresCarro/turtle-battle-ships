# VPC Module — Configurable

This module allows you to create the entire AWS network from a declarative input:

- 🌐 VPC
- 🟨 Dynamic subnets (private and/or public)
- 🧭 Route tables
- 🔗 Route table ↔ Subnet associations
- 🧩 VPC Endpoints (Gateway + Interface)
- 🔐 Security groups for Interface Endpoints

---

## 🧠 Main Variables

| Name                  | Type                       | Description                                                               |
|---------------------------|------------------------------|----------------------------------------------------------------------------|
| `vpc_config`              | object                      | Base VPC configuration (name, CIDR, region).                       |
| `subnets_config`          | list(object)                | List of subnets to create.                                                 |
| `route_tables_config`     | map(list(string))           | Map of route tables and associated subnets.                                 |
| `vpc_endpoints_config`    | list(object)                | List of VPC endpoints (S3, DynamoDB, ECR, etc).                             |
| `tags`                    | map(string)                 | Optional tags.                                                          |

---

## 🧾 Usage Example

```hcl
module "network" {
  source = "./modules/vpc"

  vpc_config = {
    name   = "kairos-vpc"
    cidr   = "10.0.0.0/16"
    region = "us-east-1"
  }

  subnets_config = [
    { name = "private-a1", cidr = "10.0.101.0/24", az = "us-east-1a", type = "private" },
    { name = "private-a2", cidr = "10.0.102.0/24", az = "us-east-1a", type = "private" },
    { name = "private-b1", cidr = "10.0.103.0/24", az = "us-east-1b", type = "private" },
    { name = "private-b2", cidr = "10.0.104.0/24", az = "us-east-1b", type = "private" }
  ]

  route_tables_config = {
    rt1 = ["private-a1", "private-a2"]
    rt2 = ["private-b1", "private-b2"]
  }

  vpc_endpoints_config = [
    { service = "s3", type = "Gateway" },
    { service = "dynamodb", type = "Gateway" },
    { service = "ecr.api", type = "Interface", private_dns = true },
    { service = "ecr.dkr", type = "Interface", private_dns = true }
  ]

  tags = {
    Environment = "dev"
    Project     = "Kairos"
  }
}
