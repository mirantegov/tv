import { Pool } from "pg";
import { hashSenha } from "../src/auth/hash.js";

export async function seedGestor(
	pool: Pool,
	g: {
		cpf: string;
		senha: string;
		nome: string;
		role: string;
		id_ibge: string;
		id_entidade: string;
	},
): Promise<void> {
	const hash = await hashSenha(g.senha);
	await pool.query(
		`insert into gestor (cpf, id_ibge, id_entidade, nome, senha_hash, role)
       values ($1,$2,$3,$4,$5,$6)
       on conflict (cpf) do update
         set id_ibge=excluded.id_ibge, id_entidade=excluded.id_entidade,
             nome=excluded.nome, senha_hash=excluded.senha_hash, role=excluded.role`,
		[g.cpf.replace(/\D/g, ""), g.id_ibge, g.id_entidade, g.nome, hash, g.role],
	);
}

if (import.meta.url === `file://${process.argv[1]}`) {
	const req = (k: string) => {
		const v = process.env[k];
		if (!v) throw new Error(`${k} é obrigatório para semear o gestor`);
		return v;
	};
	const pool = new Pool({ connectionString: process.env.DATABASE_URL });
	await seedGestor(pool, {
		cpf: req("GESTOR_CPF"),
		senha: req("GESTOR_SENHA"),
		nome: req("GESTOR_NOME"),
		role: req("GESTOR_ROLE"),
		id_ibge: process.env.GESTOR_ID_IBGE ?? "4117909",
		id_entidade: process.env.GESTOR_ID_ENTIDADE ?? "12426",
	});
	await pool.end();
	console.log("gestor semeado");
}
