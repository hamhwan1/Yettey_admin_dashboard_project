"use client"

import Link from "next/link"
import {
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react"
import {
  Area,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { ArrowRight, CircleGauge, Info, TrendingUp } from "lucide-react"

import DateRangeControl from "@/components/admin/DateRangeControl"
import ExportActions from "@/components/admin/ExportActions"
import PageHeader from "@/components/admin/PageHeader"
import DashboardLayout from "@/components/layout/DashboardLayout"
import type { ExportRow } from "@/lib/export-files"
import {
  type DashboardCompareMode,
  type DashboardPeriod,
  getCompareModeLabel,
  getDateRangeLabel,
  useDashboardDateRange,
} from "@/lib/dashboard-date-store"
import { cn } from "@/lib/utils"
import { analyticsBlocks, formatNumber } from "./dashboard-data"

type DashboardService = "Overall" | "Yettey" | "VPICK"
type DeltaTone = "positive" | "negative" | "neutral"

type SummaryMetric = {
  label: string
  value: string | number
  format?: "number" | "compactCurrency" | "currency" | "percent" | "duration"
  delta: string
  deltaTone?: DeltaTone
}

type BreakdownItem = {
  label: string
  value: string | number
  share: number
}

type RelatedMetric = {
  label: string
  value: string | number
  detail: string
  share: number
  deltaTone?: DeltaTone
}

type TopSummaryMetric = {
  label: string
  value: string
  delta: string
  deltaTone: DeltaTone
  href: string
  sparkline: number[]
}

type UserTrendPoint = {
  period: string
  visitors: number
  previousVisitors: number
  signups: number
  paidUsers: number
}

type RevenueTrendPoint = {
  period: string
  mrr: number
  previousMrr: number
  paidUsers: number
}

type ProductTrendPoint = {
  period: string
  primary: number
  secondary: number
}

type PlanMixItem = {
  plan: string
  subscribers: number
  share: number
}

type ProductSummary = {
  title: string
  subtitle: string
  href: string
  status: string
  metrics: SummaryMetric[]
  trend: ProductTrendPoint[]
  legend: { label: string; color: string; dashed?: boolean }[]
}

type DashboardDataset = {
  topSummary: TopSummaryMetric[]
  userSummary: SummaryMetric[]
  revenueSummary: SummaryMetric[]
  userTrend: UserTrendPoint[]
  revenueTrend: RevenueTrendPoint[]
  userBreakdown: BreakdownItem[]
  retention: BreakdownItem[]
  userRelated: RelatedMetric[]
  revenueRelated: RelatedMetric[]
  planMix: PlanMixItem[]
  yettey: ProductSummary
  vpick: ProductSummary
}

const chartColors = ["#7c3aed", "#3b82f6", "#10b981", "#94a3b8"]
const services: DashboardService[] = ["Overall", "Yettey", "VPICK"]

const serviceProfiles: Record<
  DashboardService,
  {
    visitorFactor: number
    signupFactor: number
    paidFactor: number
    revenueFactor: number
    conversionShift: number
    churnShift: number
    newUserShare: number
    retention: [number, number, number]
    yetteyFocus: number
    vpickFocus: number
  }
> = {
  Overall: {
    visitorFactor: 1,
    signupFactor: 1,
    paidFactor: 1,
    revenueFactor: 1,
    conversionShift: 0,
    churnShift: 0,
    newUserShare: 28,
    retention: [61, 38, 21],
    yetteyFocus: 1,
    vpickFocus: 1,
  },
  Yettey: {
    visitorFactor: 0.62,
    signupFactor: 0.66,
    paidFactor: 0.71,
    revenueFactor: 0.68,
    conversionShift: 0.4,
    churnShift: -0.3,
    newUserShare: 24,
    retention: [67, 43, 27],
    yetteyFocus: 1.32,
    vpickFocus: 0.42,
  },
  VPICK: {
    visitorFactor: 0.38,
    signupFactor: 0.34,
    paidFactor: 0.29,
    revenueFactor: 0.32,
    conversionShift: -0.5,
    churnShift: 0.5,
    newUserShare: 36,
    retention: [54, 32, 18],
    yetteyFocus: 0.38,
    vpickFocus: 1.36,
  },
}

const compareProfiles: Record<
  DashboardCompareMode,
  {
    visitorDelta: number
    signupDelta: number
    paidDelta: number
    mrrDelta: number
    conversionDelta: number
    arpuDelta: number
    churnDelta: number
    retentionShift: number
    shape: number[]
  }
> = {
  "previous-period": {
    visitorDelta: 18.4,
    signupDelta: 5.7,
    paidDelta: 32.1,
    mrrDelta: 12.6,
    conversionDelta: 0.6,
    arpuDelta: 8.2,
    churnDelta: -0.3,
    retentionShift: 0,
    shape: [0.76, 0.88, 0.94, 0.98, 1.06, 1.12, 1.18],
  },
  "same-period-last-month": {
    visitorDelta: 7.8,
    signupDelta: -2.4,
    paidDelta: 6.2,
    mrrDelta: 8.9,
    conversionDelta: -0.4,
    arpuDelta: 3.6,
    churnDelta: 0.4,
    retentionShift: -3,
    shape: [0.92, 1.02, 0.95, 1.08, 1.0, 1.13, 1.09],
  },
  "same-period-last-year": {
    visitorDelta: 96.8,
    signupDelta: 74.2,
    paidDelta: 118.4,
    mrrDelta: 142.6,
    conversionDelta: 1.3,
    arpuDelta: 18.4,
    churnDelta: -1.1,
    retentionShift: 4,
    shape: [0.62, 0.78, 0.84, 0.96, 1.08, 1.22, 1.34],
  },
}

const periodConfigs: Record<
  DashboardPeriod,
  { multiplier: number; labels: string[]; shape: number[] }
> = {
  "7D": {
    multiplier: 0.28,
    labels: ["05/20", "05/21", "05/22", "05/23", "05/24", "05/25", "05/26"],
    shape: [0.78, 0.92, 0.88, 1.02, 1.04, 1.12, 1.08],
  },
  "30D": {
    multiplier: 1,
    labels: ["04/27", "05/04", "05/11", "05/18", "05/25", "05/26"],
    shape: [0.72, 0.83, 0.91, 1.0, 1.08, 1.15],
  },
  "90D": {
    multiplier: 2.85,
    labels: ["Feb W4", "Mar W2", "Mar W4", "Apr W2", "Apr W4", "May W4"],
    shape: [0.66, 0.8, 0.9, 0.88, 1.08, 1.24],
  },
  "1Y": {
    multiplier: 10.4,
    labels: ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"],
    shape: [0.58, 0.62, 0.72, 0.78, 0.82, 0.9, 0.86, 0.96, 1.04, 1.12, 1.2, 1.32],
  },
  Custom: {
    multiplier: 1.5,
    labels: ["Start", "25%", "50%", "75%", "End"],
    shape: [0.78, 0.92, 1.04, 0.98, 1.16],
  },
}

export default function DashboardOverviewClient() {
  const [service, setService] = useState<DashboardService>("Overall")
  const [isMounted, setIsMounted] = useState(false)
  const [isServicePending, startServiceTransition] = useTransition()
  const { period, startDate, endDate, compareMode, resetDateRange } =
    useDashboardDateRange()
  const filterKey = `${service}-${period}-${compareMode}-${startDate}-${endDate}`
  const deferredFilterKey = useDeferredValue(filterKey)
  const isUpdating = isServicePending || deferredFilterKey !== filterKey

  const dataset = useMemo(
    () =>
      createDashboardDataset({
        service,
        period,
        compareMode,
        startDate,
        endDate,
      }),
    [compareMode, endDate, period, service, startDate]
  )

  const ready = isMounted && !isUpdating

  const exportPayload = useMemo(
    () => ({
      title: "Executive Analytics Block Report",
      subtitle:
        "Mock analytics report synchronized by service, period, and comparison mode.",
      filename: "executive-analytics-block-report",
      filters: {
        Service: service,
        "Date range": getDateRangeLabel(startDate, endDate),
        Compare: getCompareModeLabel(compareMode),
      },
      kpis: [...dataset.userSummary, ...dataset.revenueSummary].map((metric) => ({
        label: metric.label,
        value: formatMetricValue(metric),
        detail: metric.delta,
      })),
      charts: [
        {
          title: "User Growth Trend",
          points: dataset.userTrend.map((row) => ({
            label: row.period,
            value: row.visitors,
            secondary: `${row.signups} signups`,
          })),
        },
        {
          title: "Revenue Trend",
          points: dataset.revenueTrend.map((row) => ({
            label: row.period,
            value: row.mrr,
            secondary: `${row.paidUsers} paid users`,
          })),
        },
      ],
      datasets: [
        {
          name: "Top Summary",
          rows: dataset.topSummary.map((metric) => ({
            label: metric.label,
            value: metric.value,
            delta: metric.delta,
          })),
        },
        { name: "User Growth Trend", rows: toExportRows(dataset.userTrend) },
        { name: "User Mix", rows: toExportRows(dataset.userBreakdown) },
        { name: "Retention", rows: toExportRows(dataset.retention) },
        {
          name: "User Growth Related Metrics",
          rows: toExportRows(dataset.userRelated),
        },
        { name: "Revenue Trend", rows: toExportRows(dataset.revenueTrend) },
        {
          name: "Revenue Movement",
          rows: toExportRows(dataset.revenueRelated),
        },
        { name: "Plan Distribution", rows: toExportRows(dataset.planMix) },
        { name: "Yettey Usage Trend", rows: toExportRows(dataset.yettey.trend) },
        { name: "VPICK Operations Trend", rows: toExportRows(dataset.vpick.trend) },
      ],
    }),
    [compareMode, dataset, endDate, service, startDate]
  )

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsMounted(true))

    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Executive Dashboard"
        title="Overview"
        description="A focused executive view for growth, revenue, retention, and product health."
        actions={<ExportActions payload={exportPayload} />}
      />

      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)] dark:border-slate-800 dark:bg-slate-950">
        <ServiceTabs
          service={service}
          onChange={(nextService) =>
            startServiceTransition(() => setService(nextService))
          }
        />
        <div className="mt-5">
          <DateRangeControl compact />
        </div>
        <button
          className="mt-5 rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 dark:hover:bg-slate-900 dark:hover:text-slate-100"
          onClick={() => {
            startServiceTransition(() => setService("Overall"))
            resetDateRange()
          }}
        >
          Reset filters
        </button>
      </section>

      <TopSummaryBlock
        metrics={dataset.topSummary}
        ready={ready}
        compareLabel={getCompareModeLabel(compareMode)}
      />

      <div className="mt-6 space-y-6">
        <ExecutiveAnalyticsBlock
          title="User Growth"
          subtitle="Visitor inflow, signup movement, paid conversion, and retention in one block."
          status={statusForRetention(dataset.retention[2].share)}
          href={analyticsBlocks.userGrowth.href}
          summary={dataset.userSummary}
          chart={
            ready ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={dataset.userTrend}
                  key={`users-${service}-${period}-${compareMode}`}
                >
                  <CartesianGrid stroke="#eef2f7" vertical={false} />
                  <XAxis
                    dataKey="period"
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    width={64}
                  />
                  <Tooltip />
                  <Line
                    dataKey="visitors"
                    dot={{ r: 3 }}
                    stroke="#7c3aed"
                    strokeWidth={2.5}
                    type="monotone"
                  />
                  <Line
                    dataKey="previousVisitors"
                    dot={false}
                    stroke="#a78bfa"
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    type="monotone"
                  />
                  <Line
                    dataKey="signups"
                    dot={{ r: 3 }}
                    stroke="#3b82f6"
                    strokeWidth={2}
                    type="monotone"
                  />
                  <Line
                    dataKey="paidUsers"
                    dot={{ r: 3 }}
                    stroke="#10b981"
                    strokeWidth={2}
                    type="monotone"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <BlockSkeleton />
            )
          }
          legend={[
            { label: "Current visitors", color: "#7c3aed" },
            { label: "Previous visitors", color: "#a78bfa", dashed: true },
            { label: "Signups", color: "#3b82f6" },
            { label: "Paid Users", color: "#10b981" },
          ]}
          updating={isUpdating}
          sidePanel={
            <UserGrowthSidePanel
              ready={ready}
              breakdown={dataset.userBreakdown}
              retention={dataset.retention}
              related={dataset.userRelated}
            />
          }
        />

        <ExecutiveAnalyticsBlock
          title="Revenue"
          subtitle="Recurring revenue, ARPU, churn, payments, upgrades, and plan mix."
          status={statusForChurn(
            Number(dataset.revenueSummary.find((metric) => metric.label === "Churn")?.value ?? 0)
          )}
          href={analyticsBlocks.revenue.href}
          summary={dataset.revenueSummary}
          chart={
            ready ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={dataset.revenueTrend}
                  key={`revenue-${service}-${period}-${compareMode}`}
                >
                  <CartesianGrid stroke="#eef2f7" vertical={false} />
                  <XAxis
                    dataKey="period"
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    width={64}
                  />
                  <Tooltip />
                  <Area
                    dataKey="mrr"
                    stroke="#7c3aed"
                    fill="#ede9fe"
                    strokeWidth={2.5}
                    type="monotone"
                  />
                  <Line
                    dataKey="previousMrr"
                    dot={false}
                    stroke="#a78bfa"
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    type="monotone"
                  />
                  <Line
                    dataKey="paidUsers"
                    dot={false}
                    stroke="#0f172a"
                    strokeWidth={2}
                    type="monotone"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <BlockSkeleton />
            )
          }
          legend={[
            { label: "Current MRR", color: "#7c3aed" },
            { label: "Previous MRR", color: "#a78bfa", dashed: true },
          ]}
          updating={isUpdating}
          sidePanel={
            <RevenueSidePanel
              related={dataset.revenueRelated}
              plans={dataset.planMix}
            />
          }
        />

        <div className="grid gap-6 xl:grid-cols-2">
          <ProductSummaryBlock
            title={dataset.yettey.title}
            subtitle={dataset.yettey.subtitle}
            href={dataset.yettey.href}
            status={dataset.yettey.status}
            metrics={dataset.yettey.metrics}
            legend={dataset.yettey.legend}
            updating={isUpdating}
          >
            {ready ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={dataset.yettey.trend}
                  key={`yettey-${service}-${period}-${compareMode}`}
                >
                  <CartesianGrid stroke="#eef2f7" vertical={false} />
                  <XAxis dataKey="period" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} width={48} />
                  <Tooltip />
                  <Line
                    dataKey="primary"
                    dot={{ r: 3 }}
                    stroke="#7c3aed"
                    strokeWidth={2.5}
                    type="monotone"
                  />
                  <Line
                    dataKey="secondary"
                    dot={false}
                    stroke="#3b82f6"
                    strokeWidth={2}
                    type="monotone"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <BlockSkeleton />
            )}
          </ProductSummaryBlock>

          <ProductSummaryBlock
            title={dataset.vpick.title}
            subtitle={dataset.vpick.subtitle}
            href={dataset.vpick.href}
            status={dataset.vpick.status}
            metrics={dataset.vpick.metrics}
            legend={dataset.vpick.legend}
            updating={isUpdating}
          >
            {ready ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={dataset.vpick.trend}
                  key={`vpick-${service}-${period}-${compareMode}`}
                >
                  <CartesianGrid stroke="#eef2f7" vertical={false} />
                  <XAxis dataKey="period" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} width={48} />
                  <Tooltip />
                  <Line
                    dataKey="primary"
                    dot={{ r: 3 }}
                    stroke="#7c3aed"
                    strokeWidth={2.5}
                    type="monotone"
                  />
                  <Line
                    dataKey="secondary"
                    dot={false}
                    stroke="#3b82f6"
                    strokeWidth={2}
                    type="monotone"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <BlockSkeleton />
            )}
          </ProductSummaryBlock>
        </div>
      </div>
    </DashboardLayout>
  )
}

function ServiceTabs({
  service,
  onChange,
}: {
  service: DashboardService
  onChange: (service: DashboardService) => void
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
        Service
      </p>
      <div className="flex flex-wrap gap-2">
        {services.map((item) => (
          <button
            key={item}
            className={cn(
              "h-9 rounded-lg px-3 text-sm font-semibold transition hover:bg-slate-100 hover:text-slate-950",
              service === item
                ? "bg-violet-600 text-white shadow-sm shadow-violet-600/20 hover:bg-violet-600 hover:text-white"
                : "text-slate-600 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-50"
            )}
            onClick={() => onChange(item)}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  )
}

function TopSummaryBlock({
  metrics,
  ready,
  compareLabel,
}: {
  metrics: readonly TopSummaryMetric[]
  ready: boolean
  compareLabel: string
}) {
  return (
    <section className="grid gap-3 lg:grid-cols-4">
      {metrics.map((metric) => (
        <Link
          key={metric.label}
          href={metric.href}
          className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_10px_24px_rgba(15,23,42,0.04)] transition-all duration-150 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-[0_2px_4px_rgba(15,23,42,0.08),0_16px_32px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-950"
          title={`Open ${metric.label} detail`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                {metric.label}
              </p>
              <AnimatedMetricValue
                className="mt-2 text-2xl font-bold tracking-tight text-slate-950 dark:text-slate-50"
                value={metric.value}
              />
            </div>
            <ArrowRight className="size-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-violet-600" />
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <DeltaBadge tone={metric.deltaTone}>{metric.delta}</DeltaBadge>
            <span className="text-xs font-semibold text-slate-500">
              {compareLabel}
            </span>
          </div>

          <div className="mt-4 h-10">
            <MiniSparkline values={metric.sparkline} ready={ready} />
          </div>
        </Link>
      ))}
    </section>
  )
}

function ExecutiveAnalyticsBlock({
  title,
  subtitle,
  status,
  href,
  summary,
  legend,
  chart,
  sidePanel,
  updating,
}: {
  title: string
  subtitle: string
  status: string
  href: string
  summary: readonly SummaryMetric[]
  legend: readonly { label: string; color: string; dashed?: boolean }[]
  chart: React.ReactNode
  sidePanel: React.ReactNode
  updating: boolean
}) {
  return (
    <section
      className={cn(
        "group rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)] transition-all duration-150 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-[0_2px_4px_rgba(15,23,42,0.08),0_16px_32px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-950",
        updating && "opacity-90"
      )}
    >
      <BlockHeader title={title} subtitle={subtitle} status={status} href={href} />

      <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          <InlineMetrics metrics={summary} />
          <ChartLegend items={legend} />
          <div className="mt-4 h-[332px]">{chart}</div>
        </div>
        <aside className="rounded-2xl border border-slate-100 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
          {sidePanel}
        </aside>
      </div>
    </section>
  )
}

function ProductSummaryBlock({
  title,
  subtitle,
  href,
  status,
  metrics,
  legend,
  updating,
  children,
}: {
  title: string
  subtitle: string
  href: string
  status: string
  metrics: readonly SummaryMetric[]
  legend: readonly { label: string; color: string; dashed?: boolean }[]
  updating: boolean
  children: React.ReactNode
}) {
  return (
    <section
      className={cn(
        "group rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)] transition-all duration-150 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-[0_2px_4px_rgba(15,23,42,0.08),0_16px_32px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-950",
        updating && "opacity-90"
      )}
    >
      <BlockHeader title={title} subtitle={subtitle} status={status} href={href} />
      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricTile key={metric.label} metric={metric} />
        ))}
      </div>
      <div className="mt-5">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Usage Trend
          </p>
          <ChartLegend items={legend} compact />
        </div>
        <div className="mt-3 h-64">{children}</div>
      </div>
    </section>
  )
}

function BlockHeader({
  title,
  subtitle,
  status,
  href,
}: {
  title: string
  subtitle: string
  status: string
  href: string
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-xl font-bold tracking-tight text-slate-950 dark:text-slate-50">
            {title}
          </h2>
          <span
            className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 text-xs font-bold text-violet-600 dark:bg-violet-500/10 dark:text-violet-300"
            title={`${title} status: ${status}`}
          >
            <CircleGauge className="size-3" />
            {status}
          </span>
        </div>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
          {subtitle}
        </p>
      </div>

      <Link
        href={href}
        className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl px-3 text-sm font-bold text-violet-600 transition hover:bg-violet-50 hover:text-violet-700 dark:text-violet-300 dark:hover:bg-slate-900"
      >
        View full analytics
        <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
      </Link>
    </div>
  )
}

function InlineMetrics({ metrics }: { metrics: readonly SummaryMetric[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="border-r border-slate-100 pr-4 last:border-r-0 dark:border-slate-800"
          title={`${metric.label}: ${formatMetricValue(metric)} (${metric.delta})`}
        >
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              {metric.label}
            </p>
            <Info className="size-3 text-slate-400" />
          </div>
          <div className="mt-2 flex flex-wrap items-baseline gap-2">
            <AnimatedMetricValue
              className="text-2xl font-bold tracking-tight text-slate-950 dark:text-slate-50"
              value={formatMetricValue(metric)}
            />
            <DeltaBadge tone={metric.deltaTone}>{metric.delta}</DeltaBadge>
          </div>
        </div>
      ))}
    </div>
  )
}

function MetricTile({ metric }: { metric: SummaryMetric }) {
  return (
    <div
      className="rounded-xl border border-slate-100 bg-slate-50 p-4 transition hover:border-violet-100 hover:bg-white dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-950"
      title={`${metric.label}: ${formatMetricValue(metric)} (${metric.delta})`}
    >
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {metric.label}
      </p>
      <AnimatedMetricValue
        className="mt-2 text-xl font-bold tracking-tight text-slate-950 dark:text-slate-50"
        value={formatMetricValue(metric)}
      />
      <div className="mt-2">
        <DeltaBadge tone={metric.deltaTone}>{metric.delta}</DeltaBadge>
      </div>
    </div>
  )
}

function ChartLegend({
  items,
  compact = false,
}: {
  items: readonly { label: string; color: string; dashed?: boolean }[]
  compact?: boolean
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-5",
        compact ? "mt-0 justify-end" : "mt-7"
      )}
    >
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <span
            className={cn(
              "inline-block h-2.5 rounded-full",
              item.dashed ? "w-5 border-t-2 border-dashed bg-transparent" : "w-2.5"
            )}
            style={
              item.dashed
                ? { borderTopColor: item.color }
                : { backgroundColor: item.color }
            }
          />
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  )
}

function UserGrowthSidePanel({
  ready,
  breakdown,
  retention,
  related,
}: {
  ready: boolean
  breakdown: readonly BreakdownItem[]
  retention: readonly BreakdownItem[]
  related: readonly RelatedMetric[]
}) {
  return (
    <div>
      <h3 className="text-sm font-bold text-slate-950 dark:text-slate-50">
        New vs Returning
      </h3>
      <div className="mt-3 grid gap-4 sm:grid-cols-[104px_1fr] xl:grid-cols-1">
        <div className="h-28">
          {ready ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={breakdown}
                  dataKey="share"
                  innerRadius={32}
                  outerRadius={48}
                  paddingAngle={3}
                >
                  {breakdown.map((row, index) => (
                    <Cell
                      key={row.label}
                      fill={chartColors[index % chartColors.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <BlockSkeleton />
          )}
        </div>
        <div className="space-y-3">
          {breakdown.map((row, index) => (
            <div
              key={row.label}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <div className="flex items-center gap-2">
                <span
                  className="size-2.5 rounded-sm"
                  style={{ backgroundColor: chartColors[index % chartColors.length] }}
                />
                <span className="font-semibold text-slate-600 dark:text-slate-300">
                  {row.label}
                </span>
              </div>
              <span className="font-bold text-slate-950 dark:text-slate-50">
                {row.share}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <PanelDivider />

      <h3 className="text-sm font-bold text-slate-950 dark:text-slate-50">
        Retention
      </h3>
      <div className="mt-4 grid grid-cols-3 divide-x divide-slate-200 dark:divide-slate-800">
        {retention.map((row) => (
          <div key={row.label} className="px-3 first:pl-0 last:pr-0">
            <p className="text-xs font-bold text-slate-500">{row.label}</p>
            <AnimatedMetricValue
              className="mt-1 text-xl font-bold text-slate-950 dark:text-slate-50"
              value={`${row.share}%`}
            />
          </div>
        ))}
      </div>

      <PanelDivider />

      <RelatedRows rows={related} />
    </div>
  )
}

function RevenueSidePanel({
  related,
  plans,
}: {
  related: readonly RelatedMetric[]
  plans: readonly PlanMixItem[]
}) {
  return (
    <div>
      <RelatedRows rows={related} />
      <PanelDivider />

      <h3 className="text-sm font-bold text-slate-950 dark:text-slate-50">
        Plan Distribution
      </h3>
      <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-white dark:bg-slate-950">
        {plans.map((plan, index) => (
          <div
            key={plan.plan}
            className="h-full transition-all duration-300"
            style={{
              width: `${plan.share}%`,
              backgroundColor: chartColors[index % chartColors.length],
            }}
            title={`${plan.plan}: ${plan.share}%`}
          />
        ))}
      </div>
      <div className="mt-4 space-y-3">
        {plans.map((plan, index) => (
          <div
            key={plan.plan}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <div className="flex items-center gap-2">
              <span
                className="size-2.5 rounded-sm"
                style={{ backgroundColor: chartColors[index % chartColors.length] }}
              />
              <span className="font-semibold text-slate-600 dark:text-slate-300">
                {plan.plan}
              </span>
            </div>
            <span className="font-bold text-slate-950 dark:text-slate-50">
              {plan.share}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function RelatedRows({ rows }: { rows: readonly RelatedMetric[] }) {
  return (
    <div className="space-y-5">
      {rows.map((row) => (
        <div key={row.label} title={row.detail}>
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
            {row.label}
          </p>
          <div className="mt-2 flex flex-wrap items-baseline gap-2">
            <AnimatedMetricValue
              className="text-2xl font-bold text-slate-950 dark:text-slate-50"
              value={String(row.value)}
            />
            <DeltaBadge tone={row.deltaTone}>{row.detail}</DeltaBadge>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white dark:bg-slate-950">
            <div
              className="h-full rounded-full bg-violet-600 transition-all duration-300"
              style={{ width: `${row.share}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function DeltaBadge({
  tone = "positive",
  children,
}: {
  tone?: DeltaTone
  children: React.ReactNode
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold",
        tone === "positive" && "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10",
        tone === "negative" && "bg-rose-50 text-rose-600 dark:bg-rose-500/10",
        tone === "neutral" && "bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300"
      )}
    >
      <TrendingUp className="size-3" />
      {children}
    </span>
  )
}

function AnimatedMetricValue({
  value,
  className,
}: {
  value: string
  className?: string
}) {
  return (
    <p key={value} className={cn("transition-all duration-300 ease-out", className)}>
      {value}
    </p>
  )
}

function PanelDivider() {
  return <div className="my-5 h-px bg-slate-200 dark:bg-slate-800" />
}

function MiniSparkline({
  values,
  ready,
}: {
  values: readonly number[]
  ready: boolean
}) {
  if (!ready) {
    return <BlockSkeleton />
  }

  const points = values.map((value, index) => ({ index, value }))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={points}>
        <XAxis dataKey="index" hide />
        <YAxis hide domain={["dataMin", "dataMax"]} />
        <Line
          dataKey="value"
          dot={false}
          stroke="#7c3aed"
          strokeWidth={2.5}
          type="monotone"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

function BlockSkeleton() {
  return (
    <div className="h-full animate-pulse rounded-xl bg-slate-100 dark:bg-slate-900" />
  )
}

function createDashboardDataset({
  service,
  period,
  compareMode,
  startDate,
  endDate,
}: {
  service: DashboardService
  period: DashboardPeriod
  compareMode: DashboardCompareMode
  startDate: string
  endDate: string
}): DashboardDataset {
  const serviceProfile = serviceProfiles[service]
  const compareProfile = compareProfiles[compareMode]
  const periodConfig = getPeriodConfig(period, startDate, endDate)
  const shape = buildShape(periodConfig.shape, compareProfile.shape)
  const periodScale = periodConfig.multiplier

  const visitors = Math.round(842390 * periodScale * serviceProfile.visitorFactor)
  const signups = Math.round(48210 * periodScale * serviceProfile.signupFactor)
  const paidUsers = Math.round(52480 * periodScale * serviceProfile.paidFactor)
  const mrr = Math.round(802400 * periodScale * serviceProfile.revenueFactor)
  const conversionRate = clamp(
    (signups / Math.max(visitors, 1)) * 100 + serviceProfile.conversionShift,
    1.2,
    12.5
  )
  const arpu = clamp(49.2 * serviceProfile.revenueFactor * 1.18, 22, 92)
  const churn = clamp(2.1 + serviceProfile.churnShift + compareProfile.churnDelta, 0.8, 6.2)
  const newUserShare = clamp(
    serviceProfile.newUserShare +
      (compareMode === "same-period-last-month" ? 4 : 0) +
      (compareMode === "same-period-last-year" ? 7 : 0),
    18,
    48
  )
  const returningShare = 100 - newUserShare
  const retention = serviceProfile.retention.map((value) =>
    Math.round(clamp(value + compareProfile.retentionShift, 8, 82))
  ) as [number, number, number]
  const previousVisitors = previousPeriodValue(visitors, compareProfile.visitorDelta)
  const previousMrr = previousPeriodValue(mrr, compareProfile.mrrDelta)

  const userTrend = periodConfig.labels.map((label, index) => ({
    period: label,
    visitors: distribute(visitors, shape)[index],
    previousVisitors: distribute(previousVisitors, periodConfig.shape)[index],
    signups: distribute(signups, wobble(shape, 0.09))[index],
    paidUsers: distribute(paidUsers, wobble(shape, 0.16))[index],
  }))

  const revenueTrend = periodConfig.labels.map((label, index) => ({
    period: label,
    mrr: levelSeries(mrr, shape)[index],
    previousMrr: levelSeries(previousMrr, periodConfig.shape)[index],
    paidUsers: levelSeries(paidUsers, wobble(shape, 0.11))[index],
  }))

  const topSummary = [
    {
      label: "Total Visitors",
      value: formatNumber(visitors),
      delta: formatPercent(compareProfile.visitorDelta),
      deltaTone: toneFromDelta(compareProfile.visitorDelta),
      href: "/dashboard/intelligence/visitors",
      sparkline: userTrend.map((row) => row.visitors),
    },
    {
      label: "Signups",
      value: formatNumber(signups),
      delta: formatPercent(compareProfile.signupDelta),
      deltaTone: toneFromDelta(compareProfile.signupDelta),
      href: "/dashboard/intelligence/signups",
      sparkline: userTrend.map((row) => row.signups),
    },
    {
      label: "Paid Users",
      value: formatNumber(paidUsers),
      delta: formatPercent(compareProfile.paidDelta),
      deltaTone: toneFromDelta(compareProfile.paidDelta),
      href: "/dashboard/intelligence/subscriptions",
      sparkline: userTrend.map((row) => row.paidUsers),
    },
    {
      label: "MRR",
      value: formatCompactCurrency(mrr),
      delta: formatPercent(compareProfile.mrrDelta),
      deltaTone: toneFromDelta(compareProfile.mrrDelta),
      href: "/dashboard/revenue",
      sparkline: revenueTrend.map((row) => row.mrr),
    },
  ]

  const userSummary = [
    {
      label: "Visitors",
      value: visitors,
      format: "number",
      delta: formatPercent(compareProfile.visitorDelta),
      deltaTone: toneFromDelta(compareProfile.visitorDelta),
    },
    {
      label: "Signups",
      value: signups,
      format: "number",
      delta: formatPercent(compareProfile.signupDelta),
      deltaTone: toneFromDelta(compareProfile.signupDelta),
    },
    {
      label: "Conversion Rate",
      value: conversionRate,
      format: "percent",
      delta: formatPoints(compareProfile.conversionDelta),
      deltaTone: toneFromDelta(compareProfile.conversionDelta),
    },
  ] satisfies SummaryMetric[]

  const revenueSummary = [
    {
      label: "MRR",
      value: mrr,
      format: "compactCurrency",
      delta: formatPercent(compareProfile.mrrDelta),
      deltaTone: toneFromDelta(compareProfile.mrrDelta),
    },
    {
      label: "ARPU",
      value: arpu,
      format: "currency",
      delta: formatPercent(compareProfile.arpuDelta),
      deltaTone: toneFromDelta(compareProfile.arpuDelta),
    },
    {
      label: "Churn",
      value: churn,
      format: "percent",
      delta: formatPoints(compareProfile.churnDelta),
      deltaTone: compareProfile.churnDelta <= 0 ? "positive" : "negative",
    },
  ] satisfies SummaryMetric[]

  const userBreakdown = [
    {
      label: "New Users",
      value: Math.round(signups),
      share: newUserShare,
    },
    {
      label: "Returning Users",
      value: Math.round(visitors * (returningShare / 100)),
      share: returningShare,
    },
  ]

  const userRelated = [
    {
      label: "Paid Conversion",
      value: `${clamp((paidUsers / Math.max(signups, 1)) * 100, 2, 46).toFixed(1)}%`,
      detail: formatPoints(compareProfile.conversionDelta),
      share: clamp(Math.round((paidUsers / Math.max(signups, 1)) * 100), 12, 78),
      deltaTone: toneFromDelta(compareProfile.conversionDelta),
    },
    {
      label: "Activation Quality",
      value: `${clamp(retention[0] - 11, 22, 74)}%`,
      detail:
        compareMode === "same-period-last-month"
          ? "-2.1pp"
          : compareMode === "same-period-last-year"
            ? "+6.8pp"
            : "+1.4pp",
      share: clamp(retention[0] - 11, 22, 74),
      deltaTone: compareMode === "same-period-last-month" ? "negative" : "positive",
    },
  ] satisfies RelatedMetric[]

  const revenueRelated = [
    {
      label: "New Payments",
      value: formatNumber(Math.round(signups * 0.144 * serviceProfile.paidFactor)),
      detail: formatPercent(compareProfile.mrrDelta + 6.1),
      share: clamp(Math.round(58 + compareProfile.mrrDelta / 2), 36, 88),
      deltaTone: toneFromDelta(compareProfile.mrrDelta + 6.1),
    },
    {
      label: "Upgrade Users",
      value: formatNumber(Math.round(paidUsers * 0.024 * serviceProfile.yetteyFocus)),
      detail: formatPercent(
        compareMode === "same-period-last-month"
          ? -4.8
          : compareMode === "same-period-last-year"
            ? 38.4
            : 24.5
      ),
      share:
        compareMode === "same-period-last-month"
          ? 42
          : compareMode === "same-period-last-year"
            ? 72
            : 56,
      deltaTone: compareMode === "same-period-last-month" ? "negative" : "positive",
    },
  ] satisfies RelatedMetric[]

  return {
    topSummary,
    userSummary,
    revenueSummary,
    userTrend,
    revenueTrend,
    userBreakdown,
    retention: [
      { label: "D1", value: `${retention[0]}%`, share: retention[0] },
      { label: "D7", value: `${retention[1]}%`, share: retention[1] },
      { label: "D30", value: `${retention[2]}%`, share: retention[2] },
    ],
    userRelated,
    revenueRelated,
    planMix: buildPlanMix(service, compareMode),
    yettey: buildYetteySummary(periodConfig.labels, shape, periodScale, serviceProfile, compareProfile),
    vpick: buildVpickSummary(periodConfig.labels, shape, periodScale, serviceProfile, compareProfile),
  }
}

function buildYetteySummary(
  labels: string[],
  shape: number[],
  periodScale: number,
  serviceProfile: (typeof serviceProfiles)[DashboardService],
  compareProfile: (typeof compareProfiles)[DashboardCompareMode]
): ProductSummary {
  const focus = serviceProfile.yetteyFocus
  const storage = 8.2 * focus * Math.min(periodScale, 3.4)
  const generations = Math.round(684920 * periodScale * focus)
  const teams = Math.round(1284 * focus)
  const projects = Math.round(19284 * periodScale * focus)

  return {
    title: "Yettey Summary",
    subtitle: "Storage, DAM depth, generation activity, team collaboration, and projects.",
    href: analyticsBlocks.yettey.href,
    status: focus > 1.1 ? "Leading" : focus < 0.7 ? "Reference" : "Healthy",
    metrics: [
      {
        label: "Storage Usage",
        value: `${storage.toFixed(1)} TB`,
        delta: formatPercent(compareProfile.visitorDelta * 0.6),
        deltaTone: toneFromDelta(compareProfile.visitorDelta),
      },
      {
        label: "AI Generation",
        value: compactNumber(generations),
        delta: formatPercent(compareProfile.signupDelta + 17.8),
        deltaTone: toneFromDelta(compareProfile.signupDelta + 17.8),
      },
      {
        label: "Active Teams",
        value: formatNumber(teams),
        delta: formatPercent(compareProfile.paidDelta * 0.25),
        deltaTone: toneFromDelta(compareProfile.paidDelta),
      },
      {
        label: "Project Activity",
        value: formatNumber(projects),
        delta: formatPercent(compareProfile.visitorDelta * 0.82),
        deltaTone: toneFromDelta(compareProfile.visitorDelta),
      },
    ],
    trend: labels.map((label, index) => ({
      period: label,
      primary: levelSeries(generations, shape)[index],
      secondary: levelSeries(projects, wobble(shape, 0.08))[index],
    })),
    legend: [
      { label: "AI Generation", color: "#7c3aed" },
      { label: "Projects", color: "#3b82f6" },
    ],
  }
}

function buildVpickSummary(
  labels: string[],
  shape: number[],
  periodScale: number,
  serviceProfile: (typeof serviceProfiles)[DashboardService],
  compareProfile: (typeof compareProfiles)[DashboardCompareMode]
): ProductSummary {
  const focus = serviceProfile.vpickFocus
  const analysis = Math.round(156840 * periodScale * focus)
  const shortform = Math.round(52480 * periodScale * focus)
  const credits = 8.2 * periodScale * focus
  const processing = clamp(138 - (focus - 1) * 14 + compareProfile.churnDelta * 8, 104, 196)

  return {
    title: "VPICK Summary",
    subtitle: "Video analysis, shortform generation, credit consumption, and processing latency.",
    href: analyticsBlocks.vpick.href,
    status: focus > 1.1 ? "Scaling" : focus < 0.7 ? "Reference" : "Healthy",
    metrics: [
      {
        label: "Video Analysis",
        value: formatNumber(analysis),
        delta: formatPercent(compareProfile.visitorDelta + 1.4),
        deltaTone: toneFromDelta(compareProfile.visitorDelta + 1.4),
      },
      {
        label: "Shortform Gen.",
        value: formatNumber(shortform),
        delta: formatPercent(compareProfile.signupDelta + 10.8),
        deltaTone: toneFromDelta(compareProfile.signupDelta + 10.8),
      },
      {
        label: "Credit Usage",
        value: `${credits.toFixed(1)}M`,
        delta: formatPercent(compareProfile.paidDelta * 0.52),
        deltaTone: toneFromDelta(compareProfile.paidDelta),
      },
      {
        label: "Processing Time",
        value: formatDuration(processing),
        delta: compareProfile.churnDelta > 0 ? "+12s" : "-14s",
        deltaTone: compareProfile.churnDelta > 0 ? "negative" : "positive",
      },
    ],
    trend: labels.map((label, index) => ({
      period: label,
      primary: levelSeries(analysis, shape)[index],
      secondary: levelSeries(shortform, wobble(shape, 0.12))[index],
    })),
    legend: [
      { label: "Video Analysis", color: "#7c3aed" },
      { label: "Shortform", color: "#3b82f6" },
    ],
  }
}

function buildPlanMix(
  service: DashboardService,
  compareMode: DashboardCompareMode
): PlanMixItem[] {
  const annualLift = compareMode === "same-period-last-year" ? 4 : 0
  const monthlyDip = compareMode === "same-period-last-month" ? -3 : 0

  if (service === "Yettey") {
    return normalizeShares([
      { plan: "Starter", subscribers: 18400, share: 34 + monthlyDip },
      { plan: "Growth", subscribers: 16820, share: 38 + annualLift },
      { plan: "Pro", subscribers: 9140, share: 21 },
      { plan: "Enterprise", subscribers: 2360, share: 7 - monthlyDip },
    ])
  }

  if (service === "VPICK") {
    return normalizeShares([
      { plan: "Basic", subscribers: 4860, share: 46 + monthlyDip },
      { plan: "Professional", subscribers: 3260, share: 37 + annualLift },
      { plan: "Enterprise", subscribers: 980, share: 17 - annualLift - monthlyDip },
    ])
  }

  return normalizeShares([
    { plan: "Starter", subscribers: 18400, share: 31 + monthlyDip },
    { plan: "Growth", subscribers: 16820, share: 29 + annualLift },
    { plan: "Pro", subscribers: 9140, share: 18 },
    { plan: "VPICK Basic", subscribers: 4860, share: 13 - annualLift },
    { plan: "VPICK Pro", subscribers: 3260, share: 9 - monthlyDip },
  ])
}

function getPeriodConfig(
  period: DashboardPeriod,
  startDate: string,
  endDate: string
) {
  if (period !== "Custom") {
    return periodConfigs[period]
  }

  const days = Math.max(
    1,
    Math.round(
      (new Date(`${endDate}T00:00:00`).getTime() -
        new Date(`${startDate}T00:00:00`).getTime()) /
        86400000
    ) + 1
  )

  return {
    ...periodConfigs.Custom,
    multiplier: clamp(days / 30, 0.2, 12),
    labels: [startDate.slice(5), "25%", "50%", "75%", endDate.slice(5)],
  }
}

function buildShape(periodShape: number[], compareShape: number[]) {
  return periodShape.map(
    (value, index) => value * compareShape[index % compareShape.length]
  )
}

function distribute(total: number, shape: number[]) {
  const sum = shape.reduce((acc, value) => acc + value, 0)

  return shape.map((value) => Math.round((total * value) / sum))
}

function levelSeries(total: number, shape: number[]) {
  const last = shape[shape.length - 1] || 1

  return shape.map((value) => Math.round(total * (value / last)))
}

function previousPeriodValue(current: number, deltaPercent: number) {
  return Math.round(current / (1 + deltaPercent / 100))
}

function wobble(shape: number[], strength: number) {
  return shape.map((value, index) => {
    const offset = index % 2 === 0 ? strength : -strength / 2

    return value * (1 + offset)
  })
}

function normalizeShares<T extends { share: number }>(rows: T[]) {
  const total = rows.reduce((acc, row) => acc + row.share, 0)

  return rows.map((row) => ({
    ...row,
    share: Math.round((row.share / total) * 100),
  }))
}

function statusForRetention(value: number) {
  if (value >= 28) {
    return "Healthy"
  }

  if (value >= 20) {
    return "Watch"
  }

  return "Risk"
}

function statusForChurn(value: number) {
  if (value <= 2.4) {
    return "Healthy"
  }

  if (value <= 4.2) {
    return "Watch"
  }

  return "Risk"
}

function formatMetricValue(metric: SummaryMetric) {
  if (metric.format === "number" && typeof metric.value === "number") {
    return formatNumber(metric.value)
  }

  if (metric.format === "compactCurrency" && typeof metric.value === "number") {
    return formatCompactCurrency(metric.value)
  }

  if (metric.format === "currency" && typeof metric.value === "number") {
    return `$${metric.value.toFixed(1)}`
  }

  if (metric.format === "percent" && typeof metric.value === "number") {
    return `${metric.value.toFixed(1)}%`
  }

  return String(metric.value)
}

function formatCompactCurrency(value: number) {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`
  }

  return `$${(value / 1000).toFixed(1)}K`
}

function compactNumber(value: number) {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`
  }

  return String(value)
}

function formatPercent(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`
}

function formatPoints(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}pp`
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remaining = Math.round(seconds % 60)

  return `${minutes}m ${remaining}s`
}

function toneFromDelta(value: number): DeltaTone {
  if (value > 0) {
    return "positive"
  }

  if (value < 0) {
    return "negative"
  }

  return "neutral"
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function toExportRows<T extends ExportRow>(rows: readonly T[]) {
  return rows.map((row) => ({ ...row }))
}
