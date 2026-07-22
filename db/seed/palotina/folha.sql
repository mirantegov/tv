-- Seed Folha de Pagamento — Município de Palotina, exercício 2026 (competência 6 = Jun).
-- Extraído de src/data.ts (export FP). Fonte única = data.ts. Valores em R$ milhões.
SET search_path TO folha;

-- Série mensal: bruta/liquida/encargos = FP.evol; horas_extras = FP.heTrend.
-- KPIs escalares só no mês corrente (Jun); Mai guarda custo_total p/ FP.custoMesAnt.
INSERT INTO resumo (exercicio, competencia, bruta, liquida, encargos, horas_extras,
	custo_total, horas_extras_pct, adicionais, custo_medio, headcount, inativos, inativos_custo) VALUES
	(2026, 1, 27.0, 19.5, 6.4, 0.95, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	(2026, 2, 27.5, 19.8, 6.5, 1.02, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	(2026, 3, 28.0, 20.1, 6.6, 1.10, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	(2026, 4, 28.2, 20.3, 6.7, 1.15, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	(2026, 5, 28.3, 20.4, 6.7, 1.18, 35.0, NULL, NULL, NULL, NULL, NULL, NULL),
	(2026, 6, 28.5, 20.5, 6.8, 1.20, 35.3, 4.2, 2.8, 7.3, 4850, 1920, 9.5);

-- FP.lrf — despesa de pessoal × RCL (mês corrente)
INSERT INTO lrf (exercicio, competencia, pct, bruta_12m, deducoes, liquida_12m, rcl_12m,
	alerta_pct, prudencial_pct, limite_pct, margem_valor, margem_pp) VALUES
	(2026, 6, 49.2, 545.0, 43.2, 501.8, 1020.0, 48.6, 51.3, 54.0, 49.0, 4.8);

-- FP.composicao
INSERT INTO composicao (exercicio, competencia, componente, valor, ord) VALUES
	(2026, 6, 'Vencimento base', 19.5, 1),
	(2026, 6, 'Vantagens / Gratif.', 5.0, 2),
	(2026, 6, 'Encargos patronais', 6.8, 3),
	(2026, 6, 'Adicionais', 2.8, 4),
	(2026, 6, 'Horas Extras', 1.2, 5);

-- FP.vinculo (ordenável por valor DESC)
INSERT INTO vinculos (exercicio, competencia, vinculo, valor) VALUES
	(2026, 6, 'Efetivos', 27.0),
	(2026, 6, 'Comissionados', 4.2),
	(2026, 6, 'Temporários', 3.3),
	(2026, 6, 'Agentes políticos', 0.8);

-- FP.heOrgao (ordenável por valor DESC)
INSERT INTO he_orgao (exercicio, competencia, orgao, valor) VALUES
	(2026, 6, 'Saúde', 0.52),
	(2026, 6, 'Infraestrutura', 0.28),
	(2026, 6, 'Educação', 0.18),
	(2026, 6, 'Demais', 0.12),
	(2026, 6, 'Administração', 0.10);

-- FP.adicDet (ord) + FP.adic (valor DESC, ord)
INSERT INTO adicionais (exercicio, competencia, tipo, beneficiarios, valor, ord) VALUES
	(2026, 6, 'Insalubridade', 1240, 0.95, 1),
	(2026, 6, 'Gratificações (FG/CC)', 680, 0.75, 2),
	(2026, 6, 'Adicional noturno', 520, 0.40, 3),
	(2026, 6, 'Periculosidade', 210, 0.25, 4),
	(2026, 6, 'Sobreaviso', 95, 0.20, 5),
	(2026, 6, 'Outros', 160, 0.25, 6);

-- FP.cargos (ordem curada)
INSERT INTO cargos (exercicio, competencia, cargo, valor, ord) VALUES
	(2026, 6, 'Professor', 8.5, 1),
	(2026, 6, 'Médico', 4.2, 2),
	(2026, 6, 'Enfermagem / ACS', 3.8, 3),
	(2026, 6, 'Aux. administrativo', 3.2, 4),
	(2026, 6, 'Guarda municipal', 2.1, 5),
	(2026, 6, 'Demais cargos', 13.5, 6);

-- FP.orgaos: [orgao, servidores, bruta, encargos, custo, he, adicionais]
INSERT INTO orgaos (exercicio, competencia, orgao, servidores, bruta, encargos, custo_total, horas_extras, adicionais, ord) VALUES
	(2026, 6, 'Educação', 1850, 9.5, 2.3, 11.8, 0.18, 0.9, 1),
	(2026, 6, 'Saúde', 1120, 7.6, 1.9, 9.5, 0.52, 1.1, 2),
	(2026, 6, 'Administração', 520, 3.4, 0.8, 4.2, 0.10, 0.2, 3),
	(2026, 6, 'Infraestrutura e Obras', 430, 2.4, 0.6, 3.0, 0.28, 0.3, 4),
	(2026, 6, 'Assistência Social', 380, 1.8, 0.5, 2.3, 0.02, 0.1, 5),
	(2026, 6, 'Gabinete e Demais', 550, 3.6, 0.9, 4.5, 0.10, 0.2, 6);
