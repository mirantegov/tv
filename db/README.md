# Banco de dados — Mirante Gov

DDL PostgreSQL de referência para a API que substituirá os dados mockados de
`src/data.ts`. **Um schema por módulo**, um arquivo por módulo em `schemas/`.

## Mapeamento módulo → schema → mock

| Módulo (rota)                          | Schema                 | Export em `src/data.ts` |
| -------------------------------------- | ---------------------- | ----------------------- |
| Despesa (`/despesa`)                   | `despesa`              | `D`                     |
| Despesas — Comparativo (`/despesa-comp`) | `despesa_comparativo` | `CD`                    |
| Receita (`/receita`)                   | `receita`              | `R`                     |
| Receitas — Comparativo (`/receita-comp`) | `receita_comparativo` | `CR`                    |
| Financeiro — Tesouraria (`/financeiro`) | `financeiro`          | `F`                     |
| Finanças — Análises (`/financeiro-analises`) | `financeiro_analises` | `FA`              |
| Tributação (`/tributacao`)             | `tributacao`           | `TB`                    |
| Folha de Pagamento (`/folha`)          | `folha`                | `FP`                    |
| People Analytics (`/people`)           | `people`               | `PA`                    |
| Licitações (`/licitacoes`)             | `licitacoes`           | `LIC`                   |
| Contratos (`/contratos`)               | `contratos`            | `CON`                   |
| Planejamento — LOA (`/planejamento`)   | `planejamento`         | `PLAN`                  |
| TCE/PR (`/tce`)                        | `tce`                  | `PC.tce`                |
| SICONFI (`/siconfi`)                   | `siconfi`              | `PC.siconfi`            |
| Panorama Municipal (`/panorama`)       | `panorama`             | `PAN`                   |
| Secretarias (`/sec/<slug>`)            | `secretarias`          | `SEC`                   |

**Visão Geral** (`/`) e a seção **Análises e Alertas** não têm schema próprio:
são agregações/derivações dos schemas acima (a API deve expô-las como views ou
endpoints compostos).

## Convenções

- **Valores monetários em R$ milhões** (`numeric(14,2)`), como o painel exibe.
  Se a API armazenar em reais, converter na borda.
- **`exercicio`** (ano) em toda tabela; **`mes`/`competencia`** (1–12) nas
  séries mensais. Comparativos guardam 1 linha por exercício — o front escolhe
  os anos a comparar.
- Percentuais em `numeric(6,2)`; status/severidade em `text` com `CHECK`
  (`ok` / `warn` / `danger`).
- Árvores (despesa por função, receita por natureza) usam `id` + `parent_id`
  na mesma tabela, com valores por exercício.
- Comentários `-- X.campo` em cada tabela apontam o campo do mock que ela
  substitui.
- **LGPD**: `tributacao.devedores` contém dados pessoais — anonimizar ou
  restringir por perfil em produção.

## Aplicação

```sh
psql "$DATABASE_URL" -f schemas/<modulo>.sql   # um módulo
for f in schemas/*.sql; do psql "$DATABASE_URL" -f "$f"; done  # todos
```
