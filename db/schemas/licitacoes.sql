-- ============================================================================
-- Módulo: Licitações (rota /licitacoes · mock: data.ts export LIC)
-- Valores em R$ milhões.
-- ============================================================================
CREATE SCHEMA IF NOT EXISTS licitacoes;

-- LIC.homologado…LIC.meeppExclusivos + LIC.pncp — KPIs do topo
CREATE TABLE licitacoes.resumo (
	exercicio          smallint PRIMARY KEY,
	competencia        smallint NOT NULL CHECK (competencia BETWEEN 1 AND 12),
	homologado         numeric(14,2) NOT NULL,
	processos          integer NOT NULL,
	estimado           numeric(14,2) NOT NULL,
	economia           numeric(14,2) NOT NULL,
	economia_pct       numeric(6,2) NOT NULL,
	taxa_sucesso_pct   numeric(6,2) NOT NULL,
	tempo_medio_dias   integer NOT NULL,
	em_andamento       integer NOT NULL,
	em_andamento_valor numeric(14,2) NOT NULL,
	direta_pct         numeric(6,2) NOT NULL, -- dispensa + inexigibilidade
	desertos_pct       numeric(6,2) NOT NULL,
	fornecedores_media numeric(6,2) NOT NULL, -- por certame
	meepp_exclusivos   integer NOT NULL,      -- certames exclusivos/cota ME/EPP (LC 123)
	pncp_no_prazo      integer NOT NULL,      -- publicidade Lei 14.133 art. 54/94
	pncp_fora_prazo    integer NOT NULL,
	pncp_pendentes     integer NOT NULL
);

-- LIC.meepp — destino do valor homologado (ME/EPP local / externa / demais)
CREATE TABLE licitacoes.meepp (
	exercicio smallint NOT NULL,
	destino   text NOT NULL,                  -- ex.: 'ME/EPP do município'
	valor     numeric(14,2) NOT NULL,
	PRIMARY KEY (exercicio, destino)
);

-- LIC.atas — atas de registro de preços (SRP)
CREATE TABLE licitacoes.atas (
	exercicio  smallint NOT NULL,
	objeto     text NOT NULL,
	registrado numeric(14,2) NOT NULL,
	consumido  numeric(14,2) NOT NULL,
	vencimento date NOT NULL,
	PRIMARY KEY (exercicio, objeto)
);

-- LIC.mensal — estimado × homologado por mês
CREATE TABLE licitacoes.mensal (
	exercicio  smallint NOT NULL,
	mes        smallint NOT NULL CHECK (mes BETWEEN 1 AND 12),
	estimado   numeric(14,2) NOT NULL,
	homologado numeric(14,2) NOT NULL,
	PRIMARY KEY (exercicio, mes)
);

-- LIC.modalidade — desempenho por modalidade
CREATE TABLE licitacoes.modalidades (
	exercicio        smallint NOT NULL,
	modalidade       text NOT NULL,
	processos        integer NOT NULL,
	estimado         numeric(14,2) NOT NULL,
	homologado       numeric(14,2) NOT NULL,
	economia_pct     numeric(6,2) NOT NULL,
	tempo_medio_dias integer NOT NULL,
	taxa_sucesso_pct numeric(6,2) NOT NULL,
	PRIMARY KEY (exercicio, modalidade)
);

-- LIC.funil — funil de processos (publicados → contratados)
CREATE TABLE licitacoes.funil (
	exercicio  smallint NOT NULL,
	etapa      text NOT NULL,
	ordem      smallint NOT NULL,
	quantidade integer NOT NULL,
	PRIMARY KEY (exercicio, etapa)
);

-- LIC.situacao — processos por situação
CREATE TABLE licitacoes.situacoes (
	exercicio  smallint NOT NULL,
	situacao   text NOT NULL,                 -- ex.: 'Deserto'
	quantidade integer NOT NULL,
	PRIMARY KEY (exercicio, situacao)
);

-- LIC.objeto — valor homologado por categoria de objeto
CREATE TABLE licitacoes.objetos (
	exercicio smallint NOT NULL,
	categoria text NOT NULL,                  -- ex.: 'Obras e engenharia'
	valor     numeric(14,2) NOT NULL,
	PRIMARY KEY (exercicio, categoria)
);

-- LIC.pipeline — processos em andamento
CREATE TABLE licitacoes.pipeline (
	processo   text PRIMARY KEY,              -- ex.: 'PE-2026/0188'
	exercicio  smallint NOT NULL,
	objeto     text NOT NULL,
	modalidade text NOT NULL,
	orgao      text NOT NULL,
	estimado   numeric(14,2) NOT NULL,
	situacao   text NOT NULL,                 -- ex.: 'Em julgamento'
	dias       integer NOT NULL               -- desde a abertura
);

-- LIC.diretas — contratações diretas (dispensa/inexigibilidade)
CREATE TABLE licitacoes.contratacao_direta (
	exercicio  smallint NOT NULL,
	base_legal text NOT NULL,                 -- ex.: 'Art. 75, II'
	objeto     text NOT NULL,
	fornecedor text NOT NULL,
	valor      numeric(14,2) NOT NULL,
	PRIMARY KEY (exercicio, base_legal, objeto)
);

-- LIC.desertos — certames desertos/fracassados e motivo
CREATE TABLE licitacoes.desertos_fracassados (
	exercicio  smallint NOT NULL,
	objeto     text NOT NULL,
	modalidade text NOT NULL,
	motivo     text NOT NULL,
	PRIMARY KEY (exercicio, objeto)
);
