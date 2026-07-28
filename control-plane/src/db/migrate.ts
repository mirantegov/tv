import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import type { Pool } from "pg";

const here = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = join(here, "..", "..", "db", "migrations");

export async function runMigrations(pool: Pool): Promise<void> {
  const trackingExists = await pool.query(
    "select 1 from information_schema.tables where table_schema='public' and table_name='schema_migrations'"
  );
  if (trackingExists.rows.length === 0) {
    await pool.query(
      "create table schema_migrations (name text primary key, applied_em timestamptz not null default now())"
    );
  }
  const files = (await readdir(MIGRATIONS_DIR)).filter((f) => f.endsWith(".sql")).sort();
  for (const f of files) {
    const already = await pool.query("select 1 from schema_migrations where name=$1", [f]);
    if (already.rows.length > 0) continue;
    const sql = await readFile(join(MIGRATIONS_DIR, f), "utf8");
    await pool.query(sql);
    await pool.query("insert into schema_migrations (name) values ($1)", [f]);
  }
}
