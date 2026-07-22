import { useState } from "react";
import LoginScreen from "./LoginScreen";
import ContratosModule from "./modules/ContratosModule";
import DespesaComparativoModule from "./modules/DespesaComparativoModule";
import DespesaModule from "./modules/DespesaModule";
import FinanceiroAnalisesModule from "./modules/FinanceiroAnalisesModule";
import FinanceiroModule from "./modules/FinanceiroModule";
import FolhaModule from "./modules/FolhaModule";
import LicitacoesModule from "./modules/LicitacoesModule";
import PanoramaModule from "./modules/PanoramaModule";
import PeopleModule from "./modules/PeopleModule";
import PlanejamentoModule from "./modules/PlanejamentoModule";
import PrestacaoModule from "./modules/PrestacaoModule";
import ReceitaComparativoModule from "./modules/ReceitaComparativoModule";
import ReceitaModule from "./modules/ReceitaModule";
import TributacaoModule from "./modules/TributacaoModule";
import VisaoGeralModule from "./modules/VisaoGeralModule";
import { Link, RouterProvider, useRouter } from "./router";
import { ThemeConfig, ThemeProvider, useTheme } from "./theme";

const ROUTES = [
	{ path: "/", title: "Visão Geral", el: VisaoGeralModule },
	{ path: "/panorama", title: "Panorama Municipal", el: PanoramaModule },
	{
		path: "/planejamento",
		title: "Planejamento Orçamentário (LOA)",
		el: PlanejamentoModule,
	},
	{ path: "/despesa", title: "Despesa — Visão Geral", el: DespesaModule },
	{
		path: "/despesa-comp",
		title: "Despesa — Comparativo Anual",
		el: DespesaComparativoModule,
	},
	{ path: "/receita", title: "Receita — Visão Geral", el: ReceitaModule },
	{
		path: "/receita-comp",
		title: "Receita — Evolução / Comparativo",
		el: ReceitaComparativoModule,
	},
	{
		path: "/financeiro",
		title: "Financeiro — Tesouraria",
		el: FinanceiroModule,
	},
	{
		path: "/tributacao",
		title: "Tributação e Fiscalização",
		el: TributacaoModule,
	},
	{ path: "/folha", title: "Folha de Pagamento", el: FolhaModule },
	{ path: "/people", title: "People Analytics", el: PeopleModule },
	{ path: "/licitacoes", title: "Licitações", el: LicitacoesModule },
	{ path: "/contratos", title: "Contratos Municipais", el: ContratosModule },
	{ path: "/prestacao", title: "Prestação de Contas", el: PrestacaoModule },
	{
		path: "/financeiro-analises",
		title: "Financeiro — Análises",
		el: FinanceiroAnalisesModule,
	},
];

const NAV_GROUPS = [
	{
		label: null,
		items: [
			{ path: "/", label: "Visão Geral" },
			{ path: "/panorama", label: "Panorama" },
		],
	},
	{
		label: "Movimento",
		items: [
			{ path: "/despesa", label: "Despesa" },
			{ path: "/receita", label: "Receita" },
			{ path: "/tributacao", label: "Tributação" },
			{ path: "/financeiro", label: "Financeiro" },
			{ path: "/planejamento", label: "Planejamento" },
			{ path: "/licitacoes", label: "Licitações" },
			{ path: "/contratos", label: "Contratos" },
			{ path: "/folha", label: "Folha de Pagamento" },
			{ path: "/people", label: "People Analytics" },
		],
	},
	{
		label: "Análises",
		items: [
			{ path: "/despesa-comp", label: "Despesa · Comparativo" },
			{ path: "/receita-comp", label: "Receita · Comparativo" },
			{ path: "/financeiro-analises", label: "Financeiro · Análises" },
			{ path: "/prestacao", label: "Prestação de Contas" },
		],
	},
];

function Shell() {
	const { t, familyLabel } = useTheme();
	const { path } = useRouter();
	const [navOpen, setNavOpen] = useState(false);
	const route = ROUTES.find((r) => r.path === path) || ROUTES[0];
	const Page = route.el;
	return (
		<div
			className="min-h-screen w-full flex"
			style={{
				background: t.background,
				color: t.foreground,
				fontFamily:
					"ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
			}}
		>
			{/* Garantia das classes responsivas de grid (nem todas existem no CSS pré-compilado do runtime) */}
			<style>{`
        @media (min-width: 640px){
          .sm\\:grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}
          .sm\\:grid-cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}
        }
        @media (min-width: 1024px){
          .lg\\:grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}
          .lg\\:grid-cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}
          .lg\\:grid-cols-4{grid-template-columns:repeat(4,minmax(0,1fr))}
          .lg\\:grid-cols-5{grid-template-columns:repeat(5,minmax(0,1fr))}
          .lg\\:grid-cols-6{grid-template-columns:repeat(6,minmax(0,1fr))}
          .lg\\:col-span-2{grid-column:span 2/span 2}
        }
      `}</style>
			{/* Sidebar */}
			<aside
				className={`${navOpen ? "flex" : "hidden"} lg:flex`}
				style={{
					width: 232,
					flexShrink: 0,
					background: t.card,
					borderRight: `1px solid ${t.border}`,
					position: "sticky",
					top: 0,
					height: "100vh",
					flexDirection: "column",
				}}
			>
				<div
					className="flex items-center gap-3 px-5"
					style={{
						height: 64,
						borderBottom: `1px solid ${t.border}`,
						flexShrink: 0,
					}}
				>
					<div
						className="rounded-lg flex items-center justify-center"
						style={{ width: 34, height: 34, background: t.primary }}
					>
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
							<path d="M12 2 3 7v2h18V7L12 2Z" fill={t.primaryFg} />
							<path
								d="M5 10v8M9 10v8M15 10v8M19 10v8"
								stroke={t.primaryFg}
								strokeWidth="2"
							/>
							<path d="M3 20h18v2H3z" fill={t.primaryFg} />
						</svg>
					</div>
					<div>
						<div
							className="text-xs uppercase tracking-wider"
							style={{ color: t.mutedFg }}
						>
							Prefeitura
						</div>
						<div className="text-sm font-bold" style={{ color: t.foreground }}>
							Mirante Gov
						</div>
					</div>
				</div>
				<nav
					className="p-3 flex flex-col gap-1"
					style={{ flex: 1, overflowY: "auto" }}
				>
					{NAV_GROUPS.map((g, gi) => (
						<div key={gi} className={gi ? "mt-3" : ""}>
							{g.label && (
								<div
									className="px-3 mb-1 text-xs font-semibold uppercase tracking-wider"
									style={{ color: t.mutedFg, opacity: 0.7 }}
								>
									{g.label}
								</div>
							)}
							{g.items.map((n) => {
								const active = n.path === path;
								return (
									<Link
										key={n.path}
										href={n.path}
										onNav={() => setNavOpen(false)}
										className="text-sm rounded-md"
										style={{
											display: "block",
											padding: "9px 12px",
											textDecoration: "none",
											fontWeight: active ? 600 : 500,
											background: active ? t.primary : "transparent",
											color: active ? t.primaryFg : t.mutedFg,
										}}
									>
										{n.label}
									</Link>
								);
							})}
						</div>
					))}
				</nav>
				<div
					className="p-3"
					style={{ borderTop: `1px solid ${t.border}`, flexShrink: 0 }}
				>
					<ThemeConfig />
					<div className="px-1 mt-2 text-xs" style={{ color: t.mutedFg }}>
						Exercício 2026 · Jun
					</div>
				</div>
			</aside>

			{/* Main */}
			<div className="flex-1" style={{ minWidth: 0 }}>
				<header
					className="flex items-center justify-between px-4 sm:px-6 sticky top-0 z-10"
					style={{
						height: 64,
						background: t.background,
						borderBottom: `1px solid ${t.border}`,
					}}
				>
					<div className="flex items-center gap-3">
						<button
							onClick={() => setNavOpen((v) => !v)}
							className="lg:hidden rounded-md"
							style={{
								padding: "6px 9px",
								background: t.card,
								border: `1px solid ${t.border}`,
								color: t.foreground,
								cursor: "pointer",
							}}
						>
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								stroke={t.foreground}
								strokeWidth="2"
							>
								<path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
							</svg>
						</button>
						<h1
							className="text-base sm:text-lg font-bold"
							style={{ color: t.foreground }}
						>
							{route.title}
						</h1>
					</div>
					<div className="flex items-center gap-2">
						<span
							className="hidden sm:block text-xs rounded-md"
							style={{
								background: t.card,
								border: `1px solid ${t.border}`,
								color: t.mutedFg,
								padding: "7px 11px",
							}}
						>
							Exercício 2026 · Jun
						</span>
					</div>
				</header>
				<main className="px-4 sm:px-6 py-5 max-w-7xl mx-auto">
					<Page />
					<div className="text-xs mt-4" style={{ color: t.mutedFg }}>
						Modelo de estrutura · dados fictícios · tema {familyLabel} · valores
						em R$ milhões.
					</div>
				</main>
			</div>
		</div>
	);
}

/* ============================================================================
   APP — ThemeProvider + RouterProvider + gate de autenticação (login → Shell)
   ============================================================================ */
function AuthGate() {
	const [authed, setAuthed] = useState(false);
	if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;
	return <Shell />;
}

export default function App() {
	return (
		<ThemeProvider>
			<RouterProvider>
				<AuthGate />
			</RouterProvider>
		</ThemeProvider>
	);
}
