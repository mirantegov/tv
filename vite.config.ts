import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	server: { port: 5173, open: true },
	resolve: { alias: { "@": resolve(__dirname, "./src") } },
	build: {
		rollupOptions: {
			input: {
				main: resolve(__dirname, "index.html"),
				admin: resolve(__dirname, "admin.html"),
			},
		},
	},
});
