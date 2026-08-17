export function StatusBadge({ status }: { status: string }) {
    // Base classes: Pure text, no icons, larger font size (text-xs)
    const baseClasses = "relative border rounded-full px-3 py-0.5 text-xs font-sans font-medium flex items-center w-fit transition-all duration-300";

    // Estados: deben coincidir con el CHECK valid_audit_status en
    // shopify_products. Si agregas uno alla, agregalo aqui: el default
    // muestra "Pending Audit", que es falso para cualquier estado no
    // contemplado y hace creer al usuario que el producto esta en cola.
    switch (status) {
        case 'NEEDS_OPTIMIZATION':
            return (
                <div className={`${baseClasses} bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30 dark:shadow-[0_0_10px_rgba(245,158,11,0.05)]`}>
                    Needs Optimization
                </div>
            );
        case 'PROCESSING':
            return (
                <div className={`${baseClasses} bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/30 dark:shadow-[0_0_10px_rgba(6,182,212,0.05)]`}>
                    AI Processing
                </div>
            );
        case 'READY_TO_PUBLISH':
            return (
                <div className={`${baseClasses} bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/40 dark:shadow-[0_0_15px_rgba(99,102,241,0.15)]`}>
                    Ready to Publish
                </div>
            );
        case 'OPTIMIZED':
            return (
                <div className={`${baseClasses} bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30 dark:shadow-[0_0_10px_rgba(16,185,129,0.05)]`}>
                    Optimized
                </div>
            );
        case 'ERROR':
            return (
                <div className={`${baseClasses} bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30 dark:shadow-[0_0_10px_rgba(244,63,94,0.05)]`}>
                    Error
                </div>
            );
        case 'OUT_OF_CREDITS':
            return (
                <div className={`${baseClasses} bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200 dark:bg-fuchsia-500/10 dark:text-fuchsia-400 dark:border-fuchsia-500/30 dark:shadow-[0_0_10px_rgba(217,70,239,0.05)]`}>
                    Upgrade Plan
                </div>
            );
        case 'NEEDS_REVIEW':
            return (
                <div className={`${baseClasses} bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40 dark:shadow-[0_0_10px_rgba(245,158,11,0.1)]`}>
                    Needs Review
                </div>
            );
        case 'STABLE_PERFORMING':
            return (
                <div className={`${baseClasses} bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/30 dark:shadow-[0_0_10px_rgba(20,184,166,0.05)]`}>
                    Stable
                </div>
            );
        case 'BENCHMARK':
            return (
                <div className={`${baseClasses} bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/30 dark:shadow-[0_0_10px_rgba(139,92,246,0.05)]`}>
                    Benchmark
                </div>
            );
        case 'MONITORING':
            return (
                <div className={`${baseClasses} bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/30 dark:shadow-[0_0_10px_rgba(14,165,233,0.05)]`}>
                    Monitoring
                </div>
            );
        case 'INVESTIGATE_CAUSE':
            return (
                <div className={`${baseClasses} bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/30 dark:shadow-[0_0_10px_rgba(249,115,22,0.05)]`}>
                    Investigating
                </div>
            );
        case 'PENDING_AUDIT':
        default:
            return (
                <div className={`${baseClasses} bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:border-slate-500/30`}>
                    Pending Audit
                </div>
            );
    }
}
