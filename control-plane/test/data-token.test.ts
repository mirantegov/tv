import { describe, it, expect } from "vitest";
import { newDb } from "pg-mem";
import jwt from "jsonwebtoken";
import { buildApp } from "../src/app.js";
import { runMigrations } from "../src/db/migrate.js";
import { hashSenha } from "../src/auth/hash.js";

async function setup() {
  const { Pool } = newDb().adapters.createPg();
  const pool = new Pool();
  await runMigrations(pool);
  await pool.query("insert into instalacao (id_ibge, slug, nome, uf, status) values ('4117909','palotina','Palotina','PR','ativa')");
  await pool.query("insert into licenca (id_ibge, ativo, validade) values ('4117909', true, '2999-01-01')");
  await pool.query("insert into entidade (id_entidade, id_ibge, nome, tipo) values ('12426','4117909','Prefeitura','prefeitura')");
  await pool.query("insert into gestor (cpf, id_ibge, id_entidade, nome, senha_hash, role) values ('07320700905','4117909','12426','Prefeito',$1,'prefeito')", [await hashSenha("segredo")]);
  await pool.query("insert into modulo_estado (id_ibge, path, oculto) values ('4117909','/despesa', true)");
  const app = buildApp({ pool, jwtSecret: "app-secret", pgrstSecret: "pgrst-secret" });
  await app.ready();
  return { app };
}

describe("data-token + /me/modulos", () => {
  it("login de gestor devolve data_token com role web_gestor e id_entidade", async () => {
    const { app } = await setup();
    const res = await app.inject({ method: "POST", url: "/auth/login",
      payload: { tipo: "gestor", cpf: "07320700905", senha: "segredo" } });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.data_token).toBeTruthy();
    const claims = jwt.verify(body.data_token, "pgrst-secret") as any;
    expect(claims).toMatchObject({ role: "web_gestor", id_entidade: "12426" });
  });
  it("GET /me/modulos devolve módulos da instalação do gestor", async () => {
    const { app } = await setup();
    const login = await app.inject({ method: "POST", url: "/auth/login",
      payload: { tipo: "gestor", cpf: "07320700905", senha: "segredo" } });
    const token = login.json().token;
    const res = await app.inject({ method: "GET", url: "/me/modulos", headers: { authorization: `Bearer ${token}` } });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual([{ path: "/despesa", oculto: true }]);
  });
});
