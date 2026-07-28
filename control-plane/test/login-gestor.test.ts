import { describe, it, expect } from "vitest";
import { newDb } from "pg-mem";
import { buildApp } from "../src/app.js";
import { runMigrations } from "../src/db/migrate.js";
import { hashSenha } from "../src/auth/hash.js";

async function setup(opts: { ativo: boolean; validade: string }) {
  const { Pool } = newDb().adapters.createPg();
  const pool = new Pool();
  await runMigrations(pool);
  await pool.query("insert into instalacao (id_ibge, slug, nome, uf, status) values ('4117909','palotina','Palotina','PR','ativa')");
  await pool.query("insert into licenca (id_ibge, ativo, validade) values ('4117909',$1,$2)", [opts.ativo, opts.validade]);
  await pool.query("insert into entidade (id_entidade, id_ibge, nome, tipo) values ('ent-pref','4117909','Prefeitura','prefeitura')");
  await pool.query(
    "insert into gestor (cpf, id_ibge, id_entidade, nome, senha_hash, role) values ($1,'4117909','ent-pref','Prefeito',$2,'prefeito')",
    ["07320700905", await hashSenha("segredo")]
  );
  return { app: buildApp({ pool, jwtSecret: "test-secret" }), pool };
}

describe("POST /auth/login (gestor)", () => {
  it("200 + id_entidade e grava acesso_log", async () => {
    const { app, pool } = await setup({ ativo: true, validade: "2999-01-01" });
    const res = await app.inject({ method: "POST", url: "/auth/login",
      payload: { tipo: "gestor", cpf: "07320700905", senha: "segredo" } });
    expect(res.statusCode).toBe(200);
    expect(res.json().perfil).toMatchObject({ tipo: "gestor", id_entidade: "ent-pref", id_ibge: "4117909", role: "prefeito" });
    const log = await pool.query("select cpf, id_entidade from acesso_log");
    expect(log.rows[0]).toMatchObject({ cpf: "07320700905", id_entidade: "ent-pref" });
  });
  it("401 senha errada", async () => {
    const { app } = await setup({ ativo: true, validade: "2999-01-01" });
    const res = await app.inject({ method: "POST", url: "/auth/login",
      payload: { tipo: "gestor", cpf: "07320700905", senha: "x" } });
    expect(res.statusCode).toBe(401);
  });
  it("403 licença vencida", async () => {
    const { app } = await setup({ ativo: true, validade: "2000-01-01" });
    const res = await app.inject({ method: "POST", url: "/auth/login",
      payload: { tipo: "gestor", cpf: "07320700905", senha: "segredo" } });
    expect(res.statusCode).toBe(403);
  });
});
