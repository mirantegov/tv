import { describe, it, expect } from "vitest";
import { newDb } from "pg-mem";
import { buildApp } from "../src/app.js";

function testApp() {
  const { Pool } = newDb().adapters.createPg();
  return buildApp({ pool: new Pool(), jwtSecret: "test-secret" });
}

describe("GET /auth/me", () => {
  it("401 sem token", async () => {
    const app = testApp();
    const res = await app.inject({ method: "GET", url: "/auth/me" });
    expect(res.statusCode).toBe(401);
  });
  it("devolve o payload com token válido", async () => {
    const app = testApp();
    await app.ready();
    const token = app.jwt.sign({ sub: "1", tipo: "admin", nome: "Admin" });
    const res = await app.inject({
      method: "GET", url: "/auth/me",
      headers: { authorization: `Bearer ${token}` },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ sub: "1", tipo: "admin", nome: "Admin" });
  });
});
