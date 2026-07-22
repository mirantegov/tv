import type React from "react";
import { Card } from "../components";
import { useData } from "../DataProvider";
import { useTheme } from "../theme";

export default function PanoramaModule() {
	const { PAN } = useData();
	const { t } = useTheme();
	const P = PAN;
	const Sec = ({ icon, title, children }) => (
		<Card className="p-5 mb-4">
			<div className="flex items-center gap-2 mb-4">
				<span style={{ fontSize: 17 }}>{icon}</span>
				<h3 className="text-sm font-bold" style={{ color: t.foreground }}>
					{title}
				</h3>
			</div>
			{children}
		</Card>
	);
	const Ind = ({
		label,
		value,
		unit,
		meta,
	}: {
		label?: React.ReactNode;
		value?: React.ReactNode;
		unit?: React.ReactNode;
		meta?: React.ReactNode;
	}) => (
		<div
			className="rounded-lg"
			style={{ background: t.muted, padding: "13px 14px" }}
		>
			<div className="text-xs mb-1" style={{ color: t.mutedFg }}>
				{label}
			</div>
			<div className="flex items-baseline gap-1.5">
				<span
					className="text-xl font-bold tabular-nums"
					style={{ color: t.foreground }}
				>
					{value}
				</span>
				{unit && (
					<span className="text-xs" style={{ color: t.mutedFg }}>
						{unit}
					</span>
				)}
			</div>
			<div className="text-xs mt-1" style={{ color: t.mutedFg, opacity: 0.75 }}>
				{meta}
			</div>
		</div>
	);
	const m = (o, fonte) =>
		`${fonte} · ${o.ano}${o.ibge ? "" : " · ilustrativo"}`;

	/* ---- TCE-PR (Consulta da entidade) ---- */
	const TCE = P.tce;
	const nBR = (n: number, dec = 2) =>
		n.toLocaleString("pt-BR", {
			minimumFractionDigits: dec,
			maximumFractionDigits: dec,
		});
	const reais = (n: number) => `R$ ${nBR(n)}`;
	const milhoes = (n: number) => `R$ ${nBR(n / 1e6, 1)} mi`;
	const pctBR = (n: number) => `${nBR(n)}%`;
	const tone = (x: string) =>
		x === "ok"
			? t.ok
			: x === "warn"
				? t.warn
				: x === "danger"
					? t.danger
					: t.primary;

	// Medidor de limite fiscal/constitucional (teto ou mínimo) com marcador.
	const LimiteGauge = ({
		nome,
		L,
		nota,
	}: {
		nome: string;
		L: NonNullable<typeof TCE>["limites"]["pessoal"];
		nota?: React.ReactNode;
	}) => {
		const ok = L.tipo === "teto" ? L.pct <= L.limite : L.pct >= L.limite;
		const col = ok ? t.ok : L.parcial ? t.warn : t.danger;
		const mk = L.tipo === "teto" ? t.danger : t.ok;
		const status =
			L.tipo === "teto"
				? ok
					? "dentro do teto"
					: "acima do teto"
				: ok
					? "acima do mínimo"
					: L.parcial
						? "em curso"
						: "abaixo do mínimo";
		const scale =
			L.tipo === "teto" ? L.limite * 1.08 : Math.max(L.limite, L.pct) * 1.35;
		const barPct = Math.max(0, Math.min((L.pct / scale) * 100, 100));
		const mkPct = Math.min((L.limite / scale) * 100, 100);
		return (
			<div className="rounded-lg" style={{ background: t.muted, padding: 14 }}>
				<div className="flex items-baseline justify-between mb-1 gap-2">
					<span
						className="text-xs font-semibold"
						style={{ color: t.foreground }}
					>
						{nome}
					</span>
					<span
						className="text-xs font-bold whitespace-nowrap"
						style={{ color: col }}
					>
						{ok ? "✓" : L.parcial ? "•" : "!"} {status}
					</span>
				</div>
				<div className="flex items-baseline gap-2 mb-2 flex-wrap">
					<span
						className="text-2xl font-bold tabular-nums"
						style={{ color: col }}
					>
						{pctBR(L.pct)}
					</span>
					<span className="text-xs tabular-nums" style={{ color: t.mutedFg }}>
						{reais(L.valor)}
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
							width: `${barPct}%`,
							height: "100%",
							background: col,
							borderRadius: 999,
						}}
					/>
					<div
						style={{
							position: "absolute",
							left: `${mkPct}%`,
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
						{L.tipo === "teto" ? "teto" : "mín."} {nBR(L.limite, 0)}%
					</span>
					<span>{nBR(scale, 0)}%</span>
				</div>
				{nota && (
					<div className="text-xs mt-2" style={{ color: t.mutedFg }}>
						{nota}
					</div>
				)}
			</div>
		);
	};

	// Barra de execução: realizado sobre um total (receita/despesa).
	const ExecBar = ({
		titulo,
		realizado,
		total,
		rotuloReal,
		rotuloTotal,
		cor,
	}: {
		titulo: string;
		realizado: number;
		total: number;
		rotuloReal: string;
		rotuloTotal: string;
		cor: string;
	}) => {
		const p = total > 0 ? (realizado / total) * 100 : 0;
		return (
			<div className="rounded-lg" style={{ background: t.muted, padding: 14 }}>
				<div className="flex items-baseline justify-between mb-1">
					<span
						className="text-xs font-semibold"
						style={{ color: t.foreground }}
					>
						{titulo}
					</span>
					<span
						className="text-sm font-bold tabular-nums"
						style={{ color: cor }}
					>
						{pctBR(p)}
					</span>
				</div>
				<div
					className="relative rounded-full mb-2"
					style={{ height: 10, background: t.secondary }}
				>
					<div
						style={{
							width: `${Math.min(p, 100)}%`,
							height: "100%",
							background: cor,
							borderRadius: 999,
						}}
					/>
				</div>
				<div
					className="flex justify-between text-xs tabular-nums"
					style={{ color: t.mutedFg }}
				>
					<span>
						{rotuloReal}: {milhoes(realizado)}
					</span>
					<span>
						{rotuloTotal}: {milhoes(total)}
					</span>
				</div>
			</div>
		);
	};

	// Barra comparativa Município vs Mediana estadual.
	const CmpBar = ({
		item,
	}: {
		item: [string, number, number, boolean, string];
	}) => {
		const [nome, mun, med, maior, unidade] = item;
		const max = Math.max(mun, med) || 1;
		const better = maior ? mun >= med : mun <= med;
		const col = better ? t.ok : t.warn;
		const fmtN = (n: number) =>
			n.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
		const diff = med !== 0 ? ((mun - med) / med) * 100 : 0;
		return (
			<div>
				<div className="flex items-baseline justify-between mb-1 gap-2">
					<span className="text-xs" style={{ color: t.foreground }}>
						{nome}
					</span>
					<span
						className="text-xs font-bold tabular-nums whitespace-nowrap"
						style={{ color: col }}
					>
						{fmtN(mun)}
						{unidade}
					</span>
				</div>
				<div
					className="relative rounded-full mb-1"
					style={{ height: 7, background: t.secondary }}
				>
					<div
						style={{
							position: "absolute",
							inset: 0,
							width: `${(mun / max) * 100}%`,
							height: "100%",
							background: col,
							borderRadius: 999,
						}}
					/>
					<div
						style={{
							position: "absolute",
							left: `${(med / max) * 100}%`,
							top: -2,
							height: 11,
							width: 2,
							background: t.mutedFg,
						}}
					/>
				</div>
				<div
					className="flex justify-between text-xs"
					style={{ color: t.mutedFg }}
				>
					<span>
						mediana {fmtN(med)}
						{unidade}
					</span>
					<span style={{ color: col }}>
						{mun >= med ? "▲" : "▼"}{" "}
						{Math.abs(diff).toLocaleString("pt-BR", {
							maximumFractionDigits: 0,
						})}
						% vs mediana
					</span>
				</div>
			</div>
		);
	};

	return (
		<>
			<Card className="p-5 mb-4">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
					<div>
						<div className="flex items-baseline gap-2">
							<h2 className="text-xl font-bold" style={{ color: t.foreground }}>
								{P.municipio}
							</h2>
							<span
								className="text-sm font-semibold"
								style={{ color: t.primary }}
							>
								{P.uf}
							</span>
						</div>
						<div className="text-xs mt-1" style={{ color: t.mutedFg }}>
							Gentílico: {P.gentilico} · Código IBGE: {P.codigo} · Bioma:{" "}
							{P.territorio.bioma} · Hierarquia urbana:{" "}
							{P.territorio.hierarquia}
						</div>
					</div>
					<div
						className="rounded-lg text-center"
						style={{ background: t.muted, padding: "10px 18px" }}
					>
						<div className="text-xs" style={{ color: t.mutedFg }}>
							IDHM
						</div>
						<div
							className="text-2xl font-bold tabular-nums"
							style={{ color: t.ok }}
						>
							{P.idhm.v}
						</div>
						<div className="text-xs" style={{ color: t.mutedFg }}>
							{P.idhm.faixa} · {P.idhm.ano}
						</div>
					</div>
				</div>
				<div className="text-xs mt-3" style={{ color: t.mutedFg }}>
					Estrutura do Panorama Municipal (IBGE Cidades). Indicadores sem a
					marca "ilustrativo" foram coletados da página oficial do IBGE; os
					demais serão preenchidos por município via API do IBGE.
				</div>
			</Card>

			<Sec icon="👥" title="População">
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
					<Ind
						label="População no último censo"
						value={P.populacao.censo.v}
						unit="pessoas"
						meta={m(P.populacao.censo, "Censo IBGE")}
					/>
					<Ind
						label="População estimada"
						value={P.populacao.estimada.v}
						unit="pessoas"
						meta={m(P.populacao.estimada, "IBGE")}
					/>
					<Ind
						label="Densidade demográfica"
						value={P.populacao.densidade.v}
						unit="hab/km²"
						meta={m(P.populacao.densidade, "Censo IBGE")}
					/>
					<Ind
						label="Posição populacional no PR"
						value={P.populacao.rankUf}
						meta="ranking estadual · ilustrativo"
					/>
				</div>
			</Sec>

			<Sec icon="💼" title="Trabalho e Rendimento">
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
					<Ind
						label="Salário médio dos trabalhadores formais"
						value={P.trabalho.salarioMedio.v}
						unit="salários mínimos"
						meta={m(P.trabalho.salarioMedio, "CEMPRE/IBGE")}
					/>
					<Ind
						label="Pessoal ocupado"
						value={P.trabalho.ocupado.v}
						unit="pessoas"
						meta={m(P.trabalho.ocupado, "CEMPRE/IBGE")}
					/>
					<Ind
						label="População ocupada"
						value={P.trabalho.ocupadaPct.v}
						unit="%"
						meta={m(P.trabalho.ocupadaPct, "CEMPRE/IBGE")}
					/>
					<Ind
						label="Rendimento per capita de até ½ salário mínimo"
						value={P.trabalho.meioSM.v}
						unit="% da população"
						meta={m(P.trabalho.meioSM, "Censo IBGE")}
					/>
				</div>
			</Sec>

			<Sec icon="🎓" title="Educação">
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
					<Ind
						label="Escolarização de 6 a 14 anos"
						value={P.educacao.escolarizacao.v}
						unit="%"
						meta={m(P.educacao.escolarizacao, "Censo IBGE")}
					/>
					<Ind
						label="IDEB — anos iniciais (rede pública)"
						value={P.educacao.idebIniciais.v}
						meta={m(P.educacao.idebIniciais, "INEP")}
					/>
					<Ind
						label="IDEB — anos finais (rede pública)"
						value={P.educacao.idebFinais.v}
						meta={m(P.educacao.idebFinais, "INEP")}
					/>
					<Ind
						label="Matrículas no ensino fundamental"
						value={P.educacao.matFund.v}
						unit="alunos"
						meta={m(P.educacao.matFund, "Censo Escolar")}
					/>
					<Ind
						label="Matrículas no ensino médio"
						value={P.educacao.matMedio.v}
						unit="alunos"
						meta={m(P.educacao.matMedio, "Censo Escolar")}
					/>
					<Ind
						label="Docentes no ensino fundamental"
						value={P.educacao.docFund.v}
						meta={m(P.educacao.docFund, "Censo Escolar")}
					/>
					<Ind
						label="Estabelecimentos de ensino"
						value={P.educacao.escolas.v}
						unit="escolas"
						meta={m(P.educacao.escolas, "Censo Escolar")}
					/>
				</div>
			</Sec>

			<Sec icon="📈" title="Economia">
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
					<Ind
						label="PIB per capita"
						value={`R$ ${P.economia.pibPerCapita.v}`}
						meta={m(P.economia.pibPerCapita, "IBGE")}
					/>
					<Ind
						label="Total de receitas brutas realizadas"
						value={`R$ ${P.economia.receitas.v} mi`}
						meta={m(P.economia.receitas, "Siconfi/STN")}
					/>
					<Ind
						label="Total de despesas brutas empenhadas"
						value={`R$ ${P.economia.despesas.v} mi`}
						meta={m(P.economia.despesas, "Siconfi/STN")}
					/>
					<Ind
						label="Receitas oriundas de fontes externas"
						value={P.economia.fontesExternasPct.v}
						unit="%"
						meta={m(P.economia.fontesExternasPct, "IBGE")}
					/>
				</div>
				<div className="text-xs mt-3" style={{ color: t.mutedFg }}>
					PIB per capita entre os mais altos do estado ({P.economia.rankPibUf} ·
					ilustrativo) — economia puxada pelo agronegócio e pela agroindústria.
				</div>
			</Sec>

			<Sec icon="🏥" title="Saúde">
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
					<Ind
						label="Mortalidade infantil"
						value={P.saude.mortInfantil.v}
						unit="óbitos / mil nascidos vivos"
						meta={m(P.saude.mortInfantil, "SIM/Datasus")}
					/>
					<Ind
						label="Internações por diarreia"
						value={P.saude.diarreia.v}
						unit="por mil hab."
						meta={m(P.saude.diarreia, "Datasus")}
					/>
					<Ind
						label="Estabelecimentos de saúde (SUS)"
						value={P.saude.estabSus.v}
						meta={m(P.saude.estabSus, "CNES")}
					/>
				</div>
			</Sec>

			<Sec icon="🗺️" title="Território e Ambiente">
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
					<Ind
						label="Área territorial"
						value={P.territorio.area.v}
						unit="km²"
						meta={m(P.territorio.area, "IBGE")}
					/>
					<Ind
						label="Esgotamento sanitário adequado"
						value={P.territorio.esgoto.v}
						unit="%"
						meta={m(P.territorio.esgoto, "Censo IBGE")}
					/>
					<Ind
						label="Arborização de vias públicas"
						value={P.territorio.arborizacao.v}
						unit="%"
						meta={m(P.territorio.arborizacao, "Censo IBGE")}
					/>
					<Ind
						label="Urbanização de vias públicas"
						value={P.territorio.viasUrb.v}
						unit="%"
						meta={m(P.territorio.viasUrb, "Censo IBGE")}
					/>
				</div>
			</Sec>

			{TCE && (
				<>
					<Card className="p-5 mb-4" style={{ borderColor: t.primary }}>
						<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
							<div>
								<div className="flex items-center gap-2">
									<span style={{ fontSize: 18 }}>🏛️</span>
									<h3
										className="text-base font-bold"
										style={{ color: t.foreground }}
									>
										Situação Fiscal — Consulta TCE-PR
									</h3>
								</div>
								<div className="text-xs mt-1" style={{ color: t.mutedFg }}>
									Gestor: <strong>{TCE.gestor}</strong> · Exercício{" "}
									{TCE.exercicio} · Dados referentes a {TCE.referencia} · Último
									envio {TCE.ultimoEnvio}
								</div>
							</div>
							<div
								className="rounded-lg"
								style={{ background: t.muted, padding: "10px 16px" }}
							>
								<div className="text-xs" style={{ color: t.mutedFg }}>
									Certidão Liberatória
								</div>
								<div
									className="text-sm font-bold tabular-nums"
									style={{ color: t.ok }}
								>
									Nº {TCE.certidao.numero}
								</div>
								<div className="text-xs" style={{ color: t.mutedFg }}>
									válida até {TCE.certidao.validade}
								</div>
							</div>
						</div>
					</Card>

					<Sec icon="⚖️" title="Limites Constitucionais e Fiscais">
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
							<LimiteGauge
								nome="Despesa de Pessoal (LRF)"
								L={TCE.limites.pessoal}
								nota={`Teto de 54% da RCL · RCL ${milhoes(TCE.rcl)}`}
							/>
							<LimiteGauge
								nome="Saúde (ASPS)"
								L={TCE.limites.saude}
								nota={`Mínimo de 15% · base ${milhoes(
									TCE.limites.saude.base || 0,
								)}`}
							/>
							<LimiteGauge
								nome="Educação (MDE)"
								L={TCE.limites.educacao}
								nota="Mínimo de 25% · acumulado até o mês 4 (parcial)"
							/>
							<LimiteGauge
								nome="Dívida Consolidada Líquida"
								L={TCE.limites.divida}
								nota="Teto de 120% da RCL · % negativo = haveres superam a dívida"
							/>
							<LimiteGauge
								nome="Operações de Crédito"
								L={TCE.limites.opCredito}
								nota="Teto de 16% da RCL · nenhuma operação no exercício"
							/>
						</div>
						<div className="text-xs mt-3" style={{ color: t.mutedFg }}>
							Consolidado do município fechado até o mês {TCE.mesConsolidado}.
							Marcadores indicam o teto (LRF/Senado) ou o mínimo constitucional
							(CF art. 212 · EC 29).
						</div>
					</Sec>

					<Sec icon="📊" title={`Execução Orçamentária ${TCE.exercicio}`}>
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
							<ExecBar
								titulo="Receita arrecadada / prevista atualizada"
								realizado={TCE.execucao.receitaArrecadada}
								total={TCE.execucao.receitaAtualizada}
								rotuloReal="Arrecadada"
								rotuloTotal="Prevista"
								cor={t.ok}
							/>
							<ExecBar
								titulo="Despesa empenhada / dotação atualizada"
								realizado={TCE.execucao.despesaEmpenhada}
								total={TCE.execucao.dotacaoAtualizada}
								rotuloReal="Empenhada"
								rotuloTotal="Dotação"
								cor={t.primary}
							/>
						</div>
						<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
							<Ind
								label={`LOA ${TCE.previsao.loa}`}
								value="Lei Orçamentária"
								meta="fonte da previsão"
							/>
							<Ind
								label="Receita prevista (LOA)"
								value={milhoes(TCE.previsao.receitaPrevista)}
								meta="antes das atualizações"
							/>
							<Ind
								label="Despesa fixada (LOA)"
								value={milhoes(TCE.previsao.despesaFixada)}
								meta="antes das atualizações"
							/>
						</div>
					</Sec>

					<Sec icon="🚧" title="Obras Públicas">
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
							{TCE.obras.map(([status, valor, qtde, tn]) => (
								<div
									key={status}
									className="rounded-lg"
									style={{
										background: t.muted,
										padding: "13px 14px",
										borderLeft: `3px solid ${tone(tn)}`,
									}}
								>
									<div className="text-xs mb-1" style={{ color: t.mutedFg }}>
										{status}
									</div>
									<div
										className="text-lg font-bold tabular-nums"
										style={{ color: tone(tn) }}
									>
										{milhoes(valor)}
									</div>
									<div className="text-xs mt-1" style={{ color: t.mutedFg }}>
										{qtde} {qtde === 1 ? "obra" : "obras"}
									</div>
								</div>
							))}
						</div>
						{(() => {
							const par = TCE.obras.find((o) => o[0] === "Paralisada");
							return (
								<div className="text-xs mt-3" style={{ color: t.mutedFg }}>
									Obras não concluídas até dez/2012 e obras iniciadas a partir
									de 2013 (fonte TCE-PR).
									{par && par[2] > 0 && (
										<>
											{" "}
											Atenção às{" "}
											<strong style={{ color: t.danger }}>
												{par[2]} obras paralisadas
											</strong>{" "}
											({milhoes(par[1])}).
										</>
									)}
								</div>
							);
						})()}
					</Sec>

					<Sec icon="📁" title="Processos em Trâmite no TCE">
						<div className="flex flex-col lg:flex-row gap-4 lg:items-center">
							<div
								className="rounded-lg text-center"
								style={{ background: t.muted, padding: "16px 22px" }}
							>
								<div className="text-xs" style={{ color: t.mutedFg }}>
									Total
								</div>
								<div
									className="text-3xl font-bold tabular-nums"
									style={{ color: t.primary }}
								>
									{TCE.processosTotal}
								</div>
								<div className="text-xs" style={{ color: t.mutedFg }}>
									processos
								</div>
							</div>
							<div className="flex-1 flex flex-col gap-2">
								{TCE.processos.map(([orgao, qtde]) => {
									const max = Math.max(...TCE.processos.map((p) => p[1]), 1);
									return (
										<div key={orgao}>
											<div className="flex justify-between text-xs mb-1">
												<span style={{ color: t.foreground }}>{orgao}</span>
												<span
													className="tabular-nums font-semibold"
													style={{ color: t.foreground }}
												>
													{qtde}
												</span>
											</div>
											<div
												className="rounded-full"
												style={{ height: 6, background: t.secondary }}
											>
												<div
													style={{
														width: `${(qtde / max) * 100}%`,
														height: "100%",
														background: t.primary,
														borderRadius: 999,
													}}
												/>
											</div>
										</div>
									);
								})}
							</div>
						</div>
					</Sec>

					<Sec icon="📈" title="Indicadores — Município vs Mediana Estadual">
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-5">
							{TCE.indicadores.map(([grupo, itens]) => (
								<div key={grupo}>
									<div
										className="text-xs font-bold uppercase tracking-wider mb-3"
										style={{ color: t.mutedFg }}
									>
										{grupo}
									</div>
									<div className="flex flex-col gap-3">
										{itens.map((it) => (
											<CmpBar key={it[0]} item={it} />
										))}
									</div>
								</div>
							))}
						</div>
						<div className="text-xs mt-4" style={{ color: t.mutedFg }}>
							Barra colorida = município; marcador cinza = mediana dos
							municípios do Paraná. Verde indica desempenho melhor que a
							mediana.
						</div>
					</Sec>
				</>
			)}
		</>
	);
}
