-- Schema `api`: views que remontam o shape dos exports de data.ts.
-- O PostgREST expõe SÓ este schema (PGRST_DB_SCHEMAS=api).
CREATE SCHEMA IF NOT EXISTS api;

-- Papel anônimo de leitura usado pelo PostgREST (PGRST_DB_ANON_ROLE=web_anon).
DO $$ BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'web_anon') THEN
		CREATE ROLE web_anon NOLOGIN;
	END IF;
END $$;
GRANT USAGE ON SCHEMA api TO web_anon;

-- Rótulo de mês (1→Jan…12→Dez), usado pelas séries mensais.
CREATE OR REPLACE FUNCTION api.mes_lbl(m smallint) RETURNS text
	LANGUAGE sql IMMUTABLE AS $$
	SELECT (ARRAY['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'])[m];
$$;
