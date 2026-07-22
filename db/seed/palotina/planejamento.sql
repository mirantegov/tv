-- Seed Planejamento (LOA) — Município de Palotina, exercício 2026.
-- Extraído de src/data.ts (export PLAN). Fonte única = data.ts. Valores em R$ milhões.
SET search_path TO planejamento;

INSERT INTO resumo (exercicio, consolidado, soma_entidades, intra, n_entidades)
VALUES (2026, 1055.0, 1160.5, 105.5, 4);

-- ordem = receita_prevista DESC (905, 132.5, 85, 38)
INSERT INTO entidades (exercicio, entidade, receita_prevista, despesa_fixada, receita_propria, modelo_financiamento) VALUES
	(2026, 'Prefeitura', 905.0, 905.0, 360.0, 'Superávit próprio repassado (duodécimo + aporte)'),
	(2026, 'Previdência (RPPS)', 132.5, 132.5, 130.0, 'Superávit previdenciário; administrativo por aporte'),
	(2026, 'Saneamento', 85.0, 85.0, 85.0, 'Equilíbrio com receita tarifária própria'),
	(2026, 'Câmara Municipal', 38.0, 38.0, 0.0, 'Custeada integralmente por duodécimo');

INSERT INTO intra (exercicio, ord, descricao, valor) VALUES
	(2026, 1, 'Duodécimo (Pref. → Câmara)', 38.0),
	(2026, 2, 'Aporte previdenciário (Pref. → RPPS)', 62.5),
	(2026, 3, 'Aporte administrativo (Pref. → RPPS)', 2.5),
	(2026, 4, 'Patronal do Legislativo (Câmara → RPPS)', 2.5);

INSERT INTO consolidado_natureza (exercicio, grupo, valor) VALUES
	(2026, 'Pessoal e Encargos', 464.0),
	(2026, 'Custeio (ODC)', 333.5),
	(2026, 'Investimentos', 115.5),
	(2026, 'Benefícios Previdenciários', 108.0),
	(2026, 'Reserva / Amortização', 34.0);

INSERT INTO prefeitura (exercicio, receita, despesa, propria, transf_corr, capital, pessoal, investimentos, a_transferir)
VALUES (2026, 905.0, 905.0, 360.0, 520.0, 25.0, 420.0, 90.0, 103.0);

INSERT INTO prefeitura_aberturas (exercicio, dimensao, ord, item, valor) VALUES
	(2026, 'receita_origem', 1, 'Transferências Correntes', 520.0),
	(2026, 'receita_origem', 2, 'Receita Própria (tributária+)', 360.0),
	(2026, 'receita_origem', 3, 'Receita de Capital', 25.0),
	(2026, 'despesa_grupo', 1, 'Pessoal e Encargos', 420.0),
	(2026, 'despesa_grupo', 2, 'Custeio (ODC)', 280.0),
	(2026, 'despesa_grupo', 3, 'Investimentos', 90.0),
	(2026, 'despesa_grupo', 4, 'Aporte ao RPPS', 65.0),
	(2026, 'despesa_grupo', 5, 'Duodécimo (Câmara)', 38.0),
	(2026, 'despesa_grupo', 6, 'Reserva / Amortização', 12.0),
	(2026, 'funcao', 1, 'Educação', 175.0),
	(2026, 'funcao', 2, 'Saúde', 165.0),
	(2026, 'funcao', 3, 'Urbanismo', 120.0),
	(2026, 'funcao', 4, 'Encargos Especiais', 115.0),
	(2026, 'funcao', 5, 'Administração', 95.0),
	(2026, 'funcao', 6, 'Assistência Social', 55.0),
	(2026, 'funcao', 7, 'Demais funções', 180.0),
	(2026, 'repasses', 1, 'Aporte ao RPPS (prev. + adm.)', 65.0),
	(2026, 'repasses', 2, 'Duodécimo à Câmara', 38.0);

INSERT INTO vinculacoes (exercicio, indicador, valor, pct_orc, limite_pct, escala_pct, base_legal) VALUES
	(2026, 'pessoal', 418.2, 49.2, 54.0, 60, 'Pessoal computável ÷ RCL prevista (R$ 850 mi) · LRF art. 19'),
	(2026, 'saude', 88.5, 18.4, 15.0, 25, 'Mín. 15% de impostos + transf. (base R$ 480 mi) · EC 29 / ADCT art. 77'),
	(2026, 'educacao', 132.0, 27.5, 25.0, 35, 'Mín. 25% de impostos + transf. (base R$ 480 mi) · CF art. 212 (MDE)');

INSERT INTO camara (exercicio, receita, propria, despesa, folha, folha_pct, folha_limite, duodecimo_pct, duodecimo_base, populacao, faixa_idx)
VALUES (2026, 38.0, 0.0, 38.0, 26.0, 68.4, 70.0, 5.8, 660.0, 180000, 1);

INSERT INTO camara_grupos (exercicio, grupo, valor) VALUES
	(2026, 'Pessoal e Encargos', 26.0),
	(2026, 'Custeio (ODC)', 11.5),
	(2026, 'Investimentos', 0.5);

INSERT INTO faixas_29a (faixa, ordem, limite_pct) VALUES
	('Até 100.000 hab.', 1, 7.0),
	('100.001 a 300.000', 2, 6.0),
	('300.001 a 500.000', 3, 5.0),
	('500.001 a 3.000.000', 4, 4.5),
	('3.000.001 a 8.000.000', 5, 4.0),
	('Acima de 8.000.000', 6, 3.5);

INSERT INTO previdencia (exercicio, receita_prev, despesa_prev, resultado, receita_adm, despesa_adm, taxa_adm_base, taxa_adm_pct, taxa_adm_limite)
VALUES (2026, 130.0, 108.0, 22.0, 0.0, 2.5, 480.0, 0.52, 2.0);

INSERT INTO previdencia_aberturas (exercicio, dimensao, item, valor) VALUES
	(2026, 'receita_origem', 'Contribuição Patronal', 70.0),
	(2026, 'receita_origem', 'Contribuição do Servidor', 38.0),
	(2026, 'receita_origem', 'Rendimentos de Investimentos', 22.0),
	(2026, 'beneficios', 'Aposentadorias', 86.0),
	(2026, 'beneficios', 'Pensões por Morte', 22.0);

INSERT INTO saneamento (exercicio, receita, despesa, resultado, investimentos)
VALUES (2026, 85.0, 85.0, 0.0, 25.0);

INSERT INTO saneamento_aberturas (exercicio, dimensao, item, valor) VALUES
	(2026, 'receita_origem', 'Tarifa de Água', 52.0),
	(2026, 'receita_origem', 'Tarifa de Esgoto', 28.0),
	(2026, 'receita_origem', 'Outras Receitas', 5.0),
	(2026, 'despesa_grupo', 'Custeio Operacional', 42.0),
	(2026, 'despesa_grupo', 'Investimentos', 25.0),
	(2026, 'despesa_grupo', 'Pessoal e Encargos', 18.0);
