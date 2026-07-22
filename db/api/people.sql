-- api.people — remonta o export PA (data.ts). PostgREST: GET /people → [{data:{…}}]
CREATE OR REPLACE VIEW api.people AS
SELECT json_build_object(
	'headcount', r.headcount,
	'total', r.total,
	'inativos', r.inativos,
	'turnover', r.turnover_pct,
	'absenteismo', r.absenteismo_pct,
	'tempoMedio', r.tempo_medio_anos,
	'elegiveis', r.elegiveis,
	'elegiveisPct', r.elegiveis_pct,
	'idadeMedia', r.idade_media,
	'cobertura', r.cobertura_pct,
	'providos', r.providos,
	'autorizados', r.autorizados,
	'razaoCom', r.razao_comissionados_pct,
	'piramide', (SELECT coalesce(json_agg(json_build_array(faixa, masculino, feminino) ORDER BY faixa), '[]')
		FROM people.piramide WHERE exercicio = r.exercicio),
	'orgaos', (SELECT coalesce(json_agg(json_build_array(orgao, headcount) ORDER BY headcount DESC), '[]')
		FROM people.orgaos WHERE exercicio = r.exercicio),
	'vinculo', (SELECT coalesce(json_agg(json_build_array(vinculo, servidores) ORDER BY servidores DESC), '[]')
		FROM people.vinculos WHERE exercicio = r.exercicio),
	'mov', (SELECT coalesce(json_agg(json_build_array(api.mes_lbl(mes), admissoes, desligamentos) ORDER BY mes), '[]')
		FROM people.movimentacao WHERE exercicio = r.exercicio),
	'absent', (SELECT coalesce(json_agg(json_build_array(motivo, dias) ORDER BY dias DESC), '[]')
		FROM people.absenteismo WHERE exercicio = r.exercicio),
	'tempo', (SELECT coalesce(json_agg(json_build_array(faixa, servidores) ORDER BY ord), '[]')
		FROM people.tempo_servico WHERE exercicio = r.exercicio),
	'escolaridade', (SELECT coalesce(json_agg(json_build_array(nivel, servidores) ORDER BY servidores DESC), '[]')
		FROM people.escolaridade WHERE exercicio = r.exercicio),
	'elegCurva', (SELECT coalesce(json_agg(json_build_array(ano::text, elegiveis) ORDER BY ano), '[]')
		FROM people.elegiveis_projecao),
	'quadro', (SELECT coalesce(json_agg(json_build_array(orgao, headcount, efetivos, comissionados, temporarios, vagas_autorizadas, idade_media) ORDER BY ord), '[]')
		FROM people.quadro WHERE exercicio = r.exercicio),
	'sucessao', (SELECT coalesce(json_agg(json_build_array(carreira, elegiveis_hoje, elegiveis_5anos, pct_do_cargo) ORDER BY ord), '[]')
		FROM people.sucessao WHERE exercicio = r.exercicio)
) AS data
FROM people.resumo r
ORDER BY r.exercicio DESC
LIMIT 1;
