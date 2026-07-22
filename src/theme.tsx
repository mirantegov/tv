import { createContext, useContext, useMemo, useState } from "react";

export const THEMES = {
	ocean: {
		label: "Ocean",
		dark: {
			t: {
				background: "oklch(0.2058 0.0353 213)",
				foreground: "oklch(0.9244 0.0181 196.85)",
				card: "oklch(0.2483 0.0400 211)",
				primary: "oklch(0.7000 0.1050 201.5)",
				primaryFg: "oklch(0.18 0.03 213)",
				secondary: "oklch(0.3000 0.0420 208)",
				muted: "oklch(0.2750 0.0350 210)",
				mutedFg: "oklch(0.7100 0.0420 200)",
				accent: "oklch(0.3200 0.0500 205)",
				border: "oklch(0.3300 0.0400 207)",
				ok: "oklch(0.74 0.13 165)",
				warn: "oklch(0.80 0.13 80)",
				danger: "oklch(0.64 0.19 25.54)",
			},
			cats: [
				"oklch(0.70 0.095 203.28)",
				"oklch(0.76 0.10 188)",
				"oklch(0.72 0.085 232)",
				"oklch(0.80 0.105 201)",
				"oklch(0.74 0.10 172)",
				"oklch(0.70 0.082 250)",
				"oklch(0.84 0.085 201.9)",
				"oklch(0.80 0.082 215)",
			],
			prev: "oklch(0.46 0.050 202)",
			cur: "oklch(0.72 0.105 201.5)",
		},
		light: {
			t: {
				background: "oklch(0.9491 0.0085 197.0126)",
				foreground: "oklch(0.3772 0.0619 212.664)",
				card: "oklch(0.9724 0.0053 197.0692)",
				primary: "oklch(0.5624 0.0947 203.2755)",
				primaryFg: "oklch(1 0 0)",
				secondary: "oklch(0.9244 0.0181 196.845)",
				muted: "oklch(0.9295 0.0107 196.9723)",
				mutedFg: "oklch(0.5428 0.0594 201.5662)",
				accent: "oklch(0.9021 0.0297 201.8915)",
				border: "oklch(0.8931 0.0205 204.4136)",
				ok: "oklch(0.62 0.12 165)",
				warn: "oklch(0.70 0.14 70)",
				danger: "oklch(0.5732 0.1901 25.5409)",
			},
			cats: [
				"oklch(0.5624 0.0947 203.28)",
				"oklch(0.6500 0.1000 188)",
				"oklch(0.5800 0.0850 232)",
				"oklch(0.7124 0.1075 201.25)",
				"oklch(0.6100 0.1000 172)",
				"oklch(0.5300 0.0780 250)",
				"oklch(0.7757 0.0951 201.9)",
				"oklch(0.6900 0.0820 215)",
			],
			prev: "oklch(0.7757 0.0951 201.9)",
			cur: "oklch(0.5624 0.0947 203.28)",
		},
	},
	monokai: {
		label: "Monokai",
		dark: {
			t: {
				background: "#1c1d19",
				foreground: "#f8f8f2",
				card: "#272822",
				primary: "#a6e22e",
				primaryFg: "#1c1d19",
				secondary: "#3e3d32",
				muted: "#33342c",
				mutedFg: "#a6a08a",
				accent: "#3e3d32",
				border: "#46473b",
				ok: "#a6e22e",
				warn: "#fd971f",
				danger: "#f92672",
			},
			cats: [
				"#a6e22e",
				"#66d9ef",
				"#fd971f",
				"#ae81ff",
				"#e6db74",
				"#f92672",
				"#5fd7af",
				"#7aa6ff",
			],
			prev: "#75715e",
			cur: "#a6e22e",
		},
		light: {
			t: {
				background: "#f6f6ef",
				foreground: "#272822",
				card: "#fcfcf5",
				primary: "#4ca50f",
				primaryFg: "#ffffff",
				secondary: "#e9e9dd",
				muted: "#eeeee2",
				mutedFg: "#6f6e5f",
				accent: "#e4e4d4",
				border: "#dcdccd",
				ok: "#4ca50f",
				warn: "#c2790a",
				danger: "#d11a5e",
			},
			cats: [
				"#4ca50f",
				"#1f9bbf",
				"#cc7a00",
				"#7d4fd1",
				"#a9920a",
				"#d11a5e",
				"#149b7a",
				"#3a5fd1",
			],
			prev: "#b9b39a",
			cur: "#4ca50f",
		},
	},
	astrovista: {
		label: "AstroVista",
		dark: {
			t: {
				background: "oklch(0.2178 0 0)",
				foreground: "oklch(0.9219 0 0)",
				card: "oklch(0.2435 0 0)",
				primary: "oklch(0.6420 0.1691 38.5815)",
				primaryFg: "oklch(1.0000 0 0)",
				secondary: "oklch(0.3743 0.0726 258.5213)",
				muted: "oklch(0.2850 0 0)",
				mutedFg: "oklch(0.5999 0 0)",
				accent: "oklch(0.3380 0.0589 267.5867)",
				border: "oklch(0.3290 0 0)",
				ok: "oklch(0.74 0.14 155)",
				warn: "oklch(0.7859 0.1342 83.6986)",
				danger: "oklch(0.6368 0.2078 25.3313)",
			},
			cats: [
				"oklch(0.7124 0.0606 248.6896)",
				"oklch(0.6678 0.1546 41.6200)",
				"oklch(0.5957 0.1807 19.9763)",
				"oklch(0.7859 0.1342 83.6986)",
				"oklch(0.4227 0.0732 267.3899)",
				"oklch(0.72 0.12 190)",
				"oklch(0.70 0.13 150)",
				"oklch(0.68 0.15 330)",
			],
			prev: "oklch(0.5999 0 0)",
			cur: "oklch(0.6420 0.1691 38.5815)",
		},
		light: {
			t: {
				background: "oklch(0.9383 0.0042 236.4993)",
				foreground: "oklch(0.3211 0 0)",
				card: "oklch(1.0000 0 0)",
				primary: "oklch(0.6420 0.1691 38.5815)",
				primaryFg: "oklch(1.0000 0 0)",
				secondary: "oklch(0.4138 0.0846 259.8759)",
				muted: "oklch(0.9846 0.0017 247.8389)",
				mutedFg: "oklch(0.5510 0.0234 264.3637)",
				accent: "oklch(0.9119 0.0222 243.8174)",
				border: "oklch(0.8452 0 0)",
				ok: "oklch(0.62 0.13 155)",
				warn: "oklch(0.70 0.14 75)",
				danger: "oklch(0.6368 0.2078 25.3313)",
			},
			cats: [
				"oklch(0.6693 0.0706 248.9230)",
				"oklch(0.6678 0.1546 41.6200)",
				"oklch(0.5957 0.1807 19.9763)",
				"oklch(0.7859 0.1342 83.6986)",
				"oklch(0.4227 0.0732 267.3899)",
				"oklch(0.60 0.11 190)",
				"oklch(0.58 0.12 150)",
				"oklch(0.55 0.14 330)",
			],
			prev: "oklch(0.5510 0.0234 264.3637)",
			cur: "oklch(0.6420 0.1691 38.5815)",
		},
	},
	apex: {
		label: "Apex",
		dark: {
			t: {
				background: "oklch(0.1410 0.0050 285.8230)",
				foreground: "oklch(0.9620 0.0180 272.3140)",
				card: "oklch(0.1790 0.0480 283.2705)",
				primary: "oklch(0.5850 0.2330 277.1170)",
				primaryFg: "oklch(0.1360 0.0269 285.6516)",
				secondary: "oklch(0.7150 0.1430 215.2210)",
				muted: "oklch(0.2570 0.0900 281.2880)",
				mutedFg: "oklch(0.7150 0.1430 215.2210)",
				accent: "oklch(0.2570 0.0900 281.2880)",
				border: "oklch(0.2790 0.0410 260.0310)",
				ok: "oklch(0.72 0.14 155)",
				warn: "oklch(0.80 0.14 80)",
				danger: "oklch(0.5860 0.2530 17.5850)",
			},
			cats: [
				"oklch(0.4380 0.2180 303.7240)",
				"oklch(0.6060 0.2500 292.7170)",
				"oklch(0.3980 0.1950 277.3660)",
				"oklch(0.7070 0.1650 254.6240)",
				"oklch(0.4880 0.2430 264.3760)",
				"oklch(0.7150 0.1430 215.2210)",
				"oklch(0.72 0.14 155)",
				"oklch(0.75 0.15 85)",
			],
			prev: "oklch(0.7150 0.1430 215.2210)",
			cur: "oklch(0.5850 0.2330 277.1170)",
		},
		light: {
			t: {
				background: "oklch(0.9886 0.0053 272.4788)",
				foreground: "oklch(0.1760 0.0804 261.8274)",
				card: "oklch(0.9817 0.0043 272.4896)",
				primary: "oklch(0.4570 0.2400 277.0230)",
				primaryFg: "oklch(0.9620 0.0180 272.3140)",
				secondary: "oklch(0.6090 0.1260 221.7230)",
				muted: "oklch(0.8174 0.0575 209.0830)",
				mutedFg: "oklch(0.3815 0.0486 210.0747)",
				accent: "oklch(0.8700 0.0650 274.0390)",
				border: "oklch(0.8690 0.0220 252.8940)",
				ok: "oklch(0.60 0.12 155)",
				warn: "oklch(0.65 0.13 80)",
				danger: "oklch(0.6061 0.1206 15.3419)",
			},
			cats: [
				"oklch(0.7629 0.0477 194.4909)",
				"oklch(0.7746 0.0622 217.4690)",
				"oklch(0.6965 0.0591 248.6872)",
				"oklch(0.5944 0.0772 254.0278)",
				"oklch(0.5200 0.1050 223.1280)",
				"oklch(0.4570 0.2400 277.0230)",
				"oklch(0.60 0.12 155)",
				"oklch(0.65 0.13 80)",
			],
			prev: "oklch(0.3815 0.0486 210.0747)",
			cur: "oklch(0.4570 0.2400 277.0230)",
		},
	},
	greenyellow: {
		label: "Green",
		dark: {
			t: {
				background: "oklch(0.1397 0.0161 160.8644)",
				foreground: "oklch(0.9633 0.0035 157.1903)",
				card: "oklch(0.1706 0.0222 158.0495)",
				primary: "oklch(0.7176 0.1902 149.6000)",
				primaryFg: "oklch(0.1397 0.0161 160.8644)",
				secondary: "oklch(0.8377 0.1697 91.4819)",
				muted: "oklch(0.2923 0.0382 157.3943)",
				mutedFg: "oklch(0.7356 0.0261 156.5229)",
				accent: "oklch(0.3465 0.0656 93.9985)",
				border: "oklch(0.3275 0.0444 157.2261)",
				ok: "oklch(0.7176 0.1902 149.6000)",
				warn: "oklch(0.8377 0.1697 91.4819)",
				danger: "oklch(0.5860 0.2000 25.5)",
			},
			cats: [
				"oklch(0.7176 0.1902 149.6000)",
				"oklch(0.8377 0.1697 91.4819)",
				"oklch(0.6403 0.1218 165.5782)",
				"oklch(0.5472 0.1515 143.1553)",
				"oklch(0.7304 0.1448 87.2291)",
				"oklch(0.70 0.13 190)",
				"oklch(0.68 0.14 60)",
				"oklch(0.72 0.11 120)",
			],
			prev: "oklch(0.7356 0.0261 156.5229)",
			cur: "oklch(0.7176 0.1902 149.6000)",
		},
		light: {
			t: {
				background: "oklch(0.9859 0.0028 157.2067)",
				foreground: "oklch(0.1751 0.0308 154.1723)",
				card: "oklch(0.9859 0.0028 157.2067)",
				primary: "oklch(0.6230 0.1688 149.1777)",
				primaryFg: "oklch(0.9859 0.0028 157.2067)",
				secondary: "oklch(0.8611 0.1734 91.9641)",
				muted: "oklch(0.9423 0.0085 157.0813)",
				mutedFg: "oklch(0.5250 0.0322 155.9481)",
				accent: "oklch(0.9628 0.0487 95.5450)",
				border: "oklch(0.9132 0.0128 156.9778)",
				ok: "oklch(0.6230 0.1688 149.1777)",
				warn: "oklch(0.7400 0.1500 85)",
				danger: "oklch(0.6356 0.2082 25.3782)",
			},
			cats: [
				"oklch(0.6230 0.1688 149.1777)",
				"oklch(0.8611 0.1734 91.9641)",
				"oklch(0.6983 0.1337 165.4626)",
				"oklch(0.7099 0.2008 143.0946)",
				"oklch(0.8471 0.1549 89.4456)",
				"oklch(0.58 0.12 190)",
				"oklch(0.60 0.13 60)",
				"oklch(0.62 0.11 120)",
			],
			prev: "oklch(0.5250 0.0322 155.9481)",
			cur: "oklch(0.6230 0.1688 149.1777)",
		},
	},
	cyber: {
		label: "Cyber",
		dark: {
			t: {
				background: "oklch(0.1649 0.0352 281.8285)",
				foreground: "oklch(0.9513 0.0074 260.7315)",
				card: "oklch(0.2542 0.0611 281.1423)",
				primary: "oklch(0.6726 0.2904 341.4084)",
				primaryFg: "oklch(1.0000 0 0)",
				secondary: "oklch(0.2542 0.0611 281.1423)",
				muted: "oklch(0.2123 0.0522 280.9917)",
				mutedFg: "oklch(0.6245 0.0500 278.1046)",
				accent: "oklch(0.8903 0.1739 171.2690)",
				border: "oklch(0.3279 0.0832 280.7890)",
				ok: "oklch(0.78 0.16 155)",
				warn: "oklch(0.9168 0.1915 101.4070)",
				danger: "oklch(0.6535 0.2348 34.0370)",
			},
			cats: [
				"oklch(0.6726 0.2904 341.4084)",
				"oklch(0.5488 0.2944 299.0954)",
				"oklch(0.8442 0.1457 209.2851)",
				"oklch(0.8903 0.1739 171.2690)",
				"oklch(0.9168 0.1915 101.4070)",
				"oklch(0.72 0.16 250)",
				"oklch(0.70 0.18 30)",
				"oklch(0.78 0.16 140)",
			],
			prev: "oklch(0.6245 0.0500 278.1046)",
			cur: "oklch(0.6726 0.2904 341.4084)",
		},
		light: {
			t: {
				background: "oklch(0.9816 0.0017 247.8390)",
				foreground: "oklch(0.1649 0.0352 281.8285)",
				card: "oklch(1.0000 0 0)",
				primary: "oklch(0.6726 0.2904 341.4084)",
				primaryFg: "oklch(1.0000 0 0)",
				secondary: "oklch(0.9595 0.0200 286.0164)",
				muted: "oklch(0.9595 0.0200 286.0164)",
				mutedFg: "oklch(0.5200 0.0300 281.0000)",
				accent: "oklch(0.8903 0.1739 171.2690)",
				border: "oklch(0.9205 0.0086 225.0878)",
				ok: "oklch(0.60 0.14 155)",
				warn: "oklch(0.70 0.15 95)",
				danger: "oklch(0.6535 0.2348 34.0370)",
			},
			cats: [
				"oklch(0.6726 0.2904 341.4084)",
				"oklch(0.5488 0.2944 299.0954)",
				"oklch(0.8442 0.1457 209.2851)",
				"oklch(0.8903 0.1739 171.2690)",
				"oklch(0.9168 0.1915 101.4070)",
				"oklch(0.60 0.16 250)",
				"oklch(0.62 0.18 30)",
				"oklch(0.62 0.15 140)",
			],
			prev: "oklch(0.6200 0.0300 281.0000)",
			cur: "oklch(0.6726 0.2904 341.4084)",
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
	const value = useMemo(
		() => ({
			...buildTheme(family, mode),
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
export const useTheme = () => useContext(ThemeCtx);

export function ThemeConfig() {
	const { t, family, mode, familyLabel, setFamily, setMode } = useTheme();
	const [open, setOpen] = useState(false);
	const Opt = ({ active, onClick, children }) => (
		<button
			type="button"
			onClick={onClick}
			className="text-xs rounded-md text-center"
			style={{
				flex: 1,
				padding: "7px 8px",
				background: active ? t.primary : t.muted,
				color: active ? t.primaryFg : t.foreground,
				border: `1px solid ${active ? t.primary : t.border}`,
				cursor: "pointer",
				fontWeight: active ? 600 : 500,
			}}
		>
			{children}
		</button>
	);
	return (
		<div style={{ position: "relative" }}>
			{open && (
				<div
					className="rounded-lg"
					style={{
						position: "absolute",
						bottom: "calc(100% + 8px)",
						left: 0,
						right: 0,
						background: t.card,
						border: `1px solid ${t.border}`,
						boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
						padding: 12,
						zIndex: 30,
					}}
				>
					<div
						className="text-xs font-semibold mb-2"
						style={{ color: t.mutedFg }}
					>
						Tema
					</div>
					<div className="grid grid-cols-2 gap-2 mb-3">
						{Object.entries(THEMES).map(([key, { label }]) => (
							<Opt
								key={key}
								active={family === key}
								onClick={() => setFamily(key)}
							>
								{label}
							</Opt>
						))}
					</div>
					<div
						className="text-xs font-semibold mb-2"
						style={{ color: t.mutedFg }}
					>
						Modo
					</div>
					<div className="flex gap-2">
						<Opt active={mode === "light"} onClick={() => setMode("light")}>
							☀ Light
						</Opt>
						<Opt active={mode === "dark"} onClick={() => setMode("dark")}>
							☾ Dark
						</Opt>
					</div>
				</div>
			)}
			<button
				type="button"
				onClick={() => setOpen((o) => !o)}
				aria-label="Configurar tema"
				className="w-full rounded-md flex items-center gap-2 text-xs font-medium"
				style={{
					background: t.muted,
					border: `1px solid ${t.border}`,
					color: t.foreground,
					padding: "9px 11px",
					cursor: "pointer",
				}}
			>
				<svg
					aria-hidden="true"
					width="15"
					height="15"
					viewBox="0 0 24 24"
					fill="none"
					stroke={t.foreground}
					strokeWidth="2"
					style={{ flexShrink: 0 }}
				>
					<circle cx="12" cy="12" r="3" />
					<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
				</svg>
				<span style={{ flex: 1, textAlign: "left" }}>
					{familyLabel} · {mode === "dark" ? "Dark" : "Light"}
				</span>
				<svg
					aria-hidden="true"
					width="13"
					height="13"
					viewBox="0 0 24 24"
					fill="none"
					stroke={t.mutedFg}
					strokeWidth="2"
					style={{ transform: open ? "rotate(180deg)" : "none" }}
				>
					<path
						d="m18 15-6-6-6 6"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			</button>
		</div>
	);
}
