import { Skeleton } from "@/components/ui/skeleton"

export function SidebarSkeleton() {
    return (
        <div className="flex flex-col gap-2 w-full pr-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex items-center gap-2 mb-2 w-full">
                    {/* Main Card */}
                    <div className="flex-1 min-w-0 flex items-center gap-3 p-2 rounded-lg border border-transparent">
                        {/* Icon Box */}
                        <Skeleton className="w-8 h-8 rounded-lg shrink-0" />

                        {/* Text Loading */}
                        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                            <Skeleton className="h-3 w-3/4 rounded-sm" />
                            <div className="flex gap-2">
                                <Skeleton className="h-2 w-10 rounded-sm" />
                                <Skeleton className="h-2 w-6 rounded-sm" />
                            </div>
                        </div>
                    </div>

                    {/* Delete Button Placeholder */}
                    <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
                </div>
            ))}
        </div>
    )
}
