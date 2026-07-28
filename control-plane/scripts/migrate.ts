import { Pool } from "pg";
import { runMigrations } from "../src/db/migrate.js";
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
await runMigrations(pool);
await pool.end();
console.log("migrations applied");
