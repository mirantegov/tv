-- ============================================================================
-- Módulo: Tributação e Fiscalização (rota /tributacao · mock: data.ts export TB)
-- Valores em R$ milhões.
-- ============================================================================
CREATE SCHEMA IF NOT EXISTS tributacao;

-- TB.propria…TB.cotaUnica — KPIs do topo
CREATE TABLE tributacao.resumo (
	exercicio             smallint PRIMARY KEY,
	competencia           smallint NOT NULL CHECK (competencia BETWEEN 1 AND 12),
	receita_propria       numeric(14,2) NOT NULL,
	receita_propria_pct   numeric(6,2) NOT NULL,  -- % da receita arrecadada
	iptu_lancado          numeric(14,2) NOT NULL,
	iptu_arrecadado       numeric(14,2) NOT NULL,
	iptu_adimplencia_pct  numeric(6,2) NOT NULL,
	iss_arrecadado        numeric(14,2) NOT NULL,
	iss_yoy_pct           numeric(6,2) NOT NULL,  -- variação vs exercício anterior
	itbi_arrecadado       numeric(14,2) NOT NULL,
	itbi_transmissoes     integer NOT NULL,
	divida_ativa_saldo    numeric(14,2) NOT NULL,
	divida_ativa_rec_pct  numeric(6,2) NOT NULL,
	inadimplencia_vencida numeric(14,2) NOT NULL,
	renuncia              numeric(14,2) NOT NULL,
	cota_unica_pct        numeric(6,2) NOT NULL   -- adesão à cota única do IPTU
);

-- TB.tributos — lançado × arrecadado × inadimplência por tributo
CREATE TABLE tributacao.tributos (
	exercicio               smallint NOT NULL,
	tributo                 text NOT NULL,
	lancado                 numeric(14,2) NOT NULL,
	arrecadado              numeric(14,2) NOT NULL,
	inadimplencia_vencida   numeric(14,2) NOT NULL,
	recuperado_divida_ativa numeric(14,2) NOT NULL,
	PRIMARY KEY (exercicio, tributo)
);

-- TB.da — movimentação da dívida ativa por tributo
CREATE TABLE tributacao.divida_ativa (
	exercicio     smallint NOT NULL,
	tributo       text NOT NULL,
	saldo_inicial numeric(14,2) NOT NULL,
	inscricoes    numeric(14,2) NOT NULL,
	recuperado    numeric(14,2) NOT NULL,
	cancelado     numeric(14,2) NOT NULL,
	ajuizado_pct  numeric(6,2) NOT NULL,
	PRIMARY KEY (exercicio, tributo)
);

-- TB.meses — arrecadação mensal IPTU / ISS / ITBI
CREATE TABLE tributacao.mensal (
	exercicio smallint NOT NULL,
	mes       smallint NOT NULL CHECK (mes BETWEEN 1 AND 12),
	iptu      numeric(14,2) NOT NULL,
	iss       numeric(14,2) NOT NULL,
	itbi      numeric(14,2) NOT NULL,
	PRIMARY KEY (exercicio, mes)
);

-- TB.setores — ISS por setor econômico
CREATE TABLE tributacao.setores_iss (
	exercicio  smallint NOT NULL,
	setor      text NOT NULL,
	arrecadado numeric(14,2) NOT NULL,
	PRIMARY KEY (exercicio, setor)
);

-- TB.bairros — arrecadação × inadimplência por região
CREATE TABLE tributacao.bairros (
	exercicio     smallint NOT NULL,
	bairro        text NOT NULL,
	arrecadado    numeric(14,2) NOT NULL,
	inadimplencia numeric(14,2) NOT NULL,
	PRIMARY KEY (exercicio, bairro)
);

-- TB.devedores — maiores devedores
-- LGPD: em produção, anonimizar/restringir por perfil de acesso.
CREATE TABLE tributacao.devedores (
	exercicio    smallint NOT NULL,
	contribuinte text NOT NULL,
	tributo      text NOT NULL,
	situacao     text NOT NULL,               -- ex.: 'Ajuizado', 'Em cobrança'
	valor        numeric(14,2) NOT NULL,
	PRIMARY KEY (exercicio, contribuinte, tributo)
);

-- TB.renuncias — renúncias de receita (isenções, imunidades, anistias)
CREATE TABLE tributacao.renuncias (
	exercicio  smallint NOT NULL,
	descricao  text NOT NULL,
	tributo    text NOT NULL,
	valor      numeric(14,2) NOT NULL,
	base_legal text NOT NULL,
	PRIMARY KEY (exercicio, descricao)
);
