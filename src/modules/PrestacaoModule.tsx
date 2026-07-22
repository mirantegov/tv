import React, { useState } from "react";
import { useTheme } from "../theme";
import { Card, Title, Kpi } from "../components";
import { fmtInt, sg } from "../format";
import { PC } from "../data";

export default function PrestacaoModule() {
  const { t } = useTheme();
  const [aba, setAba] = useState("tce");
  const abas = [["tce", "TCE/PR"], ["siconfi", "SICONFI"]];
  const C = PC;
  const tones = { ok: t.ok, warn: t.warn, danger: t.danger, info: t.primary, muted: t.mutedFg };
  const Badge = ({ tone, children }) => <span className="text-xs font-semibold rounded" style={{ padding: "2px 9px", background: t.muted, color: tones[tone] || t.mutedFg, whiteSpace: "nowrap" }}>{children}</span>;
  const Dot = ({ s, size = 13 }) => <span style={{ width: size, height: size, borderRadius: 999, display: "inline-block", background: s === "ok" ? t.ok : s === "no" ? t.danger : t.mutedFg, opacity: s === "na" ? 0.4 : 1 }} />;
  const Section = ({ num, title, desc, children }) => (
    <div className="mb-7">
      <div className="flex items-center gap-3 mb-3">
        <div className="rounded-lg flex items-center justify-center text-xs font-bold" style={{ width: 26, height: 26, background: t.primary, color: t.primaryFg, flexShrink: 0 }}>{num}</div>
        <div><h3 className="text-sm font-semibold" style={{ color: t.foreground }}>{title}</h3>{desc && <div className="text-xs" style={{ color: t.mutedFg }}>{desc}</div>}</div>
      </div>
      {children}
    </div>
  );
  const agendaTone = (s) => ({ "Concluída": "ok", "No prazo": "info", "Vencendo": "warn", "Atrasada": "danger" }[s] || "muted");
  const caucTone = (s) => ({ ok: "Regular", warn: "Atenção", danger: "Irregular" }[s] || s);
  const note = (txt) => <div className="rounded-xl mb-5 text-xs leading-relaxed" style={{ background: t.card, border: `1px solid ${t.border}`, color: t.mutedFg, padding: "11px 14px" }}>{txt}</div>;
  const th = { padding: "8px 10px", fontWeight: 600 };
  const td = { padding: "9px 10px" };

  return (
    <>
      <div className="mb-5"><div className="flex rounded-lg overflow-hidden" style={{ border: `1px solid ${t.border}`, width: "fit-content" }}>
        {abas.map(([k, l]) => <button key={k} onClick={() => setAba(k)} className="text-xs sm:text-sm font-medium" style={{ padding: "8px 16px", background: aba === k ? t.primary : t.card, color: aba === k ? t.primaryFg : t.mutedFg, border: "none", cursor: "pointer" }}>{l}</button>)}
      </div></div>

      {/* ===================== TCE/PR ===================== */}
      {aba === "tce" && (<>
        {note(<>Obrigações com o <b style={{ color: t.foreground }}>Tribunal de Contas do Estado do Paraná</b>, prestadas via SIM-AM (mensal) e SIM-AP (anual). Prazos conforme a Instrução Normativa vigente do TCE-PR — confirme o calendário do exercício.</>)}

        <Section num="1" title="Agenda de Obrigações" desc="Compromissos do município junto ao TCE-PR, por entidade.">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
            <Kpi label="Em Dia" value={fmtInt(C.tce.agenda.kpis.emDia)} accent={t.ok} sub="obrigações atendidas" />
            <Kpi label="Não Atendido" value={fmtInt(C.tce.agenda.kpis.naoAtendido)} accent={t.danger} sub="exige regularização" />
            <Kpi label="Não Aplicável" value={fmtInt(C.tce.agenda.kpis.naoAplicavel)} sub="fora do escopo do ente" />
            <Kpi label="Entidades" value={fmtInt(C.tce.agenda.kpis.entidades)} sub="unidades monitoradas" />
          </div>

          <div className="flex items-center gap-5 mb-3 text-xs flex-wrap">
            <span style={{ color: t.mutedFg, fontWeight: 600 }}>Situação:</span>
            <span className="flex items-center gap-2" style={{ color: t.foreground }}><Dot s="ok" size={11} /> Em dia</span>
            <span className="flex items-center gap-2" style={{ color: t.foreground }}><Dot s="no" size={11} /> Não atendido</span>
            <span className="flex items-center gap-2" style={{ color: t.foreground }}><Dot s="na" size={11} /> Não aplicável</span>
          </div>

          <Card className="p-5 mb-4">
            <div className="overflow-x-auto">
              <table className="w-full" style={{ borderCollapse: "collapse", fontSize: 13, minWidth: 720 }}>
                <thead><tr style={{ color: t.mutedFg }}>
                  <th className="text-left" style={{ padding: "8px 10px", fontWeight: 600 }}>Entidade</th>
                  {C.tce.agenda.colunas.map(([sg], i) => <th key={i} className="text-center" style={{ padding: "8px 6px", fontWeight: 600 }}>{sg}</th>)}
                </tr></thead>
                <tbody>
                  {C.tce.agenda.matriz.map(([ent, sts], i) => (
                    <tr key={i} style={{ borderTop: `1px solid ${t.border}` }}>
                      <td style={{ padding: "12px 10px" }}>
                        <span className="flex items-center gap-2" style={{ color: t.foreground, fontWeight: 500 }}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={t.mutedFg} strokeWidth="2" style={{ flexShrink: 0 }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></svg>
                          {ent}
                        </span>
                      </td>
                      {sts.map((s, j) => <td key={j} className="text-center" style={{ padding: "12px 6px" }}><Dot s={s} /></td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2 mb-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={t.mutedFg} strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" strokeLinecap="round" /></svg>
              <h4 className="text-sm font-semibold" style={{ color: t.foreground }}>Legenda das Obrigações</h4>
            </div>
            <div className="text-xs mb-4" style={{ color: t.mutedFg }}>Compromissos do município junto ao TCE/PR — {C.tce.agenda.local}, {C.tce.agenda.periodo}</div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-3">
              {C.tce.agenda.colunas.map(([sg, desc], i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-xs font-semibold" style={{ border: `1px solid ${t.border}`, borderRadius: 999, padding: "2px 11px", color: t.foreground, whiteSpace: "nowrap", flexShrink: 0 }}>{sg}</span>
                  <span className="text-xs" style={{ color: t.mutedFg, lineHeight: 1.5 }}>{desc}</span>
                </div>
              ))}
            </div>
          </Card>
        </Section>

        <Section num="2" title="Certidão" desc="Certidão Liberatória do TCE-PR.">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
            <Kpi label="Situação" value={C.tce.certidao.kpis.situacao} accent={t.ok} sub="apta a transferências" />
            <Kpi label="Validade" value={C.tce.certidao.kpis.validade} accent={t.warn} sub={`vence ${C.tce.certidao.vencimento}`} />
            <Kpi label="Pendências" value={fmtInt(C.tce.certidao.kpis.pendencias)} sub="nenhuma restrição" />
            <Kpi label="Tipo" value={C.tce.certidao.kpis.tipo} sub="emissão TCE-PR" />
          </div>
          <Card className="p-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div>
                <div className="flex items-center gap-2 mb-3"><Badge tone="ok">REGULAR</Badge><span className="text-sm font-bold" style={{ color: t.foreground }}>Certidão {C.tce.certidao.numero}</span></div>
                <div className="text-xs leading-relaxed mb-3" style={{ color: t.mutedFg }}>{C.tce.certidao.finalidade}</div>
                <div className="flex justify-between text-xs mb-1.5"><span style={{ color: t.mutedFg }}>Emissão</span><span className="tabular-nums" style={{ color: t.foreground }}>{C.tce.certidao.emissao}</span></div>
                <div className="flex justify-between text-xs"><span style={{ color: t.mutedFg }}>Vencimento</span><span className="tabular-nums" style={{ color: t.warn, fontWeight: 600 }}>{C.tce.certidao.vencimento}</span></div>
              </div>
              <div>
                <div className="text-xs font-semibold mb-2" style={{ color: t.foreground }}>Itens verificados</div>
                {C.tce.certidao.itens.map(([it], i) => (
                  <div key={i} className="flex items-center gap-2 text-xs" style={{ padding: "4px 0" }}>
                    <span style={{ color: t.ok, fontWeight: 700 }}>✓</span><span style={{ color: t.mutedFg }}>{it}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </Section>

        <Section num="3" title="Contas Anuais" desc="Prestação de Contas Anual (PCA), parecer prévio do TCE e julgamento pela Câmara.">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
            <Kpi label="Exercício em Análise" value={C.tce.contas.kpis.exercicio} accent={t.primary} sub="PCA enviada" />
            <Kpi label="Parecer Prévio" value={C.tce.contas.kpis.parecer} sub="aguardando o TCE" />
            <Kpi label="Entrega da PCA" value={C.tce.contas.kpis.entrega} accent={t.ok} sub="dentro do prazo" />
            <Kpi label="Tempestividade" value={C.tce.contas.kpis.tempestividade} sub="últimos 5 exercícios" />
          </div>
          <Card className="p-5">
            <div className="overflow-x-auto">
              <table className="w-full" style={{ borderCollapse: "collapse", fontSize: 12.5 }}>
                <thead><tr style={{ color: t.mutedFg }}>
                  <th className="text-left" style={th}>Exercício</th><th className="text-left" style={th}>Entrega</th>
                  <th className="text-left" style={th}>Parecer Prévio (TCE)</th><th className="text-left" style={th}>Julgamento (Câmara)</th>
                  <th className="text-left" style={th}>Situação</th>
                </tr></thead>
                <tbody>
                  {C.tce.contas.historico.map(([ex, en, pa, ju, to], i) => (
                    <tr key={i} style={{ borderTop: `1px solid ${t.border}` }}>
                      <td style={{ ...td, color: t.foreground, fontWeight: 700 }}>{ex}</td>
                      <td className="tabular-nums" style={{ ...td, color: t.mutedFg }}>{en}</td>
                      <td style={{ ...td, color: t.foreground }}>{pa}</td>
                      <td style={{ ...td, color: t.mutedFg }}>{ju}</td>
                      <td style={td}><Badge tone={to}>{to === "ok" ? "Regular" : to === "warn" ? "Ressalvas" : "Em andamento"}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </Section>
      </>)}

      {/* ===================== SICONFI ===================== */}
      {aba === "siconfi" && (<>
        {note(<>Obrigações com o <b style={{ color: t.foreground }}>SICONFI / Tesouro Nacional</b>. O <b style={{ color: t.foreground }}>CAUC</b> consolida as exigências fiscais para transferências voluntárias; a <b style={{ color: t.foreground }}>MSC</b> (Matriz de Saldos Contábeis) é a base mensal que gera RREO, RGF e DCA.</>)}

        <Section num="1" title="CAUC" desc="Serviço Auxiliar de Informações para Transferências Voluntárias — checklist fiscal.">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
            <Kpi label="Itens Regulares" value={`${C.siconfi.cauc.kpis.regulares} / ${C.siconfi.cauc.kpis.total}`} accent={t.ok} sub="exigências atendidas" />
            <Kpi label="Pendentes" value={fmtInt(C.siconfi.cauc.kpis.pendentes)} accent={t.warn} sub="bloqueiam convênios" />
            <Kpi label="Situação Geral" value={C.siconfi.cauc.kpis.situacao} accent={t.warn} sub="qualquer pendência impede repasse" />
            <Kpi label="Última Verificação" value={C.siconfi.cauc.kpis.verificacao} sub="consulta ao CAUC" />
          </div>
          <Card className="p-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-1">
              {C.siconfi.cauc.itens.map(([ex, to], i) => (
                <div key={i} className="flex items-center gap-2" style={{ padding: "6px 0", borderBottom: `1px solid ${t.border}` }}>
                  <span style={{ color: tones[to], fontWeight: 700, width: 14 }}>{to === "ok" ? "✓" : "!"}</span>
                  <span className="text-xs" style={{ color: t.foreground, flex: 1 }}>{ex}</span>
                  <Badge tone={to}>{caucTone(to)}</Badge>
                </div>
              ))}
            </div>
            <div className="text-xs mt-3" style={{ color: t.mutedFg }}>Pendências em destaque: <b style={{ color: t.danger }}>CRP previdenciário</b> (regularizar junto ao RPPS/Ministério) e <b style={{ color: t.warn }}>envio do RGF</b>. Enquanto houver pendência, o município fica impedido de receber transferências voluntárias.</div>
          </Card>
        </Section>

        <Section num="2" title="MSC" desc="Matriz de Saldos Contábeis — remessas mensais e declarações derivadas.">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
            <Kpi label="Competência Atual" value={C.siconfi.msc.kpis.competencia} accent={t.primary} sub="último encerramento" />
            <Kpi label="Status de Envio" value={C.siconfi.msc.kpis.status} accent={t.ok} sub="remessas mensais" />
            <Kpi label="Consistência" value={C.siconfi.msc.kpis.consistencia} sub="validação SICONFI" />
            <Kpi label="Declarações Geradas" value={C.siconfi.msc.kpis.derivadas} sub="a partir da MSC" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="p-5 lg:col-span-2">
              <Title>Remessas Mensais (MSC)</Title>
              <div className="overflow-x-auto">
                <table className="w-full" style={{ borderCollapse: "collapse", fontSize: 12.5 }}>
                  <thead><tr style={{ color: t.mutedFg }}>
                    <th className="text-left" style={th}>Competência</th><th className="text-left" style={th}>Envio</th>
                    <th className="text-left" style={th}>Status</th><th className="text-right" style={th}>Consistência</th>
                  </tr></thead>
                  <tbody>
                    {C.siconfi.msc.remessas.map(([co, en, st, cs, to], i) => (
                      <tr key={i} style={{ borderTop: `1px solid ${t.border}` }}>
                        <td style={{ ...td, color: t.foreground, fontWeight: 600 }}>{co}</td>
                        <td className="tabular-nums" style={{ ...td, color: t.mutedFg }}>{en}</td>
                        <td style={td}><Badge tone={to}>{st}</Badge></td>
                        <td className="text-right tabular-nums" style={{ ...td, color: to === "warn" ? t.warn : t.foreground }}>{cs}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
            <Card className="p-5">
              <Title>Declarações Derivadas</Title>
              {C.siconfi.msc.declaracoes.map(([de, si, to], i) => (
                <div key={i} className="rounded-lg mb-2" style={{ background: t.muted, padding: "10px 12px" }}>
                  <div className="flex items-center justify-between mb-1"><span className="text-xs font-semibold" style={{ color: t.foreground }}>{de}</span><Badge tone={to}>{to === "ok" ? "OK" : "Pendente"}</Badge></div>
                  <div className="text-xs" style={{ color: t.mutedFg }}>{si}</div>
                </div>
              ))}
              <div className="text-xs mt-1" style={{ color: t.mutedFg }}>RREO, RGF e DCA são gerados automaticamente a partir da MSC homologada.</div>
            </Card>
          </div>
        </Section>
      </>)}
    </>
  );
}

