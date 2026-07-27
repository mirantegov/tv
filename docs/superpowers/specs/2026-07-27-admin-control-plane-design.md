# Mirante Admin — Control Plane · PRD / Design

**Data:** 2026-07-27
**Status:** Design aprovado — pendente revisão do usuário antes do plano de implementação
**Autor:** brainstorming (Claude) + Vagner Rodrigues

---

## 1. Visão

Um **plano de controle central** (control plane) da frota de instalações, servido em
`admin.tv.mirantegov.cloud`. É o dono único do cadastro de **todas** as instalações do
VPS — suas entidades públicas, gestores, licenças, módulos liberados e logs.

Hoje cada tenant é um Postgres isolado (DB-por-município) que só conhece a si mesmo;
nenhum banco de tenant sabe da existência dos outros. O control plane é a **única fonte
da verdade transversal** à frota.

## 2. Arquitetura

- **Serviço novo:** backend enxuto **Node/Fastify** + **Postgres "meta" central**
  (separado dos DBs de tenant), rodando no mesmo VPS.
- **App /admin:** SPA (reusa o stack React/Vite do projeto) consumindo o backend central.
- **A TV (tenant) passa a autenticar no central:** o login por CPF+senha chama
  `POST /auth/login` do central, que devolve `nome`, `role`, `id_entidade` e a validade
  da licença da instalação. O gate client-side (`src/users.ts`) **sai de cena**.
- **Auth real:** senha com hash (argon2 ou bcrypt), sessão via **JWT**, e toda ação
  administrativa registrada em auditoria.

```
                       ┌─────────────────────────────┐
                       │  admin.tv.mirantegov.cloud   │
                       │  SPA /admin  (React/Vite)    │
                       └──────────────┬──────────────┘
                                      │ REST + JWT
                       ┌──────────────▼──────────────┐
                       │  Control plane (Node/Fastify)│
                       │  /auth  /instalacoes         │
                       │  /entidades /gestores        │
                       │  /licencas /modulos /logs    │
                       └──────────────┬──────────────┘
                                      │
                       ┌──────────────▼──────────────┐
                       │  Postgres "meta" central     │
                       └─────────────────────────────┘
             ▲ login por CPF (auth real)
             │
   ┌─────────┴─────────┐   ┌───────────────────┐
   │  TV tenant A       │   │  TV tenant B ...   │  (cada um seu Postgres + PostgREST)
   └────────────────────┘   └───────────────────┘
```

## 3. Modelo de domínio (Postgres central)

```
instalacao  (1 por município, PK = id IBGE)
  ├─ licenca        1:1   ativo:bool + validade:date
  ├─ entidade       1:N   Prefeitura, Câmara, RPPS, Saneamento… (PK id_entidade)
  ├─ gestor         1:N   cpf, nome, senha_hash, role, id_entidade (gestor→entidade 1:1)
  └─ modulo_estado  1:N   path + oculto   (centraliza o que hoje é local no tenant)

audit_log    ações do admin: ator, ação, alvo, timestamp, payload
acesso_log   logins de gestores na TV: cpf, instalacao, id_entidade, timestamp
```

**Isolamento dentro do tenant = lógico, por `id_entidade`.** Toda query da TV filtra
pelo `id_entidade` do gestor logado:

- o CPF do **prefeito** só acessa `id_entidade` = Prefeitura;
- o CPF do **diretor de saneamento** só acessa `id_entidade` = Saneamento; etc.

Não há troca de entidade nem multi-acesso — **a TV é de um gestor só**. O isolamento é
lógico (filtro/RLS por `id_entidade`) dentro do mesmo banco do município, o que casa com
a arquitetura de 1 DB por município.

### Fluxo de provisionamento (tudo via /admin central)

1. Cadastra **instalação** → define as **entidades** do município.
2. Emite **licença** (ativo + data de validade).
3. Cadastra **gestor** → vincula a 1 entidade → esse CPF só vê os dados daquela entidade.
4. Na TV: gestor faz login com CPF → sistema carrega `id_entidade` do perfil → todas as
   queries filtram por ele.

## 4. Escopo do MVP

**Inclui:**

- CRUD de **instalações** — status `ativa` / `desativada` / `a-instalar` (**apenas
  registro**, sem orquestrar containers).
- CRUD de **entidades** por instalação.
- CRUD de **gestores** (CPF, nome, senha, role, `id_entidade`).
- **Licença** por instalação: on/off + validade (sem granularidade de módulo).
- **Módulos por instalação**, centralizado (control plane vira dono do liga/desliga que
  hoje é o `api.modulo_estado` local).
- **Auth real** server-side para /admin **e** para a TV.
- **Logs:** auditoria de ações do admin + registro de acessos (logins de gestores na TV).

**Não inclui (backlog / spec futura):**

- Orquestração real de containers (subir/derrubar/instalar tenant no VPS).
- Saúde/erros das instalações (tenant no ar/fora, último sync, erros de ingestão) —
  fazer **após integrar com o datawarehouse**.
- Granularidade de módulo dentro da licença.
- Flags globais de rollout (ligar recurso em toda a frota de uma vez).

## 5. Impacto na TV atual (migração)

- **Login** passa a chamar o central (remove o gate client-side `src/users.ts`).
- **Módulos:** a seção *Módulos* do painel de Configurações vira reflexo do central
  (lê de lá). **Decisão em aberto:** o toggle in-app *escreve* no central ou fica
  *read-only* (só o /admin altera)? — resolver na spec 4.
- **Queries de dados** ganham filtro por `id_entidade`.

## 6. Decomposição em specs

Cada uma segue seu próprio ciclo spec → plano → build:

1. **Central: backend + schema + auth** (fundação).
2. **/admin: CRUD** de instalações / entidades / gestores / licenças + módulos.
3. **Logs:** auditoria de ações + acessos.
4. **TV:** migração de auth para o central + filtro `id_entidade` (inclui a decisão
   toggle escreve-vs-espelha).
5. *(futuro)* provisionamento real / saúde das instalações.

## 7. Decisões travadas (registro do brainstorming)

| # | Decisão |
|---|---------|
| 1 | Control plane **central separado** (não embutido no SPA do tenant). |
| 2 | MVP = **só registrar status**; provisionamento real é spec futura. |
| 3 | **Auth real server-side** (hash + JWT), para /admin e para a TV. |
| 4 | Domínio: **Município = instalação**; entidades e gestores dentro. |
| 5 | **Licença = on/off + validade** apenas (sem módulo). |
| 6 | Acesso por gestor filtrado por **`id_entidade`** (isolamento lógico). |
| 7 | **TV autentica direto no central** (fonte única; remove `users.ts`). |
| 8 | Feature flags = **módulos por instalação, centralizado**. |
| 9 | Logs MVP = **auditoria de ações + acessos**; saúde/erros no backlog. |
| 10 | Stack do central = **Node/Fastify + Postgres central**. |

## 8. Questões em aberto (para as specs)

- Toggle de Módulos na TV: escreve no central ou só espelha? (spec 4)
- `role` do gestor: só rótulo, ou define permissões além do `id_entidade`? (spec 1/2)
- Estratégia de RLS vs. filtro na aplicação para o `id_entidade` na TV. (spec 4)
