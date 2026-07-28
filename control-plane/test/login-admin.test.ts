import { describe, it, expect } from "vitest";
import { newDb } from "pg-mem";
import { buildApp } from "../src/app.js";
import { runMigrations } from "../src/db/migrate.js";
import { hashSenha } from "../src/auth/hash.js";

async function setup() {
  const { Pool } = newDb().adapters.createPg();
  const pool = new Pool();
  await runMigrations(pool);
  await pool.query(
    "insert into admin_user (login, senha_hash, nome) values ($1,$2,$3)",
    ["op", await hashSenha("senha-forte"), "Operador"]
  );
  return buildApp({ pool, jwtSecret: "test-secret" });
}

describe("POST /auth/login (admin)", () => {
  it("200 com credencial válida", async () => {
    const app = await setup();
    const res = await app.inject({ method: "POST", url: "/auth/login",
      payload: { tipo: "admin", login: "op", senha: "senha-forte" } });
    expect(res.statusCode).toBe(200);
    expect(res.json().token).toBeTruthy();
    expect(res.json().perfil).toMatchObject({ tipo: "admin", nome: "Operador" });
  });
  it("401 com senha errada", async () => {
    const app = await setup();
    const res = await app.inject({ method: "POST", url: "/auth/login",
      payload: { tipo: "admin", login: "op", senha: "errada" } });
    expect(res.statusCode).toBe(401);
  });
});
