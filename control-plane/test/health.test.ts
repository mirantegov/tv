import { describe, it, expect } from "vitest";
import { newDb } from "pg-mem";
import { buildApp } from "../src/app.js";

function testApp() {
  const { Pool } = newDb().adapters.createPg();
  return buildApp({ pool: new Pool() });
}

describe("GET /health", () => {
  it("returns ok", async () => {
    const app = testApp();
    const res = await app.inject({ method: "GET", url: "/health" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: "ok" });
  });
  it("responde com cabeçalho CORS para a origem do /admin", async () => {
    const app = testApp();
    const res = await app.inject({ method: "GET", url: "/health", headers: { origin: "http://localhost:5173" } });
    expect(res.headers["access-control-allow-origin"]).toBe("http://localhost:5173");
  });
});
