"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export type DashboardPeriod = "7D" | "30D" | "90D" | "1Y" | "Custom"
export type DashboardCompareMode =
  | "previous-period"
  | "same-period-last-month"
  | "same-period-last-year"

export const periodOptions: { label: string; value: DashboardPeriod }[] = [
  { label: "Last 7 Days", value: "7D" },
  { label: "Last 30 Days", value: "30D" },
  { label: "Last 90 Days", value: "90D" },
  { label: "1Y", value: "1Y" },
  { label: "Custom Range", value: "Custom" },
]

export const compareOptions: { label: string; value: DashboardCompareMode }[] = [
  { label: "Compare previous period", value: "previous-period" },
  { label: "Same period last month", value: "same-period-last-month" },
  { label: "Same period last year", value: "same-period-last-year" },
]

const mockToday = new Date("2026-05-26T00:00:00")

type DashboardDateState = {
  period: DashboardPeriod
  compareMode: DashboardCompareMode
  startDate: string
  endDate: string
  setPreset: (period: DashboardPeriod) => void
  setCustomRange: (startDate: string, endDate: string) => void
  setCompareMode: (compareMode: DashboardCompareMode) => void
  resetDateRange: () => void
}

export const useDashboardDateRange = create<DashboardDateState>()(
  persist(
    (set) => ({
      period: "30D",
      compareMode: "previous-period",
      ...getPresetRange("30D"),
      setPreset: (period) =>
        set(() =>
          period === "Custom"
            ? { period }
            : {
                period,
                ...getPresetRange(period),
              }
        ),
      setCustomRange: (startDate, endDate) =>
        set({ period: "Custom", startDate, endDate }),
      setCompareMode: (compareMode) => set({ compareMode }),
      resetDateRange: () => set({ period: "30D", ...getPresetRange("30D") }),
    }),
    {
      name: "yettey-dashboard-date-range",
      partialize: (state) => ({
        period: state.period,
        compareMode: state.compareMode,
        startDate: state.startDate,
        endDate: state.endDate,
      }),
    }
  )
)

export function getPresetRange(period: Exclude<DashboardPeriod, "Custom">) {
  const end = new Date(mockToday)
  const start = new Date(mockToday)

  if (period === "7D") {
    start.setDate(end.getDate() - 6)
  }

  if (period === "30D") {
    start.setDate(end.getDate() - 29)
  }

  if (period === "90D") {
    start.setDate(end.getDate() - 89)
  }

  if (period === "1Y") {
    start.setFullYear(end.getFullYear() - 1)
    start.setDate(start.getDate() + 1)
  }

  return {
    startDate: toInputDate(start),
    endDate: toInputDate(end),
  }
}

export function getPeriodMultiplier(period: DashboardPeriod) {
  if (period === "7D") {
    return 0.28
  }

  if (period === "30D") {
    return 1
  }

  if (period === "90D") {
    return 2.8
  }

  if (period === "1Y") {
    return 10.2
  }

  return 1.5
}

export function getDateRangeLabel(startDate: string, endDate: string) {
  return `${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)}`
}

export function getCompareModeLabel(compareMode: DashboardCompareMode) {
  return compareOptions.find((option) => option.value === compareMode)?.label ?? ""
}

function formatDisplayDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`))
}

function toInputDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}
