import { RouterProvider } from "@tanstack/react-router";
import "./admin.css";
import { createRoot } from "react-dom/client";
import { router } from "./router";
import { AdminThemeProvider } from "./theme";

createRoot(document.getElementById("root")!).render(
	<AdminThemeProvider>
		<RouterProvider router={router} />
	</AdminThemeProvider>,
);
