import type React from "react";
import { useState } from "react";
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
	Donut,
	HBar,
	Kpi,
	LegendDot,
	Tip,
	Title,
	TreeReceita,
} from "../components";
import { R } from "../data";
import { brl, fmt, pct } from "../format";
import { useTheme } from "../theme";

export default function ReceitaModule() {
	const { t, cats } = useTheme();
	const [sub, setSub] = useState("geral");
	const subs = [
		["geral", "Visão Geral"],
		["saude", "Fontes — Saúde"],
		["educacao", "Fontes — Educação"],
	];
	const Apend = ({
		dados,
		faixa,
		nota,
		extra,
	}: {
		dados: any;
		faixa?: React.ReactNode;
		nota?: React.ReactNode;
		extra?: React.ReactNode;
	}) => {
		const tot = dados.reduce((s, d) => s + d[2], 0);
		return (
			<Card className="p-5">
				<Title
					right={
						<span className="text-xs" style={{ color: t.mutedFg }}>
							{faixa}
						</span>
					}
				>
					Tabela de Fontes
				</Title>
				<div
					className="rounded-lg mb-4 text-xs leading-relaxed"
					style={{
						background: t.muted,
						color: t.foreground,
						padding: "11px 13px",
					}}
				>
					{nota}
				</div>
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
					<HBar
						data={dados.map((d) => ({
							nome: `${d[0]} · ${d[1].split(" — ")[0]}`,
							valor: d[2],
						}))}
						height={230}
						ylabel={120}
					/>
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
										Fonte
									</th>
									<th
										className="text-left"
										style={{ padding: "7px 8px", fontWeight: 600 }}
									>
										Descrição
									</th>
									<th
										className="text-right"
										style={{ padding: "7px 8px", fontWeight: 600 }}
									>
										Arrec.
									</th>
								</tr>
							</thead>
							<tbody>
								{dados.map((d, i) => (
									<tr key={i} style={{ borderTop: `1px solid ${t.border}` }}>
										<td style={{ padding: "8px" }}>
											<span
												className="tabular-nums rounded"
												style={{
													background: d[3] ? t.accent : t.muted,
													color: t.foreground,
													padding: "1px 7px",
													fontWeight: 700,
												}}
											>
												{d[0]}
											</span>
										</td>
										<td style={{ padding: "8px", color: t.foreground }}>
											{d[1]}
										</td>
										<td
											className="text-right tabular-nums"
											style={{ padding: "8px", fontWeight: 600 }}
										>
											{fmt(d[2])}
										</td>
									</tr>
								))}
								<tr style={{ borderTop: `2px solid ${t.border}` }}>
									<td colSpan={2} style={{ padding: "8px", fontWeight: 700 }}>
										Total por fonte
									</td>
									<td
										className="text-right tabular-nums"
										style={{
											padding: "8px",
											fontWeight: 700,
											color: t.primary,
										}}
									>
										{fmt(tot)}
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
				{extra}
			</Card>
		);
	};
	return (
		<>
			<div className="mb-5">
				<div
					className="flex rounded-lg overflow-hidden"
					style={{ border: `1px solid ${t.border}`, width: "fit-content" }}
				>
					{subs.map(([k, l]) => (
						<button
							key={k}
							type="button"
							data-autoscroll-tab
							onClick={() => setSub(k)}
							className="text-xs sm:text-sm font-medium"
							style={{
								padding: "8px 14px",
								background: sub === k ? t.primary : t.card,
								color: sub === k ? t.primaryFg : t.mutedFg,
								border: "none",
								cursor: "pointer",
							}}
						>
							{l}
						</button>
					))}
				</div>
			</div>

			{sub === "geral" && (
				<>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
						<Kpi
							label="Previsão Atualizada"
							value={brl(R.prev)}
							sub="LOA + reestimativas"
						/>
						<Kpi
							label="Arrecadada (Bruta)"
							value={brl(R.bruta)}
							accent={t.primary}
							progress={(R.bruta / R.prev) * 100}
							sub={`${pct((R.bruta / R.prev) * 100)} de realização`}
						/>
						<Kpi
							label="Receita Própria"
							value={brl(R.propria)}
							sub={`Autonomia ${pct((R.propria / R.bruta) * 100)}`}
						/>
						<Kpi
							label="Transferências"
							value={brl(R.transf)}
							sub={`${pct((R.transf / R.bruta) * 100)} do total`}
						/>
						<Kpi
							label="Outras Receitas"
							value={brl(R.outras)}
							sub={`${pct((R.outras / R.bruta) * 100)} da arrecadação`}
						/>
						<Kpi
							label="Receita Capital"
							value={brl(R.capital)}
							sub={`${pct((R.capital / R.bruta) * 100)} da arrecadação`}
						/>
						<Kpi
							label="Receita Líquida"
							value={brl(R.liq)}
							sub="Após deduções FUNDEB"
						/>
						<Kpi
							label="Saldo a Realizar"
							value={brl(R.prev - R.bruta)}
							sub={`${pct(((R.prev - R.bruta) / R.prev) * 100)} da previsão`}
						/>
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
						<Card className="p-3">
							<div className="text-xs" style={{ color: t.mutedFg }}>
								Receita Bruta
							</div>
							<div
								className="text-base font-bold tabular-nums"
								style={{ color: t.foreground }}
							>
								{brl(R.bruta)}
							</div>
						</Card>
						<Card className="p-3">
							<div className="text-xs" style={{ color: t.mutedFg }}>
								(−) Deduções FUNDEB
							</div>
							<div
								className="text-base font-bold tabular-nums"
								style={{ color: t.warn }}
							>
								− {brl(R.ded)}
							</div>
						</Card>
						<Card className="p-3" style={{ borderColor: t.primary }}>
							<div className="text-xs" style={{ color: t.mutedFg }}>
								= Receita Líquida
							</div>
							<div
								className="text-base font-bold tabular-nums"
								style={{ color: t.primary }}
							>
								{brl(R.liq)}
							</div>
						</Card>
					</div>
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
						<Card className="p-5 lg:col-span-2">
							<Title
								right={
									<div className="flex gap-4 text-xs">
										<LegendDot color={cats[6]}>Previsto</LegendDot>
										<LegendDot color={cats[0]}>Realizado</LegendDot>
									</div>
								}
							>
								Previsto × Realizado (acumulado)
							</Title>
							<div style={{ height: 230 }}>
								<ResponsiveContainer width="100%" height="100%">
									<LineChart
										data={R.mensal.map(([mes, pv, rl]) => ({
											mes,
											Previsto: pv,
											Realizado: rl,
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
											dataKey="Previsto"
											stroke={cats[6]}
											strokeWidth={2.5}
											strokeDasharray="5 4"
											dot={false}
										/>
										<Line
											type="monotone"
											dataKey="Realizado"
											stroke={cats[0]}
											strokeWidth={2.5}
											dot={false}
										/>
									</LineChart>
								</ResponsiveContainer>
							</div>
						</Card>
						<Card className="p-5">
							<Title
								right={
									<span
										className="text-xs font-bold"
										style={{ color: t.primary }}
									>
										Autonomia {pct((R.propria / R.bruta) * 100)}
									</span>
								}
							>
								Própria × Transferências
							</Title>
							<Donut
								data={[
									{ nome: "Transferências", valor: R.transf },
									{ nome: "Receita Própria", valor: R.propria },
								]}
								height={190}
							/>
						</Card>
					</div>
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
						<Card className="p-5">
							<Title>Composição por Origem</Title>
							<Donut
								data={R.origem.map(([n, v]) => ({ nome: n, valor: v }))}
								height={210}
							/>
						</Card>
						<Card className="p-5">
							<Title>Principais Transferências</Title>
							<HBar
								data={R.transfDet.map(([n, v]) => ({ nome: n, valor: v }))}
								height={250}
								ylabel={118}
							/>
						</Card>
						<Card className="p-5">
							<Title>Tributos Próprios</Title>
							<HBar
								highlightFirst
								data={R.tributos.map(([n, v]) => ({ nome: n, valor: v }))}
								height={210}
								ylabel={60}
							/>
							<div
								className="text-xs mt-2 tabular-nums"
								style={{ color: t.mutedFg }}
							>
								Dívida Ativa:{" "}
								<b style={{ color: t.foreground }}>{brl(R.divida)}</b>
							</div>
						</Card>
					</div>
					<Card className="p-5">
						<Title>Receita por Natureza — Categoria › Origem › Espécie</Title>
						<TreeReceita nodes={R.natureza} />
					</Card>
				</>
			)}

			{sub === "saude" && (
				<Apend
					dados={R.saude}
					faixa="Faixa STN: 600–659 · livres 500–501"
					nota={
						<>
							Os <b>15% mínimos em ASPS</b> (EC 29 / LC 141) saem da{" "}
							<b>fonte 500</b> associada ao marcador de ASPS. Transferências do
							SUS nas fontes 600 (custeio) e 601 (investimento).
						</>
					}
				/>
			)}
			{sub === "educacao" && (
				<Apend
					dados={R.educ}
					faixa="Faixa STN: 540–599 · livres 500–501"
					nota={
						<>
							Os <b>25% de MDE</b> (art. 212 CF) saem da <b>fonte 500</b> +{" "}
							<b>CO 1001</b>. A fonte 540 (FUNDEB) já é vinculada e dispensa o
							CO 1001.
						</>
					}
					extra={
						<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
							<Card className="p-3">
								<div className="text-xs" style={{ color: t.mutedFg }}>
									FUNDEB recebido
								</div>
								<div
									className="text-base font-bold tabular-nums"
									style={{ color: t.foreground }}
								>
									{brl(52)}
								</div>
							</Card>
							<Card className="p-3">
								<div className="text-xs" style={{ color: t.mutedFg }}>
									(−) FUNDEB deduzido
								</div>
								<div
									className="text-base font-bold tabular-nums"
									style={{ color: t.warn }}
								>
									− {brl(38)}
								</div>
							</Card>
							<Card className="p-3" style={{ borderColor: t.primary }}>
								<div className="text-xs" style={{ color: t.mutedFg }}>
									= Resultado líquido
								</div>
								<div
									className="text-base font-bold tabular-nums"
									style={{ color: t.ok }}
								>
									+ {brl(14)}
								</div>
							</Card>
						</div>
					}
				/>
			)}
		</>
	);
}
