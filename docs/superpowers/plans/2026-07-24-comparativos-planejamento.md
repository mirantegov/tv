# Comparativos + Planejamento Comparativo — Implementation Plan (Cycle/Sprint)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) ou superpowers:executing-plans. Steps usam checkbox (`- [ ]`).

**Goal:** (1) Renomear o grupo "Análises" → "Comparativos"; (2) corrigir o bug de z-index (scrollbar da sidebar por cima do popover de Configurações); (3) criar um novo módulo "Planejamento" no grupo Comparativos, espelhando Despesas/Receitas/Finanças, com comparativo 2 anos + evolução 4 anos da LOA (Movimento/Planejamento).

**Architecture:** Reuso total dos building blocks existentes (`KpiCmp`, `GroupedBars`, `Diverging`, `TreeCmp`, AreaChart recharts, `Card`, `Delta` em `src/components.tsx`) e do mecanismo de alertas (`AA[path]` em `src/AnalisesAlertas.tsx`, injetado pelo App). Como os dados de Planejamento (`PLAN`) são de **ano único**, cria-se uma nova fatia `CP: PlanComp` (tipo + seed + wiring no DataProvider) espelhando `ReceitaComp` (que já tem série `evol` multi-ano + pares 2 anos).

**Tech Stack:** React 18, TypeScript, Vite, recharts, Playwright (e2e), Vitest (unit).

## Global Constraints

- Nenhuma dependência nova. Reuso dos componentes de `src/components.tsx` e helpers de `src/format.ts` (`vari`, `brl`, `pct`, `fmt`, `dP`).
- **Dados de seed são representativos** (mesma convenção do `CR.evol`/`CD` já existentes no `data.ts`), derivados dos valores atuais de `PLAN` (2026) com anos anteriores plausíveis. Devem ser trocados por números oficiais da LOA plurianual quando disponíveis (ver "Decisão pendente").
- `biome` (`npm run format`) e `tsc --noEmit` limpos. Sem push até verificação do usuário; depois stage; production só sob ordem.

## Decisão pendente (confirmar com o usuário na execução)

Os valores 2022–2025 da LOA (receita prevista/despesa fixada por ano e por entidade) **não existem** no projeto hoje. O plano seed usa valores representativos coerentes com `PLAN` 2026. Se houver planilha oficial plurianual, substituir o seed do `CP` (Task DATA) por ela — a estrutura não muda.

## Contrato de interface (compartilhado — todos os tracks codam contra isto)

Novo tipo em `src/types.ts`, reusando `LabelValue` e o tipo de nó de árvore já usados por `ReceitaComp` (`CR.evol` é `LabelValue[]`; `CR.arvore` é o array de nós de `TreeCmp`). NÃO inventar tipos novos de árvore — reusar o mesmo tipo nominal de `ReceitaComp.arvore`.

```ts
export type PlanVincComp = { nome: string; a: number; b: number; limite: number };
export type PlanComp = {
  anoA: number; anoB: number;               // 2025, 2026
  orcA: number; orcB: number;               // orçamento consolidado LOA (R$ mi)
  recA: number; recB: number;               // receita prevista
  despA: number; despB: number;             // despesa fixada
  evol: LabelValue[];                        // orçamento fixado por ano: [["2023",..],..,["2026",..]]
  vinc: PlanVincComp[];                      // Pessoal(LRF)/Saúde(ASPS)/Educação(MDE): a vs b vs limite (%)
  entidades: [string, number, number][];    // [nome, valorA, valorB] — Prefeitura/Câmara/RPPS/Saneamento
  arvore: /* MESMO tipo nominal de ReceitaComp.arvore */;
  totA: number; totB: number;               // total da árvore = despesa fixada (âncora do TreeCmp)
};
```
Exposto por `useData()` como `CP: PlanComp`.

---

# CYCLE — "Comparativos + Planejamento"

Dois sprints. Sprint 1 tem 4 tracks **paralelos** (arquivos disjuntos). Sprint 2 é a integração no `App.tsx` (serial) + testes.

## Regras de paralelismo

- **Sprint 1** roda em 4 worktrees/subagentes paralelos: DATA (types/data/provider), FIXES (App.tsx tweaks), ALERTS (AnalisesAlertas.tsx), MODULE (novo arquivo de módulo). Arquivos disjuntos → sem conflito. O **registro** da rota/nav (que também toca `App.tsx`) fica no **Sprint 2**, depois do merge de FIXES, para não colidir.
- **Sprint 2** é serial (um worktree): registra a rota/nav e escreve os testes.

---

## SPRINT 1 — Fundações (paralelo)

### Task DATA: fatia `CP` (tipo + seed + provider + **banco**)

Decisão do usuário: o mock vai **no banco** (mock direto no DB), servido via API — para casar com a futura integração DW→API. O `data.ts` mantém `CP` só como **fallback** (mesmo padrão de `CD`/`CR`, que têm seed em `data.ts` E tripé DB). Espelhar o módulo **`receita_comparativo`** em tudo.

**Files:**
- Modify: `src/types.ts` (`PlanComp`/`PlanVincComp` perto de `ReceitaComp`)
- Modify: `src/data.ts` (`export const CP: PlanComp = {...}` perto de `CR`) — fallback
- Modify: `src/DataProvider.tsx` — import `CP as CPseed`; `CP: PlanComp` em `TenantData`; no `Promise.all` de `fetchModule` adicionar `fetchModule<PlanComp>("planejamento_comp").catch(() => CPseed)`; incluir `CP` no value (espelhar `CR`/`receita_comp` — DataProvider linha ~109)
- Create: `db/schemas/planejamento_comparativo.sql` (espelhar `db/schemas/receita_comparativo.sql`)
- Create: `db/api/planejamento_comparativo.sql` (view `api.planejamento_comp` devolvendo `[{ data: <shape PlanComp> }]` — espelhar `db/api/receita_comparativo.sql`; **a chave da view = `planejamento_comp`**, igual ao arg de `fetchModule`)
- Create: `db/seed/palotina/planejamento_comparativo.sql` (INSERT do mock — espelhar `db/seed/palotina/receita_comparativo.sql`)
- Modify: `db/seed/stage/00_palotina.sql` (adicionar `\i /seed/palotina/planejamento_comparativo.sql`)
- Modify: `db/README.md` (nova linha na tabela: `Planejamento — Comparativo (/planejamento-comp) | planejamento_comparativo | CP`)

**Interfaces:**
- Produces: `useData().CP: PlanComp` (contrato acima); endpoint `GET {API_URL}/planejamento_comp` → `[{ data: PlanComp }]`.

- [ ] **Step 1: Ler as referências** — `db/schemas/receita_comparativo.sql`, `db/api/receita_comparativo.sql`, `db/seed/palotina/receita_comparativo.sql` (para copiar a estrutura: tabela guarda o shape como JSONB `data`; a view `api.receita_comp` faz `select data`). Confirmar o nome exato da view e o formato do seed.
- [ ] **Step 2: Tipo** — `src/types.ts`: `PlanVincComp` e `PlanComp` (contrato acima), reusando `LabelValue` e o tipo de nó de `ReceitaComp.arvore`.
- [ ] **Step 3: Seed data.ts (fallback)** — `export const CP: PlanComp = { anoA:2025, anoB:2026, orcA:478, orcB:512, recA:478, recB:512, despA:478, despB:512, evol:[["2022",395],["2023",420],["2024",448],["2025",478],["2026",512]], vinc:[{nome:"Pessoal (LRF)",a:41.2,b:41.98,limite:54},{nome:"Saúde (ASPS)",a:24.9,b:25.62,limite:15},{nome:"Educação (MDE)",a:25.4,b:25.9,limite:25}], entidades:[["Prefeitura",440,470],["Câmara",13,14],["RPPS/Previdência",70,78],["Saneamento",22,24]], arvore:[/* mesma forma de CR.arvore */], totA:478, totB:512 }`. **Representativo — ver Decisão pendente.**
- [ ] **Step 4: DB (mock no banco)** — criar o tripé `db/schemas|api|seed/palotina/planejamento_comparativo.sql` espelhando `receita_comparativo`. O seed insere **o mesmo shape do `CP`** como JSONB `data` (fonte única de valores — copiar os números do Step 3). Adicionar o `\i` em `db/seed/stage/00_palotina.sql` e a linha no `db/README.md`.
- [ ] **Step 5: Provider** — wiring do `fetchModule<PlanComp>("planejamento_comp").catch(()=>CPseed)` + `CP` no contexto.
- [ ] **Step 6:** `npm run typecheck` → sem erros. Validar o SQL localmente se houver Postgres de dev (senão, só revisão sintática espelhando o vizinho). Commit: `feat(data+db): fatia CP (PlanComp) — mock no banco + fallback data.ts`.

### Task FIXES: rename do grupo + bug de z-index (App.tsx)

**Files:**
- Modify: `src/App.tsx:232` (label do grupo) e o `<div>` de rodapé da sidebar (~linha 886, wrapper dos botões Configurações/Recolher).

- [ ] **Step 1: Rename** — trocar `label: "Análises",` (linha 232) por `label: "Comparativos",`. Propaga p/ nav (821) e painel Módulos (1048); CSS já faz uppercase. Sem mudança de testes.
- [ ] **Step 2: z-index** — no `<div>` de rodapé que envolve Configurações + Recolher (container com `borderTop`/`flexShrink:0`, pai do wrapper `relative` da linha 888), adicionar ao `style`: `position: "relative", zIndex: 40`. Cria stacking context do rodapé **acima** do `<nav>` (linha 795, `overflowY:auto`), fazendo o popover pintar por cima da scrollbar.
- [ ] **Step 3: Verificação no browser (obrigatória):** subir `mirante-dev`, logar, abrir Configurações → screenshot confirmando que a scrollbar do nav **não** aparece mais por cima do popover. Se persistir: adicionar `isolation: "isolate"` ao `<aside>` (linha 731) e/ou subir `zIndex` do popover (938) p/ 50 — reverificar.
- [ ] **Step 4:** `typecheck` + `format`. Commit: `fix(sidebar): grupo Comparativos + popover acima da scrollbar (z-index)`.

### Task ALERTS: bloco de alertas do novo módulo

**Files:**
- Modify: `src/AnalisesAlertas.tsx` — adicionar `AA["/planejamento-comp"]` no dicionário `AA` (~linha 19), no formato dos vizinhos (`/receita-comp` na 204).

- [ ] **Step 1:** Adicionar a chave `"/planejamento-comp"` com `{ itens: Item[], emDia: [string,string][] }` p/ gestor de Planejamento/Fazenda. Itens (usar `sev: "crit"|"warn"|"info"`, `titulo`, `det`, opcional `href`): 
  - warn — "Equilíbrio LOA: despesa fixada acompanha receita prevista";
  - warn — "Pessoal previsto (LRF) a 41,98% do teto de 54% na LOA 2026";
  - info — "Educação prevista 25,9% ≥ mínimo 25% (MDE)"; info — "Saúde prevista 25,62% ≥ 15% (ASPS)";
  - info — "Orçamento consolidado 2026: R$ 512 mi (+7,1% vs 2025)";
  - `emDia`: ["Câmara (CF 29-A)","dentro do limite"], ["RPPS","taxa de adm. ok"].
  Texto estático coerente com o seed `CP`.
- [ ] **Step 2:** `typecheck`. Commit: `feat(alertas): bloco /planejamento-comp em AA`.

### Task MODULE: componente do módulo (arquivo novo)

**Files:**
- Create: `src/modules/PlanejamentoComparativoModule.tsx`

**Interfaces:**
- Consumes: `useData().CP` (contrato), `useTheme()` (`t, prev, cur`), componentes de `../components`, helpers de `../format`.
- Produces: `export default function PlanejamentoComparativoModule()`.

- [ ] **Step 1: Esqueleto** espelhando `ReceitaComparativoModule.tsx` (o mais próximo: KPIs comparativos + evolução multi-ano + árvore):
  - `const { CP } = useData(); const { t, prev, cur } = useTheme();`
  - `const ev = CP.entidades.map(([n,a,b]) => ({ nome:n, ...vari(a,b) })).sort((x,y)=>y.p-x.p);`
- [ ] **Step 2: KPIs** (`grid lg:grid-cols-5`): `<KpiCmp label="Orçamento consolidado (LOA)" a={CP.orcA} b={CP.orcB} accent={t.primary}/>`, `<KpiCmp label="Receita prevista" a={CP.recA} b={CP.recB}/>`, `<KpiCmp label="Despesa fixada" a={CP.despA} b={CP.despB}/>`, + 2 `<Card>` com `<Delta {...ev[0]}/>` (maior alta/entidade) e `<Delta {...ev[ev.length-1]}/>` (maior queda).
- [ ] **Step 3: Evolução 4-5 anos** — AreaChart recharts direto (copiar bloco 83-125 de `ReceitaComparativoModule.tsx`), `data={CP.evol.map(([ano,v])=>({ano, "Orçamento":v}))}`, gradiente, `<Tip/>`. Card lateral com CAGR calculado de `CP.evol` (`((last/first)**(1/(n-1))-1)*100`) e `<Delta {...vari(CP.orcA,CP.orcB)}/>`.
- [ ] **Step 4: Comparativo 2 anos** — `<GroupedBars data={CP.entidades.map(([n,a,b])=>({mes:n, a2025:a, a2026:b}))} height={250}/>` (por entidade, prev×cur) + `<Diverging data={ev} height={250} ylabel={110}/>` (variação YoY %). Legendas `<LegendDot color={prev/cur}/>`.
- [ ] **Step 5: Vinculações previstas** — card com tabela/HBar comparando `CP.vinc` (Pessoal/Saúde/Educação): ano A, ano B, limite, cor condicional (`t.ok`/`t.warn`/`t.danger`) por proximidade do limite.
- [ ] **Step 6: Tabela** — `<TreeCmp nodes={CP.arvore} level0="Função" totalLabel="Despesa Fixada (LOA)" tot25={CP.totA} tot26={CP.totB}/>`.
- [ ] **Step 7:** `typecheck` (precisa do tipo da Task DATA). Commit: `feat(modulo): PlanejamentoComparativoModule (comparativo LOA)`.

Nota: **não** importar `AnalisesAlertas` aqui — o App injeta via `path`. `data-autoscroll-tab` **não** é necessário (módulo sem abas).

---

## SPRINT 2 — Integração + testes (serial, após merge do Sprint 1)

### Task REG: registrar rota + item de nav (App.tsx)

**Files:**
- Modify: `src/App.tsx` (import ~linha 15; `ROUTES` ~linha 130; grupo "Comparativos" `items` ~linha 233-248).

- [ ] **Step 1: Import** (ordem alfabética): `import PlanejamentoComparativoModule from "./modules/PlanejamentoComparativoModule";`.
- [ ] **Step 2: ROUTES** — adicionar `{ path: "/planejamento-comp", title: "Planejamento — Comparativo Anual", el: PlanejamentoComparativoModule },`.
- [ ] **Step 3: NAV_GROUPS** — no grupo `label: "Comparativos"`, adicionar `{ path: "/planejamento-comp", label: "Planejamento", icon: "M3 4h18v18H3zM16 2v4M8 2v4M3 10h18" }`.
- [ ] **Step 4:** `typecheck`. Commit: `feat(nav): módulo Planejamento no grupo Comparativos`.

### Task TEST: unit + e2e

**Files:**
- Modify: `src/App.test.tsx`, `e2e/app.spec.ts`.

- [ ] **Step 1: Unit** — as invariantes existentes (path único; item de nav → rota) já cobrem. Adicionar asserção direcionada em `src/App.test.tsx`: `/planejamento-comp` existe em `ROUTES` e o item "Planejamento" está no grupo "Comparativos" de `NAV_GROUPS`. `npm test`.
- [ ] **Step 2: e2e** — **cuidado:** já existe "Planejamento" no grupo Movimento; o teste "navega por todos" usa `.first()`, que clicaria no de Movimento. Portanto criar teste dedicado que navega via o link `href="/planejamento-comp"` (`page.locator('nav a[href="/planejamento-comp"]').click()`), confirma `h1` = "Planejamento — Comparativo Anual", que renderiza um KPI (ex.: texto "Despesa fixada") e que "Análises e Alertas" aparece. NÃO adicionar "Planejamento" ao array `MODULOS` genérico (colisão de rótulo).
- [ ] **Step 3:** `npm test && npx playwright test` → verde. `format`. Commit: `test(planejamento-comp): unit + e2e do módulo comparativo`.

---

## Verificação end-to-end (manual)

1. `mirante-dev`, admin. Sidebar: grupo agora **COMPARATIVOS**; Configurações → Módulos também mostra a seção **COMPARATIVOS**.
2. Abrir Configurações → scrollbar **não** cobre o popover (bug resolvido) — screenshot.
3. Comparativos → **Planejamento**: KPIs (orçamento/receita/despesa LOA A×B), evolução 4-5 anos, barras por entidade, variação YoY, vinculações previstas, tabela por função, e "Análises e Alertas" abaixo.
4. Modo TV percorre o novo módulo (entra no `ORDER` do auto-scroll).
5. Safari + Chrome. `typecheck`/`format` limpos.

## Self-Review (cobertura)

- Item 1 (rename) → Task FIXES Step 1 (única ocorrência, App.tsx:232; propaga p/ nav + Módulos).
- Item 2 (z-index) → Task FIXES Step 2-3 (rodapé `position:relative`+`zIndex:40`; verificação no browser + fallback `isolation`).
- Item 3 (módulo) → Task DATA (fonte multi-ano nova, pois PLAN é ano único) + Task MODULE (KPIs/Charts/Tables espelhando ReceitaComparativo) + Task ALERTS (AA key) + Task REG (rota/nav) + Task TEST.
- Nomes consistentes: `PlanComp`/`CP`/`/planejamento-comp`/`PlanejamentoComparativoModule`. Colisão do rótulo "Planejamento" (Movimento vs Comparativos) documentada no e2e.

## Fora de escopo

- Dados oficiais plurianuais da LOA (seed representativo — trocar quando houver).
- Abas internas / `data-autoscroll-tab` no novo módulo (não aplicável).
- Deploy — commit local; stage após verificação; production sob ordem.
