import { describe, expect, it } from "vitest";
import { brl, dP, dR, fmt, fmtInt, pct, sg, vari } from "./format";

describe("format pt-BR", () => {
	it("fmt usa vírgula decimal e 1 casa", () => {
		expect(fmt(1234.56)).toBe("1.234,6");
		expect(fmt(0)).toBe("0,0");
		expect(fmt(-3.14)).toBe("-3,1");
	});

	it("brl prefixa R$ e sufixa mi", () => {
		expect(brl(850)).toBe("R$ 850,0 mi");
	});

	it("pct sufixa %", () => {
		expect(pct(55.34)).toBe("55,3%");
	});

	it("fmtInt arredonda e separa milhares", () => {
		expect(fmtInt(4850.4)).toBe("4.850");
		expect(fmtInt(940)).toBe("940");
	});

	it("sg/dR/dP sinalizam positivos e negativos", () => {
		expect(sg(1)).toBe("+");
		expect(sg(-1)).toBe("−");
		expect(dR(2.5)).toBe("+2,5");
		expect(dR(-2.5)).toBe("−2,5");
		expect(dP(-10)).toBe("−10,0%");
	});

	it("vari calcula delta, percentual e direção", () => {
		expect(vari(100, 110)).toEqual({ d: 10, p: 10, up: true });
		expect(vari(100, 90).up).toBe(false);
		expect(vari(0, 5).p).toBe(0); // divisão por zero protegida
	});
});
