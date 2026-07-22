import React, { createContext, useContext, useState, useMemo } from "react";

export const THEMES = {
  ocean: {
    label: "Ocean Breeze",
    dark: {
      t: {
        background: "oklch(0.2058 0.0353 213)", foreground: "oklch(0.9244 0.0181 196.85)",
        card: "oklch(0.2483 0.0400 211)", primary: "oklch(0.7000 0.1050 201.5)", primaryFg: "oklch(0.18 0.03 213)",
        secondary: "oklch(0.3000 0.0420 208)", muted: "oklch(0.2750 0.0350 210)", mutedFg: "oklch(0.7100 0.0420 200)",
        accent: "oklch(0.3200 0.0500 205)", border: "oklch(0.3300 0.0400 207)",
        ok: "oklch(0.74 0.13 165)", warn: "oklch(0.80 0.13 80)", danger: "oklch(0.64 0.19 25.54)",
      },
      cats: ["oklch(0.70 0.095 203.28)", "oklch(0.76 0.10 188)", "oklch(0.72 0.085 232)", "oklch(0.80 0.105 201)", "oklch(0.74 0.10 172)", "oklch(0.70 0.082 250)", "oklch(0.84 0.085 201.9)", "oklch(0.80 0.082 215)"],
      prev: "oklch(0.46 0.050 202)", cur: "oklch(0.72 0.105 201.5)",
    },
    light: {
      t: {
        background: "oklch(0.9491 0.0085 197.0126)", foreground: "oklch(0.3772 0.0619 212.664)",
        card: "oklch(0.9724 0.0053 197.0692)", primary: "oklch(0.5624 0.0947 203.2755)", primaryFg: "oklch(1 0 0)",
        secondary: "oklch(0.9244 0.0181 196.845)", muted: "oklch(0.9295 0.0107 196.9723)", mutedFg: "oklch(0.5428 0.0594 201.5662)",
        accent: "oklch(0.9021 0.0297 201.8915)", border: "oklch(0.8931 0.0205 204.4136)",
        ok: "oklch(0.62 0.12 165)", warn: "oklch(0.70 0.14 70)", danger: "oklch(0.5732 0.1901 25.5409)",
      },
      cats: ["oklch(0.5624 0.0947 203.28)", "oklch(0.6500 0.1000 188)", "oklch(0.5800 0.0850 232)", "oklch(0.7124 0.1075 201.25)", "oklch(0.6100 0.1000 172)", "oklch(0.5300 0.0780 250)", "oklch(0.7757 0.0951 201.9)", "oklch(0.6900 0.0820 215)"],
      prev: "oklch(0.7757 0.0951 201.9)", cur: "oklch(0.5624 0.0947 203.28)",
    },
  },
  monokai: {
    label: "Monokai",
    dark: {
      t: {
        background: "#1c1d19", foreground: "#f8f8f2",
        card: "#272822", primary: "#a6e22e", primaryFg: "#1c1d19",
        secondary: "#3e3d32", muted: "#33342c", mutedFg: "#a6a08a",
        accent: "#3e3d32", border: "#46473b",
        ok: "#a6e22e", warn: "#fd971f", danger: "#f92672",
      },
      cats: ["#a6e22e", "#66d9ef", "#fd971f", "#ae81ff", "#e6db74", "#f92672", "#5fd7af", "#7aa6ff"],
      prev: "#75715e", cur: "#a6e22e",
    },
    light: {
      t: {
        background: "#f6f6ef", foreground: "#272822",
        card: "#fcfcf5", primary: "#4ca50f", primaryFg: "#ffffff",
        secondary: "#e9e9dd", muted: "#eeeee2", mutedFg: "#6f6e5f",
        accent: "#e4e4d4", border: "#dcdccd",
        ok: "#4ca50f", warn: "#c2790a", danger: "#d11a5e",
      },
      cats: ["#4ca50f", "#1f9bbf", "#cc7a00", "#7d4fd1", "#a9920a", "#d11a5e", "#149b7a", "#3a5fd1"],
      prev: "#b9b39a", cur: "#4ca50f",
    },
  },
};
function buildTheme(family, mode) {
  const fam = THEMES[family] || THEMES.ocean;
  return fam[mode] || fam.dark;
}
const ThemeCtx = createContext(null);
export function ThemeProvider({ children }) {
  const [family, setFamily] = useState("ocean");
  const [mode, setMode] = useState("dark");
  const value = useMemo(() => ({
    ...buildTheme(family, mode), family, mode, familyLabel: THEMES[family].label,
    setFamily, setMode,
    toggle: () => setMode((m) => (m === "dark" ? "light" : "dark")),
  }), [family, mode]);
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}
export const useTheme = () => useContext(ThemeCtx);

export function ThemeConfig() {
  const { t, family, mode, familyLabel, setFamily, setMode } = useTheme();
  const [open, setOpen] = useState(false);
  const Opt = ({ active, onClick, children }) => (
    <button onClick={onClick} className="text-xs rounded-md text-center" style={{ flex: 1, padding: "7px 8px", background: active ? t.primary : t.muted, color: active ? t.primaryFg : t.foreground, border: `1px solid ${active ? t.primary : t.border}`, cursor: "pointer", fontWeight: active ? 600 : 500 }}>{children}</button>
  );
  return (
    <div style={{ position: "relative" }}>
      {open && (
        <div className="rounded-lg" style={{ position: "absolute", bottom: "calc(100% + 8px)", left: 0, right: 0, background: t.card, border: `1px solid ${t.border}`, boxShadow: "0 12px 30px rgba(0,0,0,0.35)", padding: 12, zIndex: 30 }}>
          <div className="text-xs font-semibold mb-2" style={{ color: t.mutedFg }}>Tema</div>
          <div className="flex gap-2 mb-3">
            <Opt active={family === "ocean"} onClick={() => setFamily("ocean")}>Ocean Breeze</Opt>
            <Opt active={family === "monokai"} onClick={() => setFamily("monokai")}>Monokai</Opt>
          </div>
          <div className="text-xs font-semibold mb-2" style={{ color: t.mutedFg }}>Modo</div>
          <div className="flex gap-2">
            <Opt active={mode === "light"} onClick={() => setMode("light")}>☀ Light</Opt>
            <Opt active={mode === "dark"} onClick={() => setMode("dark")}>☾ Dark</Opt>
          </div>
        </div>
      )}
      <button onClick={() => setOpen((o) => !o)} aria-label="Configurar tema" className="w-full rounded-md flex items-center gap-2 text-xs font-medium"
        style={{ background: t.muted, border: `1px solid ${t.border}`, color: t.foreground, padding: "9px 11px", cursor: "pointer" }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={t.foreground} strokeWidth="2" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" /></svg>
        <span style={{ flex: 1, textAlign: "left" }}>{familyLabel} · {mode === "dark" ? "Dark" : "Light"}</span>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={t.mutedFg} strokeWidth="2" style={{ transform: open ? "rotate(180deg)" : "none" }}><path d="m18 15-6-6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
    </div>
  );
}

