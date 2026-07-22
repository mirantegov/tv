-- Leitura das views api p/ o papel anônimo do PostgREST. Roda após as views.
GRANT SELECT ON ALL TABLES IN SCHEMA api TO web_anon;
-- Views novas aplicadas depois também herdam SELECT p/ web_anon.
ALTER DEFAULT PRIVILEGES IN SCHEMA api GRANT SELECT ON TABLES TO web_anon;
