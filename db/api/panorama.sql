-- api.panorama — remonta o export PAN (data.ts). PostgREST: GET /panorama → [{data:{…}}]
-- Cada grupo é montado por json_object_agg(indicador → PanIndicador); o campo `ibge`
-- só aparece quando fonte_ibge=true (shape exato do mock). Escalares de grupo
-- (rankUf, rankPibUf, bioma, hierarquia) vêm de panorama.resumo.
CREATE OR REPLACE VIEW api.panorama AS
SELECT json_build_object(
	'municipio', m.nome,
	'uf', m.uf,
	'gentilico', m.gentilico,
	'codigo', m.codigo_ibge,
	'populacao', (SELECT json_object_agg(indicador,
			CASE WHEN fonte_ibge THEN json_build_object('v', valor, 'ano', ano, 'ibge', true)
			     ELSE json_build_object('v', valor, 'ano', ano) END)::jsonb
		FROM panorama.indicadores WHERE codigo_ibge = r.codigo_ibge AND grupo = 'populacao')
		|| jsonb_build_object('rankUf', r.pop_rank_uf),
	'trabalho', (SELECT json_object_agg(indicador,
			CASE WHEN fonte_ibge THEN json_build_object('v', valor, 'ano', ano, 'ibge', true)
			     ELSE json_build_object('v', valor, 'ano', ano) END)
		FROM panorama.indicadores WHERE codigo_ibge = r.codigo_ibge AND grupo = 'trabalho'),
	'educacao', (SELECT json_object_agg(indicador,
			CASE WHEN fonte_ibge THEN json_build_object('v', valor, 'ano', ano, 'ibge', true)
			     ELSE json_build_object('v', valor, 'ano', ano) END)
		FROM panorama.indicadores WHERE codigo_ibge = r.codigo_ibge AND grupo = 'educacao'),
	'economia', (SELECT json_object_agg(indicador,
			CASE WHEN fonte_ibge THEN json_build_object('v', valor, 'ano', ano, 'ibge', true)
			     ELSE json_build_object('v', valor, 'ano', ano) END)::jsonb
		FROM panorama.indicadores WHERE codigo_ibge = r.codigo_ibge AND grupo = 'economia')
		|| jsonb_build_object('rankPibUf', r.eco_rank_pib_uf),
	'saude', (SELECT json_object_agg(indicador,
			CASE WHEN fonte_ibge THEN json_build_object('v', valor, 'ano', ano, 'ibge', true)
			     ELSE json_build_object('v', valor, 'ano', ano) END)
		FROM panorama.indicadores WHERE codigo_ibge = r.codigo_ibge AND grupo = 'saude'),
	'territorio', (SELECT json_object_agg(indicador,
			CASE WHEN fonte_ibge THEN json_build_object('v', valor, 'ano', ano, 'ibge', true)
			     ELSE json_build_object('v', valor, 'ano', ano) END)::jsonb
		FROM panorama.indicadores WHERE codigo_ibge = r.codigo_ibge AND grupo = 'territorio')
		|| jsonb_build_object('bioma', r.ter_bioma, 'hierarquia', r.ter_hierarquia),
	'idhm', (SELECT CASE WHEN fonte_ibge
			THEN json_build_object('v', valor, 'ano', ano, 'ibge', true, 'faixa', complemento)
			ELSE json_build_object('v', valor, 'ano', ano, 'faixa', complemento) END
		FROM panorama.indicadores WHERE codigo_ibge = r.codigo_ibge AND grupo = 'idhm'),
	-- PAN.tce — bloco fiscal do TCE-PR. NULL quando não há linha p/ o tenant
	-- (mantém compatível a rota; o front esconde o bloco quando tce = null).
	'tce', (SELECT json_build_object(
			'gestor', tr.gestor,
			'exercicio', tr.exercicio,
			'referencia', tr.referencia,
			'ultimoEnvio', to_char(tr.ultimo_envio, 'DD/MM/YYYY'),
			'mesConsolidado', tr.mes_consolidado,
			'processosTotal', tr.processos_total,
			'processos', (SELECT json_agg(json_build_array(orgao, qtde) ORDER BY ord)
				FROM panorama.tce_processos WHERE exercicio = tr.exercicio),
			'certidao', json_build_object(
				'numero', tr.cert_numero,
				'emissao', to_char(tr.cert_emissao, 'DD/MM/YYYY'),
				'validade', to_char(tr.cert_validade, 'DD/MM/YYYY')),
			'obras', (SELECT json_agg(json_build_array(status, valor, qtde, tone) ORDER BY ord)
				FROM panorama.tce_obras WHERE exercicio = tr.exercicio),
			'previsao', json_build_object(
				'loa', tr.prev_loa,
				'receitaPrevista', tr.prev_receita,
				'despesaFixada', tr.prev_despesa),
			'execucao', json_build_object(
				'receitaAtualizada', tr.exec_rec_atualizada,
				'receitaArrecadada', tr.exec_rec_arrecadada,
				'dotacaoAtualizada', tr.exec_dotacao,
				'despesaEmpenhada', tr.exec_despesa_emp),
			'rcl', tr.rcl,
			-- objeto por chave; strip_nulls remove base/parcial ausentes (shape do mock)
			'limites', (SELECT jsonb_object_agg(chave, jsonb_strip_nulls(jsonb_build_object(
					'valor', valor, 'pct', pct, 'limite', limite,
					'tipo', tipo, 'base', base, 'parcial', parcial)))
				FROM panorama.tce_limites WHERE exercicio = tr.exercicio),
			'indicadores', (SELECT json_agg(json_build_array(grupo, itens) ORDER BY grupo_ord)
				FROM (
					SELECT grupo, MIN(grupo_ord) AS grupo_ord,
						json_agg(json_build_array(nome, municipio, mediana, maior_melhor, unidade)
							ORDER BY ord) AS itens
					FROM panorama.tce_indicadores WHERE exercicio = tr.exercicio
					GROUP BY grupo
				) g)
		)
		FROM panorama.tce_resumo tr
		WHERE tr.codigo_ibge = r.codigo_ibge AND tr.exercicio = r.exercicio)
) AS data
FROM panorama.resumo r
JOIN panorama.municipio m ON m.codigo_ibge = r.codigo_ibge
ORDER BY r.exercicio DESC
LIMIT 1;
