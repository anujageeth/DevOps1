provider "aws" {
  region     = "us-east-1"
}

resource "aws_instance" "app_server" {
  ami           = "ami-00101c3551c99b710"
  instance_type = "t2.micro"
  key_name      = "my-ec2-key"

  vpc_security_group_ids = ["sg-07e8c1f589525617e"]

  user_data = <<-EOF
              #!/bin/bash
              sudo yum update -y
              sudo yum install -y docker
              sudo systemctl start docker
              sudo systemctl enable docker
              sudo usermod -aG docker ec2-user
              docker pull your-dockerhub-username/frontend-image
              docker pull your-dockerhub-username/backend-image
              docker run -d -p 3000:3000 your-dockerhub-username/frontend-image
              docker run -d -p 5000:5000 your-dockerhub-username/backend-image
              EOF

  tags = {
    Name = "ReactAppInstance"
  }
}

output "instance_id" {
  value = aws_instance.app_server.id
}

output "instance_public_ip" {
  value = aws_instance.app_server.public_ip
}
