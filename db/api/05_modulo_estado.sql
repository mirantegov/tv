-- Estado on/off dos módulos, por tenant. Tabela-base (não view) exposta pelo
-- PostgREST para leitura E escrita — persiste no volume do Postgres, então
-- sobrevive a reinício do tenant e é compartilhada entre todos os usuários.
-- ponytail: escrita liberada ao web_anon porque o gate de auth é client-side
-- (demo). Em produção, proteger com auth real / RLS por papel de administrador.
CREATE TABLE IF NOT EXISTS api.modulo_estado (
	path          text PRIMARY KEY,           -- rota do módulo, ex.: '/folha'
	oculto        boolean NOT NULL DEFAULT false,
	atualizado_em timestamptz NOT NULL DEFAULT now()
);

-- Leitura + upsert (POST com Prefer: resolution=merge-duplicates) pelo PostgREST.
GRANT SELECT, INSERT, UPDATE ON api.modulo_estado TO web_anon;
