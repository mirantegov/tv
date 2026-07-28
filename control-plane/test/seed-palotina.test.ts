import { describe, it, expect } from "vitest";
import { newDb } from "pg-mem";
import { runMigrations } from "../src/db/migrate.js";
import { seedPalotina } from "../scripts/seed-palotina.js";

describe("seedPalotina", () => {
  it("cadastra Palotina + entidade 12195 (idempotente)", async () => {
    const { Pool } = newDb().adapters.createPg();
    const pool = new Pool();
    await runMigrations(pool);
    await seedPalotina(pool);
    await seedPalotina(pool);
    const inst = await pool.query("select id_ibge, status from instalacao");
    expect(inst.rows).toHaveLength(1);
    expect(inst.rows[0]).toMatchObject({ id_ibge: "4117909", status: "ativa" });
    const ent = await pool.query("select id_entidade from entidade");
    expect(ent.rows).toEqual([{ id_entidade: "12195" }]);
  });
});
