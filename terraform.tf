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
    tags {
      Name = "${var.ami_name}",
      app = "${var.app_name}"
    }
} 

resource "aws_cloudformation_stack" "autoscaling_group" {
  name = "chessgameasg"
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
        "LoadBalancerNames": ["${var.elb_name}"],
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