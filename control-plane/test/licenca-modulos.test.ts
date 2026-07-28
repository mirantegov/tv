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

describe("licença e módulos", () => {
  it("define e relê licença", async () => {
    const { app, token } = await setup();
    const put = await app.inject({ method: "PUT", url: "/instalacoes/4117909/licenca", headers: auth(token),
      payload: { ativo: true, validade: "2027-12-31" } });
    expect(put.statusCode).toBe(200);
    const get = await app.inject({ method: "GET", url: "/instalacoes/4117909", headers: auth(token) });
    expect(get.json()).toMatchObject({ licenca_ativo: true });
  });
  it("define e relê módulos (upsert por path)", async () => {
    const { app, token } = await setup();
    await app.inject({ method: "PUT", url: "/instalacoes/4117909/modulos", headers: auth(token),
      payload: { modulos: [{ path: "/despesa", oculto: true }, { path: "/receita", oculto: false }] } });
    // re-PUT do mesmo path atualiza, não duplica
    await app.inject({ method: "PUT", url: "/instalacoes/4117909/modulos", headers: auth(token),
      payload: { modulos: [{ path: "/despesa", oculto: false }] } });
    const get = await app.inject({ method: "GET", url: "/instalacoes/4117909/modulos", headers: auth(token) });
    const mods = get.json() as { path: string; oculto: boolean }[];
    expect(mods.find((m) => m.path === "/despesa")!.oculto).toBe(false);
    expect(mods.find((m) => m.path === "/receita")!.oculto).toBe(false);
  });
});
