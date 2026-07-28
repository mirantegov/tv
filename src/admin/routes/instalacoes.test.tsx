import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { InstalacoesPage } from "./instalacoes";

beforeEach(() => {
	localStorage.clear();
	vi.restoreAllMocks();
});

function jsonRes(body: unknown, status = 200) {
	return new Response(JSON.stringify(body), {
		status,
		headers: { "content-type": "application/json" },
	});
}

describe("InstalacoesPage", () => {
	it("lista instalações vindas da API", async () => {
		vi.spyOn(globalThis, "fetch").mockResolvedValue(
			jsonRes([
				{
					id_ibge: "4117909",
					slug: "palotina",
					nome: "Palotina",
					uf: "PR",
					status: "ativa",
				},
			]),
		);
		render(<InstalacoesPage onAbrir={vi.fn()} />);

		await waitFor(() =>
			expect(screen.getByText("Palotina")).toBeInTheDocument(),
		);
		expect(screen.getByText("ativa")).toBeInTheDocument();
	});

	it("clique na linha chama onAbrir com id_ibge", async () => {
		vi.spyOn(globalThis, "fetch").mockResolvedValue(
			jsonRes([
				{
					id_ibge: "4117909",
					slug: "palotina",
					nome: "Palotina",
					uf: "PR",
					status: "ativa",
				},
			]),
		);
		const onAbrir = vi.fn();
		render(<InstalacoesPage onAbrir={onAbrir} />);

		await waitFor(() => screen.getByText("Palotina"));
		await userEvent.click(screen.getByText("Palotina"));
		expect(onAbrir).toHaveBeenCalledWith("4117909");
	});

	it("lista vazia mostra estado vazio", async () => {
		vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonRes([]));
		render(<InstalacoesPage onAbrir={vi.fn()} />);

		await waitFor(() =>
			expect(screen.getByText(/nenhuma instalação/i)).toBeInTheDocument(),
		);
	});

	it("cria instalação via dialog e recarrega lista", async () => {
		const fetchSpy = vi
			.spyOn(globalThis, "fetch")
			.mockResolvedValueOnce(jsonRes([]))
			.mockResolvedValueOnce(jsonRes({ id_ibge: "123" }))
			.mockResolvedValueOnce(
				jsonRes([
					{
						id_ibge: "123",
						slug: "nova",
						nome: "Nova Cidade",
						uf: "PR",
						status: "a-instalar",
					},
				]),
			);
		render(<InstalacoesPage onAbrir={vi.fn()} />);

		await waitFor(() => screen.getByText(/nenhuma instalação/i));
		await userEvent.click(
			screen.getByRole("button", { name: /nova instalação/i }),
		);
		await userEvent.type(screen.getByLabelText(/ibge/i), "123");
		await userEvent.type(screen.getByLabelText(/^slug$/i), "nova");
		await userEvent.type(screen.getByLabelText(/^nome$/i), "Nova Cidade");
		await userEvent.type(screen.getByLabelText(/^uf$/i), "PR");
		await userEvent.click(screen.getByRole("button", { name: /^criar$/i }));

		await waitFor(() =>
			expect(screen.getByText("Nova Cidade")).toBeInTheDocument(),
		);
		expect(fetchSpy).toHaveBeenCalledTimes(3);
	});
});
