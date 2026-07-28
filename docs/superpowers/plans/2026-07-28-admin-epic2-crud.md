# Épico 2 — /admin: CRUD (instalações, entidades, gestores, licenças, módulos) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Operar o control plane de ponta a ponta: endpoints REST de negócio (protegidos por JWT, cada mutação grava `audit_log`) e a SPA `/admin` que provisiona instalação → entidades → licença → gestores → módulos.

**Architecture:** Backend estende o serviço `control-plane/` (Fastify + pg do Épico 1) com rotas de negócio sob `app.authenticate`. Frontend é uma SEGUNDA SPA Vite no mesmo repo da TV (novo entry `admin.html` + `src/admin/`), reusando `theme.tsx`/`components.tsx`/`router.tsx`, com um client JWT próprio (`cpApi`) que fala com o control-plane (não com o PostgREST do tenant).

**Tech Stack:** Backend: Fastify 5, pg, @fastify/jwt (já instalados), vitest + pg-mem. Frontend: React 18 + Vite 5 (multi-page), Testing-Library + jsdom (config existente cobre `src/**`).

## Global Constraints

- Backend novo vive em `control-plane/` (Épico 1); frontend `/admin` em `src/admin/` no repo da TV.
- Toda rota de negócio exige JWT de **admin** via `app.authenticate` (preHandler do Épico 1). Payload admin: `{ sub, tipo:'admin', nome }`.
- **Toda criação/edição/remoção grava `audit_log`** com `ator` (nome ou sub do admin logado), `acao`, `alvo`, `payload` (jsonb).
- `senha_hash` **nunca** volta numa resposta; senha de gestor é hasheada com `hashSenha` (Épico 1).
- **Reset de senha do gestor: o admin define** a nova senha (não é gerada aleatória).
- **Gestor → entidade é 1:1 fixo** (`id_entidade`); CPF só dígitos, 11 posições.
- **Catálogo de módulos = `NAV_GROUPS` da TV** (já exportado em `src/App.tsx`). O backend só persiste `modulo_estado(id_ibge, path, oculto)`; a lista de paths disponíveis vem do frontend importando `NAV_GROUPS`. Módulos na TV são **read-only** (só o /admin altera).
- `status` da instalação é **só registro** — sem orquestração de container.
- TypeScript ESM (`.js` nos imports do backend); frontend segue o padrão atual da TV (inline styles do token `t`, sem novo framework).
- TDD: teste falha → implementação → teste passa → commit. Backend testa com pg-mem; frontend com Testing-Library.
- Client `cpApi` usa base `window.__CP_URL__` (fallback dev `http://localhost:8080`) e header `Authorization: Bearer <token>`.

---

## Parte A — Backend (control-plane): endpoints de negócio

### Task 1: Helper de auditoria + rotas de instalação (CRUD)

**Files:**
- Create: `control-plane/src/audit.ts`
- Create: `control-plane/src/routes/instalacoes.ts`
- Modify: `control-plane/src/app.ts` (registrar `instalacoesRoutes`)
- Test: `control-plane/test/instalacoes.test.ts`

**Interfaces:**
- Consumes: `app.authenticate`, `app.pool`, `req.user` (Épico 1).
- Produces:
  - `logAudit(pool, e: { ator: string; acao: string; alvo?: string; payload?: unknown }): Promise<void>` — insere em `audit_log`.
  - Rotas (todas sob `app.authenticate`):
    - `GET /instalacoes` → lista `{ id_ibge, slug, nome, uf, status }[]`
    - `POST /instalacoes` body `{ id_ibge, slug, nome, uf }` → cria (status `a-instalar`), grava audit, 201
    - `GET /instalacoes/:id` → detalhe (instalação + licença se houver)
    - `PATCH /instalacoes/:id` body parcial `{ slug?, nome?, uf?, status? }` → atualiza, grava audit
    - `DELETE /instalacoes/:id` → remove (cascata), grava audit, 204

- [ ] **Step 1: Write the failing test** — `control-plane/test/instalacoes.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { newDb } from "pg-mem";
import { buildApp } from "../src/app.js";
import { runMigrations } from "../src/db/migrate.js";

async function setup() {
  const { Pool } = newDb().adapters.createPg();
  const pool = new Pool();
  await runMigrations(pool);
  const app = buildApp({ pool, jwtSecret: "test-secret" });
  await app.ready();
  const token = app.jwt.sign({ sub: "1", tipo: "admin", nome: "Op" });
  return { app, pool, token };
}
const auth = (token: string) => ({ authorization: `Bearer ${token}` });

describe("instalacoes CRUD", () => {
  it("401 sem token", async () => {
    const { app } = await setup();
    const res = await app.inject({ method: "GET", url: "/instalacoes" });
    expect(res.statusCode).toBe(401);
  });
  it("cria, lista, edita, remove e grava audit_log", async () => {
    const { app, pool, token } = await setup();
    const post = await app.inject({ method: "POST", url: "/instalacoes", headers: auth(token),
      payload: { id_ibge: "4117909", slug: "palotina", nome: "Palotina", uf: "PR" } });
    expect(post.statusCode).toBe(201);
    expect(post.json()).toMatchObject({ id_ibge: "4117909", status: "a-instalar" });

    const list = await app.inject({ method: "GET", url: "/instalacoes", headers: auth(token) });
    expect(list.json()).toHaveLength(1);

    const patch = await app.inject({ method: "PATCH", url: "/instalacoes/4117909", headers: auth(token),
      payload: { status: "ativa" } });
    expect(patch.statusCode).toBe(200);
    const get = await app.inject({ method: "GET", url: "/instalacoes/4117909", headers: auth(token) });
    expect(get.json()).toMatchObject({ status: "ativa" });

    const del = await app.inject({ method: "DELETE", url: "/instalacoes/4117909", headers: auth(token) });
    expect(del.statusCode).toBe(204);
    const list2 = await app.inject({ method: "GET", url: "/instalacoes", headers: auth(token) });
    expect(list2.json()).toHaveLength(0);

    const audit = await pool.query("select acao, alvo from audit_log order by id");
    expect(audit.rows.map((r: any) => r.acao)).toEqual(["criou", "editou", "removeu"]);
    expect(audit.rows.every((r: any) => r.alvo === "instalacao:4117909")).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd control-plane && npx vitest run test/instalacoes.test.ts`
Expected: FAIL — rotas inexistentes (404/401 no POST).

- [ ] **Step 3: Implement `src/audit.ts`**

```ts
import type { Pool } from "pg";

export async function logAudit(
  pool: Pool,
  e: { ator: string; acao: string; alvo?: string; payload?: unknown }
): Promise<void> {
  await pool.query(
    "insert into audit_log (ator, acao, alvo, payload) values ($1,$2,$3,$4)",
    [e.ator, e.acao, e.alvo ?? null, e.payload ? JSON.stringify(e.payload) : null]
  );
}
```

- [ ] **Step 4: Implement `src/routes/instalacoes.ts`**

```ts
import type { FastifyInstance, FastifyRequest } from "fastify";
import { logAudit } from "../audit.js";

const ator = (req: FastifyRequest) => {
  const u = req.user as { nome?: string; sub?: string };
  return u?.nome ?? u?.sub ?? "?";
};

export async function instalacoesRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.authenticate);

  app.get("/instalacoes", async () => {
    const { rows } = await app.pool.query(
      "select id_ibge, slug, nome, uf, status from instalacao order by nome"
    );
    return rows;
  });

  app.post("/instalacoes", async (req, reply) => {
    const b = req.body as { id_ibge: string; slug: string; nome: string; uf: string };
    const { rows } = await app.pool.query(
      `insert into instalacao (id_ibge, slug, nome, uf) values ($1,$2,$3,$4)
       returning id_ibge, slug, nome, uf, status`,
      [b.id_ibge, b.slug, b.nome, b.uf]
    );
    await logAudit(app.pool, { ator: ator(req), acao: "criou", alvo: `instalacao:${b.id_ibge}`, payload: b });
    return reply.code(201).send(rows[0]);
  });

  app.get("/instalacoes/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const { rows } = await app.pool.query(
      `select i.id_ibge, i.slug, i.nome, i.uf, i.status,
              l.ativo as licenca_ativo, l.validade as licenca_validade
         from instalacao i left join licenca l on l.id_ibge = i.id_ibge
        where i.id_ibge = $1`, [id]
    );
    if (rows.length === 0) return reply.code(404).send({ error: "não encontrada" });
    return rows[0];
  });

  app.patch("/instalacoes/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const b = req.body as Partial<{ slug: string; nome: string; uf: string; status: string }>;
    const campos = ["slug", "nome", "uf", "status"].filter((c) => b[c as keyof typeof b] != null);
    if (campos.length === 0) return reply.code(400).send({ error: "nada para atualizar" });
    const sets = campos.map((c, i) => `${c}=$${i + 2}`).join(", ");
    const vals = campos.map((c) => b[c as keyof typeof b]);
    const { rows } = await app.pool.query(
      `update instalacao set ${sets}, atualizado_em=now() where id_ibge=$1
       returning id_ibge, slug, nome, uf, status`, [id, ...vals]
    );
    if (rows.length === 0) return reply.code(404).send({ error: "não encontrada" });
    await logAudit(app.pool, { ator: ator(req), acao: "editou", alvo: `instalacao:${id}`, payload: b });
    return rows[0];
  });

  app.delete("/instalacoes/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const { rowCount } = await app.pool.query("delete from instalacao where id_ibge=$1", [id]);
    if (!rowCount) return reply.code(404).send({ error: "não encontrada" });
    await logAudit(app.pool, { ator: ator(req), acao: "removeu", alvo: `instalacao:${id}` });
    return reply.code(204).send();
  });
}
```

- [ ] **Step 5: Register in `src/app.ts`**

Add import and `app.register(instalacoesRoutes);` alongside the existing `healthRoutes`/`authRoutes` registrations. Do not remove anything.

```ts
import { instalacoesRoutes } from "./routes/instalacoes.js";
// ...
  app.register(instalacoesRoutes);
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npx vitest run test/instalacoes.test.ts`
Expected: PASS (2 casos).

- [ ] **Step 7: Commit**

```bash
git add control-plane/src control-plane/test/instalacoes.test.ts
git commit -m "feat(admin-api): CRUD de instalações + auditoria"
```

---

### Task 2: Entidades + gestores (CRUD aninhado)

**Files:**
- Create: `control-plane/src/routes/entidades.ts`
- Create: `control-plane/src/routes/gestores.ts`
- Modify: `control-plane/src/app.ts` (registrar as duas)
- Test: `control-plane/test/entidades.test.ts`, `control-plane/test/gestores.test.ts`

**Interfaces:**
- Consumes: `logAudit` (Task 1), `hashSenha` (Épico 1), `app.authenticate`.
- Produces (todas sob `app.authenticate`):
  - `GET /instalacoes/:id/entidades`, `POST /instalacoes/:id/entidades` body `{ id_entidade, nome, tipo }`
  - `PATCH /entidades/:id_entidade`, `DELETE /entidades/:id_entidade`
  - `GET /instalacoes/:id/gestores` (sem `senha_hash`), `POST /instalacoes/:id/gestores` body `{ cpf, nome, senha, role, id_entidade }` (senha hasheada; CPF só dígitos, 11)
  - `PATCH /gestores/:cpf` body `{ nome?, role?, id_entidade?, senha? }` (senha, se vier, re-hasheada — **admin define**)
  - `DELETE /gestores/:cpf`

- [ ] **Step 1: Write the failing test — entidades** — `control-plane/test/entidades.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { newDb } from "pg-mem";
import { buildApp } from "../src/app.js";
import { runMigrations } from "../src/db/migrate.js";

async function setup() {
  const { Pool } = newDb().adapters.createPg();
  const pool = new Pool();
  await runMigrations(pool);
  await pool.query("insert into instalacao (id_ibge, slug, nome, uf) values ('4117909','palotina','Palotina','PR')");
  const app = buildApp({ pool, jwtSecret: "s" });
  await app.ready();
  return { app, pool, token: app.jwt.sign({ sub: "1", tipo: "admin", nome: "Op" }) };
}
const auth = (t: string) => ({ authorization: `Bearer ${t}` });

describe("entidades CRUD", () => {
  it("cria, lista, edita e remove entidade", async () => {
    const { app, token } = await setup();
    const post = await app.inject({ method: "POST", url: "/instalacoes/4117909/entidades", headers: auth(token),
      payload: { id_entidade: "ent-pref", nome: "Prefeitura", tipo: "prefeitura" } });
    expect(post.statusCode).toBe(201);
    const list = await app.inject({ method: "GET", url: "/instalacoes/4117909/entidades", headers: auth(token) });
    expect(list.json()).toHaveLength(1);
    const patch = await app.inject({ method: "PATCH", url: "/entidades/ent-pref", headers: auth(token),
      payload: { nome: "Prefeitura Municipal" } });
    expect(patch.json()).toMatchObject({ nome: "Prefeitura Municipal" });
    const del = await app.inject({ method: "DELETE", url: "/entidades/ent-pref", headers: auth(token) });
    expect(del.statusCode).toBe(204);
  });
});
```

- [ ] **Step 2: Write the failing test — gestores** — `control-plane/test/gestores.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { newDb } from "pg-mem";
import { buildApp } from "../src/app.js";
import { runMigrations } from "../src/db/migrate.js";
import { verificarSenha } from "../src/auth/hash.js";

async function setup() {
  const { Pool } = newDb().adapters.createPg();
  const pool = new Pool();
  await runMigrations(pool);
  await pool.query("insert into instalacao (id_ibge, slug, nome, uf) values ('4117909','palotina','Palotina','PR')");
  await pool.query("insert into entidade (id_entidade, id_ibge, nome, tipo) values ('ent-pref','4117909','Prefeitura','prefeitura')");
  const app = buildApp({ pool, jwtSecret: "s" });
  await app.ready();
  return { app, pool, token: app.jwt.sign({ sub: "1", tipo: "admin", nome: "Op" }) };
}
const auth = (t: string) => ({ authorization: `Bearer ${t}` });

describe("gestores CRUD", () => {
  it("cria gestor com senha hasheada; listagem não vaza hash", async () => {
    const { app, pool, token } = await setup();
    const post = await app.inject({ method: "POST", url: "/instalacoes/4117909/gestores", headers: auth(token),
      payload: { cpf: "073.207.009-05", nome: "Prefeito", senha: "segredo", role: "prefeito", id_entidade: "ent-pref" } });
    expect(post.statusCode).toBe(201);
    expect(JSON.stringify(post.json())).not.toContain("senha_hash");

    const row = await pool.query("select cpf, senha_hash from gestor");
    expect(row.rows[0].cpf).toBe("07320700905"); // só dígitos
    expect(await verificarSenha(row.rows[0].senha_hash, "segredo")).toBe(true);

    const list = await app.inject({ method: "GET", url: "/instalacoes/4117909/gestores", headers: auth(token) });
    expect(JSON.stringify(list.json())).not.toContain("senha_hash");
  });
  it("PATCH com senha re-hasheia (admin define)", async () => {
    const { app, pool, token } = await setup();
    await app.inject({ method: "POST", url: "/instalacoes/4117909/gestores", headers: auth(token),
      payload: { cpf: "07320700905", nome: "P", senha: "velha", role: "prefeito", id_entidade: "ent-pref" } });
    const patch = await app.inject({ method: "PATCH", url: "/gestores/07320700905", headers: auth(token),
      payload: { senha: "novaSenha" } });
    expect(patch.statusCode).toBe(200);
    const row = await pool.query("select senha_hash from gestor where cpf='07320700905'");
    expect(await verificarSenha(row.rows[0].senha_hash, "novaSenha")).toBe(true);
  });
  it("400 CPF inválido", async () => {
    const { app, token } = await setup();
    const res = await app.inject({ method: "POST", url: "/instalacoes/4117909/gestores", headers: auth(token),
      payload: { cpf: "123", nome: "X", senha: "y", role: "prefeito", id_entidade: "ent-pref" } });
    expect(res.statusCode).toBe(400);
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npx vitest run test/entidades.test.ts test/gestores.test.ts`
Expected: FAIL — rotas inexistentes.

- [ ] **Step 4: Implement `src/routes/entidades.ts`**

```ts
import type { FastifyInstance, FastifyRequest } from "fastify";
import { logAudit } from "../audit.js";

const ator = (req: FastifyRequest) => {
  const u = req.user as { nome?: string; sub?: string };
  return u?.nome ?? u?.sub ?? "?";
};

export async function entidadesRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.authenticate);

  app.get("/instalacoes/:id/entidades", async (req) => {
    const { id } = req.params as { id: string };
    const { rows } = await app.pool.query(
      "select id_entidade, id_ibge, nome, tipo from entidade where id_ibge=$1 order by nome", [id]
    );
    return rows;
  });

  app.post("/instalacoes/:id/entidades", async (req, reply) => {
    const { id } = req.params as { id: string };
    const b = req.body as { id_entidade: string; nome: string; tipo: string };
    const { rows } = await app.pool.query(
      `insert into entidade (id_entidade, id_ibge, nome, tipo) values ($1,$2,$3,$4)
       returning id_entidade, id_ibge, nome, tipo`, [b.id_entidade, id, b.nome, b.tipo]
    );
    await logAudit(app.pool, { ator: ator(req), acao: "criou", alvo: `entidade:${b.id_entidade}`, payload: { ...b, id_ibge: id } });
    return reply.code(201).send(rows[0]);
  });

  app.patch("/entidades/:id_entidade", async (req, reply) => {
    const { id_entidade } = req.params as { id_entidade: string };
    const b = req.body as Partial<{ nome: string; tipo: string }>;
    const campos = ["nome", "tipo"].filter((c) => b[c as keyof typeof b] != null);
    if (campos.length === 0) return reply.code(400).send({ error: "nada para atualizar" });
    const sets = campos.map((c, i) => `${c}=$${i + 2}`).join(", ");
    const { rows } = await app.pool.query(
      `update entidade set ${sets} where id_entidade=$1 returning id_entidade, id_ibge, nome, tipo`,
      [id_entidade, ...campos.map((c) => b[c as keyof typeof b])]
    );
    if (rows.length === 0) return reply.code(404).send({ error: "não encontrada" });
    await logAudit(app.pool, { ator: ator(req), acao: "editou", alvo: `entidade:${id_entidade}`, payload: b });
    return rows[0];
  });

  app.delete("/entidades/:id_entidade", async (req, reply) => {
    const { id_entidade } = req.params as { id_entidade: string };
    const { rowCount } = await app.pool.query("delete from entidade where id_entidade=$1", [id_entidade]);
    if (!rowCount) return reply.code(404).send({ error: "não encontrada" });
    await logAudit(app.pool, { ator: ator(req), acao: "removeu", alvo: `entidade:${id_entidade}` });
    return reply.code(204).send();
  });
}
```

- [ ] **Step 5: Implement `src/routes/gestores.ts`**

```ts
import type { FastifyInstance, FastifyRequest } from "fastify";
import { logAudit } from "../audit.js";
import { hashSenha } from "../auth/hash.js";

const ator = (req: FastifyRequest) => {
  const u = req.user as { nome?: string; sub?: string };
  return u?.nome ?? u?.sub ?? "?";
};
const soDigitos = (cpf: string) => cpf.replace(/\D/g, "");

export async function gestoresRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.authenticate);

  app.get("/instalacoes/:id/gestores", async (req) => {
    const { id } = req.params as { id: string };
    const { rows } = await app.pool.query(
      "select cpf, id_ibge, id_entidade, nome, role from gestor where id_ibge=$1 order by nome", [id]
    );
    return rows;
  });

  app.post("/instalacoes/:id/gestores", async (req, reply) => {
    const { id } = req.params as { id: string };
    const b = req.body as { cpf: string; nome: string; senha: string; role: string; id_entidade: string };
    const cpf = soDigitos(b.cpf ?? "");
    if (cpf.length !== 11) return reply.code(400).send({ error: "CPF inválido" });
    const hash = await hashSenha(b.senha);
    await app.pool.query(
      `insert into gestor (cpf, id_ibge, id_entidade, nome, senha_hash, role) values ($1,$2,$3,$4,$5,$6)`,
      [cpf, id, b.id_entidade, b.nome, hash, b.role]
    );
    await logAudit(app.pool, { ator: ator(req), acao: "criou", alvo: `gestor:${cpf}`,
      payload: { cpf, id_ibge: id, id_entidade: b.id_entidade, role: b.role } });
    return reply.code(201).send({ cpf, id_ibge: id, id_entidade: b.id_entidade, nome: b.nome, role: b.role });
  });

  app.patch("/gestores/:cpf", async (req, reply) => {
    const cpf = soDigitos((req.params as { cpf: string }).cpf);
    const b = req.body as Partial<{ nome: string; role: string; id_entidade: string; senha: string }>;
    const campos: string[] = [];
    const vals: unknown[] = [];
    for (const c of ["nome", "role", "id_entidade"] as const) {
      if (b[c] != null) { campos.push(`${c}=$${campos.length + 2}`); vals.push(b[c]); }
    }
    if (b.senha != null) { campos.push(`senha_hash=$${campos.length + 2}`); vals.push(await hashSenha(b.senha)); }
    if (campos.length === 0) return reply.code(400).send({ error: "nada para atualizar" });
    const { rows } = await app.pool.query(
      `update gestor set ${campos.join(", ")} where cpf=$1 returning cpf, id_ibge, id_entidade, nome, role`,
      [cpf, ...vals]
    );
    if (rows.length === 0) return reply.code(404).send({ error: "não encontrado" });
    await logAudit(app.pool, { ator: ator(req), acao: "editou", alvo: `gestor:${cpf}`,
      payload: { campos: Object.keys(b).filter((k) => k !== "senha"), trocouSenha: b.senha != null } });
    return rows[0];
  });

  app.delete("/gestores/:cpf", async (req, reply) => {
    const cpf = soDigitos((req.params as { cpf: string }).cpf);
    const { rowCount } = await app.pool.query("delete from gestor where cpf=$1", [cpf]);
    if (!rowCount) return reply.code(404).send({ error: "não encontrado" });
    await logAudit(app.pool, { ator: ator(req), acao: "removeu", alvo: `gestor:${cpf}` });
    return reply.code(204).send();
  });
}
```

- [ ] **Step 6: Register both in `src/app.ts`** (alongside existing registrations)

```ts
import { entidadesRoutes } from "./routes/entidades.js";
import { gestoresRoutes } from "./routes/gestores.js";
// ...
  app.register(entidadesRoutes);
  app.register(gestoresRoutes);
```

- [ ] **Step 7: Run tests to verify they pass**

Run: `npx vitest run test/entidades.test.ts test/gestores.test.ts`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add control-plane/src control-plane/test/entidades.test.ts control-plane/test/gestores.test.ts
git commit -m "feat(admin-api): CRUD de entidades e gestores (senha hasheada, reset pelo admin)"
```

---

### Task 3: Licença + módulos (por instalação)

**Files:**
- Create: `control-plane/src/routes/licenca.ts`
- Create: `control-plane/src/routes/modulos.ts`
- Modify: `control-plane/src/app.ts`
- Test: `control-plane/test/licenca-modulos.test.ts`

**Interfaces:**
- Produces (sob `app.authenticate`):
  - `PUT /instalacoes/:id/licenca` body `{ ativo: boolean, validade: string|null }` → upsert em `licenca`, grava audit.
  - `GET /instalacoes/:id/modulos` → `{ path, oculto }[]`.
  - `PUT /instalacoes/:id/modulos` body `{ modulos: { path: string, oculto: boolean }[] }` → upsert por path daquela instalação, grava audit.

- [ ] **Step 1: Write the failing test** — `control-plane/test/licenca-modulos.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { newDb } from "pg-mem";
import { buildApp } from "../src/app.js";
import { runMigrations } from "../src/db/migrate.js";

async function setup() {
  const { Pool } = newDb().adapters.createPg();
  const pool = new Pool();
  await runMigrations(pool);
  await pool.query("insert into instalacao (id_ibge, slug, nome, uf) values ('4117909','palotina','Palotina','PR')");
  const app = buildApp({ pool, jwtSecret: "s" });
  await app.ready();
  return { app, pool, token: app.jwt.sign({ sub: "1", tipo: "admin", nome: "Op" }) };
}
const auth = (t: string) => ({ authorization: `Bearer ${t}` });

describe("licença e módulos", () => {
  it("define e relê licença", async () => {
    const { app, token } = await setup();
    const put = await app.inject({ method: "PUT", url: "/instalacoes/4117909/licenca", headers: auth(token),
      payload: { ativo: true, validade: "2027-12-31" } });
    expect(put.statusCode).toBe(200);
    const get = await app.inject({ method: "GET", url: "/instalacoes/4117909", headers: auth(token) });
    expect(get.json()).toMatchObject({ licenca_ativo: true });
  });
  it("define e relê módulos (upsert por path)", async () => {
    const { app, token } = await setup();
    await app.inject({ method: "PUT", url: "/instalacoes/4117909/modulos", headers: auth(token),
      payload: { modulos: [{ path: "/despesa", oculto: true }, { path: "/receita", oculto: false }] } });
    // re-PUT do mesmo path atualiza, não duplica
    await app.inject({ method: "PUT", url: "/instalacoes/4117909/modulos", headers: auth(token),
      payload: { modulos: [{ path: "/despesa", oculto: false }] } });
    const get = await app.inject({ method: "GET", url: "/instalacoes/4117909/modulos", headers: auth(token) });
    const mods = get.json() as { path: string; oculto: boolean }[];
    expect(mods.find((m) => m.path === "/despesa")!.oculto).toBe(false);
    expect(mods.find((m) => m.path === "/receita")!.oculto).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/licenca-modulos.test.ts`
Expected: FAIL — rotas inexistentes.

- [ ] **Step 3: Implement `src/routes/licenca.ts`**

```ts
import type { FastifyInstance, FastifyRequest } from "fastify";
import { logAudit } from "../audit.js";

const ator = (req: FastifyRequest) => {
  const u = req.user as { nome?: string; sub?: string };
  return u?.nome ?? u?.sub ?? "?";
};

export async function licencaRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.authenticate);

  app.put("/instalacoes/:id/licenca", async (req) => {
    const { id } = req.params as { id: string };
    const b = req.body as { ativo: boolean; validade: string | null };
    await app.pool.query(
      `insert into licenca (id_ibge, ativo, validade) values ($1,$2,$3)
         on conflict (id_ibge) do update set ativo=excluded.ativo, validade=excluded.validade, atualizado_em=now()`,
      [id, b.ativo, b.validade]
    );
    await logAudit(app.pool, { ator: ator(req), acao: "emitiu-licenca", alvo: `instalacao:${id}`, payload: b });
    return { id_ibge: id, ativo: b.ativo, validade: b.validade };
  });
}
```

- [ ] **Step 4: Implement `src/routes/modulos.ts`**

```ts
import type { FastifyInstance, FastifyRequest } from "fastify";
import { logAudit } from "../audit.js";

const ator = (req: FastifyRequest) => {
  const u = req.user as { nome?: string; sub?: string };
  return u?.nome ?? u?.sub ?? "?";
};

export async function modulosRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.authenticate);

  app.get("/instalacoes/:id/modulos", async (req) => {
    const { id } = req.params as { id: string };
    const { rows } = await app.pool.query(
      "select path, oculto from modulo_estado where id_ibge=$1 order by path", [id]
    );
    return rows;
  });

  app.put("/instalacoes/:id/modulos", async (req, reply) => {
    const { id } = req.params as { id: string };
    const b = req.body as { modulos: { path: string; oculto: boolean }[] };
    for (const m of b.modulos ?? []) {
      await app.pool.query(
        `insert into modulo_estado (id_ibge, path, oculto) values ($1,$2,$3)
           on conflict (id_ibge, path) do update set oculto=excluded.oculto, atualizado_em=now()`,
        [id, m.path, m.oculto]
      );
    }
    await logAudit(app.pool, { ator: ator(req), acao: "definiu-modulos", alvo: `instalacao:${id}`, payload: b });
    return reply.code(200).send({ ok: true });
  });
}
```

- [ ] **Step 5: Register both in `src/app.ts`**

```ts
import { licencaRoutes } from "./routes/licenca.js";
import { modulosRoutes } from "./routes/modulos.js";
// ...
  app.register(licencaRoutes);
  app.register(modulosRoutes);
```

- [ ] **Step 6: Run test + full suite**

Run: `npx vitest run test/licenca-modulos.test.ts && npx vitest run`
Expected: PASS; suíte inteira verde.

- [ ] **Step 7: Commit**

```bash
git add control-plane/src control-plane/test/licenca-modulos.test.ts
git commit -m "feat(admin-api): licença e módulos por instalação"
```

---

## Parte B — Frontend: SPA /admin

### Task 4: Segundo entry Vite + client cpApi + login + shell de auth

**Files:**
- Create: `admin.html` (repo root)
- Create: `src/admin/main.tsx`
- Create: `src/admin/cpApi.ts`
- Create: `src/admin/AdminLogin.tsx`
- Create: `src/admin/AdminApp.tsx`
- Modify: `vite.config.ts` (`build.rollupOptions.input`)
- Modify: `src/components.tsx` (extrair `Sw` reutilizável — ver nota)
- Test: `src/admin/cpApi.test.ts`, `src/admin/AdminApp.test.tsx`

**Interfaces:**
- Produces:
  - `cpApi` — `setToken(t)/getToken()/clearToken()` (localStorage `cp_token`), `cpFetch(path, init?)` (adiciona `Authorization: Bearer` + `Accept: application/json`, throw em `!ok`), `login(login, senha): Promise<{ token, perfil }>`.
  - `AdminApp` — gate: sem token → `<AdminLogin>`; com token → dashboard (Task 5).
- `CP_URL = window.__CP_URL__ ?? "http://localhost:8080"`.

> **Nota de extração:** `Sw` está definido como closure dentro de `Shell` em `App.tsx`. Extraia uma cópia standalone `export function Sw({ on, t }: { on: boolean; t: any })` para `components.tsx` (o `/admin` a reutiliza). NÃO refatore o `App.tsx` para usar a versão extraída neste épico (YAGNI/escopo) — apenas adicione a exportação.

- [ ] **Step 1: Write the failing test — cpApi** — `src/admin/cpApi.test.ts`

```ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { cpApi } from "./cpApi";

beforeEach(() => { localStorage.clear(); vi.restoreAllMocks(); });

describe("cpApi", () => {
  it("guarda e limpa o token", () => {
    cpApi.setToken("abc");
    expect(cpApi.getToken()).toBe("abc");
    cpApi.clearToken();
    expect(cpApi.getToken()).toBeNull();
  });
  it("cpFetch envia Bearer e faz throw em !ok", async () => {
    cpApi.setToken("tok");
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "content-type": "application/json" } })
    );
    await cpApi.cpFetch("/instalacoes");
    const [, init] = fetchMock.mock.calls[0];
    expect((init!.headers as Record<string, string>).authorization).toBe("Bearer tok");

    fetchMock.mockResolvedValue(new Response("nope", { status: 401 }));
    await expect(cpApi.cpFetch("/x")).rejects.toThrow();
  });
});
```

- [ ] **Step 2: Write the failing test — AdminApp gate** — `src/admin/AdminApp.test.tsx`

```tsx
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { AdminApp } from "./AdminApp";

beforeEach(() => localStorage.clear());

describe("AdminApp", () => {
  it("mostra login sem token", () => {
    render(<AdminApp />);
    expect(screen.getByText(/entrar/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npx vitest run src/admin/cpApi.test.ts src/admin/AdminApp.test.tsx`
Expected: FAIL — módulos inexistentes.

- [ ] **Step 4: Implement `src/admin/cpApi.ts`**

```ts
const CP_URL = (globalThis as any).__CP_URL__ ?? "http://localhost:8080";
const KEY = "cp_token";

export const cpApi = {
  setToken(t: string) { localStorage.setItem(KEY, t); },
  getToken() { return localStorage.getItem(KEY); },
  clearToken() { localStorage.removeItem(KEY); },

  async cpFetch(path: string, init: RequestInit = {}) {
    const token = cpApi.getToken();
    const res = await fetch(`${CP_URL}${path}`, {
      ...init,
      headers: {
        "Accept": "application/json",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...(init.headers ?? {}),
      },
    });
    if (!res.ok) throw new Error(`${res.status}`);
    if (res.status === 204) return null;
    return res.json();
  },

  async login(login: string, senha: string) {
    const res = await fetch(`${CP_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({ tipo: "admin", login, senha }),
    });
    if (!res.ok) throw new Error("credenciais inválidas");
    return res.json() as Promise<{ token: string; perfil: { nome: string } }>;
  },
};
```

- [ ] **Step 5: Implement `src/admin/AdminLogin.tsx`** (fork enxuto do LoginScreen, usando o token do tema)

```tsx
import { useState } from "react";
import { useTheme } from "../theme";
import { cpApi } from "./cpApi";

export function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const { t } = useTheme();
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    try {
      const { token } = await cpApi.login(login, senha);
      cpApi.setToken(token);
      onLogin();
    } catch { setErro("Login ou senha inválidos."); }
  }

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: t.background, color: t.foreground }}>
      <form onSubmit={submit} style={{ width: 320, padding: 24, background: t.card, border: `1px solid ${t.border}`, borderRadius: 12 }}>
        <h1 style={{ margin: "0 0 16px", fontSize: 18 }}>Mirante · Admin</h1>
        <input aria-label="login" value={login} onChange={(e) => setLogin(e.target.value)} placeholder="login"
          style={{ width: "100%", marginBottom: 8, padding: 8, background: t.background, color: t.foreground, border: `1px solid ${t.border}`, borderRadius: 8 }} />
        <input aria-label="senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="senha"
          style={{ width: "100%", marginBottom: 12, padding: 8, background: t.background, color: t.foreground, border: `1px solid ${t.border}`, borderRadius: 8 }} />
        {erro && <div style={{ color: t.danger, fontSize: 13, marginBottom: 8 }}>{erro}</div>}
        <button type="submit" style={{ width: "100%", padding: 10, background: t.primary, color: t.primaryFg, border: "none", borderRadius: 8, cursor: "pointer" }}>Entrar</button>
      </form>
    </div>
  );
}
```

- [ ] **Step 6: Implement `src/admin/AdminApp.tsx`** (gate + placeholder do dashboard, preenchido na Task 5)

```tsx
import { useState } from "react";
import { ThemeProvider } from "../theme";
import { cpApi } from "./cpApi";
import { AdminLogin } from "./AdminLogin";

function Inner() {
  const [logado, setLogado] = useState(!!cpApi.getToken());
  if (!logado) return <AdminLogin onLogin={() => setLogado(true)} />;
  return <div data-testid="admin-dashboard">Dashboard (Task 5)</div>;
}

export function AdminApp() {
  return (
    <ThemeProvider>
      <Inner />
    </ThemeProvider>
  );
}
```

- [ ] **Step 7: Implement `src/admin/main.tsx` e `admin.html`**

`src/admin/main.tsx`:
```tsx
import { createRoot } from "react-dom/client";
import { AdminApp } from "./AdminApp";
createRoot(document.getElementById("root")!).render(<AdminApp />);
```
`admin.html` (copie o `index.html` da raiz e troque o script de entrada; mantenha o `<script src="/config.js">` se existir):
```html
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Mirante · Admin</title>
    <script src="/config.js"></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/admin/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 8: Add the second entry to `vite.config.ts`**

```ts
import { resolve } from "node:path";
// dentro de defineConfig({ ... }):
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        admin: resolve(__dirname, "admin.html"),
      },
    },
  },
```
> Em dev, o /admin abre em `http://localhost:5173/admin.html`. Roteamento `/admin` limpo em produção fica a cargo do nginx (nota de infra, fora do escopo de teste).

- [ ] **Step 9: Extract `Sw` into `components.tsx`**

Add a standalone export (do not modify `App.tsx`'s internal copy):
```tsx
export function Sw({ on, t }: { on: boolean; t: any }) {
  return (
    <span style={{ width: 34, height: 20, borderRadius: 999, background: on ? t.primary : t.muted, position: "relative", transition: "background .15s", display: "inline-block" }}>
      <span style={{ position: "absolute", top: 2, left: on ? 16 : 2, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left .15s" }} />
    </span>
  );
}
```

- [ ] **Step 10: Run tests + typecheck**

Run: `npx vitest run src/admin/ && npx tsc --noEmit`
Expected: PASS; sem erros de tipo.

- [ ] **Step 11: Commit**

```bash
git add admin.html src/admin vite.config.ts src/components.tsx
git commit -m "feat(admin-ui): segundo entry Vite, client cpApi e login do /admin"
```

---

### Task 5: Dashboard de instalações (listar + criar)

**Files:**
- Create: `src/admin/InstalacoesDashboard.tsx`
- Modify: `src/admin/AdminApp.tsx` (renderizar o dashboard quando logado; navegação para detalhe via estado)
- Test: `src/admin/InstalacoesDashboard.test.tsx`

**Interfaces:**
- Consumes: `cpApi.cpFetch`.
- Produces: `InstalacoesDashboard({ onAbrir }: { onAbrir: (id: string) => void })` — carrega `GET /instalacoes`, lista em cards, formulário de criação (`POST /instalacoes`).

- [ ] **Step 1: Write the failing test** — `src/admin/InstalacoesDashboard.test.tsx`

```tsx
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { ThemeProvider } from "../theme";
import { InstalacoesDashboard } from "./InstalacoesDashboard";

beforeEach(() => { localStorage.clear(); localStorage.setItem("cp_token", "t"); });

function mockFetchSequence(...responses: any[]) {
  const spy = vi.spyOn(globalThis, "fetch");
  for (const r of responses) spy.mockResolvedValueOnce(new Response(JSON.stringify(r), { status: 200, headers: { "content-type": "application/json" } }));
  return spy;
}

describe("InstalacoesDashboard", () => {
  it("lista instalações vindas da API", async () => {
    mockFetchSequence([{ id_ibge: "4117909", slug: "palotina", nome: "Palotina", uf: "PR", status: "ativa" }]);
    render(<ThemeProvider><InstalacoesDashboard onAbrir={() => {}} /></ThemeProvider>);
    await waitFor(() => expect(screen.getByText("Palotina")).toBeInTheDocument());
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/admin/InstalacoesDashboard.test.tsx`
Expected: FAIL — componente inexistente.

- [ ] **Step 3: Implement `src/admin/InstalacoesDashboard.tsx`**

```tsx
import { useEffect, useState } from "react";
import { useTheme } from "../theme";
import { cpApi } from "./cpApi";

type Instalacao = { id_ibge: string; slug: string; nome: string; uf: string; status: string };

export function InstalacoesDashboard({ onAbrir }: { onAbrir: (id: string) => void }) {
  const { t } = useTheme();
  const [itens, setItens] = useState<Instalacao[]>([]);
  const [form, setForm] = useState({ id_ibge: "", slug: "", nome: "", uf: "" });
  const [erro, setErro] = useState("");

  async function carregar() {
    try { setItens(await cpApi.cpFetch("/instalacoes")); } catch { setErro("Falha ao carregar."); }
  }
  useEffect(() => { carregar(); }, []);

  async function criar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    try {
      await cpApi.cpFetch("/instalacoes", { method: "POST", body: JSON.stringify(form) });
      setForm({ id_ibge: "", slug: "", nome: "", uf: "" });
      await carregar();
    } catch { setErro("Falha ao criar."); }
  }

  const inp = { padding: 8, background: t.background, color: t.foreground, border: `1px solid ${t.border}`, borderRadius: 8 } as const;

  return (
    <div style={{ padding: 24, color: t.foreground }}>
      <h1 style={{ fontSize: 20, marginBottom: 16 }}>Instalações</h1>
      <form onSubmit={criar} style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        <input aria-label="id_ibge" placeholder="IBGE" value={form.id_ibge} onChange={(e) => setForm({ ...form, id_ibge: e.target.value })} style={inp} />
        <input aria-label="slug" placeholder="slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} style={inp} />
        <input aria-label="nome" placeholder="nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} style={inp} />
        <input aria-label="uf" placeholder="UF" value={form.uf} onChange={(e) => setForm({ ...form, uf: e.target.value })} style={{ ...inp, width: 60 }} />
        <button type="submit" style={{ padding: "8px 16px", background: t.primary, color: t.primaryFg, border: "none", borderRadius: 8, cursor: "pointer" }}>Criar</button>
      </form>
      {erro && <div style={{ color: t.danger, marginBottom: 12 }}>{erro}</div>}
      <div style={{ display: "grid", gap: 8 }}>
        {itens.map((i) => (
          <button key={i.id_ibge} onClick={() => onAbrir(i.id_ibge)}
            style={{ textAlign: "left", padding: 16, background: t.card, border: `1px solid ${t.border}`, borderRadius: 10, cursor: "pointer", color: t.foreground }}>
            <strong>{i.nome}</strong> · {i.uf} · <span style={{ color: t.mutedFg }}>{i.status}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Wire into `src/admin/AdminApp.tsx`**

Replace the `Inner`'s logged-in placeholder with dashboard + detail navigation by `useState`. Nesta task, o ramo de detalhe usa um stub inline; a Task 6 o substitui por `InstalacaoDetalhe`:
```tsx
function Inner() {
  const [logado, setLogado] = useState(!!cpApi.getToken());
  const [abertaId, setAbertaId] = useState<string | null>(null);
  if (!logado) return <AdminLogin onLogin={() => setLogado(true)} />;
  if (abertaId) return <div data-testid="detalhe-stub">Detalhe {abertaId} (Task 6)</div>;
  return <InstalacoesDashboard onAbrir={setAbertaId} />;
}
```

- [ ] **Step 5: Run test + typecheck**

Run: `npx vitest run src/admin/InstalacoesDashboard.test.tsx && npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/admin
git commit -m "feat(admin-ui): dashboard de instalações (listar + criar)"
```

---

### Task 6: Detalhe da instalação com abas (Entidades, Gestores, Licença, Módulos)

**Files:**
- Create: `src/admin/InstalacaoDetalhe.tsx`
- Modify: `src/admin/AdminApp.tsx` (importar e usar `InstalacaoDetalhe` no ramo `abertaId`, substituindo o stub da Task 5)
- Test: `src/admin/InstalacaoDetalhe.test.tsx`

**Interfaces:**
- Consumes: `cpApi.cpFetch`; `NAV_GROUPS` de `../App` (catálogo de módulos); `Sw` de `../components`.
- Produces: `InstalacaoDetalhe({ id, onVoltar }: { id: string; onVoltar: () => void })` — abas:
  - **Entidades:** lista + criar (`GET/POST /instalacoes/:id/entidades`), remover.
  - **Gestores:** lista + criar (`GET/POST /instalacoes/:id/gestores`), com select de entidade; ação "trocar senha" (`PATCH /gestores/:cpf` com `{ senha }`).
  - **Licença:** toggle `ativo` + data `validade` (`PUT /instalacoes/:id/licenca`).
  - **Módulos:** para cada `path` de `NAV_GROUPS`, um `Sw` liga/desliga `oculto`; carrega `GET /instalacoes/:id/modulos`, salva via `PUT /instalacoes/:id/modulos`.

- [ ] **Step 1: Write the failing test** — `src/admin/InstalacaoDetalhe.test.tsx`

```tsx
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { ThemeProvider } from "../theme";
import { InstalacaoDetalhe } from "./InstalacaoDetalhe";

beforeEach(() => { localStorage.clear(); localStorage.setItem("cp_token", "t"); });

function jsonRes(body: any, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

describe("InstalacaoDetalhe", () => {
  it("carrega entidades da aba inicial", async () => {
    const spy = vi.spyOn(globalThis, "fetch");
    spy.mockResolvedValue(jsonRes([{ id_entidade: "ent-pref", id_ibge: "4117909", nome: "Prefeitura", tipo: "prefeitura" }]));
    render(<ThemeProvider><InstalacaoDetalhe id="4117909" onVoltar={() => {}} /></ThemeProvider>);
    await waitFor(() => expect(screen.getByText("Prefeitura")).toBeInTheDocument());
  });

  it("aba Módulos renderiza um toggle por path do catálogo", async () => {
    const spy = vi.spyOn(globalThis, "fetch");
    spy.mockImplementation(async (url: any) => {
      if (String(url).endsWith("/modulos")) return jsonRes([{ path: "/despesa", oculto: true }]);
      return jsonRes([]);
    });
    render(<ThemeProvider><InstalacaoDetalhe id="4117909" onVoltar={() => {}} /></ThemeProvider>);
    fireEvent.click(screen.getByRole("button", { name: /módulos/i }));
    await waitFor(() => expect(screen.getByText("/despesa")).toBeInTheDocument());
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/admin/InstalacaoDetalhe.test.tsx`
Expected: FAIL — componente inexistente.

- [ ] **Step 3: Implement `src/admin/InstalacaoDetalhe.tsx`**

> Implemente as 4 abas conforme as interfaces acima. Importe `NAV_GROUPS` de `../App` e derive os paths com `NAV_GROUPS.flatMap(g => g.items).map(i => i.path)`. Use `Sw` de `../components` (passando `t` do `useTheme`). Cada mutação chama `cpApi.cpFetch` e recarrega a aba. Estilo inline com o token `t`, como no dashboard. A aba ativa é um `useState<"entidades"|"gestores"|"licenca"|"modulos">`; os botões de aba têm `role="button"` com nome incluindo o rótulo. NÃO deixe placeholders — implemente cada aba de fato.

Esqueleto base (complete cada aba):
```tsx
import { useEffect, useState } from "react";
import { useTheme } from "../theme";
import { cpApi } from "./cpApi";
import { Sw } from "../components";
import { NAV_GROUPS } from "../App";

type Aba = "entidades" | "gestores" | "licenca" | "modulos";
const CATALOGO: string[] = NAV_GROUPS.flatMap((g: any) => g.items).map((i: any) => i.path);

export function InstalacaoDetalhe({ id, onVoltar }: { id: string; onVoltar: () => void }) {
  const { t } = useTheme();
  const [aba, setAba] = useState<Aba>("entidades");
  // estados por aba + useEffect que carrega os dados da aba ativa via cpApi.cpFetch(`/instalacoes/${id}/...`)
  // Módulos: GET /modulos -> Map<path, oculto>; um Sw por CATALOGO; salvar via PUT.
  return (
    <div style={{ padding: 24, color: t.foreground }}>
      <button onClick={onVoltar} style={{ marginBottom: 12, background: "none", border: "none", color: t.primary, cursor: "pointer" }}>← Voltar</button>
      <div role="tablist" style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {(["entidades", "gestores", "licenca", "modulos"] as Aba[]).map((a) => (
          <button key={a} role="button" onClick={() => setAba(a)}
            style={{ padding: "6px 12px", background: aba === a ? t.primary : t.card, color: aba === a ? t.primaryFg : t.foreground, border: `1px solid ${t.border}`, borderRadius: 8, cursor: "pointer", textTransform: "capitalize" }}>
            {a === "modulos" ? "Módulos" : a === "licenca" ? "Licença" : a}
          </button>
        ))}
      </div>
      {/* render por aba — implementar */}
    </div>
  );
}
```

> **Requisito de teste (não deixar passar de leve):** a aba Entidades faz `GET /instalacoes/${id}/entidades` no mount e mostra `nome`; a aba Módulos faz `GET /instalacoes/${id}/modulos` e, para cada `path` de `CATALOGO`, mostra o texto do `path` + um `Sw`. Os dois testes precisam passar de verdade.

- [ ] **Step 4: Wire into `src/admin/AdminApp.tsx`** (substitui o stub da Task 5)

```tsx
import { InstalacaoDetalhe } from "./InstalacaoDetalhe";
// no Inner: if (abertaId) return <InstalacaoDetalhe id={abertaId} onVoltar={() => setAbertaId(null)} />;
```

- [ ] **Step 5: Run test + full suite + typecheck**

Run: `npx vitest run src/admin/ && npx vitest run && npx tsc --noEmit`
Expected: PASS; suíte inteira (TV + admin) verde.

- [ ] **Step 6: Commit**

```bash
git add src/admin
git commit -m "feat(admin-ui): detalhe da instalação com abas (entidades, gestores, licença, módulos)"
```

---

## Self-Review

**Cobertura da spec (épico 2):**
- SPA /admin: login → dashboard → detalhe com abas → Tasks 4, 5, 6. ✓
- Endpoints REST protegidos por JWT, cada mutação grava audit_log → Tasks 1, 2, 3 (+ `logAudit`). ✓
- Fluxo de provisionamento (instalação → entidades → licença → gestores → módulos) → Tasks 1–3 (API) + 5–6 (UI). ✓
- Gestor senha hasheada; login via /auth/login funciona → Task 2 (usa `hashSenha` do Épico 1). ✓
- Editar status/licença reflete no GET → Tasks 1, 3. ✓
- Módulos persistem e são relidos → Task 3. ✓
- Cada mutação no audit_log → Tasks 1–3 (teste de instalação verifica as 3 ações). ✓

**Decisões da spec resolvidas:** catálogo de módulos = `NAV_GROUPS` (Task 6, Global Constraints); reset de senha = admin define (Task 2).

**Consistência de tipos/rotas:** `logAudit` (Task 1) reusado em 2/3; `cpApi.cpFetch` (Task 4) reusado em 5/6; `Sw` extraído na Task 4, consumido na Task 6; rotas casam com os paths que o frontend chama.

**Notas de escopo/YAGNI:**
- Validação de body via schema Fastify fica para hardening (herda do Épico 1, diferido). Aqui a validação é mínima (CPF, campos presentes).
- Roteamento `/admin` limpo em produção é infra (nginx), fora do teste.
- Sem paginação nas listagens (volume pequeno por instalação); logs (Épico 3) terão paginação.
