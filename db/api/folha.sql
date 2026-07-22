-- api.folha — remonta o export FP (data.ts). PostgREST: GET /folha → [{data:{…}}]
CREATE OR REPLACE VIEW api.folha AS
SELECT json_build_object(
	'custoTotal', r.custo_total,
	'custoMesAnt', (SELECT custo_total FROM folha.resumo
		WHERE exercicio = r.exercicio AND competencia = r.competencia - 1),
	'bruta', r.bruta,
	'liquida', r.liquida,
	'encargos', r.encargos,
	'he', r.horas_extras,
	'hePct', r.horas_extras_pct,
	'adicionais', r.adicionais,
	'custoMedio', 'R$ ' || replace(to_char(r.custo_medio, 'FM990.0'), '.', ',') || ' mil',
	'headcount', r.headcount,
	'inativos', r.inativos,
	'inativosCusto', r.inativos_custo,
	'lrf', (SELECT json_build_object(
		'pct', pct, 'bruta12', bruta_12m, 'deducoes', deducoes,
		'liquida12', liquida_12m, 'rcl12', rcl_12m, 'alerta', alerta_pct,
		'prudencial', prudencial_pct, 'limite', limite_pct,
		'margemRs', margem_valor, 'margemPp', margem_pp)
		FROM folha.lrf WHERE exercicio = r.exercicio AND competencia = r.competencia),
	'evol', (SELECT json_agg(json_build_array(api.mes_lbl(competencia), bruta, liquida, encargos) ORDER BY competencia)
		FROM folha.resumo WHERE exercicio = r.exercicio),
	'composicao', (SELECT json_agg(json_build_array(componente, valor) ORDER BY ord)
		FROM folha.composicao WHERE exercicio = r.exercicio AND competencia = r.competencia),
	'vinculo', (SELECT json_agg(json_build_array(vinculo, valor) ORDER BY valor DESC)
		FROM folha.vinculos WHERE exercicio = r.exercicio AND competencia = r.competencia),
	'heOrgao', (SELECT json_agg(json_build_array(orgao, valor) ORDER BY valor DESC)
		FROM folha.he_orgao WHERE exercicio = r.exercicio AND competencia = r.competencia),
	'heTrend', (SELECT json_agg(json_build_array(api.mes_lbl(competencia), horas_extras) ORDER BY competencia)
		FROM folha.resumo WHERE exercicio = r.exercicio),
	'adic', (SELECT json_agg(json_build_array(tipo, valor) ORDER BY valor DESC, ord)
		FROM folha.adicionais WHERE exercicio = r.exercicio AND competencia = r.competencia),
	'cargos', (SELECT json_agg(json_build_array(cargo, valor) ORDER BY ord)
		FROM folha.cargos WHERE exercicio = r.exercicio AND competencia = r.competencia),
	'orgaos', (SELECT json_agg(json_build_array(orgao, servidores, bruta, encargos, custo_total, horas_extras, adicionais) ORDER BY ord)
		FROM folha.orgaos WHERE exercicio = r.exercicio AND competencia = r.competencia),
	'adicDet', (SELECT json_agg(json_build_array(tipo, beneficiarios, valor) ORDER BY ord)
		FROM folha.adicionais WHERE exercicio = r.exercicio AND competencia = r.competencia)
) AS data
FROM folha.resumo r
ORDER BY r.exercicio DESC, r.competencia DESC
LIMIT 1;
