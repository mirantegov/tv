#!/usr/bin/env bash
# Ingestão noturna: recria os dados de cada tenant a partir do data warehouse
# (ClickHouse, em outra instância). Padrão: TRUNCATE + COPY — barato e sem bloat.
#
# Instalar no host via cron (ver deploy/README.md), horário em INGEST_CRON.
# Enquanto CLICKHOUSE_HOST estiver vazio, o tenant segue com o seed de data.ts
# e este job apenas o ignora.
#
# STATUS: esqueleto. A extração real (queries no ClickHouse → tabelas Postgres)
# depende do schema do warehouse — preencher na seção marcada abaixo.
set -euo pipefail
cd "$(dirname "$0")/.."   # deploy/

TENANTS_FILE="${TENANTS_FILE:-tenants.txt}"

while IFS= read -r slug; do
	slug="${slug%%#*}"; slug="$(echo "$slug" | xargs)"
	[ -z "$slug" ] && continue
	envfile="../.env.${slug}"
	[ -f "$envfile" ] || { echo "ERRO: $envfile ausente" >&2; exit 1; }
	# shellcheck disable=SC1090
	set -a; . "$envfile"; set +a

	if [ -z "${CLICKHOUSE_HOST:-}" ]; then
		echo "[ingest] ${slug}: CLICKHOUSE_HOST vazio — mantém seed, pulando"
		continue
	fi

	echo "[ingest] ${slug}: recriando dados do warehouse"
	psql_t() { docker compose --env-file "$envfile" -f docker-compose.tenant.yml exec -T db \
		psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" "$@"; }

	# ---------------------------------------------------------------------
	# TODO(warehouse): para cada schema/tabela de módulo:
	#   1) psql_t -c "TRUNCATE <schema>.<tabela>;"
	#   2) extrair do ClickHouse e COPY para dentro, ex.:
	#      clickhouse-client --host "$CLICKHOUSE_HOST" --port "$CLICKHOUSE_PORT" \
	#        --user "$CLICKHOUSE_USER" --password "$CLICKHOUSE_PASSWORD" \
	#        --query "SELECT ... FROM $CLICKHOUSE_DATABASE.<origem> FORMAT CSV" \
	#      | psql_t -c "COPY <schema>.<tabela> FROM STDIN WITH (FORMAT csv)"
	# Fazer tudo numa transação por tenant para não deixar o painel meio vazio.
	# ---------------------------------------------------------------------
	echo "[ingest] ${slug}: (extração ainda não implementada — ver TODO)"
done < "$TENANTS_FILE"
