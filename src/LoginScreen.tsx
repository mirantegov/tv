import type React from "react";
import { useState } from "react";
import { useTheme } from "./theme";
import { authenticate } from "./users";

/* ============================================================================
   LOGIN — mesma identidade visual (Ocean Breeze / Monokai)
   Usuário: CPF (000.000.000-00)  ·  Senha: 8 caracteres alfanuméricos
   ============================================================================ */

// Máscara progressiva de CPF a partir dos dígitos digitados
function maskCpf(v: string): string {
	const d = v.replace(/\D/g, "").slice(0, 11);
	let out = d;
	if (d.length > 3) out = `${d.slice(0, 3)}.${d.slice(3)}`;
	if (d.length > 6) out = `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
	if (d.length > 9)
		out =
			d.slice(0, 3) +
			"." +
			d.slice(3, 6) +
			"." +
			d.slice(6, 9) +
			"-" +
			d.slice(9);
	return out;
}

export default function LoginScreen({ onLogin }: { onLogin?: () => void }) {
	const { t, mode, familyLabel, toggle } = useTheme();
	const [cpf, setCpf] = useState("");
	const [senha, setSenha] = useState("");
	const [showSenha, setShowSenha] = useState(false);
	const [erro, setErro] = useState<string | null>(null);
	const [tentou, setTentou] = useState(false);

	// Portão real: autentica contra o cadastro (users.ts). Formato do CPF é só UX.
	const entrar = () => {
		setTentou(true);
		if (!authenticate(cpf, senha)) return setErro("CPF ou senha inválidos.");
		setErro(null);
		onLogin?.();
	};

	const field = (invalid: boolean) =>
		({
			width: "100%",
			padding: "11px 13px",
			borderRadius: 10,
			fontSize: 14,
			background: t.muted,
			color: t.foreground,
			border: `1px solid ${invalid ? t.danger : t.border}`,
			outline: "none",
		}) as React.CSSProperties;

	return (
		<div
			className="min-h-screen w-full flex items-center justify-center px-4"
			style={{
				background: t.background,
				color: t.foreground,
				fontFamily:
					"ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
			}}
		>
			{/* Alternador de modo (canto superior direito) */}
			<button
				type="button"
				onClick={toggle}
				aria-label="Alternar tema"
				className="rounded-md flex items-center gap-2 text-xs font-medium"
				style={{
					position: "absolute",
					top: 20,
					right: 20,
					background: t.card,
					border: `1px solid ${t.border}`,
					color: t.mutedFg,
					padding: "7px 11px",
					cursor: "pointer",
				}}
			>
				{mode === "dark" ? "☾" : "☀"} {familyLabel}
			</button>

			<div className="w-full" style={{ maxWidth: 400 }}>
				{/* Marca */}
				<div className="flex items-center gap-3 mb-6 justify-center">
					<div
						className="rounded-lg flex items-center justify-center"
						style={{ width: 42, height: 42, background: t.primary }}
					>
						<svg
							aria-hidden="true"
							width="22"
							height="22"
							viewBox="0 0 24 24"
							fill="none"
						>
							<path d="M12 2 3 7v2h18V7L12 2Z" fill={t.primaryFg} />
							<path
								d="M5 10v8M9 10v8M15 10v8M19 10v8"
								stroke={t.primaryFg}
								strokeWidth="2"
							/>
							<path d="M3 20h18v2H3z" fill={t.primaryFg} />
						</svg>
					</div>
					<div>
						<div
							className="text-xs uppercase tracking-wider"
							style={{ color: t.mutedFg }}
						>
							Prefeitura
						</div>
						<div className="text-lg font-bold" style={{ color: t.foreground }}>
							Mirante Gov
						</div>
					</div>
				</div>

				{/* Cartão de login */}
				<div
					className="rounded-2xl"
					style={{
						background: t.card,
						border: `1px solid ${t.border}`,
						padding: 26,
					}}
				>
					<h1
						className="text-base font-bold mb-1"
						style={{ color: t.foreground }}
					>
						Acessar o painel
					</h1>
					<p className="text-xs mb-5" style={{ color: t.mutedFg }}>
						Entre com seu CPF e senha para continuar.
					</p>

					{/* CPF */}
					<label
						htmlFor="cpf"
						className="text-xs font-semibold"
						style={{ color: t.foreground }}
					>
						CPF
					</label>
					<input
						id="cpf"
						value={cpf}
						inputMode="numeric"
						autoComplete="username"
						placeholder="000.000.000-00"
						onChange={(e) => {
							setCpf(maskCpf(e.target.value));
							setErro(null);
						}}
						onKeyDown={(e) => e.key === "Enter" && entrar()}
						style={{ ...field(tentou && !!erro), marginTop: 6 }}
					/>

					{/* Senha */}
					<label
						htmlFor="senha"
						className="text-xs font-semibold"
						style={{ color: t.foreground, display: "block", marginTop: 16 }}
					>
						Senha
					</label>
					<div style={{ position: "relative", marginTop: 6 }}>
						<input
							id="senha"
							value={senha}
							type={showSenha ? "text" : "password"}
							autoComplete="current-password"
							placeholder="8 caracteres alfanuméricos"
							maxLength={8}
							onChange={(e) => {
								setSenha(
									e.target.value.replace(/[^A-Za-z0-9]/g, "").slice(0, 8),
								);
								setErro(null);
							}}
							onKeyDown={(e) => e.key === "Enter" && entrar()}
							style={{ ...field(tentou && !!erro), paddingRight: 64 }}
						/>
						<button
							onClick={() => setShowSenha((s) => !s)}
							type="button"
							className="text-xs font-semibold"
							style={{
								position: "absolute",
								right: 8,
								top: "50%",
								transform: "translateY(-50%)",
								background: "transparent",
								border: "none",
								color: t.primary,
								cursor: "pointer",
							}}
						>
							{showSenha ? "ocultar" : "mostrar"}
						</button>
					</div>
					<div className="text-xs mt-1" style={{ color: t.mutedFg }}>
						{senha.length}/8 caracteres
					</div>

					{/* Erro */}
					{erro && (
						<div
							className="rounded-lg mt-4 text-xs"
							style={{
								background: t.muted,
								color: t.danger,
								padding: "9px 12px",
								borderLeft: `3px solid ${t.danger}`,
							}}
						>
							{erro}
						</div>
					)}

					{/* Botão */}
					<button
						type="button"
						onClick={entrar}
						className="w-full rounded-lg text-sm font-semibold mt-5"
						style={{
							background: t.primary,
							color: t.primaryFg,
							border: "none",
							padding: "12px",
							cursor: "pointer",
						}}
					>
						Entrar
					</button>

					<div
						className="text-xs mt-4 text-center"
						style={{ color: t.mutedFg }}
					>
						Acesso restrito · uso funcional · LGPD
					</div>
				</div>

				<div className="text-xs mt-4 text-center" style={{ color: t.mutedFg }}>
					Modelo de estrutura · dados fictícios · tema {familyLabel}
				</div>
			</div>
		</div>
	);
}
