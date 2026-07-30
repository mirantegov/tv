# Sincronização diária CAUC + Certidão Liberatória (patch-first)

**Data:** 2026-07-30 · **Status:** aprovado (brainstorming)

## Objetivo

Atualizar diariamente, para N tenants, os dados de:

- **CAUC** (28 exigências fiscais) → `siconfi.cauc_resumo` + `siconfi.cauc_itens`
- **Certidão Liberatória TCE-PR** → `tce.certidao` + `tce.certidao_itens` + `panorama.tce_resumo` (card "Situação Fiscal" da Visão Geral — as três tabelas sempre juntas)

sem dar a agentes externos acesso SSH/senha de banco de produção, e mantendo
histórico versionado em git de cada atualização.

## Arquitetura (opção 2 — patch-first)

Duas peças desacopladas; o git é a fronteira entre elas.

```
[Hermes/Claude Work, 9h00]                [VPS, cron 9h30]
  baixa CSV CAUC (CKAN)                     git pull --ff-only
  raspa certidão TCE-PR por CNPJ            varre db/patches/daily/
  gera db/patches/daily/<data>/<slug>.sql   aplica pendentes via docker exec psql
  commit + push na main          ──git──►   marca aplicados em log local
```

O agente **só tem permissão de git** (clone/push no repo). Nunca SSH, nunca
senha de Postgres. Scraping de site externo fica isolado da infra de produção
(mitiga prompt-injection via conteúdo raspado).

### Por que não aplicar direto do agente

Agente com plugins de scraping lê conteúdo não confiável; se ele também
carregasse credenciais de produção, uma página maliciosa teria caminho até o
banco. Rejeitado (era a opção 1 do brainstorming).

## Fontes de dados

### CAUC — CSV oficial (Tesouro Transparente / CKAN)

- Dataset: `https://www.tesourotransparente.gov.br/ckan/dataset/cauc`
- CSV municípios (URL estável): `https://www.tesourotransparente.gov.br/ckan/dataset/72b5f371-0c35-4613-8076-c99c821a6410/resource/07af297a-5e59-494a-a88a-55ddfd2f4b01/download/relatorio-situacao-de-varios-entes---municipios---uf-todas---abrangencia-1.csv`
- Encoding **latin-1** (converter para UTF-8), separador `;`, 3 linhas de
  preâmbulo (data da pesquisa, tipo de ente, abrangência), header na linha 4.
- Uma linha por município; chave = coluna `Código IBGE`.
- Colunas `1.1` … `5.7` = os 28 itens do extrato, na mesma ordem já usada em
  `siconfi.cauc_itens` (ord 1–28).
- Publicado em dias úteis, ~8h10 BRT. Job do agente roda às **9h00**.
- Sem captcha, sem login, sem navegador — download HTTP simples.

Semântica dos valores (conforme Metadados CAUC Municípios, PDF do dataset):

| Valor da célula | Significado | status em `cauc_itens` |
|---|---|---|
| data `DD/MM/AA` futura | requisito comprovado, válido até a data | `ok` |
| data `DD/MM/AA` vencida (< data da pesquisa) | comprovação expirada | `warn` |
| `!` | CAUC não obteve comprovação | `warn` (conta em `pendentes`) |
| `Desabilitado` | item indisponível para todos os entes | `off` |

`cauc_resumo`: `regulares` = qtde `ok`; `pendentes` = qtde `warn`;
`total` = 28 − qtde `off`; `situacao` = `'Regular'` se `pendentes = 0`,
senão `'Pendente'`; `verificacao` = "Data da Pesquisa" do preâmbulo do CSV.

### Certidão Liberatória — scraping TCE-PR

- URL por CNPJ: `https://servicos.tce.pr.gov.br/TCEPR/Tribunal/CertidaoLiberatoria/srv_certidao_emissao.aspx?nrCNPJ=<CNPJ_SEM_PONTUACAO>`
- Página pública, sem captcha. Extrair: número (`9999.XXXX.9999`), data de
  emissão, data de vencimento, situação.
- Os 4 itens de `tce.certidao_itens` (contas anuais, SIM-AM, ressarcimentos,
  determinações) não vêm da página; replicar os textos fixos atuais com
  status `ok` quando a certidão está Regular.
- Se a página indicar situação irregular/impedimento, gerar o patch com
  `situacao` refletindo o texto da página e `pendencias > 0`, e sinalizar no
  resumo da execução (é exatamente o dia em que o cliente mais precisa ver).

## Componentes

### 1. Manifesto de tenants — `deploy/daily-sync/tenants.json` (novo, versionado)

O que torna o job genérico. Tenant novo = uma entrada nova.

```json
{
  "tenants": [
    {
      "slug": "palotina",
      "nome": "Município de Palotina",
      "codigo_ibge": "4117909",
      "cnpj": "76208487000164",
      "exercicio": 2026
    }
  ]
}
```

`stage` usa dados de Palotina: o aplicador na VPS aplica o patch de
`palotina` também no container de stage (grupo `tenants.stage.txt`).

### 2. Runbook do agente — `deploy/daily-sync/AGENT.md` (novo, versionado)

Documento-prompt que o Hermes Agent / Claude Work executa como tarefa
agendada (9h00, dias úteis). Passos:

1. Clonar/atualizar o repo (`main`).
2. Baixar o CSV do CAUC; converter latin-1 → UTF-8. Validar: header esperado
   na linha 4 e "Data da Pesquisa" presente — se o layout mudou, **abortar
   sem gerar patch** e reportar.
3. Para cada tenant do manifesto:
   a. Localizar a linha pelo `codigo_ibge`; mapear os 28 itens (tabela acima).
   b. Buscar a certidão TCE-PR pelo `cnpj`; extrair número/emissão/vencimento.
   c. Gerar `db/patches/daily/YYYY-MM-DD/<slug>.sql` a partir do template.
4. Commit único (`chore(daily-sync): CAUC + certidão YYYY-MM-DD`) e push na
   `main`.
5. Se qualquer fonte falhar para um tenant, gerar os patches dos demais e
   reportar o que ficou de fora. Nunca inventar valores: sem dado, sem patch.

Regra de idempotência do dia: se `db/patches/daily/<hoje>/<slug>.sql` já
existe no repo, sobrescrever (re-execução do job no mesmo dia é segura).

### 3. Template de patch — `deploy/daily-sync/patch.template.sql` (novo)

Mesmo formato dos patches manuais de 2026-07-30 (que serviram de protótipo):

- `BEGIN` … `COMMIT`, idempotente.
- `siconfi.cauc_resumo` + `cauc_itens`: INSERT novo snapshot com
  `ON CONFLICT DO UPDATE` (a view `api.siconfi` pega o mais recente por
  `verificacao DESC` — snapshots antigos ficam como histórico no banco).
- `tce.certidao` + `certidao_itens`: `DELETE` + `INSERT` (a view `api.tce`
  faz `LIMIT 1` sem `ORDER BY` — só pode existir uma certidão).
- `panorama.tce_resumo`: `UPDATE` de `cert_numero`/`cert_emissao`/
  `cert_validade` do exercício corrente.
- `SELECT`s de verificação no fim (cauc kpis, certidão nos dois módulos).

### 4. Aplicador — `deploy/apply-daily-patches.sh` (novo) + cron

Roda na VPS às **9h30** (dias úteis), mesmo padrão do `ingest.sh`:

1. `cd /opt/mirante && git pull --ff-only`.
2. Para cada arquivo `db/patches/daily/*/<slug>.sql` não listado no log de
   aplicados (`/opt/mirante/.daily-patches-applied`, uma linha por caminho):
   - Resolver o container pelo slug (`mirante-<slug>-db-1`); se o tenant não
     está no host (sem `.env.<slug>`), pular com aviso.
   - `docker exec -i … psql -v ON_ERROR_STOP=1 …` com o patch.
   - Sucesso → acrescenta o caminho ao log. Falha → **não** marca, loga erro
     e continua para os demais (patch idempotente: retry no dia seguinte).
   - Patch de `palotina` aplica também no tenant `stage`.
3. Log em `/var/log/mirante-daily-patches.log`.

Cron (`/etc/cron.d/mirante-daily-patches`):

```
30 9 * * 1-5 ec2-user cd /opt/mirante/deploy && ./apply-daily-patches.sh >> /var/log/mirante-daily-patches.log 2>&1
```

Atenção ao fuso do host (UTC vs BRT) ao instalar — documentar no README.

## Tratamento de erros

| Falha | Comportamento |
|---|---|
| CSV fora do ar / layout mudou | Agente aborta CAUC, reporta; certidões ainda são geradas |
| TCE-PR fora do ar | Patch sai só com CAUC; certidão mantém o valor anterior no banco |
| Município ausente do CSV | Pula o tenant, reporta |
| psql falha na VPS | Não marca como aplicado; retry automático no dia seguinte |
| Patch de dia anterior nunca aplicado | Continua pendente no log; aplicado no próximo run (idempotente) |

## Testes

- **Template/geração**: gerar patch de Palotina a partir do CSV real baixado e
  comparar com o patch manual de 2026-07-30 (mesmos valores → mesmo SQL).
- **Aplicador**: teste manual documentado no README: rodar com um patch de
  teste num tenant de stage e conferir os `SELECT`s de verificação.
- **Ponta a ponta**: primeira execução real supervisionada (agente gera →
  revisar o commit → cron aplica → conferir painel).

## Fora de escopo (backlog)

- **Opção 3 — warehouse**: quando o ClickHouse subir para os outros módulos,
  esta ingestão migra para `deploy/ingest/ingest.sh` (TRUNCATE+COPY) e o
  fluxo patch-first é aposentado. Registrado como evolução planejada.
- Retenção/limpeza de `db/patches/daily/` (avaliar após alguns meses).
- Estados/DF (o dataset CKAN tem CSV separado; hoje só municípios).
