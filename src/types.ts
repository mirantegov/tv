/* ============================================================================
   types.ts — modelo de dados dos painéis (derivado do schema `orcamento`)
   Tuplas nomeadas espelham a ordem das colunas retornadas pelas 118 views.
   ============================================================================ */

/** Par rótulo → valor (usado em donuts, barras e listas simples). */
export type LabelValue = [label: string, value: number];
export type Tone = "ok" | "warn" | "danger" | "info" | "muted" | string;

/** Nó de árvore comparativa (v25 vs v26) — despesa/receita por função/natureza. */
export interface TreeCmpNode {
	id: string;
	nome: string;
	v25: number;
	v26: number;
	children?: TreeCmpNode[];
}

/** Nó de árvore de receita (previsto vs realizado). */
export interface TreeReceitaNode {
	id: string;
	nome: string;
	prev: number;
	real: number;
	children?: TreeReceitaNode[];
}

/* ------------------------------- Despesa -------------------------------- */
export interface Despesa {
	dotacao: number;
	inicial: number;
	creditos: number;
	emp: number;
	liq: number;
	pago: number;
	restos: number;
	saldo: number;
	funcoes: [
		nome: string,
		dotacao: number,
		empenhado: number,
		liquidado: number,
	][];
	gnd: LabelValue[];
	meses: [mes: string, empenhado: number, liquidado: number, pago: number][];
	orgaos: [
		nome: string,
		dotacao: number,
		empenhado: number,
		liquidado: number,
	][];
	gov: [
		nome: string,
		valor: number,
		scale: number,
		limite: number,
		label: string,
		alerta: number | null,
		tone: Tone,
	][];
}

export interface DespesaComp {
	emp25: number;
	emp26: number;
	liq25: number;
	liq26: number;
	pago25: number;
	pago26: number;
	meses: [mes: string, v25: number, v26: number][];
	func: [nome: string, v25: number, v26: number][];
	arvore: TreeCmpNode[];
}

/* ------------------------------- Receita -------------------------------- */
export interface Receita {
	prev: number;
	bruta: number;
	ded: number;
	liq: number;
	propria: number;
	transf: number;
	divida: number;
	mensal: [
		mes: string,
		acumulado: number,
		meta: number,
		ant: number,
		atual: number,
	][];
	origem: LabelValue[];
	transfDet: LabelValue[];
	tributos: LabelValue[];
	natureza: TreeReceitaNode[];
	saude: [
		codigo: string,
		descricao: string,
		valor: number,
		destaque: boolean,
	][];
	educ: [codigo: string, descricao: string, valor: number, destaque: boolean][];
}

export interface ReceitaComp {
	arr25: number;
	arr26: number;
	trib25: number;
	trib26: number;
	transf25: number;
	transf26: number;
	evol: LabelValue[];
	meses: [mes: string, v25: number, v26: number][];
	origem: [nome: string, v25: number, v26: number][];
	arvore: TreeCmpNode[];
}

/* ----------------------------- Financeiro ------------------------------- */
export interface Financeiro {
	anterior: number;
	bruta: number;
	obrig: number;
	liquida: number;
	ingressos: number;
	desembolsos: number;
	resultado: number;
	aplicacoes: number;
	rendimento: number;
	liquidez: number;
	fontes: [
		nome: string,
		vinculada: boolean,
		bruta: number,
		obrigacoes: number,
		rp: number,
	][];
	fluxo: [mes: string, ingressos: number, desembolsos: number][];
	evol: [mes: string, saldoAcum: number, disponivel: number][];
	bancos: LabelValue[];
	obrigacoes: LabelValue[];
	pagamentos: LabelValue[];
	extra: [nome: string, retido: number, recolhido: number][];
}

/* ----------------------------- Tributação ------------------------------- */
export interface Tributacao {
	propria: number;
	propriaPart: number;
	iptuLanc: number;
	iptuArr: number;
	iptuAdimp: number;
	issArr: number;
	issYoY: number;
	itbiArr: number;
	itbiTransm: number;
	daSaldo: number;
	daRecPct: number;
	inadVencida: number;
	renuncia: number;
	cotaUnica: number;
	tributos: [
		nome: string,
		lancado: number,
		arrecadado: number,
		inadimplencia: number,
		recuperado: number,
	][];
	da: [
		nome: string,
		saldoInicial: number,
		inscricoes: number,
		recuperado: number,
		cancelado: number,
		ajuizPct: number,
	][];
	meses: [mes: string, iptu: number, iss: number, itbi: number][];
	setores: LabelValue[];
	bairros: [bairro: string, arrecadado: number, inadimplencia: number][];
	devedores: [nome: string, tributo: string, situacao: string, valor: number][];
	renuncias: [
		descricao: string,
		tributo: string,
		valor: number,
		base: string,
	][];
}

/* -------------------------------- Folha --------------------------------- */
export interface FolhaLRF {
	pct: number;
	bruta12: number;
	deducoes: number;
	liquida12: number;
	rcl12: number;
	alerta: number;
	prudencial: number;
	limite: number;
	margemRs: number;
	margemPp: number;
}
export interface Folha {
	custoTotal: number;
	custoMesAnt: number;
	bruta: number;
	liquida: number;
	encargos: number;
	he: number;
	hePct: number;
	adicionais: number;
	custoMedio: string;
	headcount: number;
	inativos: number;
	inativosCusto: number;
	lrf: FolhaLRF;
	evol: [mes: string, bruta: number, liquida: number, encargos: number][];
	composicao: LabelValue[];
	vinculo: LabelValue[];
	heOrgao: LabelValue[];
	heTrend: LabelValue[];
	adic: LabelValue[];
	cargos: LabelValue[];
	orgaos: [
		orgao: string,
		servidores: number,
		bruta: number,
		encargos: number,
		custo: number,
		he: number,
		adicionais: number,
	][];
	adicDet: [tipo: string, beneficiarios: number, valor: number][];
}

/* ------------------------------- People --------------------------------- */
export interface People {
	headcount: number;
	total: number;
	inativos: number;
	turnover: number;
	absenteismo: number;
	tempoMedio: number;
	elegiveis: number;
	elegiveisPct: number;
	idadeMedia: number;
	cobertura: number;
	providos: number;
	autorizados: number;
	razaoCom: number;
	piramide: [faixa: string, masculino: number, feminino: number][];
	orgaos: LabelValue[];
	vinculo: LabelValue[];
	mov: [mes: string, admissoes: number, desligamentos: number][];
	absent: LabelValue[];
	tempo: LabelValue[];
	escolaridade: LabelValue[];
	elegCurva: LabelValue[];
	quadro: [
		orgao: string,
		headcount: number,
		efetivos: number,
		comissionados: number,
		temporarios: number,
		vagas: number,
		idadeMedia: number,
	][];
	sucessao: [carreira: string, hoje: number, cinco: number, pctCargo: number][];
}

/* ----------------------------- Licitações ------------------------------- */
export interface Licitacoes {
	homologado: number;
	processos: number;
	estimado: number;
	economia: number;
	economiaPct: number;
	taxaSucesso: number;
	tempoMedio: number;
	andamento: number;
	andamentoValor: number;
	diretaPct: number;
	desertosPct: number;
	fornMedia: number;
	meepp: LabelValue[];
	meeppExclusivos: number;
	pncp: { noPrazo: number; foraPrazo: number; pendentes: number };
	atas: [
		objeto: string,
		registrado: number,
		consumido: number,
		vencimento: string,
	][];
	mensal: [mes: string, estimado: number, homologado: number][];
	modalidade: [
		modalidade: string,
		qtde: number,
		estimado: number,
		homologado: number,
		economiaPct: number,
		tempoDias: number,
		taxaSucesso: number,
	][];
	funil: LabelValue[];
	situacao: LabelValue[];
	objeto: LabelValue[];
	pipeline: [
		processo: string,
		objeto: string,
		modalidade: string,
		orgao: string,
		estimado: number,
		situacao: string,
		dias: number,
	][];
	diretas: [
		artigo: string,
		objeto: string,
		fornecedor: string,
		valor: number,
	][];
	desertos: [objeto: string, modalidade: string, motivo: string][];
}

/* ------------------------------ Contratos ------------------------------- */
export interface Contratos {
	contratado: number;
	original: number;
	aditivos: number;
	aditivosPct: number;
	vigentes: number;
	executado: number;
	execPct: number;
	saldo: number;
	aVencer90: number;
	aVencer90Valor: number;
	vencidosSaldo: number;
	vencidosQtd: number;
	topFornPct: number;
	tipo: LabelValue[];
	fornecedores: LabelValue[];
	fonte: LabelValue[];
	orgaos: [orgao: string, executado: number, saldo: number][];
	vencimentos: LabelValue[];
	aditivosDet: [
		contrato: string,
		tipo: string,
		valorAditivo: number,
		pctAcum: number,
		limite: number,
	][];
	carteira: [
		contrato: string,
		objeto: string,
		fornecedor: string,
		orgao: string,
		original: number,
		aditivos: number,
		executado: number,
		dias: number,
	][];
	aVencer: [
		contrato: string,
		fornecedor: string,
		objeto: string,
		valor: number,
		dias: number,
	][];
	concentr: [
		fornecedor: string,
		nContratos: number,
		valor: number,
		pctCarteira: number,
	][];
}

/* ---------------------------- Planejamento ------------------------------ */
export interface PlanVinc {
	valor: number;
	pctOrc: number;
	limite: number;
	scale: number;
	base: string;
}
export interface PlanPref {
	receita: number;
	despesa: number;
	propria: number;
	transfCorr: number;
	capital: number;
	pessoal: number;
	investimentos: number;
	transferir: number;
	receitaOrigem: LabelValue[];
	despesaGrupo: LabelValue[];
	funcao: LabelValue[];
	repasses: LabelValue[];
	vinc: { pessoal: PlanVinc; saude: PlanVinc; educacao: PlanVinc };
}
export interface PlanCamara {
	receita: number;
	propria: number;
	despesa: number;
	folha: number;
	grupo: LabelValue[];
	folhaPct: number;
	folhaLimite: number;
	duodecimoPct: number;
	duodecimoBase: number;
	populacao: number;
	faixaIdx: number;
	faixas29A: LabelValue[];
}
export interface PlanPrev {
	recPrev: number;
	despPrev: number;
	resultado: number;
	recAdm: number;
	despAdm: number;
	recOrigem: LabelValue[];
	beneficios: LabelValue[];
}
export interface PlanSan {
	receita: number;
	despesa: number;
	resultado: number;
	investimentos: number;
	recOrigem: LabelValue[];
	grupo: LabelValue[];
}
export interface Planejamento {
	ano: number;
	consolidado: number;
	somaEntidades: number;
	intra: number;
	nEntidades: number;
	entidades: [
		nome: string,
		receita: number,
		despesa: number,
		propria: number,
		modelo: string,
	][];
	intraDet: LabelValue[];
	consolNatureza: LabelValue[];
	pref: PlanPref;
	camara: PlanCamara;
	prevTaxa: {
		despAdm: number;
		taxaAdmBase: number;
		taxaAdmPct: number;
		taxaAdmLimite: number;
	};
	prev: PlanPrev;
	san: PlanSan;
}

/* ------------------------ Prestação de Contas --------------------------- */
export interface PrestacaoContas {
	tce: {
		agenda: {
			kpis: {
				emDia: number;
				naoAtendido: number;
				naoAplicavel: number;
				entidades: number;
			};
			local: string;
			periodo: string;
			colunas: [sigla: string, descricao: string][];
			matriz: [entidade: string, status: string[]][];
		};
		certidao: {
			kpis: {
				situacao: string;
				validade: string;
				pendencias: number;
				tipo: string;
			};
			numero: string;
			emissao: string;
			vencimento: string;
			finalidade: string;
			itens: [descricao: string, tone: Tone][];
		};
		contas: {
			kpis: {
				exercicio: string;
				parecer: string;
				entrega: string;
				tempestividade: string;
			};
			historico: [
				exercicio: string,
				entrega: string,
				parecerTCE: string,
				julgamento: string,
				tone: Tone,
			][];
		};
	};
	siconfi: {
		cauc: {
			kpis: {
				regulares: number;
				total: number;
				pendentes: number;
				situacao: string;
				verificacao: string;
			};
			itens: [exigencia: string, tone: Tone][];
		};
		msc: {
			kpis: {
				competencia: string;
				status: string;
				consistencia: string;
				derivadas: string;
			};
			remessas: [
				competencia: string,
				envio: string,
				status: string,
				consistencia: string,
				tone: Tone,
			][];
			declaracoes: [declaracao: string, situacao: string, tone: Tone][];
		};
	};
}

/* ----------------------- Financeiro — Análises -------------------------- */
export interface FinanceiroAnalises {
	disp: number;
	movimento: number;
	aplicado: number;
	rendimentosYtd: number;
	rentabCdi: number;
	contas: number;
	conciliadas: number;
	concPct: number;
	divergencias: number;
	divergValor: number;
	movCompleta: number;
	movCompletaPct: number;
	fontesNegativas: number;
	fontes: [fonte: string, saldo: number, obrigacoes: number, tone: Tone][];
	invTipo: LabelValue[];
	rendMensal: LabelValue[];
	invInst: [
		instituicao: string,
		aplicado: number,
		rentabCdi: number,
		tone: Tone,
	][];
	bancos: [
		banco: string,
		contas: number,
		movimento: number,
		aplicado: number,
		conciliadas: number,
	][];
	pendencias: [
		conta: string,
		banco: string,
		difValor: number,
		motivo: string,
		dias: number,
	][];
	movMatriz: [
		grupo: string,
		total: number,
		receitaOk: number,
		aplicacaoOk: number,
		resgateOk: number,
	][];
}

/* ------------------------------ Panorama -------------------------------- */
export interface PanIndicador {
	v: string;
	ano: number;
	ibge?: boolean;
}
export interface Panorama {
	municipio: string;
	uf: string;
	gentilico: string;
	codigo: string;
	populacao: {
		censo: PanIndicador;
		estimada: PanIndicador;
		densidade: PanIndicador;
		rankUf: string;
	};
	trabalho: {
		salarioMedio: PanIndicador;
		ocupado: PanIndicador;
		ocupadaPct: PanIndicador;
		meioSM: PanIndicador;
	};
	educacao: {
		escolarizacao: PanIndicador;
		idebIniciais: PanIndicador;
		idebFinais: PanIndicador;
		matFund: PanIndicador;
		matMedio: PanIndicador;
		docFund: PanIndicador;
		escolas: PanIndicador;
	};
	economia: {
		pibPerCapita: PanIndicador;
		receitas: PanIndicador;
		despesas: PanIndicador;
		fontesExternasPct: PanIndicador;
		rankPibUf: string;
	};
	saude: {
		mortInfantil: PanIndicador;
		diarreia: PanIndicador;
		estabSus: PanIndicador;
	};
	territorio: {
		area: PanIndicador;
		esgoto: PanIndicador;
		arborizacao: PanIndicador;
		viasUrb: PanIndicador;
		bioma: string;
		hierarquia: string;
	};
	idhm: { v: string; ano: number; ibge?: boolean; faixa: string };
}
