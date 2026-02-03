"use client"

import React, { useState } from 'react';
import {
    TrendingDown,
    Activity,
    Zap,
    Search,
    Filter,
    MoreHorizontal,
    ArrowUpRight,
    AlertCircle,
    CheckCircle2,
    Clock
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// --- Tipos ---
interface Product {
    id: string;
    title: string;
    image: string;
    status: 'optimized' | 'pending' | 'at_risk';
    healthScore: number;
    revenueImpact: number;
    lastUpdated: string;
}

// --- Datos de Ejemplo (Mock) ---
const MOCK_PRODUCTS: Product[] = [
    {
        id: '1',
        title: 'Premium Leather Watch - Midnight Edition',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&fit=crop',
        status: 'at_risk',
        healthScore: 42,
        revenueImpact: 1250,
        lastUpdated: '2h ago'
    },
    {
        id: '2',
        title: 'Wireless Noise Cancelling Headphones',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop',
        status: 'pending',
        healthScore: 68,
        revenueImpact: 840,
        lastUpdated: '5h ago'
    },
    {
        id: '3',
        title: 'Minimalist Ceramic Vase',
        image: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=100&h=100&fit=crop',
        status: 'optimized',
        healthScore: 96,
        revenueImpact: 0,
        lastUpdated: '1d ago'
    }
];

// --- Sub-componentes ---

const KPIGrid = () => (
    <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card className="bg-zinc-950 border-zinc-800 border-l-4 border-l-red-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-zinc-400">Revenue at Risk</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-white">$4,250.00</div>
                <p className="text-xs text-zinc-500 mt-1">
                    <span className="text-red-500 font-medium">+12.5%</span> from last month
                </p>
            </CardContent>
        </Card>

        <Card className="bg-zinc-950 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-zinc-400">Catalog Health</CardTitle>
                <Activity className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-white">64%</div>
                <Progress value={64} className="h-1 mt-3 bg-zinc-800" />
            </CardContent>
        </Card>

        <Card className="bg-zinc-950 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-zinc-400">Optimization Queue</CardTitle>
                <Zap className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-white">12</div>
                <p className="text-xs text-zinc-500 mt-1">Products being processed by AI</p>
            </CardContent>
        </Card>
    </div>
);

const StatusBadge = ({ status }: { status: Product['status'] }) => {
    const configs = {
        optimized: { label: 'Optimized', class: 'bg-green-500/10 text-green-500 border-green-500/20', icon: CheckCircle2 },
        pending: { label: 'Pending', class: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: Clock },
        at_risk: { label: 'At Risk', class: 'bg-red-500/10 text-red-500 border-red-500/20', icon: AlertCircle },
    };
    const config = configs[status];
    const Icon = config.icon;

    return (
        <Badge variant="outline" className={`${config.class} flex items-center gap-1 px-2 py-0.5`}>
            <Icon className="h-3 w-3" />
            {config.label}
        </Badge>
    );
};

// --- Componente Principal ---

export default function DashboardPage() {
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <div className="min-h-screen bg-black text-zinc-100 p-8 font-sans selection:bg-blue-500/30">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Opportunity Radar</h1>
                    <p className="text-zinc-500 mt-1">Identify and recover revenue from underperforming listings.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-300">
                        Export Report
                    </Button>
                    <Button className="bg-white text-black hover:bg-zinc-200 font-semibold">
                        <Zap className="mr-2 h-4 w-4 fill-current" />
                        Sync Shopify
                    </Button>
                </div>
            </div>

            {/* KPIs */}
            <KPIGrid />

            {/* Main Content */}
            <Card className="bg-zinc-950 border-zinc-800 overflow-hidden">
                <CardHeader className="border-b border-zinc-900 bg-zinc-950/50 px-6 py-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                            <Input
                                placeholder="Search products..."
                                className="pl-10 bg-zinc-900 border-zinc-800 focus:ring-zinc-700 text-zinc-200"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                                <Filter className="mr-2 h-4 w-4" />
                                Filter
                            </Button>
                            <Tabs defaultValue="all" className="w-auto">
                                <TabsList className="bg-zinc-900 border-zinc-800">
                                    <TabsTrigger value="all">All</TabsTrigger>
                                    <TabsTrigger value="at_risk">At Risk</TabsTrigger>
                                    <TabsTrigger value="optimized">Optimized</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>
                    </div>
                </CardHeader>

                <Table>
                    <TableHeader className="bg-zinc-900/30">
                        <TableRow className="border-zinc-900 hover:bg-transparent">
                            <TableHead className="text-zinc-500 font-medium">Product</TableHead>
                            <TableHead className="text-zinc-500 font-medium">Status</TableHead>
                            <TableHead className="text-zinc-500 font-medium">Health Score</TableHead>
                            <TableHead className="text-zinc-500 font-medium text-right">Revenue Impact</TableHead>
                            <TableHead className="text-zinc-500 font-medium text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {MOCK_PRODUCTS.map((product) => (
                            <TableRow key={product.id} className="border-zinc-900 hover:bg-zinc-900/40 transition-colors group">
                                <TableCell className="py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-md overflow-hidden border border-zinc-800 bg-zinc-900">
                                            <img src={product.image} alt={product.title} className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-zinc-200">{product.title}</span>
                                            <span className="text-xs text-zinc-500">Updated {product.lastUpdated}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <StatusBadge status={product.status} />
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-sm font-semibold ${product.healthScore > 80 ? 'text-green-500' :
                                            product.healthScore > 50 ? 'text-yellow-500' : 'text-red-500'
                                            }`}>
                                            {product.healthScore}%
                                        </span>
                                        <Progress
                                            value={product.healthScore}
                                            className="w-16 h-1 bg-zinc-800"
                                            indicatorClassName={product.healthScore > 80 ? 'bg-green-500' :
                                                product.healthScore > 50 ? 'bg-yellow-500' : 'bg-red-500'}
                                        />
                                    </div>
                                </TableCell>
                                <TableCell className="text-right font-mono text-zinc-300">
                                    {product.revenueImpact > 0 ? `-$${product.revenueImpact}` : '—'}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Sheet>
                                        <SheetTrigger asChild>
                                            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                                                <ArrowUpRight className="h-4 w-4" />
                                            </Button>
                                        </SheetTrigger>
                                        <SheetContent className="bg-zinc-950 border-zinc-800 text-zinc-100 sm:max-w-xl">
                                            <SheetHeader className="space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <StatusBadge status={product.status} />
                                                    <Badge variant="outline" className="text-zinc-500 border-zinc-800">ID: {product.id}</Badge>
                                                </div>
                                                <SheetTitle className="text-2xl font-bold text-white">{product.title}</SheetTitle>
                                                <SheetDescription className="text-zinc-400">
                                                    AI-driven analysis and optimization for this listing.
                                                </SheetDescription>
                                            </SheetHeader>

                                            <div className="mt-8 space-y-6">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800">
                                                        <span className="text-xs text-zinc-500 block mb-1 uppercase tracking-wider">Current Health</span>
                                                        <span className="text-2xl font-bold text-red-500">{product.healthScore}%</span>
                                                    </div>
                                                    <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800">
                                                        <span className="text-xs text-zinc-500 block mb-1 uppercase tracking-wider">Est. Monthly Loss</span>
                                                        <span className="text-2xl font-bold text-white">${product.revenueImpact}</span>
                                                    </div>
                                                </div>

                                                <Tabs defaultValue="analysis" className="w-full">
                                                    <TabsList className="w-full bg-zinc-900 border-zinc-800">
                                                        <TabsTrigger value="analysis" className="flex-1">AI Analysis</TabsTrigger>
                                                        <TabsTrigger value="optimization" className="flex-1">Optimization</TabsTrigger>
                                                    </TabsList>
                                                    <TabsContent value="analysis" className="mt-4 space-y-4">
                                                        <div className="space-y-2">
                                                            <h4 className="text-sm font-medium text-zinc-300">Critical Issues Found:</h4>
                                                            <ul className="space-y-2">
                                                                <li className="text-sm text-zinc-400 flex items-start gap-2">
                                                                    <div className="h-1.5 w-1.5 rounded-full bg-red-500 mt-1.5" />
                                                                    Product description is too short (under 100 chars).
                                                                </li>
                                                                <li className="text-sm text-zinc-400 flex items-start gap-2">
                                                                    <div className="h-1.5 w-1.5 rounded-full bg-red-500 mt-1.5" />
                                                                    Missing high-intent keywords: "luxury", "handmade", "durable".
                                                                </li>
                                                                <li className="text-sm text-zinc-400 flex items-start gap-2">
                                                                    <div className="h-1.5 w-1.5 rounded-full bg-yellow-500 mt-1.5" />
                                                                    Image alt-text is missing or generic.
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </TabsContent>
                                                    <TabsContent value="optimization" className="mt-4">
                                                        <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                                                            <p className="text-sm text-blue-400">
                                                                AI is ready to generate a high-converting description and SEO-optimized titles.
                                                            </p>
                                                        </div>
                                                    </TabsContent>
                                                </Tabs>
                                            </div>

                                            <SheetFooter className="absolute bottom-0 left-0 w-full p-6 bg-zinc-950 border-t border-zinc-900">
                                                <div className="flex gap-3 w-full">
                                                    <Button variant="outline" className="flex-1 bg-zinc-900 border-zinc-800 text-zinc-300">
                                                        Discard
                                                    </Button>
                                                    <Button className="flex-1 bg-white text-black hover:bg-zinc-200">
                                                        Apply AI Fix
                                                    </Button>
                                                </div>
                                            </SheetFooter>
                                        </SheetContent>
                                    </Sheet>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                <div className="px-6 py-4 border-t border-zinc-900 bg-zinc-950/50 flex items-center justify-between">
                    <span className="text-xs text-zinc-500">Showing 3 of 12 products</span>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled className="bg-zinc-900 border-zinc-800 text-zinc-500">Previous</Button>
                        <Button variant="outline" size="sm" className="bg-zinc-900 border-zinc-800 text-zinc-300">Next</Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}