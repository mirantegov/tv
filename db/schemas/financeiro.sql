-- ============================================================================
-- Módulo: Financeiro — Tesouraria (rota /financeiro · mock: data.ts export F)
-- Valores em R$ milhões.
-- ============================================================================
CREATE SCHEMA IF NOT EXISTS financeiro;

-- F.anterior…F.rendimento — KPIs do topo
CREATE TABLE financeiro.resumo (
	exercicio               smallint PRIMARY KEY,
	competencia             smallint NOT NULL CHECK (competencia BETWEEN 1 AND 12),
	saldo_anterior          numeric(14,2) NOT NULL, -- disponibilidade no início do exercício
	disponibilidade_bruta   numeric(14,2) NOT NULL,
	obrigacoes              numeric(14,2) NOT NULL, -- RP proc. + consignações + depósitos
	disponibilidade_liquida numeric(14,2) NOT NULL,
	ingressos               numeric(14,2) NOT NULL,
	desembolsos             numeric(14,2) NOT NULL,
	resultado               numeric(14,2) NOT NULL,
	aplicacoes              numeric(14,2) NOT NULL,
	rendimento              numeric(14,2) NOT NULL
);

-- F.fontes — disponibilidade por fonte de recursos
CREATE TABLE financeiro.fontes (
	exercicio     smallint NOT NULL,
	ord           smallint NOT NULL,          -- preserva a ordem do mock
	fonte         text NOT NULL,              -- ex.: 'Saúde (600–659 · 15%)'
	vinculada     boolean NOT NULL,
	bruta         numeric(14,2) NOT NULL,
	obrigacoes    numeric(14,2) NOT NULL,
	restos_pagar  numeric(14,2) NOT NULL,
	PRIMARY KEY (exercicio, fonte)
);

-- F.fluxo — ingressos × desembolsos mensais
CREATE TABLE financeiro.fluxo_mensal (
	exercicio   smallint NOT NULL,
	mes         smallint NOT NULL CHECK (mes BETWEEN 1 AND 12),
	ingressos   numeric(14,2) NOT NULL,
	desembolsos numeric(14,2) NOT NULL,
	PRIMARY KEY (exercicio, mes)
);

-- F.evol — evolução mensal da disponibilidade (bruta e líquida)
CREATE TABLE financeiro.evolucao_mensal (
	exercicio               smallint NOT NULL,
	mes                     smallint NOT NULL CHECK (mes BETWEEN 1 AND 12),
	disponibilidade_bruta   numeric(14,2) NOT NULL,
	disponibilidade_liquida numeric(14,2) NOT NULL,
	PRIMARY KEY (exercicio, mes)
);

-- F.bancos — saldos por instituição bancária
CREATE TABLE financeiro.bancos (
	exercicio smallint NOT NULL,
	ord       smallint NOT NULL,
	banco     text NOT NULL,
	saldo     numeric(14,2) NOT NULL,
	PRIMARY KEY (exercicio, banco)
);

-- F.obrigacoes — composição das obrigações a pagar
CREATE TABLE financeiro.obrigacoes (
	exercicio smallint NOT NULL,
	ord       smallint NOT NULL,
	tipo      text NOT NULL,                  -- ex.: 'RP Processados a pagar'
	valor     numeric(14,2) NOT NULL,
	PRIMARY KEY (exercicio, tipo)
);

-- F.pagamentos — desembolsos por categoria
CREATE TABLE financeiro.pagamentos (
	exercicio smallint NOT NULL,
	ord       smallint NOT NULL,
	categoria text NOT NULL,                  -- ex.: 'Folha de Pessoal'
	valor     numeric(14,2) NOT NULL,
	PRIMARY KEY (exercicio, categoria)
);

-- F.extra — extraorçamentário: retido × recolhido (INSS, IRRF, FGTS…)
CREATE TABLE financeiro.extraorcamentario (
	exercicio smallint NOT NULL,
	ord       smallint NOT NULL,
	tipo      text NOT NULL,
	retido    numeric(14,2) NOT NULL,
	recolhido numeric(14,2) NOT NULL,
	PRIMARY KEY (exercicio, tipo)
);
