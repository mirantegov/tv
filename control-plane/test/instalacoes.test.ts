import { describe, it, expect } from "vitest";
import { newDb } from "pg-mem";
import { buildApp } from "../src/app.js";
import { runMigrations } from "../src/db/migrate.js";

async function setup() {
  const { Pool } = newDb().adapters.createPg();
  const pool = new Pool();
  await runMigrations(pool);
  const app = buildApp({ pool, jwtSecret: "test-secret" });
  await app.ready();
  const token = app.jwt.sign({ sub: "1", tipo: "admin", nome: "Op" });
  return { app, pool, token };
}
const auth = (token: string) => ({ authorization: `Bearer ${token}` });

describe("instalacoes CRUD", () => {
  it("401 sem token", async () => {
    const { app } = await setup();
    const res = await app.inject({ method: "GET", url: "/instalacoes" });
    expect(res.statusCode).toBe(401);
  });
  it("cria, lista, edita, remove e grava audit_log", async () => {
    const { app, pool, token } = await setup();
    const post = await app.inject({ method: "POST", url: "/instalacoes", headers: auth(token),
      payload: { id_ibge: "4117909", slug: "palotina", nome: "Palotina", uf: "PR" } });
    expect(post.statusCode).toBe(201);
    expect(post.json()).toMatchObject({ id_ibge: "4117909", status: "a-instalar" });

    const list = await app.inject({ method: "GET", url: "/instalacoes", headers: auth(token) });
    expect(list.json()).toHaveLength(1);

    const patch = await app.inject({ method: "PATCH", url: "/instalacoes/4117909", headers: auth(token),
      payload: { status: "ativa" } });
    expect(patch.statusCode).toBe(200);
    const get = await app.inject({ method: "GET", url: "/instalacoes/4117909", headers: auth(token) });
    expect(get.json()).toMatchObject({ status: "ativa" });

    const del = await app.inject({ method: "DELETE", url: "/instalacoes/4117909", headers: auth(token) });
    expect(del.statusCode).toBe(204);
    const list2 = await app.inject({ method: "GET", url: "/instalacoes", headers: auth(token) });
    expect(list2.json()).toHaveLength(0);

    const audit = await pool.query("select acao, alvo from audit_log order by id");
    expect(audit.rows.map((r: any) => r.acao)).toEqual(["criou", "editou", "removeu"]);
    expect(audit.rows.every((r: any) => r.alvo === "instalacao:4117909")).toBe(true);
  });
});
