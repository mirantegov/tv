import React from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { useTheme } from "../theme";
import { Card, Title, Delta, Tip, KpiCmp, GroupedBars, Diverging, LegendDot, TreeCmp } from "../components";
import { dP, vari } from "../format";
import { CR } from "../data";

export default function ReceitaComparativoModule() {
  const { t, prev, cur } = useTheme();
  const ov = CR.origem.map(([n, a, b]) => ({ nome: n, ...vari(a, b) })).sort((x, y) => y.p - x.p);
  const cagr = (Math.pow(462.4 / 360, 1 / 4) - 1) * 100;
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
        <KpiCmp label="Arrecadada (total)" a={CR.arr25} b={CR.arr26} accent={t.primary} />
        <KpiCmp label="Receita Tributária" a={CR.trib25} b={CR.trib26} />
        <KpiCmp label="Transferências" a={CR.transf25} b={CR.transf26} />
        <Card className="p-4"><div className="text-xs uppercase tracking-wider mb-1" style={{ color: t.mutedFg }}>Maior alta · origem</div><div className="text-sm font-bold" style={{ color: t.foreground }}>{ov[0].nome}</div><div className="mt-2 text-sm"><Delta {...ov[0]} /></div></Card>
        <Card className="p-4"><div className="text-xs uppercase tracking-wider mb-1" style={{ color: t.mutedFg }}>Maior queda · origem</div><div className="text-sm font-bold" style={{ color: t.foreground }}>{ov[ov.length - 1].nome}</div><div className="mt-2 text-sm"><Delta {...ov[ov.length - 1]} /></div></Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Card className="p-5 lg:col-span-2">
          <Title right={<span className="text-xs" style={{ color: t.mutedFg }}>Acum. Jan–Jun por exercício</span>}>Evolução da Arrecadação (2022–2026)</Title>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CR.evol.map(([ano, v]) => ({ ano, Arrecadada: v }))} margin={{ top: 6, right: 10, left: -10, bottom: 0 }}>
                <defs><linearGradient id="gr" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={cur} stopOpacity={0.4} /><stop offset="100%" stopColor={cur} stopOpacity={0.03} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke={t.border} vertical={false} />
                <XAxis dataKey="ano" tick={{ fontSize: 11, fill: t.mutedFg }} axisLine={{ stroke: t.border }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: t.mutedFg }} axisLine={false} tickLine={false} width={42} domain={[300, "auto"]} />
                <Tooltip content={<Tip />} />
                <Area type="monotone" dataKey="Arrecadada" stroke={cur} strokeWidth={2.5} fill="url(#gr)" dot={{ r: 3, fill: cur }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-5 flex flex-col justify-center gap-4">
          <div><div className="text-xs uppercase tracking-wider" style={{ color: t.mutedFg }}>Crescimento médio</div><div className="text-2xl font-bold tabular-nums" style={{ color: t.primary }}>{dP(cagr)} <span className="text-sm" style={{ color: t.mutedFg }}>a.a.</span></div></div>
          <div><div className="text-xs uppercase tracking-wider" style={{ color: t.mutedFg }}>Acumulado 5 exercícios</div><div className="text-2xl font-bold tabular-nums" style={{ color: t.ok }}>{dP((462.4 / 360 - 1) * 100)}</div><div className="text-xs tabular-nums mt-1" style={{ color: t.mutedFg }}>R$ 360,0 → 462,4 mi</div></div>
          <div><div className="text-xs uppercase tracking-wider" style={{ color: t.mutedFg }}>2026 vs 2025</div><div className="text-lg font-bold"><Delta {...vari(CR.arr25, CR.arr26)} /></div></div>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Card className="p-5 lg:col-span-2"><Title right={<div className="flex gap-4 text-xs"><LegendDot color={prev}>2025</LegendDot><LegendDot color={cur}>2026</LegendDot></div>}>Arrecadação por mês — 2025 × 2026</Title><GroupedBars data={CR.meses.map(([mes, a, b]) => ({ mes, a2025: a, a2026: b }))} height={240} /></Card>
        <Card className="p-5"><Title>Variação YoY por Origem (%)</Title><Diverging data={ov} height={240} ylabel={110} /></Card>
      </div>
      <Card className="p-5 mb-4"><Title>Arrecadação por Categoria › Origem › Espécie</Title><TreeCmp nodes={CR.arvore} level0="Categoria" totalLabel="Receita Bruta Arrecadada" tot25={CR.arr25} tot26={CR.arr26} /></Card>
    </>
  );
}

