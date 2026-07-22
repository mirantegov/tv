-- api.licitacoes — remonta o export LIC (data.ts). PostgREST: GET /licitacoes → [{data:{…}}]
CREATE OR REPLACE VIEW api.licitacoes AS
SELECT json_build_object(
	'homologado', r.homologado,
	'processos', r.processos,
	'estimado', r.estimado,
	'economia', r.economia,
	'economiaPct', r.economia_pct,
	'taxaSucesso', r.taxa_sucesso_pct,
	'tempoMedio', r.tempo_medio_dias,
	'andamento', r.em_andamento,
	'andamentoValor', r.em_andamento_valor,
	'diretaPct', r.direta_pct,
	'desertosPct', r.desertos_pct,
	'fornMedia', r.fornecedores_media,
	'meepp', (SELECT coalesce(json_agg(json_build_array(destino, valor) ORDER BY ord), '[]')
		FROM licitacoes.meepp WHERE exercicio = r.exercicio),
	'meeppExclusivos', r.meepp_exclusivos,
	'pncp', json_build_object(
		'noPrazo', r.pncp_no_prazo, 'foraPrazo', r.pncp_fora_prazo, 'pendentes', r.pncp_pendentes),
	'atas', (SELECT coalesce(json_agg(json_build_array(objeto, registrado, consumido,
			api.mes_lbl(EXTRACT(MONTH FROM vencimento)::smallint) || '/' || EXTRACT(YEAR FROM vencimento)::int) ORDER BY ord), '[]')
		FROM licitacoes.atas WHERE exercicio = r.exercicio),
	'mensal', (SELECT coalesce(json_agg(json_build_array(api.mes_lbl(mes), estimado, homologado) ORDER BY mes), '[]')
		FROM licitacoes.mensal WHERE exercicio = r.exercicio),
	'modalidade', (SELECT coalesce(json_agg(json_build_array(modalidade, processos, estimado, homologado,
			economia_pct, tempo_medio_dias, taxa_sucesso_pct) ORDER BY ord), '[]')
		FROM licitacoes.modalidades WHERE exercicio = r.exercicio),
	'funil', (SELECT coalesce(json_agg(json_build_array(etapa, quantidade) ORDER BY ordem), '[]')
		FROM licitacoes.funil WHERE exercicio = r.exercicio),
	'situacao', (SELECT coalesce(json_agg(json_build_array(situacao, quantidade) ORDER BY quantidade DESC), '[]')
		FROM licitacoes.situacoes WHERE exercicio = r.exercicio),
	'objeto', (SELECT coalesce(json_agg(json_build_array(categoria, valor) ORDER BY valor DESC), '[]')
		FROM licitacoes.objetos WHERE exercicio = r.exercicio),
	'pipeline', (SELECT coalesce(json_agg(json_build_array(processo, objeto, modalidade, orgao, estimado, situacao, dias) ORDER BY ord), '[]')
		FROM licitacoes.pipeline WHERE exercicio = r.exercicio),
	'diretas', (SELECT coalesce(json_agg(json_build_array(base_legal, objeto, fornecedor, valor) ORDER BY ord), '[]')
		FROM licitacoes.contratacao_direta WHERE exercicio = r.exercicio),
	'desertos', (SELECT coalesce(json_agg(json_build_array(objeto, modalidade, motivo) ORDER BY ord), '[]')
		FROM licitacoes.desertos_fracassados WHERE exercicio = r.exercicio)
) AS data
FROM licitacoes.resumo r
ORDER BY r.exercicio DESC
LIMIT 1;
