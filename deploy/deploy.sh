#!/usr/bin/env bash
# Deploy multi-tenant numa VPS única. Roda no host (ex.: /opt/mirante/deploy).
#
#   ./deploy.sh stage        # atualiza só os tenants de tenants.stage.txt
#   ./deploy.sh production   # atualiza só os de tenants.production.txt
#   ./deploy.sh              # (all) atualiza todos os grupos
#
# main      -> workflow chama ./deploy.sh stage
# production-> workflow chama ./deploy.sh production
#
# Para cada slug exige ../.env.<slug> (segredos, fora do git). O Caddyfile é
# SEMPRE regenerado com todos os grupos, então o proxy mantém todas as rotas.
set -euo pipefail
cd "$(dirname "$0")"

group="${1:-all}"
case "$group" in
	stage)      files=(tenants.stage.txt) ;;
	production) files=(tenants.production.txt) ;;
	all)        files=(tenants.*.txt) ;;
	*) echo "uso: $0 [stage|production|all]" >&2; exit 2 ;;
esac

echo "==> garantindo a rede compartilhada 'edge'"
docker network inspect edge >/dev/null 2>&1 || docker network create edge

deploy_tenant() {
	local slug="$1" envfile="../.env.$1"
	[ -f "$envfile" ] || { echo "ERRO: $envfile ausente" >&2; exit 1; }
	echo "==> tenant '${slug}': puxando imagem e subindo"
	docker compose --env-file "$envfile" -f docker-compose.tenant.yml pull web
	docker compose --env-file "$envfile" -f docker-compose.tenant.yml up -d
}

echo "==> deploy do grupo: ${group}"
for tf in "${files[@]}"; do
	[ -f "$tf" ] || continue
	while IFS= read -r slug; do
		slug="${slug%%#*}"; slug="$(echo "$slug" | xargs)"
		[ -z "$slug" ] && continue
		deploy_tenant "$slug"
	done < "$tf"
done

echo "==> gerando Caddyfile (todos os grupos)"
./gen-caddyfile.sh > Caddyfile

echo "==> subindo/atualizando o proxy Caddy"
docker compose -f docker-compose.proxy.yml up -d
docker compose -f docker-compose.proxy.yml exec -T caddy \
	caddy reload --config /etc/caddy/Caddyfile 2>/dev/null \
	|| docker compose -f docker-compose.proxy.yml restart

echo "==> pronto. Tenants no ar em https://<slug>.<BASE_DOMAIN>"
