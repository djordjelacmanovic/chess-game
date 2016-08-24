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

resource "aws_elb" "elb_app" {
  name = "app-elb"
  availability_zones = ["us-west-2a", "us-west-2b", "us-west-2c"]
  listener {
    instance_port = 80
    instance_protocol = "http"
    lb_port = 80
    lb_protocol = "http"
  }

  health_check {
    healthy_threshold = 3
    unhealthy_threshold = 2
    timeout = 10
    target = "HTTP:80/"
    interval = 30
  }

  cross_zone_load_balancing = true
  idle_timeout = 60

  tags {
    Name = "app-elb"
  }
}


resource "aws_autoscaling_group" "asg_app" {
  lifecycle { create_before_destroy = true }

  # interpolate the LC into the ASG name so it always forces an update
  name = "asg-app - ${aws_launch_configuration.lc_app.name}"
  max_size = 5
  min_size = 2
  wait_for_elb_capacity = 2
  desired_capacity = 2
  health_check_grace_period = 300
  health_check_type = "ELB"
  launch_configuration = "${aws_launch_configuration.lc_app.id}"
  load_balancers = ["${aws_elb.elb_app.id}"]
  availability_zones = ["us-west-2a"]
}

resource "aws_launch_configuration" "lc_app" {
    lifecycle { create_before_destroy = true }

    image_id = "${data.aws_ami.app_ami.id}"

    instance_type = "t2.micro"

    # Our Security group to allow HTTP and SSH access
    # security_groups = ["${aws_security_group.default.id}"]

    lifecycle {
      create_before_destroy = true
    }
}  