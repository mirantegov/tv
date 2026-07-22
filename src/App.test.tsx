import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import App, { LOCKED_PATHS, NAV_GROUPS, ROUTES } from "./App";

beforeEach(() => {
	localStorage.clear();
});

const login = () => localStorage.setItem("mg_auth", "1");

describe("invariantes de rotas e sidebar", () => {
	it("rotas têm paths únicos", () => {
		const paths = ROUTES.map((r) => r.path);
		expect(new Set(paths).size).toBe(paths.length);
	});

	it("todo item da sidebar aponta para rota registrada", () => {
		const paths = new Set(ROUTES.map((r) => r.path));
		for (const item of NAV_GROUPS.flatMap((g) => g.items)) {
			expect(paths.has(item.path), `item ${item.label} sem rota`).toBe(true);
		}
	});

	it("LOCKED_PATHS contém apenas o Panorama (fallback)", () => {
		expect([...LOCKED_PATHS]).toEqual(["/panorama"]);
	});
});

describe("autenticação", () => {
	it("sem mg_auth mostra a tela de login", () => {
		render(<App />);
		expect(screen.getByLabelText(/CPF/i)).toBeInTheDocument();
	});

	it("com mg_auth carrega o shell na Visão Geral", () => {
		login();
		render(<App />);
		expect(
			screen.getByRole("heading", { level: 1, name: "Visão Geral" }),
		).toBeInTheDocument();
	});
});

describe("módulos ocultos", () => {
	it("Visão Geral desativada carrega Panorama como padrão", () => {
		login();
		localStorage.setItem("mg_modules", JSON.stringify(["/"]));
		render(<App />);
		expect(
			screen.getByRole("heading", { level: 1, name: "Panorama Municipal" }),
		).toBeInTheDocument();
	});

	it("módulo oculto some da sidebar", () => {
		login();
		localStorage.setItem("mg_modules", JSON.stringify(["/financeiro"]));
		render(<App />);
		expect(screen.queryByText("Financeiro")).not.toBeInTheDocument();
	});
});

describe("menu Configurações", () => {
	it("abre com as seções Display, Aparência, Módulos e Extras", () => {
		login();
		render(<App />);
		fireEvent.click(screen.getByRole("button", { name: "Configurações" }));
		for (const s of ["Display", "Aparência", "Módulos", "Extras", "Sair"]) {
			expect(screen.getByText(s)).toBeInTheDocument();
		}
	});

	it("Módulos lista switches de tudo exceto Panorama", () => {
		login();
		render(<App />);
		fireEvent.click(screen.getByRole("button", { name: "Configurações" }));
		fireEvent.click(screen.getByText("Módulos"));
		const rotulos = screen
			.getAllByRole("switch")
			.map((s) => s.textContent?.trim());
		expect(rotulos).not.toContain("Panorama");
		expect(rotulos).toContain("Visão Geral");
		expect(rotulos).toContain("TCE/PR");
		expect(rotulos.length).toBe(
			NAV_GROUPS.flatMap((g) => g.items).length - LOCKED_PATHS.size,
		);
	});

	it("Display contém o switch de Scroll Automático desligado", () => {
		login();
		render(<App />);
		fireEvent.click(screen.getByRole("button", { name: "Configurações" }));
		fireEvent.click(screen.getByText("Display"));
		const sw = screen.getByRole("switch", { name: /Scroll Automático/ });
		expect(sw).toHaveAttribute("aria-checked", "false");
		fireEvent.click(sw);
		expect(sw).toHaveAttribute("aria-checked", "true");
	});
});

describe("Extras · Análises e Alertas", () => {
	it("ligado por padrão — seção aparece ao fim do módulo", () => {
		login();
		render(<App />);
		expect(screen.getByText("Análises e Alertas")).toBeInTheDocument();
	});

	it("mg_extras=0 esconde a seção", () => {
		login();
		localStorage.setItem("mg_extras", "0");
		render(<App />);
		expect(screen.queryByText("Análises e Alertas")).not.toBeInTheDocument();
	});
});
