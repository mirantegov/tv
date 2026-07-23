import { ExecucaoDespesa } from "./shared";

// Secretaria de Controladoria. Bloco de Execução da Despesa compartilhado; quadros
// específicos desta secretaria entram abaixo (ou em outra aba) quando definidos.
export default function ControladoriaModule() {
	return (
		<>
			<ExecucaoDespesa slug="controladoria" />
		</>
	);
}
