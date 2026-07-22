variable "aws_region" {
  description = "AWS region for the VPS. Fixed to us-east-1 (see README for rationale)."
  type        = string
  default     = "us-east-1"
}

variable "instance_type" {
  description = "EC2 instance type. m7g.xlarge (Graviton3 arm64, 4 vCPU / 16 GB) for fixed ETL performance."
  type        = string
  default     = "m7g.xlarge"
}

variable "ssh_public_key" {
  description = "SSH public key material (contents of your .pub) to install for ec2-user."
  type        = string
}

variable "admin_cidr" {
  description = "CIDR allowed to SSH (port 22). LOCK THIS DOWN to your IP/32 in production."
  type        = string
  default     = "0.0.0.0/0"
}

variable "cloudflare_api_token" {
  description = "Cloudflare API token with DNS edit rights on the zone."
  type        = string
  sensitive   = true
}

variable "cloudflare_zone_id" {
  description = "Cloudflare zone ID that owns base_domain."
  type        = string
}

variable "base_domain" {
  description = "Base domain tenants live under. Tenants resolve at <slug>.<base_domain>."
  type        = string
  default     = "tv.mirantegov.cloud"
}

variable "github_repository" {
  description = "GitHub repo (owner/name) cloned to /opt/mirante on the host for deploy scripts."
  type        = string
  default     = "mirantegov/tv"
}

variable "repo_branch" {
  description = "Branch to clone on the host."
  type        = string
  default     = "main"
}

variable "root_volume_gb" {
  description = "Root gp3 volume size in GB."
  type        = number
  default     = 50
}
