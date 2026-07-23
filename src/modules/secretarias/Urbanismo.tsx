import { ExecucaoDespesa } from "./shared";

// Secretaria de Urbanismo. Bloco de Execução da Despesa compartilhado; quadros
// específicos desta secretaria entram abaixo (ou em outra aba) quando definidos.
export default function UrbanismoModule() {
	return (
		<>
			<ExecucaoDespesa slug="urbanismo" />
		</>
	);
}
