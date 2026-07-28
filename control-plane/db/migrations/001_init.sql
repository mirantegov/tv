CREATE TABLE instalacao (
  id_ibge       text PRIMARY KEY,
  slug          text NOT NULL,
  nome          text NOT NULL,
  uf            text NOT NULL,
  status        text NOT NULL DEFAULT 'a-instalar',  -- ativa|desativada|a-instalar
  criado_em     timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE licenca (
  id_ibge       text PRIMARY KEY REFERENCES instalacao(id_ibge) ON DELETE CASCADE,
  ativo         boolean NOT NULL DEFAULT false,
  validade      date,
  atualizado_em timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE entidade (
  id_entidade   text PRIMARY KEY,
  id_ibge       text NOT NULL REFERENCES instalacao(id_ibge) ON DELETE CASCADE,
  nome          text NOT NULL,
  tipo          text NOT NULL,   -- prefeitura|camara|rpps|saneamento|outra
  criado_em     timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE gestor (
  cpf           text PRIMARY KEY,
  id_ibge       text NOT NULL REFERENCES instalacao(id_ibge) ON DELETE CASCADE,
  id_entidade   text NOT NULL REFERENCES entidade(id_entidade),
  nome          text NOT NULL,
  senha_hash    text NOT NULL,
  role          text NOT NULL,
  criado_em     timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE modulo_estado (
  id_ibge       text NOT NULL REFERENCES instalacao(id_ibge) ON DELETE CASCADE,
  path          text NOT NULL,
  oculto        boolean NOT NULL DEFAULT false,
  atualizado_em timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id_ibge, path)
);
CREATE TABLE admin_user (
  id            serial PRIMARY KEY,
  login         text UNIQUE NOT NULL,
  senha_hash    text NOT NULL,
  nome          text NOT NULL,
  criado_em     timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE audit_log (
  id            serial PRIMARY KEY,
  ator          text NOT NULL,
  acao          text NOT NULL,
  alvo          text,
  payload       jsonb,
  criado_em     timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE acesso_log (
  id            serial PRIMARY KEY,
  cpf           text NOT NULL,
  id_ibge       text NOT NULL,
  id_entidade   text NOT NULL,
  criado_em     timestamptz NOT NULL DEFAULT now()
);
