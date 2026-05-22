"use client"

import type { ReactNode } from "react"
import { ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import Pagination from "./Pagination"

export type DataTableColumn<T> = {
  key: string
  header: string
  className?: string
  render: (row: T) => ReactNode
}

type DataTableProps<T> = {
  columns: DataTableColumn<T>[]
  data: T[]
  summary: string
  compactPagination?: boolean
  page?: number
  totalPages?: number
  onPageChange?: (page: number) => void
  onRowClick?: (row: T) => void
}

export default function DataTable<T>({
  columns,
  data,
  summary,
  compactPagination,
  page,
  totalPages,
  onPageChange,
  onRowClick,
}: DataTableProps<T>) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[880px] border-separate border-spacing-0">
          <thead>
            <tr className="bg-white">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "border-b border-slate-100 px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500",
                    column.className
                  )}
                >
                  {column.header}
                </th>
              ))}
              <th className="w-12 border-b border-slate-100 px-4 py-4" />
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr
                key={index}
                className="group cursor-pointer transition-colors hover:bg-slate-50"
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      "border-b border-slate-100 px-6 py-5 text-sm text-slate-900",
                      column.className
                    )}
                  >
                    {column.render(row)}
                  </td>
                ))}
                <td className="border-b border-slate-100 px-4 py-5">
                  <ChevronRight className="size-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-700" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        summary={summary}
        compact={compactPagination}
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </section>
  )
}
