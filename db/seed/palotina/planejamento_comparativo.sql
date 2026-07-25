-- Seed Planejamento — Comparativo/LOA (rota /planejamento-comp, export CP). Palotina.
-- Extraído de src/data.ts. Fonte única = data.ts. Normalizado como receita_comparativo.
-- Representativo — ver "Decisão pendente" no plano (trocar por LOA plurianual oficial).
SET search_path TO planejamento_comparativo;

-- CP.evol (orçamento fixado por ano) + orcA/orcB, recA/recB, despA/despB (25/26).
-- integral = CP.*; pref/camara/prev/san = CP.{ent} (orcamento = série CP.{ent}.evol).
INSERT INTO totais (exercicio, entidade, orcamento, receita, despesa) VALUES
	(2022, 'integral', 395, NULL, NULL),
	(2023, 'integral', 420, NULL, NULL),
	(2024, 'integral', 448, NULL, NULL),
	(2025, 'integral', 478, 478, 478),
	(2026, 'integral', 512, 512, 512),
	-- Prefeitura: res 0/0 (rec = desp)
	(2022, 'pref', 368, NULL, NULL),
	(2023, 'pref', 392, NULL, NULL),
	(2024, 'pref', 415, NULL, NULL),
	(2025, 'pref', 440, 440, 440),
	(2026, 'pref', 470, 470, 470),
	-- Câmara: res 0/0
	(2022, 'camara', 11, NULL, NULL),
	(2023, 'camara', 12, NULL, NULL),
	(2024, 'camara', 12.5, NULL, NULL),
	(2025, 'camara', 13, 13, 13),
	(2026, 'camara', 14, 14, 14),
	-- Previdência (RPPS): orcamento = receita prevista; res 8/10
	(2022, 'prev', 58, NULL, NULL),
	(2023, 'prev', 64, NULL, NULL),
	(2024, 'prev', 68, NULL, NULL),
	(2025, 'prev', 70, 70, 62),
	(2026, 'prev', 78, 78, 68),
	-- Saneamento: res 2/2
	(2022, 'san', 16, NULL, NULL),
	(2023, 'san', 18, NULL, NULL),
	(2024, 'san', 20, NULL, NULL),
	(2025, 'san', 22, 22, 20),
	(2026, 'san', 24, 24, 22);

-- CP.vinc: a (2025) / b (2026) / limite. integral + por entidade.
INSERT INTO vinculacoes (exercicio, entidade, nome, valor, limite) VALUES
	(2025, 'integral', 'Pessoal (LRF)', 41.2, 54), (2026, 'integral', 'Pessoal (LRF)', 41.98, 54),
	(2025, 'integral', 'Saúde (ASPS)', 24.9, 15), (2026, 'integral', 'Saúde (ASPS)', 25.62, 15),
	(2025, 'integral', 'Educação (MDE)', 25.4, 25), (2026, 'integral', 'Educação (MDE)', 25.9, 25),
	-- Prefeitura
	(2025, 'pref', 'Pessoal (LRF)', 41.2, 54), (2026, 'pref', 'Pessoal (LRF)', 41.98, 54),
	(2025, 'pref', 'Saúde (ASPS)', 24.9, 15), (2026, 'pref', 'Saúde (ASPS)', 25.62, 15),
	(2025, 'pref', 'Educação (MDE)', 25.4, 25), (2026, 'pref', 'Educação (MDE)', 25.9, 25),
	-- Câmara (tetos CF 29-A)
	(2025, 'camara', 'Folha (CF 29-A)', 68, 70), (2026, 'camara', 'Folha (CF 29-A)', 69, 70),
	(2025, 'camara', 'Duodécimo (% RLA)', 6.8, 7), (2026, 'camara', 'Duodécimo (% RLA)', 6.9, 7),
	-- Previdência (teto taxa adm)
	(2025, 'prev', 'Taxa de Administração', 1.8, 2), (2026, 'prev', 'Taxa de Administração', 1.9, 2);
	-- Saneamento: sem vinculações (CP.san.vinc = [])

-- CP.{ent}.grupo — despesa por grupo A(2025)×B(2026), por entidade.
INSERT INTO grupos (exercicio, entidade, grupo, valor) VALUES
	(2025, 'pref', 'Pessoal', 190), (2026, 'pref', 'Pessoal', 205),
	(2025, 'pref', 'Custeio', 150), (2026, 'pref', 'Custeio', 158),
	(2025, 'pref', 'Investimentos', 55), (2026, 'pref', 'Investimentos', 60),
	(2025, 'pref', 'Transferências', 30), (2026, 'pref', 'Transferências', 32),
	(2025, 'pref', 'Encargos', 15), (2026, 'pref', 'Encargos', 15),
	(2025, 'camara', 'Pessoal', 9), (2026, 'camara', 'Pessoal', 9.6),
	(2025, 'camara', 'Custeio', 3.2), (2026, 'camara', 'Custeio', 3.6),
	(2025, 'camara', 'Investimentos', 0.8), (2026, 'camara', 'Investimentos', 0.8),
	(2025, 'prev', 'Aposentadorias', 44), (2026, 'prev', 'Aposentadorias', 48),
	(2025, 'prev', 'Pensões', 12), (2026, 'prev', 'Pensões', 13),
	(2025, 'prev', 'Auxílios', 4), (2026, 'prev', 'Auxílios', 4.5),
	(2025, 'prev', 'Adm.', 2), (2026, 'prev', 'Adm.', 2.5),
	(2025, 'san', 'Custeio', 11), (2026, 'san', 'Custeio', 12),
	(2025, 'san', 'Investimentos', 7), (2026, 'san', 'Investimentos', 8),
	(2025, 'san', 'Pessoal', 2), (2026, 'san', 'Pessoal', 2);

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
