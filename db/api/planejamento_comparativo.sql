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

-- Monta um PlanEntComp (CP.{pref|camara|prev|san}) das linhas filtradas por entidade.
-- evol = totais.orcamento por ano; rec/desp de totais(25/26); res = rec - desp;
-- grupo de grupos; vinc de vinculacoes. Ordem de grupo/vinc idêntica ao data.ts.
CREATE OR REPLACE FUNCTION api.plancomp_ent(p_ent text) RETURNS json
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = pg_catalog AS $$
DECLARE
	og text[];  -- ordem dos grupos (por entidade)
	ov text[];  -- ordem das vinculações (por entidade)
BEGIN
	og := CASE p_ent
		WHEN 'pref' THEN ARRAY['Pessoal','Custeio','Investimentos','Transferências','Encargos']
		WHEN 'camara' THEN ARRAY['Pessoal','Custeio','Investimentos']
		WHEN 'prev' THEN ARRAY['Aposentadorias','Pensões','Auxílios','Adm.']
		WHEN 'san' THEN ARRAY['Custeio','Investimentos','Pessoal']
	END;
	ov := CASE p_ent
		WHEN 'pref' THEN ARRAY['Pessoal (LRF)','Saúde (ASPS)','Educação (MDE)']
		WHEN 'camara' THEN ARRAY['Folha (CF 29-A)','Duodécimo (% RLA)']
		WHEN 'prev' THEN ARRAY['Taxa de Administração']
		WHEN 'san' THEN ARRAY[]::text[]
	END;
	RETURN json_build_object(
		'recA', (SELECT receita FROM planejamento_comparativo.totais WHERE exercicio = 2025 AND entidade = p_ent),
		'recB', (SELECT receita FROM planejamento_comparativo.totais WHERE exercicio = 2026 AND entidade = p_ent),
		'despA', (SELECT despesa FROM planejamento_comparativo.totais WHERE exercicio = 2025 AND entidade = p_ent),
		'despB', (SELECT despesa FROM planejamento_comparativo.totais WHERE exercicio = 2026 AND entidade = p_ent),
		'resA', (SELECT receita - despesa FROM planejamento_comparativo.totais WHERE exercicio = 2025 AND entidade = p_ent),
		'resB', (SELECT receita - despesa FROM planejamento_comparativo.totais WHERE exercicio = 2026 AND entidade = p_ent),
		'evol', (SELECT json_agg(json_build_array(exercicio::text, orcamento) ORDER BY exercicio)
			FROM planejamento_comparativo.totais WHERE entidade = p_ent),
		'grupo', (SELECT json_agg(json_build_array(grupo, a, b) ORDER BY o) FROM (
			SELECT grupo,
				array_position(og, grupo) AS o,
				max(valor) FILTER (WHERE exercicio = 2025) AS a,
				max(valor) FILTER (WHERE exercicio = 2026) AS b
			FROM planejamento_comparativo.grupos WHERE entidade = p_ent GROUP BY grupo) g),
		'vinc', COALESCE((SELECT json_agg(json_build_object('nome', nome, 'a', a, 'b', b, 'limite', limite) ORDER BY o) FROM (
			SELECT nome,
				array_position(ov, nome) AS o,
				max(valor) FILTER (WHERE exercicio = 2025) AS a,
				max(valor) FILTER (WHERE exercicio = 2026) AS b,
				max(limite) FILTER (WHERE exercicio = 2026) AS limite
			FROM planejamento_comparativo.vinculacoes WHERE entidade = p_ent GROUP BY nome) v), '[]'::json)
	);
END $$;

CREATE OR REPLACE VIEW api.planejamento_comp AS
SELECT json_build_object(
	'anoA', 2025,
	'anoB', 2026,
	'orcA', (SELECT orcamento FROM planejamento_comparativo.totais WHERE exercicio = 2025 AND entidade = 'integral'),
	'orcB', (SELECT orcamento FROM planejamento_comparativo.totais WHERE exercicio = 2026 AND entidade = 'integral'),
	'recA', (SELECT receita FROM planejamento_comparativo.totais WHERE exercicio = 2025 AND entidade = 'integral'),
	'recB', (SELECT receita FROM planejamento_comparativo.totais WHERE exercicio = 2026 AND entidade = 'integral'),
	'despA', (SELECT despesa FROM planejamento_comparativo.totais WHERE exercicio = 2025 AND entidade = 'integral'),
	'despB', (SELECT despesa FROM planejamento_comparativo.totais WHERE exercicio = 2026 AND entidade = 'integral'),
	'evol', (SELECT json_agg(json_build_array(exercicio::text, orcamento) ORDER BY exercicio)
		FROM planejamento_comparativo.totais WHERE entidade = 'integral'),
	'vinc', (SELECT json_agg(json_build_object('nome', nome, 'a', a, 'b', b, 'limite', limite) ORDER BY o) FROM (
		SELECT nome,
			array_position(ARRAY['Pessoal (LRF)','Saúde (ASPS)','Educação (MDE)'], nome) AS o,
			max(valor) FILTER (WHERE exercicio = 2025) AS a,
			max(valor) FILTER (WHERE exercicio = 2026) AS b,
			max(limite) FILTER (WHERE exercicio = 2026) AS limite
		FROM planejamento_comparativo.vinculacoes WHERE entidade = 'integral' GROUP BY nome) v),
	'entidades', (SELECT json_agg(json_build_array(entidade, v25, v26) ORDER BY o) FROM (
		SELECT entidade,
			array_position(ARRAY['Prefeitura','Câmara','RPPS/Previdência','Saneamento'], entidade) AS o,
			max(valor) FILTER (WHERE exercicio = 2025) AS v25,
			max(valor) FILTER (WHERE exercicio = 2026) AS v26
		FROM planejamento_comparativo.entidades GROUP BY entidade) e),
	'arvore', api.plancomp_tree(NULL),
	'totA', (SELECT despesa FROM planejamento_comparativo.totais WHERE exercicio = 2025 AND entidade = 'integral'),
	'totB', (SELECT despesa FROM planejamento_comparativo.totais WHERE exercicio = 2026 AND entidade = 'integral'),
	'pref', api.plancomp_ent('pref'),
	'camara', api.plancomp_ent('camara'),
	'prev', api.plancomp_ent('prev'),
	'san', api.plancomp_ent('san')
) AS data;
