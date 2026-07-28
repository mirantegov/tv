# /admin — redesign com shadcn/ui — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Reimplementar a camada visual da SPA `/admin` com shadcn/ui no layout do template satnaing/shadcn-admin (sidebar + header + conteúdo), tema Twitter dark, roteamento por hash com TanStack Router — sem alterar lógica de dados nem a TV.

**Architecture:** shadcn/ui sobre o **Tailwind 3 já instalado** (config compartilhado, mas CSS do admin isolado). Componentes copiados para `src/admin/components/ui/`. Rotas por hash. A TV (`src/index.css`, `src/App.tsx`) **não é tocada**.

**Tech Stack:** React 18, Vite 5 (multi-entry), Tailwind 3.4, shadcn/ui (Radix + CVA + tailwind-merge + tailwindcss-animate), lucide-react, sonner, @tanstack/react-router.

**Spec:** [2026-07-28-admin-shadcn-redesign-design.md](../specs/2026-07-28-admin-shadcn-redesign-design.md)

## Global Constraints

- **Não alterar** `src/index.css`, `src/App.tsx`, `src/theme.tsx`, `src/components.tsx`, `src/LoginScreen.tsx` nem qualquer arquivo da TV. A TV deve permanecer **visualmente idêntica**.
- `tailwind.config.js` é compartilhado: só **acrescentar** (`extend`), nunca remover/substituir chaves existentes. Manter `content` cobrindo `./src/**/*.{ts,tsx}`.
- **`--radius` DEVE ser `0.5rem`.** Motivo: a TV usa `rounded-md` (14×) e `rounded-lg` (5×). Com `0.5rem`, `rounded-lg` = `var(--radius)` = 0.5rem e `rounded-md` = `calc(0.5rem - 2px)` = 0.375rem — **exatamente os defaults do Tailwind**, logo a TV não muda. (`rounded-sm` mudaria, mas a TV não o usa; `rounded`, `rounded-xl`, `rounded-full` não são sobrescritos.) **Não usar 0.625rem.**
- Tailwind **3** — não instalar nem migrar para v4. Se alguma ferramenta tentar subir a versão do Tailwind no `package.json`, reverter.
- Dependências apenas oficiais: `@radix-ui/*`, `class-variance-authority`, `clsx`, `tailwind-merge`, `tailwindcss-animate`, `lucide-react`, `sonner`, `@tanstack/react-router`. **Não** usar `shadcnio/*`.
- Tema **dark-only** no /admin (tokens Twitter dark). Sem toggle de tema.
- **Lógica de dados não muda:** `src/admin/cpApi.ts` (endpoints, headers, tokens) permanece como está. É reskin.
- Formatação: Biome com **tabs** (`biome.json`) — rodar `npx biome check --write src/admin` ao final de cada task.
- TDD onde há teste: os testes do /admin são reescritos junto da tela correspondente. Testes da TV não podem quebrar.

### Tokens (Twitter dark) — valores exatos

Componentes OKLCH crus (sem `oklch()`), para o Tailwind injetar alpha:

| var | valor | origem |
|---|---|---|
| `--background` | `0 0 0` | theme.tsx:437 |
| `--foreground` | `0.9328 0.0025 228.7857` | :438 |
| `--card` / `--popover` | `0.2097 0.0080 274.5332` | :439 |
| `--card-foreground` / `--popover-foreground` | `0.9328 0.0025 228.7857` | = foreground |
| `--primary` / `--ring` | `0.6692 0.1607 245.0110` | :440 |
| `--primary-foreground` | `1 0 0` | :441 |
| `--secondary` | `0.2674 0.0047 248.0045` | :443 |
| `--secondary-foreground` | `0.9328 0.0025 228.7857` | = foreground |
| `--muted` | `0.2090 0 0` | :444 |
| `--muted-foreground` | `0.5637 0.0078 247.9662` | :445 |
| `--accent` | `0.1928 0.0331 242.5459` | :446 |
| `--accent-foreground` | `0.9328 0.0025 228.7857` | = foreground |
| `--border` / `--input` | `0.2674 0.0047 248.0045` | :447 |
| `--destructive` | `0.6188 0.2376 25.7658` | :450 |
| `--destructive-foreground` | `1 0 0` | — |
| `--radius` | **`0.5rem`** | ver constraint acima |

---

### Task 1: Fundação — deps, alias, Tailwind config, CSS do admin

**Files:**
- Create: `src/admin/admin.css`, `src/admin/lib/utils.ts`, `components.json`
- Modify: `package.json` (deps), `tailwind.config.js` (extend), `tsconfig.json` (paths), `vite.config.ts` (alias), `src/admin/main.tsx` (import do CSS)

**Interfaces:**
- Produces: `cn(...inputs)` em `src/admin/lib/utils.ts`; alias `@/*` → `./src/*`; tokens CSS acima disponíveis para `bg-background`, `text-foreground`, `border-border`, `bg-primary`, etc.

- [ ] **Step 1: Instalar dependências**

```bash
npm i @radix-ui/react-slot @radix-ui/react-dialog @radix-ui/react-alert-dialog \
  @radix-ui/react-dropdown-menu @radix-ui/react-tabs @radix-ui/react-label \
  @radix-ui/react-switch @radix-ui/react-separator \
  class-variance-authority clsx tailwind-merge lucide-react sonner \
  @tanstack/react-router
npm i -D tailwindcss-animate
```
Depois **confira no `package.json`** que `tailwindcss` continua `^3.4.x`.

- [ ] **Step 2: Alias `@` → `src`**

`tsconfig.json` — acrescentar em `compilerOptions` (preservando o resto):
```json
"baseUrl": ".",
"paths": { "@/*": ["./src/*"] }
```
`vite.config.ts` — acrescentar (preservando `plugins` e `build.rollupOptions` existentes):
```ts
import { resolve } from "node:path";
// dentro de defineConfig({...}):
  resolve: { alias: { "@": resolve(__dirname, "./src") } },
```

- [ ] **Step 3: `src/admin/lib/utils.ts`**

```ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
```

- [ ] **Step 4: `src/admin/admin.css`** (importado SÓ pelo admin)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Tema Twitter (dark) — valores de src/theme.tsx:435-451.
   Componentes OKLCH crus: o Tailwind injeta o alpha via <alpha-value>. */
:root {
	color-scheme: dark;
	--background: 0 0 0;
	--foreground: 0.9328 0.0025 228.7857;
	--card: 0.2097 0.0080 274.5332;
	--card-foreground: 0.9328 0.0025 228.7857;
	--popover: 0.2097 0.0080 274.5332;
	--popover-foreground: 0.9328 0.0025 228.7857;
	--primary: 0.6692 0.1607 245.0110;
	--primary-foreground: 1 0 0;
	--secondary: 0.2674 0.0047 248.0045;
	--secondary-foreground: 0.9328 0.0025 228.7857;
	--muted: 0.2090 0 0;
	--muted-foreground: 0.5637 0.0078 247.9662;
	--accent: 0.1928 0.0331 242.5459;
	--accent-foreground: 0.9328 0.0025 228.7857;
	--destructive: 0.6188 0.2376 25.7658;
	--destructive-foreground: 1 0 0;
	--border: 0.2674 0.0047 248.0045;
	--input: 0.2674 0.0047 248.0045;
	--ring: 0.6692 0.1607 245.0110;
	--radius: 0.5rem;
}

@layer base {
	* { @apply border-border; }
	body { @apply bg-background text-foreground antialiased; }
}
```

- [ ] **Step 5: `tailwind.config.js`** — SÓ acrescentar em `extend` + `plugins`

```js
import animate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
	darkMode: ["class"],
	content: ["./index.html", "./admin.html", "./src/**/*.{ts,tsx}"],
	theme: {
		extend: {
			colors: {
				border: "oklch(var(--border) / <alpha-value>)",
				input: "oklch(var(--input) / <alpha-value>)",
				ring: "oklch(var(--ring) / <alpha-value>)",
				background: "oklch(var(--background) / <alpha-value>)",
				foreground: "oklch(var(--foreground) / <alpha-value>)",
				primary: {
					DEFAULT: "oklch(var(--primary) / <alpha-value>)",
					foreground: "oklch(var(--primary-foreground) / <alpha-value>)",
				},
				secondary: {
					DEFAULT: "oklch(var(--secondary) / <alpha-value>)",
					foreground: "oklch(var(--secondary-foreground) / <alpha-value>)",
				},
				destructive: {
					DEFAULT: "oklch(var(--destructive) / <alpha-value>)",
					foreground: "oklch(var(--destructive-foreground) / <alpha-value>)",
				},
				muted: {
					DEFAULT: "oklch(var(--muted) / <alpha-value>)",
					foreground: "oklch(var(--muted-foreground) / <alpha-value>)",
				},
				accent: {
					DEFAULT: "oklch(var(--accent) / <alpha-value>)",
					foreground: "oklch(var(--accent-foreground) / <alpha-value>)",
				},
				popover: {
					DEFAULT: "oklch(var(--popover) / <alpha-value>)",
					foreground: "oklch(var(--popover-foreground) / <alpha-value>)",
				},
				card: {
					DEFAULT: "oklch(var(--card) / <alpha-value>)",
					foreground: "oklch(var(--card-foreground) / <alpha-value>)",
				},
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
			},
			keyframes: {
				"accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
				"accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
			},
			animation: {
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
			},
		},
	},
	plugins: [animate],
};
```

> ⚠️ Com `--radius: 0.5rem`, `rounded-lg`/`rounded-md` mantêm exatamente os valores default do Tailwind → a TV não muda. **Não** altere esse valor.

- [ ] **Step 6: `components.json`** (para o CLI do shadcn)

```json
{
	"$schema": "https://ui.shadcn.com/schema.json",
	"style": "new-york",
	"rsc": false,
	"tsx": true,
	"tailwind": {
		"config": "tailwind.config.js",
		"css": "src/admin/admin.css",
		"baseColor": "slate",
		"cssVariables": true
	},
	"aliases": {
		"components": "@/admin/components",
		"ui": "@/admin/components/ui",
		"utils": "@/admin/lib/utils",
		"lib": "@/admin/lib",
		"hooks": "@/admin/hooks"
	}
}
```

- [ ] **Step 7: importar o CSS no entry do admin**

`src/admin/main.tsx` — acrescentar como primeira linha: `import "./admin.css";`

- [ ] **Step 8: Verificar que a TV não regrediu**

```bash
npx vitest run && npx tsc --noEmit && npx vite build
git diff --stat src/index.css src/App.tsx src/theme.tsx src/components.tsx src/LoginScreen.tsx
```
O `git diff --stat` acima **deve sair vazio**. O build deve gerar os dois entries.

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json tailwind.config.js tsconfig.json vite.config.ts components.json src/admin
git commit -m "chore(admin): fundação shadcn (Tailwind 3, tokens Twitter dark, alias @)"
```

---

### Task 2: Primitivos shadcn + AppShell + Router (hash) + tela de Login

**Files:**
- Create: `src/admin/components/ui/*`, `src/admin/components/layout/app-shell.tsx`, `src/admin/components/layout/sidebar-nav.tsx`, `src/admin/router.tsx`, `src/admin/routes/login.tsx`
- Delete: `src/admin/AdminApp.tsx`, `src/admin/AdminLogin.tsx`, `src/admin/AdminApp.test.tsx`
- Modify: `src/admin/main.tsx`
- Test: `src/admin/routes/login.test.tsx`

**Interfaces:**
- Consumes: `cn` (Task 1), `cpApi` (inalterado).
- Produces:
  - Primitivos em `src/admin/components/ui/`: `button, card, input, label, table, tabs, dialog, alert-dialog, dropdown-menu, badge, separator, sheet, switch, sonner, skeleton`.
  - `AppShell({ titulo, children })` — sidebar + header + `<main>` + `<Toaster/>`.
  - `router` (hash history) com rotas `/login`, `/instalacoes`, `/instalacoes/$id`, `/logs`; `/` redireciona para `/instalacoes`.
  - `LoginPage({ onSuccess? })` — Card centralizado.

- [ ] **Step 1: Adicionar os primitivos shadcn**

```bash
npx shadcn@2.3.0 add button card input label table tabs dialog alert-dialog dropdown-menu badge separator sheet switch sonner skeleton --yes --overwrite
```
Se o CLI falhar ou tentar migrar para Tailwind 4: **não insista** — crie os arquivos manualmente com o código oficial (estilo new-york) de `https://ui.shadcn.com/docs/components/<nome>`, em `src/admin/components/ui/<nome>.tsx`, trocando `@/lib/utils` por `@/admin/lib/utils`.

**Depois, em qualquer caminho, verifique:**
- `package.json` continua com `tailwindcss: ^3.4.x`;
- `src/admin/admin.css` continua com os tokens **OKLCH** e `--radius: 0.5rem` da Task 1 (o CLI costuma sobrescrever com HSL — se sobrescreveu, **restaure** a tabela de tokens).

- [ ] **Step 2: `sidebar-nav.tsx` + `app-shell.tsx`**

Sidebar própria (NÃO usar o bloco `sidebar` do shadcn — mais simples e sob controle):
- Topo: ícone lucide `Landmark` + "Mirante" e subtítulo "Control Plane" (`text-xs text-muted-foreground`).
- Itens com `Link` do TanStack Router: **Instalações** (`Building2`, `/instalacoes`), **Logs** (`ScrollText`, `/logs`). Ativo: `bg-accent text-accent-foreground`; inativo: `text-muted-foreground hover:bg-accent/50`.
- Rodapé: botão **Sair** (`LogOut`) → `cpApi.clearToken()` + `navigate({ to: "/login" })`.
- Desktop: `<aside className="hidden md:flex w-60 shrink-0 border-r bg-card/40 flex-col">`. Mobile: mesmo conteúdo dentro de `Sheet`, acionado por botão `Menu` no header.
- `AppShell`: `<div className="min-h-svh flex">` + aside + `<div className="flex-1 flex flex-col min-w-0">` com `<header className="h-14 border-b flex items-center gap-3 px-4 sticky top-0 bg-background/95 backdrop-blur z-10">` (botão mobile + `<h1 className="text-sm font-medium">{titulo}</h1>`) e `<main className="flex-1 p-4 md:p-6">{children}</main>`. Inclui `<Toaster richColors position="top-right" />`.

- [ ] **Step 3: `src/admin/router.tsx`**

`createRootRoute` / `createRoute` / `createRouter` + `createHashHistory()`. Guard nas rotas privadas:
```ts
beforeLoad: () => { if (!cpApi.getToken()) throw redirect({ to: "/login" }); }
```
Na rota `/login`: se já houver token → `throw redirect({ to: "/instalacoes" })`. Rota `/` → redirect para `/instalacoes`.

- [ ] **Step 4: `src/admin/routes/login.tsx`**

`min-h-svh grid place-items-center` + `Card` `w-[380px]`: título "Mirante · Admin", `Label`+`Input` (login; senha `type="password"`), `Button` full-width com `disabled` enquanto envia, erro em `<p className="text-sm text-destructive">`. Usa `cpApi.login(login, senha)` + `cpApi.setToken(token)` **exatamente como hoje**. Aceita prop opcional `onSuccess?: () => void` (default: `navigate({ to: "/instalacoes" })`) para permitir teste sem router.

- [ ] **Step 5: `src/admin/main.tsx`**

```tsx
import "./admin.css";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./router";

createRoot(document.getElementById("root")!).render(<RouterProvider router={router} />);
```
Apagar `AdminApp.tsx`, `AdminLogin.tsx` e `AdminApp.test.tsx`.

- [ ] **Step 6: Teste** — `src/admin/routes/login.test.tsx`

Renderiza `<LoginPage onSuccess={spy} />` com `fetch` mockado. Asserts: campos de login/senha visíveis; submit com mock **401** exibe mensagem de erro e **não** chama `onSuccess`; submit com mock 200 (`{token,perfil}`) chama `onSuccess` e grava o token.

- [ ] **Step 7: Rodar** — `npx vitest run && npx tsc --noEmit && npx biome check --write src/admin`

- [ ] **Step 8: Commit**

```bash
git add -A src/admin package.json package-lock.json
git commit -m "feat(admin-ui): primitivos shadcn, AppShell (sidebar+header) e login com TanStack Router"
```

---

### Task 3: Tela de Instalações

**Files:**
- Create: `src/admin/routes/instalacoes.tsx`
- Delete: `src/admin/InstalacoesDashboard.tsx`, `src/admin/InstalacoesDashboard.test.tsx`
- Test: `src/admin/routes/instalacoes.test.tsx`

**Interfaces:**
- Consumes: `cpApi.cpFetch`, `AppShell`, primitivos (Task 2).
- Produces: `InstalacoesPage({ onAbrir? })` — `GET /instalacoes` no mount; `Table` (Nome, IBGE, UF, Status, ações); status em `Badge` (`ativa` → default, `a-instalar` → secondary, `desativada` → outline); clique na linha → `onAbrir(id_ibge)` (default: `navigate({ to: "/instalacoes/$id", params: { id } })`); botão "Nova instalação" abre `Dialog` (IBGE, slug, nome, UF) → `POST /instalacoes` → recarrega + `toast.success`; erro → `toast.error`. Estado vazio: mensagem centralizada.

- [ ] **Step 1: Teste primeiro** — `src/admin/routes/instalacoes.test.tsx`

`fetch` mockado devolvendo `[{id_ibge:"4117909",slug:"palotina",nome:"Palotina",uf:"PR",status:"ativa"}]`. Asserts: "Palotina" aparece; "ativa" aparece. Renderizar o componente direto (com `onAbrir` mock), sem router.

- [ ] **Step 2: Rodar e ver falhar** — `npx vitest run src/admin/routes/instalacoes.test.tsx` → FAIL (módulo inexistente).

- [ ] **Step 3: Implementar** conforme as interfaces, dentro de `<AppShell titulo="Instalações">`.

- [ ] **Step 4: Rodar** — teste passa; `npx vitest run && npx tsc --noEmit && npx biome check --write src/admin`.

- [ ] **Step 5: Commit** — `git add -A src/admin && git commit -m "feat(admin-ui): tela de instalações com Table e Dialog"`

---

### Task 4: Tela de Detalhe (4 abas)

**Files:**
- Create: `src/admin/routes/instalacao-detalhe.tsx` (se passar de ~350 linhas, quebrar as abas em `src/admin/components/detalhe/*.tsx`)
- Delete: `src/admin/InstalacaoDetalhe.tsx`, `src/admin/InstalacaoDetalhe.test.tsx`
- Test: `src/admin/routes/instalacao-detalhe.test.tsx`

**Interfaces:**
- Produces: `InstalacaoDetalhePage({ id, onVoltar? })` com `Tabs` — **mesmos endpoints e comportamentos de hoje**:
  - **Entidades:** `GET/POST /instalacoes/:id/entidades`, `DELETE /entidades/:id_entidade`. `Table` + `Dialog` "Nova entidade" (id_entidade, nome, tipo) + `AlertDialog` de remoção. Texto de ajuda no campo id_entidade: "código do TCE/PR (ex.: 12195)".
  - **Gestores:** `GET/POST /instalacoes/:id/gestores`, `PATCH /gestores/:cpf` (senha), `DELETE /gestores/:cpf`. `Table` (CPF, nome, role, entidade) + `Dialog` "Novo gestor" (cpf, nome, senha, role, select de entidade) + **`Dialog` "Trocar senha"** — substitui o `window.prompt` (proibido permanecer).
  - **Licença:** `Switch` (ativo) + `Input type="date"` (validade) + `Button` Salvar → `PUT /instalacoes/:id/licenca`. Estado inicial de `GET /instalacoes/:id` (`licenca_ativo`, `licenca_validade`).
  - **Módulos:** para cada `path` do catálogo (`NAV_GROUPS` de `@/App`), uma linha com o path + `Switch` (ligado = oculto). **Semear o estado com `GET /instalacoes/:id/modulos` ANTES de permitir salvar** (não sobrescrever com default) → `PUT /instalacoes/:id/modulos`.
- Toda mutação: `toast.success` / `toast.error`.

- [ ] **Step 1: Teste primeiro** — aba Entidades carrega e mostra "Prefeitura" no mount; clicar na aba "Módulos" mostra o path "/despesa". (`fetch` mockado por URL, como no teste atual.)

- [ ] **Step 2: Rodar e ver falhar.**

- [ ] **Step 3: Implementar as 4 abas** — sem placeholders; preservar os contratos de API.

- [ ] **Step 4: Verificar** — `grep -rn "window.prompt" src/admin` deve sair **vazio**. Depois `npx vitest run && npx tsc --noEmit && npx biome check --write src/admin`.

- [ ] **Step 5: Commit** — `git add -A src/admin && git commit -m "feat(admin-ui): detalhe da instalação com Tabs, Dialogs e toasts"`

---

### Task 5: Tela de Logs + verificação visual final

**Files:**
- Create: `src/admin/routes/logs.tsx`
- Delete: `src/admin/LogsView.tsx`, `src/admin/LogsView.test.tsx`
- Test: `src/admin/routes/logs.test.tsx`

**Interfaces:**
- Produces: `LogsPage` — `Tabs` Acessos (padrão) / Auditoria. Por aba: filtros (`Input` id_ibge; `Input type="date"` de/até; cpf ou ator), `Table` das linhas, paginação (`Button` anterior/próxima, `limit=50`, `offset`, usando `total`). Endpoints `GET /logs/acessos` e `GET /logs/auditoria` como hoje. Datas em `pt-BR`. CPF continua vindo mascarado do servidor.

- [ ] **Step 1: Teste primeiro** — aba Acessos mostra nome e CPF mascarado; clicar em "Auditoria" mostra a ação. (`fetch` mockado por URL.)

- [ ] **Step 2: Rodar e ver falhar.**

- [ ] **Step 3: Implementar.**

- [ ] **Step 4: Suíte completa + build**

```bash
npx vitest run && npx tsc --noEmit && npx vite build && npx biome check --write src/admin
```

- [ ] **Step 5: Verificação visual (obrigatória)**

Com o stack local no ar (Vite :5173, central :8090, PostgREST :3000):
1. **TV** — `http://localhost:5173`: login `073.207.009-05` / `12345678` → o dashboard deve estar **idêntico ao de antes** (sidebar teal, cards, KPIs, cantos arredondados iguais). Qualquer diferença é regressão → **reportar, não seguir**.
2. **/admin** — `http://localhost:5173/admin.html#/login` (limpar `localStorage` antes — mesma origem da TV): login `admin`/`admin123` → percorrer Instalações → detalhe (4 abas) → Logs.
3. Console do navegador sem erros.

Registrar no relatório o que foi observado em cada passo.

- [ ] **Step 6: Commit**

```bash
git add -A src/admin && git commit -m "feat(admin-ui): tela de logs com Tabs, filtros e paginação"
```

---

## Self-Review

**Cobertura da spec:**
- Layout sidebar+header+conteúdo → Task 2. ✓
- Tema Twitter dark como CSS vars → Task 1 (tabela de tokens). ✓
- shadcn sobre Tailwind 3, isolado da TV → Task 1 (admin.css só no admin; config só com `extend`; `--radius` 0.5rem). ✓
- TanStack Router com hash → Task 2. ✓
- 4 telas (login, instalações, detalhe, logs) → Tasks 2–5. ✓
- Toasts substituem erros crus; `window.prompt` eliminado → Task 4 (verificado por grep). ✓
- Testes reescritos; TV intocada → todas as tasks + Task 5 (verificação visual). ✓

**Consistência:** `cn` (T1) usado por todos os primitivos (T2); `AppShell` (T2) envolve T3–T5; `cpApi` inalterado em todas; os tokens da T1 são os consumidos pelas classes de T2–T5; props opcionais (`onSuccess`, `onAbrir`, `onVoltar`) permitem testar sem router.

**Riscos endereçados:** CLI do shadcn pode assumir Tailwind 4 → verificação explícita + fallback manual (T2/S1); regressão da TV pelo `borderRadius` compartilhado → `--radius: 0.5rem` provado equivalente aos defaults (Global Constraints) + `git diff` vazio (T1/S8) + verificação visual (T5/S5).
