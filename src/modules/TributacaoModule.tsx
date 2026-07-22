import {
	Bar,
	BarChart,
	CartesianGrid,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { Card, HBar, Kpi, LegendDot, Tip, Title } from "../components";
import { TB } from "../data";
import { brl, dP, fmt, pct } from "../format";
import { useTheme } from "../theme";

export default function TributacaoModule() {
	const { t, cats } = useTheme();
	const adimpColor = (p) => (p >= 85 ? t.ok : p >= 60 ? t.primary : t.warn);
	// totais DA
	const daRows = TB.da.map(([n, si, ins, rec, can, aj]) => {
		const sf = si + ins - rec - can;
		return { n, si, ins, rec, can, aj, sf, ajuiz: (sf * aj) / 100 };
	});
	const daSF = daRows.reduce((s, r) => s + r.sf, 0);
	const daRec = daRows.reduce((s, r) => s + r.rec, 0);
	const daAjuiz = daRows.reduce((s, r) => s + r.ajuiz, 0);
	const funil = [
		["Saldo em Dívida Ativa", daSF],
		["Ajuizado", daAjuiz],
		["Recuperado no período", daRec],
	];
	return (
		<>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
				<Kpi
					label="Receita Própria"
					value={brl(TB.propria)}
					accent={t.primary}
					sub={`${pct(TB.propriaPart)} da receita arrecadada`}
				/>
				<Kpi
					label="IPTU"
					value={brl(TB.iptuArr)}
					progress={TB.iptuAdimp}
					sub={`${pct(TB.iptuAdimp)} de adimplência`}
				/>
				<Kpi
					label="ISS"
					value={brl(TB.issArr)}
					sub={`${dP(TB.issYoY)} vs 2025 (atividade econ.)`}
				/>
				<Kpi
					label="ITBI"
					value={brl(TB.itbiArr)}
					sub={`${TB.itbiTransm.toLocaleString("pt-BR")} transmissões`}
				/>
				<Kpi
					label="Saldo da Dívida Ativa"
					value={brl(TB.daSaldo)}
					sub={`${pct(TB.daRecPct)} recuperado no período`}
				/>
				<Kpi
					label="Inadimplência (vencida)"
					value={brl(TB.inadVencida)}
					accent={t.warn}
					sub="Crédito vencido não pago"
				/>
				<Kpi
					label="Renúncia de Receita"
					value={brl(TB.renuncia)}
					sub="Isenções, imunidades, anistias"
				/>
				<Kpi
					label="Adesão à Cota Única"
					value={pct(TB.cotaUnica)}
					sub="IPTU pago à vista"
				/>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
				<Card className="p-5 lg:col-span-2">
					<Title
						right={
							<div className="flex gap-3 text-xs">
								<LegendDot color={cats[0]}>IPTU</LegendDot>
								<LegendDot color={cats[1]}>ISS</LegendDot>
								<LegendDot color={cats[3]}>ITBI</LegendDot>
							</div>
						}
					>
						Evolução mensal — IPTU / ISS / ITBI
					</Title>
					<div style={{ height: 250 }}>
						<ResponsiveContainer width="100%" height="100%">
							<LineChart
								data={TB.meses.map(([mes, a, b, c]) => ({
									mes,
									IPTU: a,
									ISS: b,
									ITBI: c,
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
									dataKey="IPTU"
									stroke={cats[0]}
									strokeWidth={2.5}
									dot={false}
								/>
								<Line
									type="monotone"
									dataKey="ISS"
									stroke={cats[1]}
									strokeWidth={2.5}
									dot={false}
								/>
								<Line
									type="monotone"
									dataKey="ITBI"
									stroke={cats[3]}
									strokeWidth={2.5}
									dot={false}
								/>
							</LineChart>
						</ResponsiveContainer>
					</div>
					<div className="text-xs mt-1" style={{ color: t.mutedFg }}>
						IPTU concentrado no início (cota única); ISS estável (autolançamento
						mensal); ITBI segue o mercado imobiliário.
					</div>
				</Card>
				<Card className="p-5">
					<Title
						right={
							<div className="flex gap-3 text-xs">
								<LegendDot color={cats[6]}>Lançado</LegendDot>
								<LegendDot color={cats[0]}>Arrecadado</LegendDot>
							</div>
						}
					>
						Lançado × Arrecadado
					</Title>
					<div style={{ height: 250 }}>
						<ResponsiveContainer width="100%" height="100%">
							<BarChart
								data={TB.tributos.map(([n, l, a]) => ({
									nome: n,
									Lançado: l,
									Arrecadado: a,
								}))}
								margin={{ top: 6, right: 8, left: -16, bottom: 0 }}
								barGap={2}
							>
								<CartesianGrid
									strokeDasharray="3 3"
									stroke={t.border}
									vertical={false}
								/>
								<XAxis
									dataKey="nome"
									tick={{ fontSize: 10, fill: t.foreground }}
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
								<Bar dataKey="Lançado" fill={cats[6]} radius={[3, 3, 0, 0]} />
								<Bar
									dataKey="Arrecadado"
									fill={cats[0]}
									radius={[3, 3, 0, 0]}
								/>
							</BarChart>
						</ResponsiveContainer>
					</div>
				</Card>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
				<Card className="p-5">
					<Title
						right={
							<span className="text-xs font-bold" style={{ color: t.primary }}>
								{pct(TB.daRecPct)} recup.
							</span>
						}
					>
						Funil da Dívida Ativa
					</Title>
					<div className="flex flex-col gap-3 mt-1">
						{funil.map(([label, val], i) => (
							<div key={i}>
								<div className="flex items-baseline justify-between mb-1">
									<span
										className="text-xs font-medium"
										style={{ color: t.foreground }}
									>
										{label}
									</span>
									<span
										className="text-sm font-bold tabular-nums"
										style={{ color: t.foreground }}
									>
										{brl(val)}
									</span>
								</div>
								<div
									className="rounded-md overflow-hidden"
									style={{ height: 24, background: t.secondary }}
								>
									<div
										style={{
											height: "100%",
											width: `${(Number(val) / Number(funil[0][1])) * 100}%`,
											background: `linear-gradient(90deg, ${t.primary}, ${cats[3]})`,
											borderRadius: 6,
										}}
									/>
								</div>
							</div>
						))}
					</div>
					<div className="text-xs mt-3" style={{ color: t.mutedFg }}>
						Recuperação de DA é estruturalmente baixa — daí o foco na cobrança
						administrativa antes do ajuizamento.
					</div>
				</Card>
				<Card className="p-5">
					<Title>ISS por Setor (CNAE)</Title>
					<HBar
						highlightFirst
						data={TB.setores.map(([n, v]) => ({ nome: n, valor: v }))}
						height={250}
						ylabel={118}
					/>
				</Card>
				<Card className="p-5">
					<Title
						right={
							<div className="flex gap-3 text-xs">
								<LegendDot color={cats[3]}>Arrecadado</LegendDot>
								<LegendDot color={t.warn}>Inadimplência</LegendDot>
							</div>
						}
					>
						IPTU por Região
					</Title>
					<div style={{ height: 250 }}>
						<ResponsiveContainer width="100%" height="100%">
							<BarChart
								data={TB.bairros.map(([n, a, i]) => ({
									nome: n,
									Arrecadado: a,
									Inadimplência: i,
								}))}
								layout="vertical"
								margin={{ top: 0, right: 12, left: 0, bottom: 0 }}
								barGap={1}
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
									dataKey="nome"
									tick={{ fontSize: 10, fill: t.foreground }}
									axisLine={false}
									tickLine={false}
									width={96}
								/>
								<Tooltip content={<Tip />} cursor={{ fill: t.muted }} />
								<Bar
									dataKey="Arrecadado"
									fill={cats[3]}
									radius={[0, 3, 3, 0]}
								/>
								<Bar
									dataKey="Inadimplência"
									fill={t.warn}
									radius={[0, 3, 3, 0]}
								/>
							</BarChart>
						</ResponsiveContainer>
					</div>
				</Card>
			</div>

			{/* Tabela 1 — Desempenho por tributo */}
			<Card className="p-5 mb-4">
				<Title
					right={
						<span className="text-xs" style={{ color: t.mutedFg }}>
							acumulado · R$ milhões
						</span>
					}
				>
					Desempenho por Tributo
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
									Tributo
								</th>
								<th
									className="text-right"
									style={{ padding: "8px 10px", fontWeight: 600 }}
								>
									Lançado
								</th>
								<th
									className="text-right"
									style={{ padding: "8px 10px", fontWeight: 600 }}
								>
									Arrecadado
								</th>
								<th
									className="text-right"
									style={{ padding: "8px 10px", fontWeight: 600 }}
								>
									Inadimpl.
								</th>
								<th
									className="text-left"
									style={{ padding: "8px 10px", fontWeight: 600, width: 150 }}
								>
									% Adimplência
								</th>
								<th
									className="text-right"
									style={{ padding: "8px 10px", fontWeight: 600 }}
								>
									Recup. DA
								</th>
							</tr>
						</thead>
						<tbody>
							{TB.tributos.map(([n, l, a, inad, rec], i) => {
								const adimp = (a / l) * 100;
								const c = adimpColor(adimp);
								return (
									<tr
										key={i}
										style={{
											borderTop: `1px solid ${t.border}`,
											background: ["IPTU", "ISS", "ITBI"].includes(n)
												? t.muted
												: "transparent",
										}}
									>
										<td
											style={{
												padding: "9px 10px",
												color: t.foreground,
												fontWeight: 600,
											}}
										>
											{n}
										</td>
										<td
											className="text-right tabular-nums"
											style={{ padding: "9px 10px", color: t.mutedFg }}
										>
											{fmt(l)}
										</td>
										<td
											className="text-right tabular-nums"
											style={{
												padding: "9px 10px",
												color: t.foreground,
												fontWeight: 600,
											}}
										>
											{fmt(a)}
										</td>
										<td
											className="text-right tabular-nums"
											style={{ padding: "9px 10px", color: t.warn }}
										>
											{fmt(inad)}
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
															width: `${adimp}%`,
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
														width: 44,
														textAlign: "right",
													}}
												>
													{pct(adimp)}
												</span>
											</div>
										</td>
										<td
											className="text-right tabular-nums"
											style={{ padding: "9px 10px", color: t.foreground }}
										>
											{fmt(rec)}
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</Card>

			{/* Tabela 2 — Dívida Ativa */}
			<Card className="p-5 mb-4">
				<Title
					right={
						<span className="text-xs" style={{ color: t.mutedFg }}>
							estoque e movimento · R$ milhões
						</span>
					}
				>
					Dívida Ativa por Tributo
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
									Tributo
								</th>
								<th
									className="text-right"
									style={{ padding: "8px 10px", fontWeight: 600 }}
								>
									Saldo Inicial
								</th>
								<th
									className="text-right"
									style={{ padding: "8px 10px", fontWeight: 600 }}
								>
									Inscrições
								</th>
								<th
									className="text-right"
									style={{ padding: "8px 10px", fontWeight: 600 }}
								>
									Recuperado
								</th>
								<th
									className="text-right"
									style={{ padding: "8px 10px", fontWeight: 600 }}
								>
									Cancel./Prescr.
								</th>
								<th
									className="text-right"
									style={{ padding: "8px 10px", fontWeight: 600 }}
								>
									Saldo Final
								</th>
								<th
									className="text-right"
									style={{ padding: "8px 10px", fontWeight: 600 }}
								>
									% Ajuiz.
								</th>
							</tr>
						</thead>
						<tbody>
							{daRows.map((r, i) => (
								<tr key={i} style={{ borderTop: `1px solid ${t.border}` }}>
									<td
										style={{
											padding: "9px 10px",
											color: t.foreground,
											fontWeight: 600,
										}}
									>
										{r.n}
									</td>
									<td
										className="text-right tabular-nums"
										style={{ padding: "9px 10px", color: t.mutedFg }}
									>
										{fmt(r.si)}
									</td>
									<td
										className="text-right tabular-nums"
										style={{ padding: "9px 10px", color: t.foreground }}
									>
										{fmt(r.ins)}
									</td>
									<td
										className="text-right tabular-nums"
										style={{ padding: "9px 10px", color: t.ok }}
									>
										{fmt(r.rec)}
									</td>
									<td
										className="text-right tabular-nums"
										style={{ padding: "9px 10px", color: t.mutedFg }}
									>
										{fmt(r.can)}
									</td>
									<td
										className="text-right tabular-nums"
										style={{
											padding: "9px 10px",
											color: t.foreground,
											fontWeight: 600,
										}}
									>
										{fmt(r.sf)}
									</td>
									<td
										className="text-right tabular-nums"
										style={{ padding: "9px 10px", color: t.mutedFg }}
									>
										{r.aj}%
									</td>
								</tr>
							))}
							<tr style={{ borderTop: `2px solid ${t.border}` }}>
								<td style={{ padding: "9px 10px", fontWeight: 700 }}>Total</td>
								<td
									className="text-right tabular-nums"
									style={{ padding: "9px 10px", fontWeight: 700 }}
								>
									{fmt(daRows.reduce((s, r) => s + r.si, 0))}
								</td>
								<td
									className="text-right tabular-nums"
									style={{ padding: "9px 10px", fontWeight: 700 }}
								>
									{fmt(daRows.reduce((s, r) => s + r.ins, 0))}
								</td>
								<td
									className="text-right tabular-nums"
									style={{ padding: "9px 10px", fontWeight: 700, color: t.ok }}
								>
									{fmt(daRec)}
								</td>
								<td
									className="text-right tabular-nums"
									style={{ padding: "9px 10px", fontWeight: 700 }}
								>
									{fmt(daRows.reduce((s, r) => s + r.can, 0))}
								</td>
								<td
									className="text-right tabular-nums"
									style={{
										padding: "9px 10px",
										fontWeight: 700,
										color: t.primary,
									}}
								>
									{fmt(daSF)}
								</td>
								<td
									className="text-right tabular-nums"
									style={{ padding: "9px 10px", fontWeight: 700 }}
								>
									{Math.round((daAjuiz / daSF) * 100)}%
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</Card>

			{/* Top devedores + Renúncia */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
				<Card className="p-5">
					<Title
						right={
							<span
								className="text-xs rounded"
								style={{
									padding: "2px 7px",
									background: t.accent,
									color: t.mutedFg,
									fontSize: 10,
								}}
							>
								nomes fictícios · LGPD
							</span>
						}
					>
						Maiores Devedores
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
										Contribuinte
									</th>
									<th
										className="text-left"
										style={{ padding: "7px 8px", fontWeight: 600 }}
									>
										Tributo
									</th>
									<th
										className="text-left"
										style={{ padding: "7px 8px", fontWeight: 600 }}
									>
										Situação
									</th>
									<th
										className="text-right"
										style={{ padding: "7px 8px", fontWeight: 600 }}
									>
										Em aberto
									</th>
								</tr>
							</thead>
							<tbody>
								{TB.devedores.map(([nome, trib, sit, val], i) => (
									<tr key={i} style={{ borderTop: `1px solid ${t.border}` }}>
										<td style={{ padding: "8px", color: t.foreground }}>
											{nome}
										</td>
										<td style={{ padding: "8px", color: t.mutedFg }}>{trib}</td>
										<td style={{ padding: "8px" }}>
											<span
												className="text-xs rounded"
												style={{
													padding: "1px 7px",
													background: t.muted,
													color: t.mutedFg,
												}}
											>
												{sit}
											</span>
										</td>
										<td
											className="text-right tabular-nums"
											style={{
												padding: "8px",
												color: t.foreground,
												fontWeight: 600,
											}}
										>
											{fmt(val)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
					<div className="text-xs mt-2" style={{ color: t.mutedFg }}>
						Dados de devedor são pessoais — em produção, anonimize por padrão e
						restrinja a visão nominal por perfil de acesso.
					</div>
				</Card>
				<Card className="p-5">
					<Title
						right={
							<span className="text-xs" style={{ color: t.mutedFg }}>
								LRF art. 14 · LDO
							</span>
						}
					>
						Renúncia de Receita
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
										Benefício
									</th>
									<th
										className="text-left"
										style={{ padding: "7px 8px", fontWeight: 600 }}
									>
										Tributo
									</th>
									<th
										className="text-right"
										style={{ padding: "7px 8px", fontWeight: 600 }}
									>
										Renunciado
									</th>
									<th
										className="text-left"
										style={{ padding: "7px 8px", fontWeight: 600 }}
									>
										Amparo legal
									</th>
								</tr>
							</thead>
							<tbody>
								{TB.renuncias.map(([ben, trib, val, lei], i) => (
									<tr key={i} style={{ borderTop: `1px solid ${t.border}` }}>
										<td style={{ padding: "8px", color: t.foreground }}>
											{ben}
										</td>
										<td style={{ padding: "8px", color: t.mutedFg }}>{trib}</td>
										<td
											className="text-right tabular-nums"
											style={{
												padding: "8px",
												color: t.foreground,
												fontWeight: 600,
											}}
										>
											{fmt(val)}
										</td>
										<td
											style={{ padding: "8px", color: t.mutedFg, fontSize: 11 }}
										>
											{lei}
										</td>
									</tr>
								))}
								<tr style={{ borderTop: `2px solid ${t.border}` }}>
									<td colSpan={2} style={{ padding: "8px", fontWeight: 700 }}>
										Total renunciado
									</td>
									<td
										className="text-right tabular-nums"
										style={{
											padding: "8px",
											fontWeight: 700,
											color: t.primary,
										}}
									>
										{fmt(TB.renuncias.reduce((s, r) => s + r[2], 0))}
									</td>
									<td></td>
								</tr>
							</tbody>
						</table>
					</div>
				</Card>
			</div>
		</>
	);
}
