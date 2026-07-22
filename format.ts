/* Formatação pt-BR compartilhada */
export const fmt = (n) => n.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
export const brl = (n) => "R$ " + fmt(n) + " mi";
export const pct = (n) => fmt(n) + "%";
export const fmtInt = (n) => Math.round(n).toLocaleString("pt-BR");
export const sg = (n) => (n >= 0 ? "+" : "−");
export const dR = (n) => sg(n) + fmt(Math.abs(n));
export const dP = (n) => sg(n) + fmt(Math.abs(n)) + "%";
export const vari = (a, b) => { const d = b - a; return { d, p: a !== 0 ? (d / a) * 100 : 0, up: d >= 0 }; };
