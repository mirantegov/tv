import { ExecucaoDespesa } from "./shared";

// Secretaria de Desenv. Econômico. Bloco de Execução da Despesa compartilhado; quadros
// específicos desta secretaria entram abaixo (ou em outra aba) quando definidos.
export default function DesenvolvimentoEconomicoModule() {
	return (
		<>
			<ExecucaoDespesa slug="desenvolvimento-economico" />
		</>
	);
}
