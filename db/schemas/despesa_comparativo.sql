-- ============================================================================
-- Módulo: Despesas — Comparativo Anual (rota /despesa-comp · mock: data.ts CD)
-- Valores em R$ milhões. Comparativos guardam 1 linha por exercício.
-- ============================================================================
CREATE SCHEMA IF NOT EXISTS despesa_comparativo;

-- CD.emp25/emp26/liq25/liq26/pago25/pago26 — totais por exercício
CREATE TABLE despesa_comparativo.totais (
	exercicio smallint PRIMARY KEY,
	empenhado numeric(14,2) NOT NULL,
	liquidado numeric(14,2) NOT NULL,
	pago      numeric(14,2) NOT NULL
);

-- CD.meses — empenho mensal (não acumulado) por exercício
CREATE TABLE despesa_comparativo.mensal (
	exercicio smallint NOT NULL,
	mes       smallint NOT NULL CHECK (mes BETWEEN 1 AND 12),
	empenhado numeric(14,2) NOT NULL,
	PRIMARY KEY (exercicio, mes)
);

-- CD.func — empenho por função de governo por exercício
CREATE TABLE despesa_comparativo.funcoes (
	exercicio smallint NOT NULL,
	funcao    text NOT NULL,
	empenhado numeric(14,2) NOT NULL,
	PRIMARY KEY (exercicio, funcao)
);

-- CD.arvore — árvore função → subfunção → ação (valores por exercício)
CREATE TABLE despesa_comparativo.arvore (
	exercicio smallint NOT NULL,
	id        text NOT NULL,                  -- ex.: 'f10', 'f10a1'
	parent_id text,                           -- NULL na raiz
	nome      text NOT NULL,
	empenhado numeric(14,2) NOT NULL,
	PRIMARY KEY (exercicio, id)
);
