import { describe, it, expect } from "vitest";
import { hashSenha, verificarSenha } from "../src/auth/hash.js";

describe("hash de senha", () => {
  it("verifica a senha correta e rejeita a errada", async () => {
    const hash = await hashSenha("segredo123");
    expect(hash).not.toContain("segredo123");
    expect(await verificarSenha(hash, "segredo123")).toBe(true);
    expect(await verificarSenha(hash, "errada")).toBe(false);
  });
});
