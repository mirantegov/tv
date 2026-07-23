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
	supabase: {
		label: "Supabase",
		dark: {
			t: {
				background: "oklch(0.1822 0 0)",
				foreground: "oklch(0.9288 0.0126 255.5078)",
				card: "oklch(0.2046 0 0)",
				primary: "oklch(0.4365 0.1044 156.7556)",
				primaryFg: "oklch(0.9213 0.0135 167.1556)",
				secondary: "oklch(0.2603 0 0)",
				muted: "oklch(0.2393 0 0)",
				mutedFg: "oklch(0.7122 0 0)",
				accent: "oklch(0.3132 0 0)",
				border: "oklch(0.2809 0 0)",
				ok: "oklch(0.80 0.18 152)",
				warn: "oklch(0.84 0.16 84)",
				// ponytail: destructive dark do JSON (L 0.31) fica ilegível p/ texto de alerta
				danger: "oklch(0.63 0.20 29)",
			},
			cats: [
				"oklch(0.8003 0.1821 151.7110)",
				"oklch(0.7137 0.1434 254.6240)",
				"oklch(0.7090 0.1592 293.5412)",
				"oklch(0.8369 0.1644 84.4286)",
				"oklch(0.7845 0.1325 181.9120)",
				"oklch(0.72 0.16 340)",
				"oklch(0.75 0.14 210)",
				"oklch(0.80 0.15 120)",
			],
			prev: "oklch(0.7122 0 0)",
			cur: "oklch(0.4365 0.1044 156.7556)",
		},
		light: {
			t: {
				background: "oklch(0.9911 0 0)",
				foreground: "oklch(0.2046 0 0)",
				card: "oklch(0.9911 0 0)",
				primary: "oklch(0.8348 0.1302 160.9080)",
				primaryFg: "oklch(0.2626 0.0147 166.4589)",
				// ponytail: secondary do JSON (0.994) some no fundo; uso border p/ track visível
				secondary: "oklch(0.9037 0 0)",
				muted: "oklch(0.9461 0 0)",
				mutedFg: "oklch(0.2435 0 0)",
				accent: "oklch(0.9461 0 0)",
				border: "oklch(0.9037 0 0)",
				ok: "oklch(0.62 0.15 162)",
				warn: "oklch(0.70 0.15 75)",
				danger: "oklch(0.5523 0.1927 32.7272)",
			},
			cats: [
				"oklch(0.8348 0.1302 160.9080)",
				"oklch(0.6231 0.1880 259.8145)",
				"oklch(0.6056 0.2189 292.7172)",
				"oklch(0.7686 0.1647 70.0804)",
				"oklch(0.6959 0.1491 162.4796)",
				"oklch(0.60 0.17 340)",
				"oklch(0.58 0.14 210)",
				"oklch(0.62 0.15 120)",
			],
			prev: "oklch(0.2435 0 0)",
			cur: "oklch(0.8348 0.1302 160.9080)",
		},
	},
	twitter: {
		label: "Twitter",
		dark: {
			t: {
				background: "oklch(0 0 0)",
				foreground: "oklch(0.9328 0.0025 228.7857)",
				card: "oklch(0.2097 0.0080 274.5332)",
				primary: "oklch(0.6692 0.1607 245.0110)",
				primaryFg: "oklch(1.0000 0 0)",
				// ponytail: JSON secondary é quase branco (p/ botões); track sutil aqui
				secondary: "oklch(0.2674 0.0047 248.0045)",
				muted: "oklch(0.2090 0 0)",
				mutedFg: "oklch(0.5637 0.0078 247.9662)",
				accent: "oklch(0.1928 0.0331 242.5459)",
				border: "oklch(0.2674 0.0047 248.0045)",
				ok: "oklch(0.71 0.18 152)",
				warn: "oklch(0.82 0.16 82)",
				danger: "oklch(0.6188 0.2376 25.7658)",
			},
			cats: [
				"oklch(0.6723 0.1606 244.9955)",
				"oklch(0.6907 0.1554 160.3454)",
				"oklch(0.8214 0.1600 82.5337)",
				"oklch(0.7064 0.1822 151.7125)",
				"oklch(0.5919 0.2186 10.5826)",
				"oklch(0.68 0.16 300)",
				"oklch(0.78 0.13 210)",
				"oklch(0.74 0.16 50)",
			],
			prev: "oklch(0.5637 0.0078 247.9662)",
			cur: "oklch(0.6692 0.1607 245.0110)",
		},
		light: {
			t: {
				background: "oklch(1.0000 0 0)",
				foreground: "oklch(0.1884 0.0128 248.5103)",
				card: "oklch(0.9784 0.0011 197.1387)",
				primary: "oklch(0.6723 0.1606 244.9955)",
				primaryFg: "oklch(1.0000 0 0)",
				// ponytail: JSON secondary é quase preto (p/ botões); track sutil aqui
				secondary: "oklch(0.9222 0.0013 286.3737)",
				muted: "oklch(0.9222 0.0013 286.3737)",
				mutedFg: "oklch(0.4400 0.0128 248.5103)",
				accent: "oklch(0.9392 0.0166 250.8453)",
				border: "oklch(0.9317 0.0118 231.6594)",
				ok: "oklch(0.62 0.15 152)",
				warn: "oklch(0.70 0.15 75)",
				danger: "oklch(0.6188 0.2376 25.7658)",
			},
			cats: [
				"oklch(0.6723 0.1606 244.9955)",
				"oklch(0.6907 0.1554 160.3454)",
				"oklch(0.8214 0.1600 82.5337)",
				"oklch(0.7064 0.1822 151.7125)",
				"oklch(0.5919 0.2186 10.5826)",
				"oklch(0.60 0.16 300)",
				"oklch(0.62 0.13 210)",
				"oklch(0.66 0.16 50)",
			],
			prev: "oklch(0.4400 0.0128 248.5103)",
			cur: "oklch(0.6723 0.1606 244.9955)",
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

export function ThemePanel() {
	const { t, family, mode, setFamily, setMode } = useTheme();
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
		<div style={{ padding: "4px 10px 8px" }}>
			<div className="text-xs font-semibold mb-2" style={{ color: t.mutedFg }}>
				Tema
			</div>
			<div className="grid grid-cols-2 gap-2 mb-3">
				{Object.entries(THEMES).map(([key, { label }]) => (
					<Opt key={key} active={family === key} onClick={() => setFamily(key)}>
						{label}
					</Opt>
				))}
			</div>
			<div className="text-xs font-semibold mb-2" style={{ color: t.mutedFg }}>
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
	);
}
