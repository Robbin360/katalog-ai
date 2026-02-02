import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { DollarSign, Activity, Package } from "lucide-react"

export default function KPIGrid() {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            {/* KPI 1: REVENUE AT RISK */}
            <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-zinc-400">
                        Revenue at Risk
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-zinc-100">$4,250<span className="text-sm font-normal text-zinc-500">/mo</span></div>
                    <p className="text-xs text-zinc-500 mt-1">
                        +20.1% from last month
                    </p>
                </CardContent>
            </Card>

            {/* KPI 2: CATALOG HEALTH */}
            <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-zinc-400">
                        Catalog Health
                    </CardTitle>
                    <Activity className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-zinc-100">64%</div>
                    <div className="h-2 w-full bg-zinc-800 mt-2 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-500 w-[64%]" />
                    </div>
                </CardContent>
            </Card>

            {/* KPI 3: OPTIMIZATION QUEUE */}
            <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-zinc-400">
                        Optimization Queue
                    </CardTitle>
                    <Package className="h-4 w-4 text-zinc-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-zinc-100">12</div>
                    <p className="text-xs text-zinc-500 mt-1">
                        Products pending review
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
