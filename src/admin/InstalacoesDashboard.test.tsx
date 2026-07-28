import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { ThemeProvider } from "../theme";
import { InstalacoesDashboard } from "./InstalacoesDashboard";

beforeEach(() => { localStorage.clear(); localStorage.setItem("cp_token", "t"); });

function mockFetchSequence(...responses: any[]) {
  const spy = vi.spyOn(globalThis, "fetch");
  for (const r of responses) spy.mockResolvedValueOnce(new Response(JSON.stringify(r), { status: 200, headers: { "content-type": "application/json" } }));
  return spy;
}

describe("InstalacoesDashboard", () => {
  it("lista instalações vindas da API", async () => {
    mockFetchSequence([{ id_ibge: "4117909", slug: "palotina", nome: "Palotina", uf: "PR", status: "ativa" }]);
    render(<ThemeProvider><InstalacoesDashboard onAbrir={() => {}} /></ThemeProvider>);
    await waitFor(() => expect(screen.getByText("Palotina")).toBeInTheDocument());
  });
});
