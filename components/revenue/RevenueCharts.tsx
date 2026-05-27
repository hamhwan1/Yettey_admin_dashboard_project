"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { BarChart3, CreditCard, RefreshCcw, TrendingUp } from "lucide-react"

import StatusBadge from "@/components/admin/StatusBadge"
import { metricValueTypography } from "@/lib/metric-typography"
import { cn } from "@/lib/utils"
import { formatCurrency, formatNumber } from "./revenue-data"

type RevenueTab = "revenue" | "paidUsers" | "churn" | "conversion"

type DailyTrendRow = {
  date: string
  grossRevenue: number
  refunds: number
  netRevenue: number
  previousNetRevenue?: number
}

type PlanBreakdownRow = {
  plan: string
  revenue: number
  activePaidUsers: number
}

type SubscriberTrendRow = {
  date: string
  activePaidUsers: number
  previousActivePaidUsers?: number
  newPaidUsers: number
  cancelledSubscribers: number
}

type RevenueSummary = {
  totalRevenue: number
  newPaidUsers: number
  activePaidUsers: number
  cancelledSubscribers: number
  churnRate: number
  netPaidUsers: number
  arpu: number
  failedPayments: number
}

type RevenueChartsProps = {
  dailyTrend: DailyTrendRow[]
  planBreakdown: PlanBreakdownRow[]
  subscriberTrend: SubscriberTrendRow[]
  summary: RevenueSummary
}

const tabs: {
  id: RevenueTab
  label: string
  icon: typeof BarChart3
}[] = [
  { id: "revenue", label: "Revenue", icon: TrendingUp },
  { id: "paidUsers", label: "Paid Users", icon: CreditCard },
  { id: "churn", label: "Churn", icon: RefreshCcw },
  { id: "conversion", label: "Conversion", icon: BarChart3 },
]

const planColors = ["#7c3aed", "#2563eb", "#10b981", "#f59e0b", "#94a3b8"]
const priorityPlans = ["Starter", "Growth", "Pro"]

export default function RevenueCharts({
  dailyTrend,
  planBreakdown,
  subscriberTrend,
  summary,
}: RevenueChartsProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<RevenueTab>("revenue")
  const [cadence, setCadence] = useState("Daily")

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsMounted(true))

    return () => cancelAnimationFrame(frame)
  }, [])

  const planRows = useMemo(() => normalizePlanRows(planBreakdown), [planBreakdown])
  const chartDailyTrend = useMemo(
    () => aggregateTrendRows(dailyTrend, cadence, [
      "grossRevenue",
      "refunds",
      "netRevenue",
      "previousNetRevenue",
    ]),
    [cadence, dailyTrend]
  )
  const chartSubscriberTrend = useMemo(
    () =>
      aggregateTrendRows(subscriberTrend, cadence, [
        "activePaidUsers",
        "previousActivePaidUsers",
        "newPaidUsers",
        "cancelledSubscribers",
      ]),
    [cadence, subscriberTrend]
  )
  const tabConfig = useMemo(
    () =>
      buildRevenueTabConfig(
        activeTab,
        chartDailyTrend,
        chartSubscriberTrend,
        summary
      ),
    [activeTab, chartDailyTrend, chartSubscriberTrend, summary]
  )

  if (!isMounted) {
    return (
      <div className="space-y-6">
        <ChartSkeleton title="Revenue Intelligence" />
        <div className="grid gap-6 xl:grid-cols-2">
          <ChartSkeleton title="Revenue by Plan" />
          <ChartSkeleton title="Plan Performance Trend" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06),0_16px_40px_rgba(15,23,42,0.06)]">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-950">
              Revenue Intelligence
            </h2>
          </div>
          <div className="inline-flex w-fit rounded-xl border border-slate-200 bg-slate-50 p-1">
            {["Daily", "Weekly", "Monthly"].map((item) => (
              <button
                key={item}
                className={cn(
                  "h-9 rounded-lg px-4 text-sm font-semibold transition",
                  cadence === item
                    ? "bg-violet-600 text-white shadow-sm shadow-violet-600/20"
                    : "text-slate-600 hover:bg-white"
                )}
                onClick={() => setCadence(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="border-b border-slate-100 px-6 pt-5">
          <div className="inline-flex max-w-full overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon

              return (
                <button
                  key={tab.id}
                  className={cn(
                    "inline-flex h-10 min-w-32 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition",
                    activeTab === tab.id
                      ? "bg-violet-600 text-white shadow-sm shadow-violet-600/20"
                      : "text-slate-600 hover:bg-white hover:text-slate-950"
                  )}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon className="size-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="grid gap-0 xl:grid-cols-[260px_1fr]">
          <div className="border-b border-slate-100 bg-slate-50/60 p-6 xl:border-b-0 xl:border-r">
            <p className="text-sm font-semibold text-slate-600">
              {tabConfig.kicker}
            </p>
            <p className={cn("mt-3 text-slate-950", metricValueTypography(tabConfig.value))}>
              {tabConfig.value}
            </p>
            <StatusBadge tone={tabConfig.tone}>{tabConfig.delta}</StatusBadge>
            <div className="mt-6 space-y-4">
              {tabConfig.details.map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-4">
                  <span className="text-sm font-medium text-slate-500">
                    {item.label}
                  </span>
                  <span className="text-sm font-bold text-slate-950">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6">
            <div className="h-[360px]" key={`${activeTab}-${cadence}`}>
              {tabConfig.chart}
            </div>
          </div>
        </div>

        <div className="grid divide-y divide-slate-100 border-t border-slate-100 bg-violet-50/35 md:grid-cols-4 md:divide-x md:divide-y-0">
          {tabConfig.footer.map((item) => (
            <div key={item.label} className="p-5 text-center">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                {item.label}
              </p>
              <p className="mt-2 text-lg font-bold text-slate-950">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
          <h2 className="text-xl font-semibold tracking-tight text-slate-950">
            Revenue by Plan
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-[220px_1fr]">
            <div className="relative h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={planRows}
                    dataKey="revenue"
                    innerRadius={76}
                    outerRadius={104}
                    paddingAngle={3}
                  >
                    {planRows.map((plan, index) => (
                      <Cell key={plan.plan} fill={planColors[index % planColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-slate-950">
                  {formatCurrency(summary.totalRevenue)}
                </span>
                <span className="text-xs font-bold text-slate-500">
                  Total Revenue
                </span>
              </div>
            </div>

            <div className="space-y-4 self-center">
              {planRows.map((plan, index) => {
                const share = (plan.revenue / Math.max(summary.totalRevenue, 1)) * 100

                return (
                  <div key={plan.plan}>
                    <div className="mb-2 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <span
                          className="size-2.5 rounded-full"
                          style={{ backgroundColor: planColors[index % planColors.length] }}
                        />
                        <span className="font-semibold text-slate-800">
                          {plan.plan}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-slate-950">
                        {formatCurrency(plan.revenue)} ({share.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${share}%`,
                          backgroundColor: planColors[index % planColors.length],
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
          <h2 className="text-xl font-semibold tracking-tight text-slate-950">
            Plan Performance Trend
          </h2>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={buildPlanTrend(planRows, chartDailyTrend)}>
                <CartesianGrid stroke="#eef2f7" vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={72} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                {planRows.map((plan, index) => (
                  <Line
                    key={plan.plan}
                    dataKey={plan.plan}
                    name={plan.plan}
                    stroke={planColors[index % planColors.length]}
                    strokeWidth={2.5}
                    type="monotone"
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </div>
  )
}

function buildRevenueTabConfig(
  activeTab: RevenueTab,
  dailyTrend: DailyTrendRow[],
  subscriberTrend: SubscriberTrendRow[],
  summary: RevenueSummary
) {
  const latest = dailyTrend.at(-1)
  const highestDay = maxBy(dailyTrend, (row) => row.netRevenue)
  const lowestDay = minBy(dailyTrend, (row) => row.netRevenue)
  const averageDailyRevenue =
    summary.totalRevenue / Math.max(dailyTrend.length, 1)
  const netPaidGrowth = summary.newPaidUsers - summary.cancelledSubscribers
  const paidConversionRate =
    (summary.newPaidUsers /
      Math.max(summary.newPaidUsers + summary.cancelledSubscribers, 1)) *
    100

  if (activeTab === "paidUsers") {
    return {
      kicker: "Active Paid Users",
      value: formatNumber(summary.activePaidUsers),
      delta: "+6.2%",
      tone: "success" as const,
      details: [
        { label: "New Paid", value: formatNumber(summary.newPaidUsers) },
        { label: "Net Growth", value: formatNumber(netPaidGrowth) },
        { label: "Cancelled", value: formatNumber(summary.cancelledSubscribers) },
      ],
      chart: (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={subscriberTrend}>
            <CartesianGrid stroke="#eef2f7" vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} width={72} />
            <Tooltip />
            <Line dataKey="activePaidUsers" name="Active Paid Users" stroke="#7c3aed" strokeWidth={3} type="monotone" />
            <Line dataKey="previousActivePaidUsers" name="Previous Active Paid" stroke="#a78bfa" strokeDasharray="5 5" strokeWidth={2} dot={false} type="monotone" />
            <Line dataKey="newPaidUsers" name="New Paid Users" stroke="#2563eb" strokeWidth={2.5} />
          </LineChart>
        </ResponsiveContainer>
      ),
      footer: [
        { label: "New Paid Users", value: formatNumber(summary.newPaidUsers) },
        { label: "Net Paid Growth", value: formatNumber(netPaidGrowth) },
        { label: "Average New Paid / Day", value: formatNumber(Math.round(summary.newPaidUsers / Math.max(subscriberTrend.length, 1))) },
        { label: "Latest Active Paid", value: formatNumber(subscriberTrend.at(-1)?.activePaidUsers ?? 0) },
      ],
    }
  }

  if (activeTab === "churn") {
    return {
      kicker: "Churn Rate",
      value: `${summary.churnRate.toFixed(1)}%`,
      delta: "-1.2pp",
      tone: "danger" as const,
      details: [
        { label: "Churn Users", value: formatNumber(summary.cancelledSubscribers) },
        { label: "Failed Payments", value: formatNumber(summary.failedPayments) },
        { label: "Active Paid Users", value: formatNumber(summary.activePaidUsers) },
      ],
      chart: (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={subscriberTrend}>
            <CartesianGrid stroke="#eef2f7" vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} width={72} />
            <Tooltip />
            <Bar dataKey="cancelledSubscribers" name="Churn Users" fill="#ef4444" radius={[8, 8, 0, 0]} isAnimationActive />
          </BarChart>
        </ResponsiveContainer>
      ),
      footer: [
        { label: "Churn Users", value: formatNumber(summary.cancelledSubscribers) },
        { label: "Churn Rate", value: `${summary.churnRate.toFixed(1)}%` },
        { label: "Payment Failures", value: formatNumber(summary.failedPayments) },
        { label: "Recovery Priority", value: "High" },
      ],
    }
  }

  if (activeTab === "conversion") {
    return {
      kicker: "Paid Conversion",
      value: `${paidConversionRate.toFixed(1)}%`,
      delta: "+3.7%",
      tone: "success" as const,
      details: [
        { label: "New Paid Users", value: formatNumber(summary.newPaidUsers) },
        { label: "Churn Users", value: formatNumber(summary.cancelledSubscribers) },
        { label: "Net Paid Growth", value: formatNumber(netPaidGrowth) },
      ],
      chart: (
        <div className="grid h-full items-center gap-6 md:grid-cols-[0.82fr_1.18fr]">
          <div className="space-y-4">
            {[
              { label: "New Paid Users", value: summary.newPaidUsers, rate: "100%" },
              { label: "Net Paid Growth", value: netPaidGrowth, rate: `${Math.max((netPaidGrowth / Math.max(summary.newPaidUsers, 1)) * 100, 0).toFixed(1)}%` },
              { label: "Retained Paid Base", value: summary.activePaidUsers, rate: "Active" },
            ].map((row) => (
              <div key={row.label} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      {row.label}
                    </p>
                    <p className="mt-1 text-xl font-bold text-slate-950">
                      {formatNumber(row.value)}
                    </p>
                  </div>
                  <StatusBadge tone="neutral">{row.rate}</StatusBadge>
                </div>
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={subscriberTrend}>
              <CartesianGrid stroke="#eef2f7" vertical={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} width={72} />
              <Tooltip />
              <Line dataKey="newPaidUsers" name="New Paid Users" stroke="#10b981" strokeWidth={3} />
              <Line dataKey="cancelledSubscribers" name="Churn Users" stroke="#ef4444" strokeWidth={2.5} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ),
      footer: [
        { label: "Paid Conversion", value: `${paidConversionRate.toFixed(1)}%` },
        { label: "New Paid Users", value: formatNumber(summary.newPaidUsers) },
        { label: "Net Paid Growth", value: formatNumber(netPaidGrowth) },
        { label: "ARPU", value: formatCurrency(summary.arpu) },
      ],
    }
  }

  return {
    kicker: "Total Revenue",
    value: formatCurrency(summary.totalRevenue),
    delta: "+8.6%",
    tone: "success" as const,
    details: [
      { label: "Gross Revenue", value: formatCurrency(dailyTrend.reduce((sum, row) => sum + row.grossRevenue, 0)) },
      { label: "Refunds", value: `-${formatCurrency(dailyTrend.reduce((sum, row) => sum + row.refunds, 0))}` },
      { label: "Net Revenue", value: formatCurrency(summary.totalRevenue) },
    ],
    chart: (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={dailyTrend}>
          <defs>
            <linearGradient id="revenueNetFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.22} />
              <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#eef2f7" vertical={false} />
          <XAxis dataKey="date" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} width={72} />
          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
          <Area
            dataKey="netRevenue"
            fill="url(#revenueNetFill)"
            name="Net Revenue"
            stroke="#7c3aed"
            strokeWidth={3}
            type="monotone"
          />
          <Line dataKey="previousNetRevenue" name="Previous Net Revenue" stroke="#a78bfa" strokeDasharray="5 5" strokeWidth={2} dot={false} type="monotone" />
          <Line dataKey="grossRevenue" name="Gross Revenue" stroke="#0f172a" strokeWidth={2} dot={false} />
          <Line dataKey="refunds" name="Refunds" stroke="#0ea5e9" strokeWidth={2} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    ),
    footer: [
      { label: "Average Daily Revenue", value: formatCurrency(averageDailyRevenue) },
      { label: "Highest Day", value: `${highestDay.date} ${formatCurrency(highestDay.netRevenue)}` },
      { label: "Lowest Day", value: `${lowestDay.date} ${formatCurrency(lowestDay.netRevenue)}` },
      { label: "Latest Day", value: latest ? `${latest.date} ${formatCurrency(latest.netRevenue)}` : "-" },
    ],
  }
}

function normalizePlanRows(planBreakdown: PlanBreakdownRow[]) {
  const focused = planBreakdown.filter((item) => priorityPlans.includes(item.plan))
  const other = planBreakdown.filter((item) => !priorityPlans.includes(item.plan))
  const otherRevenue = other.reduce((sum, item) => sum + item.revenue, 0)
  const otherUsers = other.reduce((sum, item) => sum + item.activePaidUsers, 0)

  return otherRevenue > 0
    ? [...focused, { plan: "Other", revenue: otherRevenue, activePaidUsers: otherUsers }]
    : focused
}

function aggregateTrendRows<T extends { date: string }>(
  rows: T[],
  cadence: string,
  numericKeys: Array<keyof T>
) {
  if (cadence === "Daily" || rows.length <= 4) {
    return rows
  }

  const groupSize = cadence === "Weekly" ? 2 : Math.max(3, Math.ceil(rows.length / 4))
  const groups: T[] = []

  for (let index = 0; index < rows.length; index += groupSize) {
    const slice = rows.slice(index, index + groupSize)
    const base = { ...slice[slice.length - 1] }
    const start = slice[0]?.date
    const end = slice[slice.length - 1]?.date

    numericKeys.forEach((key) => {
      const total = slice.reduce(
        (sum, row) => sum + Number(row[key] ?? 0),
        0
      )
      ;(base as Record<string, string | number>)[String(key)] =
        key === "activePaidUsers" || key === "previousActivePaidUsers"
          ? Math.round(total / Math.max(slice.length, 1))
          : Math.round(total)
    })
    ;(base as Record<string, string | number>).date =
      cadence === "Weekly" ? `${start}-${end}` : end
    groups.push(base)
  }

  return groups
}

function buildPlanTrend(planRows: PlanBreakdownRow[], dailyTrend: DailyTrendRow[]) {
  const totalRevenue = planRows.reduce((sum, item) => sum + item.revenue, 0)

  return dailyTrend.map((day, dayIndex) => {
    const row: Record<string, string | number> = { date: day.date }

    planRows.forEach((plan, planIndex) => {
      const share = plan.revenue / Math.max(totalRevenue, 1)
      const pulse = 1 + dayIndex * 0.035 + planIndex * 0.018
      row[plan.plan] = Math.round(day.netRevenue * share * pulse)
    })

    return row
  })
}

function ChartSkeleton({ title }: { title: string }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
      <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
      <div className="mt-6 h-72 rounded-xl bg-slate-100" />
    </section>
  )
}

function maxBy<T>(rows: T[], getValue: (row: T) => number) {
  return rows.reduce((best, row) => (getValue(row) > getValue(best) ? row : best))
}

function minBy<T>(rows: T[], getValue: (row: T) => number) {
  return rows.reduce((best, row) => (getValue(row) < getValue(best) ? row : best))
}
