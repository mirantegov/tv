import { useState } from "react";
import { ThemeProvider } from "../theme";
import { cpApi } from "./cpApi";
import { AdminLogin } from "./AdminLogin";
import { InstalacoesDashboard } from "./InstalacoesDashboard";

function Inner() {
  const [logado, setLogado] = useState(!!cpApi.getToken());
  const [abertaId, setAbertaId] = useState<string | null>(null);
  if (!logado) return <AdminLogin onLogin={() => setLogado(true)} />;
  if (abertaId) return <div data-testid="detalhe-stub">Detalhe {abertaId} (Task 6)</div>;
  return <InstalacoesDashboard onAbrir={setAbertaId} />;
}

export function AdminApp() {
  return (
    <ThemeProvider>
      <Inner />
    </ThemeProvider>
  );
}
