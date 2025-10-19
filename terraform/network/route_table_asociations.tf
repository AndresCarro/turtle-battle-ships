# Associate private subnets 1 and 3 with private_rt_1, and private subnets 2 and 4 with private_rt_2
resource "aws_route_table_association" "private_subnet_associations" {
    count          = length(aws_subnet.private_subnets)
    subnet_id      = aws_subnet.private_subnets[count.index].id
    route_table_id = (
        count.index % 2 == 0 ? 
        aws_route_table.private_rt_1.id : 
        aws_route_table.private_rt_2.id
    )
}