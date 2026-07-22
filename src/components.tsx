import React, { useState } from "react";
import { ResponsiveContainer, AreaChart, Area, LineChart, Line, ComposedChart, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from "recharts";
import { useTheme } from "./theme";
import { fmt, brl, pct, fmtInt, sg, dR, dP, vari } from "./format";

export function Card({ children, className = "", style = {} }: { children?: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const { t } = useTheme();
  return <div className={`rounded-xl ${className}`} style={{ background: t.card, border: `1px solid ${t.border}`, ...style }}>{children}</div>;
}
export function Title({ children, right }: { children?: React.ReactNode; right?: React.ReactNode }) {
  const { t } = useTheme();
  return (
    <div className="flex items-center justify-between mb-3 gap-2">
      <h3 className="text-sm font-semibold tracking-wide" style={{ color: t.foreground }}>{children}</h3>
      {right}
    </div>
  );
}
export function Delta({ d, p, up, money }: { d: number; p: number; up: boolean; money?: boolean }) {
  const { t } = useTheme();
  return <span className="tabular-nums" style={{ color: up ? t.primary : t.warn, fontWeight: 600 }}>{up ? "▲" : "▼"} {money ? dR(d) : dP(p)}</span>;
}
export function Tip({ active, payload, label }: { active?: boolean; payload?: any[]; label?: React.ReactNode }) {
  const { t } = useTheme();
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 8, padding: "8px 11px", fontSize: 12, color: t.foreground, boxShadow: "0 8px 22px rgba(0,0,0,0.35)" }}>
      {label && <div style={{ fontWeight: 600, marginBottom: 5 }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2" style={{ padding: "1px 0" }}>
          <span style={{ width: 9, height: 9, borderRadius: 2, background: p.color || p.fill }} />
          <span style={{ color: t.mutedFg }}>{p.name}</span>
          <span className="tabular-nums" style={{ fontWeight: 600, marginLeft: "auto" }}>{brl(p.value)}</span>
        </div>
      ))}
    </div>
  );
}
export function TipNum({ active, payload, label, suffix }: { active?: boolean; payload?: any[]; label?: React.ReactNode; suffix?: string }) {
  const { t } = useTheme();
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 8, padding: "8px 11px", fontSize: 12, color: t.foreground, boxShadow: "0 8px 22px rgba(0,0,0,0.35)" }}>
      {label && <div style={{ fontWeight: 600, marginBottom: 5 }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2" style={{ padding: "1px 0" }}>
          <span style={{ width: 9, height: 9, borderRadius: 2, background: p.color || p.fill }} />
          <span style={{ color: t.mutedFg }}>{p.name}</span>
          <span className="tabular-nums" style={{ fontWeight: 600, marginLeft: "auto" }}>{fmtInt(Math.abs(p.value))}{suffix || ""}</span>
        </div>
      ))}
    </div>
  );
}
export function Kpi({ label, value, sub, accent, progress }: { label: React.ReactNode; value: React.ReactNode; sub?: React.ReactNode; accent?: string; progress?: number }) {
  const { t } = useTheme();
  return (
    <Card className="p-4">
      <div className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: t.mutedFg }}>{label}</div>
      <div className="text-xl font-bold tabular-nums leading-tight" style={{ color: accent || t.foreground }}>{value}</div>
      {progress != null && <div className="mt-2 rounded-full overflow-hidden" style={{ height: 5, background: t.secondary }}><div style={{ height: "100%", width: `${Math.min(progress, 100)}%`, background: t.primary, borderRadius: 999 }} /></div>}
      {sub && <div className="text-xs mt-2 tabular-nums" style={{ color: t.mutedFg }}>{sub}</div>}
    </Card>
  );
}
export function KpiCmp({ label, a, b, accent }: { label: React.ReactNode; a: number; b: number; accent?: string }) {
  const { t } = useTheme();
  const v = vari(a, b);
  return (
    <Card className="p-4">
      <div className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: t.mutedFg }}>{label}</div>
      <div className="text-xl font-bold tabular-nums leading-tight" style={{ color: accent || t.foreground }}>{brl(b)}</div>
      <div className="flex items-center gap-2 mt-2 text-xs"><Delta {...v} /><span className="tabular-nums" style={{ color: t.mutedFg }}>{dR(v.d)} mi</span></div>
      <div className="text-xs mt-1 tabular-nums" style={{ color: t.mutedFg }}>2025: {brl(a)}</div>
    </Card>
  );
}
export function Donut({ data, height = 230, numeric }: { data: any[]; height?: number; numeric?: boolean }) {
  const { t, cats } = useTheme();
  const total = data.reduce((s, d) => s + d.valor, 0);
  return (
    <>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={numeric ? <TipNum /> : <Tip />} />
            <Pie data={data} dataKey="valor" nameKey="nome" cx="50%" cy="50%" innerRadius={54} outerRadius={88} paddingAngle={2} stroke={t.card} strokeWidth={2}>
              {data.map((_, i) => <Cell key={i} fill={cats[i % cats.length]} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-col gap-1">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span style={{ width: 9, height: 9, borderRadius: 2, background: cats[i % cats.length] }} />
            <span style={{ color: t.mutedFg }}>{d.nome}</span>
            <span className="ml-auto tabular-nums" style={{ color: t.foreground, fontWeight: 600 }}>{pct((d.valor / total) * 100)}</span>
          </div>
        ))}
      </div>
    </>
  );
}
export function HBar({ data, height = 250, ylabel = 110, highlightFirst, numeric }: { data: any[]; height?: number; ylabel?: number; highlightFirst?: boolean; numeric?: boolean }) {
  const { t, cats } = useTheme();
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={t.border} horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: t.mutedFg }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="nome" tick={{ fontSize: 10, fill: t.foreground }} axisLine={false} tickLine={false} width={ylabel} />
          <Tooltip content={numeric ? <TipNum /> : <Tip />} cursor={{ fill: t.muted }} />
          <Bar dataKey="valor" name="Valor" radius={[0, 4, 4, 0]}>
            {data.map((_, i) => <Cell key={i} fill={highlightFirst && i === 0 ? t.primary : cats[3]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
export function GroupedBars({ data, height = 250 }: { data: any[]; height?: number }) {
  const { t, prev, cur } = useTheme();
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 6, right: 8, left: -12, bottom: 0 }} barGap={3}>
          <CartesianGrid strokeDasharray="3 3" stroke={t.border} vertical={false} />
          <XAxis dataKey="mes" tick={{ fontSize: 11, fill: t.mutedFg }} axisLine={{ stroke: t.border }} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: t.mutedFg }} axisLine={false} tickLine={false} width={42} />
          <Tooltip content={<Tip />} cursor={{ fill: t.muted }} />
          <Bar dataKey="a2025" name="2025" fill={prev} radius={[3, 3, 0, 0]} />
          <Bar dataKey="a2026" name="2026" fill={cur} radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
export function Diverging({ data, height = 250, ylabel = 110 }: { data: any[]; height?: number; ylabel?: number }) {
  const { t } = useTheme();
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 18, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={t.border} horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: t.mutedFg }} axisLine={false} tickLine={false} tickFormatter={(v) => v + "%"} />
          <YAxis type="category" dataKey="nome" tick={{ fontSize: 9.5, fill: t.foreground }} axisLine={false} tickLine={false} width={ylabel} />
          <Tooltip cursor={{ fill: t.muted }} content={({ active, payload }: any) => active && payload && payload.length ? (
            <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 8, padding: "6px 10px", fontSize: 12, color: t.foreground }}>
              <b>{payload[0].payload.nome}</b>: {dP(payload[0].payload.p)} ({dR(payload[0].payload.d)} mi)
            </div>) : null} />
          <ReferenceLine x={0} stroke={t.mutedFg} />
          <Bar dataKey="p" radius={[2, 2, 2, 2]}>
            {data.map((o, i) => <Cell key={i} fill={o.up ? t.primary : t.warn} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
export function LegendDot({ color, children }: { color: string; children?: React.ReactNode }) {
  const { t } = useTheme();
  return <span className="flex items-center gap-1.5" style={{ color: t.mutedFg }}><span style={{ width: 11, height: 11, borderRadius: 2, background: color }} />{children}</span>;
}

/* árvore expansível genérica (comparativo: v25/v26) */
function flatten(nodes: any[], exp: Record<string, boolean>, depth: number, acc: any[]) {
  for (const n of nodes) { acc.push({ node: n, depth }); if (n.children && exp[n.id]) flatten(n.children, exp, depth + 1, acc); }
  return acc;
}
export function TreeCmp({ nodes, level0, totalLabel, tot25, tot26 }: { nodes: any[]; level0: React.ReactNode; totalLabel: React.ReactNode; tot25: number; tot26: number }) {
  const { t } = useTheme();
  const [exp, setExp] = useState<Record<string, boolean>>(() => ({ [nodes[0].id]: true }));
  const rows = flatten(nodes, exp, 0, []);
  return (
    <div className="overflow-x-auto">
      <table className="w-full" style={{ borderCollapse: "collapse", fontSize: 13 }}>
        <thead><tr style={{ color: t.mutedFg }}>
          <th className="text-left" style={{ padding: "8px 10px", fontWeight: 600 }}>Classificação</th>
          <th className="text-right" style={{ padding: "8px 10px", fontWeight: 600 }}>2025</th>
          <th className="text-right" style={{ padding: "8px 10px", fontWeight: 600 }}>2026</th>
          <th className="text-right" style={{ padding: "8px 10px", fontWeight: 600 }}>Δ R$</th>
          <th className="text-right" style={{ padding: "8px 10px", fontWeight: 600 }}>Δ%</th>
        </tr></thead>
        <tbody>
          {rows.map(({ node, depth }) => {
            const v = vari(node.v25, node.v26); const hasK = !!node.children; const open = exp[node.id];
            return (
              <tr key={node.id} onClick={() => hasK && setExp((e) => ({ ...e, [node.id]: !e[node.id] }))}
                style={{ borderTop: `1px solid ${t.border}`, background: depth === 0 ? t.muted : "transparent", cursor: hasK ? "pointer" : "default" }}>
                <td style={{ padding: "8px 10px" }}>
                  <div className="flex items-center gap-2" style={{ paddingLeft: depth * 18 }}>
                    <span style={{ width: 14, color: t.primary, fontSize: 10, display: "inline-block" }}>{hasK ? (open ? "▾" : "▸") : ""}</span>
                    <span style={{ color: t.foreground, fontWeight: depth === 0 ? 700 : depth === 1 ? 600 : 400 }}>{node.nome}</span>
                    {depth === 0 && <span className="text-xs rounded" style={{ marginLeft: 4, padding: "0 6px", background: t.accent, color: t.mutedFg, fontSize: 10 }}>{level0}</span>}
                  </div>
                </td>
                <td className="text-right tabular-nums" style={{ padding: "8px 10px", color: t.mutedFg }}>{fmt(node.v25)}</td>
                <td className="text-right tabular-nums" style={{ padding: "8px 10px", color: t.foreground, fontWeight: depth < 2 ? 600 : 400 }}>{fmt(node.v26)}</td>
                <td className="text-right tabular-nums" style={{ padding: "8px 10px", color: v.up ? t.primary : t.warn }}>{dR(v.d)}</td>
                <td className="text-right" style={{ padding: "8px 10px" }}><Delta {...v} /></td>
              </tr>
            );
          })}
          <tr style={{ borderTop: `2px solid ${t.border}` }}>
            <td style={{ padding: "9px 10px", fontWeight: 700 }}>{totalLabel}</td>
            <td className="text-right tabular-nums" style={{ padding: "9px 10px", fontWeight: 700 }}>{fmt(tot25)}</td>
            <td className="text-right tabular-nums" style={{ padding: "9px 10px", fontWeight: 700 }}>{fmt(tot26)}</td>
            <td className="text-right tabular-nums" style={{ padding: "9px 10px", fontWeight: 700, color: t.primary }}>{dR(tot26 - tot25)}</td>
            <td className="text-right" style={{ padding: "9px 10px" }}><Delta {...vari(tot25, tot26)} /></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
/* árvore receita (prev/real) */
export function TreeReceita({ nodes }: { nodes: any[] }) {
  const { t } = useTheme();
  const [exp, setExp] = useState<Record<string, boolean>>({ rc: true });
  const rows = flatten(nodes, exp, 0, []);
  const colC = (p: number) => (p >= 50 ? t.ok : p >= 35 ? t.primary : t.warn);
  return (
    <div className="overflow-x-auto">
      <table className="w-full" style={{ borderCollapse: "collapse", fontSize: 13 }}>
        <thead><tr style={{ color: t.mutedFg }}>
          <th className="text-left" style={{ padding: "8px 10px", fontWeight: 600 }}>Classificação</th>
          <th className="text-right" style={{ padding: "8px 10px", fontWeight: 600 }}>Previsão</th>
          <th className="text-right" style={{ padding: "8px 10px", fontWeight: 600 }}>Arrecadado</th>
          <th className="text-left" style={{ padding: "8px 10px", fontWeight: 600, width: 140 }}>% Realiz.</th>
          <th className="text-right" style={{ padding: "8px 10px", fontWeight: 600 }}>Saldo</th>
        </tr></thead>
        <tbody>
          {rows.map(({ node, depth }) => {
            const hasK = !!node.children; const open = exp[node.id];
            const p = node.prev !== 0 ? (node.real / node.prev) * 100 : 0; const saldo = node.prev - node.real;
            return (
              <tr key={node.id} onClick={() => hasK && setExp((e) => ({ ...e, [node.id]: !e[node.id] }))}
                style={{ borderTop: `1px solid ${t.border}`, background: depth === 0 ? t.muted : "transparent", cursor: hasK ? "pointer" : "default" }}>
                <td style={{ padding: "8px 10px" }}>
                  <div className="flex items-center gap-2" style={{ paddingLeft: depth * 18 }}>
                    <span style={{ width: 14, color: t.primary, fontSize: 10, display: "inline-block" }}>{hasK ? (open ? "▾" : "▸") : ""}</span>
                    <span style={{ color: t.foreground, fontWeight: depth === 0 ? 700 : depth === 1 ? 600 : 400 }}>{node.nome}</span>
                    {depth === 0 && <span className="text-xs rounded" style={{ marginLeft: 4, padding: "0 6px", background: t.accent, color: t.mutedFg, fontSize: 10 }}>Categoria</span>}
                  </div>
                </td>
                <td className="text-right tabular-nums" style={{ padding: "8px 10px", color: t.mutedFg }}>{fmt(node.prev)}</td>
                <td className="text-right tabular-nums" style={{ padding: "8px 10px", color: t.foreground, fontWeight: depth < 2 ? 600 : 400 }}>{fmt(node.real)}</td>
                <td style={{ padding: "8px 10px" }}>
                  <div className="flex items-center gap-2">
                    <div className="rounded-full overflow-hidden" style={{ flex: 1, height: 6, background: t.secondary }}><div style={{ height: "100%", width: `${Math.max(0, Math.min(p, 100))}%`, background: colC(p), borderRadius: 999 }} /></div>
                    <span className="tabular-nums" style={{ color: t.foreground, fontWeight: 600, width: 42, textAlign: "right" }}>{pct(p)}</span>
                  </div>
                </td>
                <td className="text-right tabular-nums" style={{ padding: "8px 10px", color: t.mutedFg }}>{fmt(saldo)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
