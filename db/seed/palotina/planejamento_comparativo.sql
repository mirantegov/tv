-- Seed Planejamento — Comparativo/LOA (rota /planejamento-comp, export CP). Palotina.
-- Extraído de src/data.ts. Fonte única = data.ts. Normalizado como receita_comparativo.
-- Representativo — ver "Decisão pendente" no plano (trocar por LOA plurianual oficial).
SET search_path TO planejamento_comparativo;

-- CP.evol (orçamento fixado por ano) + orcA/orcB, recA/recB, despA/despB (25/26).
INSERT INTO totais (exercicio, orcamento, receita, despesa) VALUES
	(2022, 395, NULL, NULL),
	(2023, 420, NULL, NULL),
	(2024, 448, NULL, NULL),
	(2025, 478, 478, 478),
	(2026, 512, 512, 512);

-- CP.vinc: a (2025) / b (2026) / limite
INSERT INTO vinculacoes (exercicio, nome, valor, limite) VALUES
	(2025, 'Pessoal (LRF)', 41.2, 54), (2026, 'Pessoal (LRF)', 41.98, 54),
	(2025, 'Saúde (ASPS)', 24.9, 15), (2026, 'Saúde (ASPS)', 25.62, 15),
	(2025, 'Educação (MDE)', 25.4, 25), (2026, 'Educação (MDE)', 25.9, 25);

-- CP.entidades: [nome, v25, v26]
INSERT INTO entidades (exercicio, entidade, valor) VALUES
	(2025, 'Prefeitura', 440), (2026, 'Prefeitura', 470),
	(2025, 'Câmara', 13), (2026, 'Câmara', 14),
	(2025, 'RPPS/Previdência', 70), (2026, 'RPPS/Previdência', 78),
	(2025, 'Saneamento', 22), (2026, 'Saneamento', 24);

-- CP.arvore: despesa fixada por função (v25×v26). 1 linha por exercício por nó.
INSERT INTO arvore (exercicio, id, parent_id, nome, valor) VALUES
	(2025, 'edu', NULL, 'Educação', 118), (2026, 'edu', NULL, 'Educação', 128),
	(2025, 'ef', 'edu', 'Ensino Fundamental (MDE)', 78), (2026, 'ef', 'edu', 'Ensino Fundamental (MDE)', 84),
	(2025, 'ei', 'edu', 'Educação Infantil', 30), (2026, 'ei', 'edu', 'Educação Infantil', 33),
	(2025, 'es', 'edu', 'Demais (transporte/superior)', 10), (2026, 'es', 'edu', 'Demais (transporte/superior)', 11),
	(2025, 'sau', NULL, 'Saúde', 108), (2026, 'sau', NULL, 'Saúde', 118),
	(2025, 'ab', 'sau', 'Atenção Básica', 58), (2026, 'ab', 'sau', 'Atenção Básica', 64),
	(2025, 'ah', 'sau', 'Assistência Hospitalar', 38), (2026, 'ah', 'sau', 'Assistência Hospitalar', 40),
	(2025, 'vs', 'sau', 'Vigilância em Saúde', 12), (2026, 'vs', 'sau', 'Vigilância em Saúde', 14),
	(2025, 'adm', NULL, 'Administração', 70), (2026, 'adm', NULL, 'Administração', 74),
	(2025, 'prev', NULL, 'Previdência Social', 62), (2026, 'prev', NULL, 'Previdência Social', 68),
	(2025, 'urb', NULL, 'Urbanismo', 48), (2026, 'urb', NULL, 'Urbanismo', 50),
	(2025, 'leg', NULL, 'Legislativa', 13), (2026, 'leg', NULL, 'Legislativa', 14),
	(2025, 'enc', NULL, 'Encargos Especiais + Outras', 59), (2026, 'enc', NULL, 'Encargos Especiais + Outras', 60);
