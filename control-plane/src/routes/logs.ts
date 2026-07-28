import type { FastifyInstance } from "fastify";
import { mascararCpf } from "../logs/mask.js";

function paginacao(q: Record<string, string | undefined>) {
  const limit = Math.min(Number(q.limit ?? 50) || 50, 200);
  const offset = Math.max(Number(q.offset ?? 0) || 0, 0);
  return { limit, offset };
}

export async function logsRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.authenticateAdmin);

  app.get("/logs/acessos", async (req) => {
    const q = req.query as Record<string, string | undefined>;
    const { limit, offset } = paginacao(q);
    const cond: string[] = [];
    const vals: unknown[] = [];
    if (q.id_ibge) { vals.push(q.id_ibge); cond.push(`a.id_ibge = $${vals.length}`); }
    if (q.cpf) { vals.push(q.cpf.replace(/\D/g, "")); cond.push(`a.cpf = $${vals.length}`); }
    if (q.de) { vals.push(q.de); cond.push(`a.criado_em >= $${vals.length}`); }
    if (q.ate) { vals.push(q.ate); cond.push(`a.criado_em <= $${vals.length}`); }
    const where = cond.length ? `where ${cond.join(" and ")}` : "";
    const total = await app.pool.query(`select count(*)::int as n from acesso_log a ${where}`, vals);
    const { rows } = await app.pool.query(
      `select a.id, a.cpf, g.nome, a.id_ibge, a.id_entidade, a.criado_em
         from acesso_log a left join gestor g on g.cpf = a.cpf
         ${where} order by a.criado_em desc limit ${limit} offset ${offset}`, vals
    );
    return { total: total.rows[0].n, rows: rows.map((r: any) => ({ ...r, cpf: mascararCpf(r.cpf) })) };
  });

  app.get("/logs/auditoria", async (req) => {
    const q = req.query as Record<string, string | undefined>;
    const { limit, offset } = paginacao(q);
    const cond: string[] = [];
    const vals: unknown[] = [];
    if (q.ator) { vals.push(q.ator); cond.push(`ator = $${vals.length}`); }
    if (q.id_ibge) { vals.push(`%${q.id_ibge}%`); cond.push(`alvo LIKE $${vals.length}`); } // ponytail: filtro aproximado por substring do alvo
    if (q.de) { vals.push(q.de); cond.push(`criado_em >= $${vals.length}`); }
    if (q.ate) { vals.push(q.ate); cond.push(`criado_em <= $${vals.length}`); }
    const where = cond.length ? `where ${cond.join(" and ")}` : "";
    const total = await app.pool.query(`select count(*)::int as n from audit_log ${where}`, vals);
    const { rows } = await app.pool.query(
      `select id, ator, acao, alvo, payload, criado_em from audit_log
         ${where} order by criado_em desc limit ${limit} offset ${offset}`, vals
    );
    return { total: total.rows[0].n, rows };
  });
}
