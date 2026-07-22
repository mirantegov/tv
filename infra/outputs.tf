output "public_ip" {
  description = "Stable public IP (EIP) of the VPS. Point DNS / SSH here."
  value       = aws_eip.mirante.public_ip
}

output "ssh" {
  description = "Ready-to-run SSH command."
  value       = "ssh ec2-user@${aws_eip.mirante.public_ip}"
}

output "base_domain" {
  description = "Base domain tenants are served under."
  value       = var.base_domain
}

output "tenant_url_note" {
  description = "Where tenants resolve."
  value       = "Tenants are served at <slug>.${var.base_domain} (wildcard A -> ${aws_eip.mirante.public_ip})."
}
