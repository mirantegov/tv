import jwt from "jsonwebtoken";

export function assinarDataToken(secret: string, id_entidade: string): string {
  return jwt.sign({ role: "web_gestor", id_entidade }, secret, { expiresIn: "30d" });
}
