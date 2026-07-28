import { describe, it, expect } from "vitest";
import { newDb } from "pg-mem";
import { buildApp } from "../src/app.js";
import { runMigrations } from "../src/db/migrate.js";

async function setup() {
  const { Pool } = newDb().adapters.createPg();
  const pool = new Pool();
  await runMigrations(pool);
  await pool.query("insert into instalacao (id_ibge, slug, nome, uf) values ('4117909','palotina','Palotina','PR')");
  const app = buildApp({ pool, jwtSecret: "s" });
  await app.ready();
  return { app, pool, token: app.jwt.sign({ sub: "1", tipo: "admin", nome: "Op" }) };
}
const auth = (t: string) => ({ authorization: `Bearer ${t}` });

describe("entidades CRUD", () => {
  it("cria, lista, edita e remove entidade", async () => {
    const { app, token } = await setup();
    const post = await app.inject({ method: "POST", url: "/instalacoes/4117909/entidades", headers: auth(token),
      payload: { id_entidade: "ent-pref", nome: "Prefeitura", tipo: "prefeitura" } });
    expect(post.statusCode).toBe(201);
    const list = await app.inject({ method: "GET", url: "/instalacoes/4117909/entidades", headers: auth(token) });
    expect(list.json()).toHaveLength(1);
    const patch = await app.inject({ method: "PATCH", url: "/entidades/ent-pref", headers: auth(token),
      payload: { nome: "Prefeitura Municipal" } });
    expect(patch.json()).toMatchObject({ nome: "Prefeitura Municipal" });
    const del = await app.inject({ method: "DELETE", url: "/entidades/ent-pref", headers: auth(token) });
    expect(del.statusCode).toBe(204);
  });
});
