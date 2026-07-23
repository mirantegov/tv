import { Card } from "../components";
import { useTheme } from "../theme";

// ponytail: placeholder único p/ todos os módulos de Secretaria. Conteúdo é
// adicionado por secretaria depois — troque por componentes próprios quando for.
export default function SecretariaModule() {
	const { t } = useTheme();
	return (
		<Card className="p-8 text-center">
			<div className="text-sm" style={{ color: t.mutedFg }}>
				Conteúdo em breve.
			</div>
		</Card>
	);
}
