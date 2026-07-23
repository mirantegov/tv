import { ExecucaoDespesa } from "./shared";

// Secretaria de Educação. Bloco de Execução da Despesa compartilhado; quadros
// específicos desta secretaria entram abaixo (ou em outra aba) quando definidos.
export default function EducacaoModule() {
	return (
		<>
			<ExecucaoDespesa slug="educacao" />
		</>
	);
}
