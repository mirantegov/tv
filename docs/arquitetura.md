# Arquitetura

## Stack

- **React 18** + **TypeScript** (typing gradual; `data.ts` valida sob `--strict`)
- **Vite 5** (dev server e build)
- **TailwindCSS 3.4** (utilitários) + estilos inline com tokens do tema
- **Recharts** (gráficos)
- **Biome** (lint + format, indentação por tabs)

Sem dependência de roteador ou state manager externos — router e tema são
implementações próprias em contexto React.

## Estrutura de pastas

```
index.html / src/index.tsx    Entrada Vite (monta <App/>)
src/App.tsx                   Shell: sidebar, header, rotas, configurações, auto-scroll
src/router.tsx                Router em memória (RouterProvider/useRouter/Link)
src/theme.tsx                 Temas (6 famílias × light/dark), ThemeProvider, ThemePanel
src/components.tsx            Card, Kpi, Title, Donut, HBar, árvores etc. (compartilhados)
src/data.ts                   Dados mockados (um export por módulo) — ver docs/dados.md
src/types.ts                  Interfaces do modelo de dados
src/format.ts                 fmt/brl/pct/fmtInt e variação
src/AnalisesAlertas.tsx       Seção "Análises e Alertas" (conteúdo por rota)
src/LoginScreen.tsx           Tela de login (validação client-side)
src/users.ts                  Usuários demo
src/modules/*.tsx             Um arquivo por módulo do painel
db/schemas/*.sql              DDL PostgreSQL de referência (um schema por módulo)
docs/                         Esta documentação
```

## Fluxo principal (App.tsx)

`App` → `ThemeProvider` → `RouterProvider` → `AuthGate` (login ↔ `Shell`).

O `Shell` renderiza:

1. **Sidebar** — grupos de `NAV_GROUPS` (filtrados pelos módulos ocultos em
   `mg_modules`), rodapé com **Configurações** e **Recolher**.
2. **Header** — título da rota (`ROUTES[].title`) e badge de exercício.
3. **Main** — componente do módulo (`ROUTES[].el`) e, se o Extra estiver
   ligado, `<AnalisesAlertas path={...}/>`.

### Router

`src/router.tsx` mantém a rota em estado de contexto (sem History API).
`Link` aceita `href`, `title` e `onNav`. Para navegar programaticamente use
`useRouter().push(path)`.

### Tema

`src/theme.tsx` define `THEMES` (Ocean, Monokai, AstroVista, Apex, Green,
Cyber) cada um com paleta light/dark (`t.background`, `t.primary`, `t.ok`,
`t.warn`, `t.danger`…). Componentes **sempre** leem cores de `useTheme().t` —
nunca hardcode. `ThemePanel` é o conteúdo da seção Aparência do menu
Configurações.

### Menu Configurações (rodapé da sidebar)

Popover em acordeão com seções:

- **Aparência** — tema e modo (ThemePanel)
- **Módulos** — switches para ocultar módulos da sidebar (persistem em `mg_modules`;
  rotas em `LOCKED_PATHS` não aparecem — não podem ser desligadas)
- **Extras** — switch "Análises e Alertas" (`mg_extras`)
- **Scroll Automático** — modo TV: percorre todos os módulos visíveis rolando
  a página (1 px a cada 40 ms), reiniciando o ciclo ao final
- **Sair** — logout

### Análises e Alertas

`src/AnalisesAlertas.tsx` concentra o conteúdo analítico por rota
(record `AA: path → {itens, emDia}`) e é renderizado centralmente pelo App —
módulos não precisam saber da seção. Severidades: `crit` (borda `t.danger`),
`warn` (`t.warn`), `info` (`t.primary`).

## Convenções de UI

- Valores monetários em **R$ milhões** (`brl()` de format.ts).
- KPIs usam `<Kpi/>`; seções de card usam `<Card/> + <Title/>`.
- Grids responsivos com classes Tailwind (`sm:grid-cols-2 lg:grid-cols-4`…);
  o App injeta um fallback de classes de grid para o runtime da TV.
