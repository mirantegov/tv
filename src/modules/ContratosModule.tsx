import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	ReferenceLine,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { Card, Donut, HBar, Kpi, LegendDot, Tip, Title } from "../components";
import { CON } from "../data";
import { brl, fmt, fmtInt, pct } from "../format";
import { useTheme } from "../theme";

export default function ContratosModule() {
	const { t, cats } = useTheme();
	const venceColor = (d) => (d <= 30 ? t.danger : d <= 90 ? t.warn : t.ok);
	return (
		<>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
				<Kpi
					label="Valor Contratado"
					value={brl(CON.contratado)}
					accent={t.primary}
					sub={`${fmtInt(CON.vigentes)} contratos vigentes`}
				/>
				<Kpi
					label="Valor Executado"
					value={brl(CON.executado)}
					progress={CON.execPct}
					sub={`${pct(CON.execPct)} da carteira`}
				/>
				<Kpi
					label="Saldo a Executar"
					value={brl(CON.saldo)}
					sub="Atualizado − Executado"
				/>
				<Kpi
					label="Aditivos"
					value={brl(CON.aditivos)}
					sub={`${pct(CON.aditivosPct)} sobre o original`}
				/>
				<Kpi
					label="A Vencer em 90 dias"
					value={fmtInt(CON.aVencer90)}
					accent={t.warn}
					sub={`${brl(CON.aVencer90Valor)} em valor`}
				/>
				<Kpi
					label="Vencidos c/ Saldo"
					value={fmtInt(CON.vencidosQtd)}
					sub={`${brl(CON.vencidosSaldo)} a encerrar`}
				/>
				<Kpi
					label="Concentração Top 5"
					value={pct(CON.topFornPct)}
					sub="da carteira (dependência)"
				/>
				<Kpi
					label="Valor Original"
					value={brl(CON.original)}
					sub="antes dos aditivos"
				/>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
				<Card className="p-5 lg:col-span-2">
					<Title
						right={
							<div className="flex gap-3 text-xs">
								<LegendDot color={cats[0]}>Executado</LegendDot>
								<LegendDot color={cats[6]}>Saldo</LegendDot>
							</div>
						}
					>
						Execução da Carteira por Órgão
					</Title>
					<div style={{ height: 240 }}>
						<ResponsiveContainer width="100%" height="100%">
							<BarChart
								data={CON.orgaos.map(([og, ex, sa]) => ({
									orgao: og,
									Executado: ex,
									Saldo: sa,
								}))}
								layout="vertical"
								margin={{ top: 0, right: 12, left: 0, bottom: 0 }}
							>
								<CartesianGrid
									strokeDasharray="3 3"
									stroke={t.border}
									horizontal={false}
								/>
								<XAxis
									type="number"
									tick={{ fontSize: 11, fill: t.mutedFg }}
									axisLine={false}
									tickLine={false}
								/>
								<YAxis
									type="category"
									dataKey="orgao"
									tick={{ fontSize: 10, fill: t.foreground }}
									axisLine={false}
									tickLine={false}
									width={100}
								/>
								<Tooltip content={<Tip />} cursor={{ fill: t.muted }} />
								<Bar
									dataKey="Executado"
									stackId="c"
									fill={cats[0]}
									radius={[0, 0, 0, 0]}
								/>
								<Bar
									dataKey="Saldo"
									stackId="c"
									fill={cats[6]}
									radius={[0, 3, 3, 0]}
								/>
							</BarChart>
						</ResponsiveContainer>
					</div>
				</Card>
				<Card className="p-5">
					<Title>Contratos por Tipo</Title>
					<Donut
						data={CON.tipo.map(([n, v]) => ({ nome: n, valor: v }))}
						height={210}
					/>
				</Card>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
				<Card className="p-5">
					<Title>Top Fornecedores</Title>
					<HBar
						highlightFirst
						data={CON.fornecedores.map(([n, v]) => ({ nome: n, valor: v }))}
						height={230}
						ylabel={130}
					/>
				</Card>
				<Card className="p-5">
					<Title>Contratos por Fonte</Title>
					<HBar
						data={CON.fonte.map(([n, v]) => ({ nome: n, valor: v }))}
						height={230}
						ylabel={110}
					/>
				</Card>
				<Card className="p-5">
					<Title
						right={
							<span className="text-xs" style={{ color: t.mutedFg }}>
								limite art. 125
							</span>
						}
					>
						Aditivos por Contrato
					</Title>
					<div style={{ height: 230 }}>
						<ResponsiveContainer width="100%" height="100%">
							<BarChart
								data={CON.aditivosDet.map(([c, , , p, lim]) => ({
									nome: c,
									pct: p,
									lim,
								}))}
								layout="vertical"
								margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
							>
								<CartesianGrid
									strokeDasharray="3 3"
									stroke={t.border}
									horizontal={false}
								/>
								<XAxis
									type="number"
									tick={{ fontSize: 11, fill: t.mutedFg }}
									axisLine={false}
									tickLine={false}
									tickFormatter={(v) => `${v}%`}
									domain={[0, 55]}
								/>
								<YAxis
									type="category"
									dataKey="nome"
									tick={{ fontSize: 10, fill: t.foreground }}
									axisLine={false}
									tickLine={false}
									width={86}
								/>
								<Tooltip
									cursor={{ fill: t.muted }}
									content={({ active, payload }) =>
										active && payload?.length ? (
											<div
												style={{
													background: t.card,
													border: `1px solid ${t.border}`,
													borderRadius: 8,
													padding: "6px 10px",
													fontSize: 12,
													color: t.foreground,
												}}
											>
												<b>{payload[0].payload.nome}</b>:{" "}
												{pct(payload[0].payload.pct)}{" "}
												<span style={{ color: t.mutedFg }}>
													(limite {payload[0].payload.lim}%)
												</span>
											</div>
										) : null
									}
								/>
								<ReferenceLine x={25} stroke={t.warn} strokeDasharray="4 3" />
								<ReferenceLine x={50} stroke={t.danger} strokeDasharray="4 3" />
								<Bar dataKey="pct" radius={[0, 4, 4, 0]}>
									{CON.aditivosDet.map(([, , , p, lim], i) => (
										<Cell
											key={i}
											fill={
												p >= lim * 0.9
													? t.danger
													: p >= lim * 0.6
														? t.warn
														: t.primary
											}
										/>
									))}
								</Bar>
							</BarChart>
						</ResponsiveContainer>
					</div>
				</Card>
			</div>

			<Card className="p-5 mb-4">
				<Title
					right={
						<div className="flex gap-3 text-xs">
							<LegendDot color={t.danger}>≤30d</LegendDot>
							<LegendDot color={t.warn}>≤90d</LegendDot>
						</div>
					}
				>
					Vencimentos — próximos 12 meses
				</Title>
				<div style={{ height: 200 }}>
					<ResponsiveContainer width="100%" height="100%">
						<BarChart
							data={CON.vencimentos.map(([mes, v]) => ({ mes, valor: v }))}
							margin={{ top: 6, right: 8, left: -12, bottom: 0 }}
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
							<Tooltip content={<Tip />} cursor={{ fill: t.muted }} />
							<Bar dataKey="valor" name="A vencer" radius={[3, 3, 0, 0]}>
								{CON.vencimentos.map((_, i) => (
									<Cell
										key={i}
										fill={i === 0 ? t.danger : i < 3 ? t.warn : cats[3]}
									/>
								))}
							</Bar>
						</BarChart>
					</ResponsiveContainer>
				</div>
				<div className="text-xs mt-2" style={{ color: t.mutedFg }}>
					Contrato vencendo sem nova licitação encaminhada = risco de
					descontinuidade de serviço essencial.
				</div>
			</Card>

			<Card className="p-5 mb-4">
				<Title
					right={
						<span className="text-xs" style={{ color: t.mutedFg }}>
							R$ milhões · semáforo de vigência
						</span>
					}
				>
					Carteira de Contratos
				</Title>
				<div className="overflow-x-auto">
					<table
						className="w-full"
						style={{ borderCollapse: "collapse", fontSize: 12.5 }}
					>
						<thead>
							<tr style={{ color: t.mutedFg }}>
								<th
									className="text-left"
									style={{ padding: "8px", fontWeight: 600 }}
								>
									Contrato
								</th>
								<th
									className="text-left"
									style={{ padding: "8px", fontWeight: 600 }}
								>
									Objeto
								</th>
								<th
									className="text-left"
									style={{ padding: "8px", fontWeight: 600 }}
								>
									Fornecedor
								</th>
								<th
									className="text-right"
									style={{ padding: "8px", fontWeight: 600 }}
								>
									Original
								</th>
								<th
									className="text-right"
									style={{ padding: "8px", fontWeight: 600 }}
								>
									Aditivos
								</th>
								<th
									className="text-right"
									style={{ padding: "8px", fontWeight: 600 }}
								>
									Atualizado
								</th>
								<th
									className="text-right"
									style={{ padding: "8px", fontWeight: 600 }}
								>
									Executado
								</th>
								<th
									className="text-right"
									style={{ padding: "8px", fontWeight: 600 }}
								>
									Saldo
								</th>
								<th
									className="text-left"
									style={{ padding: "8px", fontWeight: 600, width: 110 }}
								>
									% Exec.
								</th>
								<th
									className="text-right"
									style={{ padding: "8px", fontWeight: 600 }}
								>
									Vence em
								</th>
							</tr>
						</thead>
						<tbody>
							{CON.carteira.map(
								([ct, ob, fo, _og, orig, adit, exec, dias], i) => {
									const atual = orig + adit;
									const saldo = atual - exec;
									const ex = (exec / atual) * 100;
									return (
										<tr key={i} style={{ borderTop: `1px solid ${t.border}` }}>
											<td
												style={{
													padding: "8px",
													color: t.foreground,
													fontWeight: 600,
												}}
											>
												{ct}
											</td>
											<td style={{ padding: "8px", color: t.foreground }}>
												{ob}
											</td>
											<td style={{ padding: "8px", color: t.mutedFg }}>{fo}</td>
											<td
												className="text-right tabular-nums"
												style={{ padding: "8px", color: t.mutedFg }}
											>
												{fmt(orig)}
											</td>
											<td
												className="text-right tabular-nums"
												style={{ padding: "8px", color: t.foreground }}
											>
												{fmt(adit)}
											</td>
											<td
												className="text-right tabular-nums"
												style={{
													padding: "8px",
													color: t.foreground,
													fontWeight: 600,
												}}
											>
												{fmt(atual)}
											</td>
											<td
												className="text-right tabular-nums"
												style={{ padding: "8px", color: t.foreground }}
											>
												{fmt(exec)}
											</td>
											<td
												className="text-right tabular-nums"
												style={{ padding: "8px", color: t.mutedFg }}
											>
												{fmt(saldo)}
											</td>
											<td style={{ padding: "8px" }}>
												<div className="flex items-center gap-2">
													<div
														className="rounded-full overflow-hidden"
														style={{
															flex: 1,
															height: 6,
															background: t.secondary,
														}}
													>
														<div
															style={{
																height: "100%",
																width: `${ex}%`,
																background: t.primary,
																borderRadius: 999,
															}}
														/>
													</div>
													<span
														className="tabular-nums"
														style={{
															color: t.foreground,
															fontWeight: 600,
															width: 40,
															textAlign: "right",
														}}
													>
														{Math.round(ex)}%
													</span>
												</div>
											</td>
											<td
												className="text-right tabular-nums"
												style={{
													padding: "8px",
													color: venceColor(dias),
													fontWeight: 700,
												}}
											>
												{dias}d
											</td>
										</tr>
									);
								},
							)}
						</tbody>
					</table>
				</div>
			</Card>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
				<Card className="p-5">
					<Title
						right={
							<span className="text-xs" style={{ color: t.warn }}>
								ação: renovar / licitar
							</span>
						}
					>
						Contratos a Vencer (90 dias)
					</Title>
					<div className="overflow-x-auto">
						<table
							className="w-full"
							style={{ borderCollapse: "collapse", fontSize: 12.5 }}
						>
							<thead>
								<tr style={{ color: t.mutedFg }}>
									<th
										className="text-left"
										style={{ padding: "7px 8px", fontWeight: 600 }}
									>
										Contrato
									</th>
									<th
										className="text-left"
										style={{ padding: "7px 8px", fontWeight: 600 }}
									>
										Fornecedor
									</th>
									<th
										className="text-left"
										style={{ padding: "7px 8px", fontWeight: 600 }}
									>
										Objeto
									</th>
									<th
										className="text-right"
										style={{ padding: "7px 8px", fontWeight: 600 }}
									>
										Valor
									</th>
									<th
										className="text-right"
										style={{ padding: "7px 8px", fontWeight: 600 }}
									>
										Vence
									</th>
								</tr>
							</thead>
							<tbody>
								{CON.aVencer.map(([ct, fo, ob, vl, di], i) => (
									<tr key={i} style={{ borderTop: `1px solid ${t.border}` }}>
										<td
											style={{
												padding: "8px",
												color: t.foreground,
												fontWeight: 600,
											}}
										>
											{ct}
										</td>
										<td style={{ padding: "8px", color: t.mutedFg }}>{fo}</td>
										<td style={{ padding: "8px", color: t.foreground }}>
											{ob}
										</td>
										<td
											className="text-right tabular-nums"
											style={{
												padding: "8px",
												color: t.foreground,
												fontWeight: 600,
											}}
										>
											{fmt(vl)}
										</td>
										<td
											className="text-right tabular-nums"
											style={{
												padding: "8px",
												color: venceColor(di),
												fontWeight: 700,
											}}
										>
											{di}d
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</Card>
				<Card className="p-5">
					<Title>Aditivos · Concentração por Fornecedor</Title>
					<table
						className="w-full"
						style={{ borderCollapse: "collapse", fontSize: 12 }}
					>
						<thead>
							<tr style={{ color: t.mutedFg }}>
								<th
									className="text-left"
									style={{ padding: "6px", fontWeight: 600 }}
								>
									Contrato/Forn.
								</th>
								<th
									className="text-left"
									style={{ padding: "6px", fontWeight: 600 }}
								>
									Tipo
								</th>
								<th
									className="text-right"
									style={{ padding: "6px", fontWeight: 600 }}
								>
									Valor
								</th>
								<th
									className="text-right"
									style={{ padding: "6px", fontWeight: 600 }}
								>
									% acum.
								</th>
							</tr>
						</thead>
						<tbody>
							{CON.aditivosDet.map(([c, tp, vl, p, lim], i) => (
								<tr key={i} style={{ borderTop: `1px solid ${t.border}` }}>
									<td
										style={{
											padding: "7px 6px",
											color: t.foreground,
											fontWeight: 600,
										}}
									>
										{c}
									</td>
									<td style={{ padding: "7px 6px", color: t.mutedFg }}>{tp}</td>
									<td
										className="text-right tabular-nums"
										style={{ padding: "7px 6px", color: t.foreground }}
									>
										{fmt(vl)}
									</td>
									<td
										className="text-right tabular-nums"
										style={{
											padding: "7px 6px",
											color:
												p >= lim * 0.9
													? t.danger
													: p >= lim * 0.6
														? t.warn
														: t.foreground,
											fontWeight: 600,
										}}
									>
										{pct(p)}{" "}
										<span style={{ color: t.mutedFg, fontWeight: 400 }}>
											/ {lim}%
										</span>
									</td>
								</tr>
							))}
						</tbody>
					</table>
					<div
						style={{
							borderTop: `1px solid ${t.border}`,
							marginTop: 8,
							paddingTop: 8,
						}}
					>
						{CON.concentr.map(([fo, n, vl, p], i) => (
							<div
								key={i}
								className="flex items-center gap-2 text-xs"
								style={{ padding: "3px 0" }}
							>
								<span style={{ color: t.foreground, flex: 1 }}>
									{fo} <span style={{ color: t.mutedFg }}>({n} contr.)</span>
								</span>
								<span
									className="tabular-nums"
									style={{ color: t.foreground, fontWeight: 600 }}
								>
									{fmt(vl)}
								</span>
								<span
									className="tabular-nums"
									style={{ color: t.mutedFg, width: 44, textAlign: "right" }}
								>
									{pct(p)}
								</span>
							</div>
						))}
					</div>
				</Card>
			</div>
		</>
	);
}
