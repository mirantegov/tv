#!/bin/sh
# Gera /config.js por tenant a partir das envs (rodado por nginx antes de subir).
set -eu
: "${TENANT_ID:=}"
: "${TENANT_SLUG:=}"
: "${TENANT_NOME:=}"
: "${TENANT_UF:=}"
: "${API_URL:=}"
export TENANT_ID TENANT_SLUG TENANT_NOME TENANT_UF API_URL
envsubst '${TENANT_ID} ${TENANT_SLUG} ${TENANT_NOME} ${TENANT_UF} ${API_URL}' \
	< /etc/mirante/config.template.js \
	> /usr/share/nginx/html/config.js
