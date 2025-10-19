
output "vpc_id" {
  description = "ID de la VPC creada"
  value       = aws_vpc.this.id
}

output "subnets" {
  description = "Mapa nombre → subnet ID"
  value = {
    for k, v in aws_subnet.this :
    k => v.id
  }
}

output "route_tables" {
  description = "Mapa nombre → route table ID"
  value = {
    for k, v in aws_route_table.this :
    k => v.id
  }
}

output "vpc_endpoints" {
  description = "Mapa servicio → endpoint ID"
  value = {
    for k, v in aws_vpc_endpoint.this :
    k => v.id
  }
}

output "vpce_sg_id" {
  description = "ID del SG de interface endpoints (si aplica)"
  value       = try(aws_security_group.vpce[0].id, null)
}
