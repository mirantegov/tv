# AGENTS.md

This file provides guidance to Codex CLI when working with code in this repository.

Documentação e código são em **pt-BR** (UI, commits, comentários). Mantenha assim.

---

# Behavioral guidelines

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

**Precedência: o modo ponytail sempre vence.** Onde estas diretrizes conflitarem com
ponytail, siga ponytail. Na prática isso só muda a regra 1: em vez de parar e perguntar,
entregue a versão mínima que funciona e levante a dúvida na mesma resposta
("Fiz X; Y cobre o caso. Precisa do X completo? Só falar"). Parar de verdade fica só
para o que seria inseguro ou inútil se a suposição estiver errada.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

---

# Referência do projeto

## Comandos

Front-end (raiz):

```bash
npm run dev         # Vite em http://localhost:5173 (abre o navegador)
npm run build       # build dos 2 entrypoints (index.html + admin.html) → dist/
npm run lint        # biome check .      ← obrigatório antes do PR
npm run typecheck   # tsc --noEmit       ← obrigatório antes do PR
npm run format      # biome check --write .
npm run test        # vitest run (jsdom, só src/**/*.test.{ts,tsx})
npm run test:e2e    # playwright (sobe o dev server sozinho)

npx vitest run src/format.test.ts            # um arquivo
npx vitest run -t "nome do teste"            # um caso
npx playwright test e2e/app.spec.ts --headed # um e2e
```

Control-plane (`control-plane/`, projeto npm separado — Fastify + pg):

```bash
cd control-plane
npm run dev                      # tsx watch src/server.ts
npm test                         # vitest (node, usa pg-mem — não precisa de Postgres)
npx vitest run test/login-gestor.test.ts
npm run migrate                  # aplica db/migrations/*.sql
npm run seed:palotina | seed:gestor | seed:admin
```

Stack local completa de um tenant (web + Postgres + PostgREST):

```bash
docker compose --env-file .env.palotina -p palotina up -d --build
```

## Arquitetura

Três artefatos saem deste repo:

1. **TV** (`index.html` → `src/App.tsx`) — painel BI em tela cheia para o gestor municipal.
2. **Console admin** (`admin.html` → `src/admin/`) — CRUD de instalações/entidades/gestores/licença/módulos e logs.
3. **Control-plane** (`control-plane/`) — API Fastify central, **uma instância para todos os tenants**.

Multi-tenant por isolamento físico: cada tenant = `web` + `db` (Postgres) + `api` (PostgREST), atrás de um Caddy compartilhado que roteia por subdomínio (`<slug>.tv.mirantegov.cloud`). Detalhes em `deploy/README.md`.

### Configuração por tenant é em runtime, não em build

A mesma imagem Docker serve todos os tenants. `docker/entrypoint.sh` faz `envsubst` de `docker/config.template.js` → `/config.js`, que define `window.__TENANT__`, `window.__API_URL__` e `__CP_URL__`. `src/tenant.ts` lê essas globals com fallback embutido (Palotina) para dev/teste. **Nunca** hardcode slug, IBGE ou URL de API no código.

### Fluxo de dados: seed embutido → PostgREST

`src/DataProvider.tsx` é o ponto único. Com `API_URL` definida, busca as views `api.*` em paralelo (`fetchModule` em `src/api.ts`, cada view devolve `[{ data: <shape> }]`); sem ela, ou se a API cair, cai no seed de `src/data.ts`. Módulos leem só `useData()` — nunca fetch direto.

Consequência prática: `src/types.ts` é o **contrato** entre front e banco. Mexer na forma de um módulo obriga a atualizar juntos:

`src/types.ts` → `src/data.ts` (seed) → `db/schemas/<modulo>.sql` (DDL) → `db/api/<modulo>.sql` (view `api.*` que serializa o shape) → tabela de mapeamento em `db/README.md`.

Módulo novo cuja view ainda não existe em todos os tenants: use `.catch(() => <seed>)` no `Promise.all` do `DataProvider` para não derrubar os demais (padrão já aplicado em `planejamento_comp` e `secretarias`).

### Auth e RLS

`src/tvAuth.ts` faz `POST {CP_URL}/auth/login` e guarda três chaves: `cp_token` (JWT do control-plane), `pgrst_token` (data-token com claims de tenant, assinado com o **mesmo** `PGRST_JWT_SECRET` do PostgREST do tenant — é o que ativa RLS em `db/schemas/zz_rls.sql`) e `mg_perfil`. Sem control-plane no ar, o login falha em qualquer tenant.

O console admin usa `src/admin/cpApi.ts` contra o mesmo control-plane, com token de `admin_user`.

### Dois routers, de propósito

- **TV**: `src/router.tsx` — router próprio em memória, sem History API (é uma TV, não tem barra de endereço). Navegue com `useRouter().push(path)` / `<Link href>`.
- **Admin**: TanStack Router com `createHashHistory` (`src/admin/router.tsx`), porque o nginx serve estático.

### Registro de módulos da TV (`src/App.tsx`)

`ROUTES` (path → título + componente), `NAV_GROUPS` (sidebar) e `LOCKED_PATHS` (rotas que não podem ser ocultadas). Módulo novo entra nos três. As secretarias vêm de um array único (`SECRETARIAS`) que alimenta `ROUTES` e o grupo da sidebar.

Módulos ocultos vêm do control-plane (`fetchHiddenModules`, read-only na TV) com cache em `localStorage.mg_modules` — a TV nunca altera esse estado, só o `/admin`.

### Banco

`db/init/*.sh` roda no bootstrap do Postgres na ordem numérica: tenant → schemas → views `api` → seed. `db/patches/daily/<data>/<slug>.sql` é o fluxo patch-first do CAUC/certidão (gerado por agente externo, aplicado por cron via `deploy/apply-daily-patches.sh`) — ver `deploy/daily-sync/AGENT.md`.

## Convenções

- **Biome manda** — tabs, aspas duplas. `biome.json` é protegido: não altere sem alinhar com o time.
- **Cores sempre de `useTheme().t`** — nunca hex/oklch hardcoded. Cor nova entra em `src/theme.tsx` para **todas** as famílias de tema (Ocean, Monokai, AstroVista, Apex, Green, Cyber × light/dark).
- **Valores monetários em R$ milhões**, formatados pelos helpers de `src/format.ts`.
- Reuse `src/components.tsx` (Card, Kpi, Title, Donut, HBar…) antes de criar componente novo.
- Tipagem gradual: o `tsconfig.json` do app é `strict: false`, mas `src/data.ts` valida sob `--strict`.
- Commits em pt-BR, Conventional Commits. Branch `feat/`, `fix/`, `docs/`… a partir de `main`.
- Arquivos `*.local.md` e `.env.<slug>` são gitignorados — credenciais só em `docs/acessos.local.md`.
- LGPD: `tributacao.devedores` tem dado pessoal; anonimizar/restringir por perfil em produção.

## Deploy

`main` → deploy automático no grupo **stage**; promoção fast-forward de `main` para a branch **`production`** → deploy nos tenants reais. Ambos os workflows são gated na variável de repo `DEPLOY_ENABLED=true`. Nunca commite direto na `production`.

## localStorage (TV)

| Chave | Uso |
|---|---|
| `cp_token` / `pgrst_token` / `mg_perfil` | sessão do gestor (ver `tvAuth.ts`) |
| `mg_sidebar` | `"1"` = sidebar recolhida |
| `mg_modules` | cache JSON das rotas ocultas |
| `mg_extras` | `"0"` = seção Análises e Alertas desligada |

## Docs

`docs/arquitetura.md` (shell/tema/menu Configurações/modo TV), `docs/dados.md`, `docs/modulos.md`, `db/README.md` (mapa módulo→schema→export), `deploy/README.md` (tenants, control-plane central, cron), `infra/` (OpenTofu). Trechos do `README.md` da raiz ainda descrevem a fase mock e estão desatualizados frente ao `DataProvider`/control-plane.

<!-- headroom:memory-instructions -->
## Memory

Use the `headroom_memory` MCP server for persistent cross-session knowledge.

**Before** answering questions about prior decisions, conventions, project context,
architecture, user preferences, org info, codenames, debugging history, or anything
from past sessions — call `memory_search` first.

**After** making durable decisions, discovering conventions, or learning important
facts — call `memory_save` to persist them for future sessions.

Memory is your first source of truth for anything not visible in the current conversation.

