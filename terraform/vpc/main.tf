resource "aws_vpc" "this" {
  cidr_block           = var.vpc_config.cidr
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = merge(
    {
      Name = var.vpc_config.name
    },
    var.tags
  )
}


resource "aws_subnet" "this" {
  for_each = { for s in var.subnets_config : s.name => s }

  vpc_id                  = aws_vpc.this.id
  cidr_block              = each.value.cidr
  availability_zone       = each.value.az
  map_public_ip_on_launch = each.value.type == "public" ? true : false

  tags = merge(
    {
      Name = "${var.vpc_config.name}-${each.value.name}"
      Tier = each.value.type
    },
    var.tags
  )
}


resource "aws_route_table" "this" {
  for_each = var.route_tables_config
  vpc_id   = aws_vpc.this.id

  tags = merge(
    {
      Name = "${var.vpc_config.name}-${each.key}-rt"
    },
    var.tags
  )
}


locals {
  rt_associations = flatten([
    for rt_name, subnet_names in var.route_tables_config : [
      for subnet_name in subnet_names : {
        rt_name     = rt_name
        subnet_name = subnet_name
      }
    ]
  ])
}

resource "aws_route_table_association" "this" {
  for_each = {
    for assoc in local.rt_associations :
    "${assoc.rt_name}-${assoc.subnet_name}" => assoc
  }

  subnet_id      = aws_subnet.this[each.value.subnet_name].id
  route_table_id = aws_route_table.this[each.value.rt_name].id
}

# Security group for VPC Interface Endpoints (ECR, Logs, etc.)
resource "aws_security_group" "vpc_endpoints" {
  name        = "${var.vpc_config.name}-vpc-endpoints-sg"
  description = "Security group for VPC interface endpoints"
  vpc_id      = aws_vpc.this.id

  # Allow HTTPS inbound from VPC CIDR (for ECR, CloudWatch Logs access)
  ingress {
    description = "HTTPS from VPC"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = [var.vpc_config.cidr]
  }

  # Allow all outbound traffic
  egress {
    description = "Allow all outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(
    {
      Name = "${var.vpc_config.name}-vpc-endpoints-sg"
    },
    var.tags
  )
}

resource "aws_vpc_endpoint" "this" {
  for_each = { for e in var.vpc_endpoints_config : e.service => e }

  vpc_id            = aws_vpc.this.id
  service_name      = "com.amazonaws.${var.vpc_config.region}.${each.value.service}"
  vpc_endpoint_type = each.value.type

  route_table_ids = lower(each.value.type) == "gateway" ? values(aws_route_table.this)[*].id : null

  subnet_ids = lower(each.value.type) == "interface" ? coalesce(
    try([for s in each.value.subnets : aws_subnet.this[s].id], null),
    values(aws_subnet.this)[*].id
  ) : null

  # Attach security group to interface endpoints
  security_group_ids = lower(each.value.type) == "interface" ? [aws_security_group.vpc_endpoints.id] : null

  private_dns_enabled = lower(each.value.type) == "interface" ? each.value.private_dns : null

  tags = merge(
    {
      Name = "${var.vpc_config.name}-${each.value.service}-endpoint"
    },
    var.tags
  )
}
