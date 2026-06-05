"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import type { KpiPeriodType, KpiService } from "./kpi-data"

type KpiTrendPoint = {
  cac: number
  ltv: number
  ltvCac: number
  period: string
  signupActivation: number
  visitorPaid: number
  visitorSignup: number
}

const trendRows: Record<KpiPeriodType, KpiTrendPoint[]> = {
  Monthly: [
    { cac: 102000, ltv: 1960000, ltvCac: 1.92, period: "Jan", signupActivation: 42, visitorPaid: 0.8, visitorSignup: 4.2 },
    { cac: 96000, ltv: 2140000, ltvCac: 2.23, period: "Feb", signupActivation: 44, visitorPaid: 0.9, visitorSignup: 4.6 },
    { cac: 89000, ltv: 2290000, ltvCac: 2.57, period: "Mar", signupActivation: 47, visitorPaid: 1.0, visitorSignup: 4.9 },
    { cac: 81000, ltv: 2410000, ltvCac: 2.98, period: "Apr", signupActivation: 49, visitorPaid: 1.1, visitorSignup: 5.1 },
    { cac: 79000, ltv: 2570000, ltvCac: 3.25, period: "May", signupActivation: 51, visitorPaid: 1.2, visitorSignup: 5.4 },
    { cac: 76000, ltv: 2720000, ltvCac: 3.58, period: "Jun", signupActivation: 54, visitorPaid: 1.4, visitorSignup: 5.7 },
    { cac: 72000, ltv: 2860000, ltvCac: 3.97, period: "Jul", signupActivation: 56, visitorPaid: 1.5, visitorSignup: 5.9 },
    { cac: 68000, ltv: 3040000, ltvCac: 4.47, period: "Aug", signupActivation: 58, visitorPaid: 1.7, visitorSignup: 6.1 },
    { cac: 70000, ltv: 3120000, ltvCac: 4.46, period: "Sep", signupActivation: 59, visitorPaid: 1.8, visitorSignup: 6.4 },
    { cac: 65000, ltv: 3260000, ltvCac: 5.02, period: "Oct", signupActivation: 60, visitorPaid: 2.0, visitorSignup: 6.3 },
    { cac: 69000, ltv: 3310000, ltvCac: 4.80, period: "Nov", signupActivation: 62, visitorPaid: 2.1, visitorSignup: 6.6 },
    { cac: 67000, ltv: 3370000, ltvCac: 5.03, period: "Dec", signupActivation: 64, visitorPaid: 2.3, visitorSignup: 6.8 },
  ],
  Quarterly: [
    { cac: 95600, ltv: 2130000, ltvCac: 2.23, period: "Q1", signupActivation: 44, visitorPaid: 0.9, visitorSignup: 4.6 },
    { cac: 78600, ltv: 2560000, ltvCac: 3.26, period: "Q2", signupActivation: 51, visitorPaid: 1.2, visitorSignup: 5.4 },
    { cac: 70000, ltv: 3010000, ltvCac: 4.30, period: "Q3", signupActivation: 58, visitorPaid: 1.7, visitorSignup: 6.1 },
    { cac: 67000, ltv: 3310000, ltvCac: 4.94, period: "Q4", signupActivation: 62, visitorPaid: 2.1, visitorSignup: 6.6 },
  ],
  Yearly: [
    { cac: 148000, ltv: 1180000, ltvCac: 1.72, period: "2023", signupActivation: 31, visitorPaid: 0.4, visitorSignup: 3.1 },
    { cac: 126000, ltv: 1640000, ltvCac: 2.28, period: "2024", signupActivation: 38, visitorPaid: 0.7, visitorSignup: 4.0 },
    { cac: 91000, ltv: 2520000, ltvCac: 3.42, period: "2025", signupActivation: 49, visitorPaid: 1.3, visitorSignup: 5.2 },
    { cac: 67000, ltv: 3370000, ltvCac: 5.03, period: "2026", signupActivation: 64, visitorPaid: 2.3, visitorSignup: 6.8 },
  ],
}

const serviceAdjustments: Record<
  KpiService,
  {
    cac: number
    ltv: number
    ltvCac: number
    signupActivation: number
    visitorPaid: number
    visitorSignup: number
  }
> = {
  Overall: {
    cac: 1,
    ltv: 1,
    ltvCac: 1,
    signupActivation: 1,
    visitorPaid: 1,
    visitorSignup: 1,
  },
  Yettey: {
    cac: 0.92,
    ltv: 1.03,
    ltvCac: 1.12,
    signupActivation: 1.12,
    visitorPaid: 0.94,
    visitorSignup: 1.08,
  },
  VPICK: {
    cac: 1.08,
    ltv: 1.16,
    ltvCac: 1.07,
    signupActivation: 0.96,
    visitorPaid: 1.18,
    visitorSignup: 0.94,
  },
}

const conversionLegend = [
  { color: "#3b82f6", label: "Visitor to Signup" },
  { color: "#ef4444", label: "Signup to Activation" },
  { color: "#f59e0b", label: "Visitor to Paid" },
]

export default function KpiTrendCharts({
  period,
  service,
}: {
  period: KpiPeriodType
  service: KpiService
}) {
  const [isMounted, setIsMounted] = useState(false)
  const rows = useMemo(() => buildTrendRows(service, period), [period, service])

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsMounted(true))

    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <section className="mb-8">
      <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-950">
            KPI Trend Charts
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Track whether core KPI signals are improving or declining over time.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <KpiChartCard
          description={`${period} trend view across acquisition and activation conversion signals.`}
          isMounted={isMounted}
          legend={conversionLegend}
          title="Conversion Rate Trend"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rows} margin={{ left: 0, right: 0, top: 8 }}>
              <CartesianGrid stroke="#eef2f7" vertical={false} />
              <XAxis dataKey="period" tickLine={false} axisLine={false} />
              <YAxis
                yAxisId="conversion"
                tickFormatter={formatPercentTick}
                tickLine={false}
                axisLine={false}
                width={48}
              />
              <YAxis
                yAxisId="activation"
                orientation="right"
                tickFormatter={formatPercentTick}
                tickLine={false}
                axisLine={false}
                width={48}
              />
              <Tooltip formatter={formatConversionTooltip} />
              <Line
                dataKey="visitorSignup"
                dot={{ r: 3 }}
                name="Visitor to Signup"
                stroke="#3b82f6"
                strokeWidth={2.4}
                type="monotone"
                yAxisId="conversion"
              />
              <Line
                dataKey="signupActivation"
                dot={{ r: 3 }}
                name="Signup to Activation"
                stroke="#ef4444"
                strokeWidth={2.4}
                type="monotone"
                yAxisId="activation"
              />
              <Line
                dataKey="visitorPaid"
                dot={{ r: 3 }}
                name="Visitor to Paid"
                stroke="#f59e0b"
                strokeWidth={2.4}
                type="monotone"
                yAxisId="conversion"
              />
            </LineChart>
          </ResponsiveContainer>
        </KpiChartCard>

        <KpiChartCard
          description={`${period} paid acquisition efficiency for ${service}.`}
          isMounted={isMounted}
          legend={[{ color: "#3b82f6", label: "CAC" }]}
          title="Paid Customer CAC"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rows} margin={{ left: 0, right: 8, top: 8 }}>
              <CartesianGrid stroke="#eef2f7" vertical={false} />
              <XAxis dataKey="period" tickLine={false} axisLine={false} />
              <YAxis
                tickFormatter={formatCurrencyTick}
                tickLine={false}
                axisLine={false}
                width={82}
              />
              <Tooltip formatter={formatCurrencyTooltip} />
              <Line
                dataKey="cac"
                dot={{ r: 3 }}
                name="CAC"
                stroke="#3b82f6"
                strokeWidth={2.4}
                type="monotone"
              />
            </LineChart>
          </ResponsiveContainer>
        </KpiChartCard>

        <KpiChartCard
          description={`${period} lifetime value movement for retained paid customers.`}
          isMounted={isMounted}
          legend={[{ color: "#3b82f6", label: "LTV" }]}
          title="Lifetime Value (LTV)"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rows} margin={{ left: 0, right: 8, top: 8 }}>
              <CartesianGrid stroke="#eef2f7" vertical={false} />
              <XAxis dataKey="period" tickLine={false} axisLine={false} />
              <YAxis
                tickFormatter={formatCurrencyTick}
                tickLine={false}
                axisLine={false}
                width={88}
              />
              <Tooltip formatter={formatCurrencyTooltip} />
              <Line
                dataKey="ltv"
                dot={{ r: 3 }}
                name="LTV"
                stroke="#3b82f6"
                strokeWidth={2.4}
                type="monotone"
              />
            </LineChart>
          </ResponsiveContainer>
        </KpiChartCard>

        <KpiChartCard
          description={`${period} LTV to CAC ratio as a business health trend.`}
          isMounted={isMounted}
          legend={[{ color: "#3b82f6", label: "LTV / CAC" }]}
          title="LTV / CAC Ratio"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rows} margin={{ left: 0, right: 8, top: 8 }}>
              <CartesianGrid stroke="#eef2f7" vertical={false} />
              <XAxis dataKey="period" tickLine={false} axisLine={false} />
              <YAxis
                tickFormatter={formatRatioTick}
                tickLine={false}
                axisLine={false}
                width={48}
              />
              <Tooltip formatter={formatRatioTooltip} />
              <Line
                dataKey="ltvCac"
                dot={{ r: 3 }}
                name="LTV / CAC"
                stroke="#3b82f6"
                strokeWidth={2.4}
                type="monotone"
              />
            </LineChart>
          </ResponsiveContainer>
        </KpiChartCard>
      </div>
    </section>
  )
}

function KpiChartCard({
  children,
  description,
  isMounted,
  legend,
  title,
}: {
  children: ReactNode
  description: string
  isMounted: boolean
  legend: Array<{ color: string; label: string }>
  title: string
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        <ChartLegend items={legend} />
      </div>
      <div className="h-80">
        {isMounted ? children : <div className="h-full rounded-xl bg-slate-100" />}
      </div>
    </section>
  )
}

function ChartLegend({
  items,
}: {
  items: Array<{ color: string; label: string }>
}) {
  return (
    <div className="flex shrink-0 flex-wrap items-center gap-3">
      {items.map((item) => (
        <span
          key={item.label}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500"
        >
          <span
            className="size-2.5 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          {item.label}
        </span>
      ))}
    </div>
  )
}

function buildTrendRows(service: KpiService, period: KpiPeriodType) {
  const adjustment = serviceAdjustments[service]

  return trendRows[period].map((row) => ({
    ...row,
    cac: Math.round(row.cac * adjustment.cac),
    ltv: Math.round(row.ltv * adjustment.ltv),
    ltvCac: round(row.ltvCac * adjustment.ltvCac, 2),
    signupActivation: round(row.signupActivation * adjustment.signupActivation, 1),
    visitorPaid: round(row.visitorPaid * adjustment.visitorPaid, 1),
    visitorSignup: round(row.visitorSignup * adjustment.visitorSignup, 1),
  }))
}

function round(value: number, precision: number) {
  const multiplier = 10 ** precision

  return Math.round(value * multiplier) / multiplier
}

function getNumericValue(value: unknown) {
  const numericValue = Number(value)

  return Number.isFinite(numericValue) ? numericValue : 0
}

function formatPercentTick(value: unknown) {
  return `${getNumericValue(value)}%`
}

function formatCurrencyTick(value: unknown) {
  return `\u20a9${getNumericValue(value).toLocaleString("ko-KR")}`
}

function formatRatioTick(value: unknown) {
  return `${getNumericValue(value).toFixed(1)}x`
}

function formatConversionTooltip(value: unknown) {
  return `${getNumericValue(value).toFixed(1)}%`
}

function formatCurrencyTooltip(value: unknown) {
  return `\u20a9${getNumericValue(value).toLocaleString("ko-KR")}`
}

function formatRatioTooltip(value: unknown) {
  return `${getNumericValue(value).toFixed(2)}x`
}
