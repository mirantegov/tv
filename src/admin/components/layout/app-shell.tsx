import { Menu } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/admin/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetTitle,
	SheetTrigger,
} from "@/admin/components/ui/sheet";
import { Toaster } from "@/admin/components/ui/sonner";
import { SidebarNav } from "./sidebar-nav";

export function AppShell({
	titulo,
	children,
}: {
	titulo: string;
	children: ReactNode;
}) {
	return (
		<div className="flex min-h-svh">
			<aside className="hidden w-60 shrink-0 flex-col border-r bg-card/40 md:flex">
				<SidebarNav />
			</aside>
			<div className="flex min-w-0 flex-1 flex-col">
				<header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur">
					<Sheet>
						<SheetTrigger asChild>
							<Button variant="ghost" size="icon" className="md:hidden">
								<Menu className="h-5 w-5" />
							</Button>
						</SheetTrigger>
						<SheetContent side="left" className="w-60 p-0">
							<SheetTitle className="sr-only">Menu</SheetTitle>
							<SidebarNav />
						</SheetContent>
					</Sheet>
					<h1 className="text-sm font-medium">{titulo}</h1>
				</header>
				<main className="flex-1 p-4 md:p-6">{children}</main>
			</div>
			<Toaster richColors position="top-right" />
		</div>
	);
}
