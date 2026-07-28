import { Pool } from "pg";
import { buildApp } from "./app.js";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const app = buildApp({ pool, jwtSecret: process.env.JWT_SECRET });
const port = Number(process.env.PORT ?? 8080);
app.listen({ port, host: "0.0.0.0" }).then(() => console.log(`control-plane on :${port}`));
