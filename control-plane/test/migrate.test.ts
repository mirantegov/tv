import { describe, it, expect } from "vitest";
import { newDb } from "pg-mem";
import { runMigrations } from "../src/db/migrate.js";

describe("runMigrations", () => {
  it("creates all domain tables", async () => {
    const mem = newDb();
    const { Pool } = mem.adapters.createPg();
    const pool = new Pool();
    await runMigrations(pool);
    const res = await pool.query(
      "select table_name from information_schema.tables where table_schema='public' order by table_name"
    );
    const names = res.rows.map((r: any) => r.table_name);
    expect(names).toEqual(
      ["acesso_log","admin_user","audit_log","entidade","gestor","instalacao","licenca","modulo_estado"]
    );
  });
});
