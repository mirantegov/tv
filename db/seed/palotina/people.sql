-- Seed People Analytics — Município de Palotina, exercício 2026 (competência Jun).
-- Extraído de src/data.ts (export PA). Fonte única = data.ts.
SET search_path TO people;

INSERT INTO resumo (exercicio, competencia, headcount, total, inativos,
	turnover_pct, absenteismo_pct, tempo_medio_anos, elegiveis, elegiveis_pct,
	idade_media, cobertura_pct, providos, autorizados, razao_comissionados_pct)
VALUES (2026, 6, 4850, 6770, 1920, 6.2, 4.1, 11.8, 410, 8.5, 44.6, 86.6, 4850, 5600, 13.6);

-- [faixa, masculino, feminino] — ordenado por faixa (texto)
INSERT INTO piramide (exercicio, faixa, masculino, feminino) VALUES
	(2026, '18–29', 210, 280),
	(2026, '30–39', 490, 650),
	(2026, '40–49', 650, 840),
	(2026, '50–59', 560, 700),
	(2026, '60+', 210, 260);

-- headcount por órgão — ordenado por headcount desc
INSERT INTO orgaos (exercicio, orgao, headcount) VALUES
	(2026, 'Educação', 1850),
	(2026, 'Saúde', 1120),
	(2026, 'Gabinete e Demais', 550),
	(2026, 'Administração', 520),
	(2026, 'Infraestrutura', 430),
	(2026, 'Assistência', 380);

-- servidores por vínculo — ordenado por servidores desc
INSERT INTO vinculos (exercicio, vinculo, servidores) VALUES
	(2026, 'Efetivos', 3980),
	(2026, 'Comissionados', 540),
	(2026, 'Temporários', 280),
	(2026, 'Agentes políticos', 50);

-- admissões × desligamentos mensais
INSERT INTO movimentacao (exercicio, mes, admissoes, desligamentos) VALUES
	(2026, 1, 18, 12),
	(2026, 2, 22, 15),
	(2026, 3, 30, 20),
	(2026, 4, 25, 18),
	(2026, 5, 20, 22),
	(2026, 6, 28, 19);

-- dias de afastamento por motivo — ordenado por dias desc
INSERT INTO absenteismo (exercicio, motivo, dias) VALUES
	(2026, 'Licença saúde (CID)', 4200),
	(2026, 'Licença maternidade', 1800),
	(2026, 'Licença-prêmio', 1200),
	(2026, 'Faltas / abonos', 900),
	(2026, 'Outras', 600),
	(2026, 'Acidente de trabalho', 350);

-- tempo de serviço — faixa não ordenável por texto/valor, usa ord
INSERT INTO tempo_servico (exercicio, ord, faixa, servidores) VALUES
	(2026, 1, '0–5', 980),
	(2026, 2, '5–10', 1150),
	(2026, 3, '10–15', 1020),
	(2026, 4, '15–20', 780),
	(2026, 5, '20–25', 520),
	(2026, 6, '25+', 400);

-- escolaridade — ordenado por servidores desc
INSERT INTO escolaridade (exercicio, nivel, servidores) VALUES
	(2026, 'Superior', 2150),
	(2026, 'Médio', 1480),
	(2026, 'Fundamental', 620),
	(2026, 'Pós-graduação', 600);

-- projeção de elegíveis à aposentadoria — ordenado por ano
INSERT INTO elegiveis_projecao (ano, elegiveis) VALUES
	(2026, 410),
	(2027, 520),
	(2028, 660),
	(2029, 820),
	(2030, 990),
	(2031, 1190);

-- [orgao, headcount, efetivos, comissionados, temporarios, vagas, idade_media]
INSERT INTO quadro (exercicio, ord, orgao, headcount, efetivos, comissionados, temporarios, vagas_autorizadas, idade_media) VALUES
	(2026, 1, 'Educação', 1850, 1620, 120, 110, 2100, 45.2),
	(2026, 2, 'Saúde', 1120, 930, 90, 100, 1300, 42.8),
	(2026, 3, 'Administração', 520, 430, 70, 20, 560, 46.1),
	(2026, 4, 'Infraestrutura e Obras', 430, 360, 40, 30, 500, 47.5),
	(2026, 5, 'Assistência Social', 380, 300, 60, 20, 420, 43.0),
	(2026, 6, 'Gabinete e Demais', 550, 340, 160, 0, 720, 44.0);

-- [carreira, elegiveis_hoje, elegiveis_5anos, pct_do_cargo]
INSERT INTO sucessao (exercicio, ord, carreira, elegiveis_hoje, elegiveis_5anos, pct_do_cargo) VALUES
	(2026, 1, 'Professor', 180, 420, 32.5),
	(2026, 2, 'Médico', 45, 95, 28.0),
	(2026, 3, 'Aux. administrativo', 60, 120, 22.0),
	(2026, 4, 'Enfermagem / ACS', 55, 110, 18.5),
	(2026, 5, 'Guarda municipal', 30, 75, 21.0),
	(2026, 6, 'Demais carreiras', 40, 160, 12.0);
