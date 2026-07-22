-- Seed Receita — Município de Palotina (IBGE 4117909), exercício 2026.
-- Extraído de src/data.ts (export R). Fonte única = data.ts.
SET search_path TO receita;

-- mensal: colunas mapeadas p/ o tuplo do mock [mes, acumulado, meta, ant, atual]
-- (a view emite arrecadado_acum, previsto_acum, previsto_mes, arrecadado_mes)
INSERT INTO resumo (exercicio, competencia, previsao_atualizada, arrecadada_bruta,
	deducoes_fundeb, receita_liquida, receita_propria, transferencias,
	outras_receitas, receita_capital, divida_ativa_arrec)
VALUES (2026, 6, 905, 462.4, 38, 424.4, 176.4, 286, 19.5, 3, 7.8);

INSERT INTO mensal (exercicio, mes, previsto_acum, arrecadado_acum, previsto_mes, arrecadado_mes) VALUES
	(2026, 1, 82, 75.4, 76, 82),
	(2026, 2, 158, 150.8, 70, 76),
	(2026, 3, 232, 226.3, 70, 74),
	(2026, 4, 305, 301.7, 69, 73),
	(2026, 5, 386, 377.1, 74, 81),
	(2026, 6, 462.4, 452.5, 73, 76.4);

INSERT INTO origens (exercicio, origem, arrecadado) VALUES
	(2026, 'Transferências Correntes', 286),
	(2026, 'Receita Tributária', 118.5),
	(2026, 'Receita Patrimonial', 22.4),
	(2026, 'Outras Rec. Correntes', 19.5),
	(2026, 'Receita de Serviços', 8),
	(2026, 'Contribuições', 5),
	(2026, 'Receita de Capital', 3);

INSERT INTO transferencias (exercicio, transferencia, arrecadado) VALUES
	(2026, 'FPM', 96),
	(2026, 'Cota-parte ICMS', 88),
	(2026, 'FUNDEB (recebido)', 52),
	(2026, 'Transf. SUS', 28.5),
	(2026, 'Cota-parte IPVA', 9.5),
	(2026, 'FNDE', 8),
	(2026, 'Outras', 4);

INSERT INTO tributos (exercicio, tributo, arrecadado) VALUES
	(2026, 'ISS', 46),
	(2026, 'IPTU', 38.5),
	(2026, 'ITBI', 14),
	(2026, 'Taxas', 12),
	(2026, 'COSIP', 8);

-- natureza: árvore previsto × arrecadado (id/parent_id)
INSERT INTO natureza (exercicio, id, parent_id, nome, previsto, arrecadado) VALUES
	(2026, 'rc', NULL, 'Receitas Correntes', 900, 459.4),
	(2026, 'rct', 'rc', 'Impostos, Taxas e C. Melhoria', 232, 118.5),
	(2026, 'iss', 'rct', 'ISS', 90, 46),
	(2026, 'iptu', 'rct', 'IPTU', 78, 38.5),
	(2026, 'itbi', 'rct', 'ITBI', 26, 14),
	(2026, 'tx', 'rct', 'Taxas', 24, 12),
	(2026, 'cos', 'rct', 'COSIP', 14, 8),
	(2026, 'rtr', 'rc', 'Transferências Correntes', 560, 286),
	(2026, 'fpm', 'rtr', 'FPM', 188, 96),
	(2026, 'icms', 'rtr', 'Cota-parte ICMS', 172, 88),
	(2026, 'fdb', 'rtr', 'FUNDEB', 102, 52),
	(2026, 'sus', 'rtr', 'SUS', 56, 28.5),
	(2026, 'ipva', 'rtr', 'IPVA', 19, 9.5),
	(2026, 'fnde', 'rtr', 'FNDE', 16, 8),
	(2026, 'rto', 'rtr', 'Demais', 7, 4),
	(2026, 'rpa', 'rc', 'Receita Patrimonial', 44, 22.4),
	(2026, 'rse', 'rc', 'Receita de Serviços', 16, 8),
	(2026, 'rou', 'rc', 'Outras Receitas Correntes', 38, 19.5),
	(2026, 'rco', 'rc', 'Contribuições', 10, 5),
	(2026, 'rcap', NULL, 'Receitas de Capital', 5, 3),
	(2026, 'ded', NULL, '(−) Deduções (FUNDEB)', -75, -38);

INSERT INTO fontes_vinculadas (exercicio, area, codigo, descricao, valor, destaque) VALUES
	(2026, 'saude', '500', 'Impostos vinculados à Saúde — mín. 15% (ASPS)', 43.8, true),
	(2026, 'saude', '600', 'Transf. F. a F. do SUS — Manutenção (Custeio)', 22.0, false),
	(2026, 'saude', '601', 'Transf. F. a F. do SUS — Estruturação (Investimento)', 4.5, false),
	(2026, 'saude', '6xx', 'Transferências do SUS — Estado', 6.0, false),
	(2026, 'saude', '6xx', 'Convênios e outras — Saúde', 2.0, false),
	(2026, 'educacao', '500', 'Impostos vinculados à Educação — mín. 25% (MDE · CO 1001)', 73.0, true),
	(2026, 'educacao', '540', 'Transferências do FUNDEB', 48.0, false),
	(2026, 'educacao', '541', 'FUNDEB — Compl. União — VAAF', 3.0, false),
	(2026, 'educacao', '542', 'FUNDEB — Compl. União — VAAT', 1.0, false),
	(2026, 'educacao', '5xx', 'Salário-Educação / FNDE', 8.0, false),
	(2026, 'educacao', '5xx', 'Convênios e outras — Educação', 1.5, false);
