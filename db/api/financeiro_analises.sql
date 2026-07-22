-- api.financeiro_analises — remonta o export FA (data.ts). PostgREST: GET /financeiro_analises → [{data:{…}}]
CREATE OR REPLACE VIEW api.financeiro_analises AS
SELECT json_build_object(
	'disp', r.disponibilidade,
	'movimento', r.conta_movimento,
	'aplicado', r.aplicado,
	'rendimentosYtd', r.rendimentos_ytd,
	'rentabCdi', r.rentabilidade_cdi,
	'contas', r.contas,
	'conciliadas', r.conciliadas,
	'concPct', r.conciliacao_pct,
	'divergencias', r.divergencias,
	'divergValor', r.divergencia_valor,
	'movCompleta', r.mov_completa,
	'movCompletaPct', r.mov_completa_pct,
	'fontesNegativas', r.fontes_negativas,
	'fontes', (SELECT coalesce(json_agg(json_build_array(fonte, saldo, obrigacoes, situacao) ORDER BY ord), '[]')
		FROM financeiro_analises.fontes WHERE exercicio = r.exercicio),
	'invTipo', (SELECT coalesce(json_agg(json_build_array(tipo, aplicado) ORDER BY aplicado DESC), '[]')
		FROM financeiro_analises.investimentos_tipo WHERE exercicio = r.exercicio),
	'rendMensal', (SELECT coalesce(json_agg(json_build_array(api.mes_lbl(mes), rendimento) ORDER BY mes), '[]')
		FROM financeiro_analises.rendimentos_mensal WHERE exercicio = r.exercicio),
	'invInst', (SELECT coalesce(json_agg(json_build_array(instituicao, aplicado, rentabilidade_cdi, situacao) ORDER BY aplicado DESC), '[]')
		FROM financeiro_analises.investimentos_instituicao WHERE exercicio = r.exercicio),
	'bancos', (SELECT coalesce(json_agg(json_build_array(banco, contas, movimento, aplicado, conciliadas) ORDER BY aplicado DESC), '[]')
		FROM financeiro_analises.bancos WHERE exercicio = r.exercicio),
	'pendencias', (SELECT coalesce(json_agg(json_build_array(conta, banco, valor, motivo, dias) ORDER BY valor DESC), '[]')
		FROM financeiro_analises.pendencias WHERE exercicio = r.exercicio),
	'movMatriz', (SELECT coalesce(json_agg(json_build_array(grupo, total, receita_ok, aplicacao_ok, resgate_ok) ORDER BY total DESC), '[]')
		FROM financeiro_analises.movimentacao_matriz WHERE exercicio = r.exercicio)
) AS data
FROM financeiro_analises.resumo r
ORDER BY r.exercicio DESC
LIMIT 1;
