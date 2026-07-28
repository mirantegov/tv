import { useState } from "react";
import { useTheme } from "../theme";
import { cpApi } from "./cpApi";

export function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const { t } = useTheme();
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    try {
      const { token } = await cpApi.login(login, senha);
      cpApi.setToken(token);
      onLogin();
    } catch { setErro("Login ou senha inválidos."); }
  }

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: t.background, color: t.foreground }}>
      <form onSubmit={submit} style={{ width: 320, padding: 24, background: t.card, border: `1px solid ${t.border}`, borderRadius: 12 }}>
        <h1 style={{ margin: "0 0 16px", fontSize: 18 }}>Mirante · Admin</h1>
        <input aria-label="login" value={login} onChange={(e) => setLogin(e.target.value)} placeholder="login"
          style={{ width: "100%", marginBottom: 8, padding: 8, background: t.background, color: t.foreground, border: `1px solid ${t.border}`, borderRadius: 8 }} />
        <input aria-label="senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="senha"
          style={{ width: "100%", marginBottom: 12, padding: 8, background: t.background, color: t.foreground, border: `1px solid ${t.border}`, borderRadius: 8 }} />
        {erro && <div style={{ color: t.danger, fontSize: 13, marginBottom: 8 }}>{erro}</div>}
        <button type="submit" style={{ width: "100%", padding: 10, background: t.primary, color: t.primaryFg, border: "none", borderRadius: 8, cursor: "pointer" }}>Entrar</button>
      </form>
    </div>
  );
}
