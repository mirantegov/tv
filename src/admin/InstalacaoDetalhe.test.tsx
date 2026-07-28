import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "../theme";
import { InstalacaoDetalhe } from "./InstalacaoDetalhe";

beforeEach(() => {
	localStorage.clear();
	localStorage.setItem("cp_token", "t");
});

function jsonRes(body: any, status = 200) {
	return new Response(JSON.stringify(body), {
		status,
		headers: { "content-type": "application/json" },
	});
}

describe("InstalacaoDetalhe", () => {
	it("carrega entidades da aba inicial", async () => {
		const spy = vi.spyOn(globalThis, "fetch");
		spy.mockResolvedValue(
			jsonRes([
				{
					id_entidade: "ent-pref",
					id_ibge: "4117909",
					nome: "Prefeitura",
					tipo: "prefeitura",
				},
			]),
		);
		render(
			<ThemeProvider>
				<InstalacaoDetalhe id="4117909" onVoltar={() => {}} />
			</ThemeProvider>,
		);
		await waitFor(() =>
			expect(screen.getByText("Prefeitura")).toBeInTheDocument(),
		);
	});

	it("aba Módulos renderiza um toggle por path do catálogo", async () => {
		const spy = vi.spyOn(globalThis, "fetch");
		spy.mockImplementation(async (url: any) => {
			if (String(url).endsWith("/modulos"))
				return jsonRes([{ path: "/despesa", oculto: true }]);
			return jsonRes([]);
		});
		render(
			<ThemeProvider>
				<InstalacaoDetalhe id="4117909" onVoltar={() => {}} />
			</ThemeProvider>,
		);
		fireEvent.click(screen.getByRole("button", { name: /módulos/i }));
		await waitFor(() =>
			expect(screen.getByText("/despesa")).toBeInTheDocument(),
		);
	});
});
