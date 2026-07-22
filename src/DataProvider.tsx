// Provedor de dados por tenant. Com API_URL busca do PostgREST; sem ela (dev,
// testes, ou API fora do ar) cai no fallback embutido de data.ts. Os módulos
// migrados leem via useData(); os demais seguem importando de data.ts direto.
import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";
import { fetchModule } from "./api";
import { D as Dseed, PC as PCseed } from "./data";
import { API_URL } from "./tenant";
import type { Despesa, PrestacaoContas } from "./types";

export interface TenantData {
	D: Despesa;
	PC: PrestacaoContas;
}

const seed: TenantData = { D: Dseed, PC: PCseed };
const Ctx = createContext<TenantData>(seed);
export const useData = () => useContext(Ctx);

export function DataProvider({ children }: { children: ReactNode }) {
	// Sem API_URL já entra com o seed (render síncrono — não quebra testes).
	const [data, setData] = useState<TenantData | null>(API_URL ? null : seed);

	useEffect(() => {
		if (!API_URL) return;
		let cancel = false;
		(async () => {
			try {
				const [D, tce, siconfi] = await Promise.all([
					fetchModule<Despesa>("despesa"),
					fetchModule<PrestacaoContas["tce"]>("tce"),
					fetchModule<PrestacaoContas["siconfi"]>("siconfi"),
				]);
				if (!cancel) setData({ D, PC: { tce, siconfi } });
			} catch (e) {
				// API indisponível → segue com data.ts para não derrubar o painel.
				console.error("[DataProvider] API indisponível, usando data.ts:", e);
				if (!cancel) setData(seed);
			}
		})();
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
