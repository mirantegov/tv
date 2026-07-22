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
