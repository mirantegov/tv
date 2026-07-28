import { useEffect, useState } from "react";
import { NAV_GROUPS } from "../App";
import { Sw } from "../components";
import { useTheme } from "../theme";
import { cpApi } from "./cpApi";

type Aba = "entidades" | "gestores" | "licenca" | "modulos";
const CATALOGO: string[] = NAV_GROUPS.flatMap((g: any) => g.items).map(
	(i: any) => i.path,
);

type Entidade = { id_entidade: string; nome: string; tipo: string };
type Gestor = { cpf: string; nome: string; role: string; id_entidade: string };

export function InstalacaoDetalhe({
	id,
	onVoltar,
}: {
	id: string;
	onVoltar: () => void;
}) {
	const { t } = useTheme();
	const [aba, setAba] = useState<Aba>("entidades");

	const inp = {
		padding: 8,
		background: t.background,
		color: t.foreground,
		border: `1px solid ${t.border}`,
		borderRadius: 8,
	} as const;
	const btn = {
		padding: "8px 16px",
		background: t.primary,
		color: t.primaryFg,
		border: "none",
		borderRadius: 8,
		cursor: "pointer",
	} as const;
	const row = {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		padding: 12,
		background: t.card,
		border: `1px solid ${t.border}`,
		borderRadius: 10,
	} as const;

	// ---------- Entidades ----------
	const [entidades, setEntidades] = useState<Entidade[]>([]);
	const [formEnt, setFormEnt] = useState({
		id_entidade: "",
		nome: "",
		tipo: "",
	});

	async function carregarEntidades() {
		setEntidades(await cpApi.cpFetch(`/instalacoes/${id}/entidades`));
	}
	useEffect(() => {
		carregarEntidades();
	}, [id]);

	async function criarEntidade(e: React.FormEvent) {
		e.preventDefault();
		await cpApi.cpFetch(`/instalacoes/${id}/entidades`, {
			method: "POST",
			body: JSON.stringify(formEnt),
		});
		setFormEnt({ id_entidade: "", nome: "", tipo: "" });
		await carregarEntidades();
	}

	async function removerEntidade(idEntidade: string) {
		await cpApi.cpFetch(`/entidades/${idEntidade}`, { method: "DELETE" });
		await carregarEntidades();
	}

	// ---------- Gestores ----------
	const [gestores, setGestores] = useState<Gestor[]>([]);
	const [formGes, setFormGes] = useState({
		cpf: "",
		nome: "",
		senha: "",
		role: "gestor",
		id_entidade: "",
	});

	async function carregarGestores() {
		setGestores(await cpApi.cpFetch(`/instalacoes/${id}/gestores`));
	}
	useEffect(() => {
		if (aba === "gestores") {
			carregarGestores();
			carregarEntidades();
		}
	}, [aba, id]);

	async function criarGestor(e: React.FormEvent) {
		e.preventDefault();
		await cpApi.cpFetch(`/instalacoes/${id}/gestores`, {
			method: "POST",
			body: JSON.stringify(formGes),
		});
		setFormGes({
			cpf: "",
			nome: "",
			senha: "",
			role: "gestor",
			id_entidade: "",
		});
		await carregarGestores();
	}

	async function removerGestor(cpf: string) {
		await cpApi.cpFetch(`/gestores/${cpf}`, { method: "DELETE" });
		await carregarGestores();
	}

	async function trocarSenha(cpf: string) {
		const senha = window.prompt("Nova senha:");
		if (!senha) return;
		await cpApi.cpFetch(`/gestores/${cpf}`, {
			method: "PATCH",
			body: JSON.stringify({ senha }),
		});
	}

	// ---------- Licença ----------
	const [licAtivo, setLicAtivo] = useState(false);
	const [licValidade, setLicValidade] = useState("");

	async function carregarLicenca() {
		const inst = await cpApi.cpFetch(`/instalacoes/${id}`);
		setLicAtivo(!!inst.licenca_ativo);
		setLicValidade(
			inst.licenca_validade ? String(inst.licenca_validade).slice(0, 10) : "",
		);
	}
	useEffect(() => {
		if (aba === "licenca") carregarLicenca();
	}, [aba, id]);

	async function salvarLicenca() {
		await cpApi.cpFetch(`/instalacoes/${id}/licenca`, {
			method: "PUT",
			body: JSON.stringify({ ativo: licAtivo, validade: licValidade || null }),
		});
	}

	// ---------- Módulos ----------
	const [modulos, setModulos] = useState<Map<string, boolean>>(new Map());

	async function carregarModulos() {
		const rows: { path: string; oculto: boolean }[] = await cpApi.cpFetch(
			`/instalacoes/${id}/modulos`,
		);
		setModulos(new Map(rows.map((r) => [r.path, r.oculto])));
	}
	useEffect(() => {
		if (aba === "modulos") carregarModulos();
	}, [aba, id]);

	function toggleModulo(path: string) {
		setModulos((prev) => {
			const next = new Map(prev);
			next.set(path, !next.get(path));
			return next;
		});
	}

	async function salvarModulos() {
		const body = {
			modulos: CATALOGO.map((path) => ({ path, oculto: !!modulos.get(path) })),
		};
		await cpApi.cpFetch(`/instalacoes/${id}/modulos`, {
			method: "PUT",
			body: JSON.stringify(body),
		});
	}

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
			<div role="tablist" style={{ display: "flex", gap: 8, marginBottom: 16 }}>
				{(["entidades", "gestores", "licenca", "modulos"] as Aba[]).map((a) => (
					<button
						key={a}
						role="button"
						onClick={() => setAba(a)}
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
						{a === "modulos" ? "Módulos" : a === "licenca" ? "Licença" : a}
					</button>
				))}
			</div>

			{aba === "entidades" && (
				<div>
					<form
						onSubmit={criarEntidade}
						style={{
							display: "flex",
							gap: 8,
							marginBottom: 16,
							flexWrap: "wrap",
						}}
					>
						<input
							aria-label="id_entidade"
							placeholder="id"
							value={formEnt.id_entidade}
							onChange={(e) =>
								setFormEnt({ ...formEnt, id_entidade: e.target.value })
							}
							style={inp}
						/>
						<input
							aria-label="nome"
							placeholder="nome"
							value={formEnt.nome}
							onChange={(e) => setFormEnt({ ...formEnt, nome: e.target.value })}
							style={inp}
						/>
						<input
							aria-label="tipo"
							placeholder="tipo"
							value={formEnt.tipo}
							onChange={(e) => setFormEnt({ ...formEnt, tipo: e.target.value })}
							style={inp}
						/>
						<button type="submit" style={btn}>
							Criar
						</button>
					</form>
					<div style={{ display: "grid", gap: 8 }}>
						{entidades.map((e) => (
							<div key={e.id_entidade} style={row}>
								<span>
									<strong>{e.nome}</strong> · {e.tipo}
								</span>
								<button
									onClick={() => removerEntidade(e.id_entidade)}
									style={{
										background: "none",
										border: "none",
										color: t.danger,
										cursor: "pointer",
									}}
								>
									Remover
								</button>
							</div>
						))}
					</div>
				</div>
			)}

			{aba === "gestores" && (
				<div>
					<form
						onSubmit={criarGestor}
						style={{
							display: "flex",
							gap: 8,
							marginBottom: 16,
							flexWrap: "wrap",
						}}
					>
						<input
							aria-label="cpf"
							placeholder="CPF"
							value={formGes.cpf}
							onChange={(e) => setFormGes({ ...formGes, cpf: e.target.value })}
							style={inp}
						/>
						<input
							aria-label="nome"
							placeholder="nome"
							value={formGes.nome}
							onChange={(e) => setFormGes({ ...formGes, nome: e.target.value })}
							style={inp}
						/>
						<input
							aria-label="senha"
							type="password"
							placeholder="senha"
							value={formGes.senha}
							onChange={(e) =>
								setFormGes({ ...formGes, senha: e.target.value })
							}
							style={inp}
						/>
						<input
							aria-label="role"
							placeholder="role"
							value={formGes.role}
							onChange={(e) => setFormGes({ ...formGes, role: e.target.value })}
							style={inp}
						/>
						<select
							aria-label="entidade"
							value={formGes.id_entidade}
							onChange={(e) =>
								setFormGes({ ...formGes, id_entidade: e.target.value })
							}
							style={inp}
						>
							<option value="">entidade...</option>
							{entidades.map((e) => (
								<option key={e.id_entidade} value={e.id_entidade}>
									{e.nome}
								</option>
							))}
						</select>
						<button type="submit" style={btn}>
							Criar
						</button>
					</form>
					<div style={{ display: "grid", gap: 8 }}>
						{gestores.map((g) => (
							<div key={g.cpf} style={row}>
								<span>
									<strong>{g.nome}</strong> · {g.role}
								</span>
								<span style={{ display: "flex", gap: 8 }}>
									<button
										onClick={() => trocarSenha(g.cpf)}
										style={{
											background: "none",
											border: "none",
											color: t.primary,
											cursor: "pointer",
										}}
									>
										Trocar senha
									</button>
									<button
										onClick={() => removerGestor(g.cpf)}
										style={{
											background: "none",
											border: "none",
											color: t.danger,
											cursor: "pointer",
										}}
									>
										Remover
									</button>
								</span>
							</div>
						))}
					</div>
				</div>
			)}

			{aba === "licenca" && (
				<div style={{ display: "grid", gap: 12, maxWidth: 320 }}>
					<label
						style={{
							display: "flex",
							alignItems: "center",
							gap: 8,
							cursor: "pointer",
						}}
						onClick={() => setLicAtivo(!licAtivo)}
					>
						<Sw on={licAtivo} t={t} /> Ativo
					</label>
					<label style={{ display: "grid", gap: 4 }}>
						Validade
						<input
							aria-label="validade"
							type="date"
							value={licValidade}
							onChange={(e) => setLicValidade(e.target.value)}
							style={inp}
						/>
					</label>
					<button onClick={salvarLicenca} style={btn}>
						Salvar
					</button>
				</div>
			)}

			{aba === "modulos" && (
				<div>
					<div style={{ display: "grid", gap: 8, marginBottom: 16 }}>
						{CATALOGO.map((path) => (
							<div key={path} style={row}>
								<span>{path}</span>
								<span
									onClick={() => toggleModulo(path)}
									style={{ cursor: "pointer" }}
								>
									<Sw on={!!modulos.get(path)} t={t} />
								</span>
							</div>
						))}
					</div>
					<button onClick={salvarModulos} style={btn}>
						Salvar
					</button>
				</div>
			)}
		</div>
	);
}
