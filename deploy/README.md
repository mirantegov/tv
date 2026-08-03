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
| `docker-compose.central.yml` | control-plane central (auth dos gestores), parametrizado por `.env.central` |
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

## Control-plane central (auth da TV)

Desde a migração do login (`8a9fce1`), a TV autentica os gestores no
**control-plane central** — sem ele no ar, o login falha em qualquer tenant
com o código novo. Um único central serve todos os tenants
(`https://cp.<BASE_DOMAIN>`; o wildcard DNS já cobre).

1. Crie `/opt/mirante/.env.central` a partir de `.env.central.example` (raiz):
   `CENTRAL_DB_PASSWORD`, `JWT_SECRET`, `PGRST_JWT_SECRET` (≥32 bytes),
   `CORS_ORIGIN` com **todos** os domínios de tenant e `ADMIN_*`.
2. Copie o **mesmo** `PGRST_JWT_SECRET` para cada `.env.<slug>` — o PostgREST
   do tenant valida o data-token emitido pelo central.
3. `./deploy.sh <grupo>` — sobe/atualiza o central (build local), injeta
   `CP_URL` nos webs e regenera o Caddyfile com a rota `cp.<BASE_DOMAIN>`.
4. Semeie instalação e gestores (uma vez; o `admin_user` do console /admin é
   semeado no start a partir de `ADMIN_*`):

   ```sh
   cd /opt/mirante/deploy
   docker compose --env-file ../.env.central -f docker-compose.central.yml \
     exec control-plane npm run seed:palotina
   docker compose --env-file ../.env.central -f docker-compose.central.yml \
     exec -e GESTOR_CPF=00000000000 -e GESTOR_SENHA='<senha>' \
          -e GESTOR_NOME=Administrador -e GESTOR_ROLE=admin \
     control-plane npm run seed:gestor
   ```

   `seed:gestor` aceita `GESTOR_ID_IBGE`/`GESTOR_ID_ENTIDADE` (padrão:
   Palotina `4117909`/`12426` — vale também para o stage, que espelha
   Palotina). Demais gestores: console `/admin` ou repetir o comando.

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

## Sincronização diária CAUC + Certidão (patch-first)

Fluxo: um agente externo (Hermes/Claude Work — runbook em
[`daily-sync/AGENT.md`](daily-sync/AGENT.md)) roda às **9h00** (dias úteis),
baixa o CSV oficial do CAUC, raspa a certidão do TCE-PR por CNPJ e commita
patches em `db/patches/daily/<data>/<slug>.sql` via
[`daily-sync/gen_daily_patch.py`](daily-sync/gen_daily_patch.py). O agente só
tem permissão de git — nunca SSH/senha de banco.

Na VPS, [`apply-daily-patches.sh`](apply-daily-patches.sh) roda às **9h30**
via cron, aplica os patches pendentes em cada tenant (o de `palotina` também
vai para `stage`) e registra em `/opt/mirante/.daily-patches-applied`.

Instalar o cron no host (atenção: horário do host é UTC — 9h30 BRT = 12h30 UTC):

    # /etc/cron.d/mirante-daily-patches
    30 12 * * 1-5 ec2-user cd /opt/mirante/deploy && ./apply-daily-patches.sh >> /var/log/mirante-daily-patches.log 2>&1

Tenant novo no fluxo = uma entrada em [`daily-sync/tenants.json`](daily-sync/tenants.json).
Teste manual do aplicador: gere um patch, rode `./apply-daily-patches.sh` e
confira os `SELECT`s de verificação impressos no fim do patch.

> Backlog: quando o warehouse (ClickHouse) subir para os outros módulos, esta
> ingestão migra para `ingest/ingest.sh` (TRUNCATE+COPY) e o patch-first é
> aposentado — ver spec 2026-07-30.

## Notas

- Enquanto a ingestão não estiver ligada, cada tenant usa o **seed de `data.ts`**
  aplicado no bootstrap do Postgres (ex.: `palotina`).
- Escala: `m7g.xlarge` (16 GB) comporta ~10–25 tenants com este layout. Para
  densidade maior, considerar Postgres compartilhado (1 servidor, 1 database por
  tenant) — muda só o `docker-compose.tenant.yml` e o `PGRST_DB_URI`.
