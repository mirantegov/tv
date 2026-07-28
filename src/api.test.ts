import { describe, it, expect, beforeEach, vi } from "vitest";

beforeEach(() => {
	localStorage.clear();
	vi.restoreAllMocks();
	(globalThis as any).__API_URL__ = "http://tenant";
	(globalThis as any).__CP_URL__ = "http://cp";
});

describe("api com data-token", () => {
	it("fetchModule manda Bearer do pgrst_token", async () => {
		localStorage.setItem("pgrst_token", "dados");
		const spy = vi
			.spyOn(globalThis, "fetch")
			.mockResolvedValue(
				new Response(JSON.stringify([{ data: { x: 1 } }]), {
					status: 200,
					headers: { "content-type": "application/json" },
				}),
			);
		const { fetchModule } = await import("./api");
		await fetchModule("despesa");
		const init = spy.mock.calls[0][1] as RequestInit;
		expect((init.headers as any).authorization).toBe("Bearer dados");
	});
	it("fetchHiddenModules lê do central /me/modulos", async () => {
		localStorage.setItem("cp_token", "app");
		const spy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
			new Response(
				JSON.stringify([
					{ path: "/despesa", oculto: true },
					{ path: "/receita", oculto: false },
				]),
				{ status: 200, headers: { "content-type": "application/json" } },
			),
		);
		const { fetchHiddenModules } = await import("./api");
		const hidden = await fetchHiddenModules();
		expect(String(spy.mock.calls[0][0])).toContain("/me/modulos");
		expect(hidden).toEqual(["/despesa"]);
	});
});
