#!/usr/bin/env bash
# test_gen.sh — checagem única do gerador contra a fixture (ponytail: 1 script, sem framework).
set -euo pipefail
cd "$(dirname "$0")"
OUT="$(mktemp -d)"
trap 'rm -rf "$OUT"' EXIT

./gen_daily_patch.py --csv fixtures/cauc-sample.csv --slug palotina --out-dir "$OUT" \
	--cert-numero 5551.ZMES.2910 --cert-emissao 2026-07-29 --cert-vencimento 2026-09-27

SQL="$OUT/2026-07-30/palotina.sql"
[ -f "$SQL" ] || { echo "FAIL: $SQL não gerado"; exit 1; }

assert() { grep -qF "$1" "$SQL" || { echo "FAIL: não achou: $1"; exit 1; }; }
# fixture: 24 ok, 1 warn (item 1.5 = '!'), 3 off (1.1, 1.3, 3.2.4) -> total 25, pendentes 1
assert "VALUES (2026, DATE '2026-07-30', 24, 25, 1, 'Pendente')"
assert "'Tributos, contrib. previdenciárias federais e Dívida Ativa da União (PGFN/RFB)', 'off'"
assert "'Regularidade perante o Poder Público Federal (CADIN)', 'warn'"
assert "'Anexo 12 do RREO ao SIOPS', 'off'"
assert "'Aplicação de 50% da complementação VAAT na educação infantil', 'ok'"
assert "('5551.ZMES.2910', 'Liberatória', 'Regular', DATE '2026-07-29', DATE '2026-09-27', 0,"
assert "SET cert_numero = '5551.ZMES.2910'"
# sem args de certidão -> patch só de CAUC, sem tocar tce/panorama
./gen_daily_patch.py --csv fixtures/cauc-sample.csv --slug palotina --out-dir "$OUT"
grep -qF "DELETE FROM certidao" "$SQL" && { echo "FAIL: patch sem certidão não deveria ter seção tce"; exit 1; }
grep -qF "panorama.tce_resumo" "$SQL" && { echo "FAIL: patch sem certidão não deveria tocar panorama"; exit 1; }
# município inexistente -> exit 1
if ./gen_daily_patch.py --csv fixtures/cauc-sample.csv --slug nao-existe --out-dir "$OUT" 2>/dev/null; then
	echo "FAIL: slug inexistente deveria falhar"; exit 1
fi
echo "PASS"
