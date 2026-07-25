import { useState } from "react";
import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { AnalisesAlertas } from "../AnalisesAlertas";
import {
	Card,
	Delta,
	Diverging,
	GroupedBars,
	KpiCmp,
	LegendDot,
	Tip,
	Title,
	TreeCmp,
} from "../components";
import { useData } from "../DataProvider";
import { dP, dR, pct, vari } from "../format";
import { useTheme } from "../theme";
import type { PlanEntComp } from "../types";

export default function PlanejamentoComparativoModule() {
	const { CP } = useData();
	const { t, prev, cur } = useTheme();
	const [aba, setAba] = useState("integral");
	const abas = [
		["integral", "Orçamento Integral"],
		["prefeitura", "Prefeitura"],
		["camara", "Câmara"],
		["previdencia", "Previdência"],
		["saneamento", "Saneamento"],
	];

	// Bloco genérico para prefeitura/câmara/previdência/saneamento
	const EntidadeComp = ({ ent, gid }: { ent: PlanEntComp; gid: string }) => {
		const gv = ent.grupo
			.map(([n, a, b]) => ({ nome: n, ...vari(a, b) }))
			.sort((x, y) => y.p - x.p);
		const first = ent.evol[0][1];
		const last = ent.evol[ent.evol.length - 1][1];
		const cagr = (last / first) ** (1 / (ent.evol.length - 1)) - 1;
		// teto: Pessoal/Folha/Duodécimo/Taxa (perto/acima = pior); mínimo: Saúde/Educação (abaixo = pior)
		const isTeto = (nome: string) => /Pessoal|Folha|Duodécimo|Taxa/.test(nome);
		const vincColor = (nome: string, b: number, limite: number) =>
			isTeto(nome)
				? b >= limite
					? t.danger
					: b >= limite * 0.9
						? t.warn
						: t.ok
				: b < limite
					? t.danger
					: b < limite * 1.1
						? t.warn
						: t.ok;
		return (
			<>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
					<KpiCmp
						label="Receita prevista"
						a={ent.recA}
						b={ent.recB}
						accent={t.primary}
					/>
					<KpiCmp label="Despesa fixada" a={ent.despA} b={ent.despB} />
					{ent.resB !== 0 ? (
						<KpiCmp label="Resultado" a={ent.resA} b={ent.resB} accent={t.ok} />
					) : (
						<Card className="p-4">
							<div
								className="text-xs uppercase tracking-wider mb-1"
								style={{ color: t.mutedFg }}
							>
								Resultado
							</div>
							<div
								className="text-xl font-bold"
								style={{ color: t.foreground }}
							>
								Equilíbrio
							</div>
							<div className="text-xs mt-2" style={{ color: t.mutedFg }}>
								receita = despesa
							</div>
						</Card>
					)}
					<Card className="p-4">
						<div
							className="text-xs uppercase tracking-wider mb-1"
							style={{ color: t.mutedFg }}
						>
							Maior alta · grupo
						</div>
						<div className="text-sm font-bold" style={{ color: t.foreground }}>
							{gv[0].nome}
						</div>
						<div className="mt-2 text-sm">
							<Delta {...gv[0]} />
						</div>
					</Card>
					<Card className="p-4">
						<div
							className="text-xs uppercase tracking-wider mb-1"
							style={{ color: t.mutedFg }}
						>
							Maior queda · grupo
						</div>
						<div className="text-sm font-bold" style={{ color: t.foreground }}>
							{gv[gv.length - 1].nome}
						</div>
						<div className="mt-2 text-sm">
							<Delta {...gv[gv.length - 1]} />
						</div>
					</Card>
				</div>
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
					<Card className="p-5 lg:col-span-2">
						<Title
							right={
								<span className="text-xs" style={{ color: t.mutedFg }}>
									Orçado por exercício
								</span>
							}
						>
							Evolução do Orçamento
						</Title>
						<div style={{ height: 240 }}>
							<ResponsiveContainer width="100%" height="100%">
								<AreaChart
									data={ent.evol.map(([ano, v]) => ({ ano, Orçado: v }))}
									margin={{ top: 6, right: 10, left: -10, bottom: 0 }}
								>
									<defs>
										<linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
											<stop offset="0%" stopColor={cur} stopOpacity={0.4} />
											<stop offset="100%" stopColor={cur} stopOpacity={0.03} />
										</linearGradient>
									</defs>
									<CartesianGrid
										strokeDasharray="3 3"
										stroke={t.border}
										vertical={false}
									/>
									<XAxis
										dataKey="ano"
										tick={{ fontSize: 11, fill: t.mutedFg }}
										axisLine={{ stroke: t.border }}
										tickLine={false}
									/>
									<YAxis
										tick={{ fontSize: 11, fill: t.mutedFg }}
										axisLine={false}
										tickLine={false}
										width={42}
										domain={["auto", "auto"]}
									/>
									<Tooltip content={<Tip />} />
									<Area
										type="monotone"
										dataKey="Orçado"
										stroke={cur}
										strokeWidth={2.5}
										fill={`url(#${gid})`}
										dot={{ r: 3, fill: cur }}
									/>
								</AreaChart>
							</ResponsiveContainer>
						</div>
					</Card>
					<Card className="p-5 flex flex-col justify-center gap-4">
						<div>
							<div
								className="text-xs uppercase tracking-wider"
								style={{ color: t.mutedFg }}
							>
								Crescimento médio
							</div>
							<div
								className="text-2xl font-bold tabular-nums"
								style={{ color: t.primary }}
							>
								{dP(cagr * 100)}{" "}
								<span className="text-sm" style={{ color: t.mutedFg }}>
									a.a.
								</span>
							</div>
						</div>
						<div>
							<div
								className="text-xs uppercase tracking-wider"
								style={{ color: t.mutedFg }}
							>
								Despesa {CP.anoB} vs {CP.anoA}
							</div>
							<div className="text-lg font-bold">
								<Delta {...vari(ent.despA, ent.despB)} />
							</div>
						</div>
					</Card>
				</div>
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
					<Card className="p-5 lg:col-span-2">
						<Title
							right={
								<div className="flex gap-4 text-xs">
									<LegendDot color={prev}>{CP.anoA}</LegendDot>
									<LegendDot color={cur}>{CP.anoB}</LegendDot>
								</div>
							}
						>
							Despesa por Grupo — {CP.anoA} × {CP.anoB}
						</Title>
						<GroupedBars
							data={ent.grupo.map(([n, a, b]) => ({
								mes: n,
								a2025: a,
								a2026: b,
							}))}
							height={250}
						/>
					</Card>
					<Card className="p-5">
						<Title>Variação YoY por Grupo (%)</Title>
						<Diverging
							data={ent.grupo.map(([n, a, b]) => ({ nome: n, ...vari(a, b) }))}
							height={250}
							ylabel={110}
						/>
					</Card>
				</div>
				{ent.vinc.length > 0 && (
					<Card className="p-5 mb-4">
						<Title
							right={
								<span className="text-xs" style={{ color: t.mutedFg }}>
									Previsto na LOA {CP.anoB}
								</span>
							}
						>
							Vinculações Previstas
						</Title>
						<div className="overflow-x-auto">
							<table
								className="w-full"
								style={{ borderCollapse: "collapse", fontSize: 13 }}
							>
								<thead>
									<tr style={{ color: t.mutedFg }}>
										<th
											className="text-left"
											style={{ padding: "8px 10px", fontWeight: 600 }}
										>
											Vinculação
										</th>
										<th
											className="text-right"
											style={{ padding: "8px 10px", fontWeight: 600 }}
										>
											{CP.anoA}
										</th>
										<th
											className="text-right"
											style={{ padding: "8px 10px", fontWeight: 600 }}
										>
											{CP.anoB}
										</th>
										<th
											className="text-right"
											style={{ padding: "8px 10px", fontWeight: 600 }}
										>
											Limite
										</th>
									</tr>
								</thead>
								<tbody>
									{ent.vinc.map((v) => (
										<tr
											key={v.nome}
											style={{ borderTop: `1px solid ${t.border}` }}
										>
											<td style={{ padding: "8px 10px", color: t.foreground }}>
												{v.nome}
											</td>
											<td
												className="text-right tabular-nums"
												style={{ padding: "8px 10px", color: t.mutedFg }}
											>
												{pct(v.a)}
											</td>
											<td
												className="text-right tabular-nums"
												style={{
													padding: "8px 10px",
													fontWeight: 600,
													color: vincColor(v.nome, v.b, v.limite),
												}}
											>
												{pct(v.b)}
											</td>
											<td
												className="text-right tabular-nums"
												style={{ padding: "8px 10px", color: t.mutedFg }}
											>
												{isTeto(v.nome) ? "≤ " : "≥ "}
												{pct(v.limite)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</Card>
				)}
			</>
		);
	};

	const ev = CP.entidades
		.map(([n, a, b]) => ({ nome: n, ...vari(a, b) }))
		.sort((x, y) => y.p - x.p);
	const first = CP.evol[0][1];
	const last = CP.evol[CP.evol.length - 1][1];
	const cagr = (last / first) ** (1 / (CP.evol.length - 1)) - 1;
	// cor de vinculação: Pessoal → limite é teto (perto = pior); Saúde/Educação → limite é mínimo (abaixo = pior)
	const vincColor = (nome: string, b: number, limite: number) => {
		if (nome.startsWith("Pessoal"))
			return b >= limite ? t.danger : b >= limite * 0.9 ? t.warn : t.ok;
		return b < limite ? t.danger : b < limite * 1.1 ? t.warn : t.ok;
	};
	return (
		<>
			<div className="mb-5">
				<div
					className="flex flex-wrap rounded-lg overflow-hidden"
					style={{ border: `1px solid ${t.border}`, width: "fit-content" }}
				>
					{abas.map(([k, l]) => (
						<button
							key={k}
							type="button"
							data-autoscroll-tab
							onClick={() => setAba(k)}
							className="text-xs sm:text-sm font-medium"
							style={{
								padding: "8px 14px",
								background: aba === k ? t.primary : t.card,
								color: aba === k ? t.primaryFg : t.mutedFg,
								border: "none",
								cursor: "pointer",
							}}
						>
							{l}
						</button>
					))}
				</div>
			</div>

			{aba === "integral" && (
				<>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
						<KpiCmp
							label="Orçamento consolidado (LOA)"
							a={CP.orcA}
							b={CP.orcB}
							accent={t.primary}
						/>
						<KpiCmp label="Receita prevista" a={CP.recA} b={CP.recB} />
						<KpiCmp label="Despesa fixada" a={CP.despA} b={CP.despB} />
						<Card className="p-4">
							<div
								className="text-xs uppercase tracking-wider mb-1"
								style={{ color: t.mutedFg }}
							>
								Maior alta · entidade
							</div>
							<div
								className="text-sm font-bold"
								style={{ color: t.foreground }}
							>
								{ev[0].nome}
							</div>
							<div className="mt-2 text-sm">
								<Delta {...ev[0]} />
							</div>
						</Card>
						<Card className="p-4">
							<div
								className="text-xs uppercase tracking-wider mb-1"
								style={{ color: t.mutedFg }}
							>
								Maior queda · entidade
							</div>
							<div
								className="text-sm font-bold"
								style={{ color: t.foreground }}
							>
								{ev[ev.length - 1].nome}
							</div>
							<div className="mt-2 text-sm">
								<Delta {...ev[ev.length - 1]} />
							</div>
						</Card>
					</div>
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
						<Card className="p-5 lg:col-span-2">
							<Title
								right={
									<span className="text-xs" style={{ color: t.mutedFg }}>
										Orçamento fixado por exercício
									</span>
								}
							>
								Evolução do Orçamento (LOA)
							</Title>
							<div style={{ height: 240 }}>
								<ResponsiveContainer width="100%" height="100%">
									<AreaChart
										data={CP.evol.map(([ano, v]) => ({ ano, Orçamento: v }))}
										margin={{ top: 6, right: 10, left: -10, bottom: 0 }}
									>
										<defs>
											<linearGradient id="gp" x1="0" y1="0" x2="0" y2="1">
												<stop offset="0%" stopColor={cur} stopOpacity={0.4} />
												<stop
													offset="100%"
													stopColor={cur}
													stopOpacity={0.03}
												/>
											</linearGradient>
										</defs>
										<CartesianGrid
											strokeDasharray="3 3"
											stroke={t.border}
											vertical={false}
										/>
										<XAxis
											dataKey="ano"
											tick={{ fontSize: 11, fill: t.mutedFg }}
											axisLine={{ stroke: t.border }}
											tickLine={false}
										/>
										<YAxis
											tick={{ fontSize: 11, fill: t.mutedFg }}
											axisLine={false}
											tickLine={false}
											width={42}
											domain={["auto", "auto"]}
										/>
										<Tooltip content={<Tip />} />
										<Area
											type="monotone"
											dataKey="Orçamento"
											stroke={cur}
											strokeWidth={2.5}
											fill="url(#gp)"
											dot={{ r: 3, fill: cur }}
										/>
									</AreaChart>
								</ResponsiveContainer>
							</div>
						</Card>
						<Card className="p-5 flex flex-col justify-center gap-4">
							<div>
								<div
									className="text-xs uppercase tracking-wider"
									style={{ color: t.mutedFg }}
								>
									Crescimento médio
								</div>
								<div
									className="text-2xl font-bold tabular-nums"
									style={{ color: t.primary }}
								>
									{dP(cagr * 100)}{" "}
									<span className="text-sm" style={{ color: t.mutedFg }}>
										a.a.
									</span>
								</div>
							</div>
							<div>
								<div
									className="text-xs uppercase tracking-wider"
									style={{ color: t.mutedFg }}
								>
									Acumulado {CP.evol.length} exercícios
								</div>
								<div
									className="text-2xl font-bold tabular-nums"
									style={{ color: t.ok }}
								>
									{dP((last / first - 1) * 100)}
								</div>
								<div
									className="text-xs tabular-nums mt-1"
									style={{ color: t.mutedFg }}
								>
									R$ {dR(first).slice(1)} → {dR(last).slice(1)} mi
								</div>
							</div>
							<div>
								<div
									className="text-xs uppercase tracking-wider"
									style={{ color: t.mutedFg }}
								>
									{CP.anoB} vs {CP.anoA}
								</div>
								<div className="text-lg font-bold">
									<Delta {...vari(CP.orcA, CP.orcB)} />
								</div>
							</div>
						</Card>
					</div>
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
						<Card className="p-5 lg:col-span-2">
							<Title
								right={
									<div className="flex gap-4 text-xs">
										<LegendDot color={prev}>{CP.anoA}</LegendDot>
										<LegendDot color={cur}>{CP.anoB}</LegendDot>
									</div>
								}
							>
								Orçamento por Entidade — {CP.anoA} × {CP.anoB}
							</Title>
							<GroupedBars
								data={CP.entidades.map(([n, a, b]) => ({
									mes: n,
									a2025: a,
									a2026: b,
								}))}
								height={250}
							/>
						</Card>
						<Card className="p-5">
							<Title>Variação YoY por Entidade (%)</Title>
							<Diverging data={ev} height={250} ylabel={110} />
						</Card>
					</div>
					<Card className="p-5 mb-4">
						<Title
							right={
								<span className="text-xs" style={{ color: t.mutedFg }}>
									Previsto na LOA {CP.anoB}
								</span>
							}
						>
							Vinculações Constitucionais Previstas
						</Title>
						<div className="overflow-x-auto">
							<table
								className="w-full"
								style={{ borderCollapse: "collapse", fontSize: 13 }}
							>
								<thead>
									<tr style={{ color: t.mutedFg }}>
										<th
											className="text-left"
											style={{ padding: "8px 10px", fontWeight: 600 }}
										>
											Vinculação
										</th>
										<th
											className="text-right"
											style={{ padding: "8px 10px", fontWeight: 600 }}
										>
											{CP.anoA}
										</th>
										<th
											className="text-right"
											style={{ padding: "8px 10px", fontWeight: 600 }}
										>
											{CP.anoB}
										</th>
										<th
											className="text-right"
											style={{ padding: "8px 10px", fontWeight: 600 }}
										>
											Limite
										</th>
									</tr>
								</thead>
								<tbody>
									{CP.vinc.map((v) => {
										const teto = v.nome.startsWith("Pessoal");
										return (
											<tr
												key={v.nome}
												style={{ borderTop: `1px solid ${t.border}` }}
											>
												<td
													style={{ padding: "8px 10px", color: t.foreground }}
												>
													{v.nome}
												</td>
												<td
													className="text-right tabular-nums"
													style={{ padding: "8px 10px", color: t.mutedFg }}
												>
													{pct(v.a)}
												</td>
												<td
													className="text-right tabular-nums"
													style={{
														padding: "8px 10px",
														fontWeight: 600,
														color: vincColor(v.nome, v.b, v.limite),
													}}
												>
													{pct(v.b)}
												</td>
												<td
													className="text-right tabular-nums"
													style={{ padding: "8px 10px", color: t.mutedFg }}
												>
													{teto ? "≤ " : "≥ "}
													{pct(v.limite)}
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					</Card>
					<Card className="p-5 mb-4">
						<Title>Despesa Fixada por Função › Subfunção</Title>
						<TreeCmp
							nodes={CP.arvore}
							level0="Função"
							totalLabel="Despesa Fixada (LOA)"
							tot25={CP.totA}
							tot26={CP.totB}
						/>
					</Card>
				</>
			)}

			{aba === "prefeitura" && <EntidadeComp ent={CP.pref} gid="ga-pref" />}
			{aba === "camara" && <EntidadeComp ent={CP.camara} gid="ga-camara" />}
			{aba === "previdencia" && <EntidadeComp ent={CP.prev} gid="ga-prev" />}
			{aba === "saneamento" && <EntidadeComp ent={CP.san} gid="ga-san" />}

			<AnalisesAlertas path={`/planejamento-comp/${aba}`} />
		</>
	);
}
