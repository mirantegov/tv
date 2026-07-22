-- Seed Panorama Municipal — Palotina (IBGE 4117909), exercício 2026.
-- Extraído de src/data.ts (export PAN). Fonte única = data.ts.
SET search_path TO panorama;

INSERT INTO municipio (codigo_ibge, nome, uf, gentilico) VALUES
	('4117909', 'Palotina', 'PR', 'palotinense');

INSERT INTO resumo (exercicio, codigo_ibge, pop_rank_uf, eco_rank_pib_uf, ter_bioma, ter_hierarquia) VALUES
	(2026, '4117909', '72º de 399', '18º de 399', 'Mata Atlântica', 'Centro de Zona A');

-- valor em texto: preserva a formatação BR do mock (v: string). fonte_ibge = PAN.*.ibge.
INSERT INTO indicadores (codigo_ibge, grupo, indicador, valor, ano, fonte_ibge, complemento) VALUES
	('4117909', 'populacao', 'censo',             '35.011',     2022, true,  NULL),
	('4117909', 'populacao', 'estimada',          '37.039',     2025, true,  NULL),
	('4117909', 'populacao', 'densidade',         '53,76',      2022, true,  NULL),

	('4117909', 'trabalho',  'salarioMedio',      '2,9',        2023, false, NULL),
	('4117909', 'trabalho',  'ocupado',           '14.120',     2023, false, NULL),
	('4117909', 'trabalho',  'ocupadaPct',        '38,9',       2023, false, NULL),
	('4117909', 'trabalho',  'meioSM',            '26,4',       2022, false, NULL),

	('4117909', 'educacao',  'escolarizacao',     '98,98',      2022, true,  NULL),
	('4117909', 'educacao',  'idebIniciais',      '6,5',        2023, false, NULL),
	('4117909', 'educacao',  'idebFinais',        '5,1',        2023, false, NULL),
	('4117909', 'educacao',  'matFund',           '4.310',      2024, false, NULL),
	('4117909', 'educacao',  'matMedio',          '1.480',      2024, false, NULL),
	('4117909', 'educacao',  'docFund',           '295',        2024, false, NULL),
	('4117909', 'educacao',  'escolas',           '23',         2024, false, NULL),

	('4117909', 'economia',  'pibPerCapita',      '105.626,67', 2023, true,  NULL),
	('4117909', 'economia',  'receitas',          '328,9',      2024, true,  NULL),
	('4117909', 'economia',  'despesas',          '298,2',      2024, true,  NULL),
	('4117909', 'economia',  'fontesExternasPct', '62,4',       2015, false, NULL),

	('4117909', 'saude',     'mortInfantil',      '6,02',       2023, true,  NULL),
	('4117909', 'saude',     'diarreia',          '0,4',        2016, false, NULL),
	('4117909', 'saude',     'estabSus',          '15',         2009, false, NULL),

	('4117909', 'territorio','area',              '651,238',    2024, true,  NULL),
	('4117909', 'territorio','esgoto',            '87,4',       2022, false, NULL),
	('4117909', 'territorio','arborizacao',       '96,2',       2022, false, NULL),
	('4117909', 'territorio','viasUrb',           '42,8',       2022, false, NULL),

	-- idhm carrega faixa em complemento (shape {v,ano,ibge?,faixa}).
	('4117909', 'idhm',      'idhm',              '0,768',      2010, true,  'Alto');
