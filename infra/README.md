# infra/ — Mirante Gov VPS

OpenTofu module that provisions the single multi-tenant VPS + DNS for Mirante Gov.
It builds the **host and DNS only**. The reverse proxy (Caddy) and per-tenant
Docker stacks are brought up on the host by `deploy/deploy.sh` (separate layer).

## What it creates

- EC2 `m7g.xlarge` (Graviton3, arm64) running Amazon Linux 2023, gp3 50 GB root.
- Elastic IP (stable public address) + association.
- Security group: 80/443 open to the world, 22 restricted to `admin_cidr`.
- SSH key pair from your public key.
- Cloudflare wildcard `A` record `*.tv.mirantegov.cloud` → the EIP (`proxied = false`,
  so Caddy terminates TLS via Let's Encrypt HTTP-01).
- On first boot (`user_data.sh`): Docker + Compose v2, the shared external `edge`
  network, and a clone of this repo into `/opt/mirante`.

## Why m7g.xlarge / arm64 / us-east-1

Fixed, predictable performance for the nightly ClickHouse ETL (Graviton3 has no
burst-credit throttling), 16 GB RAM to hold ~10 tenants' containers plus page
cache, and us-east-1 is pinned for cost and image availability. Change only with
a matching arm64 AMI.

## Usage

```bash
# 1. AWS creds via env (never in tfvars):
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export AWS_REGION=us-east-1

# 2. Fill in secrets:
cp terraform.tfvars.example terraform.tfvars
# edit: ssh_public_key, cloudflare_api_token, cloudflare_zone_id

# 3. Provision:
tofu init
tofu plan
tofu apply
```

## Outputs

- `public_ip` — EIP; DNS points here.
- `ssh` — ready `ssh ec2-user@<ip>` string.
- `base_domain` — `tv.mirantegov.cloud`.
- `tenant_url_note` — reminder that tenants resolve at `<slug>.<base_domain>`.

## Next step (not this module)

SSH in and run the deploy layer to start Caddy + tenant stacks:

```bash
ssh ec2-user@<public_ip>
cd /opt/mirante && ./deploy/deploy.sh
```
