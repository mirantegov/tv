import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { THEMES } from "@/theme";

export type ThemeFamily = keyof typeof THEMES;
export type ThemeMode = "dark" | "light";

// Converte cor sRGB (#rrggbb) p/ tripla OKLCH "L C H" — só a Monokai usa hex
// em THEMES, as demais famílias já vêm como oklch(). Matrizes padrão de
// Björn Ottosson (oklab spec), sem dependência extra p/ um único uso.
function hexToOklchTriple(hex: string): string {
	const n = hex.replace("#", "");
	const toLin = (v: number) => {
		v /= 255;
		return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
	};
	const r = toLin(Number.parseInt(n.slice(0, 2), 16));
	const g = toLin(Number.parseInt(n.slice(2, 4), 16));
	const b = toLin(Number.parseInt(n.slice(4, 6), 16));
	const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
	const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
	const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
	const l_ = Math.cbrt(l);
	const m_ = Math.cbrt(m);
	const s_ = Math.cbrt(s);
	const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
	const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
	const bb = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;
	const C = Math.sqrt(a * a + bb * bb);
	let H = (Math.atan2(bb, a) * 180) / Math.PI;
	if (H < 0) H += 360;
	return `${L.toFixed(4)} ${C.toFixed(4)} ${H.toFixed(4)}`;
}

// "oklch(L C H)" -> "L C H" (formato cru que as CSS vars do Tailwind esperam
// p/ o truque de opacidade `oklch(var(--x) / <alpha-value>)`); "#rrggbb" ->
// convertido.
function toTriple(color: string): string {
	return color.startsWith("#") ? hexToOklchTriple(color) : color.slice(6, -1);
}

type FlatTheme = (typeof THEMES)["ocean"]["dark"]["t"];

// As mesmas 13 variáveis já fixadas em admin.css (Twitter dark). Os pares
// derivados (popover=card, secondary/accent-foreground=foreground,
// input=border, ring=primary, destructive-foreground=branco) seguem
// exatamente o padrão que já estava hardcoded lá.
function cssVars(t: FlatTheme) {
	return {
		"--background": toTriple(t.background),
		"--foreground": toTriple(t.foreground),
		"--card": toTriple(t.card),
		"--card-foreground": toTriple(t.foreground),
		"--popover": toTriple(t.card),
		"--popover-foreground": toTriple(t.foreground),
		"--primary": toTriple(t.primary),
		"--primary-foreground": toTriple(t.primaryFg),
		"--secondary": toTriple(t.secondary),
		"--secondary-foreground": toTriple(t.foreground),
		"--muted": toTriple(t.muted),
		"--muted-foreground": toTriple(t.mutedFg),
		"--accent": toTriple(t.accent),
		"--accent-foreground": toTriple(t.foreground),
		"--destructive": toTriple(t.danger),
		"--destructive-foreground": "1 0 0",
		"--border": toTriple(t.border),
		"--input": toTriple(t.border),
		"--ring": toTriple(t.primary),
	};
}

type AdminThemeCtx = {
	family: ThemeFamily;
	mode: ThemeMode;
	familyLabel: string;
	setFamily: (f: ThemeFamily) => void;
	setMode: (m: ThemeMode) => void;
	toggle: () => void;
};
const ThemeCtx = createContext<AdminThemeCtx | null>(null);

// Sem persistência (localStorage) — mesmo comportamento do ThemeProvider da
// TV (src/theme.tsx), que também reseta ao recarregar.
export function AdminThemeProvider({ children }: { children: ReactNode }) {
	// Twitter/dark = valores atuais do admin.css: escolher outro tema só
	// muda a aparência quando o usuário pedir, sem regressão no load inicial.
	const [family, setFamily] = useState<ThemeFamily>("twitter");
	const [mode, setMode] = useState<ThemeMode>("dark");

	useEffect(() => {
		const fam = THEMES[family] ?? THEMES.twitter;
		const vars = cssVars((fam[mode] ?? fam.dark).t);
		const root = document.documentElement;
		for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v);
		root.style.colorScheme = mode;
	}, [family, mode]);

	const value = useMemo<AdminThemeCtx>(
		() => ({
			family,
			mode,
			familyLabel: THEMES[family].label,
			setFamily,
			setMode,
			toggle: () => setMode((m) => (m === "dark" ? "light" : "dark")),
		}),
		[family, mode],
	);
	return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useAdminTheme(): AdminThemeCtx {
	const ctx = useContext(ThemeCtx);
	if (!ctx) throw new Error("useAdminTheme fora de AdminThemeProvider");
	return ctx;
}
