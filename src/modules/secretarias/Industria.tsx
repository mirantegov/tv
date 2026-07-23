import { ExecucaoDespesa } from "./shared";

// Secretaria de Indústria. Bloco de Execução da Despesa compartilhado; quadros
// específicos desta secretaria entram abaixo (ou em outra aba) quando definidos.
export default function IndustriaModule() {
	return (
		<>
			<ExecucaoDespesa slug="industria" />
		</>
	);
}
