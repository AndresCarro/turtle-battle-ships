resource "aws_security_group_rule" "rds_temp_access" {
  type              = "ingress"
  from_port         = 5432
  to_port           = 5432
  protocol          = "tcp"
  cidr_blocks       = [var.my_ip_cidr] 
  security_group_id = var.rds.vpc_security_group_ids[0]
}


module "rds_instance" {
  source  = "terraform-aws-modules/rds/aws"
  version = "6.13.0"

  identifier              = var.rds.identifier
  family                  = var.rds.family
  engine                  = var.rds.engine
  engine_version          = var.rds.engine_version
  instance_class          = var.rds.instance_class
  allocated_storage       = var.rds.allocated_storage
  max_allocated_storage   = var.rds.max_allocated_storage
  backup_retention_period = var.rds.backup_retention_days
  deletion_protection     = var.rds.deletion_protection
  db_name                 = var.rds.database_name
  username                = var.rds.master_username
  password                = var.rds.master_password
  port                    = var.rds.port
  multi_az                = true
  publicly_accessible     = false
  storage_encrypted       = true
  skip_final_snapshot     = true

  subnet_ids             = [for subnet_name in var.rds.subnet_names : var.subnet_map[subnet_name]]
  vpc_security_group_ids = var.rds.vpc_security_group_ids
}

resource "null_resource" "flyway_migrate" {
  depends_on = [module.rds_instance]

  provisioner "local-exec" {
    command = "powershell.exe -File ./scripts/flyway_migrate.ps1 -SecurityGroupId '${var.rds.vpc_security_group_ids[0]}' -Region '${var.region}' -DbHost '${module.rds_instance.db_instance_address}' -DbName '${var.rds.database_name}' -DbUser '${var.rds.master_username}' -DbPassword '${var.rds.master_password}'"
  }
}
