import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Building2, Landmark, LogOut, ScrollText } from "lucide-react";
import { cpApi } from "@/admin/cpApi";
import { cn } from "@/admin/lib/utils";

const navItems = [
	{ to: "/instalacoes", label: "Instalações", icon: Building2 },
	{ to: "/logs", label: "Logs", icon: ScrollText },
] as const;

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
	const navigate = useNavigate();
	const { pathname } = useLocation();

	function sair() {
		cpApi.clearToken();
		navigate({ to: "/login" });
	}

	return (
		<div className="flex h-full flex-col">
			<div className="flex h-14 items-center gap-2 border-b px-4">
				<Landmark className="h-5 w-5 text-primary" />
				<div className="leading-tight">
					<div className="text-sm font-semibold">Mirante</div>
					<div className="text-xs text-muted-foreground">Control Plane</div>
				</div>
			</div>
			<nav className="flex-1 space-y-1 p-2">
				{navItems.map(({ to, label, icon: Icon }) => {
					const active = pathname.startsWith(to);
					return (
						<Link
							key={to}
							to={to}
							onClick={onNavigate}
							className={cn(
								"flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground",
								active && "bg-accent text-accent-foreground",
							)}
						>
							<Icon className="h-4 w-4" />
							{label}
						</Link>
					);
				})}
			</nav>
			<div className="border-t p-2">
				<button
					type="button"
					onClick={sair}
					className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
				>
					<LogOut className="h-4 w-4" />
					Sair
				</button>
			</div>
		</div>
	);
}
