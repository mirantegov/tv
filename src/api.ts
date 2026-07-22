// Cliente da API (PostgREST). Cada view api.* devolve [{ data: <shape do export> }].
import { API_URL } from "./tenant";

export async function fetchModule<T>(path: string): Promise<T> {
	const res = await fetch(`${API_URL}/${path}`, {
		headers: { Accept: "application/json" },
	});
	if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
	const rows = (await res.json()) as Array<{ data: T }>;
	if (!Array.isArray(rows) || rows.length === 0) {
		throw new Error(`${path}: resposta vazia`);
	}
	return rows[0].data;
}

// Estado on/off dos módulos, persistido no banco do tenant (api.modulo_estado).
// Sem API_URL vira no-op → o front usa só o cache do localStorage.
export async function fetchHiddenModules(): Promise<string[]> {
	if (!API_URL) return [];
	const res = await fetch(
		`${API_URL}/modulo_estado?oculto=eq.true&select=path`,
		{
			headers: { Accept: "application/json" },
		},
	);
	if (!res.ok) throw new Error(`modulo_estado: HTTP ${res.status}`);
	const rows = (await res.json()) as Array<{ path: string }>;
	return rows.map((r) => r.path);
}

export async function saveModuleHidden(
	path: string,
	oculto: boolean,
): Promise<void> {
	if (!API_URL) return;
	const res = await fetch(`${API_URL}/modulo_estado`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Prefer: "resolution=merge-duplicates",
		},
		body: JSON.stringify({
			path,
			oculto,
			atualizado_em: new Date().toISOString(),
		}),
	});
	if (!res.ok) throw new Error(`modulo_estado save: HTTP ${res.status}`);
}
