import { useState } from "react";
import { ThemeProvider } from "../theme";
import { cpApi } from "./cpApi";
import { AdminLogin } from "./AdminLogin";

function Inner() {
  const [logado, setLogado] = useState(!!cpApi.getToken());
  if (!logado) return <AdminLogin onLogin={() => setLogado(true)} />;
  return <div data-testid="admin-dashboard">Dashboard (Task 5)</div>;
}

export function AdminApp() {
  return (
    <ThemeProvider>
      <Inner />
    </ThemeProvider>
  );
}
