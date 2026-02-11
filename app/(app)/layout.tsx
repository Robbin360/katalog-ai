import { cookies } from "next/headers";
import Sidebar from "@/components/sidebar";
import { supabase } from "@/lib/supabase";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies();
    const isCollapsed = cookieStore.get("sidebar_collapsed")?.value === "true";

    const { data: { user } } = await supabase.auth.getUser();

    return (
        <div className="flex min-h-screen">
            <Sidebar initialCollapsed={isCollapsed} user={user} />
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Aquí podríamos añadir un SearchBox global en el futuro */}
                <div className="flex-1 overflow-y-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
