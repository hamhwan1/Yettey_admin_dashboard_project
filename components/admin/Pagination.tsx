"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"

export default function Pagination({
  summary,
  compact,
  page = 1,
  totalPages = compact ? 1 : 4,
  onPageChange,
}: {
  summary: string
  compact?: boolean
  page?: number
  totalPages?: number
  onPageChange?: (page: number) => void
}) {
  const pages = Array.from({ length: Math.min(totalPages, 3) }, (_, index) => index + 1)

  return (
    <div className="flex flex-col gap-4 border-t border-slate-100 px-6 py-5 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
      <p>{summary}</p>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <button
            className="flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-40"
            disabled={page <= 1}
            onClick={() => onPageChange?.(Math.max(1, page - 1))}
          >
            <ChevronLeft className="size-4" />
          </button>
          {pages.map((item) => (
            <button
              key={item}
              className={
                item === page
                  ? "flex size-9 items-center justify-center rounded-lg bg-violet-600 text-sm font-semibold text-white shadow-sm shadow-violet-600/20"
                  : "flex size-9 items-center justify-center rounded-lg text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
              }
              onClick={() => onPageChange?.(item)}
            >
              {item}
            </button>
          ))}
          {!compact ? (
            <>
              {totalPages > 3 ? (
                <>
                  <span className="px-1 font-semibold text-slate-500">...</span>
                  <button
                    className="rounded-lg px-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
                    onClick={() => onPageChange?.(totalPages)}
                  >
                    {totalPages}
                  </button>
                </>
              ) : null}
            </>
          ) : null}
          <button
            className="flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-40"
            disabled={page >= totalPages}
            onClick={() => onPageChange?.(Math.min(totalPages, page + 1))}
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        {!compact ? (
          <div className="hidden items-center gap-3 lg:flex">
            <span className="text-slate-600">Per page</span>
            <button className="flex h-11 w-24 items-center justify-between rounded-xl border border-slate-900 bg-white px-4 text-sm font-medium text-slate-950 transition hover:bg-slate-50">
              10
              <ChevronRight className="size-4 rotate-90" />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
