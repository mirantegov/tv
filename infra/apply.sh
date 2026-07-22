#!/usr/bin/env bash
# Wrapper de conveniência p/ OpenTofu. NÃO embute nem lê segredos: as chaves da
# AWS vêm do SEU ambiente (export AWS_ACCESS_KEY_ID/SECRET/REGION antes de rodar).
# As demais variáveis (ssh_public_key, cloudflare_*) ficam em terraform.tfvars.
#
#   ./apply.sh plan                # app VPS (infra/)
#   ./apply.sh apply               # app VPS
#   ./apply.sh plan   warehouse    # data warehouse (infra/warehouse/)
#   ./apply.sh apply  warehouse
#   ./apply.sh destroy [warehouse] # derrubar
set -euo pipefail

action="${1:-}"
module="${2:-.}"
case "$action" in
	plan|apply|destroy) ;;
	*) echo "uso: $0 <plan|apply|destroy> [warehouse]" >&2; exit 2 ;;
esac

cd "$(dirname "$0")/$module"
echo "==> módulo: $(pwd)"

# 1) Credenciais AWS só do ambiente (nunca de arquivo)
missing=""
for v in AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY AWS_REGION; do
	[ -n "${!v:-}" ] || missing+=" $v"
done
if [ -n "$missing" ]; then
	echo "ERRO: exporte no shell antes de rodar:$missing" >&2
	echo "  export AWS_ACCESS_KEY_ID=…  AWS_SECRET_ACCESS_KEY=…  AWS_REGION=us-east-1" >&2
	exit 1
fi

# 2) tfvars presente (ssh_public_key, cloudflare_api_token, cloudflare_zone_id…)
if [ ! -f terraform.tfvars ]; then
	echo "ERRO: terraform.tfvars ausente. Crie a partir do exemplo:" >&2
	echo "  cp terraform.tfvars.example terraform.tfvars  # e preencha" >&2
	exit 1
fi

# 3) init idempotente + ação (apply/destroy pedem confirmação do próprio tofu)
tofu init -input=false
tofu "$action"
