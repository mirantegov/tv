import { useState } from "react";
import { Card, Donut, HBar, Kpi, Title } from "../components";
import { useData } from "../DataProvider";
import { brl, fmt, fmtInt, pct } from "../format";
import { useTheme } from "../theme";

export default function PlanejamentoModule() {
	const { PLAN } = useData();
	const { t } = useTheme();
	const [aba, setAba] = useState("integral");
	const abas = [
		["integral", "Orçamento Integral"],
		["prefeitura", "Prefeitura"],
		["camara", "Câmara"],
		["previdencia", "Previdência"],
		["saneamento", "Saneamento"],
	];
	const P = PLAN;

	const VincGauge = ({ label, valor, pctOrc, limite, tipo, scale, base }) => {
		const ok = tipo === "teto" ? pctOrc <= limite : pctOrc >= limite;
		const near =
			tipo === "teto" ? pctOrc >= limite * 0.95 : pctOrc <= limite * 1.1;
		const col = !ok ? t.danger : near ? t.warn : t.ok;
		const mk = tipo === "teto" ? t.danger : t.ok;
		return (
			<div className="rounded-lg" style={{ background: t.muted, padding: 14 }}>
				<div className="flex items-baseline justify-between mb-1">
					<span
						className="text-xs font-semibold"
						style={{ color: t.foreground }}
					>
						{label}
					</span>
					<span className="text-xs font-bold" style={{ color: col }}>
						{ok ? "✓" : "!"}{" "}
						{tipo === "teto" ? "dentro do teto" : "acima do mínimo"}
					</span>
				</div>
				<div className="flex items-baseline gap-2 mb-2">
					<span
						className="text-2xl font-bold tabular-nums"
						style={{ color: col }}
					>
						{pct(pctOrc)}
					</span>
					<span className="text-xs" style={{ color: t.mutedFg }}>
						{brl(valor)} orçado
					</span>
				</div>
				<div
					className="relative rounded-full"
					style={{ height: 9, background: t.secondary }}
				>
					<div
						style={{
							position: "absolute",
							inset: 0,
							width: `${Math.min((pctOrc / scale) * 100, 100)}%`,
							height: "100%",
							background: col,
							borderRadius: 999,
						}}
					/>
					<div
						style={{
							position: "absolute",
							left: `${(limite / scale) * 100}%`,
							top: -3,
							height: 15,
							width: 2,
							background: mk,
						}}
					/>
				</div>
				<div
					className="flex justify-between text-xs mt-1.5"
					style={{ color: t.mutedFg }}
				>
					<span>0%</span>
					<span style={{ color: mk, fontWeight: 600 }}>
						{tipo === "teto" ? "teto" : "mín."} {fmt(limite)}%
					</span>
					<span>{scale}%</span>
				</div>
				<div className="text-xs mt-2" style={{ color: t.mutedFg }}>
					{base}
				</div>
			</div>
		);
	};

	const MiniGauge = ({ label, pctVal, limite, valorTxt }) => {
		const ok = pctVal <= limite;
		const near = pctVal >= limite * 0.95;
		const col = !ok ? t.danger : near ? t.warn : t.ok;
		return (
			<div className="rounded-lg" style={{ background: t.muted, padding: 14 }}>
				<div className="flex items-baseline justify-between mb-2">
					<span
						className="text-xs font-semibold"
						style={{ color: t.foreground }}
					>
						{label}
					</span>
					<span className="text-xs font-bold" style={{ color: col }}>
						{ok ? "✓ dentro do limite" : "! acima"}
					</span>
				</div>
				<div className="flex items-baseline gap-2 mb-2">
					<span
						className="text-2xl font-bold tabular-nums"
						style={{ color: col }}
					>
						{pct(pctVal)}
					</span>
					<span className="text-xs" style={{ color: t.mutedFg }}>
						{valorTxt}
					</span>
				</div>
				<div
					className="relative rounded-full"
					style={{ height: 9, background: t.secondary }}
				>
					<div
						style={{
							position: "absolute",
							inset: 0,
							width: `${Math.min((pctVal / limite) * 95, 100)}%`,
							height: "100%",
							background: col,
							borderRadius: 999,
						}}
					/>
					<div
						style={{
							position: "absolute",
							left: "95%",
							top: -3,
							height: 15,
							width: 2,
							background: t.danger,
						}}
					/>
				</div>
				<div className="text-xs mt-1.5 text-right" style={{ color: t.danger }}>
					limite {fmt(limite)}%
				</div>
			</div>
		);
	};

	const note = (txt) => (
		<div
			className="rounded-xl mb-4 text-xs leading-relaxed"
			style={{
				background: t.card,
				border: `1px solid ${t.border}`,
				color: t.mutedFg,
				padding: "11px 14px",
			}}
		>
			{txt}
		</div>
	);

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

			{/* ===================== INTEGRAL ===================== */}
			{aba === "integral" && (
				<>
					{note(
						<>
							Visão consolidada da{" "}
							<b style={{ color: t.foreground }}>LOA {P.ano}</b>. Cada entidade
							tem orçamento{" "}
							<b style={{ color: t.foreground }}>equilibrado por lei</b>{" "}
							(receita prevista = despesa fixada). O consolidado{" "}
							<b style={{ color: t.foreground }}>
								elimina as transferências intra-orçamentárias
							</b>{" "}
							(duodécimo e aportes) para não duplicar valores.
						</>,
					)}
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
						<Kpi
							label="Orçamento Consolidado"
							value={brl(P.consolidado)}
							accent={t.primary}
							sub="LOA municipal (líquida de intra)"
						/>
						<Kpi
							label="Soma das Entidades"
							value={brl(P.somaEntidades)}
							sub={`${P.nEntidades} unidades orçamentárias`}
						/>
						<Kpi
							label="Transferências Intra"
							value={brl(P.intra)}
							accent={t.warn}
							sub="eliminadas na consolidação"
						/>
						<Kpi
							label="Equilíbrio da LOA"
							value="Receita = Despesa"
							sub="fixada por lei em cada ente"
						/>
					</div>
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
						<Card className="p-5 lg:col-span-2">
							<Title
								right={
									<span className="text-xs" style={{ color: t.mutedFg }}>
										orçamento bruto · R$ milhões
									</span>
								}
							>
								Orçamento por Entidade
							</Title>
							<HBar
								highlightFirst
								data={P.entidades.map(([n, r]) => ({ nome: n, valor: r }))}
								height={210}
								ylabel={150}
							/>
						</Card>
						<Card className="p-5">
							<Title>Composição Consolidada</Title>
							<Donut
								data={P.consolNatureza.map(([n, v]) => ({ nome: n, valor: v }))}
								height={200}
							/>
						</Card>
					</div>
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
						<Card className="p-5">
							<Title>Ponte de Consolidação</Title>
							<div className="flex items-center justify-between text-sm mb-2">
								<span style={{ color: t.mutedFg }}>Soma bruta</span>
								<span
									className="tabular-nums font-bold"
									style={{ color: t.foreground }}
								>
									{fmt(P.somaEntidades)}
								</span>
							</div>
							{P.intraDet.map(([n, v], i) => (
								<div
									key={i}
									className="flex items-center justify-between text-xs"
									style={{ padding: "4px 0" }}
								>
									<span style={{ color: t.mutedFg }}>(−) {n}</span>
									<span className="tabular-nums" style={{ color: t.warn }}>
										− {fmt(v)}
									</span>
								</div>
							))}
							<div
								className="flex items-center justify-between text-sm"
								style={{
									borderTop: `2px solid ${t.border}`,
									marginTop: 6,
									paddingTop: 8,
								}}
							>
								<span className="font-semibold" style={{ color: t.foreground }}>
									Consolidado
								</span>
								<span
									className="tabular-nums font-bold"
									style={{ color: t.primary }}
								>
									{fmt(P.consolidado)}
								</span>
							</div>
						</Card>
						<Card className="p-5 lg:col-span-2">
							<Title>Entidades — Receita Prevista × Despesa Fixada</Title>
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
												Entidade
											</th>
											<th
												className="text-right"
												style={{ padding: "7px 8px", fontWeight: 600 }}
											>
												Receita
											</th>
											<th
												className="text-right"
												style={{ padding: "7px 8px", fontWeight: 600 }}
											>
												Despesa
											</th>
											<th
												className="text-right"
												style={{ padding: "7px 8px", fontWeight: 600 }}
											>
												Rec. Própria
											</th>
											<th
												className="text-left"
												style={{ padding: "7px 8px", fontWeight: 600 }}
											>
												Modelo de financiamento
											</th>
										</tr>
									</thead>
									<tbody>
										{P.entidades.map(([n, r, d, pr, mod], i) => (
											<tr
												key={i}
												style={{ borderTop: `1px solid ${t.border}` }}
											>
												<td
													style={{
														padding: "8px",
														color: t.foreground,
														fontWeight: 600,
													}}
												>
													{n}
												</td>
												<td
													className="text-right tabular-nums"
													style={{ padding: "8px", color: t.foreground }}
												>
													{fmt(r)}
												</td>
												<td
													className="text-right tabular-nums"
													style={{ padding: "8px", color: t.foreground }}
												>
													{fmt(d)}
												</td>
												<td
													className="text-right tabular-nums"
													style={{
														padding: "8px",
														color: pr === 0 ? t.warn : t.mutedFg,
													}}
												>
													{fmt(pr)}
												</td>
												<td style={{ padding: "8px", color: t.mutedFg }}>
													{mod}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</Card>
					</div>
				</>
			)}

			{/* ===================== PREFEITURA ===================== */}
			{aba === "prefeitura" && (
				<>
					{note(
						<>
							A Prefeitura concentra a arrecadação. Sua{" "}
							<b style={{ color: t.foreground }}>
								receita própria supera a despesa própria
							</b>
							, e o excedente é orçado como{" "}
							<b style={{ color: t.foreground }}>transferências</b>: duodécimo à
							Câmara e aporte ao RPPS.
						</>,
					)}
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
						<Kpi
							label="Receita Prevista"
							value={brl(P.pref.receita)}
							accent={t.primary}
							sub="própria + transferências"
						/>
						<Kpi
							label="Despesa Fixada"
							value={brl(P.pref.despesa)}
							sub="equilíbrio com a receita"
						/>
						<Kpi
							label="Receita Própria"
							value={brl(P.pref.propria)}
							sub={`${pct((P.pref.propria / P.pref.receita) * 100)} do total`}
						/>
						<Kpi
							label="A Repassar (transf.)"
							value={brl(P.pref.transferir)}
							accent={t.warn}
							sub="duodécimo + aporte RPPS"
						/>
						<Kpi
							label="Investimentos"
							value={brl(P.pref.investimentos)}
							sub={`${pct((P.pref.investimentos / P.pref.despesa) * 100)} da despesa`}
						/>
						<Kpi
							label="Pessoal e Encargos"
							value={brl(P.pref.pessoal)}
							sub={`${pct((P.pref.pessoal / P.pref.despesa) * 100)} da despesa`}
						/>
					</div>

					<Card className="p-5 mb-4">
						<Title
							right={
								<span className="text-xs" style={{ color: t.mutedFg }}>
									previsão na LOA
								</span>
							}
						>
							Vinculações Constitucionais e Legais
						</Title>
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
							<VincGauge
								label="Pessoal (LRF)"
								tipo="teto"
								valor={P.pref.vinc.pessoal.valor}
								pctOrc={P.pref.vinc.pessoal.pctOrc}
								limite={P.pref.vinc.pessoal.limite}
								scale={P.pref.vinc.pessoal.scale}
								base={P.pref.vinc.pessoal.base}
							/>
							<VincGauge
								label="Saúde (ASPS)"
								tipo="piso"
								valor={P.pref.vinc.saude.valor}
								pctOrc={P.pref.vinc.saude.pctOrc}
								limite={P.pref.vinc.saude.limite}
								scale={P.pref.vinc.saude.scale}
								base={P.pref.vinc.saude.base}
							/>
							<VincGauge
								label="Educação (MDE)"
								tipo="piso"
								valor={P.pref.vinc.educacao.valor}
								pctOrc={P.pref.vinc.educacao.pctOrc}
								limite={P.pref.vinc.educacao.limite}
								scale={P.pref.vinc.educacao.scale}
								base={P.pref.vinc.educacao.base}
							/>
						</div>
						<div className="text-xs mt-3" style={{ color: t.mutedFg }}>
							A LOA já nasce planejada para cumprir os pisos de Saúde (15%) e
							Educação (25%) e respeitar o teto de pessoal da LRF (54% da RCL) —
							verificação na fase de planejamento, antes da execução.
						</div>
					</Card>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
						<Card className="p-5">
							<Title>Receita Prevista por Origem</Title>
							<Donut
								data={P.pref.receitaOrigem.map(([n, v]) => ({
									nome: n,
									valor: v,
								}))}
								height={210}
							/>
						</Card>
						<Card className="p-5">
							<Title>Despesa Fixada por Grupo</Title>
							<HBar
								data={P.pref.despesaGrupo.map(([n, v]) => ({
									nome: n,
									valor: v,
								}))}
								height={210}
								ylabel={140}
							/>
						</Card>
					</div>
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
						<Card className="p-5 lg:col-span-2">
							<Title>Despesa por Função</Title>
							<HBar
								highlightFirst
								data={P.pref.funcao.map(([n, v]) => ({ nome: n, valor: v }))}
								height={230}
								ylabel={130}
							/>
						</Card>
						<Card className="p-5">
							<Title
								right={
									<span className="text-xs" style={{ color: t.warn }}>
										saídas intra
									</span>
								}
							>
								Transferências a Repassar
							</Title>
							{P.pref.repasses.map(([n, v], i) => (
								<div
									key={i}
									className="rounded-lg mb-2 flex items-center justify-between"
									style={{ background: t.muted, padding: "11px 13px" }}
								>
									<span className="text-xs" style={{ color: t.foreground }}>
										{n}
									</span>
									<span
										className="text-sm font-bold tabular-nums"
										style={{ color: t.warn }}
									>
										{brl(v)}
									</span>
								</div>
							))}
							<div className="text-xs mt-2" style={{ color: t.mutedFg }}>
								Esses valores custeiam integralmente a Câmara e a parte
								administrativa do RPPS, cujas receitas próprias são zero.
							</div>
						</Card>
					</div>
				</>
			)}

			{/* ===================== CÂMARA ===================== */}
			{aba === "camara" && (
				<>
					{note(
						<>
							A Câmara <b style={{ color: t.foreground }}>não arrecada</b>{" "}
							(receita própria = R$ 0). É custeada pelo{" "}
							<b style={{ color: t.foreground }}>duodécimo</b> repassado pela
							Prefeitura, limitado pelo art. 29-A da Constituição.
						</>,
					)}
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
						<Kpi
							label="Receita Própria"
							value={brl(P.camara.propria)}
							accent={t.warn}
							sub="legislativo não arrecada"
						/>
						<Kpi
							label="Receita Prevista (Duodécimo)"
							value={brl(P.camara.receita)}
							accent={t.primary}
							sub="transferência da Prefeitura"
						/>
						<Kpi
							label="Despesa Fixada"
							value={brl(P.camara.despesa)}
							sub="equilíbrio com o duodécimo"
						/>
						<Kpi
							label="Folha do Legislativo"
							value={brl(P.camara.folha)}
							sub={`${pct((P.camara.folha / P.camara.despesa) * 100)} da despesa`}
						/>
					</div>
					<Card className="p-5 mb-4">
						<Title
							right={
								<span className="text-xs" style={{ color: t.mutedFg }}>
									população: {fmtInt(P.camara.populacao)} hab.
								</span>
							}
						>
							Limites do Legislativo (CF art. 29-A)
						</Title>
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
							<MiniGauge
								label="Folha ÷ Receita do Legislativo (§ 1º)"
								pctVal={P.camara.folhaPct}
								limite={P.camara.folhaLimite}
								valorTxt={`${brl(P.camara.folha)} de folha`}
							/>
							<MiniGauge
								label={`Despesa total ÷ Base (faixa de ${fmt(P.camara.faixas29A[P.camara.faixaIdx][1])}%)`}
								pctVal={P.camara.duodecimoPct}
								limite={P.camara.faixas29A[P.camara.faixaIdx][1]}
								valorTxt={`base R$ ${fmt(P.camara.duodecimoBase)} mi`}
							/>
						</div>
						<div className="overflow-x-auto">
							<table
								className="w-full"
								style={{ borderCollapse: "collapse", fontSize: 12.5 }}
							>
								<thead>
									<tr style={{ color: t.mutedFg }}>
										<th
											className="text-left"
											style={{ padding: "7px 10px", fontWeight: 600 }}
										>
											Faixa populacional
										</th>
										<th
											className="text-right"
											style={{ padding: "7px 10px", fontWeight: 600 }}
										>
											Limite da despesa total
										</th>
										<th
											className="text-left"
											style={{ padding: "7px 10px", fontWeight: 600 }}
										></th>
									</tr>
								</thead>
								<tbody>
									{P.camara.faixas29A.map(([fx, lim], i) => {
										const ativa = i === P.camara.faixaIdx;
										return (
											<tr
												key={i}
												style={{
													borderTop: `1px solid ${t.border}`,
													background: ativa ? t.accent : "transparent",
												}}
											>
												<td
													style={{
														padding: "8px 10px",
														color: t.foreground,
														fontWeight: ativa ? 700 : 400,
													}}
												>
													{fx}
												</td>
												<td
													className="text-right tabular-nums"
													style={{
														padding: "8px 10px",
														color: ativa ? t.primary : t.mutedFg,
														fontWeight: ativa ? 700 : 400,
													}}
												>
													{fmt(lim)}%
												</td>
												<td style={{ padding: "8px 10px" }}>
													{ativa && (
														<span
															className="text-xs font-bold"
															style={{ color: t.primary }}
														>
															● faixa do município
														</span>
													)}
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
						<div className="text-xs mt-3" style={{ color: t.mutedFg }}>
							O limite incide sobre a receita tributária e as transferências (CF
							art. 153, § 5º, e arts. 158 e 159){" "}
							<b style={{ color: t.foreground }}>
								efetivamente realizadas no exercício anterior
							</b>
							. A folha do Legislativo não pode exceder 70% da receita da Câmara
							(§ 1º).
						</div>
					</Card>
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
						<Card className="p-5">
							<Title>Despesa por Grupo</Title>
							<Donut
								data={P.camara.grupo.map(([n, v]) => ({ nome: n, valor: v }))}
								height={210}
							/>
						</Card>
						<Card className="p-5 flex flex-col justify-center">
							<Title>Modelo de Financiamento</Title>
							<div
								className="rounded-lg"
								style={{ background: t.muted, padding: 16 }}
							>
								<div className="flex items-center justify-between mb-3">
									<span className="text-sm" style={{ color: t.mutedFg }}>
										Receita própria
									</span>
									<span
										className="text-lg font-bold tabular-nums"
										style={{ color: t.warn }}
									>
										{brl(0)}
									</span>
								</div>
								<div
									className="flex items-center justify-center my-2"
									style={{ color: t.mutedFg }}
								>
									↓ custeada por
								</div>
								<div className="flex items-center justify-between">
									<span className="text-sm" style={{ color: t.mutedFg }}>
										Duodécimo (Prefeitura)
									</span>
									<span
										className="text-lg font-bold tabular-nums"
										style={{ color: t.primary }}
									>
										{brl(P.camara.receita)}
									</span>
								</div>
							</div>
						</Card>
					</div>
				</>
			)}

			{/* ===================== PREVIDÊNCIA ===================== */}
			{aba === "previdencia" && (
				<>
					{note(
						<>
							O RPPS tem <b style={{ color: t.foreground }}>dois orçamentos</b>:
							o <b style={{ color: t.foreground }}>previdenciário</b> (receita
							de contribuições e investimentos{" "}
							<b style={{ color: t.foreground }}>superior</b> à despesa com
							benefícios, gerando reserva) e o{" "}
							<b style={{ color: t.foreground }}>administrativo</b> (receita
							própria = 0, custeado por taxa de administração / aporte).
						</>,
					)}
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
						<Kpi
							label="Receita Previdenciária"
							value={brl(P.prev.recPrev)}
							accent={t.primary}
							sub="contribuições + investimentos"
						/>
						<Kpi
							label="Despesa Previdenciária"
							value={brl(P.prev.despPrev)}
							sub="aposentadorias + pensões"
						/>
						<Kpi
							label="Resultado Previdenciário"
							value={`+ ${brl(P.prev.resultado)}`}
							accent={t.ok}
							sub="superávit → reserva"
						/>
						<Kpi
							label="Custeio Administrativo"
							value={brl(P.prev.despAdm)}
							accent={t.warn}
							sub="receita própria R$ 0 · por aporte"
						/>
					</div>
					<Card className="p-5 mb-4">
						<Title
							right={
								<span className="text-xs" style={{ color: t.mutedFg }}>
									Portaria MPS 402/2008, art. 15
								</span>
							}
						>
							Taxa de Administração do RPPS
						</Title>
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
							<MiniGauge
								label="Custeio adm. ÷ Base (exercício anterior)"
								pctVal={P.prevTaxa.taxaAdmPct}
								limite={P.prevTaxa.taxaAdmLimite}
								valorTxt={`${brl(P.prevTaxa.despAdm)} · base R$ ${fmt(P.prevTaxa.taxaAdmBase)} mi`}
							/>
							<div
								className="rounded-lg flex flex-col justify-center text-xs leading-relaxed"
								style={{ background: t.muted, color: t.mutedFg, padding: 14 }}
							>
								A taxa de administração custeia a gestão do RPPS (pessoal,
								sistemas, perícias) e é limitada a{" "}
								<b style={{ color: t.foreground }}>
									2% do total de remunerações, proventos e pensões
								</b>{" "}
								dos segurados, apurado no exercício anterior. A unidade gestora{" "}
								<b style={{ color: t.foreground }}>não arrecada</b> para o
								administrativo: o custeio vem de aporte / da própria taxa retida
								do previdenciário.
							</div>
						</div>
					</Card>
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
						<Card className="p-5">
							<Title>Receita Previdenciária por Origem</Title>
							<Donut
								data={P.prev.recOrigem.map(([n, v]) => ({ nome: n, valor: v }))}
								height={210}
							/>
						</Card>
						<Card className="p-5">
							<Title>Despesa com Benefícios</Title>
							<HBar
								data={P.prev.beneficios.map(([n, v]) => ({
									nome: n,
									valor: v,
								}))}
								height={130}
								ylabel={120}
							/>
							<div
								className="rounded-lg mt-3 flex items-center justify-between"
								style={{ background: t.muted, padding: "12px 14px" }}
							>
								<span className="text-xs" style={{ color: t.mutedFg }}>
									Receita {brl(P.prev.recPrev)} − Despesa {brl(P.prev.despPrev)}{" "}
									=
								</span>
								<span
									className="text-lg font-bold tabular-nums"
									style={{ color: t.ok }}
								>
									+ {brl(P.prev.resultado)}
								</span>
							</div>
						</Card>
					</div>
					<Card className="p-5">
						<Title>Receita × Despesa Previdenciária</Title>
						<HBar
							highlightFirst
							data={[
								{ nome: "Receita previdenciária", valor: P.prev.recPrev },
								{ nome: "Despesa (benefícios)", valor: P.prev.despPrev },
							]}
							height={120}
							ylabel={150}
						/>
						<div className="text-xs mt-2" style={{ color: t.mutedFg }}>
							O superávit previdenciário capitaliza a reserva do fundo
							(equilíbrio atuarial). Já a parte administrativa, sem receita
							própria, é custeada por aporte da Prefeitura — como a Câmara.
						</div>
					</Card>
				</>
			)}

			{/* ===================== SANEAMENTO ===================== */}
			{aba === "saneamento" && (
				<>
					{note(
						<>
							A Autarquia de Saneamento tem{" "}
							<b style={{ color: t.foreground }}>receita própria</b> (tarifas de
							água e esgoto) e{" "}
							<b style={{ color: t.foreground }}>orçamento equilibrado</b>: a
							arrecadação tarifária cobre custeio, pessoal e investimentos, sem
							depender de transferências.
						</>,
					)}
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
						<Kpi
							label="Receita Prevista (Tarifas)"
							value={brl(P.san.receita)}
							accent={t.primary}
							sub="água + esgoto"
						/>
						<Kpi
							label="Despesa Fixada"
							value={brl(P.san.despesa)}
							sub="custeio + pessoal + investim."
						/>
						<Kpi
							label="Resultado"
							value="Equilibrado"
							accent={t.ok}
							sub="receita = despesa"
						/>
						<Kpi
							label="Investimentos"
							value={brl(P.san.investimentos)}
							sub={`${pct((P.san.investimentos / P.san.despesa) * 100)} da despesa`}
						/>
					</div>
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
						<Card className="p-5">
							<Title>Receita por Origem</Title>
							<Donut
								data={P.san.recOrigem.map(([n, v]) => ({ nome: n, valor: v }))}
								height={210}
							/>
						</Card>
						<Card className="p-5">
							<Title>Despesa por Grupo</Title>
							<HBar
								data={P.san.grupo.map(([n, v]) => ({ nome: n, valor: v }))}
								height={210}
								ylabel={130}
							/>
						</Card>
					</div>
				</>
			)}
		</>
	);
}
