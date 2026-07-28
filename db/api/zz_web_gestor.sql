-- Papel usado pelo PostgREST quando o JWT traz role=web_gestor (RLS aplica).
-- zz_ — aplicado por último (20_api.sh ordena db/api/*.sql). Nomes de arquivo sem
-- prefixo numérico (contratos.sql, despesa.sql, ...) ordenam DEPOIS de arquivos
-- com prefixo "0..9" (00_setup, 05_modulo_estado, 99_grants), então "98_" rodaria
-- ANTES das views existirem — por isso "zz_", que ordena depois de tudo.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='web_gestor') THEN
    CREATE ROLE web_gestor NOLOGIN;
  END IF;
END $$;

GRANT USAGE ON SCHEMA api TO web_gestor;
GRANT SELECT ON ALL TABLES IN SCHEMA api TO web_gestor;
ALTER DEFAULT PRIVILEGES IN SCHEMA api GRANT SELECT ON TABLES TO web_gestor;

-- security_invoker: o RLS das tabelas base vale quando web_gestor lê via view.
-- web_gestor precisa de SELECT nas tabelas base dos schemas de módulo.
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT schemaname, tablename FROM pg_tables
           WHERE schemaname NOT IN ('pg_catalog','information_schema','api','public')
  LOOP
    EXECUTE format('GRANT USAGE ON SCHEMA %I TO web_gestor', r.schemaname);
    EXECUTE format('GRANT SELECT ON %I.%I TO web_gestor', r.schemaname, r.tablename);
  END LOOP;
  FOR r IN SELECT table_name FROM information_schema.views WHERE table_schema='api'
  LOOP
    EXECUTE format('ALTER VIEW api.%I SET (security_invoker = true)', r.table_name);
  END LOOP;
END $$;

-- O papel autenticador do PostgREST precisa poder assumir web_gestor.
DO $$ BEGIN
  EXECUTE format('GRANT web_gestor TO %I', current_user);
END $$;
