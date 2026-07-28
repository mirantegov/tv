import { useState } from "react";
import { ThemeProvider } from "../theme";
import { cpApi } from "./cpApi";
import { AdminLogin } from "./AdminLogin";
import { InstalacoesDashboard } from "./InstalacoesDashboard";
import { InstalacaoDetalhe } from "./InstalacaoDetalhe";

function Inner() {
  const [logado, setLogado] = useState(!!cpApi.getToken());
  const [abertaId, setAbertaId] = useState<string | null>(null);
  if (!logado) return <AdminLogin onLogin={() => setLogado(true)} />;
  if (abertaId) return <InstalacaoDetalhe id={abertaId} onVoltar={() => setAbertaId(null)} />;
  return <InstalacoesDashboard onAbrir={setAbertaId} />;
}

export function AdminApp() {
  return (
    <ThemeProvider>
      <Inner />
    </ThemeProvider>
  );
}
