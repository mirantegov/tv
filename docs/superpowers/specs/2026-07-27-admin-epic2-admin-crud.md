# Épico 2 — /admin: CRUD (instalações, entidades, gestores, licenças, módulos)

**Data:** 2026-07-27 · **Depende de:** épico 1 · **Habilita:** operação real do control plane
**PRD:** [2026-07-27-admin-control-plane-design.md](./2026-07-27-admin-control-plane-design.md)

## Objetivo

A SPA `/admin` (em `admin.tv.mirantegov.cloud`) e os endpoints de negócio que ela
consome, cobrindo todo o fluxo de provisionamento por registro: cadastrar instalação,
suas entidades, gestores, emitir licença e definir os módulos liberados.

## Entregáveis

- **SPA /admin** (React/Vite, reusando o design system do projeto): login → dashboard de
  instalações → detalhe da instalação com abas (Entidades, Gestores, Licença, Módulos).
- **Endpoints REST** (protegidos por JWT do épico 1), cada mutação grava `audit_log`.

## Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| GET/POST | `/instalacoes` | listar / criar instalação (status `a-instalar` por padrão). |
| GET/PATCH/DELETE | `/instalacoes/:id` | detalhe / editar (inclui status) / remover. |
| GET/POST | `/instalacoes/:id/entidades` | listar / criar entidade. |
| PATCH/DELETE | `/entidades/:id_entidade` | editar / remover entidade. |
| GET/POST | `/instalacoes/:id/gestores` | listar / criar gestor (senha hasheada). |
| PATCH/DELETE | `/gestores/:cpf` | editar (inclui trocar senha) / remover. |
| PUT | `/instalacoes/:id/licenca` | definir `ativo` + `validade`. |
| GET/PUT | `/instalacoes/:id/modulos` | ler / definir liga-desliga de módulos por path. |

## Fluxo de UI (provisionamento por registro)

1. **Nova instalação:** id IBGE, slug, nome, UF → nasce `a-instalar`.
2. **Entidades:** adiciona Prefeitura, Câmara, RPPS, Saneamento…
3. **Licença:** liga + data de validade → status pode ir para `ativa`.
4. **Gestores:** CPF, nome, senha, role, **vincula a 1 entidade** (`id_entidade`).
5. **Módulos:** liga/desliga os paths que o município enxerga.

## Regras

- `status` da instalação é **só registro** — nenhuma orquestração de container.
- Gestor → entidade é **1:1 fixo** (um CPF, uma entidade).
- CPF único; validação de 11 dígitos.
- Módulos: fonte da verdade central; a lista de paths vem do catálogo de módulos da TV.
- Toda criação/edição/remoção → `audit_log` com ator (admin logado), ação e alvo.

## Critérios de aceite

- [ ] Criar instalação completa (instalação → entidades → licença → gestores → módulos)
      ponta a ponta pela UI.
- [ ] Gestor criado com senha hasheada; login desse CPF funciona via `/auth/login`.
- [ ] Editar status/licença reflete no `GET /instalacoes/:id`.
- [ ] Definir módulos persiste e é lido de volta.
- [ ] Cada mutação aparece no `audit_log`.

## Não inclui

Telas de visualização de logs (épico 3), mudanças na TV (épico 4), orquestração real.

## Questões a resolver aqui

- Catálogo de módulos: hardcoded a partir do `NAV_GROUPS` da TV ou tabela própria?
- Reset de senha de gestor: gera aleatória (como hoje) ou admin define?
