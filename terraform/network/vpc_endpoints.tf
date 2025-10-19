resource "aws_vpc_endpoint" "s3_endpoint" {
    vpc_id            = aws_vpc.main.id
    service_name     = "com.amazonaws.${var.region}.s3"
    vpc_endpoint_type = "Gateway" # Default is Gateway for S3
    route_table_ids = [aws_route_table.private_rt_2.id]
    
    tags = {
        Name = "turtle-battle-ships-vpc-endpoint-s3"
    }
}

resource "aws_vpc_endpoint" "dynamo_db_endpoint" {
    vpc_id            = aws_vpc.main.id
    service_name     = "com.amazonaws.${var.region}.dynamodb"
    vpc_endpoint_type = "Gateway" # Default is Gateway for DynamoDB
    route_table_ids = [aws_route_table.private_rt_2.id]
    
    tags = {
        Name = "turtle-battle-ships-vpc-endpoint-dynamodb"
    }
}

# resource "aws_vpc_endpoint" "container_registry_endpoint" {
#     vpc_id = aws_vpc.main.id
#     service_name = "com.amazonaws.${var.region}.ecr.api"
#     vpc_endpoint_type = "Interface"
#     subnet_ids = aws_subnet.
#     security_group_ids = [aws_security_group.vpc_endpoints_sg.id]
#     private_dns_enabled = true
    
#     tags = {
#         Name = "turtle-battle-ships-ecr-api-endpoint"
#     }
# }