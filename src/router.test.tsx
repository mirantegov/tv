import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Link, RouterProvider, useRouter } from "./router";

function Probe() {
	const { path } = useRouter();
	return <div data-testid="path">{path}</div>;
}

describe("router", () => {
	it("inicia em / e navega via Link sem recarregar", () => {
		render(
			<RouterProvider>
				<Link href="/despesa">Despesa</Link>
				<Probe />
			</RouterProvider>,
		);
		expect(screen.getByTestId("path")).toHaveTextContent("/");
		fireEvent.click(screen.getByText("Despesa"));
		expect(screen.getByTestId("path")).toHaveTextContent("/despesa");
	});

	it("Link chama onNav ao navegar", () => {
		let chamado = false;
		render(
			<RouterProvider>
				<Link
					href="/x"
					onNav={() => {
						chamado = true;
					}}
				>
					ir
				</Link>
			</RouterProvider>,
		);
		fireEvent.click(screen.getByText("ir"));
		expect(chamado).toBe(true);
	});
});
