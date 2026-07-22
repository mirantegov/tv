-- Seed Financeiro — Análises · Município de Palotina, exercício 2026 (até Jun).
-- Extraído de src/data.ts (export FA). Fonte única = data.ts. Valores em R$ milhões.
SET search_path TO financeiro_analises;

INSERT INTO resumo (exercicio, competencia, disponibilidade, conta_movimento, aplicado,
	rendimentos_ytd, rentabilidade_cdi, contas, conciliadas, conciliacao_pct,
	divergencias, divergencia_valor, mov_completa, mov_completa_pct, fontes_negativas)
VALUES (2026, 6, 142.0, 18.5, 123.5, 6.8, 98.5, 48, 42, 87.5, 6, 2.4, 39, 81.3, 1);

INSERT INTO fontes (exercicio, ord, fonte, saldo, obrigacoes, situacao) VALUES
	(2026, 1, 'Recursos Livres (500/501)', 45.2, 32.0, 'ok'),
	(2026, 2, 'Saúde (600–659)', 28.4, 9.5, 'ok'),
	(2026, 3, 'Educação (540–599)', 22.1, 7.2, 'ok'),
	(2026, 4, 'FUNDEB (540/541/542)', 15.8, 4.8, 'ok'),
	(2026, 5, 'Convênios e Transf. Voluntárias', 12.3, 3.6, 'ok'),
	(2026, 6, 'Operações de Crédito', 18.2, 2.1, 'ok'),
	(2026, 7, 'Royalties / Compensações', -0.8, 0.0, 'danger');

INSERT INTO investimentos_tipo (exercicio, tipo, aplicado) VALUES
	(2026, 'CDB / RDB', 58.0),
	(2026, 'Fundos DI / Renda Fixa', 45.5),
	(2026, 'Poupança', 20.0);

INSERT INTO rendimentos_mensal (exercicio, mes, rendimento) VALUES
	(2026, 1, 1.02),
	(2026, 2, 1.05),
	(2026, 3, 1.12),
	(2026, 4, 1.15),
	(2026, 5, 1.2),
	(2026, 6, 1.26);

INSERT INTO investimentos_instituicao (exercicio, instituicao, aplicado, rentabilidade_cdi, situacao) VALUES
	(2026, 'Banco do Brasil', 52.0, 100.2, 'ok'),
	(2026, 'Caixa Econômica Federal', 38.5, 98.4, 'ok'),
	(2026, 'Sicoob', 18.0, 97.1, 'ok'),
	(2026, 'Itaú', 15.0, 94.8, 'warn');

INSERT INTO bancos (exercicio, banco, contas, movimento, aplicado, conciliadas) VALUES
	(2026, 'Banco do Brasil', 18, 7.2, 52.0, 16),
	(2026, 'Caixa Econômica Federal', 15, 5.8, 38.5, 14),
	(2026, 'Sicoob', 8, 3.1, 18.0, 7),
	(2026, 'Itaú', 7, 2.4, 15.0, 5);

INSERT INTO pendencias (exercicio, conta, banco, valor, motivo, dias) VALUES
	(2026, 'CC 12.345-6 · Movimento', 'Itaú', 1.1, 'Cheque/TED não compensado', 12),
	(2026, 'CC 88.220-1 · Convênio', 'Caixa', 0.62, 'Tarifa não contabilizada', 8),
	(2026, 'CC 40.913-7 · FUNDEB', 'BB', 0.35, 'Rendimento não apropriado', 5),
	(2026, 'CC 55.128-9 · Saúde', 'Sicoob', 0.22, 'Depósito não identificado', 15),
	(2026, 'CC 90.377-2 · Movimento', 'Itaú', 0.08, 'Diferença de centavos (arred.)', 3),
	(2026, 'CC 33.404-8 · Livre', 'BB', 0.03, 'Lançamento em duplicidade', 21);

INSERT INTO movimentacao_matriz (exercicio, grupo, total, receita_ok, aplicacao_ok, resgate_ok) VALUES
	(2026, 'Recursos Livres', 14, 14, 13, 12),
	(2026, 'Saúde', 10, 10, 9, 8),
	(2026, 'Educação / FUNDEB', 9, 9, 9, 8),
	(2026, 'Convênios', 8, 7, 6, 6),
	(2026, 'Demais fontes', 7, 7, 6, 5);
