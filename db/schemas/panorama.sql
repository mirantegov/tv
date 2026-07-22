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

-- Escalares de grupo sem home no modelo chave-valor: rankings + território.
-- Ancora a view api.panorama (1 linha por exercício).
CREATE TABLE panorama.resumo (
	exercicio       smallint PRIMARY KEY,      -- ano de referência do painel
	codigo_ibge     text NOT NULL REFERENCES panorama.municipio (codigo_ibge),
	pop_rank_uf     text NOT NULL,             -- PAN.populacao.rankUf
	eco_rank_pib_uf text NOT NULL,             -- PAN.economia.rankPibUf
	ter_bioma       text NOT NULL,             -- PAN.territorio.bioma
	ter_hierarquia  text NOT NULL              -- PAN.territorio.hierarquia
);

-- ---------------------------------------------------------------------------
-- Bloco fiscal do TCE-PR (PAN.tce) — Consulta da entidade (pit.tce.pr.gov.br).
-- Escalares do bloco (1 linha por exercício). Valores em reais (numeric) e
-- datas em `date` (a view formata DD/MM/YYYY); percentuais como numeric.
-- ---------------------------------------------------------------------------
CREATE TABLE panorama.tce_resumo (
	exercicio           smallint PRIMARY KEY,
	codigo_ibge         text NOT NULL REFERENCES panorama.municipio (codigo_ibge),
	gestor              text NOT NULL,        -- PAN.tce.gestor
	referencia          text NOT NULL,        -- PAN.tce.referencia (competência, ex. '5/2026')
	ultimo_envio        date NOT NULL,        -- PAN.tce.ultimoEnvio
	mes_consolidado     smallint NOT NULL,    -- PAN.tce.mesConsolidado
	processos_total     smallint NOT NULL,    -- PAN.tce.processosTotal
	cert_numero         text NOT NULL,        -- PAN.tce.certidao.numero
	cert_emissao        date NOT NULL,        -- PAN.tce.certidao.emissao
	cert_validade       date NOT NULL,        -- PAN.tce.certidao.validade
	prev_loa            text NOT NULL,        -- PAN.tce.previsao.loa
	prev_receita        numeric NOT NULL,     -- PAN.tce.previsao.receitaPrevista
	prev_despesa        numeric NOT NULL,     -- PAN.tce.previsao.despesaFixada
	exec_rec_atualizada numeric NOT NULL,     -- PAN.tce.execucao.receitaAtualizada
	exec_rec_arrecadada numeric NOT NULL,     -- PAN.tce.execucao.receitaArrecadada
	exec_dotacao        numeric NOT NULL,     -- PAN.tce.execucao.dotacaoAtualizada
	exec_despesa_emp    numeric NOT NULL,     -- PAN.tce.execucao.despesaEmpenhada
	rcl                 numeric NOT NULL      -- PAN.tce.rcl
);

-- PAN.tce.processos — processos em trâmite por órgão (tupla [orgao, qtde]).
CREATE TABLE panorama.tce_processos (
	exercicio smallint NOT NULL REFERENCES panorama.tce_resumo (exercicio),
	ord       smallint NOT NULL,
	orgao     text NOT NULL,
	qtde      smallint NOT NULL,
	PRIMARY KEY (exercicio, ord)
);

-- PAN.tce.obras — obras por status (tupla [status, valor, qtde, tone]).
CREATE TABLE panorama.tce_obras (
	exercicio smallint NOT NULL REFERENCES panorama.tce_resumo (exercicio),
	ord       smallint NOT NULL,
	status    text NOT NULL,
	valor     numeric NOT NULL,
	qtde      smallint NOT NULL,
	tone      text NOT NULL,                  -- 'ok' | 'warn' | 'danger' | 'info'
	PRIMARY KEY (exercicio, ord)
);

-- PAN.tce.limites — limites constitucionais/fiscais (objeto por chave).
CREATE TABLE panorama.tce_limites (
	exercicio smallint NOT NULL REFERENCES panorama.tce_resumo (exercicio),
	chave     text NOT NULL,                  -- 'pessoal'|'educacao'|'saude'|'divida'|'opCredito'
	valor     numeric NOT NULL,
	pct       numeric NOT NULL,
	limite    numeric NOT NULL,
	tipo      text NOT NULL,                  -- 'teto' | 'minimo'
	base      numeric,                        -- base de cálculo (educação/saúde) — NULL nos demais
	parcial   boolean,                        -- true só quando acumulado parcial; NULL nos demais
	PRIMARY KEY (exercicio, chave)
);

-- PAN.tce.indicadores — grupos de comparação Município × Mediana estadual.
-- Array de [grupo, itens[]]; item = [nome, municipio, mediana, maiorMelhor, unidade].
CREATE TABLE panorama.tce_indicadores (
	exercicio    smallint NOT NULL REFERENCES panorama.tce_resumo (exercicio),
	grupo        text NOT NULL,
	grupo_ord    smallint NOT NULL,
	ord          smallint NOT NULL,
	nome         text NOT NULL,
	municipio    numeric NOT NULL,
	mediana      numeric NOT NULL,
	maior_melhor boolean NOT NULL,
	unidade      text NOT NULL DEFAULT '',
	PRIMARY KEY (exercicio, grupo, ord)
);
