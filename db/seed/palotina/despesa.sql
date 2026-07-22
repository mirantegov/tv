-- Seed Despesa — Município de Palotina (IBGE 4118402), exercício 2026 (até Jun).
-- Extraído de src/data.ts (export D). Fonte única = data.ts.
SET search_path TO despesa;

-- restos_nao_processados / saldos derivados: o mock traz só restos e saldo,
-- então derivamos (saldo_a_empenhar = dotação − empenhado = D.saldo).
INSERT INTO resumo (exercicio, competencia, dotacao_atualizada, dotacao_inicial,
	creditos_adicionais, empenhado, liquidado, pago, restos_processados,
	restos_nao_processados, saldo_a_empenhar, saldo_a_liquidar, saldo_a_pagar)
VALUES (2026, 6, 850, 780, 70, 470.1, 410.2, 384.3, 95.4, 0, 379.9, 59.9, 25.9);

INSERT INTO funcoes (exercicio, ord, funcao, empenhado, liquidado, pago) VALUES
	(2026, 1, 'Saúde', 142.4, 124.8, 118.2),
	(2026, 2, 'Educação', 128.1, 112.5, 105.3),
	(2026, 3, 'Administração', 47.6, 42.1, 40.4),
	(2026, 4, 'Urbanismo', 40.2, 31.0, 26.8),
	(2026, 5, 'Previdência', 35.4, 35.0, 34.7),
	(2026, 6, 'Assistência', 28.3, 24.6, 22.9),
	(2026, 7, 'Enc. Especiais', 22.1, 21.5, 21.0),
	(2026, 8, 'Demais', 26.0, 18.7, 15.0);

INSERT INTO gnd (exercicio, ord, grupo, empenhado) VALUES
	(2026, 1, 'Pessoal e Encargos', 210.5),
	(2026, 2, 'Outras Desp. Correntes', 178.4),
	(2026, 3, 'Investimentos', 61.8),
	(2026, 4, 'Amortização', 8.2),
	(2026, 5, 'Juros e Encargos', 7.4),
	(2026, 6, 'Inversões', 3.8);

INSERT INTO mensal (exercicio, mes, empenhado_acum, liquidado_acum, pago_acum) VALUES
	(2026, 1, 84, 62, 54),
	(2026, 2, 158, 122, 108),
	(2026, 3, 236, 188, 168),
	(2026, 4, 312, 262, 238),
	(2026, 5, 392, 338, 312),
	(2026, 6, 470.1, 410.2, 384.3);

INSERT INTO orgaos (exercicio, ord, orgao, dotacao, empenhado, pago) VALUES
	(2026, 1, 'Sec. de Saúde', 252, 142.4, 118.2),
	(2026, 2, 'Sec. de Educação', 236, 128.1, 105.3),
	(2026, 3, 'Infraestrutura e Obras', 118, 58.2, 38.1),
	(2026, 4, 'Administração e Finanças', 92, 47.6, 40.4),
	(2026, 5, 'Assistência Social', 58, 28.3, 22.9),
	(2026, 6, 'Gabinete e Demais', 94, 65.5, 59.4);

INSERT INTO limites (exercicio, ord, indicador, aplicado_pct, escala_pct, limite_pct, rotulo, alerta_pct, situacao) VALUES
	(2026, 1, 'Saúde (ASPS)', 22.4, 30, 15, 'mín. 15%', NULL, 'ok'),
	(2026, 2, 'Educação (MDE)', 26.8, 35, 25, 'mín. 25%', NULL, 'ok'),
	(2026, 3, 'Pessoal / RCL', 49.2, 60, 54, 'limite 54%', 48.6, 'warn');
