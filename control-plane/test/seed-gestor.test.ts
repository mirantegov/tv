import { newDb } from "pg-mem";
import { describe, expect, it } from "vitest";
import { seedGestor } from "../scripts/seed-gestor.js";
import { seedPalotina } from "../scripts/seed-palotina.js";
import { buildApp } from "../src/app.js";
import { runMigrations } from "../src/db/migrate.js";

describe("seedGestor", () => {
	it("cadastra o gestor (idempotente, CPF normalizado) e o login funciona", async () => {
		const { Pool } = newDb().adapters.createPg();
		const pool = new Pool();
		await runMigrations(pool);
		await seedPalotina(pool);
		const admin = {
			cpf: "000.000.000-00",
			senha: "R1JmYp5U",
			nome: "Administrador",
			role: "admin",
			id_ibge: "4117909",
			id_entidade: "12426",
		};
		await seedGestor(pool, admin);
		await seedGestor(pool, { ...admin, nome: "Admin" });
		const { rows } = await pool.query("select cpf, nome, role from gestor");
		expect(rows).toEqual([
			{ cpf: "00000000000", nome: "Admin", role: "admin" },
		]);

		const app = buildApp({
			pool,
			jwtSecret: "test-secret",
			pgrstSecret: "s".repeat(32),
		});
		const res = await app.inject({
			method: "POST",
			url: "/auth/login",
			payload: { tipo: "gestor", cpf: "000.000.000-00", senha: "R1JmYp5U" },
		});
		expect(res.statusCode).toBe(200);
		expect(res.json().data_token).toBeTruthy();
	});
});
