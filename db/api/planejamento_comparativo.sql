-- api.planejamento_comp — remonta CP (data.ts) a partir das tabelas normalizadas,
-- incluindo a árvore de despesa fixada (v25×v26). Mesmo contrato dos demais
-- comparativos: PostgREST GET /planejamento_comp → [{ data: <PlanComp> }].
-- SECURITY DEFINER: roda como dono p/ ler o schema, como api.recomp_tree.
CREATE OR REPLACE FUNCTION api.plancomp_tree(p text) RETURNS json
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = pg_catalog AS $$
DECLARE r json;
BEGIN
	SELECT json_agg(node ORDER BY o) INTO r FROM (
		SELECT array_position(ARRAY['edu','ef','ei','es','sau','ab','ah','vs',
			'adm','prev','urb','leg','enc'], a.id) AS o,
			json_strip_nulls(json_build_object(
				'id', a.id, 'nome', a.nome,
				'v25', (SELECT valor FROM planejamento_comparativo.arvore WHERE exercicio = 2025 AND id = a.id),
				'v26', a.valor,
				'children', api.plancomp_tree(a.id)
			)) AS node
		FROM planejamento_comparativo.arvore a
		WHERE a.exercicio = 2026 AND a.parent_id IS NOT DISTINCT FROM p
	) s;
	RETURN r;
END $$;

CREATE OR REPLACE VIEW api.planejamento_comp AS
SELECT json_build_object(
	'anoA', 2025,
	'anoB', 2026,
	'orcA', (SELECT orcamento FROM planejamento_comparativo.totais WHERE exercicio = 2025),
	'orcB', (SELECT orcamento FROM planejamento_comparativo.totais WHERE exercicio = 2026),
	'recA', (SELECT receita FROM planejamento_comparativo.totais WHERE exercicio = 2025),
	'recB', (SELECT receita FROM planejamento_comparativo.totais WHERE exercicio = 2026),
	'despA', (SELECT despesa FROM planejamento_comparativo.totais WHERE exercicio = 2025),
	'despB', (SELECT despesa FROM planejamento_comparativo.totais WHERE exercicio = 2026),
	'evol', (SELECT json_agg(json_build_array(exercicio::text, orcamento) ORDER BY exercicio)
		FROM planejamento_comparativo.totais),
	'vinc', (SELECT json_agg(json_build_object('nome', nome, 'a', a, 'b', b, 'limite', limite) ORDER BY o) FROM (
		SELECT nome,
			array_position(ARRAY['Pessoal (LRF)','Saúde (ASPS)','Educação (MDE)'], nome) AS o,
			max(valor) FILTER (WHERE exercicio = 2025) AS a,
			max(valor) FILTER (WHERE exercicio = 2026) AS b,
			max(limite) FILTER (WHERE exercicio = 2026) AS limite
		FROM planejamento_comparativo.vinculacoes GROUP BY nome) v),
	'entidades', (SELECT json_agg(json_build_array(entidade, v25, v26) ORDER BY o) FROM (
		SELECT entidade,
			array_position(ARRAY['Prefeitura','Câmara','RPPS/Previdência','Saneamento'], entidade) AS o,
			max(valor) FILTER (WHERE exercicio = 2025) AS v25,
			max(valor) FILTER (WHERE exercicio = 2026) AS v26
		FROM planejamento_comparativo.entidades GROUP BY entidade) e),
	'arvore', api.plancomp_tree(NULL),
	'totA', (SELECT despesa FROM planejamento_comparativo.totais WHERE exercicio = 2025),
	'totB', (SELECT despesa FROM planejamento_comparativo.totais WHERE exercicio = 2026)
) AS data;
