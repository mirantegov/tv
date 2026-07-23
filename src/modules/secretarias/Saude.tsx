import { ExecucaoDespesa } from "./shared";

// Secretaria de Saúde. Bloco de Execução da Despesa compartilhado; quadros
// específicos desta secretaria entram abaixo (ou em outra aba) quando definidos.
export default function SaudeModule() {
	return (
		<>
			<ExecucaoDespesa slug="saude" />
		</>
	);
}
