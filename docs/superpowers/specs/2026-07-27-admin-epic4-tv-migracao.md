# Épico 4 — TV: migração de auth para o central + filtro por id_entidade

**Data:** 2026-07-27 · **Depende de:** épicos 1 e 2 · **Fecha:** o MVP do control plane
**PRD:** [2026-07-27-admin-control-plane-design.md](./2026-07-27-admin-control-plane-design.md)

## Objetivo

Ligar a TV (app do tenant) ao control plane: login real contra o central, isolamento por
`id_entidade` em todos os dados, e módulos lidos do central. Remove o gate client-side
`src/users.ts` e a auto-gestão local de módulos.

## Mudanças na TV

### 4.1 Auth
- **Remover** `src/users.ts` (lista de CPF+senha no bundle).
- `LoginScreen` passa a chamar `POST /auth/login` do central → recebe JWT + perfil
  (`nome`, `role`, `id_entidade`, validade da licença).
- Sessão guarda o JWT; expiração/erro de licença bloqueia a TV com mensagem clara.
- **Checagem de licença:** se `ativo=false` ou `validade` vencida → TV não abre.

### 4.2 Isolamento por `id_entidade`
- O perfil do gestor logado carrega `id_entidade`.
- **Toda query de dados filtra por `id_entidade`** — prefeito vê só Prefeitura, diretor
  de Saneamento vê só Saneamento, etc. Sem troca de entidade (a TV é de um gestor só).
- Estratégia a decidir: **RLS** no Postgres do tenant vs. **filtro na aplicação/PostgREST**
  (ver questão aberta).

### 4.3 Módulos
- A seção **Módulos** do painel de Configurações passa a ler do central
  (`GET /instalacoes/:id/modulos`), não mais do `api.modulo_estado` local.
- **Decisão do PRD a fechar:** o toggle in-app **escreve** no central
  (`PUT …/modulos`, exige auth de admin) **ou** fica **read-only** (só o /admin altera)?

## Regras

- Credenciais **nunca** no bundle — auth é sempre server-side agora.
- TV sem `API_URL`/central acessível: definir fallback (bloquear vs. modo demo com mock).
- O grupo **Admin → Modo TV** (recém-criado) permanece; revisar se o lock passa a
  respeitar papel vindo do JWT.

## Critérios de aceite

- [ ] Login na TV valida contra o central; CPF/senha errados → erro; `users.ts` removido.
- [ ] Licença vencida/inativa impede a abertura da TV.
- [ ] Gestor de Saneamento não vê dados de outra entidade (filtro `id_entidade` efetivo).
- [ ] Módulos exibidos refletem o que o /admin definiu para a instalação.
- [ ] Testes existentes (`App.test.tsx`, `users.test.ts`) ajustados à nova auth.

## Não inclui

Novas features de dados; provisionamento; saúde das instalações.

## Questões a resolver aqui

- **Toggle de Módulos:** escreve no central ou só espelha (read-only)?
- **`id_entidade`:** RLS no Postgres do tenant ou filtro na aplicação?
- Fallback da TV quando o central está indisponível.
- Como o tenant sabe seu próprio `id_ibge` para consultar módulos (já vem via
  `window.__TENANT__`).
