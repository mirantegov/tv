-- api.tce — remonta PC.tce (data.ts). PostgREST: GET /tce → [{data:{…}}]
CREATE OR REPLACE VIEW api.tce AS
SELECT json_build_object(
	'agenda', json_build_object(
		'kpis', json_build_object(
			'emDia', ar.em_dia, 'naoAtendido', ar.nao_atendido,
			'naoAplicavel', ar.nao_aplicavel, 'entidades', ar.entidades),
		'local', ar.municipio,
		'periodo', ar.periodo,
		'colunas', (SELECT json_agg(json_build_array(sigla, descricao) ORDER BY ord) FROM tce.obrigacoes),
		'matriz', (
			SELECT json_agg(json_build_array(entidade, statuses) ORDER BY ent_ord)
			FROM (
				SELECT m.entidade,
					array_position(ARRAY[
						'Câmara Municipal de Palotina',
						'Município de Palotina',
						'Fundo de Aposentadoria e Pensão dos Servidores Municipais de Palotina'
					], m.entidade) AS ent_ord,
					(SELECT json_agg(m2.status ORDER BY o.ord)
						FROM tce.agenda_matriz m2
						JOIN tce.obrigacoes o ON o.sigla = m2.sigla
						WHERE m2.entidade = m.entidade AND m2.exercicio = m.exercicio) AS statuses
				FROM tce.agenda_matriz m
				WHERE m.exercicio = ar.exercicio
				GROUP BY m.entidade, m.exercicio
			) t)
	),
	'certidao', (
		SELECT json_build_object(
			'kpis', json_build_object(
				'situacao', c.situacao,
				'validade', (c.vencimento - CURRENT_DATE) || ' dias',
				'pendencias', c.pendencias,
				'tipo', c.tipo),
			'numero', c.numero,
			'emissao', to_char(c.emissao, 'DD/MM/YYYY'),
			'vencimento', to_char(c.vencimento, 'DD/MM/YYYY'),
			'finalidade', c.finalidade,
			'itens', (SELECT json_agg(json_build_array(descricao, status) ORDER BY ord)
				FROM tce.certidao_itens WHERE numero = c.numero))
		FROM tce.certidao c LIMIT 1),
	'contas', json_build_object(
		'kpis', (SELECT json_build_object(
			'exercicio', exercicio::text, 'parecer', parecer,
			'entrega', entrega, 'tempestividade', tempestividade)
			FROM tce.contas_resumo ORDER BY exercicio DESC LIMIT 1),
		'historico', (SELECT json_agg(json_build_array(
			exercicio::text, transito_em_julgado, encaminhamento_parecer, julgamento_camara, tone)
			ORDER BY exercicio DESC) FROM tce.contas))
) AS data
FROM tce.agenda_resumo ar
ORDER BY ar.exercicio DESC
LIMIT 1;
