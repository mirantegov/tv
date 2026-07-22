#!/bin/sh
# Aplica os schemas por módulo (db/schemas/*.sql, montados em /schemas) na ordem.
set -eu
for f in /schemas/*.sql; do
	echo "==> aplicando $f"
	psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f "$f"
done
