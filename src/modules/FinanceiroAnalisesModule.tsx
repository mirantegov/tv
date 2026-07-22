import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { Card, Donut, HBar, Kpi, Tip, Title } from "../components";
import { FA } from "../data";
import { brl, fmt, fmtInt, pct } from "../format";
import { useTheme } from "../theme";

export default function FinanceiroAnalisesModule() {
	const { t, cats } = useTheme();
	const th = { padding: "8px 10px", fontWeight: 600 };
	const td = { padding: "9px 10px" };
	const Bar = ({ pctVal, color }) => (
		<div className="flex items-center gap-2">
			<div
				className="rounded-full overflow-hidden"
				style={{ flex: 1, height: 6, background: t.secondary }}
			>
				<div
					style={{
						height: "100%",
						width: `${Math.min(pctVal, 100)}%`,
						background: color,
						borderRadius: 999,
					}}
				/>
			</div>
			<span
				className="tabular-nums text-xs"
				style={{
					color: t.foreground,
					fontWeight: 600,
					width: 42,
					textAlign: "right",
				}}
			>
				{pct(pctVal)}
			</span>
		</div>
	);
	return (
		<>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
				<Kpi
					label="Disponibilidade Total"
					value={brl(FA.disp)}
					accent={t.primary}
					sub={`movimento ${brl(FA.movimento)} · aplicado ${brl(FA.aplicado)}`}
				/>
				<Kpi
					label="Rendimentos (acum.)"
					value={brl(FA.rendimentosYtd)}
					accent={t.ok}
					sub={`rentabilidade média ${pct(FA.rentabCdi)} do CDI`}
				/>
				<Kpi
					label="Conciliação Bancária"
					value={pct(FA.concPct)}
					progress={FA.concPct}
					sub={`${fmtInt(FA.conciliadas)} de ${fmtInt(FA.contas)} contas conciliadas`}
				/>
				<Kpi
					label="Divergências Abertas"
					value={fmtInt(FA.divergencias)}
					accent={t.warn}
					sub={`${brl(FA.divergValor)} em diferenças`}
				/>
				<Kpi
					label="Movimentação Completa"
					value={pct(FA.movCompletaPct)}
					progress={FA.movCompletaPct}
					sub={`${fmtInt(FA.movCompleta)}/${fmtInt(FA.contas)} contas c/ receita·aplicação·resgate`}
				/>
				<Kpi
					label="% Aplicado"
					value={pct((FA.aplicado / FA.disp) * 100)}
					sub="recursos rendendo vs parados"
				/>
				<Kpi
					label="Fontes com Saldo Negativo"
					value={fmtInt(FA.fontesNegativas)}
					accent={t.danger}
					sub="exige recomposição imediata"
				/>
				<Kpi
					label="Contas Monitoradas"
					value={fmtInt(FA.contas)}
					sub="4 instituições financeiras"
				/>
			</div>

			{/* FONTE DE RECURSOS */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
				<Card className="p-5">
					<Title>Saldo por Fonte de Recursos</Title>
					<HBar
						highlightFirst
						data={FA.fontes
							.filter(([, s]) => s > 0)
							.map(([n, s]) => ({ nome: n.split(" (")[0], valor: s }))}
						height={230}
						ylabel={118}
					/>
				</Card>
				<Card className="p-5 lg:col-span-2">
					<Title
						right={
							<span className="text-xs" style={{ color: t.mutedFg }}>
								suficiência financeira · Anexo 5 RGF
							</span>
						}
					>
						Disponibilidade Líquida por Fonte
					</Title>
					<div className="overflow-x-auto">
						<table
							className="w-full"
							style={{ borderCollapse: "collapse", fontSize: 12.5 }}
						>
							<thead>
								<tr style={{ color: t.mutedFg }}>
									<th className="text-left" style={th}>
										Fonte / Destinação
									</th>
									<th className="text-right" style={th}>
										Saldo
									</th>
									<th className="text-right" style={th}>
										Obrigações
									</th>
									<th className="text-right" style={th}>
										Líquida
									</th>
									<th className="text-left" style={th}>
										Situação
									</th>
								</tr>
							</thead>
							<tbody>
								{FA.fontes.map(([n, s, ob, tone], i) => {
									const liq = s - ob;
									const col =
										tone === "danger" || liq < 0
											? t.danger
											: liq < s * 0.2
												? t.warn
												: t.ok;
									const lbl =
										s < 0
											? "Saldo negativo"
											: liq < 0
												? "Insuficiente"
												: liq < s * 0.2
													? "Atenção"
													: "Suficiente";
									return (
										<tr key={i} style={{ borderTop: `1px solid ${t.border}` }}>
											<td
												style={{ ...td, color: t.foreground, fontWeight: 500 }}
											>
												{n}
											</td>
											<td
												className="text-right tabular-nums"
												style={{
													...td,
													color: s < 0 ? t.danger : t.foreground,
												}}
											>
												{fmt(s)}
											</td>
											<td
												className="text-right tabular-nums"
												style={{ ...td, color: t.mutedFg }}
											>
												{fmt(ob)}
											</td>
											<td
												className="text-right tabular-nums"
												style={{ ...td, color: col, fontWeight: 700 }}
											>
												{fmt(liq)}
											</td>
											<td style={td}>
												<span
													className="text-xs font-semibold rounded"
													style={{
														padding: "2px 9px",
														background: t.muted,
														color: col,
													}}
												>
													{lbl}
												</span>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
					<div className="text-xs mt-2" style={{ color: t.mutedFg }}>
						Saldo negativo em fonte vinculada indica uso indevido de recurso de
						outra destinação — recompor antes do fechamento (TCE).
					</div>
				</Card>
			</div>

			{/* INVESTIMENTOS */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
				<Card className="p-5">
					<Title>Aplicações por Tipo</Title>
					<Donut
						data={FA.invTipo.map(([n, v]) => ({ nome: n, valor: v }))}
						height={200}
					/>
				</Card>
				<Card className="p-5">
					<Title
						right={
							<span className="text-xs" style={{ color: t.mutedFg }}>
								R$ milhões
							</span>
						}
					>
						Rendimentos Mensais
					</Title>
					<div style={{ height: 200 }}>
						<ResponsiveContainer width="100%" height="100%">
							<AreaChart
								data={FA.rendMensal.map(([mes, v]) => ({ mes, Rendimento: v }))}
								margin={{ top: 6, right: 10, left: -18, bottom: 0 }}
							>
								<defs>
									<linearGradient id="grFA" x1="0" y1="0" x2="0" y2="1">
										<stop offset="0%" stopColor={t.ok} stopOpacity={0.4} />
										<stop offset="100%" stopColor={t.ok} stopOpacity={0.03} />
									</linearGradient>
								</defs>
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
									width={44}
								/>
								<Tooltip content={<Tip />} />
								<Area
									type="monotone"
									dataKey="Rendimento"
									stroke={t.ok}
									strokeWidth={2.5}
									fill="url(#grFA)"
									dot={{ r: 3, fill: t.ok }}
								/>
							</AreaChart>
						</ResponsiveContainer>
					</div>
				</Card>
				<Card className="p-5">
					<Title
						right={
							<span className="text-xs" style={{ color: t.mutedFg }}>
								% do CDI
							</span>
						}
					>
						Rentabilidade por Instituição
					</Title>
					<div className="flex flex-col gap-3 mt-2">
						{FA.invInst.map(([inst, apl, rent, tone], i) => (
							<div key={i}>
								<div className="flex items-baseline justify-between mb-1">
									<span
										className="text-xs font-medium"
										style={{ color: t.foreground }}
									>
										{inst}
									</span>
									<span
										className="text-xs tabular-nums"
										style={{ color: t.mutedFg }}
									>
										{brl(apl)}
									</span>
								</div>
								<Bar
									pctVal={rent}
									color={tone === "warn" ? t.warn : t.primary}
								/>
							</div>
						))}
					</div>
					<div className="text-xs mt-3" style={{ color: t.mutedFg }}>
						Rentabilidade abaixo de ~97% do CDI merece renegociação ou
						realocação (respeitando a Res. CMN de aplicação dos entes).
					</div>
				</Card>
			</div>

			{/* SALDOS BANCÁRIOS + CONCILIAÇÃO */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
				<Card className="p-5">
					<Title
						right={
							<span className="text-xs" style={{ color: t.mutedFg }}>
								R$ milhões
							</span>
						}
					>
						Saldos por Instituição Bancária
					</Title>
					<div className="overflow-x-auto">
						<table
							className="w-full"
							style={{ borderCollapse: "collapse", fontSize: 12.5 }}
						>
							<thead>
								<tr style={{ color: t.mutedFg }}>
									<th className="text-left" style={th}>
										Banco
									</th>
									<th className="text-right" style={th}>
										Contas
									</th>
									<th className="text-right" style={th}>
										Movimento
									</th>
									<th className="text-right" style={th}>
										Aplicado
									</th>
									<th className="text-right" style={th}>
										Total
									</th>
									<th className="text-left" style={{ ...th, width: 120 }}>
										Conciliação
									</th>
								</tr>
							</thead>
							<tbody>
								{FA.bancos.map(([b, n, mv, ap, cc], i) => (
									<tr key={i} style={{ borderTop: `1px solid ${t.border}` }}>
										<td style={{ ...td, color: t.foreground, fontWeight: 500 }}>
											{b}
										</td>
										<td
											className="text-right tabular-nums"
											style={{ ...td, color: t.mutedFg }}
										>
											{n}
										</td>
										<td
											className="text-right tabular-nums"
											style={{ ...td, color: t.mutedFg }}
										>
											{fmt(mv)}
										</td>
										<td
											className="text-right tabular-nums"
											style={{ ...td, color: t.foreground }}
										>
											{fmt(ap)}
										</td>
										<td
											className="text-right tabular-nums"
											style={{ ...td, color: t.foreground, fontWeight: 700 }}
										>
											{fmt(mv + ap)}
										</td>
										<td style={td}>
											<Bar
												pctVal={(cc / n) * 100}
												color={cc === n ? t.ok : t.primary}
											/>
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
								{brl(FA.divergValor)} em aberto
							</span>
						}
					>
						Pendências de Conciliação
					</Title>
					<div className="overflow-x-auto">
						<table
							className="w-full"
							style={{ borderCollapse: "collapse", fontSize: 12.5 }}
						>
							<thead>
								<tr style={{ color: t.mutedFg }}>
									<th className="text-left" style={th}>
										Conta
									</th>
									<th className="text-left" style={th}>
										Motivo
									</th>
									<th className="text-right" style={th}>
										Diferença
									</th>
									<th className="text-right" style={th}>
										Dias
									</th>
								</tr>
							</thead>
							<tbody>
								{FA.pendencias.map(([ct, bc, dv, mot, di], i) => (
									<tr key={i} style={{ borderTop: `1px solid ${t.border}` }}>
										<td style={{ ...td, color: t.foreground }}>
											{ct} <span style={{ color: t.mutedFg }}>· {bc}</span>
										</td>
										<td style={{ ...td, color: t.mutedFg }}>{mot}</td>
										<td
											className="text-right tabular-nums"
											style={{ ...td, color: t.foreground, fontWeight: 600 }}
										>
											{fmt(dv)}
										</td>
										<td
											className="text-right tabular-nums"
											style={{
												...td,
												color: di > 10 ? t.warn : t.mutedFg,
												fontWeight: 600,
											}}
										>
											{di}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</Card>
			</div>

			{/* MOVIMENTAÇÃO COMPLETA */}
			<Card className="p-5">
				<Title
					right={
						<span className="text-xs" style={{ color: t.mutedFg }}>
							contas com lançamentos de receita · aplicação · resgate efetuados
						</span>
					}
				>
					Completude dos Lançamentos por Grupo de Contas
				</Title>
				<div className="overflow-x-auto">
					<table
						className="w-full"
						style={{
							borderCollapse: "collapse",
							fontSize: 12.5,
							minWidth: 640,
						}}
					>
						<thead>
							<tr style={{ color: t.mutedFg }}>
								<th className="text-left" style={th}>
									Grupo de contas
								</th>
								<th className="text-right" style={th}>
									Contas
								</th>
								<th className="text-left" style={{ ...th, width: 150 }}>
									Receita
								</th>
								<th className="text-left" style={{ ...th, width: 150 }}>
									Aplicação
								</th>
								<th className="text-left" style={{ ...th, width: 150 }}>
									Resgate
								</th>
								<th className="text-left" style={{ ...th, width: 150 }}>
									Completas
								</th>
							</tr>
						</thead>
						<tbody>
							{FA.movMatriz.map(([g, tot, rec, apl, res], i) => {
								const comp = Math.min(rec, apl, res);
								return (
									<tr key={i} style={{ borderTop: `1px solid ${t.border}` }}>
										<td style={{ ...td, color: t.foreground, fontWeight: 500 }}>
											{g}
										</td>
										<td
											className="text-right tabular-nums"
											style={{ ...td, color: t.mutedFg }}
										>
											{tot}
										</td>
										<td style={td}>
											<Bar
												pctVal={(rec / tot) * 100}
												color={rec === tot ? t.ok : t.primary}
											/>
										</td>
										<td style={td}>
											<Bar
												pctVal={(apl / tot) * 100}
												color={apl === tot ? t.ok : t.primary}
											/>
										</td>
										<td style={td}>
											<Bar
												pctVal={(res / tot) * 100}
												color={res === tot ? t.ok : t.warn}
											/>
										</td>
										<td style={td}>
											<Bar
												pctVal={(comp / tot) * 100}
												color={comp === tot ? t.ok : t.warn}
											/>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
				<div className="text-xs mt-2" style={{ color: t.mutedFg }}>
					Conta sem apropriação de rendimento, aplicação ou resgate lançado gera
					diferença entre extrato e contabilidade — é a principal causa de
					pendência de conciliação no fechamento mensal (SIM-AM).
				</div>
			</Card>
		</>
	);
}
