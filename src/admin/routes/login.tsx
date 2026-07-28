import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/admin/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/admin/components/ui/card";
import { Input } from "@/admin/components/ui/input";
import { Label } from "@/admin/components/ui/label";
import { cpApi } from "@/admin/cpApi";

export function LoginPage({ onSuccess }: { onSuccess?: () => void }) {
	const navigate = useNavigate();
	const [login, setLogin] = useState("");
	const [senha, setSenha] = useState("");
	const [erro, setErro] = useState("");
	const [enviando, setEnviando] = useState(false);

	const handleSuccess = onSuccess ?? (() => navigate({ to: "/instalacoes" }));

	async function submit(e: React.FormEvent) {
		e.preventDefault();
		setErro("");
		setEnviando(true);
		try {
			const { token } = await cpApi.login(login, senha);
			cpApi.setToken(token);
			handleSuccess();
		} catch {
			setErro("Login ou senha inválidos.");
		} finally {
			setEnviando(false);
		}
	}

	return (
		<div className="grid min-h-svh place-items-center">
			<Card className="w-[380px]">
				<CardHeader>
					<CardTitle>Mirante · Admin</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={submit} className="space-y-4">
						<div className="space-y-1.5">
							<Label htmlFor="login">login</Label>
							<Input
								id="login"
								aria-label="login"
								value={login}
								onChange={(e) => setLogin(e.target.value)}
							/>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="senha">senha</Label>
							<Input
								id="senha"
								aria-label="senha"
								type="password"
								value={senha}
								onChange={(e) => setSenha(e.target.value)}
							/>
						</div>
						{erro && <p className="text-sm text-destructive">{erro}</p>}
						<Button type="submit" className="w-full" disabled={enviando}>
							Entrar
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
