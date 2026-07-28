import { describe, it, expect } from "vitest";
import { newDb } from "pg-mem";
import { buildApp } from "../src/app.js";
import { runMigrations } from "../src/db/migrate.js";
import { mascararCpf } from "../src/logs/mask.js";

async function setup() {
  const { Pool } = newDb().adapters.createPg();
  const pool = new Pool();
  await runMigrations(pool);
  await pool.query("insert into instalacao (id_ibge, slug, nome, uf) values ('4117909','palotina','Palotina','PR')");
  await pool.query("insert into entidade (id_entidade, id_ibge, nome, tipo) values ('ent-pref','4117909','Prefeitura','prefeitura')");
  await pool.query("insert into gestor (cpf, id_ibge, id_entidade, nome, senha_hash, role) values ('07320700905','4117909','ent-pref','Prefeito','x','prefeito')");
  for (let i = 0; i < 3; i++) await pool.query("insert into acesso_log (cpf, id_ibge, id_entidade) values ('07320700905','4117909','ent-pref')");
  await pool.query("insert into audit_log (ator, acao, alvo) values ('Op','criou','instalacao:4117909')");
  await pool.query("insert into audit_log (ator, acao, alvo) values ('Op','editou','gestor:07320700905')");
  const app = buildApp({ pool, jwtSecret: "s" });
  await app.ready();
  return { app, token: app.jwt.sign({ sub: "1", tipo: "admin", nome: "Op" }) };
}
const auth = (t: string) => ({ authorization: `Bearer ${t}` });

describe("logs", () => {
  it("mascararCpf", () => {
    expect(mascararCpf("07320700905")).toBe("***.207.***-**");
  });
  it("403 para gestor", async () => {
    const { app } = await setup();
    const g = app.jwt.sign({ sub: "x", tipo: "gestor", nome: "G", role: "prefeito", id_entidade: "ent-pref", id_ibge: "4117909" });
    const res = await app.inject({ method: "GET", url: "/logs/acessos", headers: auth(g) });
    expect(res.statusCode).toBe(403);
  });
  it("acessos: paginado, com nome e cpf mascarado", async () => {
    const { app, token } = await setup();
    const res = await app.inject({ method: "GET", url: "/logs/acessos?limit=2", headers: auth(token) });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.total).toBe(3);
    expect(body.rows).toHaveLength(2);
    expect(body.rows[0]).toMatchObject({ nome: "Prefeito", id_entidade: "ent-pref" });
    expect(body.rows[0].cpf).toBe("***.207.***-**");
    expect(JSON.stringify(body)).not.toContain("07320700905");
  });
  it("auditoria: filtro por id_ibge (substring do alvo)", async () => {
    const { app, token } = await setup();
    const all = await app.inject({ method: "GET", url: "/logs/auditoria", headers: auth(token) });
    expect(all.json().total).toBe(2);
    const porId = await app.inject({ method: "GET", url: "/logs/auditoria?id_ibge=4117909", headers: auth(token) });
    expect(porId.json().total).toBe(1);
  });
});
