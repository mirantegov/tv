import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "../theme";
import { LogsView } from "./LogsView";

beforeEach(() => {
	localStorage.clear();
	localStorage.setItem("cp_token", "t");
});
function jsonRes(body: any) {
	return new Response(JSON.stringify(body), {
		status: 200,
		headers: { "content-type": "application/json" },
	});
}

describe("LogsView", () => {
	it("lista acessos e auditoria conforme a aba", async () => {
		const spy = vi.spyOn(globalThis, "fetch");
		spy.mockImplementation(async (url: any) => {
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
						id_entidade: "ent-pref",
						criado_em: "2026-07-28T10:00:00Z",
					},
				],
			});
		});
		render(
			<ThemeProvider>
				<LogsView onVoltar={() => {}} />
			</ThemeProvider>,
		);
		await waitFor(() =>
			expect(screen.getByText("Prefeito")).toBeInTheDocument(),
		);
		expect(screen.getByText("***.207.***-**")).toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: /auditoria/i }));
		await waitFor(() => expect(screen.getByText("criou")).toBeInTheDocument());
	});
});
