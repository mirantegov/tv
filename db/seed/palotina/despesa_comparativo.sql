-- Seed Despesa — Comparativo (rota /despesa-comp, export CD). Palotina 2025×2026.
-- Extraído de src/data.ts. Fonte única = data.ts.
SET search_path TO despesa_comparativo;

INSERT INTO totais (exercicio, empenhado, liquidado, pago) VALUES
	(2025, 439.5, 388, 362.5),
	(2026, 470.1, 410.2, 384.3);

-- CD.meses: [mes, v25, v26] (empenho mensal não acumulado)
INSERT INTO mensal (exercicio, mes, empenhado) VALUES
	(2025, 1, 80), (2025, 2, 70), (2025, 3, 74), (2025, 4, 72), (2025, 5, 73), (2025, 6, 70.5),
	(2026, 1, 84), (2026, 2, 74), (2026, 3, 78), (2026, 4, 76), (2026, 5, 80), (2026, 6, 78.1);

-- CD.func: [nome, v25, v26]
INSERT INTO funcoes (exercicio, funcao, empenhado) VALUES
	(2025, 'Saúde', 128.0), (2026, 'Saúde', 142.4),
	(2025, 'Educação', 121.5), (2026, 'Educação', 128.1),
	(2025, 'Administração', 44.0), (2026, 'Administração', 47.6),
	(2025, 'Urbanismo', 46.5), (2026, 'Urbanismo', 40.2),
	(2025, 'Previdência', 31.2), (2026, 'Previdência', 35.4),
	(2025, 'Assistência', 25.8), (2026, 'Assistência', 28.3),
	(2025, 'Enc. Especiais', 20.5), (2026, 'Enc. Especiais', 22.1),
	(2025, 'Demais', 22.0), (2026, 'Demais', 26.0);

-- CD.arvore: função → subfunção → ação. 1 linha por exercício por nó (v25/v26).
INSERT INTO arvore (exercicio, id, parent_id, nome, empenhado) VALUES
	(2025, 'f10', NULL, '10 · Saúde', 128.0), (2026, 'f10', NULL, '10 · Saúde', 142.4),
	(2025, 'f10a', 'f10', '10.301 Atenção Básica', 52.0), (2026, 'f10a', 'f10', '10.301 Atenção Básica', 58.0),
	(2025, 'f10a1', 'f10a', 'Manut. das UBS', 30.5), (2026, 'f10a1', 'f10a', 'Manut. das UBS', 34.0),
	(2025, 'f10a2', 'f10a', 'Agentes Comunitários', 21.5), (2026, 'f10a2', 'f10a', 'Agentes Comunitários', 24.0),
	(2025, 'f10b', 'f10', '10.302 Assist. Hospitalar', 54.0), (2026, 'f10b', 'f10', '10.302 Assist. Hospitalar', 60.4),
	(2025, 'f10b1', 'f10b', 'Hospital Municipal', 38.0), (2026, 'f10b1', 'f10b', 'Hospital Municipal', 42.4),
	(2025, 'f10b2', 'f10b', 'Consórcio de Saúde', 16.0), (2026, 'f10b2', 'f10b', 'Consórcio de Saúde', 18.0),
	(2025, 'f10c', 'f10', '10.304/305 Vigilância', 22.0), (2026, 'f10c', 'f10', '10.304/305 Vigilância', 24.0),
	(2025, 'f12', NULL, '12 · Educação', 121.5), (2026, 'f12', NULL, '12 · Educação', 128.1),
	(2025, 'f12a', 'f12', '12.361 Ens. Fundamental', 74.0), (2026, 'f12a', 'f12', '12.361 Ens. Fundamental', 78.0),
	(2025, 'f12a1', 'f12a', 'Manut. Ens. Fundamental', 53.0), (2026, 'f12a1', 'f12a', 'Manut. Ens. Fundamental', 56.0),
	(2025, 'f12a2', 'f12a', 'Transporte Escolar', 21.0), (2026, 'f12a2', 'f12a', 'Transporte Escolar', 22.0),
	(2025, 'f12b', 'f12', '12.365 Educação Infantil', 37.5), (2026, 'f12b', 'f12', '12.365 Educação Infantil', 40.1),
	(2025, 'f12b1', 'f12b', 'Creches', 26.0), (2026, 'f12b1', 'f12b', 'Creches', 28.1),
	(2025, 'f12b2', 'f12b', 'Pré-escola', 11.5), (2026, 'f12b2', 'f12b', 'Pré-escola', 12.0),
	(2025, 'f12c', 'f12', '12.366 EJA', 10.0), (2026, 'f12c', 'f12', '12.366 EJA', 10.0),
	(2025, 'f04', NULL, '04 · Administração', 44.0), (2026, 'f04', NULL, '04 · Administração', 47.6),
	(2025, 'f15', NULL, '15 · Urbanismo', 46.5), (2026, 'f15', NULL, '15 · Urbanismo', 40.2),
	(2025, 'f09', NULL, '09 · Previdência', 31.2), (2026, 'f09', NULL, '09 · Previdência', 35.4),
	(2025, 'fxx', NULL, 'Demais funções', 76.3), (2026, 'fxx', NULL, 'Demais funções', 76.5);
