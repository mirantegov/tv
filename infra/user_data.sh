#!/usr/bin/env bash
# cloud-init user_data for Amazon Linux 2023 (arm64).
# Idempotent: safe to re-run. Provisions Docker + Compose v2, the shared 'edge'
# network, and clones the repo so deploy/ + db/ scripts live on the host.
set -euxo pipefail

# $$ escapes the bash var from templatefile() interpolation.
COMPOSE_VERSION="v2.32.1"

dnf update -y

# Docker
dnf install -y docker git
systemctl enable --now docker
usermod -aG docker ec2-user

# Docker Compose v2 plugin (arm64)
mkdir -p /usr/libexec/docker/cli-plugins
if [ ! -x /usr/libexec/docker/cli-plugins/docker-compose ]; then
  curl -fsSL \
    "https://github.com/docker/compose/releases/download/$${COMPOSE_VERSION}/docker-compose-linux-aarch64" \
    -o /usr/libexec/docker/cli-plugins/docker-compose
  chmod +x /usr/libexec/docker/cli-plugins/docker-compose
fi

# Shared external reverse-proxy network (Caddy + tenant stacks attach here)
docker network create edge || true

# Clone repo so deploy/ scripts + db/ are on the host
if [ ! -d /opt/mirante/.git ]; then
  git clone --branch "${repo_branch}" \
    "https://github.com/${github_repository}.git" /opt/mirante
fi
chown -R ec2-user:ec2-user /opt/mirante
