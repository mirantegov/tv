/* ============================================================================
   ANÁLISES E ALERTAS — seção exibida ao final de cada módulo (Extras)
   Conteúdo derivado dos KPIs/tabelas/gráficos do módulo (dados de data.ts).
   sev: "crit" (crítico) | "warn" (atenção) | "info" (análise/insight)
   ============================================================================ */
import { Card, Title } from "./components";
import { Link } from "./router";
import { useTheme } from "./theme";

type Item = {
	sev: "crit" | "warn" | "info";
	titulo: string;
	det: string;
	href?: string;
	acao?: string;
};
type Bloco = { itens: Item[]; emDia: [string, string][] };

export const AA: Record<string, Bloco> = {
	"/": {
		itens: [
			{
				sev: "crit",
				titulo: "CAUC com pendência — CRP previdenciário irregular",
				det: "Bloqueia transferências voluntárias e convênios com a União.",
				href: "/siconfi",
				acao: "Regularizar",
			},
			{
				sev: "crit",
				titulo: "Fonte vinculada com saldo negativo — Royalties (− R$ 0,8 mi)",
				det: "Indica uso de recurso de outra destinação; recompor antes do fechamento.",
				href: "/financeiro-analises",
				acao: "Ver fontes",
			},
			{
				sev: "crit",
				titulo: "Obrigação TCE-PR não atendida — RREO (Município)",
				det: "Publicidade do RREO pendente no período; sujeita a apontamento.",
				href: "/tce",
				acao: "Ver agenda",
			},
			{
				sev: "warn",
				titulo: "Pessoal/RCL em 49,2% — acima do limite de alerta (48,6%)",
				det: "Ainda abaixo do prudencial (51,3%); monitorar reajustes e nomeações.",
				href: "/folha",
				acao: "Ver LRF",
			},
			{
				sev: "warn",
				titulo: "18 contratos vencem em 90 dias (R$ 42,0 mi)",
				det: "Iniciar renovações/licitações para evitar contratação emergencial.",
				href: "/contratos",
				acao: "Ver vigências",
			},
			{
				sev: "warn",
				titulo: "Certidão Liberatória vence em 27 dias",
				det: "Renovar junto ao TCE-PR para não travar repasses estaduais.",
				href: "/tce",
				acao: "Ver certidão",
			},
			{
				sev: "warn",
				titulo: "MSC pendente — competência 06/2026 (SICONFI)",
				det: "Remessa mensal da Matriz de Saldos Contábeis em atraso; regularizar no SICONFI.",
				href: "/siconfi",
				acao: "Ver SICONFI",
			},
			{
				sev: "info",
				titulo: "Execução equilibrada no 1º semestre",
				det: "Receita realizada em 51,1% da previsão e despesa empenhada em 55,3% da dotação — aderentes ao esperado para junho.",
			},
		],
		emDia: [
			["Saúde 18,4%", "mín. 15% ✓"],
			["Educação 27,5%", "mín. 25% ✓"],
			["Duodécimo 5,8%", "teto 6% ✓"],
			["Taxa adm. RPPS 0,52%", "teto 2% ✓"],
			["Conciliação 87,5%", "42/48 contas"],
			["Art. 29-A (Câmara)", "dentro do teto ✓"],
		],
	},
	"/panorama": {
		itens: [
			{
				sev: "info",
				titulo: "Economia forte per capita",
				det: "PIB per capita de R$ 105,6 mil (18º do PR) com população em 72º — indicador de alta produtividade local.",
			},
			{
				sev: "info",
				titulo: "IDEB — queda na transição de ciclo",
				det: "Anos iniciais em 6,5 e anos finais em 5,1 — priorizar reforço na passagem para os anos finais.",
			},
			{
				sev: "warn",
				titulo: "Esgotamento sanitário em 87,4%",
				det: "12,6% dos domicílios sem cobertura (dado 2022); avaliar metas de universalização com o Saneamento.",
			},
			{
				sev: "info",
				titulo: "Mortalidade infantil em 6,02/mil nascidos vivos",
				det: "Abaixo da média nacional; manter cobertura da atenção básica.",
			},
		],
		emDia: [
			["Escolarização 98,98%", "6 a 14 anos ✓"],
			["IDHM 0,768", "faixa Alto ✓"],
			["Arborização 96,2%", "vias urbanas ✓"],
		],
	},
	"/planejamento": {
		itens: [
			{
				sev: "warn",
				titulo: "Folha da Câmara em 68,4% do duodécimo",
				det: "Próxima do teto de 70% (CF art. 29-A, §1º); acompanhar reajustes do Legislativo.",
			},
			{
				sev: "warn",
				titulo: "Pessoal projetado em 49,2% da RCL prevista",
				det: "Margem de 4,8 p.p. até o limite de 54% — orçamento com pouco espaço para expansão de quadro.",
			},
			{
				sev: "info",
				titulo: "RPPS com superávit previdenciário de R$ 22,0 mi",
				det: "Receitas de R$ 130,0 mi contra benefícios de R$ 108,0 mi; taxa administrativa em 0,52% (teto 2%).",
			},
			{
				sev: "info",
				titulo: "Consolidado de R$ 1.055,0 mi em 4 entidades",
				det: "Soma de R$ 1.160,5 mi com R$ 105,5 mi de operações intraorçamentárias eliminadas na consolidação.",
			},
		],
		emDia: [
			["Duodécimo 5,8%", "teto 6% ✓"],
			["Saúde 18,4%", "mín. 15% ✓"],
			["Educação 27,5%", "mín. 25% ✓"],
			["Saneamento", "equilíbrio tarifário ✓"],
		],
	},
	"/despesa": {
		itens: [
			{
				sev: "warn",
				titulo: "Restos a pagar em R$ 95,4 mi",
				det: "R$ 41,2 mi processados e R$ 54,2 mi não processados — pressionam o caixa do exercício; priorizar liquidação.",
			},
			{
				sev: "warn",
				titulo: "Urbanismo com execução mais lenta",
				det: "Pago de R$ 26,8 mi sobre R$ 40,2 mi empenhados (66,7%) — verificar medições e cronogramas de obras.",
			},
			{
				sev: "info",
				titulo: "Empenhado em 55,3% da dotação no 6º mês",
				det: "Ritmo aderente ao esperado (~50%); Saúde e Educação concentram 57,5% do empenho.",
			},
			{
				sev: "info",
				titulo: "Investimentos em 13,1% do empenhado",
				det: "R$ 61,8 mi em investimentos contra R$ 388,9 mi de pessoal + custeio — perfil típico de meio de exercício.",
			},
		],
		emDia: [
			["Saúde (ASPS) 22,4%", "mín. 15% ✓"],
			["Educação (MDE) 26,8%", "mín. 25% ✓"],
			["Liquidado 87,3%", "do empenhado ✓"],
		],
	},
	"/despesa-comp": {
		itens: [
			{
				sev: "info",
				titulo: "Empenhado cresce 7,0% sobre 2025",
				det: "De R$ 439,5 mi para R$ 470,1 mi; pago avança 6,0% — crescimento real moderado.",
			},
			{
				sev: "info",
				titulo: "Saúde lidera o avanço (+11,3%)",
				det: "De R$ 128,0 mi para R$ 142,4 mi, puxada por Assistência Hospitalar (+11,9%); Urbanismo recua 13,5%.",
			},
			{
				sev: "warn",
				titulo: "Previdência cresce 13,5% — acima da média",
				det: "De R$ 31,2 mi para R$ 35,4 mi; acompanhar impacto da curva de aposentadorias no médio prazo.",
			},
		],
		emDia: [
			["Educação +5,4%", "vs 2025"],
			["Administração +8,2%", "vs 2025"],
			["Urbanismo −13,5%", "vs 2025"],
		],
	},
	"/receita": {
		itens: [
			{
				sev: "warn",
				titulo: "Dependência de transferências em 61,9%",
				det: "Autonomia própria de 38,1% — exposição a oscilações de FPM e ICMS; fortalecer receita própria.",
			},
			{
				sev: "warn",
				titulo: "Dívida ativa rende R$ 7,8 mi frente a estoque de R$ 224,5 mi",
				det: "Recuperação de 3,8% — reforçar cobrança administrativa e protesto (ver Tributação).",
			},
			{
				sev: "info",
				titulo: "Arrecadação em 51,1% da previsão no 6º mês",
				det: "R$ 462,4 mi de R$ 905,0 mi previstos — realização aderente à sazonalidade.",
			},
			{
				sev: "info",
				titulo: "FPM e ICMS na média esperada",
				det: "FPM em 51,1% (R$ 96,0/188,0 mi) e cota-parte ICMS em 51,2% (R$ 88,0/172,0 mi) do previsto.",
			},
		],
		emDia: [
			["ISS 51,1%", "da previsão ✓"],
			["IPTU 49,4%", "da previsão ✓"],
			["FUNDEB 51,0%", "da previsão ✓"],
		],
	},
	"/receita-comp": {
		itens: [
			{
				sev: "info",
				titulo: "Arrecadação cresce 7,0% sobre 2025",
				det: "De R$ 432,0 mi para R$ 462,4 mi; alta acumulada de 28,4% desde 2022 (R$ 360,0 mi).",
			},
			{
				sev: "info",
				titulo: "Receita tributária avança 11,8% — autonomia em alta",
				det: "De R$ 106,0 mi para R$ 118,5 mi, com ITBI +21,7% e ISS +10,8% — tributária cresce mais que transferências (+5,3%).",
			},
			{
				sev: "warn",
				titulo: "Outras Receitas Correntes recuam 9,3%",
				det: "De R$ 21,5 mi para R$ 19,5 mi — identificar origem da queda (multas, indenizações, restituições).",
			},
		],
		emDia: [
			["ISS +10,8%", "vs 2025"],
			["IPTU +10,0%", "vs 2025"],
			["ITBI +21,7%", "vs 2025"],
			["Patrimonial +21,1%", "vs 2025"],
		],
	},
	"/financeiro": {
		itens: [
			{
				sev: "warn",
				titulo: "R$ 28,3 mi de retenções a repassar",
				det: "Extraorçamentário retido de R$ 48,5 mi contra R$ 20,2 mi recolhidos (INSS, IRRF, FGTS, consignações) — evitar encargos por atraso.",
			},
			{
				sev: "info",
				titulo: "Liquidez imediata de 2,4×",
				det: "Disponibilidade bruta de R$ 142,0 mi cobre 2,4 vezes as obrigações de R$ 58,5 mi.",
			},
			{
				sev: "info",
				titulo: "Fluxo de caixa positivo em R$ 84,1 mi no ano",
				det: "Ingressos de R$ 550,4 mi contra desembolsos de R$ 466,3 mi; saldo evolui de R$ 57,9 mi para R$ 142,0 mi.",
			},
			{
				sev: "info",
				titulo: "Aplicações de R$ 96,0 mi renderam R$ 4,2 mi",
				det: "67,6% da disponibilidade aplicada — manter mínimo em conta movimento.",
			},
		],
		emDia: [
			["RP a pagar 30,2", "cobertos pelo caixa ✓"],
			["Fontes vinculadas", "com saldo ✓"],
			["Folha do mês", "paga em dia ✓"],
		],
	},
	"/tributacao": {
		itens: [
			{
				sev: "crit",
				titulo: "Adimplência do IPTU em 47,0%",
				det: "Lançados R$ 82,0 mi e arrecadados R$ 38,5 mi; inadimplência vencida de R$ 18,0 mi — intensificar cobrança no 2º semestre.",
			},
			{
				sev: "warn",
				titulo: "Dívida ativa com recuperação de 3,8%",
				det: "Estoque de R$ 224,5 mi e apenas 38% do IPTU ajuizado — ampliar protesto extrajudicial e execução fiscal.",
			},
			{
				sev: "warn",
				titulo: "Renúncia fiscal de R$ 9,8 mi",
				det: "8,3% da receita própria em isenções, imunidades e REFIS — exigir estimativa e compensação na LDO (LRF art. 14).",
			},
			{
				sev: "info",
				titulo: "ISS cresce 10,8% no ano",
				det: "Puxado por serviços de saúde (R$ 9,2 mi) e construção civil (R$ 7,8 mi) — acompanhar setores em expansão.",
			},
		],
		emDia: [
			["ITBI 940", "transmissões ✓"],
			["COSIP 97,6%", "de adimplência ✓"],
			["Cota única 34%", "de adesão"],
		],
	},
	"/folha": {
		itens: [
			{
				sev: "warn",
				titulo: "Pessoal/RCL em 49,2% — acima do alerta (48,6%)",
				det: "Margem de R$ 49,0 mi (4,8 p.p.) até o limite de 54%; congelar expansões não essenciais se atingir o prudencial (51,3%).",
			},
			{
				sev: "warn",
				titulo: "Horas extras sobem 26% desde janeiro",
				det: "De R$ 0,95 mi para R$ 1,2 mi/mês; Saúde concentra R$ 0,52 mi — avaliar escala e banco de horas.",
			},
			{
				sev: "info",
				titulo: "Custo total de R$ 35,3 mi (+0,9% no mês)",
				det: "Custo médio de R$ 7,3 mil por servidor; encargos estáveis em R$ 6,8 mi.",
			},
			{
				sev: "info",
				titulo: "Inativos custam R$ 9,5 mi/mês",
				det: "1.920 beneficiários (28,4% do quadro total) — pressão crescente com a curva de elegíveis (ver People).",
			},
		],
		emDia: [
			["Efetivos 76,6%", "da folha ✓"],
			["Comissionados 11,9%", "da folha"],
			["Margem LRF 4,8 p.p.", "até o limite"],
		],
	},
	"/people": {
		itens: [
			{
				sev: "warn",
				titulo: "410 servidores elegíveis à aposentadoria hoje (8,5%)",
				det: "Curva chega a 1.190 em 2031; Professor tem 32,5% do cargo elegível em 5 anos — planejar concursos e sucessão.",
			},
			{
				sev: "warn",
				titulo: "Absenteísmo em 4,1%",
				det: "Licença saúde lidera com 4.200 dias — estruturar programa de saúde ocupacional.",
			},
			{
				sev: "info",
				titulo: "Cobertura de cargos em 86,6%",
				det: "4.850 providos de 5.600 autorizados; Saúde opera com 100 temporários — priorizar reposição efetiva.",
			},
			{
				sev: "info",
				titulo: "Quadro maduro: idade média 44,6 anos",
				det: "Tempo médio de serviço de 11,8 anos e turnover de 6,2% — estabilidade alta, renovação lenta.",
			},
		],
		emDia: [
			["Comissionados 13,6%", "razão sobre efetivos"],
			["Superior + pós 56,7%", "escolaridade ✓"],
			["Turnover 6,2%", "estável ✓"],
		],
	},
	"/licitacoes": {
		itens: [
			{
				sev: "warn",
				titulo: "8,2% de certames desertos ou fracassados",
				det: "Tratores e telemedicina sem propostas — revisar especificações e preços de referência antes de republicar.",
			},
			{
				sev: "warn",
				titulo: "Concorrências lentas: 72 dias e 78% de sucesso",
				det: "Construção de creche há 58 dias em habilitação — risco ao cronograma de obras com recursos vinculados.",
			},
			{
				sev: "info",
				titulo: "Economia de 15,7% (R$ 26,5 mi) sobre o estimado",
				det: "Pregão eletrônico rende 18,8% de economia média com 4,3 fornecedores por certame.",
			},
			{
				sev: "info",
				titulo: "ME/EPP locais levam R$ 38,5 mi (27,1%)",
				det: "64 certames com disputa exclusiva/cota (LC 123) — efeito distributivo na economia municipal.",
			},
		],
		emDia: [
			["PNCP 178", "publicações no prazo ✓"],
			["Sucesso 88,4%", "dos certames ✓"],
			["Tempo médio 32 dias", "pregão ✓"],
		],
	},
	"/contratos": {
		itens: [
			{
				sev: "crit",
				titulo: "5 contratos vencidos com saldo de R$ 3,2 mi",
				det: "Execução sem cobertura contratual é irregular — encerrar, apostilar ou licitar imediatamente.",
			},
			{
				sev: "warn",
				titulo: "18 contratos vencem em 90 dias (R$ 42,0 mi)",
				det: "Pavimentação (23 dias) e combustíveis (30 dias) primeiro — iniciar renovações para evitar emergencial.",
			},
			{
				sev: "warn",
				titulo: "Aditivos próximos do limite legal",
				det: "CT-2025/012 acumula 41% (teto 50% p/ reforma) e CT-2024/045 23,6% (teto 25%) — novas necessidades exigem nova licitação.",
			},
			{
				sev: "info",
				titulo: "Top 5 fornecedores concentram 35,3% da carteira",
				det: "Construtora Aurora com 12,2% em 3 contratos — monitorar dependência e desempenho.",
			},
		],
		emDia: [
			["Aditivos 8,5%", "sobre o original ✓"],
			["Execução 54,0%", "da carteira ✓"],
			["248 vigentes", "sob gestão"],
		],
	},
	"/tce": {
		itens: [
			{
				sev: "crit",
				titulo: "RREO do Município não atendido no bimestre",
				det: "Declaração de publicidade pendente na Agenda de Obrigações — regularizar antes do fechamento para evitar apontamento.",
			},
			{
				sev: "warn",
				titulo: "Certidão Liberatória vence em 27 dias (17/07/2026)",
				det: "Sem renovação, o município fica impedido de receber transferências voluntárias estaduais.",
			},
			{
				sev: "info",
				titulo: "Agenda de Obrigações: 17 em dia de 18 aplicáveis",
				det: "3 entidades monitoradas; única pendência é o RREO do Município.",
			},
			{
				sev: "info",
				titulo: "Contas 2025 entregues no prazo e em análise",
				det: "Histórico 2021–2024 aprovado (2023 com ressalvas) — manter tempestividade de 100%.",
			},
		],
		emDia: [
			["SIM-AM", "remessas em dia ✓"],
			["Multas e ressarcimentos", "adimplente ✓"],
			["PCA 100%", "tempestividade ✓"],
		],
	},
	"/siconfi": {
		itens: [
			{
				sev: "crit",
				titulo: "CRP previdenciário irregular — CAUC pendente",
				det: "Bloqueia transferências voluntárias e convênios com a União; regularizar o RPPS junto à SPREV.",
			},
			{
				sev: "warn",
				titulo: "MSC de junho/2026 pendente",
				det: "Remessa mensal em atraso alimenta RREO, RGF e DCA — enviar para não travar as declarações derivadas.",
			},
			{
				sev: "warn",
				titulo: "RGF com pendência de envio no CAUC",
				det: "2 dos 13 itens do CAUC irregulares (CRP e RGF) — o restante está adimplente.",
			},
			{
				sev: "info",
				titulo: "Remessas de janeiro a maio enviadas",
				det: "Consistência de 100% exceto março (98%) — qualidade da informação contábil sob controle.",
			},
		],
		emDia: [
			["DCA 2025", "homologada ✓"],
			["Saúde e Educação", "mínimos no CAUC ✓"],
			["CND / FGTS / CADIN", "regulares ✓"],
		],
	},
	"/financeiro-analises": {
		itens: [
			{
				sev: "crit",
				titulo: "Royalties/Compensações com saldo negativo (− R$ 0,8 mi)",
				det: "Fonte vinculada negativa indica uso de recurso de outra destinação — recompor antes do fechamento do RREO.",
			},
			{
				sev: "warn",
				titulo: "Conciliação bancária em 87,5% (42/48 contas)",
				det: "6 divergências somando R$ 2,4 mi; a maior (R$ 1,1 mi, Itaú) está aberta há 12 dias.",
			},
			{
				sev: "warn",
				titulo: "Itaú rende 94,8% do CDI — abaixo das demais",
				det: "BB rende 100,2% e Caixa 98,4% — avaliar realocação dos R$ 15,0 mi aplicados.",
			},
			{
				sev: "info",
				titulo: "Rentabilidade média de 98,5% do CDI",
				det: "R$ 123,5 mi aplicados (87,0% da disponibilidade) com R$ 6,8 mi de rendimentos no ano.",
			},
		],
		emDia: [
			["Fontes principais", "com saldo ✓"],
			["Mov. completa 81,3%", "das contas"],
			["Aplicado 87,0%", "da disponibilidade ✓"],
		],
	},
};

export function AnalisesAlertas({ path }: { path: string }) {
	const { t } = useTheme();
	const bloco = AA[path];
	if (!bloco) return null;
	const tone = { crit: t.danger, warn: t.warn, info: t.primary };
	const nCrit = bloco.itens.filter((i) => i.sev === "crit").length;
	const nWarn = bloco.itens.filter((i) => i.sev === "warn").length;
	const resumo = [
		nCrit ? `${nCrit} crítico${nCrit > 1 ? "s" : ""}` : null,
		nWarn ? `${nWarn} atenção` : null,
	]
		.filter(Boolean)
		.join(" · ");
	return (
		<>
			<div className="h-6" />
			<Card className="p-5">
				<Title
					right={
						resumo ? (
							<span className="text-xs" style={{ color: t.mutedFg }}>
								{resumo}
							</span>
						) : undefined
					}
				>
					Análises e Alertas
				</Title>
				<div className="flex flex-col gap-2">
					{bloco.itens.map((it, i) => (
						<div
							key={i}
							className="rounded-lg flex flex-col sm:flex-row sm:items-center gap-2"
							style={{
								background: t.muted,
								padding: "11px 13px",
								borderLeft: `3px solid ${tone[it.sev]}`,
							}}
						>
							<div style={{ flex: 1 }}>
								<div
									className="text-xs font-semibold"
									style={{ color: t.foreground }}
								>
									{it.titulo}
								</div>
								<div className="text-xs mt-0.5" style={{ color: t.mutedFg }}>
									{it.det}
								</div>
							</div>
							{it.href && (
								<Link
									href={it.href}
									className="text-xs font-semibold rounded-md"
									style={{
										padding: "6px 12px",
										background: t.card,
										border: `1px solid ${t.border}`,
										color: tone[it.sev],
										textDecoration: "none",
										whiteSpace: "nowrap",
										alignSelf: "flex-start",
									}}
								>
									{it.acao} →
								</Link>
							)}
						</div>
					))}
				</div>
				<div className="flex flex-wrap gap-2 mt-3">
					{bloco.emDia.map(([a, b], i) => (
						<span
							key={i}
							className="text-xs rounded-full"
							style={{
								padding: "4px 12px",
								background: t.muted,
								color: t.mutedFg,
							}}
						>
							<b style={{ color: t.ok }}>{a}</b> · {b}
						</span>
					))}
				</div>
			</Card>
		</>
	);
}
