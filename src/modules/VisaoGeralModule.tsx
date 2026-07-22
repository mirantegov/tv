import React from "react";
import { useTheme } from "../theme";
import { Link } from "../router";
import { Card, Title, Delta, Kpi } from "../components";
import { fmt, brl, pct, fmtInt, dP, vari } from "../format";
import { D, R, F, TB, FP, PA, LIC, CON, PLAN as P } from "../data";

export default function VisaoGeralModule() {
  const { t, cats } = useTheme();
  const alertas = [
    ["danger", "CAUC com pendência — CRP previdenciário irregular", "Bloqueia transferências voluntárias e convênios com a União.", "/prestacao", "Regularizar"],
    ["danger", "Fonte vinculada com saldo negativo — Royalties (− R$ 0,8 mi)", "Indica uso de recurso de outra destinação; recompor antes do fechamento.", "/financeiro-analises", "Ver fontes"],
    ["danger", "Obrigação TCE-PR não atendida — RREO (Município)", "Publicidade do RREO pendente no período; sujeita a apontamento.", "/prestacao", "Ver agenda"],
    ["warn", "Pessoal/RCL em 49,2% — acima do limite de alerta (48,6%)", "Ainda abaixo do prudencial (51,3%); monitorar reajustes e nomeações.", "/folha", "Ver LRF"],
    ["warn", "18 contratos vencem em 90 dias (R$ 42,0 mi)", "Iniciar renovações/licitações para evitar contratação emergencial.", "/contratos", "Ver vigências"],
    ["warn", "Certidão Liberatória vence em 27 dias", "Renovar junto ao TCE-PR para não travar repasses estaduais.", "/prestacao", "Ver certidão"],
    ["warn", "MSC pendente — competência 06/2026 (SICONFI)", "Remessa mensal da Matriz de Saldos Contábeis em atraso; regularizar no SICONFI.", "/prestacao", "Ver SICONFI"],
  ];
  const emDia = [
    ["Saúde 18,4%", "mín. 15% ✓"],
    ["Educação 27,5%", "mín. 25% ✓"],
    ["Duodécimo 5,8%", "teto 6% ✓"],
    ["Taxa adm. RPPS 0,52%", "teto 2% ✓"],
    ["Conciliação 87,5%", "42/48 contas"],
    ["Art. 29-A (Câmara)", "dentro do teto ✓"],
  ];
  const tone = { danger: t.danger, warn: t.warn };
  const L = FP.lrf;
  const lrfStatus = L.pct >= L.prudencial ? t.danger : L.pct >= L.alerta ? t.warn : t.ok;
  const lrfLabel = L.pct >= L.prudencial ? "ACIMA DO PRUDENCIAL" : L.pct >= L.alerta ? "ACIMA DO ALERTA" : "DENTRO DO LIMITE";
  // Seção por módulo (mesmo formato da Prestação de Contas; espaçamento maior entre blocos)
  const Section = ({ num, title, desc, rota, children }) => (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-3">
        <div className="rounded-lg flex items-center justify-center text-xs font-bold" style={{ width: 26, height: 26, background: t.primary, color: t.primaryFg, flexShrink: 0 }}>{num}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 className="text-sm font-semibold" style={{ color: t.foreground }}>{title}</h3>
          {desc && <div className="text-xs" style={{ color: t.mutedFg }}>{desc}</div>}
        </div>
        {rota && <Link href={rota} className="text-xs font-semibold rounded-md" style={{ padding: "6px 12px", background: t.card, border: `1px solid ${t.border}`, color: t.primary, textDecoration: "none", whiteSpace: "nowrap", alignSelf: "flex-start" }}>Abrir →</Link>}
      </div>
      {children}
    </div>
  );
  return (
    <>
      <Card className="p-5 mb-8">
        <Title right={<span className="text-xs" style={{ color: t.mutedFg }}>3 críticos · 4 atenção</span>}>Alertas do Gestor</Title>
        <div className="flex flex-col gap-2">
          {alertas.map(([tn, titulo, det, href, acao], i) => (
            <div key={i} className="rounded-lg flex flex-col sm:flex-row sm:items-center gap-2" style={{ background: t.muted, padding: "11px 13px", borderLeft: `3px solid ${tone[tn]}` }}>
              <div style={{ flex: 1 }}>
                <div className="text-xs font-semibold" style={{ color: t.foreground }}>{titulo}</div>
                <div className="text-xs mt-0.5" style={{ color: t.mutedFg }}>{det}</div>
              </div>
              <Link href={href} className="text-xs font-semibold rounded-md" style={{ padding: "6px 12px", background: t.card, border: `1px solid ${t.border}`, color: tone[tn], textDecoration: "none", whiteSpace: "nowrap", alignSelf: "flex-start" }}>{acao} →</Link>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {emDia.map(([a, b], i) => (
            <span key={i} className="text-xs rounded-full" style={{ padding: "4px 12px", background: t.muted, color: t.mutedFg }}><b style={{ color: t.ok }}>{a}</b> · {b}</span>
          ))}
        </div>
      </Card>

      {/* ============ KPIs por módulo do grupo Movimento ============ */}
      <Section num="1" title="Despesa" desc="Execução orçamentária da despesa — dotação → empenho → pago." rota="/despesa">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <Kpi label="Dotação Atualizada" value={brl(D.dotacao)} sub={`Inicial ${fmt(D.inicial)} · Créditos +${fmt(D.creditos)}`} />
          <Kpi label="Empenhado" value={brl(D.emp)} accent={t.primary} progress={(D.emp / D.dotacao) * 100} sub={`${pct((D.emp / D.dotacao) * 100)} da dotação`} />
          <Kpi label="Liquidado" value={brl(D.liq)} progress={(D.liq / D.emp) * 100} sub={`${pct((D.liq / D.emp) * 100)} do empenhado`} />
          <Kpi label="Pago" value={brl(D.pago)} progress={(D.pago / D.liq) * 100} sub={`${pct((D.pago / D.liq) * 100)} do liquidado`} />
          <Kpi label="Saldo a Empenhar" value={brl(D.saldo)} sub={`${pct((D.saldo / D.dotacao) * 100)} disponível`} />
          <Kpi label="Restos a Pagar" value={brl(D.restos)} sub="Proc. 41,2 · N/Proc. 54,2" />
        </div>
      </Section>

      <Section num="2" title="Receita" desc="Previsão e arrecadação — própria, transferências e realização." rota="/receita">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <Kpi label="Previsão Atualizada" value={brl(R.prev)} sub="LOA + reestimativas" />
          <Kpi label="Arrecadada (Bruta)" value={brl(R.bruta)} accent={t.primary} progress={(R.bruta / R.prev) * 100} sub={`${pct((R.bruta / R.prev) * 100)} de realização`} />
          <Kpi label="Receita Própria" value={brl(R.propria)} sub={`Autonomia ${pct((R.propria / R.bruta) * 100)}`} />
          <Kpi label="Transferências" value={brl(R.transf)} sub={`${pct((R.transf / R.bruta) * 100)} do total`} />
          <Kpi label="Receita Líquida" value={brl(R.liq)} sub="Após deduções FUNDEB" />
          <Kpi label="Saldo a Realizar" value={brl(R.prev - R.bruta)} sub={`${pct(((R.prev - R.bruta) / R.prev) * 100)} da previsão`} />
        </div>
      </Section>

      <Section num="3" title="Tributação e Fiscalização" desc="Receita própria, dívida ativa e renúncia." rota="/tributacao">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Kpi label="Receita Própria" value={brl(TB.propria)} accent={t.primary} sub={`${pct(TB.propriaPart)} da receita arrecadada`} />
          <Kpi label="IPTU" value={brl(TB.iptuArr)} progress={TB.iptuAdimp} sub={`${pct(TB.iptuAdimp)} de adimplência`} />
          <Kpi label="ISS" value={brl(TB.issArr)} sub={`${dP(TB.issYoY)} vs 2025 (atividade econ.)`} />
          <Kpi label="ITBI" value={brl(TB.itbiArr)} sub={`${TB.itbiTransm.toLocaleString("pt-BR")} transmissões`} />
          <Kpi label="Saldo da Dívida Ativa" value={brl(TB.daSaldo)} sub={`${pct(TB.daRecPct)} recuperado no período`} />
          <Kpi label="Inadimplência (vencida)" value={brl(TB.inadVencida)} accent={t.warn} sub="Crédito vencido não pago" />
          <Kpi label="Renúncia de Receita" value={brl(TB.renuncia)} sub="Isenções, imunidades, anistias" />
          <Kpi label="Adesão à Cota Única" value={pct(TB.cotaUnica)} sub="IPTU pago à vista" />
        </div>
      </Section>

      <Section num="4" title="Financeiro — Tesouraria" desc="Disponibilidades, fluxo e liquidez do exercício." rota="/financeiro">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Kpi label="Disponibilidade Bruta" value={brl(F.bruta)} sub="Caixa + Bancos + Aplicações" />
          <Kpi label="Disponibilidade Líquida" value={brl(F.liquida)} accent={t.primary} sub="Após obrigações financeiras" />
          <Kpi label="Ingressos do período" value={brl(F.ingressos)} sub="Orçamentário + extraorçamentário" />
          <Kpi label="Desembolsos do período" value={brl(F.desembolsos)} sub="Orçamentário + extraorçamentário" />
          <Kpi label="Resultado Financeiro" value={`+ ${brl(F.resultado)}`} accent={t.ok} sub="Ingressos − Desembolsos" />
          <Kpi label="Obrigações a Pagar" value={brl(F.obrig)} sub="RP proc. + consig. + depósitos" />
          <Kpi label="Aplicações Financeiras" value={brl(F.aplicacoes)} sub={`Rendimento + ${fmt(F.rendimento)} mi`} />
          <Kpi label="Liquidez Imediata" value={fmt(F.liquidez)} accent={t.ok} sub="Disp. bruta / obrigações" />
        </div>
      </Section>

      <Section num="5" title="Planejamento Orçamentário (LOA)" desc="Consolidação da lei orçamentária por entidade." rota="/planejamento">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Kpi label="Orçamento Consolidado" value={brl(P.consolidado)} accent={t.primary} sub="LOA municipal (líquida de intra)" />
          <Kpi label="Soma das Entidades" value={brl(P.somaEntidades)} sub={`${P.nEntidades} unidades orçamentárias`} />
          <Kpi label="Transferências Intra" value={brl(P.intra)} accent={t.warn} sub="eliminadas na consolidação" />
          <Kpi label="Equilíbrio da LOA" value="Receita = Despesa" sub="fixada por lei em cada ente" />
        </div>
      </Section>

      <Section num="6" title="Licitações" desc="Processos, economia e competitividade." rota="/licitacoes">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Kpi label="Valor Homologado" value={brl(LIC.homologado)} accent={t.primary} sub={`${fmtInt(LIC.processos)} processos`} />
          <Kpi label="Economia Obtida" value={brl(LIC.economia)} accent={t.ok} sub={`${pct(LIC.economiaPct)} do estimado`} />
          <Kpi label="Taxa de Sucesso" value={pct(LIC.taxaSucesso)} sub="homologados / concluídos" />
          <Kpi label="Tempo Médio" value={`${LIC.tempoMedio} dias`} sub="abertura → homologação" />
          <Kpi label="Em Andamento" value={fmtInt(LIC.andamento)} sub={`${brl(LIC.andamentoValor)} estimado`} />
          <Kpi label="Contratação Direta" value={pct(LIC.diretaPct)} accent={t.warn} sub="dispensa + inexigibilidade" />
          <Kpi label="Desertos / Fracassados" value={pct(LIC.desertosPct)} sub="revisar especificação/preço" />
          <Kpi label="Fornecedores / Certame" value={fmt(LIC.fornMedia)} sub="competitividade média" />
        </div>
      </Section>

      <Section num="7" title="Contratos Municipais" desc="Carteira, execução, aditivos e vigências." rota="/contratos">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Kpi label="Valor Contratado" value={brl(CON.contratado)} accent={t.primary} sub={`${fmtInt(CON.vigentes)} contratos vigentes`} />
          <Kpi label="Valor Executado" value={brl(CON.executado)} progress={CON.execPct} sub={`${pct(CON.execPct)} da carteira`} />
          <Kpi label="Saldo a Executar" value={brl(CON.saldo)} sub="Atualizado − Executado" />
          <Kpi label="Aditivos" value={brl(CON.aditivos)} sub={`${pct(CON.aditivosPct)} sobre o original`} />
          <Kpi label="A Vencer em 90 dias" value={fmtInt(CON.aVencer90)} accent={t.warn} sub={`${brl(CON.aVencer90Valor)} em valor`} />
          <Kpi label="Vencidos c/ Saldo" value={fmtInt(CON.vencidosQtd)} sub={`${brl(CON.vencidosSaldo)} a encerrar`} />
          <Kpi label="Concentração Top 5" value={pct(CON.topFornPct)} sub="da carteira (dependência)" />
          <Kpi label="Valor Original" value={brl(CON.original)} sub="antes dos aditivos" />
        </div>
      </Section>

      <Section num="8" title="Folha de Pagamento" desc="Custo, encargos e limite de pessoal (LRF)." rota="/folha">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Kpi label="Custo Total da Folha" value={brl(FP.custoTotal)} accent={t.primary} sub={<><Delta {...vari(FP.custoMesAnt, FP.custoTotal)} /> vs mês anterior</>} />
          <Kpi label="Folha Bruta" value={brl(FP.bruta)} sub={`Líquida ${brl(FP.liquida)}`} />
          <Kpi label="Encargos Patronais" value={brl(FP.encargos)} sub="RPPS / INSS / FGTS" />
          <Kpi label="Horas Extras" value={brl(FP.he)} accent={t.warn} sub={`${pct(FP.hePct)} da folha bruta`} />
          <Kpi label="Adicionais" value={brl(FP.adicionais)} sub="Insalub., noturno, FG/CC…" />
          <Kpi label="Custo Médio / Servidor" value={FP.custoMedio} sub={`${fmtInt(FP.headcount)} servidores ativos`} />
          <Kpi label="Despesa Pessoal / RCL" value={pct(L.pct)} accent={lrfStatus} sub={`Limite LRF 54% · ${lrfLabel.toLowerCase()}`} />
          <Kpi label="Inativos e Pensionistas" value={brl(FP.inativosCusto)} sub={`${fmtInt(FP.inativos)} beneficiários`} />
        </div>
      </Section>

      <Section num="9" title="People Analytics" desc="Quadro de pessoal, movimentação e sucessão." rota="/people">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Kpi label="Headcount Ativo" value={fmtInt(PA.headcount)} accent={t.primary} sub={`${fmtInt(PA.total)} c/ inativos e pensionistas`} />
          <Kpi label="Turnover" value={pct(PA.turnover)} sub="Movimentação no período" />
          <Kpi label="Absenteísmo" value={pct(PA.absenteismo)} sub="dias de afastamento" />
          <Kpi label="Tempo Médio de Serviço" value={`${fmt(PA.tempoMedio)} anos`} sub={`Idade média ${fmt(PA.idadeMedia)}`} />
          <Kpi label="Elegíveis à Aposentadoria" value={fmtInt(PA.elegiveis)} accent={t.warn} sub={`${pct(PA.elegiveisPct)} do quadro (hoje)`} />
          <Kpi label="Cobertura de Cargos" value={pct(PA.cobertura)} sub={`${fmtInt(PA.providos)} / ${fmtInt(PA.autorizados)} vagas`} />
          <Kpi label="Razão Comiss. / Efetivos" value={pct(PA.razaoCom)} sub="Indicador de profissionalização" />
          <Kpi label="Idade Média" value={`${fmt(PA.idadeMedia)} anos`} sub="Quadro maduro" />
        </div>
      </Section>
    </>
  );
}

