import type { FastifyInstance, FastifyRequest } from "fastify";
import { logAudit } from "../audit.js";
import { hashSenha } from "../auth/hash.js";

const ator = (req: FastifyRequest) => {
  const u = req.user as { nome?: string; sub?: string };
  return u?.nome ?? u?.sub ?? "?";
};
const soDigitos = (cpf: string) => cpf.replace(/\D/g, "");

export async function gestoresRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.authenticate);

  app.get("/instalacoes/:id/gestores", async (req) => {
    const { id } = req.params as { id: string };
    const { rows } = await app.pool.query(
      "select cpf, id_ibge, id_entidade, nome, role from gestor where id_ibge=$1 order by nome", [id]
    );
    return rows;
  });

  app.post("/instalacoes/:id/gestores", async (req, reply) => {
    const { id } = req.params as { id: string };
    const b = req.body as { cpf: string; nome: string; senha: string; role: string; id_entidade: string };
    const cpf = soDigitos(b.cpf ?? "");
    if (cpf.length !== 11) return reply.code(400).send({ error: "CPF inválido" });
    const hash = await hashSenha(b.senha);
    await app.pool.query(
      `insert into gestor (cpf, id_ibge, id_entidade, nome, senha_hash, role) values ($1,$2,$3,$4,$5,$6)`,
      [cpf, id, b.id_entidade, b.nome, hash, b.role]
    );
    await logAudit(app.pool, { ator: ator(req), acao: "criou", alvo: `gestor:${cpf}`,
      payload: { cpf, id_ibge: id, id_entidade: b.id_entidade, role: b.role } });
    return reply.code(201).send({ cpf, id_ibge: id, id_entidade: b.id_entidade, nome: b.nome, role: b.role });
  });

  app.patch("/gestores/:cpf", async (req, reply) => {
    const cpf = soDigitos((req.params as { cpf: string }).cpf);
    const b = req.body as Partial<{ nome: string; role: string; id_entidade: string; senha: string }>;
    const campos: string[] = [];
    const vals: unknown[] = [];
    for (const c of ["nome", "role", "id_entidade"] as const) {
      if (b[c] != null) { campos.push(`${c}=$${campos.length + 2}`); vals.push(b[c]); }
    }
    if (b.senha != null) { campos.push(`senha_hash=$${campos.length + 2}`); vals.push(await hashSenha(b.senha)); }
    if (campos.length === 0) return reply.code(400).send({ error: "nada para atualizar" });
    const { rows } = await app.pool.query(
      `update gestor set ${campos.join(", ")} where cpf=$1 returning cpf, id_ibge, id_entidade, nome, role`,
      [cpf, ...vals]
    );
    if (rows.length === 0) return reply.code(404).send({ error: "não encontrado" });
    await logAudit(app.pool, { ator: ator(req), acao: "editou", alvo: `gestor:${cpf}`,
      payload: { campos: Object.keys(b).filter((k) => k !== "senha"), trocouSenha: b.senha != null } });
    return rows[0];
  });

  app.delete("/gestores/:cpf", async (req, reply) => {
    const cpf = soDigitos((req.params as { cpf: string }).cpf);
    const { rowCount } = await app.pool.query("delete from gestor where cpf=$1", [cpf]);
    if (!rowCount) return reply.code(404).send({ error: "não encontrado" });
    await logAudit(app.pool, { ator: ator(req), acao: "removeu", alvo: `gestor:${cpf}` });
    return reply.code(204).send();
  });
}
