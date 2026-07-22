-- ============================================================================
-- Módulo: Despesa — Visão Geral (rota /despesa · mock: data.ts export D)
-- Valores monetários em R$ milhões (numeric), como exibido no painel.
-- ============================================================================
CREATE SCHEMA IF NOT EXISTS despesa;

-- D.dotacao…D.saldo — KPIs do topo (1 linha por exercício; competencia = mês de referência)
CREATE TABLE despesa.resumo (
	exercicio              smallint PRIMARY KEY,
	competencia            smallint NOT NULL CHECK (competencia BETWEEN 1 AND 12),
	dotacao_atualizada     numeric(14,2) NOT NULL,
	dotacao_inicial        numeric(14,2) NOT NULL,
	creditos_adicionais    numeric(14,2) NOT NULL,
	empenhado              numeric(14,2) NOT NULL,
	liquidado              numeric(14,2) NOT NULL,
	pago                   numeric(14,2) NOT NULL,
	restos_processados     numeric(14,2) NOT NULL,
	restos_nao_processados numeric(14,2) NOT NULL,
	saldo_a_empenhar       numeric(14,2) NOT NULL, -- dotação − empenhado
	saldo_a_liquidar       numeric(14,2) NOT NULL, -- empenhado − liquidado
	saldo_a_pagar          numeric(14,2) NOT NULL  -- liquidado − pago
);

-- D.funcoes — execução por função de governo
CREATE TABLE despesa.funcoes (
	exercicio smallint NOT NULL,
	ord       smallint NOT NULL,
	funcao    text NOT NULL,
	empenhado numeric(14,2) NOT NULL,
	liquidado numeric(14,2) NOT NULL,
	pago      numeric(14,2) NOT NULL,
	PRIMARY KEY (exercicio, funcao)
);

-- D.gnd — grupos de natureza da despesa
CREATE TABLE despesa.gnd (
	exercicio smallint NOT NULL,
	ord       smallint NOT NULL,
	grupo     text NOT NULL,
	empenhado numeric(14,2) NOT NULL,
	PRIMARY KEY (exercicio, grupo)
);

-- D.meses — execução acumulada mês a mês
CREATE TABLE despesa.mensal (
	exercicio      smallint NOT NULL,
	mes            smallint NOT NULL CHECK (mes BETWEEN 1 AND 12),
	empenhado_acum numeric(14,2) NOT NULL,
	liquidado_acum numeric(14,2) NOT NULL,
	pago_acum      numeric(14,2) NOT NULL,
	PRIMARY KEY (exercicio, mes)
);

-- D.orgaos — execução por órgão/secretaria
CREATE TABLE despesa.orgaos (
	exercicio smallint NOT NULL,
	ord       smallint NOT NULL,
	orgao     text NOT NULL,
	dotacao   numeric(14,2) NOT NULL,
	empenhado numeric(14,2) NOT NULL,
	pago      numeric(14,2) NOT NULL,
	PRIMARY KEY (exercicio, orgao)
);

-- D.gov — limites constitucionais/legais (ASPS, MDE, Pessoal/RCL)
CREATE TABLE despesa.limites (
	exercicio    smallint NOT NULL,
	ord          smallint NOT NULL,
	indicador    text NOT NULL,               -- ex.: 'Saúde (ASPS)'
	aplicado_pct numeric(6,2) NOT NULL,
	escala_pct   numeric(6,2) NOT NULL,       -- fundo de escala do gauge
	limite_pct   numeric(6,2) NOT NULL,
	rotulo       text NOT NULL,               -- ex.: 'mín. 15%'
	alerta_pct   numeric(6,2),                -- limite de alerta (LRF), quando houver
	situacao     text NOT NULL CHECK (situacao IN ('ok','warn','danger')),
	PRIMARY KEY (exercicio, indicador)
);
