-- api.despesa — remonta o export D (data.ts). PostgREST: GET /despesa → [{data:{…}}]
CREATE OR REPLACE VIEW api.despesa AS
SELECT json_build_object(
	'dotacao', r.dotacao_atualizada,
	'inicial', r.dotacao_inicial,
	'creditos', r.creditos_adicionais,
	'emp', r.empenhado,
	'liq', r.liquidado,
	'pago', r.pago,
	'restos', r.restos_processados,
	'saldo', r.saldo_a_empenhar,
	'funcoes', (SELECT coalesce(json_agg(json_build_array(funcao, empenhado, liquidado, pago) ORDER BY ord), '[]')
		FROM despesa.funcoes WHERE exercicio = r.exercicio),
	'gnd', (SELECT coalesce(json_agg(json_build_array(grupo, empenhado) ORDER BY ord), '[]')
		FROM despesa.gnd WHERE exercicio = r.exercicio),
	'meses', (SELECT coalesce(json_agg(json_build_array(api.mes_lbl(mes), empenhado_acum, liquidado_acum, pago_acum) ORDER BY mes), '[]')
		FROM despesa.mensal WHERE exercicio = r.exercicio),
	'orgaos', (SELECT coalesce(json_agg(json_build_array(orgao, dotacao, empenhado, pago) ORDER BY ord), '[]')
		FROM despesa.orgaos WHERE exercicio = r.exercicio),
	'gov', (SELECT coalesce(json_agg(json_build_array(indicador, aplicado_pct, escala_pct, limite_pct, rotulo, alerta_pct, situacao) ORDER BY ord), '[]')
		FROM despesa.limites WHERE exercicio = r.exercicio)
) AS data
FROM despesa.resumo r
ORDER BY r.exercicio DESC
LIMIT 1;
