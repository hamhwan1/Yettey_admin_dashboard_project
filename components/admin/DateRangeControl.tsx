"use client"

import { CalendarDays } from "lucide-react"

import {
  compareOptions,
  getCompareModeLabel,
  getDateRangeLabel,
  periodOptions,
  useDashboardDateRange,
} from "@/lib/dashboard-date-store"
import { cn } from "@/lib/utils"

export default function DateRangeControl({
  compact = false,
}: {
  compact?: boolean
}) {
  const {
    period,
    compareMode,
    startDate,
    endDate,
    setPreset,
    setCustomRange,
    setCompareMode,
  } = useDashboardDateRange()

  if (compact) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 xl:grid-cols-[1fr_1.2fr]">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
              Period
            </p>
            <div className="flex flex-wrap gap-2">
              {periodOptions.map((option) => (
                <button
                  key={option.value}
                  className={filterClass(period === option.value)}
                  onClick={() => setPreset(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
              Compare
            </p>
            <div className="flex flex-wrap gap-2">
              {compareOptions.map((option) => (
                <button
                  key={option.value}
                  className={filterClass(compareMode === option.value)}
                  onClick={() => setCompareMode(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {period === "Custom" ? (
          <div className="grid gap-2 sm:grid-cols-2">
            <DateInput
              label="Start date"
              value={startDate}
              onChange={(value) => setCustomRange(value, endDate)}
            />
            <DateInput
              label="End date"
              value={endDate}
              onChange={(value) => setCustomRange(startDate, value)}
            />
          </div>
        ) : null}

        <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
          <CalendarDays className="size-4 text-violet-600" />
          <span>{getDateRangeLabel(startDate, endDate)}</span>
          <span className="text-slate-400">/</span>
          <span>{getCompareModeLabel(compareMode)}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr_1fr]">
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
          Period
        </p>
        <div className="flex flex-wrap gap-2">
          {periodOptions.map((option) => (
            <button
              key={option.value}
              className={filterClass(period === option.value)}
              onClick={() => setPreset(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
          Date Range
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          <DateInput
            label="Start date"
            value={startDate}
            onChange={(value) => setCustomRange(value, endDate)}
          />
          <DateInput
            label="End date"
            value={endDate}
            onChange={(value) => setCustomRange(startDate, value)}
          />
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
          Compare
        </p>
        <div className="flex flex-wrap gap-2">
          {compareOptions.map((option) => (
            <button
              key={option.value}
              className={filterClass(compareMode === option.value)}
              onClick={() => setCompareMode(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="xl:col-span-3">
        <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
          <CalendarDays className="size-4 text-violet-600" />
          <span>{getDateRangeLabel(startDate, endDate)}</span>
          <span className="text-slate-400">/</span>
          <span>{getCompareModeLabel(compareMode)}</span>
        </div>
      </div>
    </div>
  )
}

function DateInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 focus:border-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-500/10"
      />
    </label>
  )
}

function filterClass(active: boolean) {
  return cn(
    "h-9 rounded-lg px-3 text-sm font-semibold transition hover:bg-slate-100 hover:text-slate-950",
    active
      ? "bg-violet-600 text-white shadow-sm shadow-violet-600/20 hover:bg-violet-600 hover:text-white"
      : "text-slate-600"
  )
}
