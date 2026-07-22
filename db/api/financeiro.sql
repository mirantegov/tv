-- api.financeiro — remonta o export F (data.ts). PostgREST: GET /financeiro → [{data:{…}}]
CREATE OR REPLACE VIEW api.financeiro AS
SELECT json_build_object(
	'anterior', r.saldo_anterior,
	'bruta', r.disponibilidade_bruta,
	'obrig', r.obrigacoes,
	'liquida', r.disponibilidade_liquida,
	'ingressos', r.ingressos,
	'desembolsos', r.desembolsos,
	'resultado', r.resultado,
	'aplicacoes', r.aplicacoes,
	'rendimento', r.rendimento,
	-- F.liquidez = bruta / obrig (float, igual ao JS)
	'liquidez', r.disponibilidade_bruta::float8 / r.obrigacoes::float8,
	'fontes', (SELECT coalesce(json_agg(json_build_array(fonte, vinculada, bruta, obrigacoes, restos_pagar) ORDER BY ord), '[]')
		FROM financeiro.fontes WHERE exercicio = r.exercicio),
	'fluxo', (SELECT coalesce(json_agg(json_build_array(api.mes_lbl(mes), ingressos, desembolsos) ORDER BY mes), '[]')
		FROM financeiro.fluxo_mensal WHERE exercicio = r.exercicio),
	'evol', (SELECT coalesce(json_agg(json_build_array(api.mes_lbl(mes), disponibilidade_bruta, disponibilidade_liquida) ORDER BY mes), '[]')
		FROM financeiro.evolucao_mensal WHERE exercicio = r.exercicio),
	'bancos', (SELECT coalesce(json_agg(json_build_array(banco, saldo) ORDER BY ord), '[]')
		FROM financeiro.bancos WHERE exercicio = r.exercicio),
	'obrigacoes', (SELECT coalesce(json_agg(json_build_array(tipo, valor) ORDER BY ord), '[]')
		FROM financeiro.obrigacoes WHERE exercicio = r.exercicio),
	'pagamentos', (SELECT coalesce(json_agg(json_build_array(categoria, valor) ORDER BY ord), '[]')
		FROM financeiro.pagamentos WHERE exercicio = r.exercicio),
	'extra', (SELECT coalesce(json_agg(json_build_array(tipo, retido, recolhido) ORDER BY ord), '[]')
		FROM financeiro.extraorcamentario WHERE exercicio = r.exercicio)
) AS data
FROM financeiro.resumo r
ORDER BY r.exercicio DESC
LIMIT 1;
