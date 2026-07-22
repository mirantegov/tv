-- api.planejamento — remonta o export PLAN (data.ts). PostgREST: GET /planejamento → [{data:{…}}]
CREATE OR REPLACE VIEW api.planejamento AS
SELECT json_build_object(
	'ano', r.exercicio,
	'consolidado', r.consolidado,
	'somaEntidades', r.soma_entidades,
	'intra', r.intra,
	'nEntidades', r.n_entidades,
	'entidades', (SELECT coalesce(json_agg(json_build_array(entidade, receita_prevista, despesa_fixada, receita_propria, modelo_financiamento) ORDER BY receita_prevista DESC), '[]')
		FROM planejamento.entidades WHERE exercicio = r.exercicio),
	'intraDet', (SELECT coalesce(json_agg(json_build_array(descricao, valor) ORDER BY ord), '[]')
		FROM planejamento.intra WHERE exercicio = r.exercicio),
	'consolNatureza', (SELECT coalesce(json_agg(json_build_array(grupo, valor) ORDER BY valor DESC), '[]')
		FROM planejamento.consolidado_natureza WHERE exercicio = r.exercicio),
	'pref', (SELECT json_build_object(
		'receita', p.receita,
		'despesa', p.despesa,
		'propria', p.propria,
		'transfCorr', p.transf_corr,
		'capital', p.capital,
		'pessoal', p.pessoal,
		'investimentos', p.investimentos,
		'transferir', p.a_transferir,
		'receitaOrigem', (SELECT coalesce(json_agg(json_build_array(item, valor) ORDER BY ord), '[]')
			FROM planejamento.prefeitura_aberturas WHERE exercicio = r.exercicio AND dimensao = 'receita_origem'),
		'despesaGrupo', (SELECT coalesce(json_agg(json_build_array(item, valor) ORDER BY ord), '[]')
			FROM planejamento.prefeitura_aberturas WHERE exercicio = r.exercicio AND dimensao = 'despesa_grupo'),
		'funcao', (SELECT coalesce(json_agg(json_build_array(item, valor) ORDER BY ord), '[]')
			FROM planejamento.prefeitura_aberturas WHERE exercicio = r.exercicio AND dimensao = 'funcao'),
		'repasses', (SELECT coalesce(json_agg(json_build_array(item, valor) ORDER BY ord), '[]')
			FROM planejamento.prefeitura_aberturas WHERE exercicio = r.exercicio AND dimensao = 'repasses'),
		'vinc', json_build_object(
			'pessoal', (SELECT json_build_object('valor', valor, 'pctOrc', pct_orc, 'limite', limite_pct, 'scale', escala_pct, 'base', base_legal)
				FROM planejamento.vinculacoes WHERE exercicio = r.exercicio AND indicador = 'pessoal'),
			'saude', (SELECT json_build_object('valor', valor, 'pctOrc', pct_orc, 'limite', limite_pct, 'scale', escala_pct, 'base', base_legal)
				FROM planejamento.vinculacoes WHERE exercicio = r.exercicio AND indicador = 'saude'),
			'educacao', (SELECT json_build_object('valor', valor, 'pctOrc', pct_orc, 'limite', limite_pct, 'scale', escala_pct, 'base', base_legal)
				FROM planejamento.vinculacoes WHERE exercicio = r.exercicio AND indicador = 'educacao'))
		) FROM planejamento.prefeitura p WHERE p.exercicio = r.exercicio),
	'camara', (SELECT json_build_object(
		'receita', c.receita,
		'propria', c.propria,
		'despesa', c.despesa,
		'folha', c.folha,
		'grupo', (SELECT coalesce(json_agg(json_build_array(grupo, valor) ORDER BY valor DESC), '[]')
			FROM planejamento.camara_grupos WHERE exercicio = r.exercicio),
		'folhaPct', c.folha_pct,
		'folhaLimite', c.folha_limite,
		'duodecimoPct', c.duodecimo_pct,
		'duodecimoBase', c.duodecimo_base,
		'populacao', c.populacao,
		'faixaIdx', c.faixa_idx,
		'faixas29A', (SELECT coalesce(json_agg(json_build_array(faixa, limite_pct) ORDER BY ordem), '[]')
			FROM planejamento.faixas_29a)
		) FROM planejamento.camara c WHERE c.exercicio = r.exercicio),
	'prevTaxa', (SELECT json_build_object(
		'despAdm', despesa_adm, 'taxaAdmBase', taxa_adm_base, 'taxaAdmPct', taxa_adm_pct, 'taxaAdmLimite', taxa_adm_limite)
		FROM planejamento.previdencia WHERE exercicio = r.exercicio),
	'prev', (SELECT json_build_object(
		'recPrev', pv.receita_prev,
		'despPrev', pv.despesa_prev,
		'resultado', pv.resultado,
		'recAdm', pv.receita_adm,
		'despAdm', pv.despesa_adm,
		'recOrigem', (SELECT coalesce(json_agg(json_build_array(item, valor) ORDER BY valor DESC), '[]')
			FROM planejamento.previdencia_aberturas WHERE exercicio = r.exercicio AND dimensao = 'receita_origem'),
		'beneficios', (SELECT coalesce(json_agg(json_build_array(item, valor) ORDER BY valor DESC), '[]')
			FROM planejamento.previdencia_aberturas WHERE exercicio = r.exercicio AND dimensao = 'beneficios')
		) FROM planejamento.previdencia pv WHERE pv.exercicio = r.exercicio),
	'san', (SELECT json_build_object(
		'receita', s.receita,
		'despesa', s.despesa,
		'resultado', s.resultado,
		'investimentos', s.investimentos,
		'recOrigem', (SELECT coalesce(json_agg(json_build_array(item, valor) ORDER BY valor DESC), '[]')
			FROM planejamento.saneamento_aberturas WHERE exercicio = r.exercicio AND dimensao = 'receita_origem'),
		'grupo', (SELECT coalesce(json_agg(json_build_array(item, valor) ORDER BY valor DESC), '[]')
			FROM planejamento.saneamento_aberturas WHERE exercicio = r.exercicio AND dimensao = 'despesa_grupo')
		) FROM planejamento.saneamento s WHERE s.exercicio = r.exercicio)
) AS data
FROM planejamento.resumo r
ORDER BY r.exercicio DESC
LIMIT 1;
