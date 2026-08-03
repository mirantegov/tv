import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/admin/components/ui/alert-dialog";
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
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/admin/components/ui/table";
import { cpApi } from "@/admin/cpApi";

export type Entidade = { id_entidade: string; nome: string; tipo: string };

const FORM_VAZIO = { id_entidade: "", nome: "", tipo: "" };

export function EntidadesTab({ id }: { id: string }) {
	const [entidades, setEntidades] = useState<Entidade[]>([]);
	const [open, setOpen] = useState(false);
	const [form, setForm] = useState(FORM_VAZIO);
	const [enviando, setEnviando] = useState(false);

	async function carregar() {
		try {
			setEntidades(await cpApi.cpFetch(`/instalacoes/${id}/entidades`));
		} catch {
			toast.error("Falha ao carregar entidades");
		}
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: carregar só deve rodar quando id muda
	useEffect(() => {
		carregar();
	}, [id]);

	async function criar(e: React.FormEvent) {
		e.preventDefault();
		setEnviando(true);
		try {
			await cpApi.cpFetch(`/instalacoes/${id}/entidades`, {
				method: "POST",
				body: JSON.stringify(form),
			});
			setForm(FORM_VAZIO);
			setOpen(false);
			await carregar();
			toast.success("Entidade criada");
		} catch {
			toast.error("Falha ao criar entidade");
		} finally {
			setEnviando(false);
		}
	}

	async function remover(idEntidade: string) {
		try {
			await cpApi.cpFetch(`/entidades/${idEntidade}`, { method: "DELETE" });
			await carregar();
			toast.success("Entidade removida");
		} catch {
			toast.error("Falha ao remover entidade");
		}
	}

	return (
		<div className="space-y-4">
			<div className="flex justify-end">
				<Dialog open={open} onOpenChange={setOpen}>
					<DialogTrigger asChild>
						<Button>Nova entidade</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Nova entidade</DialogTitle>
						</DialogHeader>
						<form onSubmit={criar} className="space-y-4">
							<div className="space-y-1.5">
								<Label htmlFor="id_entidade">id_entidade</Label>
								<Input
									id="id_entidade"
									value={form.id_entidade}
									onChange={(e) =>
										setForm({ ...form, id_entidade: e.target.value })
									}
								/>
								<p className="text-xs text-muted-foreground">
									código do TCE/PR (ex.: 12426)
								</p>
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
								<Label htmlFor="tipo">tipo</Label>
								<Input
									id="tipo"
									value={form.tipo}
									onChange={(e) => setForm({ ...form, tipo: e.target.value })}
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

			{entidades.length === 0 ? (
				<p className="py-10 text-center text-muted-foreground">
					Nenhuma entidade cadastrada.
				</p>
			) : (
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Nome</TableHead>
							<TableHead>Tipo</TableHead>
							<TableHead>ID</TableHead>
							<TableHead className="text-right">Ações</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{entidades.map((e) => (
							<TableRow key={e.id_entidade}>
								<TableCell className="font-medium">{e.nome}</TableCell>
								<TableCell>{e.tipo}</TableCell>
								<TableCell>{e.id_entidade}</TableCell>
								<TableCell className="text-right">
									<AlertDialog>
										<AlertDialogTrigger asChild>
											<Button
												variant="ghost"
												size="sm"
												className="text-destructive"
											>
												Remover
											</Button>
										</AlertDialogTrigger>
										<AlertDialogContent>
											<AlertDialogHeader>
												<AlertDialogTitle>Remover entidade?</AlertDialogTitle>
												<AlertDialogDescription>
													Esta ação não pode ser desfeita. A entidade "{e.nome}"
													será removida.
												</AlertDialogDescription>
											</AlertDialogHeader>
											<AlertDialogFooter>
												<AlertDialogCancel>Cancelar</AlertDialogCancel>
												<AlertDialogAction
													onClick={() => remover(e.id_entidade)}
												>
													Remover
												</AlertDialogAction>
											</AlertDialogFooter>
										</AlertDialogContent>
									</AlertDialog>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			)}
		</div>
	);
}
