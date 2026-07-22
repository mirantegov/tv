import { expect, test } from "@playwright/test";
import { USERS } from "../src/users";

// Rótulo na sidebar → título esperado no header (h1)
const MODULOS: [string, string][] = [
	["Visão Geral", "Visão Geral"],
	["Panorama", "Panorama Municipal"],
	["Despesa", "Despesa — Visão Geral"],
	["Receita", "Receita — Visão Geral"],
	["Tributação", "Tributação e Fiscalização"],
	["Financeiro", "Financeiro — Tesouraria"],
	["Planejamento", "Planejamento Orçamentário (LOA)"],
	["Licitações", "Licitações"],
	["Contratos", "Contratos Municipais"],
	["Folha de Pagamento", "Folha de Pagamento"],
	["People Analytics", "People Analytics"],
	["Despesas", "Despesa — Comparativo Anual"],
	["Receitas", "Receita — Evolução / Comparativo"],
	["Finanças", "Financeiro — Análises"],
	["TCE/PR", "TCE/PR"],
	["SICONFI", "SICONFI"],
];

const h1 = (page) => page.getByRole("heading", { level: 1 });
const abrirConfig = (page) =>
	page.getByRole("button", { name: "Configurações", exact: true }).click();

test("login com CPF e senha válidos entra no painel", async ({ page }) => {
	await page.goto("/");
	await page.locator("#cpf").fill(USERS[0].cpf);
	await page.locator("#senha").fill(USERS[0].senha);
	await page.getByRole("button", { name: "Entrar" }).click();
	await expect(h1(page)).toHaveText("Visão Geral");
});

test.describe("autenticado", () => {
	test.beforeEach(async ({ page }) => {
		await page.addInitScript(() => localStorage.setItem("mg_auth", "1"));
		await page.goto("/");
		await expect(h1(page)).toHaveText("Visão Geral");
	});

	test("navega por todos os módulos sem erro", async ({ page }) => {
		const erros: string[] = [];
		page.on("pageerror", (e) => erros.push(String(e)));
		for (const [rotulo, titulo] of MODULOS) {
			await page.locator("nav").getByText(rotulo, { exact: true }).click();
			await expect(h1(page)).toHaveText(titulo);
			await expect(page.getByText("Análises e Alertas")).toBeVisible();
		}
		expect(erros).toEqual([]);
	});

	test("ocultar módulo remove da sidebar e persiste após reload", async ({
		page,
	}) => {
		await abrirConfig(page);
		await page.getByText("Módulos", { exact: true }).click();
		await page.getByRole("switch", { name: "Financeiro", exact: true }).click();
		await expect(
			page.locator("nav").getByText("Financeiro", { exact: true }),
		).toHaveCount(0);
		await page.reload();
		await expect(
			page.locator("nav").getByText("Financeiro", { exact: true }),
		).toHaveCount(0);
	});

	test("desativar Visão Geral carrega Panorama como padrão", async ({
		page,
	}) => {
		await abrirConfig(page);
		await page.getByText("Módulos", { exact: true }).click();
		await page
			.getByRole("switch", { name: "Visão Geral", exact: true })
			.click();
		await expect(h1(page)).toHaveText("Panorama Municipal");
		await page.reload();
		await expect(h1(page)).toHaveText("Panorama Municipal");
	});

	test("Extras desligado esconde Análises e Alertas", async ({ page }) => {
		await expect(page.getByText("Análises e Alertas")).toBeVisible();
		await abrirConfig(page);
		await page.getByText("Extras", { exact: true }).click();
		await page
			.getByRole("switch", { name: "Análises e Alertas", exact: true })
			.click();
		await expect(page.getByText("3 críticos · 4 atenção")).toHaveCount(0);
	});

	test("Display liga o Scroll Automático", async ({ page }) => {
		await abrirConfig(page);
		await page.getByText("Display", { exact: true }).click();
		const sw = page.getByRole("switch", { name: "Scroll Automático" });
		await expect(sw).toHaveAttribute("aria-checked", "false");
		await sw.click();
		await expect(sw).toHaveAttribute("aria-checked", "true");
	});

	test("trocar tema pela seção Aparência", async ({ page }) => {
		await abrirConfig(page);
		await page.getByText("Aparência", { exact: true }).click();
		await page.getByRole("button", { name: "Monokai" }).click();
		await page.getByRole("button", { name: "☀ Light" }).click();
		// tema persiste como estado visual; painel continua renderizado
		await expect(h1(page)).toHaveText("Visão Geral");
	});

	test("Sair volta para a tela de login", async ({ page }) => {
		await abrirConfig(page);
		await page.getByText("Sair", { exact: true }).click();
		await expect(page.locator("#cpf")).toBeVisible();
	});
});
