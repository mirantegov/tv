import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AA, AnalisesAlertas } from "./AnalisesAlertas";
import { NAV_GROUPS, ROUTES } from "./App";
import { RouterProvider } from "./router";
import { ThemeProvider } from "./theme";

const wrap = (ui: React.ReactNode) => (
	<ThemeProvider>
		<RouterProvider>{ui}</RouterProvider>
	</ThemeProvider>
);

describe("AnalisesAlertas", () => {
	it("renderiza a seção da Visão Geral com contadores", () => {
		render(wrap(<AnalisesAlertas path="/" />));
		expect(screen.getByText("Análises e Alertas")).toBeInTheDocument();
		expect(screen.getByText("1 crítico · 2 atenção")).toBeInTheDocument();
		expect(
			screen.getByText(/Certidão Liberatória vencida/, { exact: false }),
		).toBeInTheDocument();
	});

	it("não renderiza nada para rota sem conteúdo", () => {
		const { container } = render(wrap(<AnalisesAlertas path="/nao-existe" />));
		expect(container).toBeEmptyDOMElement();
	});

	it("toda rota do painel tem conteúdo de análises", () => {
		// Secretarias (/sec/*) são placeholders sem conteúdo por enquanto.
		// /planejamento-comp delega aos sub-módulos (uma chave por aba) — ver abaixo.
		for (const r of ROUTES.filter(
			(r) => !r.path.startsWith("/sec/") && r.path !== "/planejamento-comp",
		)) {
			expect(AA[r.path], `rota ${r.path} sem bloco em AA`).toBeDefined();
			expect(AA[r.path].itens.length).toBeGreaterThan(0);
			expect(AA[r.path].emDia.length).toBeGreaterThan(0);
		}
	});

	it("Planejamento comparativo tem bloco de alertas por aba", () => {
		for (const aba of [
			"integral",
			"prefeitura",
			"camara",
			"previdencia",
			"saneamento",
		]) {
			const key = `/planejamento-comp/${aba}`;
			expect(AA[key], `aba ${aba} sem bloco em AA`).toBeDefined();
			expect(AA[key].itens.length).toBeGreaterThan(0);
		}
	});

	it("itens com link apontam para rotas existentes", () => {
		const paths = new Set(ROUTES.map((r) => r.path));
		for (const bloco of Object.values(AA)) {
			for (const item of bloco.itens) {
				if (item.href) {
					expect(paths.has(item.href), `href ${item.href} inválido`).toBe(true);
				}
			}
		}
	});

	it("registro AA não referencia rotas fora do painel", () => {
		const paths = new Set(
			NAV_GROUPS.flatMap((g) => g.items.map((i) => i.path)),
		);
		for (const key of Object.keys(AA)) {
			// Sub-módulos (abas) têm chave "/pai/aba": valida o path pai da nav.
			const i = key.lastIndexOf("/");
			const parent = i > 0 ? key.slice(0, i) : key;
			expect(
				paths.has(key) || paths.has(parent),
				`chave ${key} fora da sidebar`,
			).toBe(true);
		}
	});
});
