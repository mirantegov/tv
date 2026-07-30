-- Patch diário gerado por deploy/daily-sync/gen_daily_patch.py — NÃO editar à mão.
-- Tenant: Município de Palotina (palotina, IBGE 4117909).
-- Fonte CAUC: CSV Tesouro Transparente, pesquisa de 30/07/2026.
BEGIN;
SET search_path TO siconfi;

INSERT INTO cauc_resumo (exercicio, verificacao, regulares, total, pendentes, situacao)
VALUES (2026, DATE '2026-07-30', 25, 25, 0, 'Regular')
ON CONFLICT (exercicio, verificacao) DO UPDATE SET
	regulares = EXCLUDED.regulares, total = EXCLUDED.total,
	pendentes = EXCLUDED.pendentes, situacao = EXCLUDED.situacao;

INSERT INTO cauc_itens (exercicio, verificacao, ord, exigencia, status) VALUES
	(2026, DATE '2026-07-30',  1, 'Tributos, contrib. previdenciárias federais e Dívida Ativa da União (PGFN/RFB)', 'off'),
	(2026, DATE '2026-07-30',  2, 'Pagamento de precatórios judiciais (Transferegov)', 'ok'),
	(2026, DATE '2026-07-30',  3, 'Regularidade com o FGTS (CAIXA)', 'off'),
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
	(2026, DATE '2026-07-30', 22, 'Aplicação mínima em Educação (25%)', 'ok'),
	(2026, DATE '2026-07-30', 23, 'Aplicação mínima em Saúde', 'ok'),
	(2026, DATE '2026-07-30', 24, 'Limite de despesas com PPP', 'ok'),
	(2026, DATE '2026-07-30', 25, 'Limite de operações de crédito e antecipação de receita', 'ok'),
	(2026, DATE '2026-07-30', 26, 'Mínimo do Fundeb — profissionais da educação (70%)', 'ok'),
	(2026, DATE '2026-07-30', 27, 'Complementação da União ao Fundeb em despesas de capital', 'ok'),
	(2026, DATE '2026-07-30', 28, 'Aplicação de 50% da complementação VAAT na educação infantil', 'ok')
ON CONFLICT (exercicio, verificacao, exigencia) DO UPDATE SET
	ord = EXCLUDED.ord, status = EXCLUDED.status;

-- Certidão Liberatória TCE-PR (consulta por CNPJ 76208487000164).
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

-- Card "Situação Fiscal" (Visão Geral) lê de panorama.tce_resumo.
UPDATE panorama.tce_resumo
	SET cert_numero = '5551.ZMES.2910',
		cert_emissao = DATE '2026-07-29',
		cert_validade = DATE '2026-09-27'
	WHERE exercicio = 2026;

COMMIT;

-- Verificação
SELECT (data->'cauc'->'kpis') AS cauc_kpis FROM api.siconfi;
SELECT (data->'certidao'->>'numero') AS certidao_tce FROM api.tce;
SELECT (data->'tce'->'certidao'->>'numero') AS certidao_visao_geral FROM api.panorama;
