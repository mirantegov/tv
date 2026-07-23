import { ExecucaoDespesa } from "./shared";

// Secretaria de Meio Ambiente. Bloco de Execução da Despesa compartilhado; quadros
// específicos desta secretaria entram abaixo (ou em outra aba) quando definidos.
export default function MeioAmbienteModule() {
	return (
		<>
			<ExecucaoDespesa slug="meio-ambiente" />
		</>
	);
}
