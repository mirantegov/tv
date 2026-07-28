import { describe, it, expect } from "vitest";

describe("server entrypoint", () => {
  it("throws if JWT_SECRET is not set", async () => {
    delete process.env.JWT_SECRET;
    await expect(import("../src/server.ts")).rejects.toThrow("JWT_SECRET é obrigatório");
  });

  it("throws if PGRST_JWT_SECRET is not set", async () => {
    process.env.JWT_SECRET = "test-secret";
    delete process.env.PGRST_JWT_SECRET;
    // cache-bust: a module that already threw stays "errored" for the same specifier
    await expect(
      import(/* @vite-ignore */ `../src/server.ts?pgrst-check=${Date.now()}`),
    ).rejects.toThrow(
      "PGRST_JWT_SECRET é obrigatório",
    );
  });
});
