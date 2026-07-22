# Módulos

Cada módulo é um arquivo em `src/modules/`, registrado em `ROUTES`
(título interno do header) e em `NAV_GROUPS` (grupo + rótulo da sidebar)
no `src/App.tsx`. O rótulo da sidebar pode diferir do título interno.

## Mapa de módulos

| Rota                   | Título (header)                    | Sidebar (grupo · rótulo)            | Arquivo                          | Mock (`data.ts`) |
| ---------------------- | ---------------------------------- | ----------------------------------- | -------------------------------- | ---------------- |
| `/`                    | Visão Geral                        | — · Visão Geral 🔒                  | VisaoGeralModule.tsx             | agrega os demais |
| `/panorama`            | Panorama Municipal                 | — · Panorama 🔒                     | PanoramaModule.tsx               | `PAN`            |
| `/despesa`             | Despesa — Visão Geral              | Movimento · Despesa 🔒              | DespesaModule.tsx                | `D`              |
| `/receita`             | Receita — Visão Geral              | Movimento · Receita 🔒              | ReceitaModule.tsx                | `R`              |
| `/tributacao`          | Tributação e Fiscalização          | Movimento · Tributação              | TributacaoModule.tsx             | `TB`             |
| `/financeiro`          | Financeiro — Tesouraria            | Movimento · Financeiro              | FinanceiroModule.tsx             | `F`              |
| `/planejamento`        | Planejamento Orçamentário (LOA)    | Movimento · Planejamento            | PlanejamentoModule.tsx           | `PLAN`           |
| `/licitacoes`          | Licitações                         | Movimento · Licitações              | LicitacoesModule.tsx             | `LIC`            |
| `/contratos`           | Contratos Municipais               | Movimento · Contratos               | ContratosModule.tsx              | `CON`            |
| `/folha`               | Folha de Pagamento                 | Movimento · Folha de Pagamento      | FolhaModule.tsx                  | `FP`             |
| `/people`              | People Analytics                   | Movimento · People Analytics        | PeopleModule.tsx                 | `PA`             |
| `/despesa-comp`        | Despesa — Comparativo Anual        | Análises · Despesas 🔒              | DespesaComparativoModule.tsx     | `CD`             |
| `/receita-comp`        | Receita — Evolução / Comparativo   | Análises · Receitas 🔒              | ReceitaComparativoModule.tsx     | `CR`             |
| `/financeiro-analises` | Financeiro — Análises              | Análises · Finanças                 | FinanceiroAnalisesModule.tsx     | `FA`             |
| `/tce`                 | TCE/PR                             | Contas Públicas · TCE/PR 🔒         | PrestacaoModule.tsx (`TcePrModule`)   | `PC.tce`     |
| `/siconfi`             | SICONFI                            | Contas Públicas · SICONFI           | PrestacaoModule.tsx (`SiconfiModule`) | `PC.siconfi` |

🔒 = rota em `LOCKED_PATHS` (App.tsx): não pode ser desativada no menu
Configurações → Módulos. As demais podem ser ocultadas da sidebar pelo usuário.

## Como criar um módulo novo

1. **Dados**: adicione a interface em `src/types.ts` e o export mockado em
   `src/data.ts` (e o schema correspondente em `db/schemas/` — um schema por
   módulo, ver `db/README.md`).
2. **Componente**: crie `src/modules/MeuModulo.tsx` usando `useTheme()` e os
   componentes de `src/components.tsx`. Exporte como default (ou named, como
   no PrestacaoModule).
3. **Rota**: registre em `ROUTES` no `src/App.tsx` (`{path, title, el}`).
4. **Sidebar**: adicione o item no grupo certo de `NAV_GROUPS`
   (`{path, label, icon}` — `icon` é um path SVG 24×24, stroke 2).
5. **Opcional**: se o módulo puder ser desativado pelo usuário, não o adicione
   a `LOCKED_PATHS`; adicione conteúdo dele em `src/AnalisesAlertas.tsx`
   (record `AA`) para a seção Análises e Alertas.
6. Rode `npm run format && npm run typecheck` e teste no preview.

O Scroll Automático percorre `NAV_GROUPS` automaticamente — módulos novos
entram no ciclo sem configuração extra.
