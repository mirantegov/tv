# Dados: mock atual e migração para a API

## Estado atual (mock)

Todos os números do painel vêm de `src/data.ts` — **um export por módulo**
(`D`, `R`, `TB`, `F`, `FP`, `PA`, `LIC`, `CON`, `PLAN`, `PC`, `FA`, `PAN`,
`CD`, `CR`), tipados por `src/types.ts`. Os valores são fictícios
(seed cent-exato, competência 06/2026); no Panorama, os campos `ibge: true`
foram coletados da página oficial do IBGE (Palotina/PR).

Convenções do mock (que o painel assume):

- Valores monetários em **R$ milhões**.
- Séries mensais Jan–Jun (acumuladas ou por mês, conforme o campo).
- Comparativos carregam pares de exercícios (2025 × 2026) e séries históricas.
- Tons de status: `ok` | `warn` | `danger` (+ `info` em históricos).

## Destino (API + PostgreSQL)

O DDL de referência está em [`db/schemas/`](../db/README.md): **um schema por
módulo**, tabelas espelhando cada estrutura do mock, chaveadas por
`exercicio` (ano) e `mes`/`competencia` (1–12). O README do `db/` traz o
mapeamento completo módulo → schema → export do mock e as convenções
(numeric em R$ milhões, CHECKs de status, árvores com `id`/`parent_id`).

## Plano de migração (front)

1. A API expõe endpoints por módulo devolvendo o **mesmo shape** dos exports
   de `data.ts` (os types de `src/types.ts` viram o contrato).
2. Trocar os imports estáticos de `data.ts` por fetch na inicialização do
   módulo (ou um provider de dados no App) — os componentes não mudam.
3. Visão Geral e Análises e Alertas consomem agregações dos demais módulos
   (views/endpoints compostos na API).
4. Campos hoje derivados no front (ex.: variações percentuais) podem continuar
   sendo calculados no cliente com `src/format.ts`.

Enquanto a API não existe, `data.ts` permanece a fonte única — mudanças de
estrutura de dados devem atualizar **types.ts, data.ts e o SQL do módulo**
juntos.
