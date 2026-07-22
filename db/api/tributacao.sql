-- api.tributacao — remonta o export TB (data.ts). PostgREST: GET /tributacao → [{data:{…}}]
CREATE OR REPLACE VIEW api.tributacao AS
SELECT json_build_object(
	'propria', r.receita_propria,
	'propriaPart', r.receita_propria_pct,
	'iptuLanc', r.iptu_lancado,
	'iptuArr', r.iptu_arrecadado,
	'iptuAdimp', r.iptu_adimplencia_pct,
	'issArr', r.iss_arrecadado,
	'issYoY', r.iss_yoy_pct,
	'itbiArr', r.itbi_arrecadado,
	'itbiTransm', r.itbi_transmissoes,
	'daSaldo', r.divida_ativa_saldo,
	'daRecPct', r.divida_ativa_rec_pct,
	'inadVencida', r.inadimplencia_vencida,
	'renuncia', r.renuncia,
	'cotaUnica', r.cota_unica_pct,
	'tributos', (SELECT coalesce(json_agg(json_build_array(tributo, lancado, arrecadado, inadimplencia_vencida, recuperado_divida_ativa) ORDER BY ord), '[]')
		FROM tributacao.tributos WHERE exercicio = r.exercicio),
	'da', (SELECT coalesce(json_agg(json_build_array(tributo, saldo_inicial, inscricoes, recuperado, cancelado, ajuizado_pct) ORDER BY ord), '[]')
		FROM tributacao.divida_ativa WHERE exercicio = r.exercicio),
	'meses', (SELECT coalesce(json_agg(json_build_array(api.mes_lbl(mes), iptu, iss, itbi) ORDER BY mes), '[]')
		FROM tributacao.mensal WHERE exercicio = r.exercicio),
	'setores', (SELECT coalesce(json_agg(json_build_array(setor, arrecadado) ORDER BY ord), '[]')
		FROM tributacao.setores_iss WHERE exercicio = r.exercicio),
	'bairros', (SELECT coalesce(json_agg(json_build_array(bairro, arrecadado, inadimplencia) ORDER BY arrecadado DESC), '[]')
		FROM tributacao.bairros WHERE exercicio = r.exercicio),
	'devedores', (SELECT coalesce(json_agg(json_build_array(contribuinte, tributo, situacao, valor) ORDER BY ord), '[]')
		FROM tributacao.devedores WHERE exercicio = r.exercicio),
	'renuncias', (SELECT coalesce(json_agg(json_build_array(descricao, tributo, valor, base_legal) ORDER BY valor DESC), '[]')
		FROM tributacao.renuncias WHERE exercicio = r.exercicio)
) AS data
FROM tributacao.resumo r
ORDER BY r.exercicio DESC
LIMIT 1;
