import argon2 from "argon2";

export const hashSenha = (plain: string) => argon2.hash(plain);

export async function verificarSenha(
  hash: string,
  plain: string
): Promise<boolean> {
  try {
    return await argon2.verify(hash, plain);
  } catch {
    return false;
  }
}
