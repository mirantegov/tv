#!/bin/sh
# Semeia os dados do tenant (db/seed/$TENANT_SLUG/*.sql, montado em /seed).
set -eu
dir="/seed/${TENANT_SLUG}"
if [ ! -d "$dir" ]; then
	echo "==> sem seed para tenant '${TENANT_SLUG}' ($dir) — pulando"
	exit 0
fi
for f in "$dir"/*.sql; do
	echo "==> seed $f"
	psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f "$f"
done
