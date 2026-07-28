const CP_URL = (globalThis as any).__CP_URL__ ?? "http://localhost:8080";
const KEY = "cp_token";

export const cpApi = {
	setToken(t: string) {
		localStorage.setItem(KEY, t);
	},
	getToken() {
		return localStorage.getItem(KEY);
	},
	clearToken() {
		localStorage.removeItem(KEY);
	},

	async cpFetch(path: string, init: RequestInit = {}) {
		const token = cpApi.getToken();
		const res = await fetch(`${CP_URL}${path}`, {
			...init,
			headers: {
				Accept: "application/json",
				...(init.body ? { "Content-Type": "application/json" } : {}),
				...(token ? { authorization: `Bearer ${token}` } : {}),
				...(init.headers ?? {}),
			},
		});
		if (!res.ok) throw new Error(`${res.status}`);
		if (res.status === 204) return null;
		return res.json();
	},

	async login(login: string, senha: string) {
		const res = await fetch(`${CP_URL}/auth/login`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
			body: JSON.stringify({ tipo: "admin", login, senha }),
		});
		if (!res.ok) throw new Error("credenciais inválidas");
		return res.json() as Promise<{ token: string; perfil: { nome: string } }>;
	},
};
