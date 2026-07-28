import { describe, it, expect } from "vitest";

describe("server entrypoint", () => {
  it("throws if JWT_SECRET is not set", async () => {
    delete process.env.JWT_SECRET;
    await expect(import("../src/server.ts")).rejects.toThrow("JWT_SECRET é obrigatório");
  });
});
