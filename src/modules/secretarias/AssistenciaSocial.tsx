import { ExecucaoDespesa } from "./shared";

// Secretaria de Assistência Social. Bloco de Execução da Despesa compartilhado; quadros
// específicos desta secretaria entram abaixo (ou em outra aba) quando definidos.
export default function AssistenciaSocialModule() {
	return (
		<>
			<ExecucaoDespesa slug="assistencia-social" />
		</>
	);
}
