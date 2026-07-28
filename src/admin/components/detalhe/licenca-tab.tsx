import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/admin/components/ui/button";
import { Input } from "@/admin/components/ui/input";
import { Label } from "@/admin/components/ui/label";
import { Switch } from "@/admin/components/ui/switch";
import { cpApi } from "@/admin/cpApi";

export function LicencaTab({ id }: { id: string }) {
	const [ativo, setAtivo] = useState(false);
	const [validade, setValidade] = useState("");
	const [salvando, setSalvando] = useState(false);

	// biome-ignore lint/correctness/useExhaustiveDependencies: carrega só quando id muda
	useEffect(() => {
		(async () => {
			const inst = await cpApi.cpFetch(`/instalacoes/${id}`);
			setAtivo(!!inst.licenca_ativo);
			setValidade(
				inst.licenca_validade ? String(inst.licenca_validade).slice(0, 10) : "",
			);
		})();
	}, [id]);

	async function salvar() {
		setSalvando(true);
		try {
			await cpApi.cpFetch(`/instalacoes/${id}/licenca`, {
				method: "PUT",
				body: JSON.stringify({ ativo, validade: validade || null }),
			});
			toast.success("Licença atualizada");
		} catch {
			toast.error("Falha ao salvar licença");
		} finally {
			setSalvando(false);
		}
	}

	return (
		<div className="max-w-sm space-y-4">
			<div className="flex items-center gap-3">
				<Switch id="licenca_ativo" checked={ativo} onCheckedChange={setAtivo} />
				<Label htmlFor="licenca_ativo">Ativo</Label>
			</div>
			<div className="space-y-1.5">
				<Label htmlFor="validade">Validade</Label>
				<Input
					id="validade"
					type="date"
					value={validade}
					onChange={(e) => setValidade(e.target.value)}
				/>
			</div>
			<Button onClick={salvar} disabled={salvando}>
				Salvar
			</Button>
		</div>
	);
}
