-- RLS por id_entidade em todas as tabelas dos schemas de módulo.
-- id_entidade = código TCE/PR (arbitrário). Default = app.id_entidade (setado por 00_tenant.sh).
-- zz_ — aplicado por último (10_apply_schemas.sh ordena db/schemas/*.sql), depois de as tabelas existirem.
DO $$
DECLARE r record;
DECLARE ent text := current_setting('app.id_entidade', true);
BEGIN
  IF ent IS NULL OR ent = '' THEN ent := '00000'; END IF;
  FOR r IN
    SELECT schemaname, tablename FROM pg_tables
    WHERE schemaname NOT IN ('pg_catalog','information_schema','api','public')
  LOOP
    EXECUTE format('ALTER TABLE %I.%I ADD COLUMN IF NOT EXISTS id_entidade text NOT NULL DEFAULT %L',
                   r.schemaname, r.tablename, ent);
    EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', r.schemaname, r.tablename);
    EXECUTE format('DROP POLICY IF EXISTS ent_isol ON %I.%I', r.schemaname, r.tablename);
    EXECUTE format($p$CREATE POLICY ent_isol ON %I.%I FOR SELECT
                     USING (id_entidade = current_setting('request.jwt.claims', true)::json->>'id_entidade')$p$,
                   r.schemaname, r.tablename);
  END LOOP;
END $$;
