# Épico 1 — Central: Fundação (backend + schema + auth) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Pôr de pé o serviço central (Postgres meta + backend Fastify) com schema do domínio e autenticação real (argon2 + JWT), servindo login para o /admin e para a TV.

**Architecture:** Um serviço Node/Fastify novo em `control-plane/`, com Postgres "meta" separado. Auth real: senha com argon2, sessão via JWT longo (30 dias) validado a cada request. Rotas de negócio ficam para o épico 2 — aqui só a fundação (`/auth/login`, `/auth/me`, `/health`) e o schema completo que os épicos 2–4 consomem.

**Tech Stack:** TypeScript, Fastify, @fastify/jwt, pg (node-postgres), argon2. Dev/test: vitest, pg-mem (Postgres em memória p/ testes), tsx.

## Global Constraints

- Runtime: Node ≥ 20, TypeScript (ESM), consistente com o repo.
- Senha **nunca** em texto — só `senha_hash` (argon2) no banco; o hash nunca sai numa resposta.
- JWT: expiração **30 dias**, sem refresh token (decisão do épico). Segredo em `JWT_SECRET` (env).
- `role` do gestor é **só rótulo** — não controla permissão. O que isola é `id_entidade`.
- Código vive no **mesmo repo**, pasta `control-plane/`.
- Testes com **pg-mem** — não exigem Postgres externo rodando.
- Todo commit segue TDD: teste falha → implementação → teste passa → commit.

---

### Task 1: Scaffold do serviço + rota /health

**Files:**
- Create: `control-plane/package.json`
- Create: `control-plane/tsconfig.json`
- Create: `control-plane/vitest.config.ts`
- Create: `control-plane/src/app.ts`
- Create: `control-plane/src/routes/health.ts`
- Test: `control-plane/test/health.test.ts`

**Interfaces:**
- Produces: `buildApp(deps: { pool: Pool }): FastifyInstance` — factory usada por todos os testes e pelo server. `GET /health` → `{ status: 'ok' }`.

- [ ] **Step 1: package.json**

```json
{
  "name": "mirante-control-plane",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc -p tsconfig.json",
    "start": "node dist/server.js",
    "migrate": "tsx scripts/migrate.ts",
    "seed:admin": "tsx scripts/seed-admin.ts",
    "test": "vitest run"
  },
  "dependencies": {
    "@fastify/jwt": "^9.0.0",
    "argon2": "^0.41.1",
    "fastify": "^5.0.0",
    "pg": "^8.13.0"
  },
  "devDependencies": {
    "pg-mem": "^3.0.5",
    "tsx": "^4.19.0",
    "typescript": "^5.6.0",
    "vitest": "^2.1.0",
    "@types/pg": "^8.11.0"
  }
}
```

- [ ] **Step 2: tsconfig.json e vitest.config.ts**

`control-plane/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "outDir": "dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src", "scripts"]
}
```
`control-plane/vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
export default defineConfig({ test: { environment: "node" } });
```

- [ ] **Step 3: Write the failing test** — `control-plane/test/health.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { newDb } from "pg-mem";
import { buildApp } from "../src/app.js";

function testApp() {
  const { Pool } = newDb().adapters.createPg();
  return buildApp({ pool: new Pool() });
}

describe("GET /health", () => {
  it("returns ok", async () => {
    const app = testApp();
    const res = await app.inject({ method: "GET", url: "/health" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: "ok" });
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `cd control-plane && npm install && npx vitest run test/health.test.ts`
Expected: FAIL — `buildApp` not found.

- [ ] **Step 5: Implement `src/routes/health.ts` and `src/app.ts`**

`control-plane/src/routes/health.ts`:
```ts
import type { FastifyInstance } from "fastify";
export async function healthRoutes(app: FastifyInstance) {
  app.get("/health", async () => ({ status: "ok" }));
}
```
`control-plane/src/app.ts`:
```ts
import Fastify, { type FastifyInstance } from "fastify";
import type { Pool } from "pg";
import { healthRoutes } from "./routes/health.js";

export interface Deps { pool: Pool }

export function buildApp(deps: Deps): FastifyInstance {
  const app = Fastify({ logger: false });
  app.decorate("pool", deps.pool);
  app.register(healthRoutes);
  return app;
}

declare module "fastify" {
  interface FastifyInstance { pool: Pool }
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npx vitest run test/health.test.ts`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add control-plane/
git commit -m "feat(central): scaffold Fastify + /health"
```

---

### Task 2: Schema do domínio + runner de migrations

**Files:**
- Create: `control-plane/db/migrations/001_init.sql`
- Create: `control-plane/src/db/migrate.ts`
- Create: `control-plane/scripts/migrate.ts`
- Test: `control-plane/test/migrate.test.ts`

**Interfaces:**
- Produces: `runMigrations(pool: Pool): Promise<void>` — aplica todos os `.sql` de `db/migrations` em ordem. Tabelas: `instalacao, licenca, entidade, gestor, modulo_estado, admin_user, audit_log, acesso_log`.

- [ ] **Step 1: 001_init.sql** (schema completo do PRD)

```sql
CREATE TABLE instalacao (
  id_ibge       text PRIMARY KEY,
  slug          text NOT NULL,
  nome          text NOT NULL,
  uf            text NOT NULL,
  status        text NOT NULL DEFAULT 'a-instalar',  -- ativa|desativada|a-instalar
  criado_em     timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE licenca (
  id_ibge       text PRIMARY KEY REFERENCES instalacao(id_ibge) ON DELETE CASCADE,
  ativo         boolean NOT NULL DEFAULT false,
  validade      date,
  atualizado_em timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE entidade (
  id_entidade   text PRIMARY KEY,
  id_ibge       text NOT NULL REFERENCES instalacao(id_ibge) ON DELETE CASCADE,
  nome          text NOT NULL,
  tipo          text NOT NULL,   -- prefeitura|camara|rpps|saneamento|outra
  criado_em     timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE gestor (
  cpf           text PRIMARY KEY,
  id_ibge       text NOT NULL REFERENCES instalacao(id_ibge) ON DELETE CASCADE,
  id_entidade   text NOT NULL REFERENCES entidade(id_entidade),
  nome          text NOT NULL,
  senha_hash    text NOT NULL,
  role          text NOT NULL,
  criado_em     timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE modulo_estado (
  id_ibge       text NOT NULL REFERENCES instalacao(id_ibge) ON DELETE CASCADE,
  path          text NOT NULL,
  oculto        boolean NOT NULL DEFAULT false,
  atualizado_em timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id_ibge, path)
);
CREATE TABLE admin_user (
  id            serial PRIMARY KEY,
  login         text UNIQUE NOT NULL,
  senha_hash    text NOT NULL,
  nome          text NOT NULL,
  criado_em     timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE audit_log (
  id            serial PRIMARY KEY,
  ator          text NOT NULL,
  acao          text NOT NULL,
  alvo          text,
  payload       jsonb,
  criado_em     timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE acesso_log (
  id            serial PRIMARY KEY,
  cpf           text NOT NULL,
  id_ibge       text NOT NULL,
  id_entidade   text NOT NULL,
  criado_em     timestamptz NOT NULL DEFAULT now()
);
```

- [ ] **Step 2: Write the failing test** — `control-plane/test/migrate.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { newDb } from "pg-mem";
import { runMigrations } from "../src/db/migrate.js";

describe("runMigrations", () => {
  it("creates all domain tables", async () => {
    const mem = newDb();
    const { Pool } = mem.adapters.createPg();
    const pool = new Pool();
    await runMigrations(pool);
    const res = await pool.query(
      "select table_name from information_schema.tables where table_schema='public' order by table_name"
    );
    const names = res.rows.map((r: any) => r.table_name);
    expect(names).toEqual(
      ["acesso_log","admin_user","audit_log","entidade","gestor","instalacao","licenca","modulo_estado"]
    );
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run test/migrate.test.ts`
Expected: FAIL — `runMigrations` not found.

- [ ] **Step 4: Implement `src/db/migrate.ts` e `scripts/migrate.ts`**

`control-plane/src/db/migrate.ts`:
```ts
import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import type { Pool } from "pg";

const here = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = join(here, "..", "..", "db", "migrations");

export async function runMigrations(pool: Pool): Promise<void> {
  const files = (await readdir(MIGRATIONS_DIR)).filter((f) => f.endsWith(".sql")).sort();
  for (const f of files) {
    const sql = await readFile(join(MIGRATIONS_DIR, f), "utf8");
    await pool.query(sql);
  }
}
```
`control-plane/scripts/migrate.ts`:
```ts
import { Pool } from "pg";
import { runMigrations } from "../src/db/migrate.js";
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
await runMigrations(pool);
await pool.end();
console.log("migrations applied");
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run test/migrate.test.ts`
Expected: PASS. (Se o pg-mem reclamar de algum tipo, prefira ajustar o teste com `newDb({ noAstCoverageCheck: true })`; não simplifique o schema real.)

- [ ] **Step 6: Commit**

```bash
git add control-plane/db control-plane/src/db control-plane/scripts control-plane/test/migrate.test.ts
git commit -m "feat(central): schema do domínio + runner de migrations"
```

---

### Task 3: Hashing de senha (argon2)

**Files:**
- Create: `control-plane/src/auth/hash.ts`
- Test: `control-plane/test/hash.test.ts`

**Interfaces:**
- Produces: `hashSenha(plain: string): Promise<string>` e `verificarSenha(hash: string, plain: string): Promise<boolean>`.

- [ ] **Step 1: Write the failing test** — `control-plane/test/hash.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { hashSenha, verificarSenha } from "../src/auth/hash.js";

describe("hash de senha", () => {
  it("verifica a senha correta e rejeita a errada", async () => {
    const hash = await hashSenha("segredo123");
    expect(hash).not.toContain("segredo123");
    expect(await verificarSenha(hash, "segredo123")).toBe(true);
    expect(await verificarSenha(hash, "errada")).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/hash.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/auth/hash.ts`**

```ts
import argon2 from "argon2";
export const hashSenha = (plain: string) => argon2.hash(plain);
export async function verificarSenha(hash: string, plain: string): Promise<boolean> {
  try { return await argon2.verify(hash, plain); } catch { return false; }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run test/hash.test.ts`
Expected: PASS. (Se o argon2 native falhar de compilar no ambiente, é bloqueio de infra — resolver antes de seguir; não trocar para bcrypt sem falar com o dono.)

- [ ] **Step 5: Commit**

```bash
git add control-plane/src/auth/hash.ts control-plane/test/hash.test.ts
git commit -m "feat(central): hashing de senha com argon2"
```

---

### Task 4: Plugin JWT + rota /auth/me

**Files:**
- Create: `control-plane/src/auth/routes.ts`
- Modify: `control-plane/src/app.ts` (registrar jwt + authRoutes)
- Test: `control-plane/test/me.test.ts`

**Interfaces:**
- Produces: decorator `app.authenticate` (preHandler que exige JWT válido); `GET /auth/me` → devolve o payload do token. Payload padrão: `{ sub, tipo: 'admin'|'gestor', nome, role?, id_entidade?, id_ibge? }`. `buildApp` passa a aceitar `jwtSecret?`.

- [ ] **Step 1: Write the failing test** — `control-plane/test/me.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { newDb } from "pg-mem";
import { buildApp } from "../src/app.js";

function testApp() {
  const { Pool } = newDb().adapters.createPg();
  return buildApp({ pool: new Pool(), jwtSecret: "test-secret" });
}

describe("GET /auth/me", () => {
  it("401 sem token", async () => {
    const app = testApp();
    const res = await app.inject({ method: "GET", url: "/auth/me" });
    expect(res.statusCode).toBe(401);
  });
  it("devolve o payload com token válido", async () => {
    const app = testApp();
    await app.ready();
    const token = app.jwt.sign({ sub: "1", tipo: "admin", nome: "Admin" });
    const res = await app.inject({
      method: "GET", url: "/auth/me",
      headers: { authorization: `Bearer ${token}` },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ sub: "1", tipo: "admin", nome: "Admin" });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/me.test.ts`
Expected: FAIL — `jwtSecret` não aceito / rota inexistente.

- [ ] **Step 3: Implement rota + atualizar app.ts**

`control-plane/src/auth/routes.ts`:
```ts
import type { FastifyInstance } from "fastify";
export async function authRoutes(app: FastifyInstance) {
  app.get("/auth/me", { preHandler: [app.authenticate] }, async (req) => req.user);
}
```
`control-plane/src/app.ts` (atualizado):
```ts
import Fastify, { type FastifyInstance, type FastifyRequest, type FastifyReply } from "fastify";
import fastifyJwt from "@fastify/jwt";
import type { Pool } from "pg";
import { healthRoutes } from "./routes/health.js";
import { authRoutes } from "./auth/routes.js";

export interface Deps { pool: Pool; jwtSecret?: string }

export function buildApp(deps: Deps): FastifyInstance {
  const app = Fastify({ logger: false });
  app.decorate("pool", deps.pool);
  app.register(fastifyJwt, { secret: deps.jwtSecret ?? process.env.JWT_SECRET ?? "dev-secret" });
  app.decorate("authenticate", async (req: FastifyRequest, reply: FastifyReply) => {
    try { await req.jwtVerify(); } catch { reply.code(401).send({ error: "unauthorized" }); }
  });
  app.register(healthRoutes);
  app.register(authRoutes);
  return app;
}

declare module "fastify" {
  interface FastifyInstance {
    pool: Pool;
    authenticate: (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run test/me.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add control-plane/src control-plane/test/me.test.ts
git commit -m "feat(central): plugin JWT + /auth/me"
```

---

### Task 5: /auth/login do admin

**Files:**
- Create: `control-plane/src/auth/login.ts` (lógica de login, sem Fastify)
- Modify: `control-plane/src/auth/routes.ts` (POST /auth/login)
- Test: `control-plane/test/login-admin.test.ts`

**Interfaces:**
- Consumes: `verificarSenha` (Task 3), `app.jwt` (Task 4).
- Produces: `loginAdmin(pool, login, senha): Promise<PerfilAdmin | null>`. `POST /auth/login` body `{ tipo:'admin', login, senha }` → `{ token, perfil }` (200) ou 401. Payload do token admin: `{ sub, tipo:'admin', nome }`, expiração 30d.

- [ ] **Step 1: Write the failing test** — `control-plane/test/login-admin.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { newDb } from "pg-mem";
import { buildApp } from "../src/app.js";
import { runMigrations } from "../src/db/migrate.js";
import { hashSenha } from "../src/auth/hash.js";

async function setup() {
  const { Pool } = newDb().adapters.createPg();
  const pool = new Pool();
  await runMigrations(pool);
  await pool.query(
    "insert into admin_user (login, senha_hash, nome) values ($1,$2,$3)",
    ["op", await hashSenha("senha-forte"), "Operador"]
  );
  return buildApp({ pool, jwtSecret: "test-secret" });
}

describe("POST /auth/login (admin)", () => {
  it("200 com credencial válida", async () => {
    const app = await setup();
    const res = await app.inject({ method: "POST", url: "/auth/login",
      payload: { tipo: "admin", login: "op", senha: "senha-forte" } });
    expect(res.statusCode).toBe(200);
    expect(res.json().token).toBeTruthy();
    expect(res.json().perfil).toMatchObject({ tipo: "admin", nome: "Operador" });
  });
  it("401 com senha errada", async () => {
    const app = await setup();
    const res = await app.inject({ method: "POST", url: "/auth/login",
      payload: { tipo: "admin", login: "op", senha: "errada" } });
    expect(res.statusCode).toBe(401);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/login-admin.test.ts`
Expected: FAIL — rota /auth/login inexistente.

- [ ] **Step 3: Implement `src/auth/login.ts` + rota**

`control-plane/src/auth/login.ts`:
```ts
import type { Pool } from "pg";
import { verificarSenha } from "./hash.js";

export interface PerfilAdmin { sub: string; tipo: "admin"; nome: string }

export async function loginAdmin(pool: Pool, login: string, senha: string): Promise<PerfilAdmin | null> {
  const { rows } = await pool.query(
    "select id, nome, senha_hash from admin_user where login=$1", [login]
  );
  if (rows.length === 0) return null;
  const ok = await verificarSenha(rows[0].senha_hash, senha);
  if (!ok) return null;
  return { sub: String(rows[0].id), tipo: "admin", nome: rows[0].nome };
}
```
Atualize `src/auth/routes.ts`:
```ts
import type { FastifyInstance } from "fastify";
import { loginAdmin } from "./login.js";

const TOKEN_OPTS = { expiresIn: "30d" };

export async function authRoutes(app: FastifyInstance) {
  app.post("/auth/login", async (req, reply) => {
    const body = req.body as { tipo: string; login?: string; senha?: string };
    if (body.tipo === "admin") {
      const perfil = await loginAdmin(app.pool, body.login ?? "", body.senha ?? "");
      if (!perfil) return reply.code(401).send({ error: "credenciais inválidas" });
      const token = app.jwt.sign(perfil, TOKEN_OPTS);
      return { token, perfil };
    }
    return reply.code(400).send({ error: "tipo inválido" });
  });

  app.get("/auth/me", { preHandler: [app.authenticate] }, async (req) => req.user);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run test/login-admin.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add control-plane/src/auth control-plane/test/login-admin.test.ts
git commit -m "feat(central): POST /auth/login para admin"
```

---

### Task 6: /auth/login do gestor (id_entidade + licença + acesso_log)

**Files:**
- Modify: `control-plane/src/auth/login.ts` (loginGestor)
- Modify: `control-plane/src/auth/routes.ts` (ramo tipo:'gestor')
- Test: `control-plane/test/login-gestor.test.ts`

**Interfaces:**
- Produces: `loginGestor(pool, cpf, senha): Promise<PerfilGestor | { erro: 'credencial' | 'licenca' }>`. Payload token gestor: `{ sub: cpf, tipo:'gestor', nome, role, id_entidade, id_ibge }`. Login bem-sucedido grava `acesso_log`. Licença inativa/vencida → 403.

- [ ] **Step 1: Write the failing test** — `control-plane/test/login-gestor.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { newDb } from "pg-mem";
import { buildApp } from "../src/app.js";
import { runMigrations } from "../src/db/migrate.js";
import { hashSenha } from "../src/auth/hash.js";

async function setup(opts: { ativo: boolean; validade: string }) {
  const { Pool } = newDb().adapters.createPg();
  const pool = new Pool();
  await runMigrations(pool);
  await pool.query("insert into instalacao (id_ibge, slug, nome, uf, status) values ('4117909','palotina','Palotina','PR','ativa')");
  await pool.query("insert into licenca (id_ibge, ativo, validade) values ('4117909',$1,$2)", [opts.ativo, opts.validade]);
  await pool.query("insert into entidade (id_entidade, id_ibge, nome, tipo) values ('ent-pref','4117909','Prefeitura','prefeitura')");
  await pool.query(
    "insert into gestor (cpf, id_ibge, id_entidade, nome, senha_hash, role) values ($1,'4117909','ent-pref','Prefeito',$2,'prefeito')",
    ["07320700905", await hashSenha("segredo")]
  );
  return { app: buildApp({ pool, jwtSecret: "test-secret" }), pool };
}

describe("POST /auth/login (gestor)", () => {
  it("200 + id_entidade e grava acesso_log", async () => {
    const { app, pool } = await setup({ ativo: true, validade: "2999-01-01" });
    const res = await app.inject({ method: "POST", url: "/auth/login",
      payload: { tipo: "gestor", cpf: "07320700905", senha: "segredo" } });
    expect(res.statusCode).toBe(200);
    expect(res.json().perfil).toMatchObject({ tipo: "gestor", id_entidade: "ent-pref", id_ibge: "4117909", role: "prefeito" });
    const log = await pool.query("select cpf, id_entidade from acesso_log");
    expect(log.rows[0]).toMatchObject({ cpf: "07320700905", id_entidade: "ent-pref" });
  });
  it("401 senha errada", async () => {
    const { app } = await setup({ ativo: true, validade: "2999-01-01" });
    const res = await app.inject({ method: "POST", url: "/auth/login",
      payload: { tipo: "gestor", cpf: "07320700905", senha: "x" } });
    expect(res.statusCode).toBe(401);
  });
  it("403 licença vencida", async () => {
    const { app } = await setup({ ativo: true, validade: "2000-01-01" });
    const res = await app.inject({ method: "POST", url: "/auth/login",
      payload: { tipo: "gestor", cpf: "07320700905", senha: "segredo" } });
    expect(res.statusCode).toBe(403);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/login-gestor.test.ts`
Expected: FAIL — ramo gestor inexistente.

- [ ] **Step 3: Implement loginGestor + ramo na rota**

Adicione em `src/auth/login.ts`:
```ts
export interface PerfilGestor {
  sub: string; tipo: "gestor"; nome: string; role: string; id_entidade: string; id_ibge: string;
}
type LoginGestorResult = PerfilGestor | { erro: "credencial" | "licenca" };

export async function loginGestor(pool: Pool, cpf: string, senha: string): Promise<LoginGestorResult> {
  const cpfLimpo = cpf.replace(/\D/g, "");
  const { rows } = await pool.query(
    `select g.cpf, g.nome, g.role, g.id_entidade, g.id_ibge, g.senha_hash,
            l.ativo, l.validade
       from gestor g join licenca l on l.id_ibge = g.id_ibge
      where g.cpf = $1`, [cpfLimpo]
  );
  if (rows.length === 0) return { erro: "credencial" };
  const r = rows[0];
  if (!(await verificarSenha(r.senha_hash, senha))) return { erro: "credencial" };
  const vencida = r.validade && new Date(r.validade) < new Date();
  if (!r.ativo || vencida) return { erro: "licenca" };
  await pool.query(
    "insert into acesso_log (cpf, id_ibge, id_entidade) values ($1,$2,$3)",
    [r.cpf, r.id_ibge, r.id_entidade]
  );
  return { sub: r.cpf, tipo: "gestor", nome: r.nome, role: r.role, id_entidade: r.id_entidade, id_ibge: r.id_ibge };
}
```
Atualize o handler `/auth/login` em `src/auth/routes.ts` (adicione ramo antes do 400 e importe `loginGestor`):
```ts
    if (body.tipo === "gestor") {
      const b = req.body as { cpf?: string; senha?: string };
      const r = await loginGestor(app.pool, b.cpf ?? "", b.senha ?? "");
      if ("erro" in r) {
        return reply.code(r.erro === "licenca" ? 403 : 401)
          .send({ error: r.erro === "licenca" ? "licença inativa ou vencida" : "credenciais inválidas" });
      }
      const token = app.jwt.sign(r, TOKEN_OPTS);
      return { token, perfil: r };
    }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run test/login-gestor.test.ts`
Expected: PASS (3 casos).

- [ ] **Step 5: Commit**

```bash
git add control-plane/src/auth control-plane/test/login-gestor.test.ts
git commit -m "feat(central): login de gestor com id_entidade, checagem de licença e acesso_log"
```

---

### Task 7: Server entrypoint + seed admin + Docker/compose

**Files:**
- Create: `control-plane/src/server.ts`
- Create: `control-plane/scripts/seed-admin.ts`
- Create: `control-plane/Dockerfile`
- Create: `control-plane/.env.example`
- Modify: `docker-compose.yml` (serviço `control-plane` + `central-db`)
- Test: `control-plane/test/seed-admin.test.ts`

**Interfaces:**
- Consumes: `buildApp`, `runMigrations`, `hashSenha`.
- Produces: `seedAdmin(pool, login, senha, nome): Promise<void>` (idempotente — upsert por `login`). `server.ts` sobe o app na porta `PORT`.

- [ ] **Step 1: Write the failing test** — `control-plane/test/seed-admin.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { newDb } from "pg-mem";
import { runMigrations } from "../src/db/migrate.js";
import { seedAdmin } from "../scripts/seed-admin.js";
import { verificarSenha } from "../src/auth/hash.js";

describe("seedAdmin", () => {
  it("insere admin com senha hasheada e é idempotente", async () => {
    const { Pool } = newDb().adapters.createPg();
    const pool = new Pool();
    await runMigrations(pool);
    await seedAdmin(pool, "op", "senha-forte", "Operador");
    await seedAdmin(pool, "op", "senha-forte", "Operador"); // 2ª vez não duplica
    const { rows } = await pool.query("select login, senha_hash, nome from admin_user");
    expect(rows).toHaveLength(1);
    expect(rows[0].senha_hash).not.toContain("senha-forte");
    expect(await verificarSenha(rows[0].senha_hash, "senha-forte")).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/seed-admin.test.ts`
Expected: FAIL — `seedAdmin` not found.

- [ ] **Step 3: Implement seed, server, Dockerfile, .env, compose**

`control-plane/scripts/seed-admin.ts`:
```ts
import { Pool } from "pg";
import { hashSenha } from "../src/auth/hash.js";

export async function seedAdmin(pool: Pool, login: string, senha: string, nome: string) {
  const hash = await hashSenha(senha);
  await pool.query(
    `insert into admin_user (login, senha_hash, nome) values ($1,$2,$3)
       on conflict (login) do update set senha_hash=excluded.senha_hash, nome=excluded.nome`,
    [login, hash, nome]
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  await seedAdmin(pool, process.env.ADMIN_LOGIN!, process.env.ADMIN_SENHA!, process.env.ADMIN_NOME ?? "Administrador");
  await pool.end();
  console.log("admin semeado");
}
```
`control-plane/src/server.ts`:
```ts
import { Pool } from "pg";
import { buildApp } from "./app.js";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const app = buildApp({ pool, jwtSecret: process.env.JWT_SECRET });
const port = Number(process.env.PORT ?? 8080);
app.listen({ port, host: "0.0.0.0" }).then(() => console.log(`control-plane on :${port}`));
```
`control-plane/.env.example`:
```
DATABASE_URL=postgres://central:central@central-db:5432/central
JWT_SECRET=troque-isto-em-producao
PORT=8080
ADMIN_LOGIN=admin
ADMIN_SENHA=troque-isto
ADMIN_NOME=Administrador
```
`control-plane/Dockerfile`:
```dockerfile
FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache python3 make g++   # argon2 native build
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["sh","-c","npm run migrate && node dist/server.js"]
```
Adicionar ao `docker-compose.yml` (serviços novos + volume):
```yaml
  central-db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: central
      POSTGRES_PASSWORD: central
      POSTGRES_DB: central
    volumes: [ "central-db-data:/var/lib/postgresql/data" ]
  control-plane:
    build: ./control-plane
    env_file: ./control-plane/.env
    depends_on: [ central-db ]
    ports: [ "8080:8080" ]
# em volumes:, adicionar  central-db-data: {}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run test/seed-admin.test.ts`
Expected: PASS.

- [ ] **Step 5: Rodar a suíte inteira**

Run: `npx vitest run`
Expected: todos os testes verdes (health, migrate, hash, me, login-admin, login-gestor, seed-admin).

- [ ] **Step 6: Commit**

```bash
git add control-plane docker-compose.yml
git commit -m "feat(central): server entrypoint, seed admin idempotente e Docker/compose"
```

---

## Self-Review

**Cobertura da spec (épico 1):**
- Serviço Fastify + Postgres central → Tasks 1, 7. ✓
- Schema completo (8 tabelas) → Task 2. ✓
- Auth real (argon2 + JWT) → Tasks 3, 4, 5, 6. ✓
- `/auth/login` admin e gestor → Tasks 5, 6. ✓
- `/auth/me`, `/health` → Tasks 4, 1. ✓
- Seed admin hasheado → Task 7. ✓
- `acesso_log` no login de gestor + tabela `audit_log` criadas → Tasks 2, 6. ✓
- Compose no VPS → Task 7. ✓

**Critérios de aceite da spec:**
- Migrations em Postgres limpo → Task 2 + `npm run migrate` (Task 7). ✓
- Login admin válido/inválido → Task 5. ✓
- Rota protegida sem/com JWT → Task 4. ✓
- Senha do seed hasheada → Task 7. ✓
- Serviço sobe e responde /health → Tasks 1, 7. ✓

**Questões da spec resolvidas:** `role` = só rótulo (Global Constraints); JWT 30d sem refresh (Global Constraints).

**Consistência de tipos:** `PerfilAdmin`/`PerfilGestor` definidos nas Tasks 5/6 e usados na rota; `buildApp(Deps)` estável desde a Task 1 (`jwtSecret` adicionado na Task 4); `runMigrations(pool)`, `hashSenha`/`verificarSenha` consistentes entre tasks.

**Nota de infra:** `audit_log` só é *escrito* a partir do épico 2 (mutações); no épico 1 a tabela existe e o `acesso_log` já é escrito no login de gestor.
