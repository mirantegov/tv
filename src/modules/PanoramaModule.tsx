import React from "react";
import { useTheme } from "../theme";
import { Card } from "../components";
import { PAN } from "../data";

export default function PanoramaModule() {
  const { t } = useTheme();
  const P = PAN;
  const Sec = ({ icon, title, children }) => (
    <Card className="p-5 mb-4">
      <div className="flex items-center gap-2 mb-4">
        <span style={{ fontSize: 17 }}>{icon}</span>
        <h3 className="text-sm font-bold" style={{ color: t.foreground }}>{title}</h3>
      </div>
      {children}
    </Card>
  );
  const Ind = ({ label, value, unit, meta }: { label?: React.ReactNode; value?: React.ReactNode; unit?: React.ReactNode; meta?: React.ReactNode }) => (
    <div className="rounded-lg" style={{ background: t.muted, padding: "13px 14px" }}>
      <div className="text-xs mb-1" style={{ color: t.mutedFg }}>{label}</div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-xl font-bold tabular-nums" style={{ color: t.foreground }}>{value}</span>
        {unit && <span className="text-xs" style={{ color: t.mutedFg }}>{unit}</span>}
      </div>
      <div className="text-xs mt-1" style={{ color: t.mutedFg, opacity: 0.75 }}>{meta}</div>
    </div>
  );
  const m = (o, fonte) => `${fonte} · ${o.ano}${o.ibge ? "" : " · ilustrativo"}`;
  return (
    <>
      <Card className="p-5 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-xl font-bold" style={{ color: t.foreground }}>{P.municipio}</h2>
              <span className="text-sm font-semibold" style={{ color: t.primary }}>{P.uf}</span>
            </div>
            <div className="text-xs mt-1" style={{ color: t.mutedFg }}>Gentílico: {P.gentilico} · Código IBGE: {P.codigo} · Bioma: {P.territorio.bioma} · Hierarquia urbana: {P.territorio.hierarquia}</div>
          </div>
          <div className="rounded-lg text-center" style={{ background: t.muted, padding: "10px 18px" }}>
            <div className="text-xs" style={{ color: t.mutedFg }}>IDHM</div>
            <div className="text-2xl font-bold tabular-nums" style={{ color: t.ok }}>{P.idhm.v}</div>
            <div className="text-xs" style={{ color: t.mutedFg }}>{P.idhm.faixa} · {P.idhm.ano}</div>
          </div>
        </div>
        <div className="text-xs mt-3" style={{ color: t.mutedFg }}>Estrutura do Panorama Municipal (IBGE Cidades). Indicadores sem a marca "ilustrativo" foram coletados da página oficial do IBGE; os demais serão preenchidos por município via API do IBGE.</div>
      </Card>

      <Sec icon="👥" title="População">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Ind label="População no último censo" value={P.populacao.censo.v} unit="pessoas" meta={m(P.populacao.censo, "Censo IBGE")} />
          <Ind label="População estimada" value={P.populacao.estimada.v} unit="pessoas" meta={m(P.populacao.estimada, "IBGE")} />
          <Ind label="Densidade demográfica" value={P.populacao.densidade.v} unit="hab/km²" meta={m(P.populacao.densidade, "Censo IBGE")} />
          <Ind label="Posição populacional no PR" value={P.populacao.rankUf} meta="ranking estadual · ilustrativo" />
        </div>
      </Sec>

      <Sec icon="💼" title="Trabalho e Rendimento">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Ind label="Salário médio dos trabalhadores formais" value={P.trabalho.salarioMedio.v} unit="salários mínimos" meta={m(P.trabalho.salarioMedio, "CEMPRE/IBGE")} />
          <Ind label="Pessoal ocupado" value={P.trabalho.ocupado.v} unit="pessoas" meta={m(P.trabalho.ocupado, "CEMPRE/IBGE")} />
          <Ind label="População ocupada" value={P.trabalho.ocupadaPct.v} unit="%" meta={m(P.trabalho.ocupadaPct, "CEMPRE/IBGE")} />
          <Ind label="Rendimento per capita de até ½ salário mínimo" value={P.trabalho.meioSM.v} unit="% da população" meta={m(P.trabalho.meioSM, "Censo IBGE")} />
        </div>
      </Sec>

      <Sec icon="🎓" title="Educação">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Ind label="Escolarização de 6 a 14 anos" value={P.educacao.escolarizacao.v} unit="%" meta={m(P.educacao.escolarizacao, "Censo IBGE")} />
          <Ind label="IDEB — anos iniciais (rede pública)" value={P.educacao.idebIniciais.v} meta={m(P.educacao.idebIniciais, "INEP")} />
          <Ind label="IDEB — anos finais (rede pública)" value={P.educacao.idebFinais.v} meta={m(P.educacao.idebFinais, "INEP")} />
          <Ind label="Matrículas no ensino fundamental" value={P.educacao.matFund.v} unit="alunos" meta={m(P.educacao.matFund, "Censo Escolar")} />
          <Ind label="Matrículas no ensino médio" value={P.educacao.matMedio.v} unit="alunos" meta={m(P.educacao.matMedio, "Censo Escolar")} />
          <Ind label="Docentes no ensino fundamental" value={P.educacao.docFund.v} meta={m(P.educacao.docFund, "Censo Escolar")} />
          <Ind label="Estabelecimentos de ensino" value={P.educacao.escolas.v} unit="escolas" meta={m(P.educacao.escolas, "Censo Escolar")} />
        </div>
      </Sec>

      <Sec icon="📈" title="Economia">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Ind label="PIB per capita" value={`R$ ${P.economia.pibPerCapita.v}`} meta={m(P.economia.pibPerCapita, "IBGE")} />
          <Ind label="Total de receitas brutas realizadas" value={`R$ ${P.economia.receitas.v} mi`} meta={m(P.economia.receitas, "Siconfi/STN")} />
          <Ind label="Total de despesas brutas empenhadas" value={`R$ ${P.economia.despesas.v} mi`} meta={m(P.economia.despesas, "Siconfi/STN")} />
          <Ind label="Receitas oriundas de fontes externas" value={P.economia.fontesExternasPct.v} unit="%" meta={m(P.economia.fontesExternasPct, "IBGE")} />
        </div>
        <div className="text-xs mt-3" style={{ color: t.mutedFg }}>PIB per capita entre os mais altos do estado ({P.economia.rankPibUf} · ilustrativo) — economia puxada pelo agronegócio e pela agroindústria.</div>
      </Sec>

      <Sec icon="🏥" title="Saúde">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Ind label="Mortalidade infantil" value={P.saude.mortInfantil.v} unit="óbitos / mil nascidos vivos" meta={m(P.saude.mortInfantil, "SIM/Datasus")} />
          <Ind label="Internações por diarreia" value={P.saude.diarreia.v} unit="por mil hab." meta={m(P.saude.diarreia, "Datasus")} />
          <Ind label="Estabelecimentos de saúde (SUS)" value={P.saude.estabSus.v} meta={m(P.saude.estabSus, "CNES")} />
        </div>
      </Sec>

      <Sec icon="🗺️" title="Território e Ambiente">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Ind label="Área territorial" value={P.territorio.area.v} unit="km²" meta={m(P.territorio.area, "IBGE")} />
          <Ind label="Esgotamento sanitário adequado" value={P.territorio.esgoto.v} unit="%" meta={m(P.territorio.esgoto, "Censo IBGE")} />
          <Ind label="Arborização de vias públicas" value={P.territorio.arborizacao.v} unit="%" meta={m(P.territorio.arborizacao, "Censo IBGE")} />
          <Ind label="Urbanização de vias públicas" value={P.territorio.viasUrb.v} unit="%" meta={m(P.territorio.viasUrb, "Censo IBGE")} />
        </div>
      </Sec>
    </>
  );
}

