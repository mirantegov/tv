import { describe, it, expect, beforeEach, vi } from "vitest";
import { cpApi } from "./cpApi";

beforeEach(() => { localStorage.clear(); vi.restoreAllMocks(); });

describe("cpApi", () => {
  it("guarda e limpa o token", () => {
    cpApi.setToken("abc");
    expect(cpApi.getToken()).toBe("abc");
    cpApi.clearToken();
    expect(cpApi.getToken()).toBeNull();
  });
  it("cpFetch envia Bearer e faz throw em !ok", async () => {
    cpApi.setToken("tok");
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "content-type": "application/json" } })
    );
    await cpApi.cpFetch("/instalacoes");
    const [, init] = fetchMock.mock.calls[0];
    expect((init!.headers as Record<string, string>).authorization).toBe("Bearer tok");

    fetchMock.mockResolvedValue(new Response("nope", { status: 401 }));
    await expect(cpApi.cpFetch("/x")).rejects.toThrow();
  });
});
