import { cn } from "@/lib/utils"

type StatusBadgeProps = {
  children: string
  tone?: "success" | "danger" | "neutral"
}

export default function StatusBadge({
  children,
  tone = "neutral",
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full px-2.5 text-xs font-semibold",
        tone === "success" && "bg-emerald-50 text-emerald-600",
        tone === "danger" && "bg-rose-50 text-rose-500",
        tone === "neutral" && "bg-slate-100 text-slate-700"
      )}
    >
      {children}
    </span>
  )
}
