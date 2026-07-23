import { Kpi } from "../../components";
import { useData } from "../../DataProvider";
import { brl, fmt, pct } from "../../format";
import { useTheme } from "../../theme";

// Bloco "Execução da Despesa" (8 KPIs) compartilhado por todas as secretarias.
// Cada secretaria tem seu próprio módulo (arquivo) e adiciona seus quadros
// específicos abaixo deste bloco (ou em outra aba) conforme a integração evolui.
export function ExecucaoDespesa({ slug }: { slug: string }) {
	const { SEC } = useData();
	const { t } = useTheme();
	const D = SEC[slug];

	if (!D) return null;

	return (
		<>
			<div className="flex items-center gap-3 mb-3">
				<div
					className="rounded-lg flex items-center justify-center text-xs font-bold"
					style={{
						width: 26,
						height: 26,
						background: t.primary,
						color: t.primaryFg,
						flexShrink: 0,
					}}
				>
					1
				</div>
				<div>
					<h3 className="text-sm font-semibold" style={{ color: t.foreground }}>
						Execução da Despesa
					</h3>
					<div className="text-xs" style={{ color: t.mutedFg }}>
						Dotação, empenho, liquidação e pagamento no exercício.
					</div>
				</div>
			</div>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
				<Kpi
					label="Dotação Atualizada"
					value={brl(D.dotacao)}
					sub={`Inicial ${fmt(D.inicial)} · Créditos +${fmt(D.creditos)}`}
				/>
				<Kpi
					label="Empenhado"
					value={brl(D.emp)}
					accent={t.primary}
					progress={(D.emp / D.dotacao) * 100}
					sub={`${pct((D.emp / D.dotacao) * 100)} da dotação`}
				/>
				<Kpi
					label="Liquidado"
					value={brl(D.liq)}
					progress={(D.liq / D.emp) * 100}
					sub={`${pct((D.liq / D.emp) * 100)} do empenhado`}
				/>
				<Kpi
					label="Pago"
					value={brl(D.pago)}
					progress={(D.pago / D.liq) * 100}
					sub={`${pct((D.pago / D.liq) * 100)} do liquidado`}
				/>
				<Kpi
					label="Saldo a Empenhar"
					value={brl(D.saldo)}
					sub={`${pct((D.saldo / D.dotacao) * 100)} disponível`}
				/>
				<Kpi
					label="Saldo a Liquidar"
					value={brl(D.emp - D.liq)}
					sub={`${pct(((D.emp - D.liq) / D.emp) * 100)} do empenhado`}
				/>
				<Kpi
					label="Saldo a Pagar"
					value={brl(D.liq - D.pago)}
					sub={`${pct(((D.liq - D.pago) / D.liq) * 100)} do liquidado`}
				/>
				<Kpi
					label="Restos a Pagar"
					value={brl(D.restos)}
					sub="Proc. 41,2 · N/Proc. 54,2"
				/>
			</div>
		</>
	);
}
