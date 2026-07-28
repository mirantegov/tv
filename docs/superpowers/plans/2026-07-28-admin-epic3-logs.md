# Épico 3 — Logs: auditoria + acessos (leitura + telas) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Tornar visíveis, no /admin, os dois registros já gravados: **auditoria** de ações do admin (`audit_log`, escrito no Épico 2) e **acessos** dos gestores (`acesso_log`, escrito no Épico 1). Endpoints de leitura paginados/filtrados + duas telas.

**Architecture:** Dois endpoints REST no control-plane (`GET /logs/auditoria`, `GET /logs/acessos`), protegidos por `authenticateAdmin` (Épico 2), com paginação `limit/offset` e filtros. Frontend: duas telas no `/admin` (Auditoria, Acessos) com filtros e paginação, reusando `cpApi` e o token `t`.

**Tech Stack:** Fastify + pg + pg-mem (backend); React + Vite + Testing-Library (frontend). Padrões dos Épicos 1–2.

## Global Constraints

- Rotas sob `authenticateAdmin` (só admin — decorator do Épico 2).
- Logs são **append-only** — sem edição/remoção pela API/UI.
- **CPF mascarado por padrão** na listagem de acessos (LGPD): mostra `***.207.***-**` (mantém só os 3 dígitos centrais visíveis, resto mascarado). CPF completo fica fora do MVP (decisão: "só via detalhe" — não implementado agora).
- **Sem expurgo/retenção** nesta entrega (backlog).
- **Paginação obrigatória** — `limit` (default 50, máx 200) + `offset`; resposta `{ rows, total }`.
- TypeScript ESM (`.js` imports backend); frontend inline styles off `t`. TDD.

---

### Task 1: Endpoints de leitura (auditoria + acessos)

**Files:**
- Create: `control-plane/src/routes/logs.ts`
- Create: `control-plane/src/logs/mask.ts`
- Modify: `control-plane/src/app.ts` (registrar `logsRoutes`)
- Test: `control-plane/test/logs.test.ts`

**Interfaces:**
- Produces (sob `authenticateAdmin`):
  - `mascararCpf(cpf: string): string` — `07320700905` → `***.207.***-**`.
  - `GET /logs/auditoria?id_ibge&ator&de&ate&limit&offset` → `{ rows: { id, ator, acao, alvo, payload, criado_em }[], total }` (ordenado desc por criado_em). Filtro `de`/`ate` sobre `criado_em`; `ator` casa igualdade; `id_ibge` casa `alvo LIKE '%<id>%'` (aproximado — ver nota).
  - `GET /logs/acessos?id_ibge&cpf&de&ate&limit&offset` → `{ rows: { id, cpf (mascarado), nome, id_ibge, id_entidade, criado_em }[], total }` (join `gestor` p/ nome, LEFT — pode ser null se removido; ordenado desc).

> **Nota sobre o filtro `id_ibge` da auditoria:** `audit_log` não tem coluna `id_ibge` — o alvo é texto (`instalacao:4117909`, `gestor:073...`). Para o MVP, filtre por `alvo LIKE '%' || $id || '%'` (contém o id). É aproximado e suficiente; documente no código com `// ponytail: filtro aproximado por substring do alvo`.

- [ ] **Step 1: Write the failing test** — `control-plane/test/logs.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { newDb } from "pg-mem";
import { buildApp } from "../src/app.js";
import { runMigrations } from "../src/db/migrate.js";
import { mascararCpf } from "../src/logs/mask.js";

async function setup() {
  const { Pool } = newDb().adapters.createPg();
  const pool = new Pool();
  await runMigrations(pool);
  await pool.query("insert into instalacao (id_ibge, slug, nome, uf) values ('4117909','palotina','Palotina','PR')");
  await pool.query("insert into entidade (id_entidade, id_ibge, nome, tipo) values ('ent-pref','4117909','Prefeitura','prefeitura')");
  await pool.query("insert into gestor (cpf, id_ibge, id_entidade, nome, senha_hash, role) values ('07320700905','4117909','ent-pref','Prefeito','x','prefeito')");
  for (let i = 0; i < 3; i++) await pool.query("insert into acesso_log (cpf, id_ibge, id_entidade) values ('07320700905','4117909','ent-pref')");
  await pool.query("insert into audit_log (ator, acao, alvo) values ('Op','criou','instalacao:4117909')");
  await pool.query("insert into audit_log (ator, acao, alvo) values ('Op','editou','gestor:07320700905')");
  const app = buildApp({ pool, jwtSecret: "s" });
  await app.ready();
  return { app, token: app.jwt.sign({ sub: "1", tipo: "admin", nome: "Op" }) };
}
const auth = (t: string) => ({ authorization: `Bearer ${t}` });

describe("logs", () => {
  it("mascararCpf", () => {
    expect(mascararCpf("07320700905")).toBe("***.207.***-**");
  });
  it("403 para gestor", async () => {
    const { app } = await setup();
    const g = app.jwt.sign({ sub: "x", tipo: "gestor", nome: "G", role: "prefeito", id_entidade: "ent-pref", id_ibge: "4117909" });
    const res = await app.inject({ method: "GET", url: "/logs/acessos", headers: auth(g) });
    expect(res.statusCode).toBe(403);
  });
  it("acessos: paginado, com nome e cpf mascarado", async () => {
    const { app, token } = await setup();
    const res = await app.inject({ method: "GET", url: "/logs/acessos?limit=2", headers: auth(token) });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.total).toBe(3);
    expect(body.rows).toHaveLength(2);
    expect(body.rows[0]).toMatchObject({ nome: "Prefeito", id_entidade: "ent-pref" });
    expect(body.rows[0].cpf).toBe("***.207.***-**");
    expect(JSON.stringify(body)).not.toContain("07320700905");
  });
  it("auditoria: filtro por id_ibge (substring do alvo)", async () => {
    const { app, token } = await setup();
    const all = await app.inject({ method: "GET", url: "/logs/auditoria", headers: auth(token) });
    expect(all.json().total).toBe(2);
    const porId = await app.inject({ method: "GET", url: "/logs/auditoria?id_ibge=4117909", headers: auth(token) });
    expect(porId.json().total).toBe(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd control-plane && npx vitest run test/logs.test.ts`
Expected: FAIL — módulos inexistentes.

- [ ] **Step 3: Implement `src/logs/mask.ts`**

```ts
export function mascararCpf(cpf: string): string {
  const d = (cpf ?? "").replace(/\D/g, "").padStart(11, "*");
  // mantém só os 3 dígitos centrais (posições 3-5, ex.: 073[207]00905)
  return `***.${d.slice(3, 6)}.***-**`;
}
```

- [ ] **Step 4: Implement `src/routes/logs.ts`**

```ts
import type { FastifyInstance } from "fastify";
import { mascararCpf } from "../logs/mask.js";

function paginacao(q: Record<string, string | undefined>) {
  const limit = Math.min(Number(q.limit ?? 50) || 50, 200);
  const offset = Math.max(Number(q.offset ?? 0) || 0, 0);
  return { limit, offset };
}

export async function logsRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.authenticateAdmin);

  app.get("/logs/acessos", async (req) => {
    const q = req.query as Record<string, string | undefined>;
    const { limit, offset } = paginacao(q);
    const cond: string[] = [];
    const vals: unknown[] = [];
    if (q.id_ibge) { vals.push(q.id_ibge); cond.push(`a.id_ibge = $${vals.length}`); }
    if (q.cpf) { vals.push(q.cpf.replace(/\D/g, "")); cond.push(`a.cpf = $${vals.length}`); }
    if (q.de) { vals.push(q.de); cond.push(`a.criado_em >= $${vals.length}`); }
    if (q.ate) { vals.push(q.ate); cond.push(`a.criado_em <= $${vals.length}`); }
    const where = cond.length ? `where ${cond.join(" and ")}` : "";
    const total = await app.pool.query(`select count(*)::int as n from acesso_log a ${where}`, vals);
    const { rows } = await app.pool.query(
      `select a.id, a.cpf, g.nome, a.id_ibge, a.id_entidade, a.criado_em
         from acesso_log a left join gestor g on g.cpf = a.cpf
         ${where} order by a.criado_em desc limit ${limit} offset ${offset}`, vals
    );
    return { total: total.rows[0].n, rows: rows.map((r: any) => ({ ...r, cpf: mascararCpf(r.cpf) })) };
  });

  app.get("/logs/auditoria", async (req) => {
    const q = req.query as Record<string, string | undefined>;
    const { limit, offset } = paginacao(q);
    const cond: string[] = [];
    const vals: unknown[] = [];
    if (q.ator) { vals.push(q.ator); cond.push(`ator = $${vals.length}`); }
    if (q.id_ibge) { vals.push(`%${q.id_ibge}%`); cond.push(`alvo LIKE $${vals.length}`); } // ponytail: filtro aproximado por substring do alvo
    if (q.de) { vals.push(q.de); cond.push(`criado_em >= $${vals.length}`); }
    if (q.ate) { vals.push(q.ate); cond.push(`criado_em <= $${vals.length}`); }
    const where = cond.length ? `where ${cond.join(" and ")}` : "";
    const total = await app.pool.query(`select count(*)::int as n from audit_log ${where}`, vals);
    const { rows } = await app.pool.query(
      `select id, ator, acao, alvo, payload, criado_em from audit_log
         ${where} order by criado_em desc limit ${limit} offset ${offset}`, vals
    );
    return { total: total.rows[0].n, rows };
  });
}
```

- [ ] **Step 5: Register in `src/app.ts`**

```ts
import { logsRoutes } from "./routes/logs.js";
// ...
  app.register(logsRoutes);
```

- [ ] **Step 6: Run test + full suite**

Run: `npx vitest run test/logs.test.ts && npx vitest run`
Expected: PASS; suíte inteira verde.

- [ ] **Step 7: Commit**

```bash
git add control-plane/src control-plane/test/logs.test.ts
git commit -m "feat(admin-api): endpoints de logs (auditoria + acessos) paginados e filtrados, CPF mascarado"
```

---

### Task 2: Telas de logs no /admin (Auditoria + Acessos)

**Files:**
- Create: `src/admin/LogsView.tsx`
- Modify: `src/admin/AdminApp.tsx` (navegação: dashboard ↔ logs)
- Modify: `src/admin/InstalacoesDashboard.tsx` (botão "Logs" opcional via prop `onLogs`)
- Test: `src/admin/LogsView.test.tsx`

**Interfaces:**
- Consumes: `cpApi.cpFetch`.
- Produces: `LogsView({ onVoltar })` — abas Acessos (inicial)/Auditoria; cada uma lista `{ rows, total }` de `GET /logs/...`, com filtros (id_ibge, período de/ate, ator/cpf) e paginação (anterior/próxima via `offset`).

- [ ] **Step 1: Write the failing test** — `src/admin/LogsView.test.tsx`

```tsx
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { ThemeProvider } from "../theme";
import { LogsView } from "./LogsView";

beforeEach(() => { localStorage.clear(); localStorage.setItem("cp_token", "t"); });
function jsonRes(body: any) {
  return new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" } });
}

describe("LogsView", () => {
  it("lista acessos e auditoria conforme a aba", async () => {
    const spy = vi.spyOn(globalThis, "fetch");
    spy.mockImplementation(async (url: any) => {
      if (String(url).includes("/logs/auditoria"))
        return jsonRes({ total: 1, rows: [{ id: 1, ator: "Op", acao: "criou", alvo: "instalacao:4117909", payload: null, criado_em: "2026-07-28T10:00:00Z" }] });
      return jsonRes({ total: 1, rows: [{ id: 1, cpf: "***.207.***-**", nome: "Prefeito", id_ibge: "4117909", id_entidade: "ent-pref", criado_em: "2026-07-28T10:00:00Z" }] });
    });
    render(<ThemeProvider><LogsView onVoltar={() => {}} /></ThemeProvider>);
    await waitFor(() => expect(screen.getByText("Prefeito")).toBeInTheDocument());
    expect(screen.getByText("***.207.***-**")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /auditoria/i }));
    await waitFor(() => expect(screen.getByText("criou")).toBeInTheDocument());
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/admin/LogsView.test.tsx`
Expected: FAIL — componente inexistente.

- [ ] **Step 3: Implement `src/admin/LogsView.tsx`**

> Implemente as duas abas de verdade (Acessos inicial). Cada aba: campos de filtro (id_ibge; período `de`/`ate` como `<input type="date">`; `ator` na auditoria / `cpf` nos acessos), uma tabela das `rows`, e paginação (offset += LIMIT / -= LIMIT, usando `total` para saber se há próxima). Estilo inline off `t`. Monte a querystring a partir de filtros/offset e carregue via `cpApi.cpFetch`. Botões de aba com `role="button"` cujo nome inclui "Acessos"/"Auditoria". NÃO deixe placeholders.

Esqueleto:
```tsx
import { useEffect, useState } from "react";
import { useTheme } from "../theme";
import { cpApi } from "./cpApi";

type Aba = "acessos" | "auditoria";
const LIMIT = 50;

export function LogsView({ onVoltar }: { onVoltar: () => void }) {
  const { t } = useTheme();
  const [aba, setAba] = useState<Aba>("acessos");
  const [offset, setOffset] = useState(0);
  const [dados, setDados] = useState<{ rows: any[]; total: number }>({ rows: [], total: 0 });
  const [filtros, setFiltros] = useState<Record<string, string>>({});

  async function carregar() {
    const params = new URLSearchParams({ limit: String(LIMIT), offset: String(offset) });
    for (const [k, v] of Object.entries(filtros)) if (v) params.set(k, v);
    try { setDados(await cpApi.cpFetch(`/logs/${aba}?${params}`)); } catch { setDados({ rows: [], total: 0 }); }
  }
  useEffect(() => { carregar(); }, [aba, offset]);

  return (
    <div style={{ padding: 24, color: t.foreground }}>
      <button onClick={onVoltar} style={{ marginBottom: 12, background: "none", border: "none", color: t.primary, cursor: "pointer" }}>← Voltar</button>
      <div role="tablist" style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {(["acessos", "auditoria"] as Aba[]).map((a) => (
          <button key={a} role="button" onClick={() => { setAba(a); setOffset(0); }}
            style={{ padding: "6px 12px", background: aba === a ? t.primary : t.card, color: aba === a ? t.primaryFg : t.foreground, border: `1px solid ${t.border}`, borderRadius: 8, cursor: "pointer", textTransform: "capitalize" }}>
            {a}
          </button>
        ))}
      </div>
      {/* filtros + tabela + paginação — implementar de fato */}
    </div>
  );
}
```

> **Requisito de teste:** aba Acessos (inicial) chama `GET /logs/acessos...` e mostra `nome` + `cpf` mascarado; clicar em "auditoria" chama `GET /logs/auditoria...` e mostra `acao`. Ambos renderizam de verdade.

- [ ] **Step 4: Wire navigation into `src/admin/AdminApp.tsx` + botão no dashboard**

No `Inner`: acrescente estado `verLogs`. Se `verLogs` → `<LogsView onVoltar={() => setVerLogs(false)} />` (antes do dashboard, sem quebrar o ramo `abertaId`). Passe `onLogs={() => setVerLogs(true)}` para `InstalacoesDashboard`. Em `InstalacoesDashboard`, aceite `onLogs?: () => void` (prop opcional) e renderize um botão "Logs" no topo quando presente — como é opcional, o teste existente do dashboard não quebra.

- [ ] **Step 5: Run test + full suite + typecheck**

Run: `npx vitest run src/admin/ && npx vitest run && npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/admin
git commit -m "feat(admin-ui): telas de logs (auditoria + acessos) com filtros e paginação"
```

---

## Self-Review

**Cobertura da spec (épico 3):**
- Endpoints de leitura `/logs/auditoria` e `/logs/acessos` com filtros + paginação → Task 1. ✓
- Telas Auditoria e Acessos no /admin → Task 2. ✓
- Escrita já garantida: `audit_log` (Épico 2) e `acesso_log` (Épico 1) — nada a reescrever. ✓
- Append-only (sem rota de edição/remoção) → Tasks 1–2 (não existem). ✓

**Decisões resolvidas:** CPF mascarado por padrão (Task 1, `mascararCpf`); sem expurgo/retenção (fora de escopo).

**Consistência:** `authenticateAdmin` (Épico 2) reusado; teste inclui 403 para gestor; `cpApi.cpFetch` reusado; formato `{ rows, total }` consistente entre backend e frontend.

**Notas YAGNI:** filtro `id_ibge` da auditoria é aproximado (substring do `alvo`), comentado no código. Sem "CPF completo via detalhe" (adiado). Sem export/alertas (backlog da spec).
