// Config por tenant injetada em runtime via /config.js (window.__TENANT__).
// Em dev vem de public/config.js; no container, do entrypoint (envsubst).
export interface TenantConfig {
	id: string; // código IBGE do município (id_tenant)
	slug: string;
	nome: string;
	uf: string;
}

declare global {
	interface Window {
		__TENANT__?: TenantConfig;
		__API_URL__?: string;
	}
}

// ponytail: fallback embutido p/ dev sem config.js (ex.: testes jsdom)
export const TENANT: TenantConfig = window.__TENANT__ ?? {
	id: "4117909",
	slug: "palotina",
	nome: "Município de Palotina",
	uf: "PR",
};

// URL base da API (PostgREST). Vazio → front usa o fallback data.ts.
export const API_URL: string = window.__API_URL__ ?? "";
