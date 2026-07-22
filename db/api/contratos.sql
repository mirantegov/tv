-- api.contratos — remonta o export CON (data.ts). PostgREST: GET /contratos → [{data:{…}}]
CREATE OR REPLACE VIEW api.contratos AS
SELECT json_build_object(
	'contratado', r.contratado,
	'original', r.original,
	'aditivos', r.aditivos,
	'aditivosPct', r.aditivos_pct,
	'vigentes', r.vigentes,
	'executado', r.executado,
	'execPct', r.executado_pct,
	'saldo', r.saldo,
	'aVencer90', r.a_vencer_90_qtd,
	'aVencer90Valor', r.a_vencer_90_valor,
	'vencidosSaldo', r.vencidos_saldo,
	'vencidosQtd', r.vencidos_qtd,
	'topFornPct', r.top5_pct,
	'tipo', (SELECT coalesce(json_agg(json_build_array(tipo, valor) ORDER BY valor DESC), '[]')
		FROM contratos.tipos WHERE exercicio = r.exercicio),
	'fornecedores', (SELECT coalesce(json_agg(json_build_array(fornecedor, valor) ORDER BY ord), '[]')
		FROM contratos.fornecedores WHERE exercicio = r.exercicio),
	'fonte', (SELECT coalesce(json_agg(json_build_array(fonte, valor) ORDER BY valor DESC), '[]')
		FROM contratos.fontes WHERE exercicio = r.exercicio),
	'orgaos', (SELECT coalesce(json_agg(json_build_array(orgao, executado, saldo) ORDER BY executado DESC), '[]')
		FROM contratos.orgaos WHERE exercicio = r.exercicio),
	'vencimentos', (SELECT coalesce(json_agg(json_build_array(api.mes_lbl(mes), valor) ORDER BY ano, mes), '[]')
		FROM contratos.vencimentos),
	'aditivosDet', (SELECT coalesce(json_agg(json_build_array(contrato, tipo, valor, pct_acumulado, limite_pct) ORDER BY pct_acumulado DESC), '[]')
		FROM contratos.aditivos),
	'carteira', (SELECT coalesce(json_agg(json_build_array(contrato, objeto, fornecedor, orgao, valor_original, aditivos, executado, dias_para_vencer) ORDER BY dias_para_vencer), '[]')
		FROM contratos.carteira),
	'aVencer', (SELECT coalesce(json_agg(json_build_array(contrato, fornecedor, objeto, saldo, dias) ORDER BY dias), '[]')
		FROM contratos.a_vencer),
	'concentr', (SELECT coalesce(json_agg(json_build_array(fornecedor, n_contratos, valor, pct_carteira) ORDER BY valor DESC), '[]')
		FROM contratos.concentracao WHERE exercicio = r.exercicio)
) AS data
FROM contratos.resumo r
ORDER BY r.exercicio DESC
LIMIT 1;
