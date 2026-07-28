import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { AdminApp } from "./AdminApp";

beforeEach(() => localStorage.clear());

describe("AdminApp", () => {
	it("mostra login sem token", () => {
		render(<AdminApp />);
		expect(screen.getByText(/entrar/i)).toBeInTheDocument();
	});
});
