terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
  }
}

locals {
  ecr_repo_name = var.ecr_repository_name != "" ? var.ecr_repository_name : var.service_name
}

# ECR Repository
resource "aws_ecr_repository" "repo" {
  name                 = local.ecr_repo_name
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = merge(
    var.tags,
    {
      Name = local.ecr_repo_name
    }
  )
}

# ECR Lifecycle Policy
resource "aws_ecr_lifecycle_policy" "repo_policy" {
  repository = aws_ecr_repository.repo.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last 5 images"
        selection = {
          tagStatus     = "any"
          countType     = "imageCountMoreThan"
          countNumber   = 5
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

# Get AWS account ID
data "aws_caller_identity" "current" {}

# Get ECR authorization token
data "aws_ecr_authorization_token" "token" {}

provider "docker" {
  registry_auth {
    address  = "${data.aws_caller_identity.current.account_id}.dkr.ecr.${var.region}.amazonaws.com"
    username = data.aws_ecr_authorization_token.token.user_name
    password = data.aws_ecr_authorization_token.token.password
  }
}

# Build and push Docker image
resource "docker_image" "image" {
  name = "${aws_ecr_repository.repo.repository_url}:${var.image_tag}"
  
  build {
    context    = var.dockerfile_path
    dockerfile = "Dockerfile"
    platform   = var.architectures[0] == "ARM64" ? "linux/arm64" : "linux/amd64"
  }

  triggers = {
    dockerfile_hash = filemd5("${var.dockerfile_path}/Dockerfile")
    package_json_hash = fileexists("${var.dockerfile_path}/package.json") ? filemd5("${var.dockerfile_path}/package.json") : ""
  }
}

resource "docker_registry_image" "image" {
  name = docker_image.image.name

  depends_on = [
    docker_image.image
  ]
}

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "log_group" {
  name              = "/ecs/${var.service_name}"
  retention_in_days = var.log_retention_days

  tags = merge(
    var.tags,
    {
      Name = "${var.service_name}-logs"
    }
  )
}

# ECS Cluster
resource "aws_ecs_cluster" "cluster" {
  name = "${var.service_name}-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = merge(
    var.tags,
    {
      Name = "${var.service_name}-cluster"
    }
  )
}

# ECS Task Definition
resource "aws_ecs_task_definition" "task" {
  family                   = var.service_name
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.cpu
  memory                   = var.memory
  execution_role_arn       = var.role_arn
  task_role_arn            = var.role_arn

  runtime_platform {
    operating_system_family = "LINUX"
    cpu_architecture        = var.architectures[0]
  }

  container_definitions = jsonencode([
    {
      name      = var.service_name
      image     = "${aws_ecr_repository.repo.repository_url}@${docker_registry_image.image.sha256_digest}"
      essential = true

      portMappings = [
        {
          containerPort = var.container_port
          hostPort      = var.container_port
          protocol      = "tcp"
        }
      ]

      environment = [
        for key, value in var.environment_variables : {
          name  = key
          value = value
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.log_group.name
          "awslogs-region"        = var.region
          "awslogs-stream-prefix" = "ecs"
        }
      }

      healthCheck = {
        command     = ["CMD-SHELL", "curl -f http://localhost:${var.container_port}${var.health_check_path} || exit 1"]
        interval    = var.health_check_interval
        timeout     = var.health_check_timeout
        retries     = var.health_check_healthy_threshold
        startPeriod = 60
      }
    }
  ])

  tags = merge(
    var.tags,
    {
      Name = "${var.service_name}-task"
    }
  )

  depends_on = [
    docker_registry_image.image,
    aws_cloudwatch_log_group.log_group
  ]
}

# Security Group for ECS Service
resource "aws_security_group" "ecs_service" {
  name        = "${var.service_name}-ecs-sg"
  description = "Security group for ${var.service_name} ECS service"
  vpc_id      = var.vpc_id

  tags = merge(
    var.tags,
    {
      Name = "${var.service_name}-ecs-sg"
    }
  )
}

# Security Group Ingress Rule - Allow traffic from ALB to ECS
resource "aws_vpc_security_group_ingress_rule" "ecs_from_alb" {
  count                        = var.enable_load_balancer ? 1 : 0
  security_group_id            = aws_security_group.ecs_service.id
  description                  = "Allow traffic from ALB"
  from_port                    = var.container_port
  to_port                      = var.container_port
  ip_protocol                  = "tcp"
  referenced_security_group_id = aws_security_group.alb[0].id

  tags = merge(
    var.tags,
    {
      Name = "${var.service_name}-ecs-from-alb"
    }
  )
}

# Security Group Egress Rule - Allow all outbound from ECS
resource "aws_vpc_security_group_egress_rule" "ecs_egress" {
  security_group_id = aws_security_group.ecs_service.id
  description       = "Allow all outbound traffic"
  ip_protocol       = "-1"
  cidr_ipv4         = "0.0.0.0/0"

  tags = merge(
    var.tags,
    {
      Name = "${var.service_name}-ecs-egress"
    }
  )
}

# Security Group for ALB
resource "aws_security_group" "alb" {
  count       = var.enable_load_balancer ? 1 : 0
  name        = "${var.service_name}-alb-sg"
  description = "Security group for ${var.service_name} ALB"
  vpc_id      = var.vpc_id

  tags = merge(
    var.tags,
    {
      Name = "${var.service_name}-alb-sg"
    }
  )
}

# Security Group Ingress Rule - Allow HTTP traffic to ALB
resource "aws_vpc_security_group_ingress_rule" "alb_http" {
  count             = var.enable_load_balancer ? 1 : 0
  security_group_id = aws_security_group.alb[0].id
  description       = "Allow HTTP traffic for WebSocket connections"
  from_port         = 80
  to_port           = 80
  ip_protocol       = "tcp"
  cidr_ipv4         = "0.0.0.0/0"

  tags = merge(
    var.tags,
    {
      Name = "${var.service_name}-alb-http"
    }
  )
}

# Security Group Egress Rule - Allow all outbound from ALB
resource "aws_vpc_security_group_egress_rule" "alb_egress" {
  count             = var.enable_load_balancer ? 1 : 0
  security_group_id = aws_security_group.alb[0].id
  description       = "Allow all outbound traffic"
  ip_protocol       = "-1"
  cidr_ipv4         = "0.0.0.0/0"

  tags = merge(
    var.tags,
    {
      Name = "${var.service_name}-alb-egress"
    }
  )
}

# Application Load Balancer
resource "aws_lb" "alb" {
  count              = var.enable_load_balancer ? 1 : 0
  name               = "${var.service_name}-alb"
  internal           = true
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb[0].id]
  subnets            = var.subnet_ids

  enable_deletion_protection = false
  enable_http2               = true

  tags = merge(
    var.tags,
    {
      Name = "${var.service_name}-alb"
    }
  )
}

# Target Group
resource "aws_lb_target_group" "tg" {
  count       = var.enable_load_balancer ? 1 : 0
  name        = "${var.service_name}-tg"
  port        = var.container_port
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  # WebSocket support - keep connections alive
  stickiness {
    enabled         = true
    type            = "lb_cookie"
    cookie_duration = 86400  # 24 hours for long-lived WebSocket connections
  }

  health_check {
    enabled             = true
    healthy_threshold   = var.health_check_healthy_threshold
    unhealthy_threshold = var.health_check_unhealthy_threshold
    timeout             = var.health_check_timeout
    interval            = var.health_check_interval
    path                = var.health_check_path
    protocol            = "HTTP"
    matcher             = "200-299"
  }

  deregistration_delay = var.deregistration_delay

  tags = merge(
    var.tags,
    {
      Name = "${var.service_name}-tg"
    }
  )
}

# ALB Listener (HTTP only - WebSocket compatible)
resource "aws_lb_listener" "http" {
  count             = var.enable_load_balancer ? 1 : 0
  load_balancer_arn = aws_lb.alb[0].arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.tg[0].arn
  }
}

# ECS Service
resource "aws_ecs_service" "service" {
  name            = var.service_name
  cluster         = aws_ecs_cluster.cluster.id
  task_definition = aws_ecs_task_definition.task.arn
  desired_count   = var.desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.subnet_ids
    security_groups  = concat([aws_security_group.ecs_service.id], var.security_group_ids)
    assign_public_ip = var.assign_public_ip
  }

  dynamic "load_balancer" {
    for_each = var.enable_load_balancer ? [1] : []
    content {
      target_group_arn = aws_lb_target_group.tg[0].arn
      container_name   = var.service_name
      container_port   = var.container_port
    }
  }

  enable_execute_command = var.enable_execute_command

  tags = merge(
    var.tags,
    {
      Name = "${var.service_name}-service"
    }
  )

  depends_on = [
    aws_lb_listener.http
  ]
}

# Auto Scaling Target
resource "aws_appautoscaling_target" "ecs_target" {
  count              = var.enable_autoscaling ? 1 : 0
  max_capacity       = var.autoscaling_max_capacity
  min_capacity       = var.autoscaling_min_capacity
  resource_id        = "service/${aws_ecs_cluster.cluster.name}/${aws_ecs_service.service.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

# Auto Scaling Policy - CPU
resource "aws_appautoscaling_policy" "cpu" {
  count              = var.enable_autoscaling ? 1 : 0
  name               = "${var.service_name}-cpu-autoscaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.ecs_target[0].resource_id
  scalable_dimension = aws_appautoscaling_target.ecs_target[0].scalable_dimension
  service_namespace  = aws_appautoscaling_target.ecs_target[0].service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value       = var.autoscaling_target_cpu
    scale_in_cooldown  = 300
    scale_out_cooldown = 60
  }
}
