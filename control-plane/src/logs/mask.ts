export function mascararCpf(cpf: string): string {
  const d = (cpf ?? "").replace(/\D/g, "").padStart(11, "*");
  // mantém só os 3 dígitos centrais (posições 3-5, ex.: 073[207]00905)
  return `***.${d.slice(3, 6)}.***-**`;
}
