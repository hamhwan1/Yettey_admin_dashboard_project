import type { ReactNode } from "react"
import { Calendar, Search } from "lucide-react"

type FilterBarProps = {
  searchPlaceholder?: string
  children?: ReactNode
}

export function FilterBar({ searchPlaceholder, children }: FilterBarProps) {
  return (
    <section className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 p-6">
        <label className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
          <input
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-950 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
            placeholder={searchPlaceholder ?? "Search..."}
          />
        </label>
        <button className="shrink-0 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-950">
          Reset All
        </button>
      </div>

      {children ? (
        <div className="grid gap-6 p-6 md:grid-cols-2 xl:grid-cols-5">
          {children}
        </div>
      ) : null}
    </section>
  )
}

export function FilterField({
  label,
  value,
  calendar,
}: {
  label: string
  value: string
  calendar?: boolean
}) {
  return (
    <label>
      <span className="block text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <button className="mt-2 flex h-11 w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 text-left text-sm text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-500/10">
        {calendar ? <Calendar className="size-4 text-slate-400" /> : null}
        <span className="truncate">{value}</span>
      </button>
    </label>
  )
}
