#!/bin/sh
# Cria a tabela de auto-identificação do tenant e semeia com as envs.
# id_ibge é o id_tenant (isolamento é DB-por-entidade, então não há coluna
# tenant nas demais tabelas — este banco só contém dados desta entidade).
set -eu
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
	-v id_ibge="${TENANT_ID}" \
	-v slug="${TENANT_SLUG}" \
	-v nome="${TENANT_NOME}" \
	-v uf="${TENANT_UF}" <<'SQL'
CREATE TABLE IF NOT EXISTS tenant (
	id_ibge   text PRIMARY KEY,
	slug      text NOT NULL,
	nome      text NOT NULL,
	uf        text NOT NULL,
	criado_em timestamptz NOT NULL DEFAULT now()
);
INSERT INTO tenant (id_ibge, slug, nome, uf)
VALUES (:'id_ibge', :'slug', :'nome', :'uf')
ON CONFLICT (id_ibge) DO UPDATE
	SET slug = EXCLUDED.slug, nome = EXCLUDED.nome, uf = EXCLUDED.uf;
SQL
