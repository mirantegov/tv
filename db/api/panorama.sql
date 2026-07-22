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
		FROM panorama.indicadores WHERE codigo_ibge = r.codigo_ibge AND grupo = 'idhm')
) AS data
FROM panorama.resumo r
JOIN panorama.municipio m ON m.codigo_ibge = r.codigo_ibge
ORDER BY r.exercicio DESC
LIMIT 1;
