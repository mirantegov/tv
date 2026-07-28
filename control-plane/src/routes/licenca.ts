import type { FastifyInstance, FastifyRequest } from "fastify";
import { logAudit } from "../audit.js";

const ator = (req: FastifyRequest) => {
  const u = req.user as { nome?: string; sub?: string };
  return u?.nome ?? u?.sub ?? "?";
};

export async function licencaRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.authenticateAdmin);

  app.put("/instalacoes/:id/licenca", async (req) => {
    const { id } = req.params as { id: string };
    const b = req.body as { ativo: boolean; validade: string | null };
    await app.pool.query(
      `insert into licenca (id_ibge, ativo, validade) values ($1,$2,$3)
         on conflict (id_ibge) do update set ativo=excluded.ativo, validade=excluded.validade, atualizado_em=now()`,
      [id, b.ativo, b.validade]
    );
    await logAudit(app.pool, { ator: ator(req), acao: "emitiu-licenca", alvo: `instalacao:${id}`, payload: b });
    return { id_ibge: id, ativo: b.ativo, validade: b.validade };
  });
}
