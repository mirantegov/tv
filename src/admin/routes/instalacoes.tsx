import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/admin/components/ui/badge";
import { Button } from "@/admin/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/admin/components/ui/dialog";
import { Input } from "@/admin/components/ui/input";
import { Label } from "@/admin/components/ui/label";
import { Skeleton } from "@/admin/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/admin/components/ui/table";
import { cpApi } from "@/admin/cpApi";

type Instalacao = {
	id_ibge: string;
	slug: string;
	nome: string;
	uf: string;
	status: string;
};

const statusVariant = {
	ativa: "default",
	"a-instalar": "secondary",
	desativada: "outline",
} as const;

export function InstalacoesPage({
	onAbrir,
}: {
	onAbrir?: (id: string) => void;
}) {
	const navigate = useNavigate();
	// ponytail: typed params precisam de strictNullChecks (ver nota em router.tsx); cast local.
	const abrir =
		onAbrir ??
		((id: string) =>
			(navigate as (opts: unknown) => void)({
				to: "/instalacoes/$id",
				params: { id },
			}));

	const [itens, setItens] = useState<Instalacao[] | null>(null);
	const [open, setOpen] = useState(false);
	const [form, setForm] = useState({ id_ibge: "", slug: "", nome: "", uf: "" });
	const [enviando, setEnviando] = useState(false);

	async function carregar() {
		try {
			const dados = await cpApi.cpFetch("/instalacoes");
			setItens(dados);
		} catch {
			toast.error("Falha ao carregar instalações");
		}
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: carregar só deve rodar no mount
	useEffect(() => {
		carregar();
	}, []);

	async function criar(e: React.FormEvent) {
		e.preventDefault();
		setEnviando(true);
		try {
			await cpApi.cpFetch("/instalacoes", {
				method: "POST",
				body: JSON.stringify(form),
			});
			setForm({ id_ibge: "", slug: "", nome: "", uf: "" });
			setOpen(false);
			await carregar();
			toast.success("Instalação criada");
		} catch {
			toast.error("Falha ao criar instalação");
		} finally {
			setEnviando(false);
		}
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-end">
				<Dialog open={open} onOpenChange={setOpen}>
					<DialogTrigger asChild>
						<Button>Nova instalação</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Nova instalação</DialogTitle>
						</DialogHeader>
						<form onSubmit={criar} className="space-y-4">
							<div className="space-y-1.5">
								<Label htmlFor="id_ibge">IBGE</Label>
								<Input
									id="id_ibge"
									value={form.id_ibge}
									onChange={(e) =>
										setForm({ ...form, id_ibge: e.target.value })
									}
								/>
							</div>
							<div className="space-y-1.5">
								<Label htmlFor="slug">slug</Label>
								<Input
									id="slug"
									value={form.slug}
									onChange={(e) => setForm({ ...form, slug: e.target.value })}
								/>
							</div>
							<div className="space-y-1.5">
								<Label htmlFor="nome">nome</Label>
								<Input
									id="nome"
									value={form.nome}
									onChange={(e) => setForm({ ...form, nome: e.target.value })}
								/>
							</div>
							<div className="space-y-1.5">
								<Label htmlFor="uf">UF</Label>
								<Input
									id="uf"
									value={form.uf}
									onChange={(e) => setForm({ ...form, uf: e.target.value })}
								/>
							</div>
							<DialogFooter>
								<Button type="submit" disabled={enviando}>
									Criar
								</Button>
							</DialogFooter>
						</form>
					</DialogContent>
				</Dialog>
			</div>

			{itens === null ? (
				<div className="space-y-2">
					<Skeleton className="h-8 w-full" />
					<Skeleton className="h-8 w-full" />
					<Skeleton className="h-8 w-full" />
				</div>
			) : itens.length === 0 ? (
				<p className="py-10 text-center text-muted-foreground">
					Nenhuma instalação cadastrada.
				</p>
			) : (
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Nome</TableHead>
							<TableHead>IBGE</TableHead>
							<TableHead>UF</TableHead>
							<TableHead>Status</TableHead>
							<TableHead className="text-right">Ações</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{itens.map((i) => (
							<TableRow
								key={i.id_ibge}
								className="cursor-pointer"
								onClick={() => abrir(i.id_ibge)}
							>
								<TableCell className="font-medium">{i.nome}</TableCell>
								<TableCell>{i.id_ibge}</TableCell>
								<TableCell>{i.uf}</TableCell>
								<TableCell>
									<Badge
										variant={
											statusVariant[i.status as keyof typeof statusVariant] ??
											"outline"
										}
									>
										{i.status}
									</Badge>
								</TableCell>
								<TableCell className="text-right">
									<Button
										variant="ghost"
										size="sm"
										onClick={(e) => {
											e.stopPropagation();
											abrir(i.id_ibge);
										}}
									>
										Abrir
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			)}
		</div>
	);
}
