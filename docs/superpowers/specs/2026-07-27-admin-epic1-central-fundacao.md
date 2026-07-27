# Épico 1 — Central: backend + schema + auth (fundação)

**Data:** 2026-07-27 · **Depende de:** nada · **Habilita:** épicos 2, 3, 4
**PRD:** [2026-07-27-admin-control-plane-design.md](./2026-07-27-admin-control-plane-design.md)

## Objetivo

Pôr de pé o serviço central: Postgres "meta", o backend Node/Fastify, o schema do
domínio e a autenticação real (hash + JWT). É a fundação — sem UI de negócio ainda,
mas com os endpoints e o auth que os épicos 2–4 consomem.

## Entregáveis

- Serviço **Node/Fastify** novo (novo diretório, ex.: `control-plane/`), com Dockerfile
  e entrada no compose do VPS.
- **Postgres central** separado (schema versionado por migrations).
- **Auth real:** `POST /auth/login` (CPF+senha → JWT), hash argon2/bcrypt, middleware de
  verificação de JWT nas rotas protegidas.
- Seed de um usuário admin inicial (via env/migration, senha hasheada — nunca em texto).

## Schema (Postgres central)

```sql
instalacao   (id_ibge PK, slug, nome, uf, status,          -- status: ativa|desativada|a-instalar
              criado_em, atualizado_em)
licenca      (id_ibge FK 1:1, ativo bool, validade date, atualizado_em)
entidade     (id_entidade PK, id_ibge FK, nome, tipo,       -- tipo: prefeitura|camara|rpps|saneamento|outra
              criado_em)
gestor       (cpf PK, id_ibge FK, id_entidade FK, nome, senha_hash, role, criado_em)
modulo_estado(id_ibge FK, path, oculto bool, atualizado_em, PK(id_ibge, path))
admin_user   (id PK, login, senha_hash, nome, criado_em)     -- operadores do /admin
audit_log    (id PK, ator, acao, alvo, payload jsonb, criado_em)
acesso_log   (id PK, cpf, id_ibge, id_entidade, criado_em)
```

## Endpoints (fundação)

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/auth/login` | admin **e** gestor: valida credencial, devolve JWT + perfil (`role`, `id_entidade`, validade da licença). |
| GET | `/auth/me` | devolve o perfil do JWT atual. |
| GET | `/health` | liveness do serviço. |

> As rotas de negócio (`/instalacoes`, `/entidades`, `/gestores`, `/licencas`,
> `/modulos`, `/logs`) são definidas no épico 2/3 — aqui só a fundação de auth as protege.

## Regras

- Senha **nunca** trafega/armazena em texto; hash no servidor.
- JWT curto + refresh (ou sessão) — definir TTL na implementação.
- `POST /auth/login` de gestor grava `acesso_log` (base para o épico 3).
- Toda rota mutável registra `audit_log` (base para o épico 3).

## Critérios de aceite

- [ ] Migrations sobem o schema num Postgres limpo.
- [ ] `POST /auth/login` com admin válido devolve JWT; inválido devolve 401.
- [ ] Rota protegida sem JWT devolve 401; com JWT válido, 200.
- [ ] Senha do seed está hasheada no banco (verificável).
- [ ] Serviço sobe no compose do VPS e responde `/health`.

## Não inclui

UI, CRUD de negócio (épico 2), telas de log (épico 3), migração da TV (épico 4).

## Questões a resolver aqui

- `role` do gestor: só rótulo ou também permissão? (afeta o payload do JWT)
- TTL do JWT e estratégia de refresh/sessão.
