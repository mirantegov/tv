import Fastify, { type FastifyInstance, type FastifyRequest, type FastifyReply } from "fastify";
import fastifyJwt from "@fastify/jwt";
import type { Pool } from "pg";
import { healthRoutes } from "./routes/health.js";
import { authRoutes } from "./auth/routes.js";
import { instalacoesRoutes } from "./routes/instalacoes.js";
import { entidadesRoutes } from "./routes/entidades.js";
import { gestoresRoutes } from "./routes/gestores.js";
import { licencaRoutes } from "./routes/licenca.js";
import { modulosRoutes } from "./routes/modulos.js";

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
  app.register(entidadesRoutes);
  app.register(gestoresRoutes);
  app.register(licencaRoutes);
  app.register(modulosRoutes);
  return app;
}

declare module "fastify" {
  interface FastifyInstance {
    pool: Pool;
    authenticate: (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}
