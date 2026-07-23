-- ============================================================================
-- Módulo: Secretarias — Execução da Despesa por secretaria (rotas /sec/<slug>).
-- Mesmos 8 KPIs do módulo Despesa, porém uma linha por secretaria.
-- Valores em R$ milhões (numeric), como exibido no painel. mock: data.ts SEC.
-- ============================================================================
CREATE SCHEMA IF NOT EXISTS secretarias;

-- SEC[slug] — KPIs do topo por secretaria (1 linha por secretaria/exercício).
-- `secretaria` = slug estável usado no path /sec/<slug> (ex.: 'saude').
CREATE TABLE secretarias.resumo (
	exercicio           smallint NOT NULL,
	secretaria          text     NOT NULL,
	competencia         smallint NOT NULL CHECK (competencia BETWEEN 1 AND 12),
	dotacao_atualizada  numeric(14,2) NOT NULL,  -- SEC.dotacao
	dotacao_inicial     numeric(14,2) NOT NULL,  -- SEC.inicial
	creditos_adicionais numeric(14,2) NOT NULL,  -- SEC.creditos
	empenhado           numeric(14,2) NOT NULL,  -- SEC.emp
	liquidado           numeric(14,2) NOT NULL,  -- SEC.liq
	pago                numeric(14,2) NOT NULL,  -- SEC.pago
	restos              numeric(14,2) NOT NULL,  -- SEC.restos
	saldo_a_empenhar    numeric(14,2) NOT NULL,  -- SEC.saldo (dotação − empenhado)
	PRIMARY KEY (exercicio, secretaria)
);
