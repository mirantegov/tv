# Épico 4 — TV: migração de auth para o central + RLS por id_entidade — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Ligar a TV ao control plane (login real de gestor no central, gate de licença), isolar os dados por `id_entidade` via **RLS no Postgres do tenant** (o central emite um "token de dados" para o PostgREST), e ler os módulos do central (read-only).

**Architecture:** O central passa a emitir, no login de gestor, um **token de dados** assinado com o segredo do PostgREST do tenant (`role: web_gestor` + claim `id_entidade`). A TV manda esse token nas queries PostgREST; o tenant ganha coluna `id_entidade` em todas as tabelas de módulo, um papel `web_gestor` com **RLS** filtrando por `request.jwt.claims->>'id_entidade'`, e as views `api.*` viram `security_invoker` (Postgres 16) para o RLS das tabelas base valer através delas. A TV também remove o gate client-side (`users.ts`) e lê módulos do central.

**Tech Stack:** Central: Fastify + @fastify/jwt + pg + jsonwebtoken (assinar o data-token com segredo distinto). Tenant DB: Postgres 16 (RLS, security_invoker, GUC). TV: React + Vite. Testes: vitest/pg-mem (central), Testing-Library (TV). **A migration RLS do tenant NÃO roda em pg-mem** — verificação por Postgres real (compose).

## Global Constraints

- `id_entidade` é **código do TCE/PR**, arbitrário, **não gerado pelo sistema**. Palotina = **12195**. O cadastro do Épico 2 já recebe `id_entidade` no body (não muda).
- Data-token: assinado com `PGRST_JWT_SECRET` (env compartilhado central↔tenant no MVP; per-tenant é hardening). Payload: `{ role: "web_gestor", id_entidade, exp }` (TTL 30d).
- App-token (JWT do Épico 1) continua para `/auth/me` e módulos do central; a TV guarda **os dois** (`cp_token` = app, `pgrst_token` = dados).
- RLS: cada tabela de módulo ganha `id_entidade text NOT NULL`; política `USING (id_entidade = current_setting('request.jwt.claims', true)::json->>'id_entidade')`. Views `api.*` → `security_invoker=true`.
- Sem central acessível / login inválido / **licença vencida/inativa (403)** → TV **bloqueia com mensagem** (sem modo demo).
- Módulos na TV são **read-only** (lê do central; só o /admin escreve).
- `id_ibge` do tenant vem de `window.__TENANT__` (já existe).
- TDD onde pg-mem/Testing-Library cobre; a task de RLS documenta verificação por Postgres real.

---

### Task 1: Central — token de dados no login de gestor + módulos legíveis pelo gestor

**Files:**
- Modify: `control-plane/src/app.ts` (aceitar `pgrstSecret?`)
- Modify: `control-plane/src/auth/routes.ts` (login de gestor devolve `data_token`; `GET /me/modulos`)
- Create: `control-plane/src/auth/dataToken.ts`
- Modify: `control-plane/package.json` (+ jsonwebtoken), `control-plane/.env.example` (+ `PGRST_JWT_SECRET`)
- Test: `control-plane/test/data-token.test.ts`

**Interfaces:**
- Produces:
  - `assinarDataToken(secret, id_entidade): string` — JWT `{ role:"web_gestor", id_entidade }` (exp 30d) assinado com `secret` (HS256).
  - `POST /auth/login` (gestor): resposta ganha `data_token` (além de `token` + `perfil`).
  - `GET /me/modulos` (sob `app.authenticate`, qualquer autenticado): módulos da própria instalação do JWT (`id_ibge` do payload) → `{ path, oculto }[]`.

- [ ] **Step 1: Write the failing test** — `control-plane/test/data-token.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { newDb } from "pg-mem";
import jwt from "jsonwebtoken";
import { buildApp } from "../src/app.js";
import { runMigrations } from "../src/db/migrate.js";
import { hashSenha } from "../src/auth/hash.js";

async function setup() {
  const { Pool } = newDb().adapters.createPg();
  const pool = new Pool();
  await runMigrations(pool);
  await pool.query("insert into instalacao (id_ibge, slug, nome, uf, status) values ('4117909','palotina','Palotina','PR','ativa')");
  await pool.query("insert into licenca (id_ibge, ativo, validade) values ('4117909', true, '2999-01-01')");
  await pool.query("insert into entidade (id_entidade, id_ibge, nome, tipo) values ('12195','4117909','Prefeitura','prefeitura')");
  await pool.query("insert into gestor (cpf, id_ibge, id_entidade, nome, senha_hash, role) values ('07320700905','4117909','12195','Prefeito',$1,'prefeito')", [await hashSenha("segredo")]);
  await pool.query("insert into modulo_estado (id_ibge, path, oculto) values ('4117909','/despesa', true)");
  const app = buildApp({ pool, jwtSecret: "app-secret", pgrstSecret: "pgrst-secret" });
  await app.ready();
  return { app };
}

describe("data-token + /me/modulos", () => {
  it("login de gestor devolve data_token com role web_gestor e id_entidade", async () => {
    const { app } = await setup();
    const res = await app.inject({ method: "POST", url: "/auth/login",
      payload: { tipo: "gestor", cpf: "07320700905", senha: "segredo" } });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.data_token).toBeTruthy();
    const claims = jwt.verify(body.data_token, "pgrst-secret") as any;
    expect(claims).toMatchObject({ role: "web_gestor", id_entidade: "12195" });
  });
  it("GET /me/modulos devolve módulos da instalação do gestor", async () => {
    const { app } = await setup();
    const login = await app.inject({ method: "POST", url: "/auth/login",
      payload: { tipo: "gestor", cpf: "07320700905", senha: "segredo" } });
    const token = login.json().token;
    const res = await app.inject({ method: "GET", url: "/me/modulos", headers: { authorization: `Bearer ${token}` } });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual([{ path: "/despesa", oculto: true }]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd control-plane && npx vitest run test/data-token.test.ts`
Expected: FAIL — `data_token` ausente / rota inexistente / `pgrstSecret` não aceito.

- [ ] **Step 3: Implement `src/auth/dataToken.ts`**

```ts
import jwt from "jsonwebtoken";

export function assinarDataToken(secret: string, id_entidade: string): string {
  return jwt.sign({ role: "web_gestor", id_entidade }, secret, { expiresIn: "30d" });
}
```
> Adicione `jsonwebtoken` explicitamente a `control-plane/package.json` (`"jsonwebtoken": "^9.0.2"`, e `"@types/jsonwebtoken": "^9.0.0"` em devDeps) e `npm install`.

- [ ] **Step 4: `buildApp` aceita `pgrstSecret`; login de gestor devolve `data_token`; `GET /me/modulos`**

Em `src/app.ts`: adicione `pgrstSecret?: string` em `Deps`, `app.decorate("pgrstSecret", deps.pgrstSecret ?? process.env.PGRST_JWT_SECRET ?? "")`, e `pgrstSecret: string` no `declare module`.

Em `src/auth/routes.ts`, no ramo `tipo === "gestor"` bem-sucedido, gere e inclua o data-token:
```ts
      const token = app.jwt.sign(r, TOKEN_OPTS);
      const data_token = app.pgrstSecret ? assinarDataToken(app.pgrstSecret, r.id_entidade) : null;
      return { token, perfil: r, data_token };
```
(importe `assinarDataToken`). E acrescente a rota (após `/auth/me`, mesmo arquivo):
```ts
  app.get("/me/modulos", { preHandler: [app.authenticate] }, async (req) => {
    const u = req.user as { id_ibge?: string };
    if (!u.id_ibge) return [];
    const { rows } = await app.pool.query(
      "select path, oculto from modulo_estado where id_ibge=$1 order by path", [u.id_ibge]
    );
    return rows;
  });
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run test/data-token.test.ts && npx vitest run`
Expected: PASS; suíte inteira verde.

- [ ] **Step 6: `.env.example`** — adicione `PGRST_JWT_SECRET=troque-isto-igual-ao-do-tenant` (comentário: deve bater com o `PGRST_JWT_SECRET` do PostgREST do tenant).

- [ ] **Step 7: Commit**

```bash
git add control-plane/src control-plane/package.json control-plane/.env.example control-plane/test/data-token.test.ts
git commit -m "feat(central): token de dados p/ PostgREST (web_gestor + id_entidade) e GET /me/modulos"
```

---

### Task 2: Tenant DB — coluna id_entidade + RLS + web_gestor + views security_invoker

**Files:**
- Create: `db/schemas/zz_rls.sql` (aplicado por último — `zz_` ordena depois dos módulos)
- Create: `db/api/98_web_gestor.sql` (papel + grants + security_invoker nas views)
- Modify: `db/init/00_tenant.sh` (GUC `app.id_entidade` a partir de `TENANT_ENTIDADE`)
- Modify: `docker-compose.yml` (serviço `api`: `PGRST_JWT_SECRET`; serviço `db`: `TENANT_ENTIDADE`)
- Modify: `.env` do tenant (`TENANT_ENTIDADE=12195`, `PGRST_JWT_SECRET=...`) — **não commitar segredos reais**

**Interfaces:** nenhuma de código; produz schema/roles/RLS do tenant.

> **Verificação:** pg-mem NÃO suporta GUC/RLS/roles. Esta task é verificada subindo o Postgres real do tenant via compose (Step 5). Não há teste vitest.

- [ ] **Step 1: `db/init/00_tenant.sh`** — grave o id_entidade do tenant num GUC de banco (após criar o DB/tenant):

```sh
# id_entidade (código TCE/PR) desta entidade — default nas tabelas de módulo (RLS)
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
  -c "ALTER DATABASE \"$POSTGRES_DB\" SET app.id_entidade = '${TENANT_ENTIDADE:-00000}';"
```

- [ ] **Step 2: `db/schemas/zz_rls.sql`** — adiciona coluna + habilita RLS + política em toda tabela de módulo (loop; ignora `api`/`public`/sistema):

```sql
-- RLS por id_entidade em todas as tabelas dos schemas de módulo.
-- id_entidade = código TCE/PR (arbitrário). Default = app.id_entidade (setado por 00_tenant.sh).
DO $$
DECLARE r record;
DECLARE ent text := current_setting('app.id_entidade', true);
BEGIN
  IF ent IS NULL OR ent = '' THEN ent := '00000'; END IF;
  FOR r IN
    SELECT schemaname, tablename FROM pg_tables
    WHERE schemaname NOT IN ('pg_catalog','information_schema','api','public')
  LOOP
    EXECUTE format('ALTER TABLE %I.%I ADD COLUMN IF NOT EXISTS id_entidade text NOT NULL DEFAULT %L',
                   r.schemaname, r.tablename, ent);
    EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', r.schemaname, r.tablename);
    EXECUTE format('DROP POLICY IF EXISTS ent_isol ON %I.%I', r.schemaname, r.tablename);
    EXECUTE format($p$CREATE POLICY ent_isol ON %I.%I FOR SELECT
                     USING (id_entidade = current_setting('request.jwt.claims', true)::json->>'id_entidade')$p$,
                   r.schemaname, r.tablename);
  END LOOP;
END $$;
```

- [ ] **Step 3: `db/api/98_web_gestor.sql`** — papel autenticado + grants + views security_invoker:

```sql
-- Papel usado pelo PostgREST quando o JWT traz role=web_gestor (RLS aplica).
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='web_gestor') THEN
    CREATE ROLE web_gestor NOLOGIN;
  END IF;
END $$;

GRANT USAGE ON SCHEMA api TO web_gestor;
GRANT SELECT ON ALL TABLES IN SCHEMA api TO web_gestor;
ALTER DEFAULT PRIVILEGES IN SCHEMA api GRANT SELECT ON TABLES TO web_gestor;

-- security_invoker: o RLS das tabelas base vale quando web_gestor lê via view.
-- web_gestor precisa de SELECT nas tabelas base dos schemas de módulo.
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT schemaname, tablename FROM pg_tables
           WHERE schemaname NOT IN ('pg_catalog','information_schema','api','public')
  LOOP
    EXECUTE format('GRANT USAGE ON SCHEMA %I TO web_gestor', r.schemaname);
    EXECUTE format('GRANT SELECT ON %I.%I TO web_gestor', r.schemaname, r.tablename);
  END LOOP;
  FOR r IN SELECT table_name FROM information_schema.views WHERE table_schema='api'
  LOOP
    EXECUTE format('ALTER VIEW api.%I SET (security_invoker = true)', r.table_name);
  END LOOP;
END $$;

-- O papel autenticador do PostgREST precisa poder assumir web_gestor.
DO $$ BEGIN
  EXECUTE format('GRANT web_gestor TO %I', current_user);
END $$;
```

> **Ordem:** `10_apply_schemas.sh` roda `db/schemas/*.sql` (`zz_rls.sql` por último, após as tabelas); `20_api.sh` roda `db/api/*.sql` (`98_web_gestor.sql` após as views, antes de `99_grants.sql`). Confirme que `security_invoker` é setado DEPOIS de as views existirem.

- [ ] **Step 4: `docker-compose.yml`** — serviço `api` (PostgREST): `PGRST_JWT_SECRET: ${PGRST_JWT_SECRET}`; serviço `db`: `TENANT_ENTIDADE: ${TENANT_ENTIDADE}`. No `.env` do tenant (NÃO commitar valores reais): `TENANT_ENTIDADE=12195`, `PGRST_JWT_SECRET=<igual ao do central>`.

- [ ] **Step 5: Verificação por Postgres real** (sem pg-mem)

```bash
docker compose --env-file .env.palotina -p palotina_rls_test up -d db api
# coluna + default 12195
docker compose -p palotina_rls_test exec db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c \
  "select count(*) from despesa.resumo where id_entidade='12195';"
# RLS: claim 12195 vê; 99999 não vê
docker compose -p palotina_rls_test exec db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c \
  "set role web_gestor; set request.jwt.claims = '{\"id_entidade\":\"12195\"}'; select count(*) from api.despesa;"
docker compose -p palotina_rls_test exec db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c \
  "set role web_gestor; set request.jwt.claims = '{\"id_entidade\":\"99999\"}'; select count(*) from api.despesa;"
docker compose -p palotina_rls_test down -v
```
Esperado: 12195 → linhas > 0; 99999 → 0. Registre os counts no relatório. **Não commite** se o isolamento falhar.

- [ ] **Step 6: Commit**

```bash
git add db/schemas/zz_rls.sql db/api/98_web_gestor.sql db/init/00_tenant.sh docker-compose.yml
git commit -m "feat(tenant): RLS por id_entidade (web_gestor + security_invoker) no Postgres do tenant"
```

---

### Task 3: TV — auth pelo central (remove users.ts) + gate de licença

**Files:**
- Create: `src/tvAuth.ts`
- Modify: `src/LoginScreen.tsx`, `src/App.tsx` (`AuthGate`)
- Delete: `src/users.ts`, `src/users.test.ts`
- Test: `src/tvAuth.test.ts`; ajustar `src/App.test.tsx`

**Interfaces:**
- Produces: `tvAuth` — `login(cpf, senha): Promise<{ token, data_token, perfil } | { erro: 'credencial'|'licenca'|'rede' }>`; `getToken()`, `getDataToken()`, `getPerfil()`, `logout()`. localStorage: `cp_token` (app), `pgrst_token` (dados), `mg_perfil` (json).
- `CP_URL = window.__CP_URL__ ?? "http://localhost:8080"`.

- [ ] **Step 1: Write the failing test** — `src/tvAuth.test.ts`

```ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { tvAuth } from "./tvAuth";

beforeEach(() => { localStorage.clear(); vi.restoreAllMocks(); });

describe("tvAuth", () => {
  it("login ok guarda tokens e perfil", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(
      JSON.stringify({ token: "app", data_token: "dados", perfil: { nome: "Prefeito", role: "prefeito", id_entidade: "12195", id_ibge: "4117909" } }),
      { status: 200, headers: { "content-type": "application/json" } }));
    const r = await tvAuth.login("073.207.009-05", "segredo");
    expect("perfil" in r && r.perfil.id_entidade).toBe("12195");
    expect(tvAuth.getDataToken()).toBe("dados");
    expect(tvAuth.getPerfil()?.nome).toBe("Prefeito");
  });
  it("403 vira erro de licença", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("{}", { status: 403 }));
    const r = await tvAuth.login("07320700905", "x");
    expect(r).toMatchObject({ erro: "licenca" });
  });
  it("401 vira erro de credencial", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("{}", { status: 401 }));
    const r = await tvAuth.login("07320700905", "x");
    expect(r).toMatchObject({ erro: "credencial" });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/tvAuth.test.ts`
Expected: FAIL — módulo inexistente.

- [ ] **Step 3: Implement `src/tvAuth.ts`**

```ts
const CP_URL = (globalThis as any).__CP_URL__ ?? "http://localhost:8080";

export type Perfil = { nome: string; role: string; id_entidade: string; id_ibge: string };
type LoginOk = { token: string; data_token: string; perfil: Perfil };
type LoginErr = { erro: "credencial" | "licenca" | "rede" };

export const tvAuth = {
  getToken: () => localStorage.getItem("cp_token"),
  getDataToken: () => localStorage.getItem("pgrst_token"),
  getPerfil: (): Perfil | null => { const s = localStorage.getItem("mg_perfil"); return s ? JSON.parse(s) : null; },
  logout() { localStorage.removeItem("cp_token"); localStorage.removeItem("pgrst_token"); localStorage.removeItem("mg_perfil"); },

  async login(cpf: string, senha: string): Promise<LoginOk | LoginErr> {
    let res: Response;
    try {
      res = await fetch(`${CP_URL}/auth/login`, {
        method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ tipo: "gestor", cpf, senha }),
      });
    } catch { return { erro: "rede" }; }
    if (res.status === 403) return { erro: "licenca" };
    if (!res.ok) return { erro: "credencial" };
    const body = await res.json() as LoginOk;
    localStorage.setItem("cp_token", body.token);
    localStorage.setItem("pgrst_token", body.data_token ?? "");
    localStorage.setItem("mg_perfil", JSON.stringify(body.perfil));
    return body;
  },
};
```

- [ ] **Step 4: `LoginScreen.tsx`** — troque `authenticate()` por `tvAuth.login()`. Sucesso → `onLogin()`. Trate `erro: 'licenca'` ("Licença vencida ou inativa — contate o suporte."), `'credencial'` ("CPF ou senha inválidos."), `'rede'` ("Sem conexão com o servidor."). Remova o import de `users.ts`.

- [ ] **Step 5: `App.tsx` `AuthGate`** — sessão = `!!tvAuth.getToken()`; `role` de `tvAuth.getPerfil()?.role`. Não logado → `<LoginScreen>`. (Licença já é barrada no login: 403 nunca guarda token.) Remova `mg_auth`/`mg_role`/`authenticate`.

- [ ] **Step 6: Remover `src/users.ts` + `src/users.test.ts`** (ou reescrever o teste p/ `tvAuth`). Ajuste `App.test.tsx` (semeava `mg_auth`) para semear `cp_token` + `mg_perfil`.

- [ ] **Step 7: Run tests + typecheck**

Run: `npx vitest run && npx tsc --noEmit`
Expected: PASS (suíte TV + admin verde).

- [ ] **Step 8: Commit**

```bash
git add src/tvAuth.ts src/LoginScreen.tsx src/App.tsx src/App.test.tsx src/tvAuth.test.ts
git rm src/users.ts src/users.test.ts 2>/dev/null || true
git commit -m "feat(tv): auth pelo central (gestor) com gate de licença; remove users.ts"
```

---

### Task 4: TV — data-token no PostgREST + módulos do central

**Files:**
- Modify: `src/api.ts`
- Test: `src/api.test.ts`

**Interfaces:**
- `fetchModule` (e leituras PostgREST) mandam `Authorization: Bearer ${pgrst_token}` quando houver token.
- `fetchHiddenModules` passa a ler `GET ${CP_URL}/me/modulos` (com `cp_token`), retornando os `path` com `oculto=true`. Read-only.

- [ ] **Step 1: Write the failing test** — `src/api.test.ts`

```ts
import { describe, it, expect, beforeEach, vi } from "vitest";

beforeEach(() => { localStorage.clear(); vi.restoreAllMocks(); (globalThis as any).__API_URL__ = "http://tenant"; (globalThis as any).__CP_URL__ = "http://cp"; });

describe("api com data-token", () => {
  it("fetchModule manda Bearer do pgrst_token", async () => {
    localStorage.setItem("pgrst_token", "dados");
    const spy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify([{ data: { x: 1 } }]), { status: 200, headers: { "content-type": "application/json" } }));
    const { fetchModule } = await import("./api");
    await fetchModule("despesa");
    const init = spy.mock.calls[0][1] as RequestInit;
    expect((init.headers as any).authorization).toBe("Bearer dados");
  });
  it("fetchHiddenModules lê do central /me/modulos", async () => {
    localStorage.setItem("cp_token", "app");
    const spy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify([{ path: "/despesa", oculto: true }, { path: "/receita", oculto: false }]), { status: 200, headers: { "content-type": "application/json" } }));
    const { fetchHiddenModules } = await import("./api");
    const hidden = await fetchHiddenModules();
    expect(String(spy.mock.calls[0][0])).toContain("/me/modulos");
    expect(hidden).toEqual(["/despesa"]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/api.test.ts`
Expected: FAIL — headers/endpoint antigos.

- [ ] **Step 3: Implement** — em `src/api.ts`:
- helper de headers que injeta `Authorization: Bearer ${localStorage.getItem("pgrst_token")}` quando presente, usado por `fetchModule` (e demais leituras PostgREST).
- reescreva `fetchHiddenModules` para chamar `${CP_URL}/me/modulos` com `Authorization: Bearer ${cp_token}` (`CP_URL = window.__CP_URL__ ?? ""`), mapeando para os `path` com `oculto === true`. Mantenha o no-op sem `cp_token`.
- `saveModuleHidden`: pare de chamá-la a partir da TV (módulos read-only). Pode manter a função morta ou removê-la se nenhum caller sobrar (verifique `App.tsx`).

- [ ] **Step 4: Run test + full suite + typecheck**

Run: `npx vitest run && npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/api.ts src/api.test.ts
git commit -m "feat(tv): PostgREST com data-token (RLS) e módulos lidos do central"
```

---

### Task 5: Seed — cadastrar Palotina + entidade 12195 no central

**Files:**
- Create: `control-plane/scripts/seed-palotina.ts`
- Test: `control-plane/test/seed-palotina.test.ts`

**Interfaces:**
- Produces: `seedPalotina(pool): Promise<void>` — upsert de instalação `4117909` (Palotina/PR, status `ativa`), licença ativa, entidade **`12195`** (Prefeitura), idempotente.

- [ ] **Step 1: Write the failing test** — `control-plane/test/seed-palotina.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { newDb } from "pg-mem";
import { runMigrations } from "../src/db/migrate.js";
import { seedPalotina } from "../scripts/seed-palotina.js";

describe("seedPalotina", () => {
  it("cadastra Palotina + entidade 12195 (idempotente)", async () => {
    const { Pool } = newDb().adapters.createPg();
    const pool = new Pool();
    await runMigrations(pool);
    await seedPalotina(pool);
    await seedPalotina(pool);
    const inst = await pool.query("select id_ibge, status from instalacao");
    expect(inst.rows).toHaveLength(1);
    expect(inst.rows[0]).toMatchObject({ id_ibge: "4117909", status: "ativa" });
    const ent = await pool.query("select id_entidade from entidade");
    expect(ent.rows).toEqual([{ id_entidade: "12195" }]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd control-plane && npx vitest run test/seed-palotina.test.ts`
Expected: FAIL — `seedPalotina` inexistente.

- [ ] **Step 3: Implement `control-plane/scripts/seed-palotina.ts`**

```ts
import { Pool } from "pg";

export async function seedPalotina(pool: Pool): Promise<void> {
  await pool.query(
    `insert into instalacao (id_ibge, slug, nome, uf, status) values ('4117909','palotina','Palotina','PR','ativa')
       on conflict (id_ibge) do update set status='ativa'`);
  await pool.query(
    `insert into licenca (id_ibge, ativo, validade) values ('4117909', true, '2999-01-01')
       on conflict (id_ibge) do update set ativo=true, validade='2999-01-01'`);
  await pool.query(
    `insert into entidade (id_entidade, id_ibge, nome, tipo) values ('12195','4117909','Prefeitura','prefeitura')
       on conflict (id_entidade) do nothing`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  await seedPalotina(pool); await pool.end(); console.log("Palotina semeada (entidade 12195)");
}
```
> Gestores de Palotina: criados pelo /admin (senha definida pelo admin) — não vão no seed (senha real, nunca em texto).

- [ ] **Step 4: Run test + full suite**

Run: `npx vitest run test/seed-palotina.test.ts && npx vitest run`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add control-plane/scripts/seed-palotina.ts control-plane/test/seed-palotina.test.ts
git commit -m "feat(central): seed idempotente de Palotina + entidade 12195 (TCE/PR)"
```

---

## Self-Review

**Cobertura da spec (épico 4):**
- TV autentica no central (gestor), remove `users.ts` → Task 3. ✓
- Gate de licença (403 bloqueia a TV) → Task 3 (login nunca guarda token em 403). ✓
- Isolamento por `id_entidade` via **RLS** no Postgres do tenant → Task 2. ✓
- Central emite token de dados p/ o PostgREST → Task 1. ✓
- Módulos lidos do central (read-only) → Tasks 1 (GET /me/modulos) + 4. ✓
- Seed Palotina + entidade 12195 → Task 5. ✓

**Decisões resolvidas:** token de dados assinado com segredo do PostgREST (role web_gestor + id_entidade); RLS no tenant; módulos read-only; TV bloqueia sem central/licença; id_entidade = 12195 (TCE/PR, arbitrário, não gerado pelo sistema).

**Consistência:** `assinarDataToken` (T1) ↔ `PGRST_JWT_SECRET` do tenant (T2); `perfil.id_entidade` (Épico 1) → data-token → RLS claim; `tvAuth` (T3) → `pgrst_token` → `api.ts` (T4); `GET /me/modulos` (T1) ↔ `fetchHiddenModules` (T4).

**Riscos/notas:**
- **Task 2 não é testável em pg-mem** — verificação por Postgres real (compose): counts 12195>0 / 99999=0. Portão crítico; não commitar se o isolamento falhar.
- Hoje o banco é single-entity (só Palotina/12195), então o RLS é funcionalmente um no-op no momento — é scaffolding para múltiplas entidades coexistirem depois.
- Segredo `PGRST_JWT_SECRET` compartilhado no MVP (per-tenant = hardening).
- **Fora de escopo (sinalizado):** `.env.palotina` com chaves reais commitadas — rotacionar + `git rm`.
- Hardening herdado (Épicos 1–2): schemas de validação de body, rate-limit no login, 409 em FK-violation.
