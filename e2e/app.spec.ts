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
		await page.addInitScript(() => {
			localStorage.setItem("mg_auth", "1");
			// admin: libera Módulos e Extras (gate isAdmin no App).
			localStorage.setItem("mg_role", "admin");
		});
		await page.goto("/");
		await expect(h1(page)).toHaveText("Visão Geral");
	});

	test("navega por todos os módulos sem erro", async ({ page }) => {
		const erros: string[] = [];
		page.on("pageerror", (e) => erros.push(String(e)));
		for (const [rotulo, titulo] of MODULOS) {
			// .first(): alguns rótulos (Planejamento, Finanças) também existem no
			// grupo Secretarias; o link do grupo principal vem antes no DOM.
			await page
				.locator("nav")
				.getByRole("link", { name: rotulo, exact: true })
				.first()
				.click();
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
		// Módulos agrupa por seção (colapsável); abre a seção do módulo alvo.
		await page.getByRole("button", { name: "Seção Movimento" }).click();
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
		await page.getByRole("button", { name: "Seção Geral" }).click();
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
		await page.getByRole("button", { name: /Extras/ }).click();
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

	test("Modo TV recolhe a sidebar, liga o Scroll, fecha o menu e vai ao inicial", async ({
		page,
	}) => {
		const aside = page.locator("aside").first();
		const larguraAside = async () => (await aside.boundingBox())?.width ?? 0;

		// começa num módulo não-inicial p/ provar a navegação ao inicial
		await page.locator("nav").getByText("SICONFI", { exact: true }).click();
		await expect(h1(page)).toHaveText("SICONFI");
		expect(await larguraAside()).toBeGreaterThan(200); // sidebar expandida

		// liga o Modo TV
		await abrirConfig(page);
		await page.getByText("Display", { exact: true }).click();
		const tv = page.getByRole("switch", { name: "Modo TV" });
		await expect(tv).toHaveAttribute("aria-checked", "false");
		await tv.click();

		// fecha Configurações (a seção Display some do DOM)
		await expect(page.getByText("Display", { exact: true })).toHaveCount(0);
		// recolhe a sidebar (72px << 232px)
		await expect.poll(larguraAside, { timeout: 5_000 }).toBeLessThan(100);
		// vai ao item inicial (Visão Geral, pois "/" não está oculto)
		await expect(h1(page)).toHaveText("Visão Geral");

		// Scroll Automático ligado e Modo TV marcado (reabre p/ conferir)
		await abrirConfig(page);
		await page.getByText("Display", { exact: true }).click();
		await expect(
			page.getByRole("switch", { name: "Scroll Automático" }),
		).toHaveAttribute("aria-checked", "true");
		const tvOn = page.getByRole("switch", { name: "Modo TV" });
		await expect(tvOn).toHaveAttribute("aria-checked", "true");

		// desliga → reverte tudo (popover segue aberto no desligar)
		await tvOn.click();
		await expect(tvOn).toHaveAttribute("aria-checked", "false");
		await expect(
			page.getByRole("switch", { name: "Scroll Automático" }),
		).toHaveAttribute("aria-checked", "false");
		await expect.poll(larguraAside, { timeout: 5_000 }).toBeGreaterThan(200);
	});

	test("Scroll Automático rola, chega ao fim e avança para o próximo módulo", async ({
		page,
	}) => {
		test.setTimeout(150_000);
		await page.locator("nav").getByText("SICONFI", { exact: true }).click();
		await expect(h1(page)).toHaveText("SICONFI");
		const inicial = await h1(page).textContent();
		expect(await page.evaluate(() => window.scrollY)).toBe(0);

		await abrirConfig(page);
		await page.getByText("Display", { exact: true }).click();
		await page.getByRole("switch", { name: "Scroll Automático" }).click();

		// 1) Não trava no topo: em algum momento o scroll passa de 0 (rola de fato).
		await expect
			.poll(() => page.evaluate(() => window.scrollY), { timeout: 30_000 })
			.toBeGreaterThan(0);

		// 2) Chega até o fim exato: o fundo do conteúdo alcança a base da viewport.
		await expect
			.poll(
				() =>
					page.evaluate(
						() =>
							Math.ceil(window.scrollY + window.innerHeight) >=
							document.documentElement.scrollHeight - 2,
					),
				{ timeout: 90_000 },
			)
			.toBe(true);

		// 3) Não fica travado no fim: após o descanso, avança para OUTRO módulo.
		await expect
			.poll(() => h1(page).textContent(), { timeout: 40_000 })
			.not.toBe(inicial);
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
