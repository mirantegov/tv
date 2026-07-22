#!/usr/bin/env bash
# cloud-init user_data for Amazon Linux 2023 (x86_64) — data warehouse host.
# Idempotent: safe to re-run. Provisions Docker + Compose v2, then brings up the
# ClickHouse + Postgres warehouse stack.
set -euxo pipefail

# $$ escapes the bash var from templatefile() interpolation.
COMPOSE_VERSION="v2.32.1"

dnf update -y

# Docker
dnf install -y docker git
systemctl enable --now docker
usermod -aG docker ec2-user

# Docker Compose v2 plugin (x86_64)
mkdir -p /usr/libexec/docker/cli-plugins
if [ ! -x /usr/libexec/docker/cli-plugins/docker-compose ]; then
  curl -fsSL \
    "https://github.com/docker/compose/releases/download/$${COMPOSE_VERSION}/docker-compose-linux-x86_64" \
    -o /usr/libexec/docker/cli-plugins/docker-compose
  chmod +x /usr/libexec/docker/cli-plugins/docker-compose
fi

# Clone repo so deploy/ scripts are on the host
if [ ! -d /opt/mirante/.git ]; then
  git clone --branch "${repo_branch}" \
    "https://github.com/${github_repository}.git" /opt/mirante
fi
chown -R ec2-user:ec2-user /opt/mirante

# Bring up the warehouse stack. NOTE: /opt/mirante/.env.warehouse must be
# provisioned on the host out of band (it holds secrets, not in the repo).
cd /opt/mirante/deploy/warehouse && docker compose --env-file /opt/mirante/.env.warehouse up -d
