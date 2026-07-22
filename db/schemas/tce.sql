-- ============================================================================
-- Módulo: TCE/PR (rota /tce · mock: data.ts PC.tce)
-- Agenda de obrigações, Certidão Liberatória e prestação de contas anual.
-- ============================================================================
CREATE SCHEMA IF NOT EXISTS tce;

-- PC.tce.agenda.kpis — resumo da agenda de obrigações por período
CREATE TABLE tce.agenda_resumo (
	exercicio     smallint NOT NULL,
	periodo       text NOT NULL,              -- ex.: 'Bimestre 2 de 2026'
	em_dia        integer NOT NULL,
	nao_atendido  integer NOT NULL,
	nao_aplicavel integer NOT NULL,
	entidades     integer NOT NULL,
	municipio     text NOT NULL,              -- PC.tce.agenda.local
	PRIMARY KEY (exercicio, periodo)
);

-- PC.tce.agenda.colunas — catálogo das obrigações (AUD, RREO, RGF…)
CREATE TABLE tce.obrigacoes (
	sigla     text PRIMARY KEY,
	descricao text NOT NULL
);

-- PC.tce.agenda.matriz — status por entidade × obrigação
CREATE TABLE tce.agenda_matriz (
	exercicio smallint NOT NULL,
	periodo   text NOT NULL,
	entidade  text NOT NULL,
	sigla     text NOT NULL REFERENCES tce.obrigacoes (sigla),
	status    text NOT NULL CHECK (status IN ('ok','no','na')), -- em dia / não atendido / não aplicável
	PRIMARY KEY (exercicio, periodo, entidade, sigla)
);

-- PC.tce.certidao — Certidão Liberatória vigente
CREATE TABLE tce.certidao (
	numero     text PRIMARY KEY,              -- ex.: 'CL-2026/00842'
	tipo       text NOT NULL,                 -- 'Liberatória'
	situacao   text NOT NULL,                 -- 'Regular'
	emissao    date NOT NULL,
	vencimento date NOT NULL,
	pendencias integer NOT NULL,
	finalidade text NOT NULL
);

-- PC.tce.certidao.itens — requisitos avaliados na certidão
CREATE TABLE tce.certidao_itens (
	numero    text NOT NULL REFERENCES tce.certidao (numero),
	descricao text NOT NULL,
	status    text NOT NULL CHECK (status IN ('ok','warn','danger')),
	PRIMARY KEY (numero, descricao)
);

-- PC.tce.contas — prestação de contas anual (histórico)
CREATE TABLE tce.contas (
	exercicio         smallint PRIMARY KEY,
	entrega           date,                   -- data de entrega ao TCE
	parecer_tce       text NOT NULL,          -- ex.: 'Regular', 'Em análise'
	julgamento_camara text,                   -- ex.: 'Aprovada'
	situacao          text NOT NULL CHECK (situacao IN ('ok','warn','danger','info'))
);
