import React from "react";
import { useTheme } from "../theme";
import { Card, Title, Delta, KpiCmp, GroupedBars, Diverging, LegendDot, TreeCmp } from "../components";
import { vari } from "../format";
import { CD } from "../data";

export default function DespesaComparativoModule() {
  const { t, prev, cur } = useTheme();
  const fv = CD.func.map(([n, a, b]) => ({ nome: n, ...vari(a, b) })).sort((x, y) => y.p - x.p);
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
        <KpiCmp label="Empenhado" a={CD.emp25} b={CD.emp26} accent={t.primary} />
        <KpiCmp label="Liquidado" a={CD.liq25} b={CD.liq26} />
        <KpiCmp label="Pago" a={CD.pago25} b={CD.pago26} />
        <Card className="p-4"><div className="text-xs uppercase tracking-wider mb-1" style={{ color: t.mutedFg }}>Maior alta · função</div><div className="text-sm font-bold" style={{ color: t.foreground }}>{fv[0].nome}</div><div className="mt-2 text-sm"><Delta {...fv[0]} /></div></Card>
        <Card className="p-4"><div className="text-xs uppercase tracking-wider mb-1" style={{ color: t.mutedFg }}>Maior queda · função</div><div className="text-sm font-bold" style={{ color: t.foreground }}>{fv[fv.length - 1].nome}</div><div className="mt-2 text-sm"><Delta {...fv[fv.length - 1]} /></div></Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Card className="p-5 lg:col-span-2"><Title right={<div className="flex gap-4 text-xs"><LegendDot color={prev}>2025</LegendDot><LegendDot color={cur}>2026</LegendDot></div>}>Empenhado por mês — 2025 × 2026</Title><GroupedBars data={CD.meses.map(([mes, a, b]) => ({ mes, a2025: a, a2026: b }))} height={250} /></Card>
        <Card className="p-5"><Title>Variação YoY por Função (%)</Title><Diverging data={fv} height={250} ylabel={96} /></Card>
      </div>
      <Card className="p-5 mb-4"><Title>Execução por Função › Subfunção › Programa › Ação</Title><TreeCmp nodes={CD.arvore} level0="Função" totalLabel="Total Empenhado" tot25={CD.emp25} tot26={CD.emp26} /></Card>
    </>
  );
}

