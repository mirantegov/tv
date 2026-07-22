# Guia de contribuição

## Fluxo de trabalho

1. Crie uma branch a partir de `main`:
   - `feat/<escopo-curto>` para funcionalidades
   - `fix/<escopo-curto>` para correções
   - `docs/`, `chore/`, `refactor/` conforme o caso
2. Commits pequenos e descritivos em português, no padrão
   [Conventional Commits](https://www.conventionalcommits.org/pt-br):
   `feat: grupo Contas Públicas na sidebar`, `fix: scroll automático ignora módulos ocultos`.
3. Antes de abrir o PR, rode os checks locais (ver abaixo) — o PR só deve ser
   aberto com ambos limpos.
4. Abra o PR contra `main` com resumo do que mudou e como foi verificado
   (screenshot do preview quando for mudança visual).
5. Merge após revisão; a branch remota é apagada no merge.

## Checks obrigatórios

```bash
npm run lint       # biome check .  → sem erros
npm run typecheck  # tsc --noEmit   → sem erros
```

`npm run format` aplica as correções automáticas do Biome.

## Padrões de código

- **Formatação**: Biome manda (indentação por **tabs**, aspas duplas).
  Não discuta estilo no PR — rode `npm run format`.
- **`biome.json` é protegido** — não altere sem alinhamento prévio com o time.
- **Cores sempre do tema** (`useTheme().t`) — nunca hex/oklch hardcoded em
  componente; novas cores entram em `src/theme.tsx` para todas as famílias.
- **Valores em R$ milhões** usando os helpers de `src/format.ts`.
- Reuse os componentes de `src/components.tsx` antes de criar novos.
- Textos de UI em português (pt-BR).
- TypeScript gradual: código novo tipado; `src/data.ts` deve validar sob
  `--strict`.

## Segurança e dados sensíveis

- Arquivos `*.local.md` são **gitignorados** — credenciais e acessos ficam em
  `docs/acessos.local.md`, nunca em arquivos versionados.
- Dados exibidos são fictícios. Ao integrar dados reais, observar a LGPD
  (ex.: maiores devedores em Tributação — anonimizar/restringir por perfil).

## Verificação visual

Mudanças de UI devem ser conferidas no preview (`npm run dev`) nos dois modos
(light/dark) e com a sidebar recolhida/expandida. Para pular o login em teste:
`localStorage.setItem("mg_auth", "1")` + reload (limpe depois).
