import Fastify, { type FastifyInstance } from "fastify";
import type { Pool } from "pg";
import { healthRoutes } from "./routes/health.js";

export interface Deps { pool: Pool }

export function buildApp(deps: Deps): FastifyInstance {
  const app = Fastify({ logger: false });
  app.decorate("pool", deps.pool);
  app.register(healthRoutes);
  return app;
}

declare module "fastify" {
  interface FastifyInstance { pool: Pool }
}
