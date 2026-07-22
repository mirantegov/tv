-- ============================================================================
-- Módulo: Folha de Pagamento (rota /folha · mock: data.ts export FP)
-- Valores em R$ milhões. Folha é mensal: PK (exercicio, competencia).
-- FP.custoMesAnt e FP.evol derivam das linhas mensais de `resumo`.
-- ============================================================================
CREATE SCHEMA IF NOT EXISTS folha;

-- FP.custoTotal…FP.inativosCusto — KPIs mensais.
-- bruta/liquida/encargos/horas_extras existem p/ todos os meses (FP.evol, FP.heTrend);
-- as demais só p/ o mês corrente (nullable) — mês ant. guarda apenas custo_total (FP.custoMesAnt).
CREATE TABLE folha.resumo (
	exercicio        smallint NOT NULL,
	competencia      smallint NOT NULL CHECK (competencia BETWEEN 1 AND 12),
	bruta            numeric(14,2) NOT NULL,
	liquida          numeric(14,2) NOT NULL,
	encargos         numeric(14,2) NOT NULL,
	horas_extras     numeric(14,2) NOT NULL,
	custo_total      numeric(14,2),
	horas_extras_pct numeric(6,2),   -- % sobre a folha
	adicionais       numeric(14,2),
	custo_medio      numeric(14,2),  -- R$ mil por servidor
	headcount        integer,
	inativos         integer,
	inativos_custo   numeric(14,2),
	PRIMARY KEY (exercicio, competencia)
);

-- FP.lrf — despesa de pessoal × RCL (apuração 12 meses)
CREATE TABLE folha.lrf (
	exercicio      smallint NOT NULL,
	competencia    smallint NOT NULL CHECK (competencia BETWEEN 1 AND 12),
	pct            numeric(6,2) NOT NULL,     -- pessoal / RCL
	bruta_12m      numeric(14,2) NOT NULL,
	deducoes       numeric(14,2) NOT NULL,
	liquida_12m    numeric(14,2) NOT NULL,
	rcl_12m        numeric(14,2) NOT NULL,
	alerta_pct     numeric(6,2) NOT NULL,     -- 48,6%
	prudencial_pct numeric(6,2) NOT NULL,     -- 51,3%
	limite_pct     numeric(6,2) NOT NULL,     -- 54,0%
	margem_valor   numeric(14,2) NOT NULL,
	margem_pp      numeric(6,2) NOT NULL,
	PRIMARY KEY (exercicio, competencia)
);

-- FP.composicao — componentes da folha do mês (ordem curada, não ordenável por valor)
CREATE TABLE folha.composicao (
	exercicio   smallint NOT NULL,
	competencia smallint NOT NULL,
	componente  text NOT NULL,                -- ex.: 'Vencimento base'
	valor       numeric(14,2) NOT NULL,
	ord         smallint NOT NULL,
	PRIMARY KEY (exercicio, competencia, componente)
);

-- FP.vinculo — custo por vínculo (efetivos, comissionados…)
CREATE TABLE folha.vinculos (
	exercicio   smallint NOT NULL,
	competencia smallint NOT NULL,
	vinculo     text NOT NULL,
	valor       numeric(14,2) NOT NULL,
	PRIMARY KEY (exercicio, competencia, vinculo)
);

-- FP.adic + FP.adicDet — adicionais por tipo (com beneficiários).
-- ord = ordem de FP.adicDet; FP.adic reordena por valor DESC, ord.
CREATE TABLE folha.adicionais (
	exercicio     smallint NOT NULL,
	competencia   smallint NOT NULL,
	tipo          text NOT NULL,              -- ex.: 'Insalubridade'
	beneficiarios integer NOT NULL,
	valor         numeric(14,2) NOT NULL,
	ord           smallint NOT NULL,
	PRIMARY KEY (exercicio, competencia, tipo)
);

-- FP.cargos — custo por cargo (ordem curada: 'Demais cargos' fica por último)
CREATE TABLE folha.cargos (
	exercicio   smallint NOT NULL,
	competencia smallint NOT NULL,
	cargo       text NOT NULL,
	valor       numeric(14,2) NOT NULL,
	ord         smallint NOT NULL,
	PRIMARY KEY (exercicio, competencia, cargo)
);

-- FP.heOrgao — horas extras por órgão (rótulos/agrupamento próprios, não deriva de orgaos)
CREATE TABLE folha.he_orgao (
	exercicio   smallint NOT NULL,
	competencia smallint NOT NULL,
	orgao       text NOT NULL,
	valor       numeric(14,2) NOT NULL,
	PRIMARY KEY (exercicio, competencia, orgao)
);

-- FP.orgaos — folha detalhada por órgão (ordem curada, não ordenável por valor)
CREATE TABLE folha.orgaos (
	exercicio    smallint NOT NULL,
	competencia  smallint NOT NULL,
	orgao        text NOT NULL,
	servidores   integer NOT NULL,
	bruta        numeric(14,2) NOT NULL,
	encargos     numeric(14,2) NOT NULL,
	custo_total  numeric(14,2) NOT NULL,
	horas_extras numeric(14,2) NOT NULL,
	adicionais   numeric(14,2) NOT NULL,
	ord          smallint NOT NULL,
	PRIMARY KEY (exercicio, competencia, orgao)
);
