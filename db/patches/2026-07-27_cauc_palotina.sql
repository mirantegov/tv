-- Patch manual — atualiza o módulo SICONFI (CAUC) conforme extrato de 27/07/2026.
-- Ente: 76.208.487/0001-64 — Município de Palotina/PR (IBGE 4117909).
-- Extrato CAUC 27/07: 27 comprovados de 28, 0 pendentes ('Regular'). Único item
-- não-regular é o Anexo 12 do RREO ao SIOPS, DESATIVADO pelo próprio serviço ('off').
-- Situação idêntica ao extrato de 24/07 — só muda a data da pesquisa (24 -> 27).
--
-- Estratégia: insere um NOVO snapshot datado 27/07 (a view usa verificacao DESC
-- LIMIT 1). IDEMPOTENTE (ON CONFLICT) e robusto ao estado atual do banco.
BEGIN;
SET search_path TO siconfi;

INSERT INTO cauc_resumo (exercicio, verificacao, regulares, total, pendentes, situacao)
VALUES (2026, DATE '2026-07-27', 27, 28, 0, 'Regular')
ON CONFLICT (exercicio, verificacao) DO UPDATE SET
	regulares = EXCLUDED.regulares, total = EXCLUDED.total,
	pendentes = EXCLUDED.pendentes, situacao = EXCLUDED.situacao;

INSERT INTO cauc_itens (exercicio, verificacao, ord, exigencia, status) VALUES
	(2026, DATE '2026-07-27',  1, 'Tributos, contrib. previdenciárias federais e Dívida Ativa da União (PGFN/RFB)', 'ok'),
	(2026, DATE '2026-07-27',  2, 'Pagamento de precatórios judiciais (Transferegov)', 'ok'),
	(2026, DATE '2026-07-27',  3, 'Regularidade com o FGTS (CAIXA)', 'ok'),
	(2026, DATE '2026-07-27',  4, 'Adimplência em empréstimos e financiamentos com a União (SAHEM)', 'ok'),
	(2026, DATE '2026-07-27',  5, 'Regularidade perante o Poder Público Federal (CADIN)', 'ok'),
	(2026, DATE '2026-07-27',  6, 'Prestação de contas de convênios — SIAFI', 'ok'),
	(2026, DATE '2026-07-27',  7, 'Prestação de contas de convênios — Transferegov', 'ok'),
	(2026, DATE '2026-07-27',  8, 'Publicação do RGF (SICONFI)', 'ok'),
	(2026, DATE '2026-07-27',  9, 'Encaminhamento do RGF ao SICONFI', 'ok'),
	(2026, DATE '2026-07-27', 10, 'Publicação do RREO (SICONFI)', 'ok'),
	(2026, DATE '2026-07-27', 11, 'Encaminhamento do RREO ao SICONFI', 'ok'),
	(2026, DATE '2026-07-27', 12, 'Anexo 8 do RREO ao SIOPE', 'ok'),
	(2026, DATE '2026-07-27', 13, 'Anexo 12 do RREO ao SIOPS', 'off'),
	(2026, DATE '2026-07-27', 14, 'Encaminhamento das Contas Anuais — DCA', 'ok'),
	(2026, DATE '2026-07-27', 15, 'Matriz de Saldos Contábeis mensal (MSC)', 'ok'),
	(2026, DATE '2026-07-27', 16, 'Matriz de Saldos Contábeis de encerramento', 'ok'),
	(2026, DATE '2026-07-27', 17, 'Cadastro da Dívida Pública — CDP (SADIPEM)', 'ok'),
	(2026, DATE '2026-07-27', 18, 'Transparência da execução orçamentária e financeira', 'ok'),
	(2026, DATE '2026-07-27', 19, 'Sistema Integrado de Adm. Financeira — SIAFIC', 'ok'),
	(2026, DATE '2026-07-27', 20, 'Exercício da plena competência tributária', 'ok'),
	(2026, DATE '2026-07-27', 21, 'Regularidade previdenciária (CADPREV)', 'ok'),
	(2026, DATE '2026-07-27', 22, 'Aplicação mínima em Educação (25% — aplicou 26,06%)', 'ok'),
	(2026, DATE '2026-07-27', 23, 'Aplicação mínima em Saúde', 'ok'),
	(2026, DATE '2026-07-27', 24, 'Limite de despesas com PPP', 'ok'),
	(2026, DATE '2026-07-27', 25, 'Limite de operações de crédito e antecipação de receita', 'ok'),
	(2026, DATE '2026-07-27', 26, 'Mínimo do Fundeb — profissionais da educação (70% — aplicou 88,62%)', 'ok'),
	(2026, DATE '2026-07-27', 27, 'Complementação da União ao Fundeb em despesas de capital', 'ok'),
	(2026, DATE '2026-07-27', 28, 'Aplicação de 50% da complementação VAAT na educação infantil', 'ok')
ON CONFLICT (exercicio, verificacao, exigencia) DO UPDATE SET
	ord = EXCLUDED.ord, status = EXCLUDED.status;

COMMIT;

-- Verificação: deve retornar verificacao=27/07/2026, 27/28/0, 'Regular'.
SELECT (data->'cauc'->'kpis') AS kpis FROM api.siconfi;
