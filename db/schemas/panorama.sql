-- ============================================================================
-- Módulo: Panorama Municipal (rota /panorama · mock: data.ts export PAN)
-- Estrutura IBGE Cidades: indicadores heterogêneos → tabela chave-valor.
-- Fonte futura: API servicodados.ibge.gov.br (campos ibge=true no mock).
-- ============================================================================
CREATE SCHEMA IF NOT EXISTS panorama;

-- PAN.municipio…PAN.codigo — identificação do município
CREATE TABLE panorama.municipio (
	codigo_ibge text PRIMARY KEY,             -- ex.: '4117909'
	nome        text NOT NULL,
	uf          text NOT NULL,
	gentilico   text NOT NULL
);

-- PAN.populacao/trabalho/educacao/economia/saude/territorio/idhm —
-- indicadores por grupo (valor em texto: preserva formatação da fonte)
CREATE TABLE panorama.indicadores (
	codigo_ibge text NOT NULL REFERENCES panorama.municipio (codigo_ibge),
	grupo       text NOT NULL,                -- 'populacao' | 'trabalho' | 'educacao' | 'economia' | 'saude' | 'territorio' | 'idhm'
	indicador   text NOT NULL,                -- ex.: 'pib_per_capita', 'ideb_iniciais'
	valor       text NOT NULL,                -- ex.: '105.626,67'
	ano         smallint NOT NULL,            -- ano de referência do dado
	fonte_ibge  boolean NOT NULL DEFAULT false, -- true = coletado da página oficial
	complemento text,                         -- ex.: ranking ('72º de 399'), faixa ('Alto')
	PRIMARY KEY (codigo_ibge, grupo, indicador)
);
