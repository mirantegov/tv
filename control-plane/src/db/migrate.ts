import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import type { Pool } from "pg";

const here = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = join(here, "..", "..", "db", "migrations");

export async function runMigrations(pool: Pool): Promise<void> {
  const files = (await readdir(MIGRATIONS_DIR)).filter((f) => f.endsWith(".sql")).sort();
  for (const f of files) {
    const sql = await readFile(join(MIGRATIONS_DIR, f), "utf8");
    await pool.query(sql);
  }
}
