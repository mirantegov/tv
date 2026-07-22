provider "aws" {
  region = var.aws_region
  # Credentials come from the standard AWS env vars:
  # AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY / AWS_REGION.
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

data "aws_ami" "al2023_arm64" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-2023.*-arm64"]
  }
}

resource "aws_key_pair" "mirante" {
  key_name   = "mirante-tv"
  public_key = var.ssh_public_key
}

resource "aws_security_group" "mirante" {
  name        = "mirante-tv"
  description = "Mirante Gov multi-tenant VPS: HTTP/HTTPS public, SSH restricted."

  ingress {
    description = "HTTP (Caddy / Let's Encrypt HTTP-01)"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS (Caddy)"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "SSH (lock down admin_cidr in production)"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.admin_cidr]
  }

  egress {
    description = "All outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_instance" "mirante" {
  ami                    = data.aws_ami.al2023_arm64.id
  instance_type          = var.instance_type
  key_name               = aws_key_pair.mirante.key_name
  vpc_security_group_ids = [aws_security_group.mirante.id]

  user_data = templatefile("${path.module}/user_data.sh", {
    github_repository = var.github_repository
    repo_branch       = var.repo_branch
  })

  root_block_device {
    volume_type = "gp3"
    volume_size = var.root_volume_gb
  }

  tags = {
    Name = "mirante-tv"
  }
}

resource "aws_eip" "mirante" {
  domain = "vpc"

  tags = {
    Name = "mirante-tv"
  }
}

resource "aws_eip_association" "mirante" {
  instance_id   = aws_instance.mirante.id
  allocation_id = aws_eip.mirante.id
}

# Wildcard A record: every <slug>.tv.mirantegov.cloud resolves to the VPS.
# proxied = false so Caddy can terminate TLS directly via Let's Encrypt HTTP-01.
resource "cloudflare_record" "wildcard" {
  zone_id = var.cloudflare_zone_id
  name    = "*.${var.base_domain}"
  type    = "A"
  content = aws_eip.mirante.public_ip
  proxied = false
  ttl     = 60
}
