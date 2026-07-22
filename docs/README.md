# Documentação — Mirante Gov

Suíte BI municipal para exibição em TV/kiosk e desktop. Front-end React + Vite
com dados fictícios (mock), preparado para migração a uma API com PostgreSQL.

## Índice

| Documento                              | Conteúdo                                              |
| -------------------------------------- | ----------------------------------------------------- |
| [setup.md](setup.md)                   | Ambiente de desenvolvimento, comandos, login demo     |
| [arquitetura.md](arquitetura.md)       | Stack, estrutura de pastas, router, tema, estado      |
| [modulos.md](modulos.md)               | Rotas, grupos da sidebar e como criar um módulo novo  |
| [contribuicao.md](contribuicao.md)     | Fluxo de branches/PR, padrões de código e checks      |
| [dados.md](dados.md)                   | Dados mockados e plano de migração para a API         |
| [../db/README.md](../db/README.md)     | Schemas PostgreSQL (um por módulo) que substituem os mocks |

## Visão rápida

- **Repositório**: `github.com/mirantegov/tv` · branch principal `main`
- **Rodar**: `npm install && npm run dev` → http://localhost:5173
- **Checks obrigatórios**: `npm run lint` (Biome) e `npm run typecheck` (tsc)
- Credenciais e acessos de ambiente ficam em `docs/acessos.local.md`
  (**gitignorado** via `*.local.md` — nunca commitar)
