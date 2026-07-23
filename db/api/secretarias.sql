-- api.secretarias — remonta o export SEC (data.ts): objeto { <slug>: {…8 KPIs} }.
-- PostgREST: GET /secretarias → [{ data: { "saude": {…}, "educacao": {…}, … } }]
-- Usa o exercício mais recente presente na tabela.
CREATE OR REPLACE VIEW api.secretarias AS
SELECT json_object_agg(
	r.secretaria,
	json_build_object(
		'dotacao', r.dotacao_atualizada,
		'inicial', r.dotacao_inicial,
		'creditos', r.creditos_adicionais,
		'emp', r.empenhado,
		'liq', r.liquidado,
		'pago', r.pago,
		'restos', r.restos,
		'saldo', r.saldo_a_empenhar
	)
) AS data
FROM secretarias.resumo r
WHERE r.exercicio = (SELECT max(exercicio) FROM secretarias.resumo);
