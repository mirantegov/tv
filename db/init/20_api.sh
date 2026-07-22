#!/bin/sh
# Cria o schema `api` (views expostas pelo PostgREST). Após os schemas por módulo.
set -eu
for f in /api/*.sql; do
	echo "==> api $f"
	psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f "$f"
done
