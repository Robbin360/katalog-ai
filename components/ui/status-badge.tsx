import { 
    CircleDashed, 
    Zap, 
    RefreshCcw, 
    Sparkles, 
    CheckCircle2, 
    AlertTriangle, 
    Lock 
} from "lucide-react";

export function StatusBadge({ status }: { status: string }) {
    const baseClasses = "border rounded-full px-2.5 py-0.5 font-mono text-[10px] flex items-center gap-1.5 min-w-[120px] font-semibold";

    switch (status) {
        case 'NEEDS_OPTIMIZATION':
            return (
                <div className={`${baseClasses} bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20`}>
                    <Zap className="h-3 w-3" />
                    <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                    <span>Needs Optimization</span>
                </div>
            );
        case 'PROCESSING':
            return (
                <div className={`${baseClasses} bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-400/10 dark:text-cyan-400 dark:border-cyan-400/20`}>
                    <RefreshCcw className="h-3 w-3 animate-spin" />
                    <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                    <span>AI Processing</span>
                </div>
            );
        case 'READY_TO_PUBLISH':
            return (
                <div className={`${baseClasses} bg-indigo-100 text-indigo-700 border-indigo-200 shadow-sm dark:bg-indigo-500/15 dark:text-indigo-400 dark:border-indigo-500/30 dark:shadow-[0_0_10px_rgba(99,102,241,0.2)]`}>
                    <Sparkles className="h-3 w-3" />
                    <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                    <span>Ready to Publish</span>
                </div>
            );
        case 'OPTIMIZED':
            return (
                <div className={`${baseClasses} bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20`}>
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Optimized</span>
                </div>
            );
        case 'ERROR':
            return (
                <div className={`${baseClasses} bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20`}>
                    <AlertTriangle className="h-3 w-3" />
                    <span>Error</span>
                </div>
            );
        case 'OUT_OF_CREDITS':
            return (
                <div className={`${baseClasses} bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200 dark:bg-fuchsia-500/10 dark:text-fuchsia-400 dark:border-fuchsia-500/20`}>
                    <Lock className="h-3 w-3" />
                    <span>Upgrade Plan</span>
                </div>
            );
        case 'PENDING_AUDIT':
        default:
            return (
                <div className={`${baseClasses} bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20`}>
                    <CircleDashed className="h-3 w-3" />
                    <span>Pending Audit</span>
                </div>
            );
    }
}
