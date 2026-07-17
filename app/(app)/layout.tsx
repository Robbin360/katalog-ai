import { cookies } from "next/headers";
import Link from "next/link";
import { Brand } from "@/components/ui/brand";
import Sidebar from "@/components/sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { supabase } from "@/lib/supabase";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies();
    const isCollapsed = cookieStore.get("sidebar_collapsed")?.value === "true";

    const { data: { user } } = await supabase.auth.getUser();

    return (
        <div className="flex min-h-screen flex-col md:flex-row bg-background">
            <Sidebar initialCollapsed={isCollapsed} user={user} />

            {/* MOBILE HEADER */}
            <div className="md:hidden flex items-center p-4 border-b border-border bg-card sticky top-0 z-50 gap-3">
                <MobileNav user={user} />
                <div className="flex items-center gap-2">
                    <Brand className="font-bold text-lg tracking-tight text-foreground" />
                </div>
            </div>

            <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
                {/* Aquí podríamos añadir un SearchBox global en el futuro */}
                <div className="flex-1 overflow-y-auto">
                    <ErrorBoundary>
                      {children}
                    </ErrorBoundary>
                </div>
            </main>
        </div>
    );
}
