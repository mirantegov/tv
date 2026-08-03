import { Button } from "@/admin/components/ui/button";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@/admin/components/ui/tabs";
import { type ThemeFamily, useAdminTheme } from "@/admin/theme";
import { THEMES } from "@/theme";

function AparenciaTab() {
	const { family, mode, setFamily, setMode } = useAdminTheme();
	return (
		<div className="max-w-md space-y-6">
			<div>
				<div className="mb-2 text-sm font-medium">Tema</div>
				<div className="grid grid-cols-2 gap-2">
					{Object.entries(THEMES).map(([key, t]) => (
						<Button
							key={key}
							type="button"
							variant={family === key ? "default" : "outline"}
							size="sm"
							onClick={() => setFamily(key as ThemeFamily)}
						>
							{t.label}
						</Button>
					))}
				</div>
			</div>
			<div>
				<div className="mb-2 text-sm font-medium">Modo</div>
				<div className="flex gap-2">
					<Button
						type="button"
						variant={mode === "light" ? "default" : "outline"}
						size="sm"
						onClick={() => setMode("light")}
					>
						☀ Light
					</Button>
					<Button
						type="button"
						variant={mode === "dark" ? "default" : "outline"}
						size="sm"
						onClick={() => setMode("dark")}
					>
						☾ Dark
					</Button>
				</div>
			</div>
		</div>
	);
}

export function ConfiguracoesPage() {
	return (
		<Tabs defaultValue="aparencia">
			<TabsList>
				<TabsTrigger value="aparencia">Aparência</TabsTrigger>
			</TabsList>
			<TabsContent value="aparencia">
				<AparenciaTab />
			</TabsContent>
		</Tabs>
	);
}
