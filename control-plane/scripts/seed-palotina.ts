import { Pool } from "pg";

export async function seedPalotina(pool: Pool): Promise<void> {
  await pool.query(
    `insert into instalacao (id_ibge, slug, nome, uf, status) values ('4117909','palotina','Palotina','PR','ativa')
       on conflict (id_ibge) do update set status='ativa'`);
  await pool.query(
    `insert into licenca (id_ibge, ativo, validade) values ('4117909', true, '2999-01-01')
       on conflict (id_ibge) do update set ativo=true, validade='2999-01-01'`);
  await pool.query(
    `insert into entidade (id_entidade, id_ibge, nome, tipo) values ('12195','4117909','Prefeitura','prefeitura')
       on conflict (id_entidade) do nothing`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  await seedPalotina(pool);
  await pool.end();
  console.log("Palotina semeada (entidade 12195)");
}
