import type { Pool } from "pg";
import { verificarSenha } from "./hash.js";

export interface PerfilAdmin { sub: string; tipo: "admin"; nome: string }

export async function loginAdmin(pool: Pool, login: string, senha: string): Promise<PerfilAdmin | null> {
  const { rows } = await pool.query(
    "select id, nome, senha_hash from admin_user where login=$1", [login]
  );
  if (rows.length === 0) return null;
  const ok = await verificarSenha(rows[0].senha_hash, senha);
  if (!ok) return null;
  return { sub: String(rows[0].id), tipo: "admin", nome: rows[0].nome };
}
