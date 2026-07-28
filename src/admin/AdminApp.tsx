import { useState } from "react";
import { ThemeProvider } from "../theme";
import { AdminLogin } from "./AdminLogin";
import { cpApi } from "./cpApi";
import { InstalacaoDetalhe } from "./InstalacaoDetalhe";
import { InstalacoesDashboard } from "./InstalacoesDashboard";
import { LogsView } from "./LogsView";

function Inner() {
	const [logado, setLogado] = useState(!!cpApi.getToken());
	const [abertaId, setAbertaId] = useState<string | null>(null);
	const [verLogs, setVerLogs] = useState(false);
	if (!logado) return <AdminLogin onLogin={() => setLogado(true)} />;
	if (verLogs) return <LogsView onVoltar={() => setVerLogs(false)} />;
	if (abertaId)
		return (
			<InstalacaoDetalhe id={abertaId} onVoltar={() => setAbertaId(null)} />
		);
	return (
		<InstalacoesDashboard
			onAbrir={setAbertaId}
			onLogs={() => setVerLogs(true)}
		/>
	);
}

export function AdminApp() {
	return (
		<ThemeProvider>
			<Inner />
		</ThemeProvider>
	);
}
