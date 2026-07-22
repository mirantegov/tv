variable "aws_region" {
  description = "AWS region for the data warehouse VPS. Fixed to us-east-1 (see README)."
  type        = string
  default     = "us-east-1"
}

variable "instance_type" {
  description = "EC2 instance type. m7i.2xlarge (x86_64, 8 vCPU / 32 GB) for ClickHouse + Postgres."
  type        = string
  default     = "m7i.2xlarge"
}

variable "root_volume_gb" {
  description = "Root gp3 volume size in GB."
  type        = number
  default     = 200
}

variable "ssh_public_key" {
  description = "SSH public key material (contents of your .pub). Cria um key pair novo. Deixe vazio se usar existing_key_name."
  type        = string
  default     = ""
}

variable "existing_key_name" {
  description = "Nome de um key pair JÁ existente na AWS. Se preenchido, não cria chave nova (ssh_public_key é ignorado)."
  type        = string
  default     = ""
}

variable "admin_cidr" {
  description = "CIDR allowed to SSH (22) and reach the DB ports. LOCK THIS DOWN to your IP/32 in production."
  type        = string
  default     = "0.0.0.0/0"
}

variable "app_cidr" {
  description = "CIDR of the app VPS allowed to reach ClickHouse/Postgres. Set to the app EIP/32."
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
  description = "Base domain. The warehouse resolves at dw.<base_domain>."
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
