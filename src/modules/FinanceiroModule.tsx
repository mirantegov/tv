import React from "react";
import { ResponsiveContainer, LineChart, Line, ComposedChart, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { useTheme } from "../theme";
import { Card, Title, Tip, Kpi, Donut, HBar, LegendDot } from "../components";
import { fmt, brl, dR } from "../format";
import { F } from "../data";

export default function FinanceiroModule() {
  const { t, cats, prev, cur } = useTheme();
  const insuf = F.fontes.map(([n, , b, o, rp]) => ({ nome: n, liquida: b - o, suf: b - o - rp })).filter((x) => x.suf < 0);
  const totBruta = F.fontes.reduce((s, f) => s + f[2], 0);
  const totObrig = F.fontes.reduce((s, f) => s + f[3], 0);
  const totRp = F.fontes.reduce((s, f) => s + f[4], 0);
  const totSuf = F.fontes.reduce((s, f) => s + (f[2] - f[3] - f[4]), 0);
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <Kpi label="Disponibilidade Bruta" value={brl(F.bruta)} sub="Caixa + Bancos + Aplicações" />
        <Kpi label="Disponibilidade Líquida" value={brl(F.liquida)} accent={t.primary} sub="Após obrigações financeiras" />
        <Kpi label="Ingressos do período" value={brl(F.ingressos)} sub="Orçamentário + extraorçamentário" />
        <Kpi label="Desembolsos do período" value={brl(F.desembolsos)} sub="Orçamentário + extraorçamentário" />
        <Kpi label="Resultado Financeiro" value={`+ ${brl(F.resultado)}`} accent={t.ok} sub="Ingressos − Desembolsos" />
        <Kpi label="Obrigações a Pagar" value={brl(F.obrig)} sub="RP proc. + consig. + depósitos" />
        <Kpi label="Aplicações Financeiras" value={brl(F.aplicacoes)} sub={`Rendimento + ${fmt(F.rendimento)} mi`} />
        <Kpi label="Liquidez Imediata" value={fmt(F.liquidez)} accent={t.ok} sub="Disp. bruta / obrigações" />
      </div>

      {insuf.length > 0 && (
        <div className="rounded-xl mb-4 flex items-center gap-3" style={{ background: t.card, border: `1px solid ${t.danger}`, padding: "12px 15px" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={t.danger} strokeWidth="2"><path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" strokeLinejoin="round" /></svg>
          <div className="text-sm" style={{ color: t.foreground }}>
            <b style={{ color: t.danger }}>{insuf.length} fonte com insuficiência financeira</b> — {insuf.map((x) => `${x.nome} (${dR(x.suf)} mi)`).join(", ")}. Vedado usar recursos de outra fonte para cobrir (LRF art. 50, I).
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Card className="p-5 lg:col-span-2">
          <Title right={<div className="flex gap-4 text-xs"><LegendDot color={cats[1]}>Ingressos</LegendDot><LegendDot color={t.warn}>Desembolsos</LegendDot><LegendDot color={cur}>Saldo acum.</LegendDot></div>}>Fluxo de caixa mensal</Title>
          <div style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={F.fluxo.map(([mes, ing, des], i) => ({ mes, Ingressos: ing, Desembolsos: des, Saldo: F.evol[i][1] }))} margin={{ top: 6, right: 8, left: -10, bottom: 0 }} barGap={3}>
                <CartesianGrid strokeDasharray="3 3" stroke={t.border} vertical={false} />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: t.mutedFg }} axisLine={{ stroke: t.border }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: t.mutedFg }} axisLine={false} tickLine={false} width={42} />
                <Tooltip content={<Tip />} cursor={{ fill: t.muted }} />
                <Bar dataKey="Ingressos" fill={cats[1]} radius={[3, 3, 0, 0]} />
                <Bar dataKey="Desembolsos" fill={t.warn} radius={[3, 3, 0, 0]} />
                <Line type="monotone" dataKey="Saldo" stroke={cur} strokeWidth={2.5} dot={{ r: 3, fill: cur }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-5">
          <Title right={<div className="flex gap-3 text-xs"><LegendDot color={cats[0]}>Bruta</LegendDot><LegendDot color={cats[3]}>Líquida</LegendDot></div>}>Evolução das disponibilidades</Title>
          <div style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={F.evol.map(([mes, b, l]) => ({ mes, Bruta: b, Líquida: l }))} margin={{ top: 6, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={t.border} vertical={false} />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: t.mutedFg }} axisLine={{ stroke: t.border }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: t.mutedFg }} axisLine={false} tickLine={false} width={42} />
                <Tooltip content={<Tip />} />
                <Line type="monotone" dataKey="Bruta" stroke={cats[0]} strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="Líquida" stroke={cats[3]} strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Card className="p-5">
          <Title>Disponibilidade Líquida por Fonte</Title>
          <div style={{ height: 230 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={F.fontes.map(([n, , b, o]) => ({ nome: n, valor: b - o }))} layout="vertical" margin={{ top: 0, right: 14, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={t.border} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: t.mutedFg }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="nome" tick={{ fontSize: 9.5, fill: t.foreground }} axisLine={false} tickLine={false} width={130} />
                <Tooltip content={<Tip />} cursor={{ fill: t.muted }} />
                <Bar dataKey="valor" name="Disp. líquida" radius={[0, 4, 4, 0]}>
                  {F.fontes.map((f, i) => <Cell key={i} fill={f[1] ? cats[3] : t.primary} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-5"><Title>Composição por Banco</Title><Donut data={F.bancos.map(([n, v]) => ({ nome: n, valor: v }))} height={210} /></Card>
        <Card className="p-5"><Title>Obrigações por Natureza</Title><HBar highlightFirst data={F.obrigacoes.map(([n, v]) => ({ nome: n, valor: v }))} height={150} ylabel={120} />
          <div className="mt-3"><Title>Pagamentos por tipo</Title><HBar data={F.pagamentos.map(([n, v]) => ({ nome: n, valor: v }))} height={150} ylabel={120} /></div>
        </Card>
      </div>

      {/* Anexo 5 — tabela central */}
      <Card className="p-5 mb-4">
        <Title right={<span className="text-xs" style={{ color: t.mutedFg }}>RGF · Anexo 5 · valores em R$ milhões</span>}>Demonstrativo da Disponibilidade de Caixa por Fonte de Recurso</Title>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ borderCollapse: "collapse", fontSize: 13 }}>
            <thead><tr style={{ color: t.mutedFg }}>
              <th className="text-left" style={{ padding: "8px 10px", fontWeight: 600 }}>Fonte de Recurso</th>
              <th className="text-right" style={{ padding: "8px 10px", fontWeight: 600 }}>Disp. Bruta</th>
              <th className="text-right" style={{ padding: "8px 10px", fontWeight: 600 }}>(−) Obrigações</th>
              <th className="text-right" style={{ padding: "8px 10px", fontWeight: 600 }}>= Disp. Líquida</th>
              <th className="text-right" style={{ padding: "8px 10px", fontWeight: 600 }}>RP a Pagar</th>
              <th className="text-right" style={{ padding: "8px 10px", fontWeight: 600 }}>Suf./(Insuf.)</th>
            </tr></thead>
            <tbody>
              {F.fontes.map(([nome, vinc, b, o, rp], i) => {
                const liq = b - o; const suf = liq - rp;
                return (
                  <tr key={i} style={{ borderTop: `1px solid ${t.border}` }}>
                    <td style={{ padding: "9px 10px", color: t.foreground, fontWeight: 500 }}>
                      {nome}{!vinc && <span className="text-xs rounded" style={{ marginLeft: 6, padding: "0 6px", background: t.accent, color: t.mutedFg, fontSize: 10 }}>livre</span>}
                    </td>
                    <td className="text-right tabular-nums" style={{ padding: "9px 10px", color: t.mutedFg }}>{fmt(b)}</td>
                    <td className="text-right tabular-nums" style={{ padding: "9px 10px", color: t.warn }}>− {fmt(o)}</td>
                    <td className="text-right tabular-nums" style={{ padding: "9px 10px", color: t.foreground, fontWeight: 600 }}>{fmt(liq)}</td>
                    <td className="text-right tabular-nums" style={{ padding: "9px 10px", color: t.mutedFg }}>{fmt(rp)}</td>
                    <td className="text-right tabular-nums" style={{ padding: "9px 10px", fontWeight: 700, color: suf < 0 ? t.danger : t.ok }}>{suf < 0 ? `(${fmt(Math.abs(suf))})` : fmt(suf)}</td>
                  </tr>
                );
              })}
              <tr style={{ borderTop: `2px solid ${t.border}` }}>
                <td style={{ padding: "9px 10px", fontWeight: 700 }}>Total</td>
                <td className="text-right tabular-nums" style={{ padding: "9px 10px", fontWeight: 700 }}>{fmt(totBruta)}</td>
                <td className="text-right tabular-nums" style={{ padding: "9px 10px", fontWeight: 700, color: t.warn }}>− {fmt(totObrig)}</td>
                <td className="text-right tabular-nums" style={{ padding: "9px 10px", fontWeight: 700, color: t.primary }}>{fmt(totBruta - totObrig)}</td>
                <td className="text-right tabular-nums" style={{ padding: "9px 10px", fontWeight: 700 }}>{fmt(totRp)}</td>
                <td className="text-right tabular-nums" style={{ padding: "9px 10px", fontWeight: 700, color: t.ok }}>{fmt(totSuf)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="text-xs mt-3" style={{ color: t.mutedFg }}>Suficiência apurada <b>por fonte</b>: o total positivo não compensa a insuficiência de uma fonte vinculada/livre específica.</div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <Title>Balanço Financeiro (resumo)</Title>
          <table className="w-full" style={{ borderCollapse: "collapse", fontSize: 13 }}>
            <tbody>
              {[["Saldo do exercício anterior", F.anterior, t.mutedFg],
                ["(+) Ingressos orçamentários", 462.4, t.foreground],
                ["(+) Ingressos extraorçamentários", 88.0, t.foreground],
                ["(−) Dispêndios orçamentários", -384.3, t.warn],
                ["(−) Dispêndios extraorçamentários", -82.0, t.warn]].map((r, i) => (
                <tr key={i} style={{ borderTop: i ? `1px solid ${t.border}` : "none" }}>
                  <td style={{ padding: "8px 4px", color: t.foreground }}>{r[0]}</td>
                  <td className="text-right tabular-nums" style={{ padding: "8px 4px", color: r[2] }}>{r[1] < 0 ? `− ${fmt(Math.abs(r[1]))}` : fmt(r[1])}</td>
                </tr>
              ))}
              <tr style={{ borderTop: `2px solid ${t.border}` }}>
                <td style={{ padding: "9px 4px", fontWeight: 700 }}>= Saldo para o exercício seguinte</td>
                <td className="text-right tabular-nums" style={{ padding: "9px 4px", fontWeight: 700, color: t.primary }}>{fmt(F.bruta)}</td>
              </tr>
            </tbody>
          </table>
        </Card>
        <Card className="p-5">
          <Title right={<span className="text-xs" style={{ color: t.mutedFg }}>a recolher</span>}>Movimento Extraorçamentário</Title>
          <div className="overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: "collapse", fontSize: 12.5 }}>
              <thead><tr style={{ color: t.mutedFg }}>
                <th className="text-left" style={{ padding: "7px 6px", fontWeight: 600 }}>Natureza</th>
                <th className="text-right" style={{ padding: "7px 6px", fontWeight: 600 }}>Retido</th>
                <th className="text-right" style={{ padding: "7px 6px", fontWeight: 600 }}>Recolhido</th>
                <th className="text-right" style={{ padding: "7px 6px", fontWeight: 600 }}>Saldo</th>
              </tr></thead>
              <tbody>
                {F.extra.map(([n, ret, rec], i) => (
                  <tr key={i} style={{ borderTop: `1px solid ${t.border}` }}>
                    <td style={{ padding: "8px 6px", color: t.foreground }}>{n}</td>
                    <td className="text-right tabular-nums" style={{ padding: "8px 6px", color: t.mutedFg }}>{fmt(ret)}</td>
                    <td className="text-right tabular-nums" style={{ padding: "8px 6px", color: t.mutedFg }}>{fmt(rec)}</td>
                    <td className="text-right tabular-nums" style={{ padding: "8px 6px", color: t.foreground, fontWeight: 600 }}>{fmt(ret - rec)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}

