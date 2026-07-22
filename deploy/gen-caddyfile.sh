#!/usr/bin/env bash
# Gera o Caddyfile a partir de deploy/tenants.txt: um bloco por tenant roteando
#   https://<slug>.<BASE_DOMAIN>/       -> web-<slug>:80
#   https://<slug>.<BASE_DOMAIN>/api/*  -> api-<slug>:3000  (strip /api)
# BASE_DOMAIN e ACME_EMAIL vêm de cada .env.<slug> (assumidos iguais entre tenants).
set -euo pipefail
cd "$(dirname "$0")"

tenants_file="${TENANTS_FILE:-tenants.txt}"
acme_email=""

emit_block() {
	local slug="$1" base="$2"
	cat <<EOF
${slug}.${base} {
	handle_path /api/* {
		reverse_proxy api-${slug}:3000
	}
	reverse_proxy web-${slug}:80
}
EOF
}

blocks=""
while IFS= read -r slug; do
	slug="${slug%%#*}"; slug="$(echo "$slug" | xargs)"   # tira comentário/espaços
	[ -z "$slug" ] && continue
	envfile="../.env.${slug}"
	[ -f "$envfile" ] || { echo "ERRO: $envfile não encontrado" >&2; exit 1; }
	# lê só as chaves que precisamos, sem executar o arquivo
	base="$(grep -E '^BASE_DOMAIN=' "$envfile" | tail -1 | cut -d= -f2-)"
	[ -z "$acme_email" ] && acme_email="$(grep -E '^ACME_EMAIL=' "$envfile" | tail -1 | cut -d= -f2-)"
	blocks+="$(emit_block "$slug" "${base:-tv.mirantegov.cloud}")"$'\n\n'
done < "$tenants_file"

# Bloco global: e-mail p/ Let's Encrypt (se vazio, Caddy usa conta anônima)
if [ -n "$acme_email" ]; then
	printf '{\n\temail %s\n}\n\n' "$acme_email"
fi
printf '%s' "$blocks"
