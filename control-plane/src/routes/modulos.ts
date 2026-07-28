import type { FastifyInstance, FastifyRequest } from "fastify";
import { logAudit } from "../audit.js";

const ator = (req: FastifyRequest) => {
  const u = req.user as { nome?: string; sub?: string };
  return u?.nome ?? u?.sub ?? "?";
};

export async function modulosRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.authenticate);

  app.get("/instalacoes/:id/modulos", async (req) => {
    const { id } = req.params as { id: string };
    const { rows } = await app.pool.query(
      "select path, oculto from modulo_estado where id_ibge=$1 order by path", [id]
    );
    return rows;
  });

  app.put("/instalacoes/:id/modulos", async (req, reply) => {
    const { id } = req.params as { id: string };
    const b = req.body as { modulos: { path: string; oculto: boolean }[] };
    for (const m of b.modulos ?? []) {
      await app.pool.query(
        `insert into modulo_estado (id_ibge, path, oculto) values ($1,$2,$3)
           on conflict (id_ibge, path) do update set oculto=excluded.oculto, atualizado_em=now()`,
        [id, m.path, m.oculto]
      );
    }
    await logAudit(app.pool, { ator: ator(req), acao: "definiu-modulos", alvo: `instalacao:${id}`, payload: b });
    return reply.code(200).send({ ok: true });
  });
}
