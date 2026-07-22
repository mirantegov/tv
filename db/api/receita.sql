-- api.receita — remonta o export R (data.ts), incluindo a árvore `natureza`.
-- Função recursiva monta os nós; folhas ficam sem a chave `children`.
-- SECURITY DEFINER: roda como dono (mirante) p/ ler schema `receita`, como as views.
CREATE OR REPLACE FUNCTION api.receita_tree(p text) RETURNS json
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = pg_catalog AS $$
DECLARE r json;
BEGIN
	SELECT json_agg(node ORDER BY o) INTO r FROM (
		SELECT array_position(ARRAY['rc','rct','iss','iptu','itbi','tx','cos',
			'rtr','fpm','icms','fdb','sus','ipva','fnde','rto','rpa','rse','rou',
			'rco','rcap','ded'], n.id) AS o,
			json_strip_nulls(json_build_object(
				'id', n.id, 'nome', n.nome, 'prev', n.previsto, 'real', n.arrecadado,
				'children', api.receita_tree(n.id)
			)) AS node
		FROM receita.natureza n
		WHERE n.exercicio = 2026 AND n.parent_id IS NOT DISTINCT FROM p
	) s;
	RETURN r;
END $$;

CREATE OR REPLACE VIEW api.receita AS
SELECT json_build_object(
	'prev', r.previsao_atualizada,
	'bruta', r.arrecadada_bruta,
	'ded', r.deducoes_fundeb,
	'liq', r.receita_liquida,
	'propria', r.receita_propria,
	'transf', r.transferencias,
	'outras', r.outras_receitas,
	'capital', r.receita_capital,
	'divida', r.divida_ativa_arrec,
	'mensal', (SELECT json_agg(json_build_array(api.mes_lbl(mes), arrecadado_acum, previsto_acum, previsto_mes, arrecadado_mes) ORDER BY mes)
		FROM receita.mensal WHERE exercicio = r.exercicio),
	'origem', (SELECT json_agg(json_build_array(origem, arrecadado) ORDER BY array_position(
		ARRAY['Transferências Correntes','Receita Tributária','Receita Patrimonial','Outras Rec. Correntes','Receita de Serviços','Contribuições','Receita de Capital'], origem))
		FROM receita.origens WHERE exercicio = r.exercicio),
	'transfDet', (SELECT json_agg(json_build_array(transferencia, arrecadado) ORDER BY array_position(
		ARRAY['FPM','Cota-parte ICMS','FUNDEB (recebido)','Transf. SUS','Cota-parte IPVA','FNDE','Outras'], transferencia))
		FROM receita.transferencias WHERE exercicio = r.exercicio),
	'tributos', (SELECT json_agg(json_build_array(tributo, arrecadado) ORDER BY array_position(
		ARRAY['ISS','IPTU','ITBI','Taxas','COSIP'], tributo))
		FROM receita.tributos WHERE exercicio = r.exercicio),
	'natureza', api.receita_tree(NULL),
	'saude', (SELECT json_agg(json_build_array(codigo, descricao, valor, destaque) ORDER BY array_position(
		ARRAY['Impostos vinculados à Saúde — mín. 15% (ASPS)','Transf. F. a F. do SUS — Manutenção (Custeio)','Transf. F. a F. do SUS — Estruturação (Investimento)','Transferências do SUS — Estado','Convênios e outras — Saúde'], descricao))
		FROM receita.fontes_vinculadas WHERE exercicio = r.exercicio AND area = 'saude'),
	'educ', (SELECT json_agg(json_build_array(codigo, descricao, valor, destaque) ORDER BY array_position(
		ARRAY['Impostos vinculados à Educação — mín. 25% (MDE · CO 1001)','Transferências do FUNDEB','FUNDEB — Compl. União — VAAF','FUNDEB — Compl. União — VAAT','Salário-Educação / FNDE','Convênios e outras — Educação'], descricao))
		FROM receita.fontes_vinculadas WHERE exercicio = r.exercicio AND area = 'educacao')
) AS data
FROM receita.resumo r
ORDER BY r.exercicio DESC
LIMIT 1;
