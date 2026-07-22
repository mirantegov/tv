output "public_ip" {
  description = "Stable public IP (EIP) of the warehouse. Point DNS / SSH here."
  value       = aws_eip.warehouse.public_ip
}

output "ssh" {
  description = "Ready-to-run SSH command."
  value       = "ssh ec2-user@${aws_eip.warehouse.public_ip}"
}

output "clickhouse_http" {
  description = "ClickHouse HTTP endpoint."
  value       = "http://${aws_eip.warehouse.public_ip}:8123"
}

output "clickhouse_native" {
  description = "ClickHouse native protocol endpoint."
  value       = "${aws_eip.warehouse.public_ip}:9000"
}

output "postgres_endpoint" {
  description = "PostgreSQL endpoint."
  value       = "${aws_eip.warehouse.public_ip}:5432"
}

output "dns" {
  description = "DNS name for the warehouse."
  value       = "dw.${var.base_domain}"
}
