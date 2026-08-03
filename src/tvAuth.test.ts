import { beforeEach, describe, expect, it, vi } from "vitest";
import { tvAuth } from "./tvAuth";

beforeEach(() => {
	localStorage.clear();
	vi.restoreAllMocks();
});

describe("tvAuth", () => {
	it("login ok guarda tokens e perfil", async () => {
		vi.spyOn(globalThis, "fetch").mockResolvedValue(
			new Response(
				JSON.stringify({
					token: "app",
					data_token: "dados",
					perfil: {
						nome: "Prefeito",
						role: "prefeito",
						id_entidade: "12426",
						id_ibge: "4117909",
					},
				}),
				{ status: 200, headers: { "content-type": "application/json" } },
			),
		);
		const r = await tvAuth.login("073.207.009-05", "segredo");
		expect("perfil" in r && r.perfil.id_entidade).toBe("12426");
		expect(tvAuth.getDataToken()).toBe("dados");
		expect(tvAuth.getPerfil()?.nome).toBe("Prefeito");
		expect(tvAuth.getToken()).toBe("app");
	});

	it("403 vira erro de licença", async () => {
		vi.spyOn(globalThis, "fetch").mockResolvedValue(
			new Response("{}", { status: 403 }),
		);
		const r = await tvAuth.login("07320700905", "x");
		expect(r).toMatchObject({ erro: "licenca" });
		expect(tvAuth.getToken()).toBeNull();
	});

	it("401 vira erro de credencial", async () => {
		vi.spyOn(globalThis, "fetch").mockResolvedValue(
			new Response("{}", { status: 401 }),
		);
		const r = await tvAuth.login("07320700905", "x");
		expect(r).toMatchObject({ erro: "credencial" });
	});

	it("200 sem data_token vira erro de config e não guarda nada", async () => {
		vi.spyOn(globalThis, "fetch").mockResolvedValue(
			new Response(
				JSON.stringify({
					token: "app",
					data_token: "",
					perfil: {
						nome: "P",
						role: "prefeito",
						id_entidade: "1",
						id_ibge: "1",
					},
				}),
				{ status: 200, headers: { "content-type": "application/json" } },
			),
		);
		const r = await tvAuth.login("07320700905", "x");
		expect(r).toMatchObject({ erro: "config" });
		expect(tvAuth.getToken()).toBeNull();
		expect(tvAuth.getDataToken()).toBeNull();
		expect(tvAuth.getPerfil()).toBeNull();
	});

	it("falha de rede vira erro de rede", async () => {
		vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));
		const r = await tvAuth.login("07320700905", "x");
		expect(r).toMatchObject({ erro: "rede" });
	});

	it("logout limpa tokens e perfil", async () => {
		vi.spyOn(globalThis, "fetch").mockResolvedValue(
			new Response(
				JSON.stringify({
					token: "app",
					data_token: "dados",
					perfil: {
						nome: "P",
						role: "prefeito",
						id_entidade: "1",
						id_ibge: "1",
					},
				}),
				{ status: 200 },
			),
		);
		await tvAuth.login("07320700905", "x");
		tvAuth.logout();
		expect(tvAuth.getToken()).toBeNull();
		expect(tvAuth.getDataToken()).toBeNull();
		expect(tvAuth.getPerfil()).toBeNull();
	});
});
