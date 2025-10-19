# VPC Module — Parametrizable

Este módulo permite crear toda la red de AWS desde un input declarativo:

- 🌐 VPC
- 🟨 Subnets dinámicas (privadas y/o públicas)
- 🧭 Route tables
- 🔗 Asociaciones RT ↔ Subnets
- 🧩 VPC Endpoints (Gateway + Interface)
- 🔐 SG para Interface Endpoints

---

## 🧠 Variables principales

| Nombre                  | Tipo                       | Descripción                                                               |
|---------------------------|------------------------------|----------------------------------------------------------------------------|
| `vpc_config`              | object                      | Configuración base de la VPC (nombre, CIDR, región).                       |
| `subnets_config`          | list(object)                | Lista de subnets a crear.                                                 |
| `route_tables_config`     | map(list(string))           | Mapa de route tables y subnets asociadas.                                 |
| `vpc_endpoints_config`    | list(object)                | Lista de endpoints VPC (S3, Dynamo, ECR, etc).                             |
| `tags`                    | map(string)                 | Tags opcionales.                                                          |

---

## 🧾 Ejemplo de uso en el root

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
