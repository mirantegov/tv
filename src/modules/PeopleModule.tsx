import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	CartesianGrid,
	ReferenceLine,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { Card, Donut, Kpi, LegendDot, TipNum, Title } from "../components";
import { PA } from "../data";
import { fmt, fmtInt, pct } from "../format";
import { useTheme } from "../theme";

export default function PeopleModule() {
	const { t, cats, prev } = useTheme();
	const totDias = PA.absent.reduce((s, a) => s + a[1], 0);
	return (
		<>
			<div
				className="rounded-xl mb-4 flex items-center gap-3"
				style={{
					background: t.card,
					border: `1px solid ${t.border}`,
					padding: "10px 14px",
				}}
			>
				<svg
					aria-hidden="true"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke={t.mutedFg}
					strokeWidth="2"
				>
					<circle cx="12" cy="12" r="10" />
					<path d="M12 16v-4M12 8h.01" strokeLinecap="round" />
				</svg>
				<span className="text-xs" style={{ color: t.mutedFg }}>
					People Analytics opera com{" "}
					<b style={{ color: t.foreground }}>dados agregados</b>. Saúde (CID),
					gênero e remuneração nominal são sensíveis — visão individual só por
					perfil; células com poucos servidores são suprimidas (k-anonimato).
				</span>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
				<Kpi
					label="Headcount Ativo"
					value={fmtInt(PA.headcount)}
					accent={t.primary}
					sub={`${fmtInt(PA.total)} c/ inativos e pensionistas`}
				/>
				<Kpi
					label="Turnover"
					value={pct(PA.turnover)}
					sub="Movimentação no período"
				/>
				<Kpi
					label="Absenteísmo"
					value={pct(PA.absenteismo)}
					sub={`${fmtInt(totDias)} dias de afastamento`}
				/>
				<Kpi
					label="Tempo Médio de Serviço"
					value={`${fmt(PA.tempoMedio)} anos`}
					sub={`Idade média ${fmt(PA.idadeMedia)}`}
				/>
				<Kpi
					label="Elegíveis à Aposentadoria"
					value={fmtInt(PA.elegiveis)}
					accent={t.warn}
					sub={`${pct(PA.elegiveisPct)} do quadro (hoje)`}
				/>
				<Kpi
					label="Cobertura de Cargos"
					value={pct(PA.cobertura)}
					sub={`${fmtInt(PA.providos)} / ${fmtInt(PA.autorizados)} vagas`}
				/>
				<Kpi
					label="Razão Comiss. / Efetivos"
					value={pct(PA.razaoCom)}
					sub="Indicador de profissionalização"
				/>
				<Kpi
					label="Idade Média"
					value={`${fmt(PA.idadeMedia)} anos`}
					sub="Quadro maduro"
				/>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
				<Card className="p-5 lg:col-span-2">
					<Title
						right={
							<div className="flex gap-3 text-xs">
								<LegendDot color={prev}>Masculino</LegendDot>
								<LegendDot color={cats[1]}>Feminino</LegendDot>
							</div>
						}
					>
						Pirâmide Etária
					</Title>
					<div style={{ height: 250 }}>
						<ResponsiveContainer width="100%" height="100%">
							<BarChart
								data={PA.piramide.map(([faixa, m, f]) => ({
									faixa,
									Masculino: -m,
									Feminino: f,
								}))}
								layout="vertical"
								stackOffset="sign"
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
									tickFormatter={(v) => fmtInt(Math.abs(v))}
								/>
								<YAxis
									type="category"
									dataKey="faixa"
									tick={{ fontSize: 11, fill: t.foreground }}
									axisLine={false}
									tickLine={false}
									width={52}
								/>
								<Tooltip content={<TipNum />} cursor={{ fill: t.muted }} />
								<ReferenceLine x={0} stroke={t.mutedFg} />
								<Bar
									dataKey="Masculino"
									fill={prev}
									radius={[3, 0, 0, 3]}
									stackId="p"
								/>
								<Bar
									dataKey="Feminino"
									fill={cats[1]}
									radius={[0, 3, 3, 0]}
									stackId="p"
								/>
							</BarChart>
						</ResponsiveContainer>
					</div>
					<div className="text-xs mt-1" style={{ color: t.mutedFg }}>
						Concentração nas faixas 40–59 → onda de aposentadorias à frente;
						planejar concursos.
					</div>
				</Card>
				<Card className="p-5">
					<Title>Composição por Vínculo</Title>
					<Donut
						numeric
						data={PA.vinculo.map(([n, v]) => ({ nome: n, valor: v }))}
						height={210}
					/>
				</Card>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
				<Card className="p-5 lg:col-span-2">
					<Title
						right={
							<div className="flex gap-3 text-xs">
								<LegendDot color={cats[0]}>Admissões</LegendDot>
								<LegendDot color={t.warn}>Desligamentos</LegendDot>
							</div>
						}
					>
						Admissões × Desligamentos
					</Title>
					<div style={{ height: 230 }}>
						<ResponsiveContainer width="100%" height="100%">
							<BarChart
								data={PA.mov.map(([mes, a, d]) => ({
									mes,
									Admissões: a,
									Desligamentos: d,
								}))}
								margin={{ top: 6, right: 8, left: -16, bottom: 0 }}
								barGap={3}
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
									width={36}
								/>
								<Tooltip content={<TipNum />} cursor={{ fill: t.muted }} />
								<Bar dataKey="Admissões" fill={cats[0]} radius={[3, 3, 0, 0]} />
								<Bar
									dataKey="Desligamentos"
									fill={t.warn}
									radius={[3, 3, 0, 0]}
								/>
							</BarChart>
						</ResponsiveContainer>
					</div>
				</Card>
				<Card className="p-5">
					<Title>Escolaridade</Title>
					<Donut
						numeric
						data={PA.escolaridade.map(([n, v]) => ({ nome: n, valor: v }))}
						height={210}
					/>
				</Card>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
				<Card className="p-5 lg:col-span-2">
					<Title
						right={
							<span className="text-xs" style={{ color: t.mutedFg }}>
								servidores que atingem requisitos
							</span>
						}
					>
						Curva de Elegibilidade à Aposentadoria
					</Title>
					<div style={{ height: 230 }}>
						<ResponsiveContainer width="100%" height="100%">
							<AreaChart
								data={PA.elegCurva.map(([ano, v]) => ({ ano, Elegíveis: v }))}
								margin={{ top: 6, right: 10, left: -14, bottom: 0 }}
							>
								<defs>
									<linearGradient id="grPpl" x1="0" y1="0" x2="0" y2="1">
										<stop offset="0%" stopColor={t.warn} stopOpacity={0.4} />
										<stop offset="100%" stopColor={t.warn} stopOpacity={0.03} />
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
								/>
								<Tooltip content={<TipNum />} />
								<Area
									type="monotone"
									dataKey="Elegíveis"
									stroke={t.warn}
									strokeWidth={2.5}
									fill="url(#grPpl)"
									dot={{ r: 3, fill: t.warn }}
								/>
							</AreaChart>
						</ResponsiveContainer>
					</div>
				</Card>
				<Card className="p-5">
					<Title>Tempo de Serviço</Title>
					<div style={{ height: 230 }}>
						<ResponsiveContainer width="100%" height="100%">
							<BarChart
								data={PA.tempo.map(([faixa, n]) => ({ faixa, Servidores: n }))}
								margin={{ top: 6, right: 8, left: -18, bottom: 0 }}
							>
								<CartesianGrid
									strokeDasharray="3 3"
									stroke={t.border}
									vertical={false}
								/>
								<XAxis
									dataKey="faixa"
									tick={{ fontSize: 10, fill: t.mutedFg }}
									axisLine={{ stroke: t.border }}
									tickLine={false}
								/>
								<YAxis
									tick={{ fontSize: 11, fill: t.mutedFg }}
									axisLine={false}
									tickLine={false}
									width={42}
								/>
								<Tooltip content={<TipNum />} cursor={{ fill: t.muted }} />
								<Bar
									dataKey="Servidores"
									fill={cats[3]}
									radius={[3, 3, 0, 0]}
								/>
							</BarChart>
						</ResponsiveContainer>
					</div>
				</Card>
			</div>

			<Card className="p-5 mb-4">
				<Title>Quadro de Pessoal por Órgão</Title>
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
									Headcount
								</th>
								<th
									className="text-right"
									style={{ padding: "8px 10px", fontWeight: 600 }}
								>
									Efetivos
								</th>
								<th
									className="text-right"
									style={{ padding: "8px 10px", fontWeight: 600 }}
								>
									Comiss.
								</th>
								<th
									className="text-right"
									style={{ padding: "8px 10px", fontWeight: 600 }}
								>
									Temp.
								</th>
								<th
									className="text-right"
									style={{ padding: "8px 10px", fontWeight: 600 }}
								>
									Vagas
								</th>
								<th
									className="text-left"
									style={{ padding: "8px 10px", fontWeight: 600, width: 130 }}
								>
									Cobertura
								</th>
								<th
									className="text-right"
									style={{ padding: "8px 10px", fontWeight: 600 }}
								>
									Idade Média
								</th>
							</tr>
						</thead>
						<tbody>
							{PA.quadro.map(([n, h, ef, co, te, vg, id], i) => {
								const cob = (h / vg) * 100;
								const c = cob >= 90 ? t.ok : cob >= 75 ? t.primary : t.warn;
								return (
									<tr key={i} style={{ borderTop: `1px solid ${t.border}` }}>
										<td
											style={{
												padding: "9px 10px",
												color: t.foreground,
												fontWeight: 500,
											}}
										>
											{n}
										</td>
										<td
											className="text-right tabular-nums"
											style={{
												padding: "9px 10px",
												color: t.foreground,
												fontWeight: 600,
											}}
										>
											{fmtInt(h)}
										</td>
										<td
											className="text-right tabular-nums"
											style={{ padding: "9px 10px", color: t.mutedFg }}
										>
											{fmtInt(ef)}
										</td>
										<td
											className="text-right tabular-nums"
											style={{ padding: "9px 10px", color: t.mutedFg }}
										>
											{fmtInt(co)}
										</td>
										<td
											className="text-right tabular-nums"
											style={{ padding: "9px 10px", color: t.mutedFg }}
										>
											{fmtInt(te)}
										</td>
										<td
											className="text-right tabular-nums"
											style={{ padding: "9px 10px", color: t.mutedFg }}
										>
											{fmtInt(vg)}
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
															width: `${cob}%`,
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
													{pct(cob)}
												</span>
											</div>
										</td>
										<td
											className="text-right tabular-nums"
											style={{ padding: "9px 10px", color: t.mutedFg }}
										>
											{fmt(id)}
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</Card>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
				<Card className="p-5">
					<Title
						right={
							<span className="text-xs" style={{ color: t.mutedFg }}>
								dias no período
							</span>
						}
					>
						Absenteísmo por Tipo
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
										Tipo de afastamento
									</th>
									<th
										className="text-right"
										style={{ padding: "7px 8px", fontWeight: 600 }}
									>
										Dias
									</th>
									<th
										className="text-right"
										style={{ padding: "7px 8px", fontWeight: 600 }}
									>
										% do total
									</th>
								</tr>
							</thead>
							<tbody>
								{PA.absent.map(([tp, d], i) => (
									<tr key={i} style={{ borderTop: `1px solid ${t.border}` }}>
										<td style={{ padding: "8px", color: t.foreground }}>
											{tp}
										</td>
										<td
											className="text-right tabular-nums"
											style={{
												padding: "8px",
												color: t.foreground,
												fontWeight: 600,
											}}
										>
											{fmtInt(d)}
										</td>
										<td
											className="text-right tabular-nums"
											style={{ padding: "8px", color: t.mutedFg }}
										>
											{pct((d / totDias) * 100)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</Card>
				<Card className="p-5">
					<Title
						right={
							<span className="text-xs" style={{ color: t.warn }}>
								mapa de risco
							</span>
						}
					>
						Sucessão / Aposentadoria por Carreira
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
										Carreira
									</th>
									<th
										className="text-right"
										style={{ padding: "7px 8px", fontWeight: 600 }}
									>
										Elegíveis hoje
									</th>
									<th
										className="text-right"
										style={{ padding: "7px 8px", fontWeight: 600 }}
									>
										Em 5 anos
									</th>
									<th
										className="text-left"
										style={{ padding: "7px 8px", fontWeight: 600, width: 110 }}
									>
										% do cargo
									</th>
								</tr>
							</thead>
							<tbody>
								{PA.sucessao.map(([c, hoje, cinco, p], i) => {
									const col = p >= 30 ? t.danger : p >= 20 ? t.warn : t.primary;
									return (
										<tr key={i} style={{ borderTop: `1px solid ${t.border}` }}>
											<td style={{ padding: "8px", color: t.foreground }}>
												{c}
											</td>
											<td
												className="text-right tabular-nums"
												style={{ padding: "8px", color: t.mutedFg }}
											>
												{fmtInt(hoje)}
											</td>
											<td
												className="text-right tabular-nums"
												style={{
													padding: "8px",
													color: t.foreground,
													fontWeight: 600,
												}}
											>
												{fmtInt(cinco)}
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
																width: `${Math.min(p * 2, 100)}%`,
																background: col,
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
														{pct(p)}
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
			</div>
		</>
	);
}
