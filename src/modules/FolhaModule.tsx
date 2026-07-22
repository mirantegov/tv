import {
	CartesianGrid,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import {
	Card,
	Delta,
	Donut,
	HBar,
	Kpi,
	LegendDot,
	Tip,
	Title,
} from "../components";
import { FP } from "../data";
import { brl, fmt, fmtInt, pct, vari } from "../format";
import { useTheme } from "../theme";

export default function FolhaModule() {
	const { t, cats, prev, cur } = useTheme();
	const L = FP.lrf;
	const lrfStatus =
		L.pct >= L.prudencial ? t.danger : L.pct >= L.alerta ? t.warn : t.ok;
	const lrfLabel =
		L.pct >= L.prudencial
			? "ACIMA DO PRUDENCIAL"
			: L.pct >= L.alerta
				? "ACIMA DO ALERTA"
				: "DENTRO DO LIMITE";
	const dem = [
		["Despesa Bruta com Pessoal (12m)", L.bruta12, t.foreground],
		["(−) Deduções (inativos RPPS, IRRF, indenizações)", -L.deducoes, t.warn],
		["= Despesa Líquida com Pessoal", L.liquida12, t.foreground, true],
		["Receita Corrente Líquida (12m)", L.rcl12, t.mutedFg],
	];
	return (
		<>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
				<Kpi
					label="Custo Total da Folha"
					value={brl(FP.custoTotal)}
					accent={t.primary}
					sub={
						<>
							<Delta {...vari(FP.custoMesAnt, FP.custoTotal)} /> vs mês anterior
						</>
					}
				/>
				<Kpi
					label="Folha Bruta"
					value={brl(FP.bruta)}
					sub={`Líquida ${brl(FP.liquida)}`}
				/>
				<Kpi
					label="Encargos Patronais"
					value={brl(FP.encargos)}
					sub="RPPS / INSS / FGTS"
				/>
				<Kpi
					label="Horas Extras"
					value={brl(FP.he)}
					accent={t.warn}
					sub={`${pct(FP.hePct)} da folha bruta`}
				/>
				<Kpi
					label="Adicionais"
					value={brl(FP.adicionais)}
					sub="Insalub., noturno, FG/CC…"
				/>
				<Kpi
					label="Custo Médio / Servidor"
					value={FP.custoMedio}
					sub={`${fmtInt(FP.headcount)} servidores ativos`}
				/>
				<Kpi
					label="Despesa Pessoal / RCL"
					value={pct(L.pct)}
					accent={lrfStatus}
					sub={`Limite LRF 54% · ${lrfLabel.toLowerCase()}`}
				/>
				<Kpi
					label="Inativos e Pensionistas"
					value={brl(FP.inativosCusto)}
					sub={`${fmtInt(FP.inativos)} beneficiários`}
				/>
			</div>

			{/* COMPONENTE LRF — Despesa de Pessoal */}
			<Card className="p-5 mb-4" style={{ borderColor: lrfStatus }}>
				<Title
					right={
						<span
							className="text-xs font-bold"
							style={{
								color: lrfStatus,
								background: t.muted,
								padding: "2px 9px",
								borderRadius: 999,
							}}
						>
							{lrfLabel}
						</span>
					}
				>
					Despesa de Pessoal — Limite da LRF (RGF · Anexo 1)
				</Title>
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<div>
						<div className="flex items-baseline gap-2 mb-3">
							<span
								className="text-4xl font-bold tabular-nums"
								style={{ color: lrfStatus }}
							>
								{pct(L.pct)}
							</span>
							<span className="text-xs" style={{ color: t.mutedFg }}>
								da Receita Corrente Líquida
							</span>
						</div>
						<div
							className="relative rounded-full"
							style={{ height: 12, background: t.secondary }}
						>
							<div
								style={{
									position: "absolute",
									inset: 0,
									width: `${(L.pct / 60) * 100}%`,
									height: "100%",
									background: lrfStatus,
									borderRadius: 999,
								}}
							/>
							{[
								[L.alerta, t.warn, "Alerta 48,6%"],
								[L.prudencial, cats[3], "Prudencial 51,3%"],
								[L.limite, t.danger, "Limite 54%"],
							].map(([v, c], i) => (
								<div
									key={i}
									style={{
										position: "absolute",
										left: `${(v / 60) * 100}%`,
										top: -4,
										height: 20,
										width: 2,
										background: c,
									}}
								/>
							))}
						</div>
						<div
							className="flex justify-between text-xs mt-2"
							style={{ color: t.mutedFg }}
						>
							<span>0%</span>
							<span style={{ color: t.warn }}>48,6%</span>
							<span style={{ color: cats[3] }}>51,3%</span>
							<span style={{ color: t.danger }}>54%</span>
							<span>60%</span>
						</div>
						<div
							className="mt-4 rounded-lg"
							style={{ background: t.muted, padding: "10px 13px" }}
						>
							<div className="text-xs" style={{ color: t.mutedFg }}>
								Margem até o limite (54%)
							</div>
							<div
								className="text-lg font-bold tabular-nums"
								style={{ color: t.ok }}
							>
								{brl(L.margemRs)}{" "}
								<span
									className="text-xs font-medium"
									style={{ color: t.mutedFg }}
								>
									({fmt(L.margemPp)} p.p.)
								</span>
							</div>
						</div>
					</div>
					<div>
						<table
							className="w-full"
							style={{ borderCollapse: "collapse", fontSize: 13 }}
						>
							<tbody>
								{dem.map((r, i) => (
									<tr
										key={i}
										style={{ borderTop: i ? `1px solid ${t.border}` : "none" }}
									>
										<td
											style={{
												padding: "9px 4px",
												color: t.foreground,
												fontWeight: r[3] ? 700 : 400,
											}}
										>
											{r[0]}
										</td>
										<td
											className="text-right tabular-nums"
											style={{
												padding: "9px 4px",
												color: r[2],
												fontWeight: r[3] ? 700 : 400,
											}}
										>
											{r[1] < 0 ? `− ${fmt(Math.abs(r[1]))}` : fmt(r[1])}
										</td>
									</tr>
								))}
								<tr style={{ borderTop: `2px solid ${t.border}` }}>
									<td style={{ padding: "9px 4px", fontWeight: 700 }}>
										% Despesa de Pessoal / RCL
									</td>
									<td
										className="text-right tabular-nums"
										style={{
											padding: "9px 4px",
											fontWeight: 700,
											color: lrfStatus,
										}}
									>
										{pct(L.pct)}
									</td>
								</tr>
							</tbody>
						</table>
						<div className="text-xs mt-2" style={{ color: t.mutedFg }}>
							Base: últimos 12 meses (LRF art. 19/20). Deduções conforme art.
							19, §1º.
						</div>
					</div>
				</div>
			</Card>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
				<Card className="p-5 lg:col-span-2">
					<Title
						right={
							<div className="flex gap-3 text-xs">
								<LegendDot color={cats[0]}>Bruta</LegendDot>
								<LegendDot color={cats[3]}>Líquida</LegendDot>
								<LegendDot color={cats[1]}>Encargos</LegendDot>
							</div>
						}
					>
						Evolução do custo da folha
					</Title>
					<div style={{ height: 240 }}>
						<ResponsiveContainer width="100%" height="100%">
							<LineChart
								data={FP.evol.map(([mes, b, l, e]) => ({
									mes,
									Bruta: b,
									Líquida: l,
									Encargos: e,
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
									dataKey="Bruta"
									stroke={cats[0]}
									strokeWidth={2.5}
									dot={false}
								/>
								<Line
									type="monotone"
									dataKey="Líquida"
									stroke={cats[3]}
									strokeWidth={2.5}
									dot={false}
								/>
								<Line
									type="monotone"
									dataKey="Encargos"
									stroke={cats[1]}
									strokeWidth={2.5}
									dot={false}
								/>
							</LineChart>
						</ResponsiveContainer>
					</div>
				</Card>
				<Card className="p-5">
					<Title>Composição da Folha</Title>
					<Donut
						data={FP.composicao.map(([n, v]) => ({ nome: n, valor: v }))}
						height={210}
					/>
				</Card>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
				<Card className="p-5">
					<Title>Folha por Órgão</Title>
					<HBar
						highlightFirst
						data={FP.orgaos
							.map(([n, , , , c]) => ({ nome: n, valor: c }))
							.sort((a, b) => b.valor - a.valor)}
						height={220}
						ylabel={120}
					/>
				</Card>
				<Card className="p-5">
					<Title>Por Vínculo</Title>
					<HBar
						data={FP.vinculo.map(([n, v]) => ({ nome: n, valor: v }))}
						height={150}
						ylabel={104}
					/>
					<div className="mt-2">
						<Title>Adicionais por tipo</Title>
						<HBar
							data={FP.adic.map(([n, v]) => ({ nome: n, valor: v }))}
							height={150}
							ylabel={104}
						/>
					</div>
				</Card>
				<Card className="p-5">
					<Title
						right={
							<span className="text-xs" style={{ color: t.warn }}>
								tendência ↗
							</span>
						}
					>
						Horas Extras por Órgão
					</Title>
					<HBar
						highlightFirst
						data={FP.heOrgao.map(([n, v]) => ({ nome: n, valor: v }))}
						height={150}
						ylabel={96}
					/>
					<div className="text-xs mt-2" style={{ color: t.mutedFg }}>
						HE crescente (0,95→1,20 mi no semestre), concentrada na Saúde
						(plantões). % sobre a base é o sinal de dimensionamento do quadro.
					</div>
				</Card>
			</div>

			<Card className="p-5 mb-4">
				<Title
					right={
						<span className="text-xs" style={{ color: t.mutedFg }}>
							competência · R$ milhões
						</span>
					}
				>
					Folha por Órgão / Secretaria
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
									Órgão
								</th>
								<th
									className="text-right"
									style={{ padding: "8px 10px", fontWeight: 600 }}
								>
									Servidores
								</th>
								<th
									className="text-right"
									style={{ padding: "8px 10px", fontWeight: 600 }}
								>
									Bruta
								</th>
								<th
									className="text-right"
									style={{ padding: "8px 10px", fontWeight: 600 }}
								>
									Encargos
								</th>
								<th
									className="text-right"
									style={{ padding: "8px 10px", fontWeight: 600 }}
								>
									Custo Total
								</th>
								<th
									className="text-right"
									style={{ padding: "8px 10px", fontWeight: 600 }}
								>
									H. Extras
								</th>
								<th
									className="text-right"
									style={{ padding: "8px 10px", fontWeight: 600 }}
								>
									Adicionais
								</th>
								<th
									className="text-right"
									style={{ padding: "8px 10px", fontWeight: 600 }}
								>
									Custo Médio
								</th>
							</tr>
						</thead>
						<tbody>
							{FP.orgaos.map(([n, serv, b, e, c, he, ad], i) => (
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
										style={{ padding: "9px 10px", color: t.mutedFg }}
									>
										{fmtInt(serv)}
									</td>
									<td
										className="text-right tabular-nums"
										style={{ padding: "9px 10px", color: t.foreground }}
									>
										{fmt(b)}
									</td>
									<td
										className="text-right tabular-nums"
										style={{ padding: "9px 10px", color: t.mutedFg }}
									>
										{fmt(e)}
									</td>
									<td
										className="text-right tabular-nums"
										style={{
											padding: "9px 10px",
											color: t.foreground,
											fontWeight: 600,
										}}
									>
										{fmt(c)}
									</td>
									<td
										className="text-right tabular-nums"
										style={{ padding: "9px 10px", color: t.warn }}
									>
										{fmt(he)}
									</td>
									<td
										className="text-right tabular-nums"
										style={{ padding: "9px 10px", color: t.mutedFg }}
									>
										{fmt(ad)}
									</td>
									<td
										className="text-right tabular-nums"
										style={{ padding: "9px 10px", color: t.foreground }}
									>
										R$ {fmtInt((c * 1e6) / serv)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</Card>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
				<Card className="p-5">
					<Title>Top Cargos por Custo</Title>
					<HBar
						highlightFirst
						data={FP.cargos.map(([n, v]) => ({ nome: n, valor: v }))}
						height={220}
						ylabel={120}
					/>
				</Card>
				<Card className="p-5">
					<Title>Adicionais e Gratificações</Title>
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
										Tipo
									</th>
									<th
										className="text-right"
										style={{ padding: "7px 8px", fontWeight: 600 }}
									>
										Beneficiários
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
										% da folha
									</th>
								</tr>
							</thead>
							<tbody>
								{FP.adicDet.map(([tp, ben, v], i) => (
									<tr key={i} style={{ borderTop: `1px solid ${t.border}` }}>
										<td style={{ padding: "8px", color: t.foreground }}>
											{tp}
										</td>
										<td
											className="text-right tabular-nums"
											style={{ padding: "8px", color: t.mutedFg }}
										>
											{fmtInt(ben)}
										</td>
										<td
											className="text-right tabular-nums"
											style={{
												padding: "8px",
												color: t.foreground,
												fontWeight: 600,
											}}
										>
											{fmt(v)}
										</td>
										<td
											className="text-right tabular-nums"
											style={{ padding: "8px", color: t.mutedFg }}
										>
											{pct((v / FP.bruta) * 100)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</Card>
			</div>
		</>
	);
}
