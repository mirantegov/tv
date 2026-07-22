-- Seed Financeiro — Município de Palotina, exercício 2026 (Tesouraria, até Jun).
-- Extraído VERBATIM de src/data.ts (export F). Fonte única = data.ts. Valores em R$ milhões.
SET search_path TO financeiro;

-- F.anterior…F.rendimento (F.liquidez = bruta/obrig é derivado na view).
INSERT INTO resumo (exercicio, competencia, saldo_anterior, disponibilidade_bruta,
	obrigacoes, disponibilidade_liquida, ingressos, desembolsos, resultado,
	aplicacoes, rendimento)
VALUES (2026, 6, 57.9, 142.0, 58.5, 83.5, 550.4, 466.3, 84.1, 96.0, 4.2);

-- F.fontes: [fonte, vinculada, bruta, obrigacoes, rp]
INSERT INTO fontes (exercicio, ord, fonte, vinculada, bruta, obrigacoes, restos_pagar) VALUES
	(2026, 1, 'Recursos Livres (500/501)', false, 38.0, 30.5, 12.0),
	(2026, 2, 'Saúde (600–659 · 15%)', true, 34.0, 10.0, 8.5),
	(2026, 3, 'Educação / FUNDEB (540–599)', true, 28.0, 7.5, 6.0),
	(2026, 4, 'RPPS / Previdência (800)', true, 22.0, 3.0, 1.5),
	(2026, 5, 'Transferências / Convênios (700)', true, 12.0, 4.5, 1.5),
	(2026, 6, 'Assistência Social (660)', true, 8.0, 3.0, 0.7);

-- F.fluxo: [mes, ingressos, desembolsos]
INSERT INTO fluxo_mensal (exercicio, mes, ingressos, desembolsos) VALUES
	(2026, 1, 95, 70),
	(2026, 2, 88, 78),
	(2026, 3, 92, 82),
	(2026, 4, 90, 76),
	(2026, 5, 96, 80),
	(2026, 6, 89.4, 80.3);

-- F.evol: [mes, saldoAcum (bruta), disponivel (liquida)]
INSERT INTO evolucao_mensal (exercicio, mes, disponibilidade_bruta, disponibilidade_liquida) VALUES
	(2026, 1, 82.9, 45),
	(2026, 2, 92.9, 52),
	(2026, 3, 102.9, 58),
	(2026, 4, 116.9, 68),
	(2026, 5, 132.9, 77),
	(2026, 6, 142.0, 83.5);

-- F.bancos: [banco, saldo]
INSERT INTO bancos (exercicio, ord, banco, saldo) VALUES
	(2026, 1, 'Banco do Brasil', 58.0),
	(2026, 2, 'Caixa Econômica', 44.0),
	(2026, 3, 'Bradesco (arrecadação)', 18.0),
	(2026, 4, 'Aplicações (fundo único)', 22.0);

-- F.obrigacoes: [tipo, valor]
INSERT INTO obrigacoes (exercicio, ord, tipo, valor) VALUES
	(2026, 1, 'RP Processados a pagar', 30.2),
	(2026, 2, 'Consignações / retenções', 20.3),
	(2026, 3, 'Depósitos / cauções', 8.0);

-- F.pagamentos: [categoria, valor]
INSERT INTO pagamentos (exercicio, ord, categoria, valor) VALUES
	(2026, 1, 'Folha de Pessoal', 198.0),
	(2026, 2, 'Fornecedores', 120.0),
	(2026, 3, 'Encargos (INSS/FGTS)', 38.0),
	(2026, 4, 'Transf. / Repasses', 18.3),
	(2026, 5, 'Outros', 10.0);

-- F.extra: [tipo, retido, recolhido]
INSERT INTO extraorcamentario (exercicio, ord, tipo, retido, recolhido) VALUES
	(2026, 1, 'INSS', 14.0, 6.5),
	(2026, 2, 'IRRF', 9.5, 4.5),
	(2026, 3, 'FGTS', 6.0, 2.8),
	(2026, 4, 'ISS retido', 4.0, 1.9),
	(2026, 5, 'Consig. de folha', 5.0, 2.5),
	(2026, 6, 'Cauções / depósitos', 10.0, 2.0);
