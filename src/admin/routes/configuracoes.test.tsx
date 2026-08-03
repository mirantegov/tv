import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { AdminThemeProvider } from "@/admin/theme";
import { ConfiguracoesPage } from "./configuracoes";

function renderPage() {
	return render(
		<AdminThemeProvider>
			<ConfiguracoesPage />
		</AdminThemeProvider>,
	);
}

describe("ConfiguracoesPage", () => {
	it("mostra a aba Aparência com temas e modos", () => {
		renderPage();
		expect(screen.getByText("Aparência")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Ocean" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Monokai" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /Light/ })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /Dark/ })).toBeInTheDocument();
	});

	it("trocar o tema aplica a variável CSS correspondente", async () => {
		const user = userEvent.setup();
		renderPage();
		await user.click(screen.getByRole("button", { name: "Monokai" }));
		const bg = document.documentElement.style.getPropertyValue("--background");
		expect(bg).toMatch(/^-?\d+\.\d{4} -?\d+\.\d{4} -?\d+\.\d{4}$/);
	});
});
