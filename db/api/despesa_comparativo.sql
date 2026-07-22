-- api.despesa_comp — remonta CD (data.ts), incluindo a árvore `arvore` (v25×v26).
-- SECURITY DEFINER: roda como dono (mirante) p/ ler o schema, como as views.
CREATE OR REPLACE FUNCTION api.despcomp_tree(p text) RETURNS json
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = pg_catalog AS $$
DECLARE r json;
BEGIN
	SELECT json_agg(node ORDER BY o) INTO r FROM (
		SELECT array_position(ARRAY['f10','f10a','f10a1','f10a2','f10b','f10b1',
			'f10b2','f10c','f12','f12a','f12a1','f12a2','f12b','f12b1','f12b2',
			'f12c','f04','f15','f09','fxx'], a.id) AS o,
			json_strip_nulls(json_build_object(
				'id', a.id, 'nome', a.nome,
				'v25', (SELECT empenhado FROM despesa_comparativo.arvore WHERE exercicio = 2025 AND id = a.id),
				'v26', a.empenhado,
				'children', api.despcomp_tree(a.id)
			)) AS node
		FROM despesa_comparativo.arvore a
		WHERE a.exercicio = 2026 AND a.parent_id IS NOT DISTINCT FROM p
	) s;
	RETURN r;
END $$;

CREATE OR REPLACE VIEW api.despesa_comp AS
SELECT json_build_object(
	'emp25', (SELECT empenhado FROM despesa_comparativo.totais WHERE exercicio = 2025),
	'emp26', (SELECT empenhado FROM despesa_comparativo.totais WHERE exercicio = 2026),
	'liq25', (SELECT liquidado FROM despesa_comparativo.totais WHERE exercicio = 2025),
	'liq26', (SELECT liquidado FROM despesa_comparativo.totais WHERE exercicio = 2026),
	'pago25', (SELECT pago FROM despesa_comparativo.totais WHERE exercicio = 2025),
	'pago26', (SELECT pago FROM despesa_comparativo.totais WHERE exercicio = 2026),
	'meses', (SELECT json_agg(json_build_array(api.mes_lbl(mes), v25, v26) ORDER BY mes) FROM (
		SELECT mes,
			max(empenhado) FILTER (WHERE exercicio = 2025) AS v25,
			max(empenhado) FILTER (WHERE exercicio = 2026) AS v26
		FROM despesa_comparativo.mensal GROUP BY mes) m),
	'func', (SELECT json_agg(json_build_array(funcao, v25, v26) ORDER BY o) FROM (
		SELECT funcao,
			array_position(ARRAY['Saúde','Educação','Administração','Urbanismo','Previdência','Assistência','Enc. Especiais','Demais'], funcao) AS o,
			max(empenhado) FILTER (WHERE exercicio = 2025) AS v25,
			max(empenhado) FILTER (WHERE exercicio = 2026) AS v26
		FROM despesa_comparativo.funcoes GROUP BY funcao) f),
	'arvore', api.despcomp_tree(NULL)
) AS data;
