-- Patch manual — Município de Palotina/PR (76.208.487/0001-64, IBGE 4117909).
-- (1) CAUC: novo snapshot conforme extrato SICONFI/Tesouro de 30/07/2026
--     (PDF "CAUC - Extrato Entes"). Mesmo perfil do extrato de 27/07: 27/28
--     regulares, único item off é o Anexo 12 do RREO ao SIOPS (desativado
--     pelo próprio serviço). Itens 1.1 (PGFN/RFB) e 1.3 (FGTS) também vieram
--     "Desativado" no extrato (instabilidade do Tesouro), tratados como 'ok'
--     — mesmo critério já usado nos patches de 24/07 e 27/07.
-- (2) Certidão Liberatória TCE-PR: renovada em 29/07/2026, consultada em
--     https://servicos.tce.pr.gov.br/.../srv_certidao_emissao.aspx?nrCNPJ=76208487000164
--     Nº 5551.ZMES.2910, válida até 27/09/2026. api.tce usa LIMIT 1 sem
--     ORDER BY em tce.certidao — substitui a certidão anterior (não acumula).
-- IDEMPOTENTE (ON CONFLICT / DELETE+INSERT).
BEGIN;

-- ============================================================================
-- 1) CAUC — snapshot 30/07/2026
-- ============================================================================
SET search_path TO siconfi;

INSERT INTO cauc_resumo (exercicio, verificacao, regulares, total, pendentes, situacao)
VALUES (2026, DATE '2026-07-30', 27, 28, 0, 'Regular')
ON CONFLICT (exercicio, verificacao) DO UPDATE SET
	regulares = EXCLUDED.regulares, total = EXCLUDED.total,
	pendentes = EXCLUDED.pendentes, situacao = EXCLUDED.situacao;

INSERT INTO cauc_itens (exercicio, verificacao, ord, exigencia, status) VALUES
	(2026, DATE '2026-07-30',  1, 'Tributos, contrib. previdenciárias federais e Dívida Ativa da União (PGFN/RFB)', 'ok'),
	(2026, DATE '2026-07-30',  2, 'Pagamento de precatórios judiciais (Transferegov)', 'ok'),
	(2026, DATE '2026-07-30',  3, 'Regularidade com o FGTS (CAIXA)', 'ok'),
	(2026, DATE '2026-07-30',  4, 'Adimplência em empréstimos e financiamentos com a União (SAHEM)', 'ok'),
	(2026, DATE '2026-07-30',  5, 'Regularidade perante o Poder Público Federal (CADIN)', 'ok'),
	(2026, DATE '2026-07-30',  6, 'Prestação de contas de convênios — SIAFI', 'ok'),
	(2026, DATE '2026-07-30',  7, 'Prestação de contas de convênios — Transferegov', 'ok'),
	(2026, DATE '2026-07-30',  8, 'Publicação do RGF (SICONFI)', 'ok'),
	(2026, DATE '2026-07-30',  9, 'Encaminhamento do RGF ao SICONFI', 'ok'),
	(2026, DATE '2026-07-30', 10, 'Publicação do RREO (SICONFI)', 'ok'),
	(2026, DATE '2026-07-30', 11, 'Encaminhamento do RREO ao SICONFI', 'ok'),
	(2026, DATE '2026-07-30', 12, 'Anexo 8 do RREO ao SIOPE', 'ok'),
	(2026, DATE '2026-07-30', 13, 'Anexo 12 do RREO ao SIOPS', 'off'),
	(2026, DATE '2026-07-30', 14, 'Encaminhamento das Contas Anuais — DCA', 'ok'),
	(2026, DATE '2026-07-30', 15, 'Matriz de Saldos Contábeis mensal (MSC)', 'ok'),
	(2026, DATE '2026-07-30', 16, 'Matriz de Saldos Contábeis de encerramento', 'ok'),
	(2026, DATE '2026-07-30', 17, 'Cadastro da Dívida Pública — CDP (SADIPEM)', 'ok'),
	(2026, DATE '2026-07-30', 18, 'Transparência da execução orçamentária e financeira', 'ok'),
	(2026, DATE '2026-07-30', 19, 'Sistema Integrado de Adm. Financeira — SIAFIC', 'ok'),
	(2026, DATE '2026-07-30', 20, 'Exercício da plena competência tributária', 'ok'),
	(2026, DATE '2026-07-30', 21, 'Regularidade previdenciária (CADPREV)', 'ok'),
	(2026, DATE '2026-07-30', 22, 'Aplicação mínima em Educação (25% — aplicou 26,06%)', 'ok'),
	(2026, DATE '2026-07-30', 23, 'Aplicação mínima em Saúde', 'ok'),
	(2026, DATE '2026-07-30', 24, 'Limite de despesas com PPP', 'ok'),
	(2026, DATE '2026-07-30', 25, 'Limite de operações de crédito e antecipação de receita', 'ok'),
	(2026, DATE '2026-07-30', 26, 'Mínimo do Fundeb — profissionais da educação (70% — aplicou 88,62%)', 'ok'),
	(2026, DATE '2026-07-30', 27, 'Complementação da União ao Fundeb em despesas de capital', 'ok'),
	(2026, DATE '2026-07-30', 28, 'Aplicação de 50% da complementação VAAT na educação infantil', 'ok')
ON CONFLICT (exercicio, verificacao, exigencia) DO UPDATE SET
	ord = EXCLUDED.ord, status = EXCLUDED.status;

-- ============================================================================
-- 2) Certidão Liberatória TCE-PR — renovação 29/07/2026
-- ============================================================================
SET search_path TO tce;

DELETE FROM certidao_itens;
DELETE FROM certidao;

INSERT INTO certidao (numero, tipo, situacao, emissao, vencimento, pendencias, finalidade) VALUES
	('5551.ZMES.2910', 'Liberatória', 'Regular', DATE '2026-07-29', DATE '2026-09-27', 0,
	 'Recebimento de recursos públicos, mediante convênio, termo de parceria, contrato de gestão ou instrumento congênere (Instrução Normativa 68/2012).');

INSERT INTO certidao_itens (numero, ord, descricao, status) VALUES
	('5551.ZMES.2910', 1, 'Contas anuais sem pendências de julgamento', 'ok'),
	('5551.ZMES.2910', 2, 'Obrigações de remessa (SIM-AM) em dia', 'ok'),
	('5551.ZMES.2910', 3, 'Adimplência em ressarcimentos e multas', 'ok'),
	('5551.ZMES.2910', 4, 'Atendimento a determinações e recomendações', 'ok');

COMMIT;

-- Verificação: cauc.kpis -> verificacao=30/07/2026, 27/28/0, 'Regular'.
--              tce.certidao -> numero=5551.ZMES.2910, vencimento=27/09/2026.
SELECT (data->'cauc'->'kpis') AS cauc_kpis FROM api.siconfi;
SELECT (data->'certidao') AS certidao FROM api.tce;
