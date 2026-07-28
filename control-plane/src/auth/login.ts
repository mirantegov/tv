import type { Pool } from "pg";
import { verificarSenha } from "./hash.js";

export interface PerfilAdmin { sub: string; tipo: "admin"; nome: string }

export interface PerfilGestor {
  sub: string; tipo: "gestor"; nome: string; role: string; id_entidade: string; id_ibge: string;
}
type LoginGestorResult = PerfilGestor | { erro: "credencial" | "licenca" };

export async function loginGestor(pool: Pool, cpf: string, senha: string): Promise<LoginGestorResult> {
  const cpfLimpo = cpf.replace(/\D/g, "");
  const { rows } = await pool.query(
    `select g.cpf, g.nome, g.role, g.id_entidade, g.id_ibge, g.senha_hash,
            l.ativo, l.validade
       from gestor g join licenca l on l.id_ibge = g.id_ibge
      where g.cpf = $1`, [cpfLimpo]
  );
  if (rows.length === 0) return { erro: "credencial" };
  const r = rows[0];
  if (!(await verificarSenha(r.senha_hash, senha))) return { erro: "credencial" };
  const vencida = r.validade && new Date(r.validade) < new Date();
  if (!r.ativo || vencida) return { erro: "licenca" };
  await pool.query(
    "insert into acesso_log (cpf, id_ibge, id_entidade) values ($1,$2,$3)",
    [r.cpf, r.id_ibge, r.id_entidade]
  );
  return { sub: r.cpf, tipo: "gestor", nome: r.nome, role: r.role, id_entidade: r.id_entidade, id_ibge: r.id_ibge };
}

export async function loginAdmin(pool: Pool, login: string, senha: string): Promise<PerfilAdmin | null> {
  const { rows } = await pool.query(
    "select id, nome, senha_hash from admin_user where login=$1", [login]
  );
  if (rows.length === 0) return null;
  const ok = await verificarSenha(rows[0].senha_hash, senha);
  if (!ok) return null;
  return { sub: String(rows[0].id), tipo: "admin", nome: rows[0].nome };
}
