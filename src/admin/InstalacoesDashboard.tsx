import { useEffect, useState } from "react";
import { useTheme } from "../theme";
import { cpApi } from "./cpApi";

type Instalacao = {
	id_ibge: string;
	slug: string;
	nome: string;
	uf: string;
	status: string;
};

export function InstalacoesDashboard({
	onAbrir,
	onLogs,
}: {
	onAbrir: (id: string) => void;
	onLogs?: () => void;
}) {
	const { t } = useTheme();
	const [itens, setItens] = useState<Instalacao[]>([]);
	const [form, setForm] = useState({ id_ibge: "", slug: "", nome: "", uf: "" });
	const [erro, setErro] = useState("");

	async function carregar() {
		try {
			setItens(await cpApi.cpFetch("/instalacoes"));
		} catch {
			setErro("Falha ao carregar.");
		}
	}
	useEffect(() => {
		carregar();
	}, []);

	async function criar(e: React.FormEvent) {
		e.preventDefault();
		setErro("");
		try {
			await cpApi.cpFetch("/instalacoes", {
				method: "POST",
				body: JSON.stringify(form),
			});
			setForm({ id_ibge: "", slug: "", nome: "", uf: "" });
			await carregar();
		} catch {
			setErro("Falha ao criar.");
		}
	}

	const inp = {
		padding: 8,
		background: t.background,
		color: t.foreground,
		border: `1px solid ${t.border}`,
		borderRadius: 8,
	} as const;

	return (
		<div style={{ padding: 24, color: t.foreground }}>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					marginBottom: 16,
				}}
			>
				<h1 style={{ fontSize: 20 }}>Instalações</h1>
				{onLogs && (
					<button
						onClick={onLogs}
						style={{
							padding: "8px 16px",
							background: t.card,
							color: t.foreground,
							border: `1px solid ${t.border}`,
							borderRadius: 8,
							cursor: "pointer",
						}}
					>
						Logs
					</button>
				)}
			</div>
			<form
				onSubmit={criar}
				style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}
			>
				<input
					aria-label="id_ibge"
					placeholder="IBGE"
					value={form.id_ibge}
					onChange={(e) => setForm({ ...form, id_ibge: e.target.value })}
					style={inp}
				/>
				<input
					aria-label="slug"
					placeholder="slug"
					value={form.slug}
					onChange={(e) => setForm({ ...form, slug: e.target.value })}
					style={inp}
				/>
				<input
					aria-label="nome"
					placeholder="nome"
					value={form.nome}
					onChange={(e) => setForm({ ...form, nome: e.target.value })}
					style={inp}
				/>
				<input
					aria-label="uf"
					placeholder="UF"
					value={form.uf}
					onChange={(e) => setForm({ ...form, uf: e.target.value })}
					style={{ ...inp, width: 60 }}
				/>
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
					Criar
				</button>
			</form>
			{erro && <div style={{ color: t.danger, marginBottom: 12 }}>{erro}</div>}
			<div style={{ display: "grid", gap: 8 }}>
				{itens.map((i) => (
					<button
						key={i.id_ibge}
						onClick={() => onAbrir(i.id_ibge)}
						style={{
							textAlign: "left",
							padding: 16,
							background: t.card,
							border: `1px solid ${t.border}`,
							borderRadius: 10,
							cursor: "pointer",
							color: t.foreground,
						}}
					>
						<strong>{i.nome}</strong> · {i.uf} ·{" "}
						<span style={{ color: t.mutedFg }}>{i.status}</span>
					</button>
				))}
			</div>
		</div>
	);
}
