variable "aws_access_key" {}
variable "aws_secret_key" {}
variable "app_name" {}
variable "ami_name" {}
variable "elb_name" {}

data "aws_ami" "app_ami" {
  most_recent = true
  executable_users = ["self"]
  filter {
    name = "${var.ami_name}"
  }
  owners = ["self"]
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
  load_balancers = ["${aws_elb.chess-game.id}"]
  # vpc_zone_identifier = ["${aws_subnet.private_az1.id}", "${aws_subnet.private_az2.id}", "${aws_subnet.private_az3.id}"]
}

resource "aws_launch_configuration" "lc_app" {
    lifecycle { create_before_destroy = true }

    image_id = "${data.aws_ami.app_ami.id}"

    instance_type = "t2.micro"

    # Our Security group to allow HTTP and SSH access
    security_groups = ["${aws_security_group.default.id}"]

    lifecycle {
      create_before_destroy = true
    }
}  