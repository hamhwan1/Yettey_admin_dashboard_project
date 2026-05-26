import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"

type StatCardProps = {
  label: string
  value: string
  detail?: string
  insight?: string
  href?: string
  ctaLabel?: string
  interactive?: boolean
}

export default function StatCard({
  label,
  value,
  detail,
  insight,
  href,
  ctaLabel,
  interactive = false,
}: StatCardProps) {
  const isInteractive = Boolean(href || interactive)
  const card = (
    <div
      className={cn(
        "group/card flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_10px_24px_rgba(15,23,42,0.04)] transition-all duration-150",
        isInteractive
          ? "cursor-pointer hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-[0_2px_4px_rgba(15,23,42,0.08),0_16px_32px_rgba(15,23,42,0.08)]"
          : ""
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {isInteractive ? (
          <span className="rounded-full border border-slate-200 bg-slate-50 p-1.5 text-slate-400 transition group-hover/card:border-violet-200 group-hover/card:bg-violet-50 group-hover/card:text-violet-600">
            <ArrowRight className="size-4 transition group-hover/card:translate-x-0.5" />
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
        {value}
      </p>
      {detail ? <p className="mt-2 text-sm text-slate-500">{detail}</p> : null}
      {insight ? (
        <p className="mt-3 text-sm font-medium leading-5 text-slate-700">
          {insight}
        </p>
      ) : null}
      {isInteractive ? (
        <div className="mt-auto pt-5">
          <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-sm font-semibold text-violet-600">
            <span>{ctaLabel ?? "View analytics"}</span>
            <ArrowRight className="size-4 transition group-hover/card:translate-x-1" />
          </div>
        </div>
      ) : null}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="block h-full rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2">
        {card}
      </Link>
    )
  }

  return card
}
