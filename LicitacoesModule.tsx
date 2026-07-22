import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { useTheme } from "./theme";
import { Card, Title, Tip, Kpi, Donut, HBar, LegendDot } from "./components";
import { fmt, brl, pct, fmtInt } from "./format";
import { LIC } from "./data";

export default function LicitacoesModule() {
  const { t, cats } = useTheme();
  const diasColor = (d) => (d >= 60 ? t.warn : d >= 30 ? t.primary : t.mutedFg);
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <Kpi label="Valor Homologado" value={brl(LIC.homologado)} accent={t.primary} sub={`${fmtInt(LIC.processos)} processos`} />
        <Kpi label="Economia Obtida" value={brl(LIC.economia)} accent={t.ok} sub={`${pct(LIC.economiaPct)} do estimado`} />
        <Kpi label="Taxa de Sucesso" value={pct(LIC.taxaSucesso)} sub="homologados / concluídos" />
        <Kpi label="Tempo Médio" value={`${LIC.tempoMedio} dias`} sub="abertura → homologação" />
        <Kpi label="Em Andamento" value={fmtInt(LIC.andamento)} sub={`${brl(LIC.andamentoValor)} estimado`} />
        <Kpi label="Contratação Direta" value={pct(LIC.diretaPct)} accent={t.warn} sub="dispensa + inexigibilidade" />
        <Kpi label="Desertos / Fracassados" value={pct(LIC.desertosPct)} sub="revisar especificação/preço" />
        <Kpi label="Fornecedores / Certame" value={fmt(LIC.fornMedia)} sub="competitividade média" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Card className="p-5 lg:col-span-2">
          <Title right={<div className="flex gap-3 text-xs"><LegendDot color={cats[6]}>Estimado</LegendDot><LegendDot color={cats[0]}>Homologado</LegendDot><LegendDot color={t.ok}>Economia</LegendDot></div>}>Estimado × Homologado × Economia</Title>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={LIC.mensal.map(([mes, est, hom]) => ({ mes, Estimado: est, Homologado: hom, Economia: +(est - hom).toFixed(1) }))} margin={{ top: 6, right: 8, left: -12, bottom: 0 }} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke={t.border} vertical={false} />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: t.mutedFg }} axisLine={{ stroke: t.border }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: t.mutedFg }} axisLine={false} tickLine={false} width={42} />
                <Tooltip content={<Tip />} cursor={{ fill: t.muted }} />
                <Bar dataKey="Estimado" fill={cats[6]} radius={[3, 3, 0, 0]} />
                <Bar dataKey="Homologado" fill={cats[0]} radius={[3, 3, 0, 0]} />
                <Bar dataKey="Economia" fill={t.ok} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-5"><Title>Situação dos Processos</Title><Donut numeric data={LIC.situacao.map(([n, v]) => ({ nome: n, valor: v }))} height={210} /></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Card className="p-5">
          <Title>Funil do Processo</Title>
          <div className="flex flex-col gap-3 mt-1">
            {LIC.funil.map(([label, val], i) => (
              <div key={i}>
                <div className="flex items-baseline justify-between mb-1"><span className="text-xs font-medium" style={{ color: t.foreground }}>{label}</span><span className="text-sm font-bold tabular-nums" style={{ color: t.foreground }}>{fmtInt(val)}</span></div>
                <div className="rounded-md overflow-hidden" style={{ height: 22, background: t.secondary }}><div style={{ height: "100%", width: `${(val / LIC.funil[0][1]) * 100}%`, background: `linear-gradient(90deg, ${t.primary}, ${cats[3]})`, borderRadius: 6 }} /></div>
              </div>
            ))}
          </div>
          <div className="text-xs mt-3" style={{ color: t.mutedFg }}>Conversão publicado → contratado: {pct(LIC.funil[3][1] / LIC.funil[0][1] * 100)}.</div>
        </Card>
        <Card className="p-5"><Title>Compras por Objeto</Title><HBar highlightFirst data={LIC.objeto.map(([n, v]) => ({ nome: n, valor: v }))} height={230} ylabel={112} /></Card>
        <Card className="p-5"><Title right={<span className="text-xs" style={{ color: t.mutedFg }}>dias médios</span>}>Tempo de Tramitação</Title><HBar numeric data={LIC.modalidade.map(([n, , , , , tp]) => ({ nome: n, valor: tp }))} height={230} ylabel={130} /></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Card className="p-5">
          <Title right={<span className="text-xs" style={{ color: t.mutedFg }}>LC 123 · arts. 47-48</span>}>Destino do Valor Homologado — ME/EPP</Title>
          <Donut data={LIC.meepp.map(([n, v]) => ({ nome: n, valor: v }))} height={190} />
          <div className="text-xs mt-2" style={{ color: t.mutedFg }}><b style={{ color: t.ok }}>{pct(LIC.meepp[0][1] / LIC.homologado * 100)}</b> do valor ficou com ME/EPP do próprio município ({fmtInt(LIC.meeppExclusivos)} certames com disputa exclusiva/cota) — compras públicas como fomento à economia local.</div>
        </Card>
        <Card className="p-5">
          <Title right={<span className="text-xs" style={{ color: t.mutedFg }}>Lei 14.133 · arts. 54 e 94</span>}>Publicidade no PNCP</Title>
          {(() => {
            const tot = LIC.pncp.noPrazo + LIC.pncp.foraPrazo + LIC.pncp.pendentes;
            const rows = [["Publicados no prazo", LIC.pncp.noPrazo, t.ok], ["Publicados fora do prazo", LIC.pncp.foraPrazo, t.warn], ["Pendentes de publicação", LIC.pncp.pendentes, t.danger]];
            return (
              <div className="flex flex-col gap-3 mt-2">
                <div className="flex items-baseline gap-2"><span className="text-3xl font-bold tabular-nums" style={{ color: t.ok }}>{pct(LIC.pncp.noPrazo / tot * 100)}</span><span className="text-xs" style={{ color: t.mutedFg }}>dos {fmtInt(tot)} processos no prazo</span></div>
                {rows.map(([lb, v, c], i) => (
                  <div key={i}>
                    <div className="flex items-baseline justify-between mb-1"><span className="text-xs" style={{ color: t.foreground }}>{lb}</span><span className="text-xs font-bold tabular-nums" style={{ color: c }}>{fmtInt(v)}</span></div>
                    <div className="rounded-full overflow-hidden" style={{ height: 7, background: t.secondary }}><div style={{ height: "100%", width: `${v / tot * 100}%`, background: c, borderRadius: 999 }} /></div>
                  </div>
                ))}
                <div className="text-xs" style={{ color: t.mutedFg }}>Sem publicação no PNCP o contrato não tem eficácia — pendência é bloqueio, não burocracia.</div>
              </div>
            );
          })()}
        </Card>
        <Card className="p-5">
          <Title right={<span className="text-xs" style={{ color: t.mutedFg }}>SRP · consumo das atas</span>}>Atas de Registro de Preços</Title>
          <div className="flex flex-col gap-3 mt-2">
            {LIC.atas.map(([ob, reg, cons, venc], i) => (
              <div key={i}>
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-xs font-medium" style={{ color: t.foreground }}>{ob}</span>
                  <span className="text-xs tabular-nums" style={{ color: t.mutedFg }}>{fmt(cons)} / {fmt(reg)} · vence {venc}</span>
                </div>
                <div className="rounded-full overflow-hidden" style={{ height: 8, background: t.secondary }}><div style={{ height: "100%", width: `${cons / reg * 100}%`, background: cons / reg > 0.85 ? t.warn : t.primary, borderRadius: 999 }} /></div>
              </div>
            ))}
            <div className="text-xs" style={{ color: t.mutedFg }}>Ata perto de esgotar (ou de vencer) sem novo certame planejado vira compra emergencial — acompanhar consumo evita a dispensa por urgência fabricada.</div>
          </div>
        </Card>
      </div>

      <Card className="p-5 mb-4">
        <Title right={<span className="text-xs" style={{ color: t.mutedFg }}>R$ milhões · dias</span>}>Licitações por Modalidade</Title>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ borderCollapse: "collapse", fontSize: 13 }}>
            <thead><tr style={{ color: t.mutedFg }}>
              <th className="text-left" style={{ padding: "8px 10px", fontWeight: 600 }}>Modalidade</th>
              <th className="text-right" style={{ padding: "8px 10px", fontWeight: 600 }}>Nº</th>
              <th className="text-right" style={{ padding: "8px 10px", fontWeight: 600 }}>Estimado</th>
              <th className="text-right" style={{ padding: "8px 10px", fontWeight: 600 }}>Homologado</th>
              <th className="text-right" style={{ padding: "8px 10px", fontWeight: 600 }}>Economia</th>
              <th className="text-right" style={{ padding: "8px 10px", fontWeight: 600 }}>% Econ.</th>
              <th className="text-right" style={{ padding: "8px 10px", fontWeight: 600 }}>Tempo</th>
              <th className="text-right" style={{ padding: "8px 10px", fontWeight: 600 }}>Sucesso</th>
            </tr></thead>
            <tbody>
              {LIC.modalidade.map(([n, q, est, hom, ec, tp, sc], i) => (
                <tr key={i} style={{ borderTop: `1px solid ${t.border}`, background: i === 0 ? t.muted : "transparent" }}>
                  <td style={{ padding: "9px 10px", color: t.foreground, fontWeight: 500 }}>{n}</td>
                  <td className="text-right tabular-nums" style={{ padding: "9px 10px", color: t.mutedFg }}>{fmtInt(q)}</td>
                  <td className="text-right tabular-nums" style={{ padding: "9px 10px", color: t.mutedFg }}>{fmt(est)}</td>
                  <td className="text-right tabular-nums" style={{ padding: "9px 10px", color: t.foreground, fontWeight: 600 }}>{fmt(hom)}</td>
                  <td className="text-right tabular-nums" style={{ padding: "9px 10px", color: t.ok }}>{fmt(est - hom)}</td>
                  <td className="text-right tabular-nums" style={{ padding: "9px 10px", color: t.foreground }}>{pct(ec)}</td>
                  <td className="text-right tabular-nums" style={{ padding: "9px 10px", color: t.mutedFg }}>{tp}d</td>
                  <td className="text-right tabular-nums" style={{ padding: "9px 10px", color: t.mutedFg }}>{sc}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="text-xs mt-2" style={{ color: t.mutedFg }}>A "economia" só é real se a pesquisa de preços (valor estimado) for confiável — estimativa inflada gera economia fictícia.</div>
      </Card>

      <Card className="p-5 mb-4">
        <Title right={<span className="text-xs" style={{ color: t.mutedFg }}>pipeline</span>}>Processos em Andamento</Title>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ borderCollapse: "collapse", fontSize: 12.5 }}>
            <thead><tr style={{ color: t.mutedFg }}>
              <th className="text-left" style={{ padding: "7px 8px", fontWeight: 600 }}>Processo</th>
              <th className="text-left" style={{ padding: "7px 8px", fontWeight: 600 }}>Objeto</th>
              <th className="text-left" style={{ padding: "7px 8px", fontWeight: 600 }}>Modalidade</th>
              <th className="text-left" style={{ padding: "7px 8px", fontWeight: 600 }}>Órgão</th>
              <th className="text-right" style={{ padding: "7px 8px", fontWeight: 600 }}>Estimado</th>
              <th className="text-left" style={{ padding: "7px 8px", fontWeight: 600 }}>Situação</th>
              <th className="text-right" style={{ padding: "7px 8px", fontWeight: 600 }}>Dias</th>
            </tr></thead>
            <tbody>
              {LIC.pipeline.map(([pr, ob, mo, og, es, si, di], i) => (
                <tr key={i} style={{ borderTop: `1px solid ${t.border}` }}>
                  <td style={{ padding: "8px", color: t.foreground, fontWeight: 600 }}>{pr}</td>
                  <td style={{ padding: "8px", color: t.foreground }}>{ob}</td>
                  <td style={{ padding: "8px", color: t.mutedFg }}>{mo}</td>
                  <td style={{ padding: "8px", color: t.mutedFg }}>{og}</td>
                  <td className="text-right tabular-nums" style={{ padding: "8px", color: t.foreground }}>{fmt(es)}</td>
                  <td style={{ padding: "8px" }}><span className="text-xs rounded" style={{ padding: "1px 7px", background: t.muted, color: t.mutedFg }}>{si}</span></td>
                  <td className="text-right tabular-nums" style={{ padding: "8px", color: diasColor(di), fontWeight: 600 }}>{di}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <Title right={<span className="text-xs" style={{ color: t.warn }}>governança</span>}>Dispensas e Inexigibilidades</Title>
          <div className="overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: "collapse", fontSize: 12.5 }}>
              <thead><tr style={{ color: t.mutedFg }}>
                <th className="text-left" style={{ padding: "7px 8px", fontWeight: 600 }}>Base legal</th>
                <th className="text-left" style={{ padding: "7px 8px", fontWeight: 600 }}>Objeto</th>
                <th className="text-left" style={{ padding: "7px 8px", fontWeight: 600 }}>Fornecedor</th>
                <th className="text-right" style={{ padding: "7px 8px", fontWeight: 600 }}>Valor</th>
              </tr></thead>
              <tbody>
                {LIC.diretas.map(([bl, ob, fo, vl], i) => (
                  <tr key={i} style={{ borderTop: `1px solid ${t.border}` }}>
                    <td style={{ padding: "8px" }}><span className="text-xs rounded" style={{ padding: "1px 7px", background: t.accent, color: t.mutedFg }}>{bl}</span></td>
                    <td style={{ padding: "8px", color: t.foreground }}>{ob}</td>
                    <td style={{ padding: "8px", color: t.mutedFg }}>{fo}</td>
                    <td className="text-right tabular-nums" style={{ padding: "8px", color: t.foreground, fontWeight: 600 }}>{fmt(vl)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card className="p-5">
          <Title>Itens Desertos / Fracassados</Title>
          <div className="overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: "collapse", fontSize: 12.5 }}>
              <thead><tr style={{ color: t.mutedFg }}>
                <th className="text-left" style={{ padding: "7px 8px", fontWeight: 600 }}>Objeto</th>
                <th className="text-left" style={{ padding: "7px 8px", fontWeight: 600 }}>Modalidade</th>
                <th className="text-left" style={{ padding: "7px 8px", fontWeight: 600 }}>Motivo</th>
              </tr></thead>
              <tbody>
                {LIC.desertos.map(([ob, mo, mt], i) => (
                  <tr key={i} style={{ borderTop: `1px solid ${t.border}` }}>
                    <td style={{ padding: "8px", color: t.foreground }}>{ob}</td>
                    <td style={{ padding: "8px", color: t.mutedFg }}>{mo}</td>
                    <td style={{ padding: "8px", color: t.mutedFg }}>{mt}</td>
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

