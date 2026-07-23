import { ExecucaoDespesa } from "./shared";

// Secretaria de Finanças. Bloco de Execução da Despesa compartilhado; quadros
// específicos desta secretaria entram abaixo (ou em outra aba) quando definidos.
export default function FinancasModule() {
	return (
		<>
			<ExecucaoDespesa slug="financas" />
		</>
	);
}
