// Provedor de dados por tenant. Com API_URL busca do PostgREST (uma chamada por
// módulo, em paralelo); sem ela (dev/testes) ou se a API cair, cai no fallback
// embutido de data.ts. Os módulos leem via useData().
import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";
import { fetchModule } from "./api";
import {
	CD as CDseed,
	CON as CONseed,
	CR as CRseed,
	D as Dseed,
	FA as FAseed,
	FP as FPseed,
	F as Fseed,
	LIC as LICseed,
	PAN as PANseed,
	PA as PAseed,
	PC as PCseed,
	PLAN as PLANseed,
	R as Rseed,
	SEC as SECseed,
	TB as TBseed,
} from "./data";
import { API_URL } from "./tenant";
import type {
	Contratos,
	Despesa,
	DespesaComp,
	Financeiro,
	FinanceiroAnalises,
	Folha,
	Licitacoes,
	Panorama,
	People,
	Planejamento,
	PrestacaoContas,
	Receita,
	ReceitaComp,
	Secretarias,
	Tributacao,
} from "./types";

export interface TenantData {
	D: Despesa;
	CD: DespesaComp;
	R: Receita;
	CR: ReceitaComp;
	F: Financeiro;
	FA: FinanceiroAnalises;
	TB: Tributacao;
	FP: Folha;
	PA: People;
	LIC: Licitacoes;
	CON: Contratos;
	PLAN: Planejamento;
	PC: PrestacaoContas;
	PAN: Panorama;
	SEC: Secretarias;
}

const seed: TenantData = {
	D: Dseed,
	CD: CDseed,
	R: Rseed,
	CR: CRseed,
	F: Fseed,
	FA: FAseed,
	TB: TBseed,
	FP: FPseed,
	PA: PAseed,
	LIC: LICseed,
	CON: CONseed,
	PLAN: PLANseed,
	PC: PCseed,
	PAN: PANseed,
	SEC: SECseed,
};

const Ctx = createContext<TenantData>(seed);
export const useData = () => useContext(Ctx);

async function loadTenantData(): Promise<TenantData> {
	const [
		D,
		CD,
		R,
		CR,
		F,
		FA,
		TB,
		FP,
		PA,
		LIC,
		CON,
		PLAN,
		PAN,
		tce,
		siconfi,
		SEC,
	] = await Promise.all([
		fetchModule<Despesa>("despesa"),
		fetchModule<DespesaComp>("despesa_comp"),
		fetchModule<Receita>("receita"),
		fetchModule<ReceitaComp>("receita_comp"),
		fetchModule<Financeiro>("financeiro"),
		fetchModule<FinanceiroAnalises>("financeiro_analises"),
		fetchModule<Tributacao>("tributacao"),
		fetchModule<Folha>("folha"),
		fetchModule<People>("people"),
		fetchModule<Licitacoes>("licitacoes"),
		fetchModule<Contratos>("contratos"),
		fetchModule<Planejamento>("planejamento"),
		fetchModule<Panorama>("panorama"),
		fetchModule<PrestacaoContas["tce"]>("tce"),
		fetchModule<PrestacaoContas["siconfi"]>("siconfi"),
		// Módulo novo: se a view api.secretarias ainda não existir no tenant
		// (migração não aplicada), cai no seed sem derrubar os demais módulos.
		fetchModule<Secretarias>("secretarias").catch(() => SECseed),
	]);
	return {
		D,
		CD,
		R,
		CR,
		F,
		FA,
		TB,
		FP,
		PA,
		LIC,
		CON,
		PLAN,
		PAN,
		PC: { tce, siconfi },
		SEC,
	};
}

export function DataProvider({ children }: { children: ReactNode }) {
	// Sem API_URL já entra com o seed (render síncrono — não quebra testes).
	const [data, setData] = useState<TenantData | null>(API_URL ? null : seed);

	useEffect(() => {
		if (!API_URL) return;
		let cancel = false;
		loadTenantData()
			.then((d) => {
				if (!cancel) setData(d);
			})
			.catch((e) => {
				// API indisponível → segue com data.ts para não derrubar o painel.
				console.error("[DataProvider] API indisponível, usando data.ts:", e);
				if (!cancel) setData(seed);
			});
		return () => {
			cancel = true;
		};
	}, []);

	if (!data) {
		return (
			<div
				style={{
					minHeight: "100vh",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					fontFamily: "ui-sans-serif, system-ui, sans-serif",
					opacity: 0.6,
				}}
			>
				Carregando dados do município…
			</div>
		);
	}
	return <Ctx.Provider value={data}>{children}</Ctx.Provider>;
}
