-- Seed Tributação — Município de Palotina, exercício 2026 (até Jun).
-- Extraído de src/data.ts (export TB). Fonte única = data.ts. Valores em R$ milhões.
SET search_path TO tributacao;

INSERT INTO resumo (exercicio, competencia, receita_propria, receita_propria_pct,
	iptu_lancado, iptu_arrecadado, iptu_adimplencia_pct, iss_arrecadado, iss_yoy_pct,
	itbi_arrecadado, itbi_transmissoes, divida_ativa_saldo, divida_ativa_rec_pct,
	inadimplencia_vencida, renuncia, cota_unica_pct)
VALUES (2026, 6, 118.5, 25.6, 82.0, 38.5, 47.0, 46.0, 10.8, 14.0, 940, 224.5, 3.8, 22.4, 9.8, 34);

-- TB.tributos: [nome, lancado, arrecadado, inadimplencia_vencida, recuperado_da]
INSERT INTO tributos (exercicio, ord, tributo, lancado, arrecadado, inadimplencia_vencida, recuperado_divida_ativa) VALUES
	(2026, 1, 'IPTU',  82.0, 38.5, 18.0, 4.6),
	(2026, 2, 'ISS',   49.0, 46.0,  2.8, 2.1),
	(2026, 3, 'ITBI',  14.5, 14.0,  0.5, 0.6),
	(2026, 4, 'Taxas', 14.0, 12.0,  1.0, 0.5),
	(2026, 5, 'COSIP',  8.2,  8.0,  0.1, 0.0);

-- TB.da: [nome, saldoInicial, inscricoes, recuperado, cancelado, ajuizPct]
INSERT INTO divida_ativa (exercicio, ord, tributo, saldo_inicial, inscricoes, recuperado, cancelado, ajuizado_pct) VALUES
	(2026, 1, 'IPTU',  128.0, 22.0, 4.6, 3.5, 38),
	(2026, 2, 'ISS',    42.0,  8.0, 2.1, 1.2, 45),
	(2026, 3, 'ITBI',    6.0,  1.0, 0.6, 0.3, 30),
	(2026, 4, 'Taxas',  18.0,  3.0, 0.5, 0.8, 25),
	(2026, 5, 'COSIP',   9.0,  1.5, 0.0, 0.4, 20);

-- TB.meses: [mes, iptu, iss, itbi] (Jan..Jun)
INSERT INTO mensal (exercicio, mes, iptu, iss, itbi) VALUES
	(2026, 1, 12.0, 7.2, 2.1),
	(2026, 2,  8.5, 7.5, 2.3),
	(2026, 3,  5.0, 7.8, 2.4),
	(2026, 4,  4.5, 7.6, 2.2),
	(2026, 5,  4.5, 8.0, 2.5),
	(2026, 6,  4.0, 7.9, 2.5);

-- TB.setores: ISS por setor econômico
INSERT INTO setores_iss (exercicio, ord, setor, arrecadado) VALUES
	(2026, 1, 'Serviços de saúde',        9.2),
	(2026, 2, 'Construção civil',         7.8),
	(2026, 3, 'Serviços financeiros',     6.5),
	(2026, 4, 'Educação privada',         5.0),
	(2026, 5, 'Tecnologia / TI',          4.8),
	(2026, 6, 'Transporte / logística',   4.2),
	(2026, 7, 'Profissionais liberais',   3.5),
	(2026, 8, 'Outros serviços',          5.0);

-- TB.bairros: [bairro, arrecadado, inadimplencia]
INSERT INTO bairros (exercicio, bairro, arrecadado, inadimplencia) VALUES
	(2026, 'Centro',            9.5, 3.2),
	(2026, 'Zona Sul',          8.0, 2.5),
	(2026, 'Zona Norte',        6.5, 4.0),
	(2026, 'Zona Leste',        5.5, 3.8),
	(2026, 'Zona Oeste',        5.0, 2.0),
	(2026, 'Distritos / Rural', 4.0, 2.5);

-- TB.devedores: maiores devedores. LGPD — nomes ANONIMIZADOS (mock já fictício;
-- ainda assim mascarados p/ evitar qualquer nome verossímil). Valores preservados.
INSERT INTO devedores (exercicio, ord, contribuinte, tributo, situacao, valor) VALUES
	(2026,  1, 'Empresa A',       'IPTU', 'Ajuizado',        2.8),
	(2026,  2, 'Empresa B',       'ISS',  'Em cobrança',     1.9),
	(2026,  3, 'Empresa C',       'ISS',  'Parcelado',       1.6),
	(2026,  4, 'Empresa D',       'ITBI', 'Ajuizado',        1.2),
	(2026,  5, 'Empresa E',       'IPTU', 'Em Dívida Ativa', 1.1),
	(2026,  6, 'Empresa F',       'ISS',  'Em cobrança',     0.9),
	(2026,  7, 'Contribuinte 1',  'IPTU', 'Em Dívida Ativa', 0.7),
	(2026,  8, 'Contribuinte 2',  'IPTU', 'Parcelado',       0.6),
	(2026,  9, 'Empresa G',       'ISS',  'Ajuizado',        0.6),
	(2026, 10, 'Empresa H',       'IPTU', 'Em Dívida Ativa', 0.5);

-- TB.renuncias: [descricao, tributo, valor, base_legal]
INSERT INTO renuncias (exercicio, descricao, tributo, valor, base_legal) VALUES
	(2026, 'Isenção IPTU (aposentados / baixa renda)', 'IPTU',     3.2, 'Lei Mun. 1.234/2008'),
	(2026, 'Imunidade (templos e entidades)',          'Diversos', 2.5, 'CF art. 150, VI'),
	(2026, 'Isenção ISS (incentivo / MEI)',            'ISS',      1.8, 'Lei Mun. 2.001/2015'),
	(2026, 'Anistia / Remissão (REFIS)',               'Diversos', 1.5, 'Lei Mun. 3.045/2025'),
	(2026, 'Redução ITBI (1º imóvel)',                 'ITBI',     0.8, 'Lei Mun. 1.890/2012');
