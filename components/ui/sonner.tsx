"use client"

import { Toaster as Sonner, toast } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
    return (
        <Sonner
            theme="dark"
            className="toaster group"
            toastOptions={{
                classNames: {
                    toast:
                        "group toast group-[.toaster]:bg-zinc-900 group-[.toaster]:text-zinc-100 group-[.toaster]:border-zinc-800 group-[.toaster]:shadow-lg",
                    description: "group-[.toast]:text-zinc-400",
                    actionButton:
                        "group-[.toast]:bg-indigo-600 group-[.toast]:text-white",
                    cancelButton:
                        "group-[.toast]:bg-zinc-800 group-[.toast]:text-zinc-400",
                    success: "group-[.toaster]:!bg-emerald-900/50 group-[.toaster]:!border-emerald-700/50",
                    error: "group-[.toaster]:!bg-red-900/50 group-[.toaster]:!border-red-700/50",
                    warning: "group-[.toaster]:!bg-amber-900/50 group-[.toaster]:!border-amber-700/50",
                },
            }}
            {...props}
        />
    )
}

export { Toaster, toast }
