-- Seed Licitações — Município de Palotina (IBGE 4117909), exercício 2026 (até Jun).
-- Extraído de src/data.ts (export LIC). Fonte única = data.ts. Valores em R$ milhões.
SET search_path TO licitacoes;

INSERT INTO resumo (exercicio, competencia, homologado, processos, estimado, economia,
	economia_pct, taxa_sucesso_pct, tempo_medio_dias, em_andamento, em_andamento_valor,
	direta_pct, desertos_pct, fornecedores_media, meepp_exclusivos,
	pncp_no_prazo, pncp_fora_prazo, pncp_pendentes)
VALUES (2026, 6, 142.0, 152, 168.5, 26.5, 15.7, 88.4, 32, 42, 58.0,
	16.5, 8.2, 4.3, 64, 178, 6, 2);

INSERT INTO meepp (exercicio, ord, destino, valor) VALUES
	(2026, 1, 'ME/EPP do município', 38.5),
	(2026, 2, 'ME/EPP de outros municípios', 21.0),
	(2026, 3, 'Demais empresas', 82.5);

-- vencimento: mock traz 'Mês/2026' → data no 1º dia do mês; a view reconstrói o rótulo.
INSERT INTO atas (exercicio, ord, objeto, registrado, consumido, vencimento) VALUES
	(2026, 1, 'Medicamentos', 18.0, 11.2, '2026-11-01'),
	(2026, 2, 'Merenda escolar', 12.5, 6.8, '2026-09-01'),
	(2026, 3, 'Combustíveis', 9.0, 5.1, '2026-12-01'),
	(2026, 4, 'Material de expediente', 7.5, 2.9, '2026-08-01');

INSERT INTO mensal (exercicio, mes, estimado, homologado) VALUES
	(2026, 1, 21.0, 18.0),
	(2026, 2, 26.0, 22.0),
	(2026, 3, 30.5, 26.0),
	(2026, 4, 28.0, 24.0),
	(2026, 5, 31.0, 26.0),
	(2026, 6, 32.0, 26.0);

INSERT INTO modalidades (exercicio, ord, modalidade, processos, estimado, homologado,
	economia_pct, tempo_medio_dias, taxa_sucesso_pct) VALUES
	(2026, 1, 'Pregão Eletrônico', 95, 120.7, 98.0, 18.8, 32, 90),
	(2026, 2, 'Dispensa (art. 75)', 30, 17.6, 16.5, 6.5, 12, 100),
	(2026, 3, 'Concorrência', 8, 20.5, 18.0, 12.0, 72, 78),
	(2026, 4, 'Inexigibilidade (art. 74)', 12, 7.0, 7.0, 0.5, 18, 100),
	(2026, 5, 'Concurso / Diálogo / Outros', 7, 2.7, 2.5, 8.0, 95, 72);

INSERT INTO funil (exercicio, etapa, ordem, quantidade) VALUES
	(2026, 'Publicados', 1, 214),
	(2026, 'Julgados', 2, 180),
	(2026, 'Homologados', 3, 152),
	(2026, 'Contratados', 4, 138);

INSERT INTO situacoes (exercicio, situacao, quantidade) VALUES
	(2026, 'Homologado', 152),
	(2026, 'Em andamento', 42),
	(2026, 'Fracassado', 10),
	(2026, 'Deserto', 6),
	(2026, 'Revogado / Anulado', 4);

INSERT INTO objetos (exercicio, categoria, valor) VALUES
	(2026, 'Obras e engenharia', 42.0),
	(2026, 'Serviços contínuos', 38.5),
	(2026, 'Material de consumo', 24.0),
	(2026, 'Equip. / permanente', 18.5),
	(2026, 'TI', 12.0),
	(2026, 'Outros', 7.0);

INSERT INTO pipeline (processo, exercicio, ord, objeto, modalidade, orgao, estimado, situacao, dias) VALUES
	('PE-2026/0188', 2026, 1, 'Aquisição de medicamentos', 'Pregão Eletrônico', 'Saúde', 12.5, 'Em julgamento', 22),
	('CC-2026/0042', 2026, 2, 'Construção de creche', 'Concorrência', 'Educação', 18.0, 'Habilitação', 58),
	('PE-2026/0201', 2026, 3, 'Material de limpeza', 'Pregão Eletrônico', 'Administração', 3.2, 'Análise de proposta', 15),
	('DL-2026/0310', 2026, 4, 'Manutenção de elevadores', 'Dispensa', 'Gabinete', 0.9, 'Em análise', 9),
	('PE-2026/0195', 2026, 5, 'Combustíveis', 'Pregão Eletrônico', 'Infraestrutura', 14.0, 'Fase recursal', 41),
	('CC-2026/0050', 2026, 6, 'Reforma do hospital municipal', 'Concorrência', 'Saúde', 9.4, 'Edital publicado', 72);

INSERT INTO contratacao_direta (exercicio, ord, base_legal, objeto, fornecedor, valor) VALUES
	(2026, 1, 'Art. 75, II', 'Material de escritório', 'Papelaria Central Ltda.', 0.18),
	(2026, 2, 'Art. 75, IV', 'Equipamento hospitalar', 'Med Suprimentos Hosp. Ltda.', 1.2),
	(2026, 3, 'Art. 74, I', 'Software proprietário', 'TechSolutions Serviços Ltda.', 0.95),
	(2026, 4, 'Art. 75, I', 'Reparo emergencial de via', 'Construtora Aurora Ltda.', 0.42),
	(2026, 5, 'Art. 74, III', 'Apresentação artística (evento)', 'Produtora Palco Livre Ltda.', 0.3);

INSERT INTO desertos_fracassados (exercicio, ord, objeto, modalidade, motivo) VALUES
	(2026, 1, 'Aquisição de tratores agrícolas', 'Pregão Eletrônico', 'Sem propostas (deserto)'),
	(2026, 2, 'Serviço de telemedicina', 'Pregão Eletrônico', 'Propostas acima do estimado (fracassado)'),
	(2026, 3, 'Material odontológico', 'Pregão Eletrônico', 'Amostras reprovadas (fracassado)'),
	(2026, 4, 'Locação de retroescavadeira', 'Dispensa', 'Sem interessados (deserto)');
