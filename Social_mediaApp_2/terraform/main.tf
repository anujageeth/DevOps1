provider "aws" {
  region = "eu-north-1"
}


resource "aws_instance" "social" {
  ami           = "ami-00a929b66ed6e0de6" 
  instance_type = "t3.micro"
  key_name      = "my-ec2-key"
  associate_public_ip_address = true

  vpc_security_group_ids = [aws_security_group.social_sg.id]

  tags = {
    Name = "social-Server"
  }

  user_data = <<-EOF
              #!/bin/bash
              apt-get update -y
              apt-get install -y docker docker-compose
              systemctl start docker
              systemctl enable docker
              EOF
}

resource "aws_security_group" "social_sg" {
  name        = "social-security-group"
  description = "Allow SSH, HTTP, and custom ports"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 5173
    to_port     = 5173
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 5000
    to_port     = 5000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

output "instance_public_ip" {
  value = aws_instance.social.public_ip
  description = "Public IP of the EC2 instance"
}