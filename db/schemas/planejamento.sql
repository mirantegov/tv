-- ============================================================================
-- Módulo: Planejamento Orçamentário — LOA (rota /planejamento · mock: data.ts PLAN)
-- Valores em R$ milhões. `entidade` distingue Prefeitura / Câmara / RPPS / Saneamento.
-- ============================================================================
CREATE SCHEMA IF NOT EXISTS planejamento;

-- PLAN.consolidado…PLAN.nEntidades — consolidação da LOA
CREATE TABLE planejamento.resumo (
	exercicio      smallint PRIMARY KEY,     -- PLAN.ano
	consolidado    numeric(14,2) NOT NULL,   -- líquido de intra
	soma_entidades numeric(14,2) NOT NULL,
	intra          numeric(14,2) NOT NULL,   -- eliminadas na consolidação
	n_entidades    smallint NOT NULL
);

-- PLAN.entidades — receita/despesa fixada por entidade
CREATE TABLE planejamento.entidades (
	exercicio            smallint NOT NULL,
	entidade             text NOT NULL,       -- 'Prefeitura', 'Câmara Municipal'…
	receita_prevista     numeric(14,2) NOT NULL,
	despesa_fixada       numeric(14,2) NOT NULL,
	receita_propria      numeric(14,2) NOT NULL,
	modelo_financiamento text NOT NULL,
	PRIMARY KEY (exercicio, entidade)
);

-- PLAN.intraDet — transferências intraorçamentárias
CREATE TABLE planejamento.intra (
	exercicio smallint NOT NULL,
	descricao text NOT NULL,                 -- ex.: 'Duodécimo (Pref. → Câmara)'
	valor     numeric(14,2) NOT NULL,
	PRIMARY KEY (exercicio, descricao)
);

-- PLAN.consolNatureza — consolidado por natureza da despesa
CREATE TABLE planejamento.consolidado_natureza (
	exercicio smallint NOT NULL,
	grupo     text NOT NULL,                 -- ex.: 'Pessoal e Encargos'
	valor     numeric(14,2) NOT NULL,
	PRIMARY KEY (exercicio, grupo)
);

-- PLAN.pref — resumo do orçamento da Prefeitura
CREATE TABLE planejamento.prefeitura (
	exercicio      smallint PRIMARY KEY,
	receita        numeric(14,2) NOT NULL,
	despesa        numeric(14,2) NOT NULL,
	propria        numeric(14,2) NOT NULL,
	transf_corr    numeric(14,2) NOT NULL,
	capital        numeric(14,2) NOT NULL,
	pessoal        numeric(14,2) NOT NULL,
	investimentos  numeric(14,2) NOT NULL,
	a_transferir   numeric(14,2) NOT NULL    -- aporte RPPS + duodécimo
);

-- PLAN.pref.receitaOrigem / despesaGrupo / funcao / repasses — aberturas
-- da Prefeitura em uma tabela única, discriminadas por `dimensao`.
CREATE TABLE planejamento.prefeitura_aberturas (
	exercicio smallint NOT NULL,
	dimensao  text NOT NULL CHECK (dimensao IN ('receita_origem','despesa_grupo','funcao','repasses')),
	item      text NOT NULL,
	valor     numeric(14,2) NOT NULL,
	PRIMARY KEY (exercicio, dimensao, item)
);

-- PLAN.pref.vinc — vinculações constitucionais previstas (Pessoal, Saúde, Educação)
CREATE TABLE planejamento.vinculacoes (
	exercicio  smallint NOT NULL,
	indicador  text NOT NULL,                -- 'pessoal' | 'saude' | 'educacao'
	valor      numeric(14,2) NOT NULL,
	pct_orc    numeric(6,2) NOT NULL,
	limite_pct numeric(6,2) NOT NULL,
	escala_pct numeric(6,2) NOT NULL,        -- fundo de escala do gauge
	base_legal text NOT NULL,
	PRIMARY KEY (exercicio, indicador)
);

-- PLAN.camara — orçamento do Legislativo (CF art. 29-A)
CREATE TABLE planejamento.camara (
	exercicio       smallint PRIMARY KEY,
	receita         numeric(14,2) NOT NULL,
	propria         numeric(14,2) NOT NULL,
	despesa         numeric(14,2) NOT NULL,
	folha           numeric(14,2) NOT NULL,
	folha_pct       numeric(6,2) NOT NULL,   -- sobre o duodécimo
	folha_limite    numeric(6,2) NOT NULL,   -- 70% (art. 29-A §1º)
	duodecimo_pct   numeric(6,2) NOT NULL,
	duodecimo_base  numeric(14,2) NOT NULL,  -- RCL base do cálculo
	populacao       integer NOT NULL,
	faixa_idx       smallint NOT NULL        -- índice na tabela faixas_29a
);

-- PLAN.camara.grupo — despesa da Câmara por grupo
CREATE TABLE planejamento.camara_grupos (
	exercicio smallint NOT NULL,
	grupo     text NOT NULL,
	valor     numeric(14,2) NOT NULL,
	PRIMARY KEY (exercicio, grupo)
);

-- PLAN.camara.faixas29A — limites por faixa populacional (EC 58/2009)
CREATE TABLE planejamento.faixas_29a (
	faixa      text PRIMARY KEY,             -- ex.: '100.001 a 300.000'
	ordem      smallint NOT NULL,
	limite_pct numeric(6,2) NOT NULL
);

-- PLAN.prev + PLAN.prevTaxa — orçamento do RPPS
CREATE TABLE planejamento.previdencia (
	exercicio       smallint PRIMARY KEY,
	receita_prev    numeric(14,2) NOT NULL,
	despesa_prev    numeric(14,2) NOT NULL,  -- benefícios
	resultado       numeric(14,2) NOT NULL,
	receita_adm     numeric(14,2) NOT NULL,
	despesa_adm     numeric(14,2) NOT NULL,
	taxa_adm_base   numeric(14,2) NOT NULL,
	taxa_adm_pct    numeric(6,2) NOT NULL,
	taxa_adm_limite numeric(6,2) NOT NULL    -- 2%
);

-- PLAN.prev.recOrigem / beneficios — aberturas do RPPS
CREATE TABLE planejamento.previdencia_aberturas (
	exercicio smallint NOT NULL,
	dimensao  text NOT NULL CHECK (dimensao IN ('receita_origem','beneficios')),
	item      text NOT NULL,
	valor     numeric(14,2) NOT NULL,
	PRIMARY KEY (exercicio, dimensao, item)
);

-- PLAN.san — orçamento do Saneamento
CREATE TABLE planejamento.saneamento (
	exercicio     smallint PRIMARY KEY,
	receita       numeric(14,2) NOT NULL,
	despesa       numeric(14,2) NOT NULL,
	resultado     numeric(14,2) NOT NULL,
	investimentos numeric(14,2) NOT NULL
);

-- PLAN.san.recOrigem / grupo — aberturas do Saneamento
CREATE TABLE planejamento.saneamento_aberturas (
	exercicio smallint NOT NULL,
	dimensao  text NOT NULL CHECK (dimensao IN ('receita_origem','despesa_grupo')),
	item      text NOT NULL,
	valor     numeric(14,2) NOT NULL,
	PRIMARY KEY (exercicio, dimensao, item)
);
