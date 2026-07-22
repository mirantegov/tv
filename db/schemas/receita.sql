-- ============================================================================
-- Módulo: Receita — Visão Geral (rota /receita · mock: data.ts export R)
-- Valores em R$ milhões.
-- ============================================================================
CREATE SCHEMA IF NOT EXISTS receita;

-- R.prev…R.divida — KPIs do topo
CREATE TABLE receita.resumo (
	exercicio           smallint PRIMARY KEY,
	competencia         smallint NOT NULL CHECK (competencia BETWEEN 1 AND 12),
	previsao_atualizada numeric(14,2) NOT NULL,
	arrecadada_bruta    numeric(14,2) NOT NULL,
	deducoes_fundeb     numeric(14,2) NOT NULL,
	receita_liquida     numeric(14,2) NOT NULL,
	receita_propria     numeric(14,2) NOT NULL,
	transferencias      numeric(14,2) NOT NULL,
	divida_ativa_arrec  numeric(14,2) NOT NULL
);

-- R.mensal — previsto × arrecadado (acumulado e no mês)
CREATE TABLE receita.mensal (
	exercicio       smallint NOT NULL,
	mes             smallint NOT NULL CHECK (mes BETWEEN 1 AND 12),
	previsto_acum   numeric(14,2) NOT NULL,
	arrecadado_acum numeric(14,2) NOT NULL,
	previsto_mes    numeric(14,2) NOT NULL,
	arrecadado_mes  numeric(14,2) NOT NULL,
	PRIMARY KEY (exercicio, mes)
);

-- R.origem — arrecadação por origem
CREATE TABLE receita.origens (
	exercicio  smallint NOT NULL,
	origem     text NOT NULL,
	arrecadado numeric(14,2) NOT NULL,
	PRIMARY KEY (exercicio, origem)
);

-- R.transfDet — detalhamento das transferências (FPM, ICMS, FUNDEB…)
CREATE TABLE receita.transferencias (
	exercicio      smallint NOT NULL,
	transferencia  text NOT NULL,
	arrecadado     numeric(14,2) NOT NULL,
	PRIMARY KEY (exercicio, transferencia)
);

-- R.tributos — arrecadação tributária própria
CREATE TABLE receita.tributos (
	exercicio  smallint NOT NULL,
	tributo    text NOT NULL,
	arrecadado numeric(14,2) NOT NULL,
	PRIMARY KEY (exercicio, tributo)
);

-- R.natureza — árvore por natureza da receita (previsto × realizado)
CREATE TABLE receita.natureza (
	exercicio  smallint NOT NULL,
	id         text NOT NULL,                 -- ex.: 'rc', 'iss'
	parent_id  text,                          -- NULL na raiz
	nome       text NOT NULL,
	previsto   numeric(14,2) NOT NULL,
	arrecadado numeric(14,2) NOT NULL,
	PRIMARY KEY (exercicio, id)
);

-- R.saude / R.educ — fontes vinculadas (código de origem STN)
CREATE TABLE receita.fontes_vinculadas (
	exercicio smallint NOT NULL,
	area      text NOT NULL CHECK (area IN ('saude','educacao')),
	codigo    text NOT NULL,                  -- ex.: '500', '540'
	descricao text NOT NULL,
	valor     numeric(14,2) NOT NULL,
	destaque  boolean NOT NULL DEFAULT false, -- linha do mínimo constitucional
	PRIMARY KEY (exercicio, area, descricao)
);
