import { useEffect, useState } from "react";
import { useTheme } from "../theme";
import { cpApi } from "./cpApi";

type Aba = "acessos" | "auditoria";
const LIMIT = 50;

const COLS: Record<Aba, { key: string; label: string }[]> = {
	acessos: [
		{ key: "criado_em", label: "Data" },
		{ key: "nome", label: "Nome" },
		{ key: "cpf", label: "CPF" },
		{ key: "id_ibge", label: "IBGE" },
		{ key: "id_entidade", label: "Entidade" },
	],
	auditoria: [
		{ key: "criado_em", label: "Data" },
		{ key: "ator", label: "Ator" },
		{ key: "acao", label: "Ação" },
		{ key: "alvo", label: "Alvo" },
	],
};

export function LogsView({ onVoltar }: { onVoltar: () => void }) {
	const { t } = useTheme();
	const [aba, setAba] = useState<Aba>("acessos");
	const [offset, setOffset] = useState(0);
	const [dados, setDados] = useState<{ rows: any[]; total: number }>({
		rows: [],
		total: 0,
	});
	const [filtros, setFiltros] = useState<Record<string, string>>({});

	async function carregar() {
		const params = new URLSearchParams({
			limit: String(LIMIT),
			offset: String(offset),
		});
		for (const [k, v] of Object.entries(filtros)) if (v) params.set(k, v);
		try {
			setDados(await cpApi.cpFetch(`/logs/${aba}?${params}`));
		} catch {
			setDados({ rows: [], total: 0 });
		}
	}
	useEffect(() => {
		carregar();
	}, [aba, offset]);

	function setFiltro(k: string, v: string) {
		setFiltros((f) => ({ ...f, [k]: v }));
	}
	function aplicarFiltros(e: React.FormEvent) {
		e.preventDefault();
		setOffset(0);
		carregar();
	}

	const inp = {
		padding: 8,
		background: t.background,
		color: t.foreground,
		border: `1px solid ${t.border}`,
		borderRadius: 8,
	} as const;
	const cols = COLS[aba];
	const temProxima = offset + LIMIT < dados.total;

	return (
		<div style={{ padding: 24, color: t.foreground }}>
			<button
				onClick={onVoltar}
				style={{
					marginBottom: 12,
					background: "none",
					border: "none",
					color: t.primary,
					cursor: "pointer",
				}}
			>
				← Voltar
			</button>
			<h1 style={{ fontSize: 20, marginBottom: 16 }}>Logs</h1>
			<div role="tablist" style={{ display: "flex", gap: 8, marginBottom: 16 }}>
				{(["acessos", "auditoria"] as Aba[]).map((a) => (
					<button
						key={a}
						role="button"
						onClick={() => {
							setAba(a);
							setOffset(0);
							setFiltros({});
						}}
						style={{
							padding: "6px 12px",
							background: aba === a ? t.primary : t.card,
							color: aba === a ? t.primaryFg : t.foreground,
							border: `1px solid ${t.border}`,
							borderRadius: 8,
							cursor: "pointer",
							textTransform: "capitalize",
						}}
					>
						{a}
					</button>
				))}
			</div>
			<form
				onSubmit={aplicarFiltros}
				style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}
			>
				<input
					aria-label="id_ibge"
					placeholder="IBGE"
					value={filtros.id_ibge ?? ""}
					onChange={(e) => setFiltro("id_ibge", e.target.value)}
					style={inp}
				/>
				<input
					aria-label="de"
					type="date"
					value={filtros.de ?? ""}
					onChange={(e) => setFiltro("de", e.target.value)}
					style={inp}
				/>
				<input
					aria-label="ate"
					type="date"
					value={filtros.ate ?? ""}
					onChange={(e) => setFiltro("ate", e.target.value)}
					style={inp}
				/>
				{aba === "auditoria" ? (
					<input
						aria-label="ator"
						placeholder="Ator"
						value={filtros.ator ?? ""}
						onChange={(e) => setFiltro("ator", e.target.value)}
						style={inp}
					/>
				) : (
					<input
						aria-label="cpf"
						placeholder="CPF"
						value={filtros.cpf ?? ""}
						onChange={(e) => setFiltro("cpf", e.target.value)}
						style={inp}
					/>
				)}
				<button
					type="submit"
					style={{
						padding: "8px 16px",
						background: t.primary,
						color: t.primaryFg,
						border: "none",
						borderRadius: 8,
						cursor: "pointer",
					}}
				>
					Filtrar
				</button>
			</form>
			<table
				style={{ width: "100%", borderCollapse: "collapse", marginBottom: 16 }}
			>
				<thead>
					<tr>
						{cols.map((c) => (
							<th
								key={c.key}
								style={{
									textAlign: "left",
									padding: 8,
									borderBottom: `1px solid ${t.border}`,
									color: t.mutedFg,
								}}
							>
								{c.label}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{dados.rows.map((r) => (
						<tr key={r.id}>
							{cols.map((c) => (
								<td
									key={c.key}
									style={{ padding: 8, borderBottom: `1px solid ${t.border}` }}
								>
									{String(r[c.key] ?? "")}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
			<div style={{ display: "flex", gap: 8, alignItems: "center" }}>
				<button
					disabled={offset === 0}
					onClick={() => setOffset((o) => Math.max(0, o - LIMIT))}
					style={{
						padding: "6px 12px",
						background: t.card,
						color: t.foreground,
						border: `1px solid ${t.border}`,
						borderRadius: 8,
						cursor: offset === 0 ? "default" : "pointer",
						opacity: offset === 0 ? 0.5 : 1,
					}}
				>
					Anterior
				</button>
				<span style={{ color: t.mutedFg }}>{dados.total} registros</span>
				<button
					disabled={!temProxima}
					onClick={() => setOffset((o) => o + LIMIT)}
					style={{
						padding: "6px 12px",
						background: t.card,
						color: t.foreground,
						border: `1px solid ${t.border}`,
						borderRadius: 8,
						cursor: !temProxima ? "default" : "pointer",
						opacity: !temProxima ? 0.5 : 1,
					}}
				>
					Próxima
				</button>
			</div>
		</div>
	);
}
