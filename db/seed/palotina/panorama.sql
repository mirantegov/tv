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

-- ---------------------------------------------------------------------------
-- Bloco fiscal TCE-PR (PAN.tce) — Consulta da entidade Palotina, exercício 2026,
-- dados declarados referentes a 5/2026, consolidado do município até o mês 4.
-- ---------------------------------------------------------------------------
INSERT INTO tce_resumo (exercicio, codigo_ibge, gestor, referencia, ultimo_envio,
	mes_consolidado, processos_total, cert_numero, cert_emissao, cert_validade,
	prev_loa, prev_receita, prev_despesa,
	exec_rec_atualizada, exec_rec_arrecadada, exec_dotacao, exec_despesa_emp, rcl) VALUES
	(2026, '4117909', 'Rodrigo Ribeiro', '5/2026', DATE '2026-07-02',
	 4, 27, '9938/2025', DATE '2026-05-26', DATE '2026-07-25',
	 '7239/2025 (Aplicação 2026)', 297500000.00, 291858000.00,
	 316772422.08, 131564762.66, 359808478.51, 150819420.24, 286138969.42);

INSERT INTO tce_processos (exercicio, ord, orgao, qtde) VALUES
	(2026, 1, 'Unidades Instrutivas', 22),
	(2026, 2, 'Ministério Público de Contas', 0),
	(2026, 3, 'Gabinetes de Relator', 5),
	(2026, 4, 'Diretoria de Execuções', 0);

INSERT INTO tce_obras (exercicio, ord, status, valor, qtde, tone) VALUES
	(2026, 1, 'Concluída',    142117552.82, 273, 'ok'),
	(2026, 2, 'Paralisada',       1124102.03,   3, 'danger'),
	(2026, 3, 'Não iniciada',      500365.00,   2, 'warn'),
	(2026, 4, 'Em andamento',           0.00,   0, 'info');

-- base/parcial ficam NULL onde não se aplicam (a view usa jsonb_strip_nulls).
INSERT INTO tce_limites (exercicio, chave, valor, pct, limite, tipo, base, parcial) VALUES
	(2026, 'pessoal',   118372500.94,  41.98,  54, 'teto',   NULL,        NULL),
	(2026, 'educacao',   17090576.61,  20.09,  25, 'minimo', 85067221.84, true),
	(2026, 'saude',      21788794.13,  25.62,  15, 'minimo', 85034480.41, NULL),
	(2026, 'divida',   -112222288.40, -39.38, 120, 'teto',   NULL,        NULL),
	(2026, 'opCredito',          0.00,   0.00,  16, 'teto',   NULL,        NULL);

INSERT INTO tce_indicadores (exercicio, grupo, grupo_ord, ord, nome, municipio, mediana, maior_melhor, unidade) VALUES
	(2026, 'Demográficos', 1, 1, 'População estimada',        30859,   9705, true,  ''),
	(2026, 'Demográficos', 1, 2, 'População urbana (censo)',  24646,   5732, true,  ''),
	(2026, 'Demográficos', 1, 3, 'População rural (censo)',    4037,   2573, true,  ''),
	(2026, 'Sociais', 2, 1, 'Taxa de alfabetização',          94.18,  89.73, true,  '%'),
	(2026, 'Sociais', 2, 2, 'Expectativa de vida ao nascer',  76.85,  74.27, true,  ' anos'),
	(2026, 'Sociais', 2, 3, 'Índice de Gini',                  0.47,   0.47, false, ''),
	(2026, 'Sociais', 2, 4, 'Taxa de pobreza',                 2.85,   8.43, false, '%'),
	(2026, 'Econômicos', 3, 1, 'PIB per capita',              45051,  20198, true,  ' R$'),
	(2026, 'Econômicos', 3, 2, 'PIB a preços correntes',    1366248, 191633, true,  ' R$ mil'),
	(2026, 'Resultado do serviço público', 4, 1, 'Índice de eficácia da educação',              0.83, 0.72, true, ''),
	(2026, 'Resultado do serviço público', 4, 2, 'Índice de eficiência da despesa em educação', 0.84, 0.63, true, '');
