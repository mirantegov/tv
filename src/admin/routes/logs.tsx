import { useEffect, useState } from "react";
import { Button } from "@/admin/components/ui/button";
import { Input } from "@/admin/components/ui/input";
import { Label } from "@/admin/components/ui/label";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/admin/components/ui/table";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@/admin/components/ui/tabs";
import { cpApi } from "@/admin/cpApi";

const LIMIT = 50;
const fmtDataHora = new Intl.DateTimeFormat("pt-BR", {
	dateStyle: "short",
	timeStyle: "short",
});

type Aba = "acessos" | "auditoria";

const COLS: Record<Aba, { key: string; label: string }[]> = {
	acessos: [
		{ key: "criado_em", label: "Data/hora" },
		{ key: "cpf", label: "CPF" },
		{ key: "nome", label: "Nome" },
		{ key: "id_ibge", label: "IBGE" },
		{ key: "id_entidade", label: "Entidade" },
	],
	auditoria: [
		{ key: "criado_em", label: "Data/hora" },
		{ key: "ator", label: "Ator" },
		{ key: "acao", label: "Ação" },
		{ key: "alvo", label: "Alvo" },
	],
};

function formatarCelula(chave: string, valor: unknown) {
	if (chave === "criado_em" && valor)
		return fmtDataHora.format(new Date(String(valor)));
	return String(valor ?? "");
}

function LogsTab({ aba }: { aba: Aba }) {
	const [offset, setOffset] = useState(0);
	const [dados, setDados] = useState<{ rows: any[]; total: number }>({
		rows: [],
		total: 0,
	});
	const [filtros, setFiltros] = useState<Record<string, string>>({});

	async function carregar(o: number) {
		const params = new URLSearchParams({
			limit: String(LIMIT),
			offset: String(o),
		});
		for (const [k, v] of Object.entries(filtros)) if (v) params.set(k, v);
		try {
			setDados(await cpApi.cpFetch(`/logs/${aba}?${params}`));
		} catch {
			setDados({ rows: [], total: 0 });
		}
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: recarrega quando a página muda; "Aplicar" dispara com offset 0 explicitamente
	useEffect(() => {
		carregar(offset);
	}, [offset]);

	function aplicar(e: React.FormEvent) {
		e.preventDefault();
		setOffset(0);
		carregar(0);
	}

	function setFiltro(k: string, v: string) {
		setFiltros((f) => ({ ...f, [k]: v }));
	}

	const cols = COLS[aba];
	const temProxima = offset + LIMIT < dados.total;

	return (
		<div className="space-y-4">
			<form onSubmit={aplicar} className="flex flex-wrap items-end gap-2">
				<div className="space-y-1.5">
					<Label htmlFor={`${aba}-id_ibge`}>IBGE</Label>
					<Input
						id={`${aba}-id_ibge`}
						value={filtros.id_ibge ?? ""}
						onChange={(e) => setFiltro("id_ibge", e.target.value)}
					/>
				</div>
				<div className="space-y-1.5">
					<Label htmlFor={`${aba}-de`}>De</Label>
					<Input
						id={`${aba}-de`}
						type="date"
						value={filtros.de ?? ""}
						onChange={(e) => setFiltro("de", e.target.value)}
					/>
				</div>
				<div className="space-y-1.5">
					<Label htmlFor={`${aba}-ate`}>Até</Label>
					<Input
						id={`${aba}-ate`}
						type="date"
						value={filtros.ate ?? ""}
						onChange={(e) => setFiltro("ate", e.target.value)}
					/>
				</div>
				{aba === "auditoria" ? (
					<div className="space-y-1.5">
						<Label htmlFor="auditoria-ator">Ator</Label>
						<Input
							id="auditoria-ator"
							value={filtros.ator ?? ""}
							onChange={(e) => setFiltro("ator", e.target.value)}
						/>
					</div>
				) : (
					<div className="space-y-1.5">
						<Label htmlFor="acessos-cpf">CPF</Label>
						<Input
							id="acessos-cpf"
							value={filtros.cpf ?? ""}
							onChange={(e) => setFiltro("cpf", e.target.value)}
						/>
					</div>
				)}
				<Button type="submit">Aplicar</Button>
			</form>

			{dados.rows.length === 0 ? (
				<p className="py-10 text-center text-muted-foreground">
					Nenhum registro encontrado.
				</p>
			) : (
				<Table>
					<TableHeader>
						<TableRow>
							{cols.map((c) => (
								<TableHead key={c.key}>{c.label}</TableHead>
							))}
						</TableRow>
					</TableHeader>
					<TableBody>
						{dados.rows.map((r) => (
							<TableRow key={r.id}>
								{cols.map((c) => (
									<TableCell key={c.key}>
										{formatarCelula(c.key, r[c.key])}
									</TableCell>
								))}
							</TableRow>
						))}
					</TableBody>
				</Table>
			)}

			<div className="flex items-center gap-2">
				<Button
					variant="outline"
					size="sm"
					disabled={offset === 0}
					onClick={() => setOffset((o) => Math.max(0, o - LIMIT))}
				>
					Anterior
				</Button>
				<span className="text-sm text-muted-foreground">
					{dados.total} registros
				</span>
				<Button
					variant="outline"
					size="sm"
					disabled={!temProxima}
					onClick={() => setOffset((o) => o + LIMIT)}
				>
					Próxima
				</Button>
			</div>
		</div>
	);
}

export function LogsPage() {
	return (
		<Tabs defaultValue="acessos">
			<TabsList>
				<TabsTrigger value="acessos">Acessos</TabsTrigger>
				<TabsTrigger value="auditoria">Auditoria</TabsTrigger>
			</TabsList>
			<TabsContent value="acessos">
				<LogsTab aba="acessos" />
			</TabsContent>
			<TabsContent value="auditoria">
				<LogsTab aba="auditoria" />
			</TabsContent>
		</Tabs>
	);
}
