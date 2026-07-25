# Planejamento Comparativo — Abas por Entidade (spec de execução)

Repo: /Users/code42/code/projects/mirante/tv. Sem push (commit local; stage/prod sob ordem).
Dados REPRESENTATIVOS (mock no banco normalizado + fallback data.ts) — trocar na integração DW→API.

## Objetivo
Adicionar ao módulo `/planejamento-comp` as 5 abas do `PlanejamentoModule` (Orçamento Integral,
Prefeitura, Câmara, Previdência, Saneamento), cada uma com comparativo A(2025)×B(2026) + evolução
4–5 anos (KPIs/charts/tables) e seu próprio "Análises e Alertas" respeitando o mesmo enable/disable
global (Extras → Análises e Alertas).

## Contrato de tipos (types.ts, perto de PlanComp)
```ts
export interface PlanEntComp {
  recA: number; recB: number;      // receita prevista 2025/2026
  despA: number; despB: number;    // despesa fixada
  resA: number; resB: number;      // resultado (rec-desp); 0 p/ entes equilibrados
  evol: LabelValue[];              // série anual (orçamento/despesa) 2022..2026
  grupo: [nome: string, a: number, b: number][]; // despesa por grupo A×B
  vinc: PlanVincComp[];            // vinculações relevantes (pode ser [])
}
// PlanComp ganha: pref, camara, prev, san: PlanEntComp  (integral usa os campos já existentes)
```

## Seed representativo (data.ts CP.{pref,camara,prev,san}) e DB
Coerente com as entidades já existentes (2025→2026): Prefeitura 440→470, Câmara 13→14,
RPPS 70→78, Saneamento 22→24.
- **pref**: rec/desp 440/470, res 0/0. evol ["2022",368]["2023",392]["2024",415]["2025",440]["2026",470].
  grupo: ["Pessoal",190,205],["Custeio",150,158],["Investimentos",55,60],["Transferências",30,32],["Encargos",15,15].
  vinc: Pessoal (LRF) a41.2 b41.98 limite54; Saúde (ASPS) 24.9/25.62/15; Educação (MDE) 25.4/25.9/25.
- **camara**: rec/desp 13/14, res 0/0. evol 11,12,12.5,13,14.
  grupo: ["Pessoal",9,9.6],["Custeio",3.2,3.6],["Investimentos",0.8,0.8].
  vinc: Folha (CF 29-A) a68 b69 limite70 (teto); Duodécimo (% RLA) a6.8 b6.9 limite7 (teto).
- **prev** (RPPS): rec 70/78, desp 62/68, res 8/10. evol (receita prev) 58,64,68,70,78.
  grupo (benefícios): ["Aposentadorias",44,48],["Pensões",12,13],["Auxílios",4,4.5],["Adm.",2,2.5].
  vinc: Taxa de Administração a1.8 b1.9 limite2 (teto).
- **san**: rec 22/24, desp 20/22, res 2/2. evol 16,18,20,22,24.
  grupo: ["Custeio",11,12],["Investimentos",7,8],["Pessoal",2,2].
  vinc: [] (Investimentos vira KPI a partir de grupo).

DB: estender o tripé `planejamento_comparativo` com dimensão `entidade`:
- `totais(exercicio, entidade, orcamento, receita, despesa)` PK(exercicio,entidade) — 'integral' = série consolidada atual; + linhas pref/camara/prev/san.
- `vinculacoes(exercicio, entidade, nome, valor, limite)` PK(exercicio,entidade,nome) — integral=Pessoal/Saúde/Educação atuais; + por entidade.
- `grupos(exercicio, entidade, grupo, valor)` PK(exercicio,entidade,grupo) — despesa por grupo por entidade (nova tabela).
- `entidades(exercicio, entidade, valor)` e `arvore(...)` — mantêm (só integral).
A view `api.planejamento_comp` monta, além do integral atual, `pref/camara/prev/san` a partir das
linhas filtradas por `entidade`. Fallback data.ts idêntico. Espelhar receita_comparativo no estilo.

## Gate de alertas unificado (enable/disable p/ sub-módulos)
- `src/App.tsx`: criar `ExtrasContext` (React.createContext) + `export const useExtras`; Shell envolve o conteúdo com `<ExtrasContext.Provider value={extras}>`. A injeção existente vira `<AnalisesAlertas path={route.path} />` (SEM `extras &&`).
- `src/AnalisesAlertas.tsx`: no início de `AnalisesAlertas`, `const extras = useExtras(); if (!extras) return null;` (auto-gate). Assim o mesmo componente serve App e sub-módulos com o MESMO enable/disable.
- Remover a chave base `AA["/planejamento-comp"]`; criar 5 chaves de sub-módulo:
  `/planejamento-comp/integral`, `/planejamento-comp/prefeitura`, `/planejamento-comp/camara`,
  `/planejamento-comp/previdencia`, `/planejamento-comp/saneamento`, cada uma com itens relevantes
  (Prefeitura: pessoal/saúde/educação previstos; Câmara: folha/duodécimo CF 29-A; Previdência:
  equilíbrio previdenciário/taxa adm; Saneamento: investimentos/resultado; Integral: equilíbrio LOA + resumo).
- `src/AnalisesAlertas.test.tsx` invariante "registro AA não referencia rotas fora do painel":
  aceitar chave cujo prefixo até a última `/` seja um path da nav (sub-módulos). Ex.:
  `const parent = key.slice(0, key.lastIndexOf("/")); expect(paths.has(key) || paths.has(parent))` (para chaves de 1 nível a fatia devolve "" — trate p/ não quebrar as chaves simples existentes).

## Módulo com abas (src/modules/PlanejamentoComparativoModule.tsx)
- `const [aba,setAba]=useState("integral")`; abas iguais ao PlanejamentoModule, botões com `data-autoscroll-tab` (Modo TV percorre abas).
- `integral` = conteúdo atual (não regredir).
- Cada entidade (usa `CP.pref|camara|prev|san`): KPIs `KpiCmp` (receita prevista, despesa fixada, resultado quando res≠0); AreaChart de evolução (evol) + CAGR (`((last/first)**(1/(n-1))-1)*100`, dP); `GroupedBars` A×B por grupo (mapear grupo→{mes:nome,a2025:a,a2026:b}); `Diverging` YoY por grupo; card de vinculações (`vinc`, cor condicional t.ok/t.warn/t.danger — Pessoal/Folha/Duodécimo/Taxa = teto; Saúde/Educação = mínimo). Ao fim de CADA aba: `<AnalisesAlertas path={`/planejamento-comp/${aba}`}/>`.
- NÃO renderizar AnalisesAlertas fora da aba; o App não injeta mais nada p/ essa rota (chave base removida).

## Testes
- Ajustar e2e existente "Planejamento (Comparativos)…": conferir aba integral (KPI + alerta `/integral`); adicionar cliques nas abas Prefeitura/Câmara/Previdência/Saneamento conferindo KPI e alerta por aba; "Extras off" some em todas.
- `npm run typecheck && npm test && npx playwright test && npm run format` verdes.
