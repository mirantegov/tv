import { describe, expect, it } from "vitest";
import { authenticate, USERS } from "./users";

const demo = USERS[0];

describe("authenticate", () => {
	it("aceita CPF sem máscara e senha exata", () => {
		expect(authenticate(demo.cpf, demo.senha)).toEqual(demo);
	});

	it("aceita CPF com máscara", () => {
		const mascarado = demo.cpf.replace(
			/(\d{3})(\d{3})(\d{3})(\d{2})/,
			"$1.$2.$3-$4",
		);
		expect(authenticate(mascarado, demo.senha)).toEqual(demo);
	});

	it("rejeita senha errada", () => {
		expect(authenticate(demo.cpf, "senhaerrada")).toBeNull();
	});

	it("rejeita CPF desconhecido", () => {
		expect(authenticate("12345678901", demo.senha)).toBeNull();
	});
});
