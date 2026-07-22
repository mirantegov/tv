// Cadastro de usuários do painel.
// ponytail: gate client-side para app de demonstração — a senha vai no bundle,
// então isto NÃO é segurança real; um backend precisa dono das credenciais.
export type Role = "admin";

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
];

// Autentica por CPF (ignorando máscara) + senha exata. Retorna o usuário ou null.
export const authenticate = (cpf: string, senha: string): User | null =>
	USERS.find((u) => u.cpf === cpf.replace(/\D/g, "") && u.senha === senha) ??
	null;
