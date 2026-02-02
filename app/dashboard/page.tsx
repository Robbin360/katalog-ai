import KPIGrid from "@/components/dashboard/KPIGrid"
import ProductTable from "@/components/dashboard/ProductTable"
import ProductSheet from "@/components/dashboard/ProductSheet"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function DashboardPage() {
    return (
        <main className="flex min-h-screen flex-col bg-zinc-950 p-8 space-y-8">

            {/* HEADER */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Overview</h1>
                    <p className="text-zinc-400">Manage your catalog performance and optimizations.</p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button className="bg-white text-black hover:bg-zinc-200">
                        <Plus className="mr-2 h-4 w-4" />
                        Upload New
                    </Button>
                </div>
            </div>

            {/* KPI SECTION */}
            <KPIGrid />

            {/* MAIN DATA TABLE */}
            <ProductTable />

            {/* HIDDEN / OVERLAY COMPONENTS */}
            <ProductSheet />

        </main>
    )
}
