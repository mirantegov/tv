-- api.receita_comp — remonta CR (data.ts), incluindo a árvore `arvore` (v25×v26).
-- SECURITY DEFINER: roda como dono (mirante) p/ ler o schema, como as views.
CREATE OR REPLACE FUNCTION api.recomp_tree(p text) RETURNS json
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = pg_catalog AS $$
DECLARE r json;
BEGIN
	SELECT json_agg(node ORDER BY o) INTO r FROM (
		SELECT array_position(ARRAY['rc','rct','iss','iptu','itbi','tx','cos',
			'rtr','fpm','icms','fdb','sus','ipva','fnde','rpa','rou','rco','rcap'], a.id) AS o,
			json_strip_nulls(json_build_object(
				'id', a.id, 'nome', a.nome,
				'v25', (SELECT arrecadado FROM receita_comparativo.arvore WHERE exercicio = 2025 AND id = a.id),
				'v26', a.arrecadado,
				'children', api.recomp_tree(a.id)
			)) AS node
		FROM receita_comparativo.arvore a
		WHERE a.exercicio = 2026 AND a.parent_id IS NOT DISTINCT FROM p
	) s;
	RETURN r;
END $$;

CREATE OR REPLACE VIEW api.receita_comp AS
SELECT json_build_object(
	'arr25', (SELECT arrecadada FROM receita_comparativo.totais WHERE exercicio = 2025),
	'arr26', (SELECT arrecadada FROM receita_comparativo.totais WHERE exercicio = 2026),
	'trib25', (SELECT tributaria FROM receita_comparativo.totais WHERE exercicio = 2025),
	'trib26', (SELECT tributaria FROM receita_comparativo.totais WHERE exercicio = 2026),
	'transf25', (SELECT transferencias FROM receita_comparativo.totais WHERE exercicio = 2025),
	'transf26', (SELECT transferencias FROM receita_comparativo.totais WHERE exercicio = 2026),
	'evol', (SELECT json_agg(json_build_array(exercicio::text, arrecadada) ORDER BY exercicio)
		FROM receita_comparativo.totais),
	'meses', (SELECT json_agg(json_build_array(api.mes_lbl(mes), v25, v26) ORDER BY mes) FROM (
		SELECT mes,
			max(arrecadado) FILTER (WHERE exercicio = 2025) AS v25,
			max(arrecadado) FILTER (WHERE exercicio = 2026) AS v26
		FROM receita_comparativo.mensal GROUP BY mes) m),
	'origem', (SELECT json_agg(json_build_array(origem, v25, v26) ORDER BY o) FROM (
		SELECT origem,
			array_position(ARRAY['Transferências Correntes','Receita Tributária','Receita Patrimonial','Outras Rec. Correntes','Receita de Serviços','Contribuições','Receita de Capital'], origem) AS o,
			max(arrecadado) FILTER (WHERE exercicio = 2025) AS v25,
			max(arrecadado) FILTER (WHERE exercicio = 2026) AS v26
		FROM receita_comparativo.origens GROUP BY origem) og),
	'arvore', api.recomp_tree(NULL)
) AS data;
