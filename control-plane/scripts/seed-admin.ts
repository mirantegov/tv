import { Pool } from "pg";
import { hashSenha } from "../src/auth/hash.js";

export async function seedAdmin(pool: Pool, login: string, senha: string, nome: string) {
  const hash = await hashSenha(senha);
  await pool.query(
    `insert into admin_user (login, senha_hash, nome) values ($1,$2,$3)
       on conflict (login) do update set senha_hash=excluded.senha_hash, nome=excluded.nome`,
    [login, hash, nome]
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  await seedAdmin(pool, process.env.ADMIN_LOGIN!, process.env.ADMIN_SENHA!, process.env.ADMIN_NOME ?? "Administrador");
  await pool.end();
  console.log("admin semeado");
}
