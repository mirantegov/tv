# Setup do ambiente

## Requisitos

- Node.js **18+** (recomendado 20 LTS)
- npm (acompanha o Node)

## Instalação e execução

```bash
git clone git@github.com:mirantegov/tv.git
cd tv
npm install
npm run dev        # http://localhost:5173 (abre no navegador)
```

## Comandos

| Comando             | O que faz                                   |
| ------------------- | ------------------------------------------- |
| `npm run dev`       | Servidor de desenvolvimento (Vite, HMR)     |
| `npm run build`     | Build de produção em `dist/`                |
| `npm run preview`   | Serve o build de produção                   |
| `npm run typecheck` | `tsc --noEmit`                              |
| `npm run lint`      | `biome check .`                             |
| `npm run format`    | `biome check --write .` (formata e corrige) |

## Login (demonstração)

A validação é **somente no cliente**: qualquer **CPF válido** (dígitos
verificadores corretos) e **senha de 8 caracteres alfanuméricos** entram.
Credenciais de teste compartilhadas ficam em `docs/acessos.local.md`
(gitignorado — peça a um colega, não commite).

Para pular o login durante testes automatizados/preview:
`localStorage.setItem("mg_auth", "1")` e recarregue.

## Chaves de localStorage

| Chave        | Uso                                                        |
| ------------ | ---------------------------------------------------------- |
| `mg_auth`    | `"1"` = autenticado (persistência do "manter conectado")   |
| `mg_sidebar` | `"1"` = sidebar recolhida                                  |
| `mg_modules` | JSON array de rotas ocultas na sidebar (menu Módulos)      |
| `mg_extras`  | `"0"` = seção Análises e Alertas desligada (padrão ligado) |
