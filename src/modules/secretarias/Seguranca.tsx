import { ExecucaoDespesa } from "./shared";

// Secretaria de Segurança. Bloco de Execução da Despesa compartilhado; quadros
// específicos desta secretaria entram abaixo (ou em outra aba) quando definidos.
export default function SegurancaModule() {
	return (
		<>
			<ExecucaoDespesa slug="seguranca" />
		</>
	);
}
