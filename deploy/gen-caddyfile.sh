#!/usr/bin/env bash
# Gera o Caddyfile com TODOS os tenants ativos (stage + production), lendo todos
# os arquivos tenants.*.txt. Assim o proxy sempre serve todas as rotas, mesmo
# quando o deploy atualiza só um grupo. Um bloco por tenant:
#   https://<slug>.<BASE_DOMAIN>/       -> web-<slug>:80
#   https://<slug>.<BASE_DOMAIN>/api/*  -> api-<slug>:3000  (strip /api)
# BASE_DOMAIN e ACME_EMAIL vêm de cada .env.<slug>.
set -euo pipefail
cd "$(dirname "$0")"

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
seen=""
for tf in tenants.*.txt; do
	[ -f "$tf" ] || continue
	while IFS= read -r slug; do
		slug="${slug%%#*}"; slug="$(echo "$slug" | xargs)"
		[ -z "$slug" ] && continue
		case " $seen " in *" $slug "*) continue ;; esac   # dedupe
		seen+=" $slug"
		envfile="../.env.${slug}"
		[ -f "$envfile" ] || { echo "ERRO: $envfile não encontrado" >&2; exit 1; }
		base="$(grep -E '^BASE_DOMAIN=' "$envfile" | tail -1 | cut -d= -f2-)"
		[ -z "$acme_email" ] && acme_email="$(grep -E '^ACME_EMAIL=' "$envfile" | tail -1 | cut -d= -f2-)"
		blocks+="$(emit_block "$slug" "${base:-tv.mirantegov.cloud}")"$'\n\n'
	done < "$tf"
done

if [ -n "$acme_email" ]; then
	printf '{\n\temail %s\n}\n\n' "$acme_email"
fi
printf '%s' "$blocks"
