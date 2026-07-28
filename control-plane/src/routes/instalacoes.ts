import type { FastifyInstance, FastifyRequest } from "fastify";
import { logAudit } from "../audit.js";

const ator = (req: FastifyRequest) => {
  const u = req.user as { nome?: string; sub?: string };
  return u?.nome ?? u?.sub ?? "?";
};

export async function instalacoesRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.authenticate);

  app.get("/instalacoes", async () => {
    const { rows } = await app.pool.query(
      "select id_ibge, slug, nome, uf, status from instalacao order by nome"
    );
    return rows;
  });

  app.post("/instalacoes", async (req, reply) => {
    const b = req.body as { id_ibge: string; slug: string; nome: string; uf: string };
    const { rows } = await app.pool.query(
      `insert into instalacao (id_ibge, slug, nome, uf) values ($1,$2,$3,$4)
       returning id_ibge, slug, nome, uf, status`,
      [b.id_ibge, b.slug, b.nome, b.uf]
    );
    await logAudit(app.pool, { ator: ator(req), acao: "criou", alvo: `instalacao:${b.id_ibge}`, payload: b });
    return reply.code(201).send(rows[0]);
  });

  app.get("/instalacoes/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const { rows } = await app.pool.query(
      `select i.id_ibge, i.slug, i.nome, i.uf, i.status,
              l.ativo as licenca_ativo, l.validade as licenca_validade
         from instalacao i left join licenca l on l.id_ibge = i.id_ibge
        where i.id_ibge = $1`, [id]
    );
    if (rows.length === 0) return reply.code(404).send({ error: "não encontrada" });
    return rows[0];
  });

  app.patch("/instalacoes/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const b = req.body as Partial<{ slug: string; nome: string; uf: string; status: string }>;
    const campos = ["slug", "nome", "uf", "status"].filter((c) => b[c as keyof typeof b] != null);
    if (campos.length === 0) return reply.code(400).send({ error: "nada para atualizar" });
    const sets = campos.map((c, i) => `${c}=$${i + 2}`).join(", ");
    const vals = campos.map((c) => b[c as keyof typeof b]);
    const { rows } = await app.pool.query(
      `update instalacao set ${sets}, atualizado_em=now() where id_ibge=$1
       returning id_ibge, slug, nome, uf, status`, [id, ...vals]
    );
    if (rows.length === 0) return reply.code(404).send({ error: "não encontrada" });
    await logAudit(app.pool, { ator: ator(req), acao: "editou", alvo: `instalacao:${id}`, payload: b });
    return rows[0];
  });

  app.delete("/instalacoes/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const { rowCount } = await app.pool.query("delete from instalacao where id_ibge=$1", [id]);
    if (!rowCount) return reply.code(404).send({ error: "não encontrada" });
    await logAudit(app.pool, { ator: ator(req), acao: "removeu", alvo: `instalacao:${id}` });
    return reply.code(204).send();
  });
}
