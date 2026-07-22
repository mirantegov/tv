# Troubleshooting — provisionamento e deploy

Ordem do fluxo: **`tofu apply` (infra) → DNS/TLS → `deploy.sh` (host) → app**.
Cole a saída do passo que falhar que eu ajusto o código.

## 1. OpenTofu / provisionamento

| Sintoma | Causa provável | Correção |
|---|---|---|
| `No valid credential sources found` | AWS não exportada | `export AWS_ACCESS_KEY_ID/SECRET/REGION` no shell (não no `.env`). O `apply.sh` já valida isso. |
| `Error: Invalid AWS Region` | `AWS_REGION` vazio/errado | `export AWS_REGION=us-east-1`. |
| `InvalidKeyPair` / erro no key pair | `ssh_public_key` vazio ou inválido | Cole a **pública** (`~/.ssh/id_ed25519.pub`) em `terraform.tfvars`. |
| Cloudflare `Authentication error (10000)` | token sem permissão | Token precisa de **Zone → DNS → Edit** na zona `mirantegov.cloud`. |
| Cloudflare `record already exists` | wildcard `*.tv…` já existe | Importe (`tofu import`) ou apague o registro manual antigo. |
| `InstanceType not supported in az` | AZ sem `m7g`/`m7i` | Deixe a AZ padrão ou troque `instance_type` no `tfvars`. |
| Quer conferir antes | — | `./apply.sh plan` (ou `plan warehouse`) e me cole a saída. |

## 2. Acesso à VPS (SSH)

- **Timeout no SSH**: `admin_cidr` no `tfvars` está bloqueando seu IP. Ajuste para `SEU_IP/32` (veja em `curl ifconfig.me`) e `tofu apply` de novo.
- **`Permission denied (publickey)`**: usuário é **`ec2-user`** (AL2023); a chave privada tem de casar com a `ssh_public_key` do `tfvars`.
- **Repo não está em `/opt/mirante`**: o `user_data` roda na 1ª boot; veja `sudo cat /var/log/cloud-init-output.log` no host.

## 3. DNS / TLS (Caddy)

- **Certificado não emite / HTTPS falha**: o Caddy usa Let's Encrypt via **porta 80** →
  - o security group tem de permitir **80 e 443** (permite por padrão);
  - o DNS `*.tv.mirantegov.cloud` tem de resolver para o EIP (registro do Cloudflare **`proxied=false`** — se ficar laranja/proxied, o desafio HTTP-01 falha);
  - `ACME_EMAIL` preenchido no `.env.<slug>` ajuda (rate limits/avisos).
- **`too many certificates already issued`**: rate limit do LE. Teste com o staging do LE ou espere. (Posso adicionar `acme_ca` de staging no Caddyfile se quiser.)
- **Propagação de DNS**: registro novo pode levar minutos; `dig +short stage.tv.mirantegov.cloud` deve dar o EIP.

## 4. Deploy no host (`deploy.sh`)

| Sintoma | Causa | Correção |
|---|---|---|
| `../.env.<slug> ausente` | env do tenant não está no host | Crie `/opt/mirante/.env.<slug>` a partir de `.env.<tenant>.example` e preencha. |
| `network edge not found` | rede não criada | O `deploy.sh` cria; se rodou algo antes, `docker network create edge`. |
| `pull access denied` / `unauthorized` no GHCR | imagem privada | No host: `echo $GHCR_TOKEN | docker login ghcr.io -u <user> --password-stdin` (ou torne o pacote público). |
| `no matching manifest for linux/arm64` | imagem sem arm64 | A imagem web é buildada arm64 pela Action. Se for a do **postgrest** que falha, troque a instância para **`m7i.xlarge`** (x86) no `tfvars` e reaplique. |
| Caddy sobe mas 502 | web/api ainda subindo ou alias errado | `docker compose -p mirante-<slug> ps`; os aliases têm de ser `web-<slug>`/`api-<slug>` (já no compose). |

## 5. App / dados

- **Painel vazio ou `/api` 404**: confira `GET https://<slug>.tv.mirantegov.cloud/api/despesa` → deve dar JSON. Se 404, o `handle_path /api/*` do Caddy ou o `PGRST_DB_SCHEMAS=api` estão fora.
- **Reseed do banco**: o seed do Postgres **só roda em volume novo**. Para recriar: `docker compose -p mirante-<slug> down -v && ./deploy.sh <grupo>`.
- **CORS**: não deve haver — front e `/api` ficam no mesmo domínio. Se aparecer, o `API_URL` não está no formato `https://<slug>.<BASE_DOMAIN>/api`.

## 6. Warehouse (ClickHouse + Postgres)

- **App não conecta no ClickHouse**: `app_cidr` no `infra/warehouse/tfvars` tem de ser o **EIP da VPS do app `/32`** (senão o SG bloqueia). Portas 8123/9000 (CH) e 5432 (PG).
- **ClickHouse não sobe**: cheque `ulimits nofile` (já no compose) e `docker logs mirante-warehouse-clickhouse-1`.
