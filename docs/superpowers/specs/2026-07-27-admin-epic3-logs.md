# Épico 3 — Logs: auditoria de ações + acessos

**Data:** 2026-07-27 · **Depende de:** épicos 1 e 2 · **Habilita:** responsabilidade / suporte
**PRD:** [2026-07-27-admin-control-plane-design.md](./2026-07-27-admin-control-plane-design.md)

## Objetivo

Tornar visíveis, no /admin, os dois registros já gravados pela fundação: **auditoria de
ações do admin** (quem fez o quê no control plane) e **acessos dos gestores** (logins na
TV). As tabelas `audit_log` e `acesso_log` nascem no épico 1; aqui entram a coleta
completa e as telas de visualização.

## Entregáveis

- **Escrita garantida:** toda mutação dos endpoints do épico 2 grava `audit_log`; todo
  `POST /auth/login` de gestor grava `acesso_log` (fechar quaisquer lacunas).
- **Endpoints de leitura:** `GET /logs/auditoria` e `GET /logs/acessos`, com filtros
  (instalação, período, ator/CPF) e paginação.
- **Telas /admin:** duas visões — Auditoria e Acessos — com filtro e paginação.

## Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/logs/auditoria` | ações do admin. Filtros: `id_ibge`, `ator`, `de`, `ate`. Paginado. |
| GET | `/logs/acessos` | logins de gestores. Filtros: `id_ibge`, `cpf`, `de`, `ate`. Paginado. |

## Dados exibidos

- **Auditoria:** data/hora, ator (admin), ação (criou/editou/removeu/emitiu-licença/
  ligou-módulo…), alvo (instalação/entidade/gestor/…), e o `payload` resumido.
- **Acessos:** data/hora, CPF, nome do gestor, instalação, entidade.

## Regras

- Logs são **append-only** — sem edição/remoção pela UI.
- Respeitar LGPD: exibir só o necessário; CPF pode ser mascarado na listagem conforme
  perfil do operador.
- Paginação obrigatória (evitar varrer tudo).

## Critérios de aceite

- [ ] Uma ação no /admin (ex.: emitir licença) aparece na tela de Auditoria.
- [ ] Um login de gestor na TV aparece na tela de Acessos.
- [ ] Filtros por instalação e período funcionam nas duas telas.
- [ ] Paginação funciona com volume grande (teste com muitos registros).

## Não inclui

Saúde/erros das instalações (backlog — depende do datawarehouse); alertas/notificações;
exportação. Podem virar spec futura.

## Questões a resolver aqui

- Mascarar CPF na listagem por padrão? Quais operadores veem o CPF completo?
- Retenção dos logs (expurgo após X meses)?
