import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { AdminApp } from "./AdminApp";

beforeEach(() => localStorage.clear());

describe("AdminApp", () => {
  it("mostra login sem token", () => {
    render(<AdminApp />);
    expect(screen.getByText(/entrar/i)).toBeInTheDocument();
  });
});
