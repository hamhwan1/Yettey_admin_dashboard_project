"use client"

import {
  type DashboardService,
  serviceOptions,
} from "@/lib/dashboard-service-store"
import { cn } from "@/lib/utils"

export default function ServiceSegmentFilter({
  className,
  onChange,
  service,
}: {
  className?: string
  onChange: (service: DashboardService) => void
  service: DashboardService
}) {
  return (
    <div className={className}>
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
        Service
      </p>
      <div className="flex flex-wrap gap-2">
        {serviceOptions.map((item) => (
          <button
            key={item}
            aria-pressed={service === item}
            className={cn(
              "h-9 rounded-lg px-3 text-sm font-semibold transition hover:bg-slate-100 hover:text-slate-950 dark:hover:bg-slate-900 dark:hover:text-slate-50",
              service === item
                ? "bg-violet-600 text-white shadow-sm shadow-violet-600/20 hover:bg-violet-600 hover:text-white"
                : "text-slate-600 dark:text-slate-300"
            )}
            onClick={() => onChange(item)}
            type="button"
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  )
}
