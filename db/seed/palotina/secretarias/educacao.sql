-- Seed Secretaria: Educação — Palotina (IBGE 4117909), exercício 2026 (Jun).
-- Provisório: mesmos valores do módulo Despesa. Warehouse substitui por dados
-- oficiais desta secretaria depois. Arquivo próprio p/ divergir sem afetar as outras.
SET search_path TO secretarias;

INSERT INTO resumo (exercicio, secretaria, competencia, dotacao_atualizada,
	dotacao_inicial, creditos_adicionais, empenhado, liquidado, pago, restos,
	saldo_a_empenhar)
VALUES (2026, 'educacao', 6, 850, 780, 70, 470.1, 410.2, 384.3, 95.4, 379.9);
