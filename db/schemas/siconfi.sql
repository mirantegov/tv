-- ============================================================================
-- Módulo: SICONFI (rota /siconfi · mock: data.ts PC.siconfi)
-- CAUC e remessas da MSC / declarações fiscais (RREO, RGF, DCA).
-- ============================================================================
CREATE SCHEMA IF NOT EXISTS siconfi;

-- PC.siconfi.cauc.kpis — situação consolidada no CAUC
CREATE TABLE siconfi.cauc_resumo (
	exercicio   smallint NOT NULL,
	verificacao date NOT NULL,                -- data da consulta
	regulares   integer NOT NULL,
	total       integer NOT NULL,
	pendentes   integer NOT NULL,
	situacao    text NOT NULL,                -- ex.: 'Pendente'
	PRIMARY KEY (exercicio, verificacao)
);

-- PC.siconfi.cauc.itens — exigências do CAUC e situação
-- 'off' = exigência desativada pelo próprio serviço (não é inadimplência)
CREATE TABLE siconfi.cauc_itens (
	exercicio   smallint NOT NULL,
	verificacao date NOT NULL,
	ord         smallint NOT NULL,            -- ordem de exibição
	exigencia   text NOT NULL,                -- ex.: 'Regularidade previdenciária — RPPS (CRP)'
	status      text NOT NULL CHECK (status IN ('ok','warn','danger','off')),
	PRIMARY KEY (exercicio, verificacao, exigencia)
);

-- PC.siconfi.msc.remessas — remessas mensais da MSC
CREATE TABLE siconfi.msc_remessas (
	exercicio         smallint NOT NULL,
	competencia       smallint NOT NULL CHECK (competencia BETWEEN 1 AND 12),
	envio             date,                   -- NULL quando pendente
	status            text NOT NULL,          -- 'Enviada' | 'Pendente'
	consistencia_pct  numeric(6,2),           -- NULL quando pendente
	situacao          text NOT NULL CHECK (situacao IN ('ok','warn','danger')),
	PRIMARY KEY (exercicio, competencia)
);

-- PC.siconfi.msc.declaracoes — declarações derivadas (RREO, RGF, DCA)
CREATE TABLE siconfi.declaracoes (
	exercicio  smallint NOT NULL,
	ord        smallint NOT NULL,             -- ordem de exibição
	declaracao text NOT NULL,                 -- ex.: 'RREO — 2º bimestre'
	situacao   text NOT NULL,                 -- ex.: 'Gerado e homologado'
	status     text NOT NULL CHECK (status IN ('ok','warn','danger')),
	PRIMARY KEY (exercicio, declaracao)
);
