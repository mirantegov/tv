import { ExecucaoDespesa } from "./shared";

// Secretaria de Trânsito. Bloco de Execução da Despesa compartilhado; quadros
// específicos desta secretaria entram abaixo (ou em outra aba) quando definidos.
export default function TransitoModule() {
	return (
		<>
			<ExecucaoDespesa slug="transito" />
		</>
	);
}
