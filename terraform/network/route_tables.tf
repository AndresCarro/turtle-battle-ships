# Private Route Table for Fargate + Lambdas
resource "aws_route_table" "private_rt_1" {
    vpc_id = aws_vpc.main.id

    tags = {
        Name = "turtle-battle-ships-private-rt-1"
    }
}

# Private Route Table for RDS Proxy + RDS (db)
resource "aws_route_table" "private_rt_2" {
    vpc_id = aws_vpc.main.id

    tags = {
        Name = "turtle-battle-ships-private-rt-2"
    }
}