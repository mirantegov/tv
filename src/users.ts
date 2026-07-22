// Cadastro de usuários do painel.
// ponytail: gate client-side para app de demonstração — a senha vai no bundle,
// então isto NÃO é segurança real; um backend precisa dono das credenciais.
// Apenas "admin" pode ativar/desativar módulos (ver App.tsx). Os demais papéis
// são rótulos de identificação — herdam o mesmo painel, sem controle de módulos.
export type Role = "admin" | "suporte" | "comercial" | "prefeito";

export interface User {
	cpf: string; // 11 dígitos, sem máscara
	nome: string;
	role: Role;
	senha: string; // 8 caracteres alfanuméricos
}

export const USERS: User[] = [
	{
		cpf: "00000000000",
		nome: "Administrador",
		role: "admin",
		senha: "R1JmYp5U",
	},
	{
		cpf: "77777777777",
		nome: "Suporte",
		role: "suporte",
		senha: "4Vuv3DpW",
	},
	{
		cpf: "99999999999",
		nome: "Comercial",
		role: "comercial",
		senha: "RS3n8KtQ",
	},
	{
		cpf: "07320700905",
		nome: "Rodrigo Ribeiro",
		role: "prefeito",
		senha: "Xt0bqWpU",
	},
];

// Autentica por CPF (ignorando máscara) + senha exata. Retorna o usuário ou null.
export const authenticate = (cpf: string, senha: string): User | null =>
	USERS.find((u) => u.cpf === cpf.replace(/\D/g, "") && u.senha === senha) ??
	null;
