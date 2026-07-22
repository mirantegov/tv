-- api.siconfi — remonta PC.siconfi (data.ts). PostgREST: GET /siconfi → [{data:{…}}]
CREATE OR REPLACE VIEW api.siconfi AS
SELECT json_build_object(
	'cauc', json_build_object(
		'kpis', json_build_object(
			'regulares', cr.regulares, 'total', cr.total, 'pendentes', cr.pendentes,
			'situacao', cr.situacao, 'verificacao', to_char(cr.verificacao, 'DD/MM/YYYY')),
		'itens', (SELECT json_agg(json_build_array(exigencia, status) ORDER BY ord)
			FROM siconfi.cauc_itens WHERE exercicio = cr.exercicio AND verificacao = cr.verificacao)),
	'msc', json_build_object(
		-- kpis do MSC são constantes p/ Palotina (item desativado na UI)
		'kpis', json_build_object(
			'competencia', 'Mai/2026', 'status', 'Em dia',
			'consistencia', '100%', 'derivadas', 'RREO · RGF · DCA'),
		'remessas', (SELECT json_agg(json_build_array(
			api.mes_lbl(competencia) || '/2026',
			coalesce(to_char(envio, 'DD/MM/YYYY'), '—'),
			status,
			coalesce(round(consistencia_pct)::text || '%', '—'),
			situacao) ORDER BY competencia)
			FROM siconfi.msc_remessas WHERE exercicio = cr.exercicio),
		'declaracoes', (SELECT json_agg(json_build_array(declaracao, situacao, status) ORDER BY ord)
			FROM siconfi.declaracoes WHERE exercicio = cr.exercicio))
) AS data
FROM siconfi.cauc_resumo cr
ORDER BY cr.exercicio DESC, cr.verificacao DESC
LIMIT 1;
