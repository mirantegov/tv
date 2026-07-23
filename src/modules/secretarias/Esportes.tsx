import { ExecucaoDespesa } from "./shared";

// Secretaria de Esportes. Bloco de Execução da Despesa compartilhado; quadros
// específicos desta secretaria entram abaixo (ou em outra aba) quando definidos.
export default function EsportesModule() {
	return (
		<>
			<ExecucaoDespesa slug="esportes" />
		</>
	);
}
