-- Seed SICONFI — Município de Palotina (IBGE 4118402), exercício 2026.
-- Extraído de src/data.ts (PC.siconfi). Fonte única = data.ts.
SET search_path TO siconfi;

INSERT INTO cauc_resumo (exercicio, verificacao, regulares, total, pendentes, situacao)
VALUES (2026, DATE '2026-07-22', 27, 29, 0, 'Regular');

INSERT INTO cauc_itens (exercicio, verificacao, ord, exigencia, status) VALUES
	(2026, DATE '2026-07-22', 1, 'Tributos, contrib. previdenciárias federais e Dívida Ativa da União (PGFN/RFB)', 'ok'),
	(2026, DATE '2026-07-22', 2, 'Pagamento de precatórios judiciais (Transferegov)', 'ok'),
	(2026, DATE '2026-07-22', 3, 'Regularidade com o FGTS (CAIXA)', 'off'),
	(2026, DATE '2026-07-22', 4, 'Adimplência em empréstimos e financiamentos com a União (SAHEM)', 'ok'),
	(2026, DATE '2026-07-22', 5, 'Regularidade perante o Poder Público Federal (CADIN)', 'ok'),
	(2026, DATE '2026-07-22', 6, 'Prestação de contas de convênios — SIAFI', 'ok'),
	(2026, DATE '2026-07-22', 7, 'Prestação de contas de convênios — Transferegov', 'ok'),
	(2026, DATE '2026-07-22', 8, 'Publicação do RGF (SICONFI)', 'ok'),
	(2026, DATE '2026-07-22', 9, 'Encaminhamento do RGF ao SICONFI', 'ok'),
	(2026, DATE '2026-07-22', 10, 'Publicação do RREO (SICONFI)', 'ok'),
	(2026, DATE '2026-07-22', 11, 'Encaminhamento do RREO ao SICONFI', 'ok'),
	(2026, DATE '2026-07-22', 12, 'Anexo 8 do RREO ao SIOPE', 'ok'),
	(2026, DATE '2026-07-22', 13, 'Anexo 12 do RREO ao SIOPS', 'off'),
	(2026, DATE '2026-07-22', 14, 'Encaminhamento das Contas Anuais — DCA', 'ok'),
	(2026, DATE '2026-07-22', 15, 'Matriz de Saldos Contábeis mensal (MSC)', 'ok'),
	(2026, DATE '2026-07-22', 16, 'Matriz de Saldos Contábeis de encerramento', 'ok'),
	(2026, DATE '2026-07-22', 17, 'Cadastro da Dívida Pública — CDP (SADIPEM)', 'ok'),
	(2026, DATE '2026-07-22', 18, 'Transparência da execução orçamentária e financeira', 'ok'),
	(2026, DATE '2026-07-22', 19, 'Sistema Integrado de Adm. Financeira — SIAFIC', 'ok'),
	(2026, DATE '2026-07-22', 20, 'Exercício da plena competência tributária', 'ok'),
	(2026, DATE '2026-07-22', 21, 'Regularidade previdenciária (CADPREV)', 'ok'),
	(2026, DATE '2026-07-22', 22, 'Aplicação mínima em Educação (25% — aplicou 26,06%)', 'ok'),
	(2026, DATE '2026-07-22', 23, 'Aplicação mínima em Saúde', 'ok'),
	(2026, DATE '2026-07-22', 24, 'Limite de despesas com PPP', 'ok'),
	(2026, DATE '2026-07-22', 25, 'Limite de operações de crédito e antecipação de receita', 'ok'),
	(2026, DATE '2026-07-22', 26, 'Mínimo do Fundeb — profissionais da educação (70% — aplicou 88,62%)', 'ok'),
	(2026, DATE '2026-07-22', 27, 'Complementação da União ao Fundeb em despesas de capital', 'ok'),
	(2026, DATE '2026-07-22', 28, 'Aplicação de 50% da complementação VAAT na educação infantil', 'ok');

-- consistencia_pct: numeric; NULL quando pendente (view formata '—')
INSERT INTO msc_remessas (exercicio, competencia, envio, status, consistencia_pct, situacao) VALUES
	(2026, 1, DATE '2026-02-14', 'Enviada', 100, 'ok'),
	(2026, 2, DATE '2026-03-13', 'Enviada', 100, 'ok'),
	(2026, 3, DATE '2026-04-14', 'Enviada', 98, 'warn'),
	(2026, 4, DATE '2026-05-15', 'Enviada', 100, 'ok'),
	(2026, 5, DATE '2026-06-13', 'Enviada', 100, 'ok'),
	(2026, 6, NULL, 'Pendente', NULL, 'warn');

INSERT INTO declaracoes (exercicio, ord, declaracao, situacao, status) VALUES
	(2026, 1, 'RREO — 2º bimestre', 'Gerado e homologado', 'ok'),
	(2026, 2, 'RGF — 1º quadrimestre', 'Gerado e homologado', 'ok'),
	(2026, 3, 'DCA 2025', 'Homologada', 'ok'),
	(2026, 4, 'RREO — 3º bimestre', 'Aguardando fechamento', 'warn');
