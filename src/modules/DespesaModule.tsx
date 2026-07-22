import {
	CartesianGrid,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { Card, Donut, HBar, Kpi, LegendDot, Tip, Title } from "../components";
import { D } from "../data";
import { brl, fmt, pct } from "../format";
import { useTheme } from "../theme";

export default function DespesaModule() {
	const { t, cats } = useTheme();
	const stages = [
		["Dotação Atualizada", D.dotacao, null],
		["Empenhado", D.emp, [(D.emp / D.dotacao) * 100, "da dotação"]],
		["Liquidado", D.liq, [(D.liq / D.emp) * 100, "do empenhado"]],
		["Pago", D.pago, [(D.pago / D.liq) * 100, "do liquidado"]],
	];
	return (
		<>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 mb-4">
				<Kpi
					label="Dotação Atualizada"
					value={brl(D.dotacao)}
					sub={`Inicial ${fmt(D.inicial)} · Créditos +${fmt(D.creditos)}`}
				/>
				<Kpi
					label="Empenhado"
					value={brl(D.emp)}
					accent={t.primary}
					progress={(D.emp / D.dotacao) * 100}
					sub={`${pct((D.emp / D.dotacao) * 100)} da dotação`}
				/>
				<Kpi
					label="Liquidado"
					value={brl(D.liq)}
					progress={(D.liq / D.emp) * 100}
					sub={`${pct((D.liq / D.emp) * 100)} do empenhado`}
				/>
				<Kpi
					label="Pago"
					value={brl(D.pago)}
					progress={(D.pago / D.liq) * 100}
					sub={`${pct((D.pago / D.liq) * 100)} do liquidado`}
				/>
				<Kpi
					label="Saldo a Empenhar"
					value={brl(D.saldo)}
					sub={`${pct((D.saldo / D.dotacao) * 100)} disponível`}
				/>
				<Kpi
					label="Restos a Pagar"
					value={brl(D.restos)}
					sub="Proc. 41,2 · N/Proc. 54,2"
				/>
			</div>
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
				<Card className="p-5">
					<Title>Funil de execução</Title>
					<div className="flex flex-col gap-3">
						{stages.map((s, i) => (
							<div key={i}>
								<div className="flex items-baseline justify-between mb-1">
									<span
										className="text-xs font-medium"
										style={{ color: t.foreground }}
									>
										{s[0]}
									</span>
									<span
										className="text-sm font-bold tabular-nums"
										style={{ color: t.foreground }}
									>
										{brl(s[1])}
									</span>
								</div>
								<div className="flex items-center gap-3">
									<div
										className="rounded-md overflow-hidden"
										style={{ flex: 1, height: 24, background: t.secondary }}
									>
										<div
											style={{
												height: "100%",
												width: `${(Number(s[1]) / D.dotacao) * 100}%`,
												background: `linear-gradient(90deg, ${t.primary}, ${cats[3]})`,
												borderRadius: 6,
											}}
										/>
									</div>
									<div
										className="tabular-nums text-right text-xs"
										style={{ width: 128, color: t.mutedFg }}
									>
										{s[2] ? (
											<>
												<b style={{ color: t.primary }}>{pct(s[2][0])}</b>{" "}
												{s[2][1]}
											</>
										) : (
											"base 100%"
										)}
									</div>
								</div>
							</div>
						))}
					</div>
				</Card>
				<Card className="p-5">
					<Title
						right={
							<div className="flex gap-3 text-xs">
								<LegendDot color={cats[0]}>Emp.</LegendDot>
								<LegendDot color={cats[3]}>Liq.</LegendDot>
								<LegendDot color={cats[1]}>Pago</LegendDot>
							</div>
						}
					>
						Evolução acumulada
					</Title>
					<div style={{ height: 230 }}>
						<ResponsiveContainer width="100%" height="100%">
							<LineChart
								data={D.meses.map(([mes, e, l, p]) => ({
									mes,
									Empenhado: e,
									Liquidado: l,
									Pago: p,
								}))}
								margin={{ top: 6, right: 8, left: -10, bottom: 0 }}
							>
								<CartesianGrid
									strokeDasharray="3 3"
									stroke={t.border}
									vertical={false}
								/>
								<XAxis
									dataKey="mes"
									tick={{ fontSize: 11, fill: t.mutedFg }}
									axisLine={{ stroke: t.border }}
									tickLine={false}
								/>
								<YAxis
									tick={{ fontSize: 11, fill: t.mutedFg }}
									axisLine={false}
									tickLine={false}
									width={42}
								/>
								<Tooltip content={<Tip />} />
								<Line
									type="monotone"
									dataKey="Empenhado"
									stroke={cats[0]}
									strokeWidth={2.5}
									dot={false}
								/>
								<Line
									type="monotone"
									dataKey="Liquidado"
									stroke={cats[3]}
									strokeWidth={2.5}
									dot={false}
								/>
								<Line
									type="monotone"
									dataKey="Pago"
									stroke={cats[1]}
									strokeWidth={2.5}
									dot={false}
								/>
							</LineChart>
						</ResponsiveContainer>
					</div>
				</Card>
			</div>
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
				<Card className="p-5">
					<Title>Despesa por Função</Title>
					<HBar
						highlightFirst
						data={[...D.funcoes]
							.map(([n, e]) => ({ nome: n, valor: e }))
							.sort((a, b) => b.valor - a.valor)}
						height={250}
						ylabel={96}
					/>
				</Card>
				<Card className="p-5">
					<Title>Por Natureza (GND)</Title>
					<Donut
						data={D.gnd.map(([n, v]) => ({ nome: n, valor: v }))}
						height={230}
					/>
				</Card>
			</div>
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
				{D.gov.map(([nome, val, scale, lim, limL, alerta, status], i) => {
					const c = status === "ok" ? t.ok : t.warn;
					return (
						<Card key={i} className="p-4">
							<div className="flex items-start justify-between mb-1">
								<span
									className="text-xs font-semibold"
									style={{ color: t.foreground }}
								>
									{nome}
								</span>
								<span
									className="text-xs font-bold tabular-nums"
									style={{
										color: c,
										background: t.muted,
										padding: "1px 8px",
										borderRadius: 999,
									}}
								>
									{pct(val)}
								</span>
							</div>
							<div
								className="relative rounded-full mt-3"
								style={{ height: 9, background: t.secondary }}
							>
								<div
									style={{
										position: "absolute",
										inset: 0,
										width: `${(val / scale) * 100}%`,
										height: "100%",
										background: c,
										borderRadius: 999,
									}}
								/>
								{alerta && (
									<div
										style={{
											position: "absolute",
											left: `${(alerta / scale) * 100}%`,
											top: -3,
											height: 15,
											width: 2,
											background: t.warn,
										}}
									/>
								)}
								<div
									style={{
										position: "absolute",
										left: `${(lim / scale) * 100}%`,
										top: -3,
										height: 15,
										width: 2,
										background: t.foreground,
									}}
								/>
							</div>
							<div
								className="flex justify-between text-xs mt-2"
								style={{ color: t.mutedFg }}
							>
								<span>0%</span>
								<span style={{ color: t.foreground, fontWeight: 600 }}>
									{limL}
								</span>
								<span>{scale}%</span>
							</div>
						</Card>
					);
				})}
			</div>
			<Card className="p-5">
				<Title>Execução por Órgão / Unidade</Title>
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
									Órgão
								</th>
								<th
									className="text-right"
									style={{ padding: "8px 10px", fontWeight: 600 }}
								>
									Dotação
								</th>
								<th
									className="text-right"
									style={{ padding: "8px 10px", fontWeight: 600 }}
								>
									Empenhado
								</th>
								<th
									className="text-right"
									style={{ padding: "8px 10px", fontWeight: 600 }}
								>
									Pago
								</th>
								<th
									className="text-left"
									style={{ padding: "8px 10px", fontWeight: 600, width: 160 }}
								>
									% Execução
								</th>
							</tr>
						</thead>
						<tbody>
							{D.orgaos.map(([nome, dot, emp, pago], i) => {
								const ex = (emp / dot) * 100;
								const c = ex >= 55 ? t.ok : ex >= 45 ? t.primary : t.warn;
								return (
									<tr key={i} style={{ borderTop: `1px solid ${t.border}` }}>
										<td
											style={{
												padding: "9px 10px",
												color: t.foreground,
												fontWeight: 500,
											}}
										>
											{nome}
										</td>
										<td
											className="text-right tabular-nums"
											style={{ padding: "9px 10px", color: t.mutedFg }}
										>
											{fmt(dot)}
										</td>
										<td
											className="text-right tabular-nums"
											style={{
												padding: "9px 10px",
												color: t.foreground,
												fontWeight: 600,
											}}
										>
											{fmt(emp)}
										</td>
										<td
											className="text-right tabular-nums"
											style={{ padding: "9px 10px", color: t.foreground }}
										>
											{fmt(pago)}
										</td>
										<td style={{ padding: "9px 10px" }}>
											<div className="flex items-center gap-2">
												<div
													className="rounded-full overflow-hidden"
													style={{
														flex: 1,
														height: 7,
														background: t.secondary,
													}}
												>
													<div
														style={{
															height: "100%",
															width: `${ex}%`,
															background: c,
															borderRadius: 999,
														}}
													/>
												</div>
												<span
													className="tabular-nums"
													style={{
														color: t.foreground,
														fontWeight: 600,
														width: 46,
														textAlign: "right",
													}}
												>
													{pct(ex)}
												</span>
											</div>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</Card>
		</>
	);
}
