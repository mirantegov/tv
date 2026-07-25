-- ============================================================================
-- Módulo: Planejamento — Comparativo (LOA) (rota /planejamento-comp · mock: data.ts CP)
-- Comparativo do orçamento fixado A(2025)×B(2026) + evolução plurianual da LOA.
-- Normalizado como os demais comparativos (receita_comparativo). Valores em R$ milhões.
-- ============================================================================
CREATE SCHEMA IF NOT EXISTS planejamento_comparativo;

-- CP.orcA/orcB, recA/recB, despA/despB + série CP.evol (orçamento fixado por ano).
-- receita/despesa só têm valor nos anos comparados (25/26); NULL na série antiga.
-- entidade='integral' = série consolidada (CP.*); pref/camara/prev/san = CP.{ent}.
CREATE TABLE planejamento_comparativo.totais (
	exercicio smallint NOT NULL,
	entidade  text NOT NULL,           -- 'integral' | 'pref' | 'camara' | 'prev' | 'san'
	orcamento numeric(14,2) NOT NULL,  -- CP.evol (série) e orcA/orcB (por entidade: CP.{ent}.evol)
	receita   numeric(14,2),           -- CP.recA/recB
	despesa   numeric(14,2),           -- CP.despA/despB e totA/totB
	PRIMARY KEY (exercicio, entidade)
);

-- CP.vinc — vinculações constitucionais previstas na LOA (%), por exercício e entidade.
CREATE TABLE planejamento_comparativo.vinculacoes (
	exercicio smallint NOT NULL,
	entidade  text NOT NULL,           -- 'integral' | 'pref' | 'camara' | 'prev' | 'san'
	nome      text NOT NULL,
	valor     numeric(6,2) NOT NULL,   -- CP.vinc[].a (2025) / .b (2026)
	limite    numeric(6,2) NOT NULL,   -- CP.vinc[].limite
	PRIMARY KEY (exercicio, entidade, nome)
);

-- CP.{ent}.grupo — despesa por grupo A×B, por entidade e exercício.
CREATE TABLE planejamento_comparativo.grupos (
	exercicio smallint NOT NULL,
	entidade  text NOT NULL,           -- 'pref' | 'camara' | 'prev' | 'san'
	grupo     text NOT NULL,
	valor     numeric(14,2) NOT NULL,  -- CP.{ent}.grupo[].a (2025) / .b (2026)
	PRIMARY KEY (exercicio, entidade, grupo)
);

-- CP.entidades — orçamento por entidade orçamentária, por exercício.
CREATE TABLE planejamento_comparativo.entidades (
	exercicio smallint NOT NULL,
	entidade  text NOT NULL,
	valor     numeric(14,2) NOT NULL,
	PRIMARY KEY (exercicio, entidade)
);

-- CP.arvore — despesa fixada por função (v25×v26). 1 linha por exercício por nó.
CREATE TABLE planejamento_comparativo.arvore (
	exercicio smallint NOT NULL,
	id        text NOT NULL,
	parent_id text,
	nome      text NOT NULL,
	valor     numeric(14,2) NOT NULL,
	PRIMARY KEY (exercicio, id)
);
