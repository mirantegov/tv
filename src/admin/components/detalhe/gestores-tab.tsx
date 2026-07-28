import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Entidade } from "@/admin/components/detalhe/entidades-tab";
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

type Gestor = { cpf: string; nome: string; role: string; id_entidade: string };

const FORM_VAZIO = {
	cpf: "",
	nome: "",
	senha: "",
	role: "gestor",
	id_entidade: "",
};

const selectClass =
	"flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm";

export function GestoresTab({ id }: { id: string }) {
	const [gestores, setGestores] = useState<Gestor[]>([]);
	const [entidades, setEntidades] = useState<Entidade[]>([]);
	const [open, setOpen] = useState(false);
	const [form, setForm] = useState(FORM_VAZIO);
	const [enviando, setEnviando] = useState(false);
	const [senhaCpf, setSenhaCpf] = useState<string | null>(null);
	const [novaSenha, setNovaSenha] = useState("");

	async function carregar() {
		const [g, e] = await Promise.all([
			cpApi.cpFetch(`/instalacoes/${id}/gestores`),
			cpApi.cpFetch(`/instalacoes/${id}/entidades`),
		]);
		setGestores(g);
		setEntidades(e);
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: carregar só deve rodar quando id muda
	useEffect(() => {
		carregar();
	}, [id]);

	async function criar(e: React.FormEvent) {
		e.preventDefault();
		setEnviando(true);
		try {
			await cpApi.cpFetch(`/instalacoes/${id}/gestores`, {
				method: "POST",
				body: JSON.stringify(form),
			});
			setForm(FORM_VAZIO);
			setOpen(false);
			await carregar();
			toast.success("Gestor criado");
		} catch {
			toast.error("Falha ao criar gestor");
		} finally {
			setEnviando(false);
		}
	}

	async function remover(cpf: string) {
		try {
			await cpApi.cpFetch(`/gestores/${cpf}`, { method: "DELETE" });
			await carregar();
			toast.success("Gestor removido");
		} catch {
			toast.error("Falha ao remover gestor");
		}
	}

	async function salvarSenha(e: React.FormEvent) {
		e.preventDefault();
		if (!senhaCpf) return;
		try {
			await cpApi.cpFetch(`/gestores/${senhaCpf}`, {
				method: "PATCH",
				body: JSON.stringify({ senha: novaSenha }),
			});
			toast.success("Senha alterada");
			setSenhaCpf(null);
			setNovaSenha("");
		} catch {
			toast.error("Falha ao trocar senha");
		}
	}

	return (
		<div className="space-y-4">
			<div className="flex justify-end">
				<Dialog open={open} onOpenChange={setOpen}>
					<DialogTrigger asChild>
						<Button>Novo gestor</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Novo gestor</DialogTitle>
						</DialogHeader>
						<form onSubmit={criar} className="space-y-4">
							<div className="space-y-1.5">
								<Label htmlFor="cpf">CPF</Label>
								<Input
									id="cpf"
									value={form.cpf}
									onChange={(e) => setForm({ ...form, cpf: e.target.value })}
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
								<Label htmlFor="senha">senha</Label>
								<Input
									id="senha"
									type="password"
									value={form.senha}
									onChange={(e) => setForm({ ...form, senha: e.target.value })}
								/>
							</div>
							<div className="space-y-1.5">
								<Label htmlFor="role">role</Label>
								<Input
									id="role"
									value={form.role}
									onChange={(e) => setForm({ ...form, role: e.target.value })}
								/>
							</div>
							<div className="space-y-1.5">
								<Label htmlFor="id_entidade">entidade</Label>
								<select
									id="id_entidade"
									value={form.id_entidade}
									onChange={(e) =>
										setForm({ ...form, id_entidade: e.target.value })
									}
									className={selectClass}
								>
									<option value="">entidade...</option>
									{entidades.map((ent) => (
										<option key={ent.id_entidade} value={ent.id_entidade}>
											{ent.nome}
										</option>
									))}
								</select>
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

			{gestores.length === 0 ? (
				<p className="py-10 text-center text-muted-foreground">
					Nenhum gestor cadastrado.
				</p>
			) : (
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>CPF</TableHead>
							<TableHead>Nome</TableHead>
							<TableHead>Role</TableHead>
							<TableHead>Entidade</TableHead>
							<TableHead className="text-right">Ações</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{gestores.map((g) => (
							<TableRow key={g.cpf}>
								<TableCell>{g.cpf}</TableCell>
								<TableCell className="font-medium">{g.nome}</TableCell>
								<TableCell>{g.role}</TableCell>
								<TableCell>
									{entidades.find((ent) => ent.id_entidade === g.id_entidade)
										?.nome ?? g.id_entidade}
								</TableCell>
								<TableCell className="space-x-1 text-right">
									<Button
										variant="ghost"
										size="sm"
										onClick={() => {
											setSenhaCpf(g.cpf);
											setNovaSenha("");
										}}
									>
										Trocar senha
									</Button>
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
												<AlertDialogTitle>Remover gestor?</AlertDialogTitle>
												<AlertDialogDescription>
													Esta ação não pode ser desfeita. O gestor "{g.nome}"
													será removido.
												</AlertDialogDescription>
											</AlertDialogHeader>
											<AlertDialogFooter>
												<AlertDialogCancel>Cancelar</AlertDialogCancel>
												<AlertDialogAction onClick={() => remover(g.cpf)}>
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

			<Dialog
				open={senhaCpf !== null}
				onOpenChange={(o) => !o && setSenhaCpf(null)}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Trocar senha</DialogTitle>
					</DialogHeader>
					<form onSubmit={salvarSenha} className="space-y-4">
						<div className="space-y-1.5">
							<Label htmlFor="nova_senha">Nova senha</Label>
							<Input
								id="nova_senha"
								type="password"
								value={novaSenha}
								onChange={(e) => setNovaSenha(e.target.value)}
							/>
						</div>
						<DialogFooter>
							<Button type="submit" disabled={!novaSenha}>
								Salvar
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
