
output "vpc_id" {
  description = "ID of the created VPC"
  value       = aws_vpc.this.id
}

output "subnets" {
  description = "Map of subnet name to subnet ID"
  value = {
    for k, v in aws_subnet.this :
    k => v.id
  }
}

output "route_tables" {
  description = "Map of route table name to route table ID"
  value = {
    for k, v in aws_route_table.this :
    k => v.id
  }
}

output "vpc_endpoints" {
  description = "Map of service name to endpoint ID"
  value = {
    for k, v in aws_vpc_endpoint.this :
    k => v.id
  }
}
