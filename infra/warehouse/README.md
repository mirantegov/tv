# infra/warehouse/ — Mirante Gov data warehouse

OpenTofu module (own root module / own state) that provisions a **separate**
VPS + DNS for the Mirante Gov data warehouse. This is NOT the app host — the
app runs from `infra/`. This machine hosts **ClickHouse** and **PostgreSQL**.

## What it creates

- EC2 `m7i.2xlarge` (x86_64, 8 vCPU / 32 GB) running Amazon Linux 2023, gp3 200 GB root.
- Elastic IP (stable public address) + association.
- Security group: SSH (22) restricted to `admin_cidr`; ClickHouse (8123/9000/8443)
  and Postgres (5432) restricted to `admin_cidr` **and** `app_cidr` — never open
  to the world.
- SSH key pair from your public key.
- Cloudflare `A` record `dw.tv.mirantegov.cloud` → the EIP (`proxied = false`).
- On first boot (`user_data.sh`): Docker + Compose v2, a clone of this repo into
  `/opt/mirante`, then `deploy/warehouse` brought up via `docker compose`.
  (`.env.warehouse` must be placed on the host out of band — it holds secrets.)

## What it's for

- **ClickHouse** is the DW / source for the nightly ETL that recreates each
  tenant's Postgres data (TRUNCATE + COPY into `<slug>.tv.mirantegov.cloud`).
- **PostgreSQL** is for future ETL of other items and serves a separate
  Dashboards system being built in parallel.

## Why m7i.2xlarge / x86 / us-east-1

ClickHouse + Postgres together want RAM and vCPU headroom (32 GB / 8 vCPU),
x86_64 for the widest image compatibility, and us-east-1 pinned for cost and
image availability. Change only with a matching x86_64 AMI.

## Usage

```bash
# 1. AWS creds via env (never in tfvars):
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export AWS_REGION=us-east-1

# 2. Fill in secrets:
cp terraform.tfvars.example terraform.tfvars
# edit: ssh_public_key, cloudflare_api_token, cloudflare_zone_id
#       admin_cidr (your IP/32) and app_cidr (app EIP/32) to lock down DB ports

# 3. Provision:
tofu init
tofu plan
tofu apply
```

## Outputs

- `public_ip` — EIP; DNS points here.
- `ssh` — ready `ssh ec2-user@<ip>` string.
- `clickhouse_http` — `http://<ip>:8123`.
- `clickhouse_native` — `<ip>:9000`.
- `postgres_endpoint` — `<ip>:5432`.
- `dns` — `dw.tv.mirantegov.cloud`.
