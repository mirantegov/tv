import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { AdminThemeProvider, useAdminTheme } from "./theme";

const TRIPLE_RE = /^-?\d+\.\d{4} -?\d+\.\d{4} -?\d+\.\d{4}$/;

function Probe() {
	const { family, mode, setFamily, setMode } = useAdminTheme();
	return (
		<div>
			<span data-testid="family">{family}</span>
			<span data-testid="mode">{mode}</span>
			<button type="button" onClick={() => setFamily("monokai")}>
				monokai
			</button>
			<button type="button" onClick={() => setMode("light")}>
				light
			</button>
		</div>
	);
}

describe("AdminThemeProvider", () => {
	it("aplica Twitter/dark (valores atuais do admin.css) por padrão", () => {
		render(
			<AdminThemeProvider>
				<Probe />
			</AdminThemeProvider>,
		);
		expect(screen.getByTestId("family")).toHaveTextContent("twitter");
		expect(screen.getByTestId("mode")).toHaveTextContent("dark");
		expect(document.documentElement.style.getPropertyValue("--primary")).toBe(
			"0.6692 0.1607 245.0110",
		);
	});

	it("converte a Monokai (hex) p/ tripla OKLCH válida nas CSS vars", async () => {
		const user = userEvent.setup();
		render(
			<AdminThemeProvider>
				<Probe />
			</AdminThemeProvider>,
		);
		await act(() => user.click(screen.getByText("monokai")));
		const bg = document.documentElement.style.getPropertyValue("--background");
		expect(bg).toMatch(TRIPLE_RE);
	});

	it("troca de modo atualiza color-scheme", async () => {
		const user = userEvent.setup();
		render(
			<AdminThemeProvider>
				<Probe />
			</AdminThemeProvider>,
		);
		await act(() => user.click(screen.getByText("light")));
		expect(screen.getByTestId("mode")).toHaveTextContent("light");
		expect(document.documentElement.style.colorScheme).toBe("light");
	});
});
