# Modo TV no Extras (lock do Admin) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar "Modo TV" também na seção Extras (admin, persistido no banco). Quando ligado lá, o "Modo TV" do Display fica ligado e **travado** (só o admin desliga, via Extras). Quando desligado no Extras, o toggle do Display volta a ser livre por sessão.

**Architecture:** Reusar o mecanismo dos Extras (`hidden` Set + `toggleModule` + persistência em `api.modulo_estado`) com uma nova chave sentinela `#modotv`. O toggle do Display passa a derivar seu estado de `tvMode` (sessão) **OU** `tvAdminOn` (lock persistido), e fica `disabled` quando travado. Um efeito reage a mudanças de `tvAdminOn` para entrar/sair do Modo TV; um polling periódico re-busca o estado do banco para telas que ficam dias abertas.

**Tech Stack:** React 18, TypeScript, Vite, Playwright (e2e), Vitest (unit). Tudo em `src/App.tsx` (componente `Shell`) + testes em `e2e/app.spec.ts`.

## Global Constraints

- Nenhuma dependência nova. Nenhuma mudança de schema/API — reusa `fetchHiddenModules`/`saveModuleHidden` (`src/api.ts`) e a tabela `api.modulo_estado`.
- Estilos inline seguem o padrão existente dos toggles (padding `6px 10px 6px 18px`, `role="switch"`, `<Sw on=…>`).
- `biome` (`npm run format`) e `tsc --noEmit` (`npm run typecheck`) devem ficar limpos.
- Deploy só após verificação local do usuário (commit local, sem push).

## Contexto

O "Modo TV" hoje é um toggle **de sessão** na seção Display (qualquer usuário liga/desliga): entra em fullscreen, recolhe a sidebar, liga o Scroll Automático, fecha Configurações e vai ao item inicial. O pedido: um administrador poder **forçar** o Modo TV para todos e impedir que operadores comuns o desliguem — mantendo o comportamento livre quando o admin não forçou.

**Decisões do usuário:**
- Admin desliga no Extras → **destrava e reverte** (sai do kiosk: fullscreen off, scroll off, sidebar expandida) e o Display volta a ser livre.
- Lock reflete **ao vivo** (polling do banco) em telas já abertas, não só no reload.

**Limitação conhecida (documentar, não é bug):** `requestFullscreen()` exige gesto do usuário. Quando o lock liga via **polling** (sem clique naquela tela), fullscreen não engata — recolher/scroll/navegação aplicam normalmente; o fullscreen entra no próximo gesto ou quando o browser já está em kiosk de SO. No clique direto do admin (Extras), o fullscreen funciona.

---

## Âncoras atuais (arquivo já reformatado pelo biome; ~1265 linhas)

- `EXTRAS_KEY` → linha 282. `toggleModule` → 337‑356. `extras`/`toggleExtras` → 360‑361.
- `applyCollapsed`/`toggleCollapsed` → 482‑490. Bloco `tvMode`+`enterFullscreen`+`exitFullscreen`+`toggleTvMode`+`useEffect(fullscreenchange)` → 494‑558.
- `Sw` (switch visual, só prop `on`) → 561‑587. `SectionBtn` (padrão travado: cadeado + opacity 0.55 + `not-allowed` + `title`) → 588‑643.
- Toggle "Scroll Automático" → 909‑926. Toggle "Modo TV" (Display) → 927‑944.
- `SectionBtn id="extras"` + bloco `cfgSection === "extras" && isAdmin` (toggle "Análises e Alertas") → 1034‑1061.
- `useEffect` que hidrata `hidden` do banco (`fetchHiddenModules`, deps `[]`) → ~319‑336. Efeito de auto-scroll depende de `hidden` → deps `[autoScroll, push, hidden]`.

---

## Task 1: Chave sentinela e estado derivado do lock

**Files:**
- Modify: `src/App.tsx` (perto da linha 282 e da 360)

**Interfaces:**
- Produces: `MODOTV_KEY: string` (export), `tvAdminOn: boolean` (const no `Shell`).

- [ ] **Step 1: Adicionar a constante** ao lado de `EXTRAS_KEY` (após a linha 282):

```tsx
// Chave sentinela p/ o lock "Modo TV" do Admin em api.modulo_estado. Presença
// da chave em `hidden` = lock LIGADO (padrão desligado = ausência).
export const MODOTV_KEY = "#modotv";
```

- [ ] **Step 2: Derivar `tvAdminOn`** junto de `extras` (após a linha 361):

```tsx
// Lock do Modo TV controlado pelo Admin (persiste no banco, vale p/ todos).
const tvAdminOn = hidden.has(MODOTV_KEY);
```

- [ ] **Step 3: typecheck**

Run: `npm run typecheck`
Expected: sem erros.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx && git commit -m "feat(modo-tv): chave #modotv e estado tvAdminOn (lock do admin)"
```

---

## Task 2: Extrair `applyTvMode` e reagir ao lock

**Files:**
- Modify: `src/App.tsx:523-558` (bloco `toggleTvMode` + `useEffect`)

**Interfaces:**
- Consumes: `enterFullscreen`, `exitFullscreen`, `applyCollapsed`, `setAutoScroll`, `setCfgOpen`, `push`, `hidden`, `tvAdminOn` (Task 1).
- Produces: `applyTvMode(on: boolean): void`.

- [ ] **Step 1: Substituir `toggleTvMode` por `applyTvMode`** (orquestrador reusável, sem `setTvMode` como updater):

```tsx
const applyTvMode = (on: boolean) => {
  setTvMode(on);
  if (on) {
    enterFullscreen(); // 1. kiosk (best-effort; só engata com gesto do usuário)
    applyCollapsed(true); // 2. recolhe sidebar
    setAutoScroll(true); // 3. liga Scroll Automático
    setCfgOpen(false); // 4. fecha Configurações
    push(hidden.has("/") ? "/panorama" : "/"); // 5. item inicial
  } else {
    exitFullscreen(); // reverte tudo
    setAutoScroll(false);
    applyCollapsed(false); // expande sidebar de volta
  }
};
```

- [ ] **Step 2: Efeito que aplica/reverte quando o lock muda** (adicionar logo após o `useEffect` de `fullscreenchange`, ~linha 558). Ref inicia `false` para: (a) não mexer no estado numa carga com lock desligado, (b) aplicar na carga se já vier ligado do banco/cache:

```tsx
// O lock do Admin dirige o Modo TV: liga → entra no kiosk; desliga → reverte.
// Reage só a MUDANÇAS de tvAdminOn (ref inicia false p/ aplicar se carregar on).
const adminRef = useRef(false);
useEffect(() => {
  if (adminRef.current !== tvAdminOn) {
    adminRef.current = tvAdminOn;
    applyTvMode(tvAdminOn);
  }
}, [tvAdminOn]);
```

- [ ] **Step 3: typecheck** — `npm run typecheck` → sem erros.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx && git commit -m "feat(modo-tv): applyTvMode + efeito que reage ao lock do admin"
```

---

## Task 3: Toggle do Display travável + toggle do Extras

**Files:**
- Modify: `src/App.tsx:927-944` (toggle Modo TV do Display) e `src/App.tsx:1040-1061` (bloco Extras)

**Interfaces:**
- Consumes: `tvMode`, `tvAdminOn`, `applyTvMode`, `toggleModule`, `MODOTV_KEY`, `Sw`, `t`, `isAdmin`.

- [ ] **Step 1: Reescrever o toggle "Modo TV" do Display** (linhas 927‑944) para derivar de `tvMode || tvAdminOn` e travar quando `tvAdminOn`:

```tsx
<button
  type="button"
  role="switch"
  aria-checked={tvMode || tvAdminOn}
  disabled={tvAdminOn}
  title={
    tvAdminOn
      ? "Ativado pelo Administrador (Extras) — só o Admin pode desligar."
      : undefined
  }
  onClick={() => {
    if (!tvAdminOn) applyTvMode(!tvMode);
  }}
  className="w-full rounded-md flex items-center gap-2 text-sm"
  style={{
    padding: "6px 10px 6px 18px",
    background: "transparent",
    border: "none",
    color: t.foreground,
    opacity: tvAdminOn ? 0.6 : 1,
    cursor: tvAdminOn ? "not-allowed" : "pointer",
    textAlign: "left",
  }}
>
  <Sw on={tvMode || tvAdminOn} />
  <span style={{ flex: 1 }}>Modo TV</span>
  {tvAdminOn && (
    <svg
      aria-hidden="true"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke={t.mutedFg}
      strokeWidth="2"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )}
</button>
```

- [ ] **Step 2: Adicionar o toggle "Modo TV" no bloco Extras** — dentro do `<div>` de `cfgSection === "extras" && isAdmin`, como irmão do "Análises e Alertas" (após a linha 1059, antes do `</div>` da linha 1060):

```tsx
<button
  type="button"
  role="switch"
  aria-checked={tvAdminOn}
  onClick={() => toggleModule(MODOTV_KEY)}
  className="w-full rounded-md flex items-center gap-2 text-sm"
  style={{
    padding: "6px 10px 6px 18px",
    background: "transparent",
    border: "none",
    color: t.foreground,
    cursor: "pointer",
    textAlign: "left",
  }}
>
  <Sw on={tvAdminOn} />
  <span style={{ flex: 1 }}>Modo TV</span>
</button>
```

Nota: o clique do admin apenas persiste o lock (`toggleModule`); o efeito da Task 2 aplica/reverte o Modo TV (inclui o fullscreen, pois roda dentro da janela de ativação do gesto do clique).

- [ ] **Step 3: typecheck** — `npm run typecheck` → sem erros.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx && git commit -m "feat(modo-tv): toggle travável no Display + toggle no Extras (admin)"
```

---

## Task 4: Polling do lock (ao vivo)

**Files:**
- Modify: `src/App.tsx` (novo `useEffect` perto do que hidrata `hidden`, ~336; usa `API_URL` já importado e `fetchHiddenModules`)

**Interfaces:**
- Consumes: `API_URL`, `fetchHiddenModules`, `setHidden`.

- [ ] **Step 1: Adicionar o efeito de polling** (a cada 20s re-busca o estado do banco). Só troca `hidden` se o conteúdo mudou — preservar a referência evita reiniciar o efeito de auto-scroll (que depende de `hidden`) e cortar a rolagem do telão:

```tsx
// Telas de TV ficam dias abertas: re-busca o estado do banco de tempos em
// tempos p/ o lock do Admin (e mudanças de módulos) refletirem ao vivo.
// Mantém a mesma referência de Set quando nada mudou → não reinicia o
// auto-scroll nem re-renderiza à toa.
useEffect(() => {
  if (!API_URL) return;
  const id = window.setInterval(() => {
    fetchHiddenModules()
      .then((paths) => {
        setHidden((prev) => {
          const next = new Set(paths);
          const igual =
            prev.size === next.size && [...prev].every((p) => next.has(p));
          if (igual) return prev;
          try {
            localStorage.setItem("mg_modules", JSON.stringify(paths));
          } catch {
            // localStorage indisponível — segue
          }
          return next;
        });
      })
      .catch(() => {
        // falha de rede no polling — tenta de novo no próximo tick
      });
  }, 20000);
  return () => window.clearInterval(id);
}, []);
```

- [ ] **Step 2: typecheck** — `npm run typecheck` → sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx && git commit -m "feat(modo-tv): polling do lock p/ refletir ao vivo em telas abertas"
```

---

## Task 5: Testes e2e do lock

**Files:**
- Modify: `e2e/app.spec.ts` (dentro de `test.describe("autenticado")`)

Observação: em dev/e2e não há `API_URL`, então `toggleModule` só altera o Set `hidden` em memória + localStorage (sem banco/polling). Isso é suficiente para validar a relação de trava na UI.

- [ ] **Step 1: Teste — admin liga no Extras trava o Display; desliga reverte.** Adicionar após o teste "Modo TV recolhe a sidebar…":

```ts
test("Modo TV no Extras trava o toggle do Display (só admin desliga)", async ({
  page,
}) => {
  const aside = page.locator("aside").first();
  const larguraAside = async () => (await aside.boundingBox())?.width ?? 0;

  // admin liga o Modo TV pelo Extras
  await abrirConfig(page);
  await page.getByText("Extras", { exact: true }).click();
  const extrasTv = page.getByRole("switch", { name: "Modo TV" });
  await expect(extrasTv).toHaveAttribute("aria-checked", "false");
  await extrasTv.click();
  await expect(extrasTv).toHaveAttribute("aria-checked", "true");

  // efeitos do kiosk aplicados (sidebar recolhida, vai ao inicial)
  await expect.poll(larguraAside, { timeout: 5_000 }).toBeLessThan(100);
  await expect(h1(page)).toHaveText("Visão Geral");

  // no Display: Modo TV marcado e TRAVADO (disabled)
  await abrirConfig(page);
  await page.getByText("Display", { exact: true }).click();
  const displayTv = page.getByRole("switch", { name: "Modo TV" });
  await expect(displayTv).toHaveAttribute("aria-checked", "true");
  await expect(displayTv).toBeDisabled();

  // admin desliga pelo Extras → destrava e reverte
  await abrirConfig(page);
  await page.getByText("Extras", { exact: true }).click();
  await page.getByRole("switch", { name: "Modo TV" }).click();
  await expect.poll(larguraAside, { timeout: 5_000 }).toBeGreaterThan(200);

  await abrirConfig(page);
  await page.getByText("Display", { exact: true }).click();
  const displayTv2 = page.getByRole("switch", { name: "Modo TV" });
  await expect(displayTv2).toBeEnabled();
  await expect(displayTv2).toHaveAttribute("aria-checked", "false");
});
```

- [ ] **Step 2: Teste — usuário comum com lock ligado vê o Display travado e sem acesso ao Extras.** Preset via localStorage (lock persistido) + role não-admin:

```ts
test("usuário comum não desliga o Modo TV travado pelo admin", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem("mg_auth", "1");
    localStorage.setItem("mg_role", "suporte"); // não-admin
    localStorage.setItem("mg_modules", JSON.stringify(["#modotv"])); // lock on
  });
  await page.goto("/");
  // já entra no kiosk pelo lock (item inicial)
  await expect(h1(page)).toHaveText("Visão Geral");

  await page.getByRole("button", { name: "Configurações", exact: true }).click();
  // Extras é admin-only → botão desabilitado p/ suporte
  await expect(page.getByRole("button", { name: /Extras/ })).toBeDisabled();

  // Display: Modo TV marcado e travado
  await page.getByText("Display", { exact: true }).click();
  const displayTv = page.getByRole("switch", { name: "Modo TV" });
  await expect(displayTv).toHaveAttribute("aria-checked", "true");
  await expect(displayTv).toBeDisabled();
});
```

- [ ] **Step 3: Rodar os testes novos**

Run: `npx playwright test -g "Modo TV no Extras|usuário comum não desliga"`
Expected: 2 passed.

- [ ] **Step 4: Suíte completa (zero regressão)**

Run: `npm test && npx playwright test`
Expected: unit todos passam; e2e todos passam.

- [ ] **Step 5: Commit**

```bash
git add e2e/app.spec.ts && git commit -m "test(modo-tv): e2e do lock admin (Extras) e trava no Display"
```

---

## Verificação end-to-end (manual, browser real)

1. Subir o preview (`mirante-dev`), logar como **admin** (CPF `000.000.000-00`, senha `R1JmYp5U`).
2. Configurações → **Extras** → ligar **Modo TV**: confirmar kiosk (fullscreen, sidebar recolhida, scroll rolando, foi ao item inicial). Em Configurações → Display, o **Modo TV** aparece marcado, **com cadeado e desabilitado**.
3. Desligar no Extras → reverte tudo; no Display volta a ficar livre.
4. **Lock + usuário comum:** com o lock ligado no banco, abrir a tela como perfil não‑admin (ex.: suporte, CPF `777.777.777-77`, senha `4Vuv3DpW`): Display mostra Modo TV travado; Extras inacessível.
5. **Ao vivo:** com uma tela aberta (kiosk), ligar/desligar o lock por outra sessão admin e aguardar ≤20s — a tela aplica/reverte sozinha (fullscreen só engata no próximo gesto, conforme limitação).
6. Testar em **Safari e Chrome**. `npm run typecheck` e `npm run format` limpos.

## Self-Review (coberto)

- "Modo TV no Extras" → Task 3 Step 2. "Habilitado no Extras liga e trava o Display" → Task 3 Step 1 (`aria-checked={tvMode||tvAdminOn}`, `disabled={tvAdminOn}`) + Task 2 (efeito aplica). "Só destrava se desligado no Extras" → `disabled={tvAdminOn}`. "Admin desliga → reverte" → Task 2 `applyTvMode(false)`. "Ao vivo" → Task 4. "Usuário comum liga/desliga quando admin off" → toggle do Display livre quando `!tvAdminOn`.
- Tipos/nomes consistentes: `MODOTV_KEY`, `tvAdminOn`, `applyTvMode` usados igual em todas as tasks. `applyTvMode` substitui `toggleTvMode` (a única referência era o onClick do Display, reescrito na Task 3).

## Fora de escopo

- Fullscreen automático sem gesto (limitação de browser) — documentado.
- Sincronização por WebSocket/SSE — polling de 20s é suficiente p/ o caso de telão.
- Deploy — commit local; push para stage/production só após verificação do usuário.
