-- ============================================================================
-- Módulo: People Analytics (rota /people · mock: data.ts export PA)
-- Contagens em servidores; percentuais em numeric(6,2).
-- ============================================================================
CREATE SCHEMA IF NOT EXISTS people;

-- PA.headcount…PA.razaoCom — KPIs do topo (snapshot por exercício)
CREATE TABLE people.resumo (
	exercicio          smallint PRIMARY KEY,
	competencia        smallint NOT NULL CHECK (competencia BETWEEN 1 AND 12),
	headcount          integer NOT NULL,      -- ativos
	total              integer NOT NULL,      -- c/ inativos e pensionistas
	inativos           integer NOT NULL,
	turnover_pct       numeric(6,2) NOT NULL,
	absenteismo_pct    numeric(6,2) NOT NULL,
	tempo_medio_anos   numeric(6,2) NOT NULL,
	elegiveis          integer NOT NULL,      -- à aposentadoria (hoje)
	elegiveis_pct      numeric(6,2) NOT NULL,
	idade_media        numeric(6,2) NOT NULL,
	cobertura_pct      numeric(6,2) NOT NULL, -- providos / autorizados
	providos           integer NOT NULL,
	autorizados        integer NOT NULL,
	razao_comissionados_pct numeric(6,2) NOT NULL
);

-- PA.piramide — pirâmide etária por sexo
CREATE TABLE people.piramide (
	exercicio   smallint NOT NULL,
	faixa       text NOT NULL,                -- ex.: '30–39'
	masculino   integer NOT NULL,
	feminino    integer NOT NULL,
	PRIMARY KEY (exercicio, faixa)
);

-- PA.orgaos — headcount por órgão
CREATE TABLE people.orgaos (
	exercicio smallint NOT NULL,
	orgao     text NOT NULL,
	headcount integer NOT NULL,
	PRIMARY KEY (exercicio, orgao)
);

-- PA.vinculo — servidores por vínculo
CREATE TABLE people.vinculos (
	exercicio  smallint NOT NULL,
	vinculo    text NOT NULL,
	servidores integer NOT NULL,
	PRIMARY KEY (exercicio, vinculo)
);

-- PA.mov — admissões × desligamentos mensais
CREATE TABLE people.movimentacao (
	exercicio     smallint NOT NULL,
	mes           smallint NOT NULL CHECK (mes BETWEEN 1 AND 12),
	admissoes     integer NOT NULL,
	desligamentos integer NOT NULL,
	PRIMARY KEY (exercicio, mes)
);

-- PA.absent — dias de afastamento por motivo
CREATE TABLE people.absenteismo (
	exercicio smallint NOT NULL,
	motivo    text NOT NULL,                  -- ex.: 'Licença saúde (CID)'
	dias      integer NOT NULL,
	PRIMARY KEY (exercicio, motivo)
);

-- PA.tempo — distribuição por tempo de serviço
CREATE TABLE people.tempo_servico (
	exercicio  smallint NOT NULL,
	faixa      text NOT NULL,                 -- ex.: '10–15'
	servidores integer NOT NULL,
	PRIMARY KEY (exercicio, faixa)
);

-- PA.escolaridade — distribuição por escolaridade
CREATE TABLE people.escolaridade (
	exercicio  smallint NOT NULL,
	nivel      text NOT NULL,
	servidores integer NOT NULL,
	PRIMARY KEY (exercicio, nivel)
);

-- PA.elegCurva — projeção de elegíveis à aposentadoria
CREATE TABLE people.elegiveis_projecao (
	ano       smallint PRIMARY KEY,
	elegiveis integer NOT NULL
);

-- PA.quadro — quadro de pessoal por órgão
CREATE TABLE people.quadro (
	exercicio     smallint NOT NULL,
	orgao         text NOT NULL,
	headcount     integer NOT NULL,
	efetivos      integer NOT NULL,
	comissionados integer NOT NULL,
	temporarios   integer NOT NULL,
	vagas_autorizadas integer NOT NULL,
	idade_media   numeric(6,2) NOT NULL,
	PRIMARY KEY (exercicio, orgao)
);

-- PA.sucessao — risco sucessório por carreira
CREATE TABLE people.sucessao (
	exercicio       smallint NOT NULL,
	carreira        text NOT NULL,
	elegiveis_hoje  integer NOT NULL,
	elegiveis_5anos integer NOT NULL,
	pct_do_cargo    numeric(6,2) NOT NULL,
	PRIMARY KEY (exercicio, carreira)
);
