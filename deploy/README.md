# Deploy — VPS única, multi-tenant

Arquitetura de produção: **uma VPS** (provisionada por [`../infra`](../infra) com
OpenTofu — us-east-1, `m7g.xlarge` arm64) hospedando **N tenants**. Cada tenant
são 3 containers (`web` + `db` + `api`) atrás de um **Caddy** compartilhado que
termina TLS e roteia por subdomínio:

```
https://<slug>.tv.mirantegov.cloud/       -> web-<slug>   (SPA)
https://<slug>.tv.mirantegov.cloud/api/*  -> api-<slug>   (PostgREST)
```

## Peças

| Arquivo | Papel |
|---|---|
| `docker-compose.proxy.yml` | Caddy (80/443, TLS automático) na rede `edge` |
| `docker-compose.tenant.yml` | stack de 1 tenant (web/db/api), parametrizado por `.env.<slug>` |
| `tenants.stage.txt` | grupo **stage** (recebe deploy da `main`) |
| `tenants.production.txt` | grupo **production** (recebe deploy da branch `production`) |
| `gen-caddyfile.sh` | gera o `Caddyfile` com **todos** os grupos (`tenants.*.txt`) |
| `deploy.sh` | `./deploy.sh <stage\|production\|all>` — atualiza o grupo + regenera o Caddyfile |
| `ingest/ingest.sh` | job noturno TRUNCATE+COPY do ClickHouse (esqueleto) |

Imagem `web` vem do **GHCR** (`ghcr.io/<repo>:<IMAGE_TAG>`), publicada pela
GitHub Action [`build-and-deploy`](../.github/workflows/deploy.yml). `db`/`api`
usam imagens públicas e montam `../db` (schemas + seed + views) do checkout.

## Adicionar um tenant

1. No host, crie `/opt/mirante/.env.<slug>` a partir de
   `.env.<tenant>.example` (na raiz) e preencha (slug, nome, UF, IBGE,
   `BASE_DOMAIN`, `ACME_EMAIL`, `POSTGRES_PASSWORD` forte, `GITHUB_REPOSITORY`,
   `IMAGE_TAG`). **Nunca** comite esse arquivo.
2. Se o tenant tiver seed próprio, adicione `db/seed/<slug>/*.sql` (senão, sem
   seed relacional até a ingestão do warehouse popular o banco).
3. Acrescente o slug em `tenants.txt`.
4. Rode `./deploy.sh`.

O DNS já resolve porque o OpenTofu cria o wildcard `*.tv.mirantegov.cloud`.

## Ambientes: stage → production

- **stage** — base de desenvolvimento/homologação online (`stage.tv.mirantegov.cloud`,
  dados de Palotina). É o **primeiro** a atualizar.
- **production** — os tenants reais (`palotina`, …).

Fluxo: `main` → deploy **stage**; depois promove-se a `main` para a branch
**`production`** (fast-forward) → deploy em **todos os outros tenants**.

## Deploy manual

```sh
cd /opt/mirante && git pull --ff-only
cd deploy && ./deploy.sh stage        # ou: ./deploy.sh production  |  ./deploy.sh all
```

## Deploy por CI

Dois workflows (ambos gated na variável de repositório `DEPLOY_ENABLED=true`):

| Workflow | Gatilho | Ação |
|---|---|---|
| `deploy-stage` | push na `main` | build arm64 → GHCR → `./deploy.sh stage` |
| `deploy-production` | push na `production` | `guard` (commit tem de estar na `main`) → build → `./deploy.sh production` |

Promoção para produção (só a partir da main, fast-forward):

```sh
git checkout production && git merge --ff-only origin/main && git push
```

Reforce com **branch protection** exigindo PR a partir da `main` para a `production`.

Segredos no GitHub: `DEPLOY_HOST`, `DEPLOY_USER` (`ec2-user`), `DEPLOY_SSH_KEY`,
`GHCR_TOKEN` (read:packages).

## Data warehouse (máquina separada)

ClickHouse + Postgres rodam numa **VPS separada** (`m7i.2xlarge`), provisionada por
[`../infra/warehouse`](../infra/warehouse) e subida por
[`warehouse/docker-compose.yml`](warehouse/docker-compose.yml) com `.env.warehouse`.
O `ingest/ingest.sh` (job noturno) lê do ClickHouse e recria os dados de cada
tenant via `TRUNCATE`+`COPY`.

## Ingestão noturna (ClickHouse)

`ingest/ingest.sh` recria os dados de cada tenant do warehouse via TRUNCATE+COPY.
Preencha `CLICKHOUSE_*` no `.env.<slug>` e a extração real no `TODO` do script
(depende do schema do warehouse). Instalar no cron do host (fuso da VPS):

```sh
# /etc/cron.d/mirante-ingest  -> 03:00 (ajuste conforme INGEST_CRON)
0 3 * * * ec2-user cd /opt/mirante/deploy && ./ingest/ingest.sh >> /var/log/mirante-ingest.log 2>&1
```

## Notas

- Enquanto a ingestão não estiver ligada, cada tenant usa o **seed de `data.ts`**
  aplicado no bootstrap do Postgres (ex.: `palotina`).
- Escala: `m7g.xlarge` (16 GB) comporta ~10–25 tenants com este layout. Para
  densidade maior, considerar Postgres compartilhado (1 servidor, 1 database por
  tenant) — muda só o `docker-compose.tenant.yml` e o `PGRST_DB_URI`.
