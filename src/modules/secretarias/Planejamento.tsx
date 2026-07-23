import { ExecucaoDespesa } from "./shared";

// Secretaria de Planejamento. Bloco de Execução da Despesa compartilhado; quadros
// específicos desta secretaria entram abaixo (ou em outra aba) quando definidos.
export default function PlanejamentoModule() {
	return (
		<>
			<ExecucaoDespesa slug="planejamento" />
		</>
	);
}
