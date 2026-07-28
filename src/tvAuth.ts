// Auth da TV pelo control-plane central (gestor login). Substitui users.ts.
const CP_URL = (globalThis as any).__CP_URL__ ?? "http://localhost:8080";

const TOKEN_KEY = "cp_token";
const DATA_TOKEN_KEY = "pgrst_token";
const PERFIL_KEY = "mg_perfil";

export type Perfil = {
	nome: string;
	role: string;
	id_entidade: string;
	id_ibge: string;
};
type LoginOk = { token: string; data_token: string; perfil: Perfil };
type LoginErr = { erro: "credencial" | "licenca" | "rede" | "config" };

export const tvAuth = {
	getToken: () => localStorage.getItem(TOKEN_KEY),
	getDataToken: () => localStorage.getItem(DATA_TOKEN_KEY),
	getPerfil: (): Perfil | null => {
		const s = localStorage.getItem(PERFIL_KEY);
		return s ? JSON.parse(s) : null;
	},
	logout() {
		localStorage.removeItem(TOKEN_KEY);
		localStorage.removeItem(DATA_TOKEN_KEY);
		localStorage.removeItem(PERFIL_KEY);
	},

	async login(cpf: string, senha: string): Promise<LoginOk | LoginErr> {
		let res: Response;
		try {
			res = await fetch(`${CP_URL}/auth/login`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
				},
				body: JSON.stringify({ tipo: "gestor", cpf, senha }),
			});
		} catch {
			return { erro: "rede" };
		}
		if (res.status === 403) return { erro: "licenca" };
		if (!res.ok) return { erro: "credencial" };
		const body = (await res.json()) as LoginOk;
		if (!body.data_token) return { erro: "config" };
		localStorage.setItem(TOKEN_KEY, body.token);
		localStorage.setItem(DATA_TOKEN_KEY, body.data_token ?? "");
		localStorage.setItem(PERFIL_KEY, JSON.stringify(body.perfil));
		return body;
	},
};
