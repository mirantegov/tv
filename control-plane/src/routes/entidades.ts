import type { FastifyInstance, FastifyRequest } from "fastify";
import { logAudit } from "../audit.js";

const ator = (req: FastifyRequest) => {
  const u = req.user as { nome?: string; sub?: string };
  return u?.nome ?? u?.sub ?? "?";
};

export async function entidadesRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.authenticate);

  app.get("/instalacoes/:id/entidades", async (req) => {
    const { id } = req.params as { id: string };
    const { rows } = await app.pool.query(
      "select id_entidade, id_ibge, nome, tipo from entidade where id_ibge=$1 order by nome", [id]
    );
    return rows;
  });

  app.post("/instalacoes/:id/entidades", async (req, reply) => {
    const { id } = req.params as { id: string };
    const b = req.body as { id_entidade: string; nome: string; tipo: string };
    const { rows } = await app.pool.query(
      `insert into entidade (id_entidade, id_ibge, nome, tipo) values ($1,$2,$3,$4)
       returning id_entidade, id_ibge, nome, tipo`, [b.id_entidade, id, b.nome, b.tipo]
    );
    await logAudit(app.pool, { ator: ator(req), acao: "criou", alvo: `entidade:${b.id_entidade}`, payload: { ...b, id_ibge: id } });
    return reply.code(201).send(rows[0]);
  });

  app.patch("/entidades/:id_entidade", async (req, reply) => {
    const { id_entidade } = req.params as { id_entidade: string };
    const b = req.body as Partial<{ nome: string; tipo: string }>;
    const campos = ["nome", "tipo"].filter((c) => b[c as keyof typeof b] != null);
    if (campos.length === 0) return reply.code(400).send({ error: "nada para atualizar" });
    const sets = campos.map((c, i) => `${c}=$${i + 2}`).join(", ");
    const { rows } = await app.pool.query(
      `update entidade set ${sets} where id_entidade=$1 returning id_entidade, id_ibge, nome, tipo`,
      [id_entidade, ...campos.map((c) => b[c as keyof typeof b])]
    );
    if (rows.length === 0) return reply.code(404).send({ error: "não encontrada" });
    await logAudit(app.pool, { ator: ator(req), acao: "editou", alvo: `entidade:${id_entidade}`, payload: b });
    return rows[0];
  });

  app.delete("/entidades/:id_entidade", async (req, reply) => {
    const { id_entidade } = req.params as { id_entidade: string };
    const { rowCount } = await app.pool.query("delete from entidade where id_entidade=$1", [id_entidade]);
    if (!rowCount) return reply.code(404).send({ error: "não encontrada" });
    await logAudit(app.pool, { ator: ator(req), acao: "removeu", alvo: `entidade:${id_entidade}` });
    return reply.code(204).send();
  });
}
