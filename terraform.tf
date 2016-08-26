variable "aws_access_key" {}
variable "aws_secret_key" {}
variable "app_name" {}
variable "ami_name" {}
variable "elb_name" {}

provider "aws" {
    access_key = "${var.aws_access_key}"
    secret_key = "${var.aws_secret_key}"
    region = "us-west-2"
}

data "aws_ami" "app_ami" {
  most_recent = true
  filter {
    name = "name"
    values = ["${var.ami_name}"]
  }
}

resource "aws_security_group" "redis_security" {
  name = "redis_security"
  description = "Allow inbound redis"

  ingress {
      from_port = 6379
      to_port = 6379
      protocol = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
  }

  tags {
    Name = "allow redis"
  }
}

resource "aws_instance" "redis" {
  ami = "ami-afc116cf"
  instance_type = "t2.micro"
  vpc_security_group_ids = ["${aws_security_group.redis_security.id}"]
  tags {
    Name = "${var.app_name}-redis"
  }
}

resource "aws_launch_configuration" "lc_app" {
    lifecycle { create_before_destroy = true }
    image_id = "${data.aws_ami.app_ami.id}"

    user_data = "#!/bin/bash\necho REDIS_URL=redis://${aws_instance.redis.public_dns}:6379 > /home/ubuntu/app/.env && sudo restart node-app"

    instance_type = "t2.micro"
    # Our Security group to allow HTTP and SSH access
    # security_groups = ["${aws_security_group.default.id}"]

    lifecycle {
      create_before_destroy = true
    }
}

resource "aws_alb_target_group" "app_group" {
  name = "chess-game-alb-tg"
  port = 80
  protocol = "HTTP"
  vpc_id = "vpc-52751936"
}

resource "aws_alb" "djordje-chess" {
  name            = "djordje-chess"
  internal        = false
  subnets         = ["subnet-c6da40a2","subnet-112d9f67","subnet-0bb17653"]

  enable_deletion_protection = true

  tags {
    Environment = "production"
  }
}

resource "aws_alb_listener" "app_listener" {
   load_balancer_arn = "${aws_alb.djordje-chess.arn}"
   port = "80"
   protocol = "HTTP"

   default_action {
     target_group_arn = "${aws_alb_target_group.app_group.arn}"
     type = "forward"
   }
} 

resource "aws_cloudformation_stack" "new_autoscaling_group" {
  name = "newchessgameasg"
  template_body = <<STACK
{
  "Resources": {
    "MyAsg": {
      "Type": "AWS::AutoScaling::AutoScalingGroup",
      "Properties": {
        "AvailabilityZones": ["us-west-2a", "us-west-2b", "us-west-2c"],
        "LaunchConfigurationName": "${aws_launch_configuration.lc_app.name}",
        "MaxSize": "4",
        "MinSize": "2",
        "HealthCheckGracePeriod" : 300,
        "TargetGroupARNs" : ["${aws_alb_target_group.app_group.arn}"],
        "TerminationPolicies": ["OldestLaunchConfiguration", "OldestInstance"],
        "HealthCheckType": "ELB"
      },
      "UpdatePolicy": {
        "AutoScalingRollingUpdate": {
          "MinInstancesInService": "2",
          "MaxBatchSize": "2",
          "PauseTime": "PT0S"
        }
      }
    }
  }
}
STACK
} 