import type { ButtonHTMLAttributes, ReactNode } from "react"

import { cn } from "@/lib/utils"

type AdminButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  variant?: "primary" | "secondary" | "ghost"
}

export default function AdminButton({
  children,
  className,
  variant = "secondary",
  ...props
}: AdminButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-all duration-150 active:translate-y-px disabled:pointer-events-none disabled:opacity-50",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-500/15",
        variant === "primary" &&
          "bg-violet-600 text-white shadow-sm shadow-violet-600/20 hover:bg-violet-700 hover:shadow-md hover:shadow-violet-600/25",
        variant === "secondary" &&
          "border border-slate-200 bg-white text-slate-950 shadow-sm hover:border-slate-300 hover:bg-slate-50 hover:shadow-md",
        variant === "ghost" &&
          "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
