output "rds_endpoint" {
  value = module.rds_instance.db_instance_address
}

output "rds_port" {
  value = module.rds_instance.db_instance_port
}
