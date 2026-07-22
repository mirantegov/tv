-- Seed Contratos — Município de Palotina, exercício 2026 (competência Jun).
-- Extraído de src/data.ts (export CON). Fonte única = data.ts. Valores em R$ milhões.
SET search_path TO contratos;

INSERT INTO resumo (exercicio, competencia, contratado, original, aditivos,
	aditivos_pct, vigentes, executado, executado_pct, saldo, a_vencer_90_qtd,
	a_vencer_90_valor, vencidos_qtd, vencidos_saldo, top5_pct)
VALUES (2026, 6, 312.0, 287.5, 24.5, 8.5, 248, 168.5, 54.0, 143.5, 18, 42.0, 5, 3.2, 35.3);

INSERT INTO tipos (exercicio, tipo, valor) VALUES
	(2026, 'Serviços contínuos', 128.0),
	(2026, 'Obras e engenharia', 88.0),
	(2026, 'Fornecimento', 64.0),
	(2026, 'Locação', 18.0),
	(2026, 'TI', 14.0);

INSERT INTO fornecedores (exercicio, ord, fornecedor, valor) VALUES
	(2026, 1, 'Construtora Aurora Ltda.', 38.0),
	(2026, 2, 'TechSolutions Serviços Ltda.', 28.5),
	(2026, 3, 'Limpa Bem Facilities Ltda.', 24.0),
	(2026, 4, 'Med Suprimentos Hosp. Ltda.', 21.0),
	(2026, 5, 'Alimenta Bem Refeições Ltda.', 18.5),
	(2026, 6, 'Demais (243 contratos)', 182.0);

INSERT INTO fontes (exercicio, fonte, valor) VALUES
	(2026, 'Recursos Livres', 132.0),
	(2026, 'Saúde', 78.0),
	(2026, 'Educação / FUNDEB', 64.0),
	(2026, 'Convênios', 22.0),
	(2026, 'Outras', 16.0);

INSERT INTO orgaos (exercicio, orgao, executado, saldo) VALUES
	(2026, 'Educação', 47.6, 34.4),
	(2026, 'Saúde', 42.6, 33.4),
	(2026, 'Infraestrutura', 27.3, 30.7),
	(2026, 'Administração', 22.0, 18.0),
	(2026, 'Assistência', 14.7, 15.3),
	(2026, 'Gabinete e Demais', 14.3, 11.7);

-- 12 meses à frente a partir de Jun/2026: Jul–Dez 2026, Jan–Jun 2027.
INSERT INTO vencimentos (ano, mes, valor) VALUES
	(2026,  7,  8.0),
	(2026,  8, 12.0),
	(2026,  9, 22.0),
	(2026, 10,  6.0),
	(2026, 11,  9.0),
	(2026, 12, 28.0),
	(2027,  1, 15.0),
	(2027,  2,  7.0),
	(2027,  3, 18.0),
	(2027,  4, 10.0),
	(2027,  5,  5.0),
	(2027,  6, 14.0);

INSERT INTO aditivos (contrato, tipo, valor, pct_acumulado, limite_pct) VALUES
	('CT-2025/012', 'Prazo + Valor', 3.3, 41.0, 50),
	('CT-2024/045', 'Valor',         5.2, 23.6, 25),
	('CT-2024/130', 'Valor',         2.6, 18.6, 25),
	('CT-2025/088', 'Reajuste',      2.2, 12.2, 25),
	('CT-2025/050', 'Valor',         2.0, 10.5, 25);

INSERT INTO carteira (contrato, objeto, fornecedor, orgao, valor_original, aditivos, executado, dias_para_vencer) VALUES
	('CT-2024/045', 'Pavimentação asfáltica',      'Construtora Aurora Ltda.',     'Infraestrutura', 22.0, 5.2, 18.0,  23),
	('CT-2024/130', 'Merenda escolar',             'Alimenta Bem Refeições Ltda.', 'Educação',       14.0, 2.6,  9.5,  64),
	('CT-2025/012', 'Reforma de escola municipal', 'Construtora Aurora Ltda.',     'Educação',        8.0, 3.3,  7.0, 120),
	('CT-2025/050', 'Insumos hospitalares',        'Med Suprimentos Hosp. Ltda.',  'Saúde',          19.0, 2.0, 12.0, 171),
	('CT-2025/088', 'Limpeza e conservação',       'Limpa Bem Facilities Ltda.',   'Administração',  18.0, 2.2, 11.0, 257),
	('CT-2026/003', 'Sistema de gestão (TI)',      'TechSolutions Serviços Ltda.', 'Administração',   6.5, 0.5,  2.1, 378);

INSERT INTO a_vencer (contrato, fornecedor, objeto, saldo, dias) VALUES
	('CT-2024/045', 'Construtora Aurora Ltda.',     'Pavimentação asfáltica',  9.2, 23),
	('CT-2025/110', 'Posto Central Ltda.',          'Combustíveis',           12.0, 30),
	('CT-2025/021', 'Segura Mais Serviços Ltda.',   'Vigilância armada',       9.0, 45),
	('CT-2024/130', 'Alimenta Bem Refeições Ltda.', 'Merenda escolar',         7.1, 64),
	('CT-2024/099', 'Construtora Aurora Ltda.',     'Manutenção predial',      4.5, 78);

INSERT INTO concentracao (exercicio, fornecedor, n_contratos, valor, pct_carteira) VALUES
	(2026, 'Construtora Aurora Ltda.',     3, 38.0, 12.2),
	(2026, 'TechSolutions Serviços Ltda.', 4, 28.5,  9.1),
	(2026, 'Limpa Bem Facilities Ltda.',   2, 24.0,  7.7),
	(2026, 'Med Suprimentos Hosp. Ltda.',  5, 21.0,  6.7),
	(2026, 'Alimenta Bem Refeições Ltda.', 2, 18.5,  5.9);
