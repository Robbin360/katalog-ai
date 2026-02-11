"use client"

import { useMemo, useState } from "react"
import { Search, Filter, Package, Clock3, CheckCircle2, AlertCircle, WandSparkles } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const placeholderInventory = [
    { id: "A-1024", title: "Running Sneaker Nova", status: "DONE", updatedAt: "2h ago" },
    { id: "A-1025", title: "Trail Backpack Aero 28L", status: "PROCESSING", updatedAt: "5m ago" },
    { id: "A-1026", title: "Insulated Bottle PureSteel", status: "ERROR", updatedAt: "12m ago" },
]

const statusFilters = ["ALL", "DONE", "PROCESSING", "ERROR"] as const

export default function InventoryPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [status, setStatus] = useState<(typeof statusFilters)[number]>("ALL")

    const rows = useMemo(() => {
        return placeholderInventory.filter((row) => {
            const matchesSearch = row.title.toLowerCase().includes(searchTerm.toLowerCase()) || row.id.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesStatus = status === "ALL" || row.status === status
            return matchesSearch && matchesStatus
        })
    }, [searchTerm, status])

    return (
        <div className="min-h-screen bg-background text-foreground p-8 font-sans selection:bg-primary/30">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
                    <p className="text-sm text-muted-foreground mt-1">Review catalog assets and track optimization status in one place.</p>
                </div>
                <Button className="bg-foreground text-background hover:bg-foreground/90 font-semibold" disabled>
                    <WandSparkles className="mr-2 h-4 w-4" />
                    Bulk Optimize (Soon)
                </Button>
            </div>

            <Card className="bg-card border-border mb-6">
                <CardHeader className="pb-4">
                    <CardTitle className="text-base">Filters</CardTitle>
                    <CardDescription>Prepare the final inventory workflow while data agents are being integrated.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by asset name or ID"
                            className="pl-10"
                        />
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        {statusFilters.map((option) => (
                            <Button
                                key={option}
                                variant="outline"
                                size="sm"
                                onClick={() => setStatus(option)}
                                className={status === option ? "border-primary text-primary" : "text-muted-foreground"}
                            >
                                {option === "ALL" ? "All statuses" : option}
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-card border-border overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/30">
                        <TableRow className="border-border hover:bg-transparent">
                            <TableHead>Asset</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Last update</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-28 text-center text-muted-foreground">
                                    No matching assets yet. Adjust filters or wait for your next sync.
                                </TableCell>
                            </TableRow>
                        ) : rows.map((row) => (
                            <TableRow key={row.id} className="border-border hover:bg-accent/40">
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-md border border-border bg-muted flex items-center justify-center">
                                            <Package className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{row.title}</p>
                                            <p className="text-xs text-muted-foreground font-mono">{row.id}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell><StatusBadge status={row.status} /></TableCell>
                                <TableCell className="text-sm text-muted-foreground">{row.updatedAt}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" disabled>
                                        Open
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    if (status === "DONE") {
        return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"><CheckCircle2 className="mr-1 h-3 w-3" /> Ready</Badge>
    }

    if (status === "PROCESSING") {
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20"><Clock3 className="mr-1 h-3 w-3" /> Processing</Badge>
    }

    return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20"><AlertCircle className="mr-1 h-3 w-3" /> Requires review</Badge>
}
