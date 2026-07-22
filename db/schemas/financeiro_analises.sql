-- ============================================================================
-- Módulo: Financeiro — Análises / Finanças (rota /financeiro-analises · mock: data.ts FA)
-- Fontes, investimentos e conciliação bancária. Valores em R$ milhões.
-- ============================================================================
CREATE SCHEMA IF NOT EXISTS financeiro_analises;

-- FA.disp…FA.fontesNegativas — KPIs do topo
CREATE TABLE financeiro_analises.resumo (
	exercicio         smallint PRIMARY KEY,
	competencia       smallint NOT NULL CHECK (competencia BETWEEN 1 AND 12),
	disponibilidade   numeric(14,2) NOT NULL,
	conta_movimento   numeric(14,2) NOT NULL,
	aplicado          numeric(14,2) NOT NULL,
	rendimentos_ytd   numeric(14,2) NOT NULL,
	rentabilidade_cdi numeric(6,2) NOT NULL,  -- % do CDI (média)
	contas            integer NOT NULL,
	conciliadas       integer NOT NULL,
	conciliacao_pct   numeric(6,2) NOT NULL,
	divergencias      integer NOT NULL,
	divergencia_valor numeric(14,2) NOT NULL,
	mov_completa      integer NOT NULL,       -- contas com movimentação completa
	mov_completa_pct  numeric(6,2) NOT NULL,
	fontes_negativas  integer NOT NULL
);

-- FA.fontes — saldo × obrigações por fonte (negativo = alerta)
CREATE TABLE financeiro_analises.fontes (
	exercicio  smallint NOT NULL,
	ord        smallint NOT NULL,             -- ordem de exibição (não é value-sortable)
	fonte      text NOT NULL,                 -- ex.: 'Royalties / Compensações'
	saldo      numeric(14,2) NOT NULL,
	obrigacoes numeric(14,2) NOT NULL,
	situacao   text NOT NULL CHECK (situacao IN ('ok','warn','danger')),
	PRIMARY KEY (exercicio, fonte)
);

-- FA.invTipo — aplicações por tipo de investimento
CREATE TABLE financeiro_analises.investimentos_tipo (
	exercicio smallint NOT NULL,
	tipo      text NOT NULL,                  -- ex.: 'CDB / RDB'
	aplicado  numeric(14,2) NOT NULL,
	PRIMARY KEY (exercicio, tipo)
);

-- FA.rendMensal — rendimentos mensais
CREATE TABLE financeiro_analises.rendimentos_mensal (
	exercicio  smallint NOT NULL,
	mes        smallint NOT NULL CHECK (mes BETWEEN 1 AND 12),
	rendimento numeric(14,2) NOT NULL,
	PRIMARY KEY (exercicio, mes)
);

-- FA.invInst — aplicações e rentabilidade por instituição
CREATE TABLE financeiro_analises.investimentos_instituicao (
	exercicio         smallint NOT NULL,
	instituicao       text NOT NULL,
	aplicado          numeric(14,2) NOT NULL,
	rentabilidade_cdi numeric(6,2) NOT NULL,  -- % do CDI
	situacao          text NOT NULL CHECK (situacao IN ('ok','warn','danger')),
	PRIMARY KEY (exercicio, instituicao)
);

-- FA.bancos — contas, movimento e conciliação por banco
CREATE TABLE financeiro_analises.bancos (
	exercicio   smallint NOT NULL,
	banco       text NOT NULL,
	contas      integer NOT NULL,
	movimento   numeric(14,2) NOT NULL,
	aplicado    numeric(14,2) NOT NULL,
	conciliadas integer NOT NULL,
	PRIMARY KEY (exercicio, banco)
);

-- FA.pendencias — divergências de conciliação em aberto
CREATE TABLE financeiro_analises.pendencias (
	exercicio  smallint NOT NULL,
	conta      text NOT NULL,                 -- ex.: 'CC 12.345-6 · Movimento'
	banco      text NOT NULL,
	valor      numeric(14,2) NOT NULL,
	motivo     text NOT NULL,
	dias       integer NOT NULL,              -- em aberto
	PRIMARY KEY (exercicio, conta)
);

-- FA.movMatriz — completude da movimentação por grupo de contas
CREATE TABLE financeiro_analises.movimentacao_matriz (
	exercicio   smallint NOT NULL,
	grupo       text NOT NULL,                -- ex.: 'Recursos Livres'
	total       integer NOT NULL,
	receita_ok  integer NOT NULL,
	aplicacao_ok integer NOT NULL,
	resgate_ok  integer NOT NULL,
	PRIMARY KEY (exercicio, grupo)
);
