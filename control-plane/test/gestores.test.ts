import { describe, it, expect } from "vitest";
import { newDb } from "pg-mem";
import { buildApp } from "../src/app.js";
import { runMigrations } from "../src/db/migrate.js";
import { verificarSenha } from "../src/auth/hash.js";

async function setup() {
  const { Pool } = newDb().adapters.createPg();
  const pool = new Pool();
  await runMigrations(pool);
  await pool.query("insert into instalacao (id_ibge, slug, nome, uf) values ('4117909','palotina','Palotina','PR')");
  await pool.query("insert into entidade (id_entidade, id_ibge, nome, tipo) values ('ent-pref','4117909','Prefeitura','prefeitura')");
  const app = buildApp({ pool, jwtSecret: "s" });
  await app.ready();
  return { app, pool, token: app.jwt.sign({ sub: "1", tipo: "admin", nome: "Op" }) };
}
const auth = (t: string) => ({ authorization: `Bearer ${t}` });

describe("gestores CRUD", () => {
  it("cria gestor com senha hasheada; listagem não vaza hash", async () => {
    const { app, pool, token } = await setup();
    const post = await app.inject({ method: "POST", url: "/instalacoes/4117909/gestores", headers: auth(token),
      payload: { cpf: "073.207.009-05", nome: "Prefeito", senha: "segredo", role: "prefeito", id_entidade: "ent-pref" } });
    expect(post.statusCode).toBe(201);
    expect(JSON.stringify(post.json())).not.toContain("senha_hash");

    const row = await pool.query("select cpf, senha_hash from gestor");
    expect(row.rows[0].cpf).toBe("07320700905"); // só dígitos
    expect(await verificarSenha(row.rows[0].senha_hash, "segredo")).toBe(true);

    const list = await app.inject({ method: "GET", url: "/instalacoes/4117909/gestores", headers: auth(token) });
    expect(JSON.stringify(list.json())).not.toContain("senha_hash");
  });
  it("PATCH com senha re-hasheia (admin define)", async () => {
    const { app, pool, token } = await setup();
    await app.inject({ method: "POST", url: "/instalacoes/4117909/gestores", headers: auth(token),
      payload: { cpf: "07320700905", nome: "P", senha: "velha", role: "prefeito", id_entidade: "ent-pref" } });
    const patch = await app.inject({ method: "PATCH", url: "/gestores/07320700905", headers: auth(token),
      payload: { senha: "novaSenha" } });
    expect(patch.statusCode).toBe(200);
    const row = await pool.query("select senha_hash from gestor where cpf='07320700905'");
    expect(await verificarSenha(row.rows[0].senha_hash, "novaSenha")).toBe(true);
  });
  it("400 CPF inválido", async () => {
    const { app, token } = await setup();
    const res = await app.inject({ method: "POST", url: "/instalacoes/4117909/gestores", headers: auth(token),
      payload: { cpf: "123", nome: "X", senha: "y", role: "prefeito", id_entidade: "ent-pref" } });
    expect(res.statusCode).toBe(400);
  });
});
