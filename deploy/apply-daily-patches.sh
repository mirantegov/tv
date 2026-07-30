#!/usr/bin/env bash
# Aplica patches diários (db/patches/daily/*/<slug>.sql) nos containers dos
# tenants. Roda na VPS via cron (ver README). Idempotente: patches já aplicados
# ficam em .daily-patches-applied; falha não marca e re-tenta no próximo run.
set -euo pipefail
cd "$(dirname "$0")"                     # deploy/
REPO_ROOT="$(cd .. && pwd)"
APPLIED_LOG="${APPLIED_LOG:-$REPO_ROOT/.daily-patches-applied}"

git -C "$REPO_ROOT" pull --ff-only

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
for sql in "$REPO_ROOT"/db/patches/daily/*/*.sql; do
	rel="${sql#"$REPO_ROOT"/}"
	grep -qxF "$rel" "$APPLIED_LOG" && continue
	slug="$(basename "$sql" .sql)"
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
