import Fastify, { type FastifyInstance, type FastifyRequest, type FastifyReply } from "fastify";
import fastifyJwt from "@fastify/jwt";
import type { Pool } from "pg";
import { healthRoutes } from "./routes/health.js";
import { authRoutes } from "./auth/routes.js";
import { instalacoesRoutes } from "./routes/instalacoes.js";

export interface Deps { pool: Pool; jwtSecret?: string }

export function buildApp(deps: Deps): FastifyInstance {
  const app = Fastify({ logger: false });
  app.decorate("pool", deps.pool);
  app.register(fastifyJwt, { secret: deps.jwtSecret ?? process.env.JWT_SECRET ?? "dev-secret" });
  app.decorate("authenticate", async (req: FastifyRequest, reply: FastifyReply) => {
    try { await req.jwtVerify(); } catch { reply.code(401).send({ error: "unauthorized" }); }
  });
  app.register(healthRoutes);
  app.register(authRoutes);
  app.register(instalacoesRoutes);
  return app;
}

declare module "fastify" {
  interface FastifyInstance {
    pool: Pool;
    authenticate: (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}
