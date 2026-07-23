-- Seed Secretarias — Município de Palotina (IBGE 4117909), exercício 2026 (Jun).
-- Provisório: mesmos valores do módulo Despesa p/ todas as secretarias. O
-- Warehouse substitui por dados oficiais por secretaria depois. Fonte = data.ts SEC.
SET search_path TO secretarias;

INSERT INTO resumo (exercicio, secretaria, competencia, dotacao_atualizada,
	dotacao_inicial, creditos_adicionais, empenhado, liquidado, pago, restos,
	saldo_a_empenhar)
SELECT 2026, s, 6, 850, 780, 70, 470.1, 410.2, 384.3, 95.4, 379.9
FROM unnest(ARRAY[
	'administracao', 'financas', 'planejamento', 'obras', 'agronegocio',
	'saude', 'assistencia-social', 'educacao', 'industria', 'esportes',
	'gabinete', 'controladoria', 'urbanismo', 'desenvolvimento-economico',
	'transito', 'seguranca', 'meio-ambiente'
]) AS s;
