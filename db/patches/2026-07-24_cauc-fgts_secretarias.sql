-- Patch manual p/ bancos JÁ inicializados (init não re-roda em volume existente).
-- Aplica em CADA tenant (stage e palotina). IDEMPOTENTE: pode rodar mais de uma vez.
-- Cobre: (1) módulo Secretarias (novo) e (2) correções do CAUC (extrato 24/07/2026).
-- A certidão TCE é calculada ao vivo na view (vencimento - CURRENT_DATE) — nada a fazer.
BEGIN;

-- ============================================================================
-- 1) Módulo Secretarias — schema + tabela + view + grant + dados
-- ============================================================================
CREATE SCHEMA IF NOT EXISTS secretarias;

CREATE TABLE IF NOT EXISTS secretarias.resumo (
	exercicio           smallint NOT NULL,
	secretaria          text     NOT NULL,
	competencia         smallint NOT NULL CHECK (competencia BETWEEN 1 AND 12),
	dotacao_atualizada  numeric(14,2) NOT NULL,
	dotacao_inicial     numeric(14,2) NOT NULL,
	creditos_adicionais numeric(14,2) NOT NULL,
	empenhado           numeric(14,2) NOT NULL,
	liquidado           numeric(14,2) NOT NULL,
	pago                numeric(14,2) NOT NULL,
	restos              numeric(14,2) NOT NULL,
	saldo_a_empenhar    numeric(14,2) NOT NULL,
	PRIMARY KEY (exercicio, secretaria)
);

-- Provisório: mesmos valores p/ todas (Warehouse substitui por secretaria depois).
INSERT INTO secretarias.resumo (exercicio, secretaria, competencia, dotacao_atualizada,
	dotacao_inicial, creditos_adicionais, empenhado, liquidado, pago, restos, saldo_a_empenhar)
SELECT 2026, s, 6, 850, 780, 70, 470.1, 410.2, 384.3, 95.4, 379.9
FROM unnest(ARRAY[
	'gabinete', 'controladoria', 'administracao', 'financas', 'planejamento',
	'obras', 'agronegocio', 'saude', 'assistencia-social', 'educacao',
	'industria', 'esportes', 'urbanismo', 'desenvolvimento-economico',
	'transito', 'seguranca', 'meio-ambiente'
]) AS s
ON CONFLICT (exercicio, secretaria) DO UPDATE SET
	competencia         = EXCLUDED.competencia,
	dotacao_atualizada  = EXCLUDED.dotacao_atualizada,
	dotacao_inicial     = EXCLUDED.dotacao_inicial,
	creditos_adicionais = EXCLUDED.creditos_adicionais,
	empenhado           = EXCLUDED.empenhado,
	liquidado           = EXCLUDED.liquidado,
	pago                = EXCLUDED.pago,
	restos              = EXCLUDED.restos,
	saldo_a_empenhar    = EXCLUDED.saldo_a_empenhar;

CREATE OR REPLACE VIEW api.secretarias AS
SELECT json_object_agg(
	r.secretaria,
	json_build_object(
		'dotacao', r.dotacao_atualizada,
		'inicial', r.dotacao_inicial,
		'creditos', r.creditos_adicionais,
		'emp', r.empenhado,
		'liq', r.liquidado,
		'pago', r.pago,
		'restos', r.restos,
		'saldo', r.saldo_a_empenhar
	)
) AS data
FROM secretarias.resumo r
WHERE r.exercicio = (SELECT max(exercicio) FROM secretarias.resumo);

GRANT SELECT ON api.secretarias TO web_anon;

-- ============================================================================
-- 2) CAUC — correções conforme extrato de 24/07/2026
--    FGTS volta a Comprovado; total 29 -> 28; data da pesquisa 22 -> 24/07.
--    verificacao é chave de join resumo<->itens: atualizar os dois juntos.
-- ============================================================================
UPDATE siconfi.cauc_itens
	SET verificacao = DATE '2026-07-24'
	WHERE exercicio = 2026 AND verificacao = DATE '2026-07-22';

UPDATE siconfi.cauc_resumo
	SET verificacao = DATE '2026-07-24', total = 28
	WHERE exercicio = 2026 AND verificacao = DATE '2026-07-22';

UPDATE siconfi.cauc_itens
	SET status = 'ok'
	WHERE exercicio = 2026 AND exigencia = 'Regularidade com o FGTS (CAIXA)';

COMMIT;
