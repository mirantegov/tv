# /admin — redesign com shadcn/ui (tema Twitter dark) — Design

**Data:** 2026-07-28 · **Escopo:** apenas a SPA `/admin` · **Não inclui:** a TV (painel do gestor)

## Problema

O `/admin` (Épicos 2–3) foi construído com styling inline mínimo — funciona, mas o resultado
visual é pobre: formulário de criação solto no topo, erros como texto vermelho cru,
`window.prompt` para trocar senha, tabelas que são `<div>`s empilhadas, nenhuma hierarquia
visual, nenhuma navegação persistente.

## Objetivo

Reimplementar a camada visual do `/admin` com **shadcn/ui**, no layout do template
**satnaing/shadcn-admin** (sidebar + header + conteúdo), usando o **tema Twitter dark** que
já existe no projeto. A lógica de dados (`cpApi`, endpoints, fluxos) **não muda** — é um
reskin estrutural.

## Decisões travadas

| # | Decisão | Porquê |
|---|---|---|
| 1 | **shadcn sobre Tailwind 3** (já instalado) | A TV usa Tailwind 3 ativamente (`src/index.css:1-3`, classes em `App.tsx`). Um projeto Vite = um pipeline Tailwind; v3+v4 lado a lado é frágil. shadcn/ui roda em v3 com resultado visual idêntico. |
| 2 | **Tema Twitter dark** (`src/theme.tsx:433`) | Pedido do dono. Preto puro + azul Twitter. |
| 3 | **TanStack Router com hash history** | `/admin` é entry multi-page do Vite; history normal exigiria rewrite no nginx. Hash funciona igual em dev e prod. |
| 4 | **Só o `/admin`** | A TV acabou de ser validada; não mexer. |
| 5 | Componentes shadcn **copiados para o repo** (`src/admin/components/ui/`) | É o modelo do shadcn (não é dependência opaca); só bibliotecas oficiais (`@radix-ui/*`, `class-variance-authority`, `clsx`, `tailwind-merge`, `tailwindcss-animate`, `lucide-react`). |

> **Nota de segurança:** os repositórios `github.com/shadcnio/*` citados no pedido **não são**
> os oficiais do shadcn (oficial: `shadcn-ui/ui`). Não serão usados como fonte de pacotes.
> O template `satnaing/shadcn-admin` é usado como **referência visual/estrutural**, não como
> dependência.

## Arquitetura visual

### Tokens (Twitter dark → CSS vars do shadcn)

Os valores vêm de `THEMES.twitter.dark.t` em `src/theme.tsx:435-451`. Para permitir
modificadores de opacidade do Tailwind (`bg-primary/90`), as vars guardam **componentes OKLCH
crus** e o `tailwind.config.js` monta a cor com `<alpha-value>`:

```css
/* src/admin/admin.css */
:root {
  --background: 0 0 0;                    /* oklch(0 0 0) — preto */
  --foreground: 0.9328 0.0025 228.7857;
  --card: 0.2097 0.0080 274.5332;
  --primary: 0.6692 0.1607 245.0110;      /* azul Twitter */
  --primary-foreground: 1 0 0;
  --secondary: 0.2674 0.0047 248.0045;
  --muted: 0.2090 0 0;
  --muted-foreground: 0.5637 0.0078 247.9662;
  --accent: 0.1928 0.0331 242.5459;
  --border: 0.2674 0.0047 248.0045;
  --destructive: 0.6188 0.2376 25.7658;
  --radius: 0.5rem;   /* obrigatório — ver "Isolamento" abaixo */
}
```
```js
// tailwind.config.js (extend.colors)
primary: "oklch(var(--primary) / <alpha-value>)"
```

### Isolamento em relação à TV

- `src/admin/admin.css` (com `@tailwind base/components/utilities` + as vars) é importado
  **apenas** por `src/admin/main.tsx`. A TV importa `src/index.css` e não enxerga as vars.
- O `tailwind.config.js` é compartilhado. **Descoberta que restringe o design:** a TV usa
  `rounded-md` (14×) e `rounded-lg` (5×), então sobrescrever `borderRadius` mudaria o visual
  dela. Por isso **`--radius` é fixado em `0.5rem`**: assim `rounded-lg` = `var(--radius)` =
  0.5rem e `rounded-md` = `calc(0.5rem - 2px)` = 0.375rem — **exatamente os defaults do
  Tailwind**. Só `rounded-sm` divergiria, e a TV não o usa (`rounded`, `rounded-xl`,
  `rounded-full` não são sobrescritos).
- Efeito colateral aceito: o CSS da TV cresce com as utilities usadas pelo /admin (bloat,
  sem mudança visual).
- **Critério:** a TV deve continuar pixel-idêntica — verificação visual antes/depois.

### Layout (padrão satnaing/shadcn-admin)

```
┌────────────┬─────────────────────────────────────┐
│  Sidebar   │  Header (título · tema · usuário)   │
│  (Mirante) ├─────────────────────────────────────┤
│  Instalaç. │                                     │
│  Logs      │           Conteúdo (rota)           │
│            │                                     │
│  [colapsar]│                                     │
└────────────┴─────────────────────────────────────┘
```
Mobile: a sidebar vira `Sheet`.

## Telas

| Rota (hash) | Tela | Componentes shadcn |
|---|---|---|
| `#/login` | Login do admin | `Card`, `Input`, `Label`, `Button`, `Alert` |
| `#/instalacoes` | Lista de instalações | `Table`, `Badge` (status), `Button`, `Dialog` (nova instalação), `DropdownMenu` (ações) |
| `#/instalacoes/$id` | Detalhe | `Tabs` (Entidades·Gestores·Licença·Módulos), `Table`, `Dialog` (criar), `AlertDialog` (remover), `Switch` (licença/módulos), `Input`/`Select` |
| `#/logs` | Auditoria e acessos | `Tabs`, `Table`, `Input`/date filters, paginação com `Button` |

Feedback de ação: **`Sonner`** (toast) substitui os textos de erro crus e o `window.prompt`
da troca de senha (que vira um `Dialog` com campo de senha).

## Fora de escopo

- Redesign da TV (painel do gestor) — épico separado se desejado.
- Mudanças em endpoints, contratos de API ou regras de negócio.
- Persistência tenant-wide de `#extras`/`#modotv` (follow-up conhecido).

## Riscos

1. **CLI do shadcn assume Tailwind 4** nas versões novas → fixar CLI v2.x (era Tailwind 3) e
   conferir que ele não altera a versão do Tailwind no `package.json`; fallback: criar os
   arquivos de componente à mão.
2. **Regressão visual na TV** pela config compartilhada → verificar no navegador antes/depois.
3. **Testes atuais do /admin** consultam o DOM antigo → serão reescritos junto (a lógica de
   `cpApi` não muda).

## Critérios de aceite

- [ ] `/admin` renderiza no layout sidebar+header, tema Twitter dark, em todas as 4 telas.
- [ ] Navegação por hash funciona, inclusive deep-link (`#/instalacoes/4117909`) e refresh.
- [ ] Fluxos preservados: login, criar/editar/remover instalação, entidades, gestores
      (incl. trocar senha), licença, módulos, logs com filtro e paginação.
- [ ] Erros viram toast; nenhum `window.prompt` remanescente.
- [ ] Suíte verde (testes do /admin reescritos; testes da TV intocados).
- [ ] **A TV permanece visualmente idêntica** (verificação no navegador).
