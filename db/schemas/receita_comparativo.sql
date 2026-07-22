-- ============================================================================
-- Módulo: Receitas — Evolução / Comparativo (rota /receita-comp · mock: data.ts CR)
-- Valores em R$ milhões. 1 linha por exercício nos totais (série histórica).
-- ============================================================================
CREATE SCHEMA IF NOT EXISTS receita_comparativo;

-- CR.arr25/26, trib25/26, transf25/26 + CR.evol — totais anuais
-- (tributaria/transferencias podem ser NULL nos anos antigos da série)
CREATE TABLE receita_comparativo.totais (
	exercicio      smallint PRIMARY KEY,
	arrecadada     numeric(14,2) NOT NULL,
	tributaria     numeric(14,2),
	transferencias numeric(14,2)
);

-- CR.meses — arrecadação mensal por exercício
CREATE TABLE receita_comparativo.mensal (
	exercicio  smallint NOT NULL,
	mes        smallint NOT NULL CHECK (mes BETWEEN 1 AND 12),
	arrecadado numeric(14,2) NOT NULL,
	PRIMARY KEY (exercicio, mes)
);

-- CR.origem — arrecadação por origem por exercício
CREATE TABLE receita_comparativo.origens (
	exercicio  smallint NOT NULL,
	origem     text NOT NULL,
	arrecadado numeric(14,2) NOT NULL,
	PRIMARY KEY (exercicio, origem)
);

-- CR.arvore — árvore por natureza da receita (valores por exercício)
CREATE TABLE receita_comparativo.arvore (
	exercicio  smallint NOT NULL,
	id         text NOT NULL,
	parent_id  text,
	nome       text NOT NULL,
	arrecadado numeric(14,2) NOT NULL,
	PRIMARY KEY (exercicio, id)
);
