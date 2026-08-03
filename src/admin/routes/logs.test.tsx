import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LogsPage } from "./logs";

beforeEach(() => {
	localStorage.clear();
	vi.restoreAllMocks();
});

function jsonRes(body: unknown) {
	return new Response(JSON.stringify(body), {
		status: 200,
		headers: { "content-type": "application/json" },
	});
}

describe("LogsPage", () => {
	it("aba Acessos (padrão) mostra nome e CPF mascarado; aba Auditoria mostra a ação", async () => {
		vi.spyOn(globalThis, "fetch").mockImplementation(async (url: any) => {
			if (String(url).includes("/logs/auditoria"))
				return jsonRes({
					total: 1,
					rows: [
						{
							id: 1,
							ator: "Op",
							acao: "criou",
							alvo: "instalacao:4117909",
							payload: null,
							criado_em: "2026-07-28T10:00:00Z",
						},
					],
				});
			return jsonRes({
				total: 1,
				rows: [
					{
						id: 1,
						cpf: "***.207.***-**",
						nome: "Prefeito",
						id_ibge: "4117909",
						id_entidade: "12426",
						criado_em: "2026-07-28T10:00:00Z",
					},
				],
			});
		});

		render(<LogsPage />);

		await waitFor(() =>
			expect(screen.getByText("Prefeito")).toBeInTheDocument(),
		);
		expect(screen.getByText("***.207.***-**")).toBeInTheDocument();

		await userEvent.click(screen.getByRole("tab", { name: /auditoria/i }));

		await waitFor(() => expect(screen.getByText("criou")).toBeInTheDocument());
	});
});
