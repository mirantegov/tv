# Brainstorming — Funcionalidades Extras vendáveis (add-ons)

> Status: **ideias parqueadas** (não é design aprovado). Voltar aqui para
> escolher UMA e transformar em spec → plano → implementação.
> Data: 2026-07-22

## Contexto

O extra "Análises e Alertas" já provou a tese: o que se vende neste tipo de
painel municipal **não é o gráfico** (o passado), e sim a **inteligência em
cima do dado**. Hoje ele é uma camada de insights curados por módulo
(severidade crítico/atenção/insight + descrição + deep-link + ação sugerida).

Estas ideias estendem essa tese. Critérios que toda ideia abaixo cumpre:
1. **Gera valor** claro.
2. **É rara** nesse tipo de projeto (concorrência mostra só dashboard do passado).
3. **É vendável como add-on isolado.**

Reaproveitam a base já construída: warehouse ClickHouse + ETL noturno,
PostgREST, dados TCE-PR/SICONFI/LRF, modo TV, multi-tenant por entidade.

Perfil de comprador varia por município: em uns o **prefeito**, em outros os
**secretários** (administração/finanças), em outros os **técnicos** que querem
automação. O catálogo cobre os quatro perfis.

---

## 🛡️ Blindagem / Compliance — *vende segurança (prefeito, controlador, contador)*

### 1. Semáforo do Gestor — Simulador de Limites LRF ⭐ (flagship)
Projeta Pessoal/RCL, Dívida e demais limites até o fim do exercício **e do
mandato**, e responde ao "e se": *"se eu nomear 30 servidores e der 6% de
reajuste, quando estouro o prudencial?"*. Antecipa o estouro antes de
acontecer. Ouro em ano eleitoral (vedações art. 21/42 LRF).

### 2. Radar de Apontamentos TCE-PR ⭐
Biblioteca das irregularidades típicas que o TCE-PR aponta, cruzada com o dado
atual → *"você tem 7 dos padrões que costumam virar apontamento"*. É uma
**pré-auditoria**. O "Análises e Alertas" é o embrião; aqui vira produto.

### 3. Modo Fim de Mandato (art. 42 LRF)
Nos últimos 2 quadrimestres, vigia se cada despesa assumida tem lastro de caixa
por fonte. Sazonal, altíssimo valor em 2028.

---

## 💰 Gestão / Economia — *vende ROI (secretário de finanças/administração)*

### 4. Previsão de Fluxo de Caixa (até dezembro) ⭐ (flagship)
Usa histórico no warehouse pra prever entradas (receita) × saídas (folha,
contratos, restos a pagar) e aponta o gargalo semanas antes: *"caixa aperta na
2ª quinzena de nov"*. Prefeitura quase nunca tem forecasting — vende "não
atrasa folha nem fornecedor".

### 5. Radar de Economia em Contratos
Detecta contrato acima da mediana de itens similares, aditivo perto do teto de
25%, vigência vencendo. Aponta R$ economizável — ROI direto.

### 6. Priorizador de Dívida Ativa / Arrecadação
Ordena a cobrança por probabilidade de recuperação e mostra "R$ recuperável" e
o próximo passo (protesto/execução). Transforma Tributação em máquina de caixa.

---

## 📣 Política / Transparência — *vende imagem (prefeito, comunicação)*

### 7. Prefeitura em Números (Portal do Cidadão) ⭐
Versão **pública read-only** de módulos selecionados, em linguagem cidadã ("pra
onde vai seu imposto"), embutível no site da prefeitura. Cumpre Lei de Acesso e
vira narrativa — acima do portal-transparência burocrático padrão.

### 8. Comparador Intermunicipal (Benchmark) ⭐ (flagship)
Compara o município com pares de mesmo porte/região usando dados abertos
SICONFI/Finbra: *"gastamos 12% menos em administração que a média regional"*.
Prova de boa gestão, factível com dado público.

### 9. Gerador de Prestação de Contas do Mandato
Monta automaticamente o "balanço do ano/mandato" em slides/PDF com destaques
(obras, economia, arrecadação) pra câmara e imprensa.

---

## ⚙️ Produtividade / Automação — *vende tempo (equipe técnica)*

### 10. Copiloto em Linguagem Natural ⭐ (flagship)
*"Quanto gastamos com saúde este ano vs 2025?"* → número + gráfico + fonte,
consultando o warehouse. IA em cima do dado já estruturado. Alto apelo, raro no
setor.

### 11. Central de Obrigações / Calendário Fiscal
Junta prazos dispersos (RREO, RGF, SIOPS, SIOPE, agenda TCE) num só lugar com
checklist, responsável e alerta. Elimina o "esqueci de publicar".

### 12. Gerador de Ofícios/Justificativas
A partir de um alerta, redige o texto (renovação de contrato, resposta a
diligência do TCE, justificativa de dispensa). Vende horas de trabalho.

---

## Recomendação de flagships (um por perfil)

| # | Feature | Perfil | Por que primeiro |
|---|---------|--------|------------------|
| 1 | Semáforo LRF | Compliance | Diferenciação máxima; sazonal (eleição) |
| 4 | Fluxo de Caixa | Gestão | ROI tangível; usa warehouse |
| 8 | Comparador Intermunicipal | Política | Dado público, baixo custo de dado |
| 10 | Copiloto NL | Automação | Alto apelo comercial ("efeito uau") |

## Próximo passo

Escolher **UMA** para virar spec/design detalhado (`docs/superpowers/specs/`).
Cada uma segue seu próprio ciclo spec → plano → implementação.
