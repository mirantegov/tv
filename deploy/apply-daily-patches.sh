#!/usr/bin/env bash
# Aplica patches diários (db/patches/daily/*/<slug>.sql) nos containers dos
# tenants. Roda na VPS via cron (ver README). Idempotente: patches já aplicados
# ficam em .daily-patches-applied; falha não marca e re-tenta no próximo run.
set -euo pipefail
cd "$(dirname "$0")"                     # deploy/
REPO_ROOT="$(cd .. && pwd)"
APPLIED_LOG="${APPLIED_LOG:-$REPO_ROOT/.daily-patches-applied}"

# /opt/mirante pode estar no branch production (workflows de deploy trocam de
# branch) — nunca confie no working tree. Busca os patches direto do
# origin/main via archive, num diretório temporário.
git -C "$REPO_ROOT" fetch origin main
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
git -C "$REPO_ROOT" archive origin/main db/patches/daily | tar -x -C "$TMP" 2>/dev/null || true

touch "$APPLIED_LOG"
shopt -s nullglob

apply_to() {  # $1 = slug alvo, $2 = arquivo .sql
	local slug="$1" sql="$2" envfile="$REPO_ROOT/.env.$1"
	[ -f "$envfile" ] || { echo "[daily] $slug: sem $envfile — pulando"; return 1; }
	# shellcheck disable=SC1090
	set -a; . "$envfile"; set +a
	docker compose --env-file "$envfile" -f docker-compose.tenant.yml exec -T db \
		psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" < "$sql"
}

rc=0
for sql in "$TMP"/db/patches/daily/*/*.sql; do
	rel="${sql#"$TMP"/}"
	grep -qxF "$rel" "$APPLIED_LOG" && continue
	slug="$(basename "$sql" .sql)"

	# C1 mitigation: o gerador/agente escreve o patch, mas o applier não deve
	# confiar cegamente no conteúdo do arquivo. Definitivo: role de DB de baixo
	# privilégio (backlog) — aqui só validações mínimas antes de aplicar.
	if ! grep -q "\"slug\": \"$slug\"" "$REPO_ROOT/deploy/daily-sync/tenants.json"; then
		echo "[daily] ERRO: slug '$slug' desconhecido (fora de tenants.json) — pulando $rel" >&2
		rc=1; continue
	fi
	if grep -qE '^[[:space:]]*\\' "$sql"; then
		echo "[daily] ERRO: $rel contém metacomando psql ('\\...') — pulando" >&2
		rc=1; continue
	fi

	echo "[daily] aplicando $rel"
	ok=1
	apply_to "$slug" "$sql" || ok=0
	# stage espelha os dados de palotina (base de demonstração)
	if [ "$slug" = palotina ] && [ -f "$REPO_ROOT/.env.stage" ]; then
		apply_to stage "$sql" || ok=0
	fi
	if [ "$ok" = 1 ]; then
		echo "$rel" >> "$APPLIED_LOG"
	else
		rc=1; echo "[daily] ERRO em $rel — não marcado, retry no próximo run" >&2
	fi
done
exit $rc
