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

# 0) OPCIONAL: ENV_FILE=<path> carrega chaves de um .env (ex.: o seu .env.palotina)
#    e as mapeia para as variáveis do OpenTofu. Assim você não precisa de
#    terraform.tfvars. Cuidado: NÃO deixe chaves de nuvem no env do tenant que
#    é montado no host de produção — prefira um arquivo só de provisionamento.
if [ -n "${ENV_FILE:-}" ]; then
	echo "==> carregando variáveis de ${ENV_FILE}"
	[ -f "$ENV_FILE" ] || { echo "ERRO: $ENV_FILE não encontrado" >&2; exit 1; }
	set -a; . "$ENV_FILE"; set +a
	# AWS_* já têm o nome nativo (exportados pelo source acima). Mapeia o resto:
	[ -n "${SSH_PUBLIC_KEY:-}" ]       && export TF_VAR_ssh_public_key="$SSH_PUBLIC_KEY"
	[ -n "${AWS_SSH_KEY_NAME:-}" ]     && export TF_VAR_existing_key_name="$AWS_SSH_KEY_NAME"
	[ -n "${CLOUDFLARE_API_TOKEN:-}" ] && export TF_VAR_cloudflare_api_token="$CLOUDFLARE_API_TOKEN"
	[ -n "${CLOUDFLARE_ZONE_ID:-}" ]   && export TF_VAR_cloudflare_zone_id="$CLOUDFLARE_ZONE_ID"
	[ -n "${ADMIN_CIDR:-}" ]           && export TF_VAR_admin_cidr="$ADMIN_CIDR"
	[ -n "${APP_CIDR:-}" ]             && export TF_VAR_app_cidr="$APP_CIDR"
	[ -n "${BASE_DOMAIN:-}" ]          && export TF_VAR_base_domain="$BASE_DOMAIN"
fi

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
