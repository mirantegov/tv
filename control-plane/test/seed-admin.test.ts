import { describe, it, expect } from "vitest";
import { newDb } from "pg-mem";
import { runMigrations } from "../src/db/migrate.js";
import { seedAdmin } from "../scripts/seed-admin.js";
import { verificarSenha } from "../src/auth/hash.js";

describe("seedAdmin", () => {
  it("insere admin com senha hasheada e é idempotente", async () => {
    const { Pool } = newDb().adapters.createPg();
    const pool = new Pool();
    await runMigrations(pool);
    await seedAdmin(pool, "op", "senha-forte", "Operador");
    await seedAdmin(pool, "op", "senha-forte", "Operador"); // 2ª vez não duplica
    const { rows } = await pool.query("select login, senha_hash, nome from admin_user");
    expect(rows).toHaveLength(1);
    expect(rows[0].senha_hash).not.toContain("senha-forte");
    expect(await verificarSenha(rows[0].senha_hash, "senha-forte")).toBe(true);
  });
});
