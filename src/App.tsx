import { useEffect, useRef, useState } from "react";
import { AnalisesAlertas } from "./AnalisesAlertas";
import { DataProvider } from "./DataProvider";
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
import { SiconfiModule, TcePrModule } from "./modules/PrestacaoModule";
import ReceitaComparativoModule from "./modules/ReceitaComparativoModule";
import ReceitaModule from "./modules/ReceitaModule";
import TributacaoModule from "./modules/TributacaoModule";
import VisaoGeralModule from "./modules/VisaoGeralModule";
import { Link, RouterProvider, useRouter } from "./router";
import { ThemePanel, ThemeProvider, useTheme } from "./theme";
import type { Role } from "./users";

export const ROUTES = [
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
	{ path: "/tce", title: "TCE/PR", el: TcePrModule },
	{ path: "/siconfi", title: "SICONFI", el: SiconfiModule },
	{
		path: "/financeiro-analises",
		title: "Financeiro — Análises",
		el: FinanceiroAnalisesModule,
	},
];

export const NAV_GROUPS = [
	{
		label: null,
		items: [
			{
				path: "/",
				label: "Visão Geral",
				icon: "M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z",
			},
			{
				path: "/panorama",
				label: "Panorama",
				icon: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20M2 12h20M12 2c2.5 3 2.5 17 0 20M12 2c-2.5 3-2.5 17 0 20",
			},
		],
	},
	{
		label: "Movimento",
		items: [
			{
				path: "/despesa",
				label: "Despesa",
				icon: "M22 17 13.5 8.5 8.5 13.5 2 7M16 17h6v-6",
			},
			{
				path: "/receita",
				label: "Receita",
				icon: "M22 7 13.5 15.5 8.5 10.5 2 17M16 7h6v6",
			},
			{
				path: "/tributacao",
				label: "Tributação",
				icon: "M19 5 5 19M9 6.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0M20 17.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0",
			},
			{
				path: "/financeiro",
				label: "Financeiro",
				icon: "M2 8h20v11a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1zM2 8l3-4h11l3 4M16 13h2",
			},
			{
				path: "/planejamento",
				label: "Planejamento",
				icon: "M3 4h18v18H3zM16 2v4M8 2v4M3 10h18",
			},
			{
				path: "/licitacoes",
				label: "Licitações",
				icon: "M14 3v4a1 1 0 0 0 1 1h4M5 3h9l5 5v13H5zM9 15l2 2 4-4",
			},
			{
				path: "/contratos",
				label: "Contratos",
				icon: "M14 3v4a1 1 0 0 0 1 1h4M5 3h9l5 5v13H5zM9 13h6M9 17h4",
			},
			{
				path: "/folha",
				label: "Folha de Pagamento",
				icon: "M2 6h20v12H2zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6M6 10h.01M18 14h.01",
			},
			{
				path: "/people",
				label: "People Analytics",
				icon: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
			},
		],
	},
	{
		label: "Análises",
		items: [
			{
				path: "/despesa-comp",
				label: "Despesas",
				icon: "M3 3v18h18M8 17V9M13 17V5M18 17v-6",
			},
			{
				path: "/receita-comp",
				label: "Receitas",
				icon: "M3 3v18h18M7 15l3-4 3 2 5-7",
			},
			{
				path: "/financeiro-analises",
				label: "Finanças",
				icon: "M21.21 15.89A10 10 0 1 1 8 2.83M22 12A10 10 0 0 0 12 2v10z",
			},
		],
	},
	{
		label: "Contas Públicas",
		items: [
			{
				path: "/tce",
				label: "TCE/PR",
				icon: "M9 2h6a1 1 0 0 1 1 1v1H8V3a1 1 0 0 1 1-1M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2M9 14l2 2 4-4",
			},
			{
				path: "/siconfi",
				label: "SICONFI",
				icon: "M12 2 3 7v2h18V7zM5 11v7M9.5 11v7M14.5 11v7M19 11v7M3 20h18v2H3z",
			},
		],
	},
];

// Módulos que não podem ser desativados na sidebar (Panorama é o fallback
// quando a Visão Geral está desativada, então fica sempre disponível)
export const LOCKED_PATHS = new Set(["/panorama"]);

// Ícones dos submenus de Configurações (um path por seção, cor herda do botão).
const SECTION_ICON_PATHS = {
	display:
		"M3 4h18a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z M8 21h8 M12 17v4",
	aparencia: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z",
	modulos: "M3 3h7v7H3Z M14 3h7v7h-7Z M3 14h7v7H3Z M14 14h7v7h-7Z",
	extras:
		"M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0",
} as const;

function Shell({
	onLogout,
	isAdmin,
}: {
	onLogout: () => void;
	isAdmin: boolean;
}) {
	const { t } = useTheme();
	const { path, push } = useRouter();
	const [navOpen, setNavOpen] = useState(false);
	const [cfgOpen, setCfgOpen] = useState(false);
	const [cfgSection, setCfgSection] = useState<
		"display" | "aparencia" | "modulos" | "extras" | null
	>(null);
	const [autoScroll, setAutoScroll] = useState(false);
	// Extras · Análises e Alertas — ligado por padrão (mg_extras === "0" desliga)
	const [extras, setExtras] = useState(() => {
		try {
			return localStorage.getItem("mg_extras") !== "0";
		} catch {
			return true;
		}
	});
	const toggleExtras = () =>
		setExtras((v) => {
			const next = !v;
			try {
				localStorage.setItem("mg_extras", next ? "1" : "0");
			} catch {
				// localStorage indisponível — segue sem persistir
			}
			return next;
		});
	const [hidden, setHidden] = useState<Set<string>>(() => {
		try {
			return new Set(JSON.parse(localStorage.getItem("mg_modules") || "[]"));
		} catch {
			return new Set();
		}
	});
	const toggleModule = (p: string) =>
		setHidden((prev) => {
			const next = new Set(prev);
			if (next.has(p)) {
				next.delete(p);
			} else {
				next.add(p);
			}
			try {
				localStorage.setItem("mg_modules", JSON.stringify([...next]));
			} catch {
				// localStorage indisponível — segue sem persistir
			}
			return next;
		});
	const visibleGroups = NAV_GROUPS.map((g) => ({
		...g,
		items: g.items.filter((i) => !hidden.has(i.path)),
	})).filter((g) => g.items.length);
	// Visão Geral desativada → Panorama vira o módulo padrão
	useEffect(() => {
		if (path === "/" && hidden.has("/")) push("/panorama");
	}, [path, hidden, push]);
	const pathRef = useRef(path);
	pathRef.current = path;

	// Scroll Automático (modo TV): aguarda 5s, percorre o módulo atual bem
	// devagar até o fim, avança para o próximo (aba por aba quando houver
	// [data-autoscroll-tab]) e recomeça pela Visão Geral ao terminar.
	useEffect(() => {
		if (!autoScroll) return;
		let cancelled = false;
		const timers = new Set<number>();
		const wait = (ms: number) =>
			new Promise<void>((resolve) => {
				const id = window.setTimeout(() => {
					timers.delete(id);
					resolve();
				}, ms);
				timers.add(id);
			});
		const ORDER = NAV_GROUPS.flatMap((g) => g.items.map((i) => i.path)).filter(
			(p) => !hidden.has(p),
		);
		const scrollPage = async () => {
			window.scrollTo(0, 0);
			await wait(1200);
			while (!cancelled) {
				const max = document.documentElement.scrollHeight - window.innerHeight;
				if (window.scrollY >= max - 1) break;
				window.scrollBy(0, 1);
				await wait(40);
			}
			await wait(1500);
		};
		const run = async () => {
			await wait(5000);
			let idx = Math.max(0, ORDER.indexOf(pathRef.current));
			while (!cancelled) {
				push(ORDER[idx]);
				await wait(800);
				const tabs = Array.from(
					document.querySelectorAll<HTMLElement>("[data-autoscroll-tab]"),
				);
				if (tabs.length) {
					for (const tab of tabs) {
						if (cancelled) break;
						tab.click();
						await wait(600);
						await scrollPage();
					}
				} else {
					await scrollPage();
				}
				idx = (idx + 1) % ORDER.length;
			}
		};
		run();
		return () => {
			cancelled = true;
			for (const id of timers) clearTimeout(id);
		};
	}, [autoScroll, push, hidden]);
	const [collapsed, setCollapsed] = useState(() => {
		try {
			return localStorage.getItem("mg_sidebar") === "1";
		} catch {
			return false;
		}
	});
	const toggleCollapsed = () =>
		setCollapsed((c) => {
			const next = !c;
			try {
				localStorage.setItem("mg_sidebar", next ? "1" : "0");
			} catch {
				// localStorage indisponível — segue sem persistir
			}
			return next;
		});
	const route = ROUTES.find((r) => r.path === path) || ROUTES[0];
	const Page = route.el;
	const Sw = ({ on }: { on: boolean }) => (
		<span
			aria-hidden="true"
			className="rounded-full"
			style={{
				width: 34,
				height: 20,
				padding: 2,
				background: on ? t.primary : t.muted,
				border: `1px solid ${on ? t.primary : t.border}`,
				display: "inline-flex",
				flexShrink: 0,
				transition: "background 0.15s",
			}}
		>
			<span
				className="rounded-full"
				style={{
					width: 14,
					height: 14,
					background: on ? t.primaryFg : t.mutedFg,
					transform: on ? "translateX(14px)" : "translateX(0)",
					transition: "transform 0.15s",
				}}
			/>
		</span>
	);
	const SectionBtn = ({
		id,
		label,
		disabled = false,
		hint,
	}: {
		id: "display" | "aparencia" | "modulos" | "extras";
		label: string;
		disabled?: boolean;
		hint?: string;
	}) => (
		<button
			type="button"
			disabled={disabled}
			title={disabled ? hint : undefined}
			onClick={() => !disabled && setCfgSection((s) => (s === id ? null : id))}
			className="w-full rounded-md flex items-center gap-2 text-sm"
			style={{
				padding: "8px 10px",
				background: "transparent",
				border: "none",
				color: disabled ? t.mutedFg : t.foreground,
				opacity: disabled ? 0.55 : 1,
				cursor: disabled ? "not-allowed" : "pointer",
				textAlign: "left",
			}}
		>
			<svg
				aria-hidden="true"
				width="15"
				height="15"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
				style={{ flexShrink: 0, opacity: 0.8 }}
			>
				<path d={SECTION_ICON_PATHS[id]} />
			</svg>
			<span style={{ flex: 1 }}>{label}</span>
			{disabled ? (
				<svg
					aria-hidden="true"
					width="12"
					height="12"
					viewBox="0 0 24 24"
					fill="none"
					stroke={t.mutedFg}
					strokeWidth="2"
				>
					<rect x="3" y="11" width="18" height="11" rx="2" />
					<path d="M7 11V7a5 5 0 0 1 10 0v4" />
				</svg>
			) : (
				<svg
					aria-hidden="true"
					width="13"
					height="13"
					viewBox="0 0 24 24"
					fill="none"
					stroke={t.mutedFg}
					strokeWidth="2"
					style={{
						transform: cfgSection === id ? "rotate(180deg)" : "none",
						transition: "transform 0.15s",
					}}
				>
					<path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
				</svg>
			)}
		</button>
	);
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
					width: collapsed ? 72 : 232,
					flexShrink: 0,
					background: t.card,
					borderRight: `1px solid ${t.border}`,
					position: "sticky",
					top: 0,
					height: "100vh",
					flexDirection: "column",
					transition: "width 0.15s ease",
				}}
			>
				<div
					className="flex items-center gap-3"
					style={{
						height: 64,
						borderBottom: `1px solid ${t.border}`,
						flexShrink: 0,
						padding: collapsed ? "0 12px" : "0 20px",
						justifyContent: collapsed ? "center" : "flex-start",
					}}
				>
					<div
						className="rounded-lg flex items-center justify-center"
						style={{
							width: 34,
							height: 34,
							background: t.primary,
							flexShrink: 0,
						}}
					>
						<svg
							aria-hidden="true"
							width="18"
							height="18"
							viewBox="0 0 24 24"
							fill="none"
						>
							<path d="M12 2 3 7v2h18V7L12 2Z" fill={t.primaryFg} />
							<path
								d="M5 10v8M9 10v8M15 10v8M19 10v8"
								stroke={t.primaryFg}
								strokeWidth="2"
							/>
							<path d="M3 20h18v2H3z" fill={t.primaryFg} />
						</svg>
					</div>
					{!collapsed && (
						<div>
							<div
								className="text-xs uppercase tracking-wider"
								style={{ color: t.mutedFg }}
							>
								Prefeitura
							</div>
							<div
								className="text-sm font-bold"
								style={{ color: t.foreground }}
							>
								Palotina
							</div>
						</div>
					)}
				</div>
				<nav
					className="p-3 flex flex-col gap-1"
					style={{ flex: 1, overflowY: "auto" }}
				>
					{visibleGroups.map((g, gi) => (
						<div key={gi} className={gi ? "mt-3" : ""}>
							{g.label && !collapsed && (
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
										title={collapsed ? n.label : undefined}
										onNav={() => setNavOpen(false)}
										className="text-sm rounded-md flex items-center gap-3"
										style={{
											padding: collapsed ? "10px" : "9px 12px",
											justifyContent: collapsed ? "center" : "flex-start",
											textDecoration: "none",
											fontWeight: active ? 600 : 500,
											background: active ? t.primary : "transparent",
											color: active ? t.primaryFg : t.mutedFg,
										}}
									>
										<svg
											aria-hidden="true"
											width="18"
											height="18"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
											style={{ flexShrink: 0 }}
										>
											<path d={n.icon} />
										</svg>
										{!collapsed && <span>{n.label}</span>}
									</Link>
								);
							})}
						</div>
					))}
				</nav>
				<div
					className="p-3 flex flex-col gap-2"
					style={{ borderTop: `1px solid ${t.border}`, flexShrink: 0 }}
				>
					{/* order: 1 → Configurações fica após Recolher (último item) */}
					<div style={{ position: "relative", order: 1 }}>
						<button
							type="button"
							onClick={() => {
								setCfgOpen((o) => !o);
								setCfgSection(null);
							}}
							aria-label="Configurações"
							title={collapsed ? "Configurações" : undefined}
							className={`w-full rounded-md flex items-center gap-2 text-xs font-medium ${
								collapsed ? "justify-center" : ""
							}`}
							style={{
								background: t.muted,
								border: `1px solid ${t.border}`,
								color: t.mutedFg,
								padding: collapsed ? "9px" : "9px 11px",
								cursor: "pointer",
							}}
						>
							<svg
								aria-hidden="true"
								width="18"
								height="18"
								viewBox="0 0 24 24"
								fill="none"
								stroke={t.mutedFg}
								strokeWidth="2"
								style={{ flexShrink: 0 }}
							>
								<circle cx="12" cy="12" r="3" />
								<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
							</svg>
							{!collapsed && <span>Configurações</span>}
						</button>
						{cfgOpen && (
							<div
								className="rounded-lg"
								style={{
									position: "absolute",
									bottom: "calc(100% + 8px)",
									left: 0,
									right: collapsed ? "auto" : 0,
									minWidth: 240,
									maxHeight: "min(70vh, 520px)",
									overflowY: "auto",
									background: t.card,
									border: `1px solid ${t.border}`,
									boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
									padding: 6,
									zIndex: 30,
								}}
							>
								<div
									className="text-xs font-semibold uppercase tracking-wider"
									style={{ color: t.mutedFg, padding: "6px 10px 4px" }}
								>
									Configurações
								</div>
								<SectionBtn id="display" label="Display" />
								{cfgSection === "display" && (
									<div style={{ padding: "0 0 4px" }}>
										<button
											type="button"
											role="switch"
											aria-checked={autoScroll}
											onClick={() => setAutoScroll((v) => !v)}
											className="w-full rounded-md flex items-center gap-2 text-sm"
											style={{
												padding: "6px 10px 6px 18px",
												background: "transparent",
												border: "none",
												color: t.foreground,
												cursor: "pointer",
												textAlign: "left",
											}}
										>
											<Sw on={autoScroll} />
											<span style={{ flex: 1 }}>Scroll Automático</span>
										</button>
									</div>
								)}
								<SectionBtn id="aparencia" label="Aparência" />
								{cfgSection === "aparencia" && <ThemePanel />}
								<SectionBtn
									id="modulos"
									label="Módulos"
									disabled={!isAdmin}
									hint="Apenas o Administrador pode ativar/desativar módulos."
								/>
								{cfgSection === "modulos" && isAdmin && (
									<div style={{ padding: "0 0 4px" }}>
										{NAV_GROUPS.flatMap((g) => g.items)
											.filter((m) => !LOCKED_PATHS.has(m.path))
											.map((m) => (
												<button
													key={m.path}
													type="button"
													role="switch"
													aria-checked={!hidden.has(m.path)}
													onClick={() => toggleModule(m.path)}
													className="w-full rounded-md flex items-center gap-2 text-sm"
													style={{
														padding: "6px 10px 6px 18px",
														background: "transparent",
														border: "none",
														color: t.foreground,
														cursor: "pointer",
														textAlign: "left",
													}}
												>
													<Sw on={!hidden.has(m.path)} />
													<span style={{ flex: 1 }}>{m.label}</span>
												</button>
											))}
									</div>
								)}
								<SectionBtn id="extras" label="Extras" />
								{cfgSection === "extras" && (
									<div style={{ padding: "0 0 4px" }}>
										<button
											type="button"
											role="switch"
											aria-checked={extras}
											onClick={toggleExtras}
											className="w-full rounded-md flex items-center gap-2 text-sm"
											style={{
												padding: "6px 10px 6px 18px",
												background: "transparent",
												border: "none",
												color: t.foreground,
												cursor: "pointer",
												textAlign: "left",
											}}
										>
											<Sw on={extras} />
											<span style={{ flex: 1 }}>Análises e Alertas</span>
										</button>
									</div>
								)}
								<button
									type="button"
									onClick={() => {
										setCfgOpen(false);
										onLogout();
									}}
									className="w-full rounded-md flex items-center gap-2 text-sm"
									style={{
										padding: "8px 10px",
										background: "transparent",
										border: "none",
										color: t.foreground,
										cursor: "pointer",
										textAlign: "left",
									}}
								>
									<svg
										aria-hidden="true"
										width="15"
										height="15"
										viewBox="0 0 24 24"
										fill="none"
										stroke={t.danger}
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
										style={{ flexShrink: 0 }}
									>
										<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
										<path d="m16 17 5-5-5-5" />
										<path d="M21 12H9" />
									</svg>
									Sair
								</button>
							</div>
						)}
					</div>
					<button
						type="button"
						onClick={toggleCollapsed}
						aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
						title={collapsed ? "Expandir" : "Recolher"}
						className={`w-full rounded-md flex items-center gap-2 text-xs font-medium ${
							collapsed ? "justify-center" : ""
						}`}
						style={{
							background: t.muted,
							border: `1px solid ${t.border}`,
							color: t.mutedFg,
							padding: collapsed ? "9px" : "9px 11px",
							cursor: "pointer",
						}}
					>
						<svg
							aria-hidden="true"
							width="18"
							height="18"
							viewBox="0 0 24 24"
							fill="none"
							stroke={t.mutedFg}
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							style={{
								flexShrink: 0,
								transform: collapsed ? "rotate(180deg)" : "none",
							}}
						>
							<path d="m11 17-5-5 5-5M18 17l-5-5 5-5" />
						</svg>
						{!collapsed && (
							<span style={{ flex: 1, textAlign: "left" }}>Recolher</span>
						)}
					</button>
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
							type="button"
							onClick={() => setNavOpen((v) => !v)}
							aria-label="Alternar menu"
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
								aria-hidden="true"
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
					{extras && <AnalisesAlertas path={route.path} />}
				</main>
			</div>
		</div>
	);
}

/* ============================================================================
   APP — ThemeProvider + RouterProvider + gate de autenticação (login → Shell)
   ============================================================================ */
const AUTH_KEY = "mg_auth";

const ROLE_KEY = "mg_role";

function AuthGate() {
	const [authed, setAuthed] = useState(() => {
		try {
			return localStorage.getItem(AUTH_KEY) === "1";
		} catch {
			return false;
		}
	});
	// Papel persistido apenas para sessões "manter conectado". Sem valor → não-admin.
	const [role, setRole] = useState<Role | null>(() => {
		try {
			return (localStorage.getItem(ROLE_KEY) as Role | null) ?? null;
		} catch {
			return null;
		}
	});
	const login = (keep: boolean, r: Role) => {
		setRole(r);
		if (keep) {
			try {
				localStorage.setItem(AUTH_KEY, "1");
				localStorage.setItem(ROLE_KEY, r);
			} catch {
				// localStorage indisponível (ex.: modo privado) — segue sem persistir
			}
		}
		setAuthed(true);
	};
	const logout = () => {
		try {
			localStorage.removeItem(AUTH_KEY);
			localStorage.removeItem(ROLE_KEY);
		} catch {
			// localStorage indisponível — nada a limpar
		}
		setRole(null);
		setAuthed(false);
	};
	if (!authed) return <LoginScreen onLogin={login} />;
	return (
		<DataProvider>
			<Shell onLogout={logout} isAdmin={role === "admin"} />
		</DataProvider>
	);
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
