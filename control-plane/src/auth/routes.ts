import type { FastifyInstance } from "fastify";
export async function authRoutes(app: FastifyInstance) {
  app.get("/auth/me", { preHandler: [app.authenticate] }, async (req) => req.user);
}
