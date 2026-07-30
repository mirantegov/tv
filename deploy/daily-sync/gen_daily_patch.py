#!/usr/bin/env python3
"""Gera o patch SQL diário (CAUC + certidão TCE-PR) de um tenant.

CSV oficial (latin-1, ';'): https://www.tesourotransparente.gov.br/ckan/dataset/cauc
Spec: docs/superpowers/specs/2026-07-30-daily-sync-cauc-certidao-design.md

Uso:
  ./gen_daily_patch.py --csv cauc.csv --slug palotina --out-dir ../../db/patches/daily \
    [--cert-numero 5551.ZMES.2910 --cert-emissao 2026-07-29 --cert-vencimento 2026-09-27]
"""
import argparse, csv, json, re, sys
from datetime import datetime
from pathlib import Path

HERE = Path(__file__).resolve().parent

# Ordem = colunas 1.1..5.7 do CSV = ord 1..28 de siconfi.cauc_itens.
COLS = ["1.1", "1.2", "1.3", "1.4", "1.5", "2.1.1", "2.1.2", "3.1.1", "3.1.2",
        "3.2.1", "3.2.2", "3.2.3", "3.2.4", "3.3", "3.4.1", "3.4.2", "3.5",
        "3.6", "3.7", "4.1", "4.2", "5.1", "5.2", "5.3", "5.4", "5.5", "5.6", "5.7"]
ITENS = [
    "Tributos, contrib. previdenciárias federais e Dívida Ativa da União (PGFN/RFB)",
    "Pagamento de precatórios judiciais (Transferegov)",
    "Regularidade com o FGTS (CAIXA)",
    "Adimplência em empréstimos e financiamentos com a União (SAHEM)",
    "Regularidade perante o Poder Público Federal (CADIN)",
    "Prestação de contas de convênios — SIAFI",
    "Prestação de contas de convênios — Transferegov",
    "Publicação do RGF (SICONFI)",
    "Encaminhamento do RGF ao SICONFI",
    "Publicação do RREO (SICONFI)",
    "Encaminhamento do RREO ao SICONFI",
    "Anexo 8 do RREO ao SIOPE",
    "Anexo 12 do RREO ao SIOPS",
    "Encaminhamento das Contas Anuais — DCA",
    "Matriz de Saldos Contábeis mensal (MSC)",
    "Matriz de Saldos Contábeis de encerramento",
    "Cadastro da Dívida Pública — CDP (SADIPEM)",
    "Transparência da execução orçamentária e financeira",
    "Sistema Integrado de Adm. Financeira — SIAFIC",
    "Exercício da plena competência tributária",
    "Regularidade previdenciária (CADPREV)",
    "Aplicação mínima em Educação (25%)",
    "Aplicação mínima em Saúde",
    "Limite de despesas com PPP",
    "Limite de operações de crédito e antecipação de receita",
    "Mínimo do Fundeb — profissionais da educação (70%)",
    "Complementação da União ao Fundeb em despesas de capital",
    "Aplicação de 50% da complementação VAAT na educação infantil",
]
FINALIDADE = ("Recebimento de recursos públicos, mediante convênio, termo de parceria, "
              "contrato de gestão ou instrumento congênere (Instrução Normativa 68/2012).")
CERT_ITENS = [
    "Contas anuais sem pendências de julgamento",
    "Obrigações de remessa (SIM-AM) em dia",
    "Adimplência em ressarcimentos e multas",
    "Atendimento a determinações e recomendações",
]


def die(msg):
    print(f"ERRO: {msg}", file=sys.stderr)
    sys.exit(1)


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--csv")
    p.add_argument("--slug", required=True)
    p.add_argument("--out-dir", required=True)
    p.add_argument("--cert-numero")
    p.add_argument("--cert-emissao")
    p.add_argument("--cert-vencimento")
    a = p.parse_args()

    cert = [a.cert_numero, a.cert_emissao, a.cert_vencimento]
    if any(cert) and not all(cert):
        die("--cert-numero/--cert-emissao/--cert-vencimento vão juntos")
    if not a.csv and not all(cert):
        die("nada a gerar: passe --csv e/ou --cert-*")
    if a.cert_numero and not re.fullmatch(r"[A-Z0-9./-]{4,30}", a.cert_numero):
        die(f"cert-numero suspeito: {a.cert_numero!r}")
    for d in (a.cert_emissao, a.cert_vencimento):
        if d and not re.fullmatch(r"\d{4}-\d{2}-\d{2}", d):
            die(f"data de certidão deve ser YYYY-MM-DD: {d!r}")

    manifest = json.loads((HERE / "tenants.json").read_text())
    tenant = next((t for t in manifest["tenants"] if t["slug"] == a.slug), None)
    if not tenant:
        die(f"slug {a.slug!r} não está em tenants.json")

    # Pasta de saída SEMPRE pela data de execução, nunca pela data do CSV (que pode
    # estar atrasada) — senão um CSV publicado tarde sobrescreve o patch de ontem
    # já aplicado, e o applier pula o arquivo (perda silenciosa de dado).
    run_date = datetime.now().date().isoformat()

    ex = tenant["exercicio"]
    sql = "-- Patch diário gerado por deploy/daily-sync/gen_daily_patch.py — NÃO editar à mão.\n"
    sql += f"-- Tenant: {tenant['nome']} ({a.slug}, IBGE {tenant['codigo_ibge']}).\n"

    if a.csv:
        lines = Path(a.csv).read_bytes().decode("latin-1").splitlines()
        m = re.search(r"Data da Pesquisa:\s*(\d{2}/\d{2}/\d{4})", lines[0] if lines else "")
        if not m:
            die("layout inesperado: 'Data da Pesquisa' ausente na linha 1 — CSV mudou, abortando")
        pesquisa = datetime.strptime(m.group(1), "%d/%m/%Y").date()

        rdr = csv.DictReader(lines[3:], delimiter=";")
        if not rdr.fieldnames or any(c not in rdr.fieldnames for c in COLS + ["Código IBGE"]):
            die("layout inesperado: colunas 1.1..5.7 / 'Código IBGE' ausentes — CSV mudou, abortando")
        row = next((r for r in rdr if r["Código IBGE"] == tenant["codigo_ibge"]), None)
        if not row:
            die(f"IBGE {tenant['codigo_ibge']} ({a.slug}) não encontrado no CSV")

        def status(v):
            v = (v or "").strip()
            if v == "Desabilitado":
                return "off"
            if v == "!":
                return "warn"
            try:
                d = datetime.strptime(v, "%d/%m/%y").date()
            except ValueError:
                die(f"valor inesperado no CSV: {v!r} — abortando")
            return "ok" if d >= pesquisa else "warn"

        itens = [(i + 1, ITENS[i], status(row[c])) for i, c in enumerate(COLS)]
        ok = sum(1 for _, _, s in itens if s == "ok")
        off = sum(1 for _, _, s in itens if s == "off")
        warn = sum(1 for _, _, s in itens if s == "warn")
        total, situacao = 28 - off, ("Regular" if warn == 0 else "Pendente")
        dt = pesquisa.isoformat()  # verificacao/SQL usa a data do CSV

        linhas = ",\n".join(
            f"\t({ex}, DATE '{dt}', {o:2d}, '{txt}', '{s}')" for o, txt, s in itens)
        sql += f"""-- Fonte CAUC: CSV Tesouro Transparente, pesquisa de {pesquisa.strftime('%d/%m/%Y')}.
BEGIN;
SET search_path TO siconfi;

INSERT INTO cauc_resumo (exercicio, verificacao, regulares, total, pendentes, situacao)
VALUES ({ex}, DATE '{dt}', {ok}, {total}, {warn}, '{situacao}')
ON CONFLICT (exercicio, verificacao) DO UPDATE SET
\tregulares = EXCLUDED.regulares, total = EXCLUDED.total,
\tpendentes = EXCLUDED.pendentes, situacao = EXCLUDED.situacao;

INSERT INTO cauc_itens (exercicio, verificacao, ord, exigencia, status) VALUES
{linhas}
ON CONFLICT (exercicio, verificacao, exigencia) DO UPDATE SET
\tord = EXCLUDED.ord, status = EXCLUDED.status;
"""
    else:
        sql += "BEGIN;\n"

    if a.cert_numero:
        cert_linhas = ",\n".join(
            f"\t('{a.cert_numero}', {i + 1}, '{txt}', 'ok')" for i, txt in enumerate(CERT_ITENS))
        sql += f"""
-- Certidão Liberatória TCE-PR (consulta por CNPJ {tenant['cnpj']}).
SET search_path TO tce;
DELETE FROM certidao_itens;
DELETE FROM certidao;
INSERT INTO certidao (numero, tipo, situacao, emissao, vencimento, pendencias, finalidade) VALUES
\t('{a.cert_numero}', 'Liberatória', 'Regular', DATE '{a.cert_emissao}', DATE '{a.cert_vencimento}', 0,
\t '{FINALIDADE}');
INSERT INTO certidao_itens (numero, ord, descricao, status) VALUES
{cert_linhas};

-- Card "Situação Fiscal" (Visão Geral) lê de panorama.tce_resumo.
UPDATE panorama.tce_resumo
\tSET cert_numero = '{a.cert_numero}',
\t\tcert_emissao = DATE '{a.cert_emissao}',
\t\tcert_validade = DATE '{a.cert_vencimento}'
\tWHERE exercicio = {ex};
"""
    sql += "\nCOMMIT;\n\n-- Verificação\n"
    if a.csv:
        sql += "SELECT (data->'cauc'->'kpis') AS cauc_kpis FROM api.siconfi;\n"
    if a.cert_numero:
        sql += "SELECT (data->'certidao'->>'numero') AS certidao_tce FROM api.tce;\n"
        sql += "SELECT (data->'tce'->'certidao'->>'numero') AS certidao_visao_geral FROM api.panorama;\n"
    out = Path(a.out_dir) / run_date / f"{a.slug}.sql"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(sql)
    print(out)


if __name__ == "__main__":
    main()
