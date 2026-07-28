import { useEffect, useState } from "react";
import { toast } from "sonner";
import { NAV_GROUPS } from "@/App";
import { Button } from "@/admin/components/ui/button";
import { Label } from "@/admin/components/ui/label";
import { Switch } from "@/admin/components/ui/switch";
import { cpApi } from "@/admin/cpApi";

const CATALOGO: string[] = NAV_GROUPS.flatMap((g: any) => g.items).map(
	(i: any) => i.path,
);

export function ModulosTab({ id }: { id: string }) {
	const [modulos, setModulos] = useState<Map<string, boolean>>(new Map());
	const [salvando, setSalvando] = useState(false);

	// biome-ignore lint/correctness/useExhaustiveDependencies: carrega só quando id muda
	useEffect(() => {
		(async () => {
			const rows: { path: string; oculto: boolean }[] = await cpApi.cpFetch(
				`/instalacoes/${id}/modulos`,
			);
			setModulos(new Map(rows.map((r) => [r.path, r.oculto])));
		})();
	}, [id]);

	function alternar(path: string) {
		setModulos((prev) => {
			const next = new Map(prev);
			next.set(path, !next.get(path));
			return next;
		});
	}

	async function salvar() {
		setSalvando(true);
		try {
			await cpApi.cpFetch(`/instalacoes/${id}/modulos`, {
				method: "PUT",
				body: JSON.stringify({
					modulos: CATALOGO.map((path) => ({
						path,
						oculto: !!modulos.get(path),
					})),
				}),
			});
			toast.success("Módulos atualizados");
		} catch {
			toast.error("Falha ao salvar módulos");
		} finally {
			setSalvando(false);
		}
	}

	return (
		<div className="space-y-4">
			<div className="space-y-2">
				{CATALOGO.map((path) => (
					<div
						key={path}
						className="flex items-center justify-between rounded-lg border p-3"
					>
						<Label htmlFor={`mod-${path}`} className="font-mono text-sm">
							{path}
						</Label>
						<Switch
							id={`mod-${path}`}
							checked={!!modulos.get(path)}
							onCheckedChange={() => alternar(path)}
						/>
					</div>
				))}
			</div>
			<Button onClick={salvar} disabled={salvando}>
				Salvar
			</Button>
		</div>
	);
}
