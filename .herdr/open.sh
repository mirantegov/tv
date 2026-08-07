#!/bin/sh
# Abre o workspace deste repo no herdr com as abas padrão.
# Uso: ./.herdr/open.sh   (se o workspace já existir, só foca)
set -eu

REPO=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
LABEL=${HERDR_WORKSPACE:-tv}

# aba:comando (comando vazio = shell puro)
TABS='claude:claude
codex:codex
opencode:opencode
lazygit:lazygit
terminal:'

ws=$(herdr workspace list | jq -r --arg l "$LABEL" '.result.workspaces[]|select(.label==$l)|.workspace_id' | head -n1)
if [ -n "$ws" ]; then
	herdr workspace focus "$ws" >/dev/null
	echo "workspace '$LABEL' já aberto ($ws)"
	exit 0
fi

created=$(herdr workspace create --cwd "$REPO" --label "$LABEL")
ws=$(printf %s "$created" | jq -r .result.workspace.workspace_id)
tab=$(printf %s "$created" | jq -r .result.tab.tab_id)
pane=$(printf %s "$created" | jq -r .result.root_pane.pane_id)

printf '%s\n' "$TABS" | while IFS=: read -r label cmd; do
	if [ -n "$tab" ]; then
		herdr tab rename "$tab" "$label" >/dev/null # reaproveita a aba 1 do workspace novo
		tab=
	else
		out=$(herdr tab create --workspace "$ws" --cwd "$REPO" --label "$label" --no-focus)
		pane=$(printf %s "$out" | jq -r .result.root_pane.pane_id)
	fi
	if [ -n "$cmd" ]; then
		herdr pane run "$pane" "$cmd"
	fi
done

echo "workspace '$LABEL' criado ($ws)"
