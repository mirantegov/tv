-- Seed Receita — Comparativo/Evolução (rota /receita-comp, export CR). Palotina.
-- Extraído de src/data.ts. Fonte única = data.ts.
SET search_path TO receita_comparativo;

-- totais: arrecadada = série CR.evol (2022..2026); tributaria/transferencias só 25/26
INSERT INTO totais (exercicio, arrecadada, tributaria, transferencias) VALUES
	(2022, 360, NULL, NULL),
	(2023, 392, NULL, NULL),
	(2024, 410, NULL, NULL),
	(2025, 432, 106, 271.5),
	(2026, 462.4, 118.5, 286);

-- CR.meses: [mes, v25, v26]
INSERT INTO mensal (exercicio, mes, arrecadado) VALUES
	(2025, 1, 76), (2025, 2, 70), (2025, 3, 70), (2025, 4, 69), (2025, 5, 74), (2025, 6, 73),
	(2026, 1, 82), (2026, 2, 76), (2026, 3, 74), (2026, 4, 73), (2026, 5, 81), (2026, 6, 76.4);

-- CR.origem: [nome, v25, v26]
INSERT INTO origens (exercicio, origem, arrecadado) VALUES
	(2025, 'Transferências Correntes', 271.5), (2026, 'Transferências Correntes', 286),
	(2025, 'Receita Tributária', 106), (2026, 'Receita Tributária', 118.5),
	(2025, 'Receita Patrimonial', 18.5), (2026, 'Receita Patrimonial', 22.4),
	(2025, 'Outras Rec. Correntes', 21.5), (2026, 'Outras Rec. Correntes', 19.5),
	(2025, 'Receita de Serviços', 7.5), (2026, 'Receita de Serviços', 8),
	(2025, 'Contribuições', 4.5), (2026, 'Contribuições', 5),
	(2025, 'Receita de Capital', 2.5), (2026, 'Receita de Capital', 3);

-- CR.arvore: natureza da receita (v25×v26). 1 linha por exercício por nó.
INSERT INTO arvore (exercicio, id, parent_id, nome, arrecadado) VALUES
	(2025, 'rc', NULL, 'Receitas Correntes', 429.5), (2026, 'rc', NULL, 'Receitas Correntes', 459.4),
	(2025, 'rct', 'rc', 'Impostos, Taxas e C. Melhoria', 106), (2026, 'rct', 'rc', 'Impostos, Taxas e C. Melhoria', 118.5),
	(2025, 'iss', 'rct', 'ISS', 41.5), (2026, 'iss', 'rct', 'ISS', 46),
	(2025, 'iptu', 'rct', 'IPTU', 35), (2026, 'iptu', 'rct', 'IPTU', 38.5),
	(2025, 'itbi', 'rct', 'ITBI', 11.5), (2026, 'itbi', 'rct', 'ITBI', 14),
	(2025, 'tx', 'rct', 'Taxas', 11), (2026, 'tx', 'rct', 'Taxas', 12),
	(2025, 'cos', 'rct', 'COSIP', 7), (2026, 'cos', 'rct', 'COSIP', 8),
	(2025, 'rtr', 'rc', 'Transferências Correntes', 271.5), (2026, 'rtr', 'rc', 'Transferências Correntes', 286),
	(2025, 'fpm', 'rtr', 'FPM', 91), (2026, 'fpm', 'rtr', 'FPM', 96),
	(2025, 'icms', 'rtr', 'Cota-parte ICMS', 84), (2026, 'icms', 'rtr', 'Cota-parte ICMS', 88),
	(2025, 'fdb', 'rtr', 'FUNDEB', 49), (2026, 'fdb', 'rtr', 'FUNDEB', 52),
	(2025, 'sus', 'rtr', 'SUS', 27), (2026, 'sus', 'rtr', 'SUS', 28.5),
	(2025, 'ipva', 'rtr', 'IPVA', 9), (2026, 'ipva', 'rtr', 'IPVA', 9.5),
	(2025, 'fnde', 'rtr', 'FNDE', 7.5), (2026, 'fnde', 'rtr', 'FNDE', 8),
	(2025, 'rpa', 'rc', 'Receita Patrimonial', 18.5), (2026, 'rpa', 'rc', 'Receita Patrimonial', 22.4),
	(2025, 'rou', 'rc', 'Outras Receitas Correntes', 21.5), (2026, 'rou', 'rc', 'Outras Receitas Correntes', 19.5),
	(2025, 'rco', 'rc', 'Contribuições + Serviços', 12), (2026, 'rco', 'rc', 'Contribuições + Serviços', 13),
	(2025, 'rcap', NULL, 'Receitas de Capital', 2.5), (2026, 'rcap', NULL, 'Receitas de Capital', 3);
