import type { Pool } from "pg";

export async function logAudit(
  pool: Pool,
  e: { ator: string; acao: string; alvo?: string; payload?: unknown }
): Promise<void> {
  await pool.query(
    "insert into audit_log (ator, acao, alvo, payload) values ($1,$2,$3,$4)",
    [e.ator, e.acao, e.alvo ?? null, e.payload ? JSON.stringify(e.payload) : null]
  );
}
