-- ============================================================================
-- Módulo: Contratos Municipais (rota /contratos · mock: data.ts export CON)
-- Valores em R$ milhões.
-- ============================================================================
CREATE SCHEMA IF NOT EXISTS contratos;

-- CON.contratado…CON.topFornPct — KPIs do topo
CREATE TABLE contratos.resumo (
	exercicio         smallint PRIMARY KEY,
	competencia       smallint NOT NULL CHECK (competencia BETWEEN 1 AND 12),
	contratado        numeric(14,2) NOT NULL, -- valor atualizado da carteira
	original          numeric(14,2) NOT NULL, -- antes dos aditivos
	aditivos          numeric(14,2) NOT NULL,
	aditivos_pct      numeric(6,2) NOT NULL,
	vigentes          integer NOT NULL,
	executado         numeric(14,2) NOT NULL,
	executado_pct     numeric(6,2) NOT NULL,
	saldo             numeric(14,2) NOT NULL,
	a_vencer_90_qtd   integer NOT NULL,
	a_vencer_90_valor numeric(14,2) NOT NULL,
	vencidos_qtd      integer NOT NULL,
	vencidos_saldo    numeric(14,2) NOT NULL,
	top5_pct          numeric(6,2) NOT NULL   -- concentração top 5 fornecedores
);

-- CON.tipo — carteira por tipo de contrato
CREATE TABLE contratos.tipos (
	exercicio smallint NOT NULL,
	tipo      text NOT NULL,                  -- ex.: 'Serviços contínuos'
	valor     numeric(14,2) NOT NULL,
	PRIMARY KEY (exercicio, tipo)
);

-- CON.fornecedores — carteira por fornecedor
-- ord: "Demais" tem o maior valor mas vai por último → não ordenável por valor.
CREATE TABLE contratos.fornecedores (
	exercicio  smallint NOT NULL,
	ord        smallint NOT NULL,
	fornecedor text NOT NULL,
	valor      numeric(14,2) NOT NULL,
	PRIMARY KEY (exercicio, fornecedor)
);

-- CON.fonte — carteira por fonte de recursos
CREATE TABLE contratos.fontes (
	exercicio smallint NOT NULL,
	fonte     text NOT NULL,
	valor     numeric(14,2) NOT NULL,
	PRIMARY KEY (exercicio, fonte)
);

-- CON.orgaos — executado × saldo por órgão
CREATE TABLE contratos.orgaos (
	exercicio smallint NOT NULL,
	orgao     text NOT NULL,
	executado numeric(14,2) NOT NULL,
	saldo     numeric(14,2) NOT NULL,
	PRIMARY KEY (exercicio, orgao)
);

-- CON.vencimentos — valor a vencer por mês (12 meses à frente)
CREATE TABLE contratos.vencimentos (
	ano   smallint NOT NULL,
	mes   smallint NOT NULL CHECK (mes BETWEEN 1 AND 12),
	valor numeric(14,2) NOT NULL,
	PRIMARY KEY (ano, mes)
);

-- CON.aditivosDet — aditivos por contrato × limite legal
CREATE TABLE contratos.aditivos (
	contrato      text PRIMARY KEY,           -- ex.: 'CT-2025/012'
	tipo          text NOT NULL,              -- ex.: 'Prazo + Valor'
	valor         numeric(14,2) NOT NULL,
	pct_acumulado numeric(6,2) NOT NULL,
	limite_pct    numeric(6,2) NOT NULL       -- 25% (geral) / 50% (reforma)
);

-- CON.carteira — carteira detalhada de contratos
CREATE TABLE contratos.carteira (
	contrato        text PRIMARY KEY,
	objeto          text NOT NULL,
	fornecedor      text NOT NULL,
	orgao           text NOT NULL,
	valor_original  numeric(14,2) NOT NULL,
	aditivos        numeric(14,2) NOT NULL,
	executado       numeric(14,2) NOT NULL,
	dias_para_vencer integer NOT NULL
);

-- CON.aVencer — contratos a vencer em 90 dias
CREATE TABLE contratos.a_vencer (
	contrato   text PRIMARY KEY,
	fornecedor text NOT NULL,
	objeto     text NOT NULL,
	saldo      numeric(14,2) NOT NULL,
	dias       integer NOT NULL
);

-- CON.concentr — concentração por fornecedor
CREATE TABLE contratos.concentracao (
	exercicio    smallint NOT NULL,
	fornecedor   text NOT NULL,
	n_contratos  integer NOT NULL,
	valor        numeric(14,2) NOT NULL,
	pct_carteira numeric(6,2) NOT NULL,
	PRIMARY KEY (exercicio, fornecedor)
);
