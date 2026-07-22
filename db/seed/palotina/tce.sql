-- Seed TCE/PR — Município de Palotina (IBGE 4117909), exercício 2026.
-- Extraído de src/data.ts (PC.tce). Fonte única = data.ts.
SET search_path TO tce;

INSERT INTO agenda_resumo (exercicio, periodo, em_dia, nao_atendido, nao_aplicavel, entidades, municipio)
VALUES (2026, 'Exercício 2026', 18, 0, 6, 3, 'Palotina/PR');

INSERT INTO obrigacoes (sigla, ord, descricao) VALUES
	('AUD', 1, 'Declaração sobre a realização de Audiência Pública'),
	('RREO', 2, 'Declaração de publicidade dos Relatórios Resumidos da Execução Orçamentária'),
	('RGF', 3, 'Declaração de publicidade dos Relatórios de Gestão Fiscal'),
	('FP', 4, 'Entrega do módulo de Folha de Pagamento do SIAP'),
	('AM', 5, 'Entrega do módulo de Acompanhamento Mensal do SIM'),
	('PCA', 6, 'Entrega do Processo de Prestação de Contas Anual'),
	('ML', 7, 'Fechamento do Mural de Licitações'),
	('PG', 8, 'ProGov — avaliação de políticas públicas');

-- matriz: status por entidade × obrigação (ordem das entidades na view)
INSERT INTO agenda_matriz (exercicio, periodo, entidade, sigla, status) VALUES
	(2026, 'Exercício 2026', 'Câmara Municipal de Palotina', 'AUD', 'ok'),
	(2026, 'Exercício 2026', 'Câmara Municipal de Palotina', 'RREO', 'na'),
	(2026, 'Exercício 2026', 'Câmara Municipal de Palotina', 'RGF', 'ok'),
	(2026, 'Exercício 2026', 'Câmara Municipal de Palotina', 'FP', 'ok'),
	(2026, 'Exercício 2026', 'Câmara Municipal de Palotina', 'AM', 'ok'),
	(2026, 'Exercício 2026', 'Câmara Municipal de Palotina', 'PCA', 'ok'),
	(2026, 'Exercício 2026', 'Câmara Municipal de Palotina', 'ML', 'ok'),
	(2026, 'Exercício 2026', 'Câmara Municipal de Palotina', 'PG', 'na'),
	(2026, 'Exercício 2026', 'Município de Palotina', 'AUD', 'ok'),
	(2026, 'Exercício 2026', 'Município de Palotina', 'RREO', 'ok'),
	(2026, 'Exercício 2026', 'Município de Palotina', 'RGF', 'ok'),
	(2026, 'Exercício 2026', 'Município de Palotina', 'FP', 'ok'),
	(2026, 'Exercício 2026', 'Município de Palotina', 'AM', 'ok'),
	(2026, 'Exercício 2026', 'Município de Palotina', 'PCA', 'ok'),
	(2026, 'Exercício 2026', 'Município de Palotina', 'ML', 'ok'),
	(2026, 'Exercício 2026', 'Município de Palotina', 'PG', 'ok'),
	(2026, 'Exercício 2026', 'Fundo de Aposentadoria e Pensão dos Servidores Municipais de Palotina', 'AUD', 'na'),
	(2026, 'Exercício 2026', 'Fundo de Aposentadoria e Pensão dos Servidores Municipais de Palotina', 'RREO', 'na'),
	(2026, 'Exercício 2026', 'Fundo de Aposentadoria e Pensão dos Servidores Municipais de Palotina', 'RGF', 'na'),
	(2026, 'Exercício 2026', 'Fundo de Aposentadoria e Pensão dos Servidores Municipais de Palotina', 'FP', 'ok'),
	(2026, 'Exercício 2026', 'Fundo de Aposentadoria e Pensão dos Servidores Municipais de Palotina', 'AM', 'ok'),
	(2026, 'Exercício 2026', 'Fundo de Aposentadoria e Pensão dos Servidores Municipais de Palotina', 'PCA', 'ok'),
	(2026, 'Exercício 2026', 'Fundo de Aposentadoria e Pensão dos Servidores Municipais de Palotina', 'ML', 'ok'),
	(2026, 'Exercício 2026', 'Fundo de Aposentadoria e Pensão dos Servidores Municipais de Palotina', 'PG', 'na');

INSERT INTO certidao (numero, tipo, situacao, emissao, vencimento, pendencias, finalidade) VALUES
	('7822.BQQA.1791', 'Liberatória', 'Regular', DATE '2026-05-26', DATE '2026-07-25', 0,
	 'Recebimento de recursos públicos, mediante convênio, termo de parceria, contrato de gestão ou instrumento congênere (Instrução Normativa 68/2012).');

INSERT INTO certidao_itens (numero, ord, descricao, status) VALUES
	('7822.BQQA.1791', 1, 'Contas anuais sem pendências de julgamento', 'ok'),
	('7822.BQQA.1791', 2, 'Obrigações de remessa (SIM-AM) em dia', 'ok'),
	('7822.BQQA.1791', 3, 'Adimplência em ressarcimentos e multas', 'ok'),
	('7822.BQQA.1791', 4, 'Atendimento a determinações e recomendações', 'ok');

INSERT INTO contas_resumo (exercicio, parecer, entrega, tempestividade)
VALUES (2025, 'Em análise', '31/03/2026', '100%');

INSERT INTO contas (exercicio, transito_em_julgado, encaminhamento_parecer, julgamento_camara, tone) VALUES
	(2025, '—', '—', 'Em tramitação', 'info'),
	(2024, '—', '—', 'Em tramitação', 'info'),
	(2023, '29/01/2025', '06/02/2025', 'Regular · DL 001/2025 (22/04/2025)', 'ok'),
	(2022, '10/04/2024', '24/05/2024', 'Regular · DL 002/2024 (27/08/2024)', 'ok'),
	(2021, '17/04/2023', '04/08/2023', 'Regular · DL 002/2023 (24/10/2023)', 'ok'),
	(2020, '31/03/2022', '04/04/2022', 'Aguardando julgamento', 'info'),
	(2019, '01/10/2020', '06/10/2020', 'Regular · DL 005/2020 (14/12/2020)', 'ok');
