import {
	createHashHistory,
	createRootRoute,
	createRoute,
	createRouter,
	Outlet,
	redirect,
} from "@tanstack/react-router";
import { AppShell } from "@/admin/components/layout/app-shell";
import { cpApi } from "@/admin/cpApi";
import { InstalacoesPage } from "@/admin/routes/instalacoes";
import { LoginPage } from "@/admin/routes/login";

const rootRoute = createRootRoute({
	component: () => <Outlet />,
});

const indexRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/",
	beforeLoad: () => {
		throw redirect({ to: "/instalacoes" });
	},
});

const loginRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/login",
	beforeLoad: () => {
		if (cpApi.getToken()) throw redirect({ to: "/instalacoes" });
	},
	component: LoginPage,
});

// ponytail: guarda de auth repetida por rota — vira middleware compartilhado se crescer mais rotas privadas.
function requireAuth() {
	if (!cpApi.getToken()) throw redirect({ to: "/login" });
}

const instalacoesRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/instalacoes",
	beforeLoad: requireAuth,
	component: () => (
		<AppShell titulo="Instalações">
			<InstalacoesPage />
		</AppShell>
	),
});

const instalacaoDetalheRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/instalacoes/$id",
	beforeLoad: requireAuth,
	component: () => (
		<AppShell titulo="Instalação">
			<p className="text-muted-foreground">Em construção</p>
		</AppShell>
	),
});

const logsRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/logs",
	beforeLoad: requireAuth,
	component: () => (
		<AppShell titulo="Logs">
			<p className="text-muted-foreground">Em construção</p>
		</AppShell>
	),
});

const routeTree = rootRoute.addChildren([
	indexRoute,
	loginRoute,
	instalacoesRoute,
	instalacaoDetalheRoute,
	logsRoute,
]);

// ponytail: TanStack Router's types require tsconfig strictNullChecks; o repo
// mantém strict:false pelo código legado da TV. Cast local em vez de ligar
// strict globalmente (isso quebraria o typecheck dos arquivos da TV).
// @ts-expect-error strictNullChecks off — ver comentário acima
export const router = createRouter({
	routeTree,
	history: createHashHistory(),
});

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}
