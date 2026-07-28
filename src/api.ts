// Cliente da API (PostgREST). Cada view api.* devolve [{ data: <shape do export> }].
import { API_URL } from "./tenant";

// URL do control-plane central. Vazio → módulos ficam sem fonte (no-op).
const CP_URL: string = (globalThis as any).__CP_URL__ ?? "";

// Injeta o data-token (RLS) do PostgREST quando presente; omite sem token
// (mantém mock/dev funcionando sem auth).
function pgrstHeaders(): HeadersInit {
	const headers: Record<string, string> = { Accept: "application/json" };
	const token = localStorage.getItem("pgrst_token");
	if (token) headers.authorization = `Bearer ${token}`;
	return headers;
}

export async function fetchModule<T>(path: string): Promise<T> {
	const res = await fetch(`${API_URL}/${path}`, { headers: pgrstHeaders() });
	if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
	const rows = (await res.json()) as Array<{ data: T }>;
	if (!Array.isArray(rows) || rows.length === 0) {
		throw new Error(`${path}: resposta vazia`);
	}
	return rows[0].data;
}

// Estado on/off dos módulos: lido do central (só o /admin altera). Read-only
// na TV. Sem CP_URL/cp_token vira no-op → o front usa só o cache do localStorage.
export async function fetchHiddenModules(): Promise<string[]> {
	const cpToken = localStorage.getItem("cp_token");
	if (!CP_URL || !cpToken) return [];
	const res = await fetch(`${CP_URL}/me/modulos`, {
		headers: { Accept: "application/json", authorization: `Bearer ${cpToken}` },
	});
	if (!res.ok) throw new Error(`me/modulos: HTTP ${res.status}`);
	const rows = (await res.json()) as Array<{ path: string; oculto: boolean }>;
	return rows.filter((r) => r.oculto === true).map((r) => r.path);
}
