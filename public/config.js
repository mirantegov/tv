// Defaults de desenvolvimento. Em produção o entrypoint do container sobrescreve
// este arquivo por tenant. API_URL vazio → o front cai no fallback data.ts.
window.__TENANT__ = {
	id: "4117909",
	slug: "palotina",
	nome: "Município de Palotina",
	uf: "PR",
};
window.__API_URL__ = "";
