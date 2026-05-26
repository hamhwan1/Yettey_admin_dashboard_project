"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
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
  getCompareModeLabel,
  getDateRangeLabel,
  getPeriodMultiplier,
  useDashboardDateRange,
} from "@/lib/dashboard-date-store"
import {
  analyticsBlocks,
  executiveKpis,
  executiveRetentionCohort,
  formatNumber,
  type ExecutiveKpi,
} from "./dashboard-data"

type SummaryMetric = {
  label: string
  value: string | number
  format?: string
  delta: string
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
}

type TopSummaryMetric = {
  label: string
  value: string
  delta: string
  status: ExecutiveKpi["status"]
  href: string
  sparkline: number[]
}

const chartColors = ["#7c3aed", "#3b82f6", "#10b981", "#94a3b8"]

export default function DashboardOverviewClient() {
  const [isMounted, setIsMounted] = useState(false)
  const { period, startDate, endDate, compareMode, resetDateRange } =
    useDashboardDateRange()
  const periodMultiplier = getPeriodMultiplier(period)

  const topSummary = useMemo(
    () =>
      executiveKpis.slice(0, 4).map((metric) => ({
        label: metric.label,
        value: formatExecutiveValue(metric, periodMultiplier),
        delta: metric.delta,
        status: metric.status,
        href: metric.href,
        sparkline: metric.sparkline,
      })),
    [periodMultiplier]
  )

  const userTrend = useMemo(
    () =>
      analyticsBlocks.userGrowth.trend.map((row) => ({
        ...row,
        visitors: Math.round(row.visitors * periodMultiplier),
        signups: Math.round(row.signups * periodMultiplier),
        paidUsers: Math.round(row.paidUsers * periodMultiplier),
        returning: Math.round(row.returning * periodMultiplier),
      })),
    [periodMultiplier]
  )

  const revenueTrend = useMemo(
    () =>
      analyticsBlocks.revenue.trend.map((row) => ({
        ...row,
        mrr: Math.round(row.mrr * periodMultiplier),
        paidUsers: Math.round(row.paidUsers * periodMultiplier),
      })),
    [periodMultiplier]
  )

  const userSummary = useMemo(
    () =>
      analyticsBlocks.userGrowth.summary
        .filter((metric) =>
          ["Visitors", "Signups", "Conversion Rate"].includes(metric.label)
        )
        .map((metric) => ({
          ...metric,
          value:
            typeof metric.value === "number" && metric.format !== "percent"
              ? Math.round(metric.value * periodMultiplier)
              : metric.value,
        })),
    [periodMultiplier]
  )

  const revenueSummary = useMemo(
    () =>
      analyticsBlocks.revenue.summary
        .filter((metric) => ["MRR", "ARPU", "Churn"].includes(metric.label))
        .map((metric) => ({
          ...metric,
          value:
            typeof metric.value === "number" &&
            metric.format !== "currency" &&
            metric.format !== "percent"
              ? Math.round(metric.value * periodMultiplier)
              : metric.value,
        })),
    [periodMultiplier]
  )

  const userBreakdown = useMemo(
    () =>
      analyticsBlocks.userGrowth.breakdown.map((row) => ({
        ...row,
        value: Math.round(row.value * periodMultiplier),
      })),
    [periodMultiplier]
  )

  const exportPayload = useMemo(
    () => ({
      title: "Executive Analytics Block Report",
      subtitle:
        "Block-level overview for top summary, user growth, revenue, Yettey, and VPICK.",
      filename: "executive-analytics-block-report",
      filters: {
        "Date range": getDateRangeLabel(startDate, endDate),
        Compare: getCompareModeLabel(compareMode),
      },
      kpis: [...userSummary, ...revenueSummary].map((metric) => ({
        label: metric.label,
        value: formatMetricValue(metric),
        detail: metric.delta,
      })),
      charts: [
        {
          title: "User Growth Trend",
          points: userTrend.map((row) => ({
            label: row.period,
            value: row.visitors,
            secondary: `${row.signups} signups`,
          })),
        },
        {
          title: "Revenue Trend",
          points: revenueTrend.map((row) => ({
            label: row.period,
            value: row.mrr,
            secondary: `${row.paidUsers} paid users`,
          })),
        },
      ],
      datasets: [
        {
          name: "Top Summary",
          rows: topSummary.map((metric) => ({
            label: metric.label,
            value: metric.value,
            delta: metric.delta,
            status: metric.status,
          })),
        },
        { name: "User Growth Trend", rows: toExportRows(userTrend) },
        { name: "User Mix", rows: toExportRows(userBreakdown) },
        {
          name: "User Growth Related Metrics",
          rows: toExportRows(analyticsBlocks.userGrowth.related),
        },
        { name: "Revenue Trend", rows: toExportRows(revenueTrend) },
        {
          name: "Revenue Movement",
          rows: toExportRows(analyticsBlocks.revenue.related),
        },
        {
          name: "Plan Distribution",
          rows: toExportRows(analyticsBlocks.revenue.plans),
        },
        {
          name: "Yettey Usage Trend",
          rows: toExportRows(analyticsBlocks.yettey.trend),
        },
        {
          name: "VPICK Operations Trend",
          rows: toExportRows(analyticsBlocks.vpick.trend),
        },
      ],
    }),
    [
      compareMode,
      endDate,
      revenueSummary,
      revenueTrend,
      startDate,
      topSummary,
      userBreakdown,
      userSummary,
      userTrend,
    ]
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
        <DateRangeControl compact />
        <button
          className="mt-5 rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 dark:hover:bg-slate-900 dark:hover:text-slate-100"
          onClick={resetDateRange}
        >
          Reset date range
        </button>
      </section>

      <TopSummaryBlock metrics={topSummary} ready={isMounted} />

      <div className="mt-6 space-y-6">
        <ExecutiveAnalyticsBlock
          title="User Growth"
          subtitle="Visitor inflow, signup movement, paid conversion, and retention in one block."
          status={analyticsBlocks.userGrowth.status}
          href={analyticsBlocks.userGrowth.href}
          summary={userSummary}
          chart={
            isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userTrend}>
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
            { label: "Visitors", color: "#7c3aed" },
            { label: "Signups", color: "#3b82f6" },
            { label: "Paid Users", color: "#10b981" },
          ]}
          sidePanel={
            <UserGrowthSidePanel
              ready={isMounted}
              breakdown={userBreakdown}
              related={analyticsBlocks.userGrowth.related}
            />
          }
        />

        <ExecutiveAnalyticsBlock
          title="Revenue"
          subtitle="Recurring revenue, ARPU, churn, payments, upgrades, and plan mix."
          status={analyticsBlocks.revenue.status}
          href={analyticsBlocks.revenue.href}
          summary={revenueSummary}
          chart={
            isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={revenueTrend}>
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
          legend={[{ label: "MRR", color: "#7c3aed" }]}
          sidePanel={
            <RevenueSidePanel
              related={analyticsBlocks.revenue.related}
              plans={analyticsBlocks.revenue.plans}
            />
          }
        />

        <div className="grid gap-6 xl:grid-cols-2">
          <ProductSummaryBlock
            title="Yettey Summary"
            subtitle="Product health summary for DAM, generation, teams, and project activity."
            href={analyticsBlocks.yettey.href}
            status={analyticsBlocks.yettey.status}
            metrics={analyticsBlocks.yettey.summary}
          >
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsBlocks.yettey.trend}>
                  <CartesianGrid stroke="#eef2f7" vertical={false} />
                  <XAxis dataKey="period" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} width={48} />
                  <Tooltip />
                  <Line
                    dataKey="generations"
                    dot={{ r: 3 }}
                    stroke="#7c3aed"
                    strokeWidth={2.5}
                    type="monotone"
                  />
                  <Line
                    dataKey="projects"
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
            title="VPICK Summary"
            subtitle="Product health summary for analysis, shortform generation, credits, and processing time."
            href={analyticsBlocks.vpick.href}
            status={analyticsBlocks.vpick.status}
            metrics={analyticsBlocks.vpick.summary}
          >
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsBlocks.vpick.trend}>
                  <CartesianGrid stroke="#eef2f7" vertical={false} />
                  <XAxis dataKey="period" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} width={48} />
                  <Tooltip />
                  <Line
                    dataKey="analysis"
                    dot={{ r: 3 }}
                    stroke="#7c3aed"
                    strokeWidth={2.5}
                    type="monotone"
                  />
                  <Line
                    dataKey="shortform"
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

function TopSummaryBlock({
  metrics,
  ready,
}: {
  metrics: readonly TopSummaryMetric[]
  ready: boolean
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
              <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950 dark:text-slate-50">
                {metric.value}
              </p>
            </div>
            <ArrowRight className="size-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-violet-600" />
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-600 dark:bg-emerald-500/10">
              <TrendingUp className="size-3" />
              {metric.delta}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Previous period
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
}: {
  title: string
  subtitle: string
  status: string
  href: string
  summary: readonly SummaryMetric[]
  legend: readonly { label: string; color: string }[]
  chart: React.ReactNode
  sidePanel: React.ReactNode
}) {
  return (
    <section className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)] transition-all duration-150 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-[0_2px_4px_rgba(15,23,42,0.08),0_16px_32px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-950">
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
  children,
}: {
  title: string
  subtitle: string
  href: string
  status: string
  metrics: readonly SummaryMetric[]
  children: React.ReactNode
}) {
  return (
    <section className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)] transition-all duration-150 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-[0_2px_4px_rgba(15,23,42,0.08),0_16px_32px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-950">
      <BlockHeader title={title} subtitle={subtitle} status={status} href={href} />
      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricTile key={metric.label} metric={metric} />
        ))}
      </div>
      <div className="mt-5">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
          Usage Trend
        </p>
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
            <p className="text-2xl font-bold tracking-tight text-slate-950 dark:text-slate-50">
              {formatMetricValue(metric)}
            </p>
            <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-600 dark:bg-emerald-500/10">
              {metric.delta}
            </span>
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
      <p className="mt-2 text-xl font-bold tracking-tight text-slate-950 dark:text-slate-50">
        {formatMetricValue(metric)}
      </p>
      <p className="mt-2 inline-flex rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-600 dark:bg-emerald-500/10">
        {metric.delta}
      </p>
    </div>
  )
}

function ChartLegend({
  items,
}: {
  items: readonly { label: string; color: string }[]
}) {
  return (
    <div className="mt-7 flex flex-wrap items-center gap-5">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <span
            className="size-2.5 rounded-full"
            style={{ backgroundColor: item.color }}
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
  related,
}: {
  ready: boolean
  breakdown: readonly BreakdownItem[]
  related: readonly RelatedMetric[]
}) {
  const retentionRows = executiveRetentionCohort.map((row) => ({
    label: row.cohort,
    value: `${row.overall}%`,
  }))

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
        {retentionRows.map((row) => (
          <div key={row.label} className="px-3 first:pl-0 last:pr-0">
            <p className="text-xs font-bold text-slate-500">{row.label}</p>
            <p className="mt-1 text-xl font-bold text-slate-950 dark:text-slate-50">
              {row.value}
            </p>
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
  plans: readonly { plan: string; subscribers: number; share: number }[]
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
            className="h-full"
            style={{
              width: `${plan.share}%`,
              backgroundColor: chartColors[index % chartColors.length],
            }}
            title={`${plan.plan}: ${plan.share}%`}
          />
        ))}
      </div>
      <div className="mt-4 space-y-3">
        {plans.slice(0, 4).map((plan, index) => (
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
            <p className="text-2xl font-bold text-slate-950 dark:text-slate-50">
              {row.value}
            </p>
            <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-600 dark:bg-emerald-500/10">
              {row.detail}
            </span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white dark:bg-slate-950">
            <div
              className="h-full rounded-full bg-violet-600"
              style={{ width: `${row.share}%` }}
            />
          </div>
        </div>
      ))}
    </div>
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

function formatMetricValue(metric: SummaryMetric) {
  if (metric.format === "number" && typeof metric.value === "number") {
    return formatNumber(metric.value)
  }

  if (metric.format === "compactCurrency" && typeof metric.value === "number") {
    return `$${(metric.value / 1000).toFixed(1)}K`
  }

  if (metric.format === "currency" && typeof metric.value === "number") {
    return `$${metric.value.toFixed(1)}`
  }

  if (metric.format === "percent" && typeof metric.value === "number") {
    return `${metric.value.toFixed(1)}%`
  }

  return String(metric.value)
}

function formatExecutiveValue(metric: ExecutiveKpi, multiplier: number) {
  const value =
    metric.format === "currency" || metric.format === "percent"
      ? metric.baseValue
      : metric.baseValue * multiplier

  if (metric.format === "number") {
    return formatNumber(Math.round(value))
  }

  if (metric.format === "compactCurrency") {
    return `$${(value / 1000).toFixed(1)}K`
  }

  if (metric.format === "currency") {
    return `$${value.toFixed(1)}`
  }

  if (metric.format === "percent") {
    return `${value.toFixed(1)}%`
  }

  if (metric.format === "retention" && metric.retention) {
    return `D1 ${metric.retention.d1}% / D7 ${metric.retention.d7}%`
  }

  return String(value)
}

function toExportRows<T extends ExportRow>(rows: readonly T[]) {
  return rows.map((row) => ({ ...row }))
}
