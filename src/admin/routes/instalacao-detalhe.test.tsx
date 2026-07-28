import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { InstalacaoDetalhePage } from "./instalacao-detalhe";

beforeEach(() => {
	localStorage.clear();
	localStorage.setItem("cp_token", "t");
});

function jsonRes(body: unknown, status = 200) {
	return new Response(JSON.stringify(body), {
		status,
		headers: { "content-type": "application/json" },
	});
}

describe("InstalacaoDetalhePage", () => {
	it("carrega entidades da aba inicial", async () => {
		vi.spyOn(globalThis, "fetch").mockResolvedValue(
			jsonRes([
				{ id_entidade: "ent-pref", nome: "Prefeitura", tipo: "prefeitura" },
			]),
		);
		render(<InstalacaoDetalhePage id="4117909" onVoltar={() => {}} />);
		await waitFor(() =>
			expect(screen.getByText("Prefeitura")).toBeInTheDocument(),
		);
	});

	it("aba Módulos mostra path do catálogo", async () => {
		vi.spyOn(globalThis, "fetch").mockImplementation(async (url: any) => {
			if (String(url).endsWith("/modulos"))
				return jsonRes([{ path: "/despesa", oculto: true }]);
			return jsonRes([]);
		});
		render(<InstalacaoDetalhePage id="4117909" onVoltar={() => {}} />);
		await userEvent.click(screen.getByRole("tab", { name: /módulos/i }));
		await waitFor(() =>
			expect(screen.getByText("/despesa")).toBeInTheDocument(),
		);
	});
});
