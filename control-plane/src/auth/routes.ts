import type { FastifyInstance } from "fastify";
import { loginAdmin, loginGestor } from "./login.js";

const TOKEN_OPTS = { expiresIn: "30d" };

export async function authRoutes(app: FastifyInstance) {
  app.post("/auth/login", async (req, reply) => {
    const body = req.body as { tipo: string; login?: string; senha?: string };
    if (body.tipo === "admin") {
      const perfil = await loginAdmin(app.pool, body.login ?? "", body.senha ?? "");
      if (!perfil) return reply.code(401).send({ error: "credenciais inválidas" });
      const token = app.jwt.sign(perfil, TOKEN_OPTS);
      return { token, perfil };
    }
    if (body.tipo === "gestor") {
      const b = req.body as { cpf?: string; senha?: string };
      const r = await loginGestor(app.pool, b.cpf ?? "", b.senha ?? "");
      if ("erro" in r) {
        return reply.code(r.erro === "licenca" ? 403 : 401)
          .send({ error: r.erro === "licenca" ? "licença inativa ou vencida" : "credenciais inválidas" });
      }
      const token = app.jwt.sign(r, TOKEN_OPTS);
      return { token, perfil: r };
    }
    return reply.code(400).send({ error: "tipo inválido" });
  });

  app.get("/auth/me", { preHandler: [app.authenticate] }, async (req) => req.user);
}
