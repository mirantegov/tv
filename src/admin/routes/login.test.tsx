import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { cpApi } from "@/admin/cpApi";
import { LoginPage } from "./login";

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

describe("LoginPage", () => {
	it("mostra os campos de login", () => {
		render(<LoginPage onSuccess={vi.fn()} />);
		expect(screen.getByLabelText("login")).toBeInTheDocument();
		expect(screen.getByLabelText("senha")).toBeInTheDocument();
	});

	it("401 mostra erro e não chama onSuccess", async () => {
		vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonRes({}, 401));
		const onSuccess = vi.fn();
		render(<LoginPage onSuccess={onSuccess} />);

		await userEvent.type(screen.getByLabelText("login"), "user");
		await userEvent.type(screen.getByLabelText("senha"), "wrong");
		await userEvent.click(screen.getByRole("button", { name: /entrar/i }));

		await waitFor(() =>
			expect(screen.getByText(/inválidos/i)).toBeInTheDocument(),
		);
		expect(onSuccess).not.toHaveBeenCalled();
		expect(cpApi.getToken()).toBeNull();
	});

	it("200 chama onSuccess e guarda o token", async () => {
		vi.spyOn(globalThis, "fetch").mockResolvedValue(
			jsonRes({ token: "tok123", perfil: { nome: "Admin" } }),
		);
		const onSuccess = vi.fn();
		render(<LoginPage onSuccess={onSuccess} />);

		await userEvent.type(screen.getByLabelText("login"), "user");
		await userEvent.type(screen.getByLabelText("senha"), "pass");
		await userEvent.click(screen.getByRole("button", { name: /entrar/i }));

		await waitFor(() => expect(onSuccess).toHaveBeenCalled());
		expect(cpApi.getToken()).toBe("tok123");
	});
});
