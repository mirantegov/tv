import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { EntidadesTab } from "@/admin/components/detalhe/entidades-tab";
import { GestoresTab } from "@/admin/components/detalhe/gestores-tab";
import { LicencaTab } from "@/admin/components/detalhe/licenca-tab";
import { ModulosTab } from "@/admin/components/detalhe/modulos-tab";
import { Button } from "@/admin/components/ui/button";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@/admin/components/ui/tabs";

export function InstalacaoDetalhePage({
	id,
	onVoltar,
}: {
	id: string;
	onVoltar?: () => void;
}) {
	const navigate = useNavigate();
	// ponytail: typed params precisam de strictNullChecks (ver nota em router.tsx); cast local.
	const voltar =
		onVoltar ??
		(() => (navigate as (opts: unknown) => void)({ to: "/instalacoes" }));

	return (
		<div className="space-y-4">
			<Button variant="ghost" size="sm" onClick={voltar} className="-ml-2">
				<ChevronLeft className="h-4 w-4" />
				Voltar
			</Button>
			<Tabs defaultValue="entidades">
				<TabsList>
					<TabsTrigger value="entidades">Entidades</TabsTrigger>
					<TabsTrigger value="gestores">Gestores</TabsTrigger>
					<TabsTrigger value="licenca">Licença</TabsTrigger>
					<TabsTrigger value="modulos">Módulos</TabsTrigger>
				</TabsList>
				<TabsContent value="entidades">
					<EntidadesTab id={id} />
				</TabsContent>
				<TabsContent value="gestores">
					<GestoresTab id={id} />
				</TabsContent>
				<TabsContent value="licenca">
					<LicencaTab id={id} />
				</TabsContent>
				<TabsContent value="modulos">
					<ModulosTab id={id} />
				</TabsContent>
			</Tabs>
		</div>
	);
}
