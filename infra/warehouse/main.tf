provider "aws" {
  region = var.aws_region
  # Credentials come from the standard AWS env vars:
  # AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY / AWS_REGION.
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

data "aws_ami" "al2023_x86_64" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-2023.*-x86_64"]
  }
}

# Cria um key pair a partir de ssh_public_key APENAS se existing_key_name vazio.
resource "aws_key_pair" "warehouse" {
  count      = var.existing_key_name == "" ? 1 : 0
  key_name   = "mirante-dw"
  public_key = var.ssh_public_key
}

resource "aws_security_group" "warehouse" {
  name        = "mirante-dw"
  description = "Mirante Gov data warehouse: ClickHouse + Postgres, backend ports locked to admin/app CIDRs."

  ingress {
    description = "SSH (lock down admin_cidr in production)"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.admin_cidr]
  }

  ingress {
    description = "ClickHouse HTTP"
    from_port   = 8123
    to_port     = 8123
    protocol    = "tcp"
    cidr_blocks = [var.admin_cidr, var.app_cidr]
  }

  ingress {
    description = "ClickHouse native"
    from_port   = 9000
    to_port     = 9000
    protocol    = "tcp"
    cidr_blocks = [var.admin_cidr, var.app_cidr]
  }

  ingress {
    description = "ClickHouse HTTPS"
    from_port   = 8443
    to_port     = 8443
    protocol    = "tcp"
    cidr_blocks = [var.admin_cidr, var.app_cidr]
  }

  ingress {
    description = "PostgreSQL"
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = [var.admin_cidr, var.app_cidr]
  }

  egress {
    description = "All outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_instance" "warehouse" {
  ami                    = data.aws_ami.al2023_x86_64.id
  instance_type          = var.instance_type
  key_name               = var.existing_key_name != "" ? var.existing_key_name : aws_key_pair.warehouse[0].key_name
  vpc_security_group_ids = [aws_security_group.warehouse.id]

  lifecycle {
    precondition {
      condition     = var.existing_key_name != "" || var.ssh_public_key != ""
      error_message = "Defina existing_key_name (chave já na AWS) OU ssh_public_key (cria uma nova)."
    }
  }

  user_data = templatefile("${path.module}/user_data.sh", {
    github_repository = var.github_repository
    repo_branch       = var.repo_branch
  })

  root_block_device {
    volume_type = "gp3"
    volume_size = var.root_volume_gb
  }

  tags = {
    Name = "mirante-dw"
  }
}

resource "aws_eip" "warehouse" {
  domain = "vpc"

  tags = {
    Name = "mirante-dw"
  }
}

resource "aws_eip_association" "warehouse" {
  instance_id   = aws_instance.warehouse.id
  allocation_id = aws_eip.warehouse.id
}

# dw.tv.mirantegov.cloud -> the warehouse EIP.
# proxied = false: backend DB ports are not HTTP and are reached directly.
resource "cloudflare_record" "warehouse" {
  zone_id = var.cloudflare_zone_id
  name    = "dw.${var.base_domain}"
  type    = "A"
  content = aws_eip.warehouse.public_ip
  proxied = false
  ttl     = 60
}
