#!/usr/bin/env bash
# Deploy multi-tenant numa VPS única. Roda no host (ex.: /opt/mirante/deploy).
# Para cada slug em tenants.txt exige ../.env.<slug> (com segredos, fora do git).
#
#   ./deploy.sh                 # sobe/atualiza proxy + todos os tenants
#
# Pré-requisitos no host: Docker + plugin compose; imagem web publicada no GHCR
# (feita pela GitHub Action). Se a imagem for privada: docker login ghcr.io antes.
set -euo pipefail
cd "$(dirname "$0")"

TENANTS_FILE="${TENANTS_FILE:-tenants.txt}"

echo "==> garantindo a rede compartilhada 'edge'"
docker network inspect edge >/dev/null 2>&1 || docker network create edge

# Sobe/atualiza cada tenant (project name = mirante-<slug>, vindo do compose).
while IFS= read -r slug; do
	slug="${slug%%#*}"; slug="$(echo "$slug" | xargs)"
	[ -z "$slug" ] && continue
	envfile="../.env.${slug}"
	[ -f "$envfile" ] || { echo "ERRO: $envfile ausente — pule ou provisione" >&2; exit 1; }
	echo "==> tenant '${slug}': puxando imagem e subindo"
	docker compose --env-file "$envfile" -f docker-compose.tenant.yml pull web
	docker compose --env-file "$envfile" -f docker-compose.tenant.yml up -d
done < "$TENANTS_FILE"

echo "==> gerando Caddyfile"
./gen-caddyfile.sh > Caddyfile

echo "==> subindo/atualizando o proxy Caddy"
docker compose -f docker-compose.proxy.yml up -d
# recarrega a config sem derrubar conexões (fallback: restart)
docker compose -f docker-compose.proxy.yml exec -T caddy \
	caddy reload --config /etc/caddy/Caddyfile 2>/dev/null \
	|| docker compose -f docker-compose.proxy.yml restart

echo "==> pronto. Tenants no ar em https://<slug>.<BASE_DOMAIN>"
