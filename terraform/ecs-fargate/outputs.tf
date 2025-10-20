output "service_name" {
  description = "Name of the ECS service"
  value       = aws_ecs_service.service.name
}

output "service_arn" {
  description = "ARN of the ECS service"
  value       = aws_ecs_service.service.id
}

output "cluster_name" {
  description = "Name of the ECS cluster"
  value       = aws_ecs_cluster.cluster.name
}

output "cluster_arn" {
  description = "ARN of the ECS cluster"
  value       = aws_ecs_cluster.cluster.arn
}

output "task_definition_arn" {
  description = "ARN of the task definition"
  value       = aws_ecs_task_definition.task.arn
}

output "task_definition_family" {
  description = "Family of the task definition"
  value       = aws_ecs_task_definition.task.family
}

output "ecr_repository_url" {
  description = "URL of the ECR repository"
  value       = aws_ecr_repository.repo.repository_url
}

output "ecr_repository_arn" {
  description = "ARN of the ECR repository"
  value       = aws_ecr_repository.repo.arn
}

output "image_uri" {
  description = "URI of the Docker image used by the ECS service"
  value       = "${aws_ecr_repository.repo.repository_url}@${docker_registry_image.image.sha256_digest}"
}

output "log_group_name" {
  description = "Name of the CloudWatch Log Group"
  value       = aws_cloudwatch_log_group.log_group.name
}

output "log_group_arn" {
  description = "ARN of the CloudWatch Log Group"
  value       = aws_cloudwatch_log_group.log_group.arn
}

output "task_execution_role_arn" {
  description = "ARN of the task execution role"
  value       = var.role_arn
}

output "task_role_arn" {
  description = "ARN of the task role"
  value       = var.role_arn
}

output "security_group_id" {
  description = "ID of the ECS service security group"
  value       = aws_security_group.ecs_service.id
}

output "alb_arn" {
  description = "ARN of the Application Load Balancer"
  value       = var.enable_load_balancer ? aws_lb.alb[0].arn : null
}

output "alb_dns_name" {
  description = "DNS name of the Application Load Balancer"
  value       = var.enable_load_balancer ? aws_lb.alb[0].dns_name : null
}

output "alb_zone_id" {
  description = "Zone ID of the Application Load Balancer (for Route53)"
  value       = var.enable_load_balancer ? aws_lb.alb[0].zone_id : null
}

output "alb_security_group_id" {
  description = "ID of the ALB security group"
  value       = var.enable_load_balancer ? aws_security_group.alb[0].id : null
}

output "target_group_arn" {
  description = "ARN of the target group"
  value       = var.enable_load_balancer ? aws_lb_target_group.tg[0].arn : null
}

output "alb_http_listener_arn" {
  description = "ARN of the HTTP listener (for API Gateway VPC Link integration, WebSocket compatible)"
  value       = var.enable_load_balancer ? aws_lb_listener.http[0].arn : null
}

output "service_url" {
  description = "URL to access the service (if load balancer is enabled, WebSocket compatible)"
  value       = var.enable_load_balancer ? "http://${aws_lb.alb[0].dns_name}" : "Service running without load balancer"
}

# For API Gateway VPC Link integration
output "vpc_link_config" {
  description = "Configuration for API Gateway VPC Link (WebSocket compatible)"
  value = var.enable_load_balancer ? {
    alb_listener_arn = aws_lb_listener.http[0].arn
    alb_dns_name     = aws_lb.alb[0].dns_name
    target_group_arn = aws_lb_target_group.tg[0].arn
    vpc_id           = var.vpc_id
    subnet_ids       = var.subnet_ids
  } : null
}
