#  This will create 4 private subnets using the CIDR blocks defined in the variable "private_subnet_cidrs"
#  The idea is to have ECS and lambas in private subnets 1 and 3, and databases in private subnets 2 and 4
resource "aws_subnet" "private_subnets" {
    count               = length(var.private_subnet_cidrs)
    vpc_id              = aws_vpc.main.id
    cidr_block          = element(var.private_subnet_cidrs, count.index)
    availability_zone   = element(var.azs, count.index % length(var.azs))
    
    tags = {
        Name = "turtle-battle-ships-private-${count.index + 1}"
    }
}

