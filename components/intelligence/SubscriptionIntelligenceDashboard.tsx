"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import {
  Area,
  AreaChart,
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

import DataTable, { type DataTableColumn } from "@/components/admin/DataTable"
import DateRangeControl from "@/components/admin/DateRangeControl"
import ExportActions from "@/components/admin/ExportActions"
import PageHeader from "@/components/admin/PageHeader"
import SideDrawer from "@/components/admin/SideDrawer"
import StatusBadge from "@/components/admin/StatusBadge"
import { formatNumber } from "@/components/dashboard/dashboard-data"
import DashboardLayout from "@/components/layout/DashboardLayout"
import {
  getCompareModeLabel,
  getDateRangeLabel,
  getPeriodMultiplier,
  useDashboardDateRange,
} from "@/lib/dashboard-date-store"
import { cn } from "@/lib/utils"
import {
  paidAcquisitionSources,
  paidConversionTimeline,
  paidUserGrowthTrend,
  planDistribution,
  upgradeDowngradeFlows,
} from "./subscription-data"

type DrawerItem = Record<string, string | number>
type AcquisitionRow = (typeof paidAcquisitionSources)[number]
type PlanRow = (typeof planDistribution)[number]
type AcquisitionTab = "source" | "campaign" | "landing"

type SummaryMetric = {
  label: string
  value: string
  delta: string
  tone: "success" | "danger" | "neutral"
  detail: string
  sparkline: number[]
}

type AcquisitionKpi = {
  label: string
  value: string
  detail: string
  tone?: "success" | "danger" | "neutral"
}

type AcquisitionTabConfig = {
  title: string
  description: string
  totalPaidUsers: number
  rows: DrawerItem[]
  columns: DataTableColumn<DrawerItem>[]
  distribution: { label: string; value: number; detail: string }[]
  kpis: AcquisitionKpi[]
  trend: { date: string; primary: number; secondary: number; tertiary: number }[]
}

const palette = ["#7c3aed", "#2563eb", "#10b981", "#f59e0b", "#94a3b8"]

const acquisitionTabs: { id: AcquisitionTab; label: string }[] = [
  { id: "source", label: "Source" },
  { id: "campaign", label: "Campaign / UTM" },
  { id: "landing", label: "Landing Pages" },
]

const paidLandingPages = [
  {
    landingPage: "/pricing",
    intent: "Pricing intent",
    visitors: 18420,
    paidUsers: 821,
    paidConversion: "4.46%",
    mrr: "$18.4K",
    churnRate: "2.9%",
  },
  {
    landingPage: "/vpick-shortform",
    intent: "Creator workflow",
    visitors: 14680,
    paidUsers: 612,
    paidConversion: "4.17%",
    mrr: "$12.9K",
    churnRate: "3.4%",
  },
  {
    landingPage: "/studio",
    intent: "Workspace activation",
    visitors: 22840,
    paidUsers: 704,
    paidConversion: "3.08%",
    mrr: "$16.2K",
    churnRate: "3.1%",
  },
  {
    landingPage: "/ai-video-generator",
    intent: "AI generation",
    visitors: 9360,
    paidUsers: 460,
    paidConversion: "4.91%",
    mrr: "$10.8K",
    churnRate: "2.6%",
  },
  {
    landingPage: "/thumbnail-generator",
    intent: "Image workflow",
    visitors: 8240,
    paidUsers: 318,
    paidConversion: "3.86%",
    mrr: "$7.2K",
    churnRate: "3.8%",
  },
]

export default function SubscriptionIntelligenceDashboard() {
  const [isMounted, setIsMounted] = useState(false)
  const [drawer, setDrawer] = useState<DrawerItem | null>(null)
  const { period, startDate, endDate, compareMode } = useDashboardDateRange()
  const periodMultiplier = getPeriodMultiplier(period)

  const growthRows = useMemo(
    () =>
      paidUserGrowthTrend.map((row) => ({
        ...row,
        newPaid: scale(row.newPaid, periodMultiplier),
        churn: scale(row.churn, periodMultiplier),
        netGrowth: scale(row.netGrowth, periodMultiplier),
      })),
    [periodMultiplier]
  )

  const acquisitionRows = useMemo(
    () =>
      paidAcquisitionSources.map((row) => ({
        ...row,
        visitors: scale(row.visitors, periodMultiplier),
        paidUsers: scale(row.paidUsers, periodMultiplier),
      })),
    [periodMultiplier]
  )

  const landingRows = useMemo(
    () =>
      paidLandingPages.map((row) => ({
        ...row,
        visitors: scale(row.visitors, periodMultiplier),
        paidUsers: scale(row.paidUsers, periodMultiplier),
      })),
    [periodMultiplier]
  )

  const currentGrowthSnapshot = growthRows[growthRows.length - 1]
  const activePaidUsers = currentGrowthSnapshot.activePaid
  const newPaidUsers = growthRows.reduce((sum, row) => sum + row.newPaid, 0)
  const churnUsers = growthRows.reduce((sum, row) => sum + row.churn, 0)
  const netPaidGrowth = newPaidUsers - churnUsers
  const mrr = 95845 * periodMultiplier
  const arpu = 6.38
  const churnRate = 5.1
  const topUpgradeFlow = upgradeDowngradeFlows[0]
  const bestSource = maxBy(acquisitionRows, (row) => row.paidUsers)

  const summaryMetrics: SummaryMetric[] = useMemo(
    () => [
      {
        label: "Active Paid Users",
        value: formatNumber(activePaidUsers),
        delta: "+12.6%",
        tone: "success",
        detail: "active subscription + payment valid",
        sparkline: growthRows.map((row) => row.activePaid),
      },
      {
        label: "New Paid Users",
        value: formatNumber(newPaidUsers),
        delta: "+15.3%",
        tone: "success",
        detail: "first paid conversion in selected period",
        sparkline: growthRows.map((row) => row.newPaid),
      },
      {
        label: "Net Paid Growth",
        value: formatNumber(netPaidGrowth),
        delta: "+18.7%",
        tone: "success",
        detail: `${formatNumber(newPaidUsers)} new - ${formatNumber(churnUsers)} churn`,
        sparkline: growthRows.map((row) => row.netGrowth),
      },
      {
        label: "MRR",
        value: `$${formatNumber(Math.round(mrr))}`,
        delta: "+14.2%",
        tone: "success",
        detail: "monthly recurring revenue",
        sparkline: growthRows.map((row) => row.activePaid * 6.5),
      },
      {
        label: "ARPU",
        value: `$${arpu.toFixed(2)}`,
        delta: "+8.6%",
        tone: "success",
        detail: "revenue per paid user",
        sparkline: [5.6, 5.8, 6.0, 6.1, 6.2, 6.3, arpu],
      },
      {
        label: "Churn Rate",
        value: `${churnRate.toFixed(1)}%`,
        delta: "-1.2pp",
        tone: "danger",
        detail: "cancelled paid users / active paid users",
        sparkline: [6.4, 6.1, 5.8, 5.6, 5.4, 5.2, churnRate],
      },
    ],
    [activePaidUsers, arpu, churnRate, churnUsers, growthRows, mrr, netPaidGrowth, newPaidUsers]
  )

  const exportPayload = useMemo(
    () => ({
      title: "Subscription Executive Analytics Report",
      subtitle:
        "Executive subscription view for paid users, revenue movement, plan mix, and acquisition quality.",
      filename: "subscription-executive-analytics-report",
      filters: {
        "Date range": getDateRangeLabel(startDate, endDate),
        Compare: getCompareModeLabel(compareMode),
      },
      kpis: summaryMetrics.map((metric) => ({
        label: metric.label,
        value: metric.value,
        detail: `${metric.delta} / ${metric.detail}`,
      })),
      charts: [
        {
          title: "Paid Growth Trend",
          points: growthRows.map((point) => ({
            label: point.date,
            value: point.activePaid,
            secondary: `${point.netGrowth} net paid growth`,
          })),
        },
        {
          title: "Paid Conversion Timeline",
          points: paidConversionTimeline.map((point) => ({
            label: point.day,
            value: point.cumulative,
            secondary: `${point.distribution}% distribution`,
          })),
        },
      ],
      datasets: [
        {
          name: "Subscription Summary",
          rows: summaryMetrics.map(({ label, value, delta, detail }) => ({
            label,
            value,
            delta,
            detail,
          })),
        },
        { name: "Paid Growth Trend", rows: growthRows },
        { name: "Paid Conversion Timeline", rows: paidConversionTimeline },
        { name: "Plan Distribution", rows: planDistribution },
        { name: "Acquisition Sources", rows: acquisitionRows },
        { name: "Paid Landing Pages", rows: landingRows },
      ],
    }),
    [
      acquisitionRows,
      compareMode,
      endDate,
      growthRows,
      landingRows,
      startDate,
      summaryMetrics,
    ]
  )

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsMounted(true))

    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <DashboardLayout>
      <PageHeader
        breadcrumbs={[
          { label: "Dashboards" },
          { label: "Intelligence" },
          { label: "Subscriptions" },
        ]}
        eyebrow="Revenue Intelligence"
        title="Subscription Analytics Dashboard"
        description="Executive view for paid users, revenue, churn, plan mix, and acquisition quality."
        actions={<ExportActions payload={exportPayload} />}
      />

      <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
        <DateRangeControl />
      </section>

      <SubscriptionSummary metrics={summaryMetrics} isMounted={isMounted} />

      <RevenueConversionSection
        activePaidUsers={activePaidUsers}
        bestSource={bestSource}
        churnUsers={churnUsers}
        growthRows={growthRows}
        isMounted={isMounted}
        mrr={mrr}
        netPaidGrowth={netPaidGrowth}
        newPaidUsers={newPaidUsers}
        topUpgradeFlow={topUpgradeFlow}
      />

      <div className="mb-8 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <PlanDistributionSection isMounted={isMounted} plans={planDistribution} />
        <AcquisitionSourcesModule
          acquisitionRows={acquisitionRows}
          isMounted={isMounted}
          landingRows={landingRows}
          onRowClick={(row) => setDrawer(row)}
        />
      </div>

      <section className="mb-8 flex flex-col gap-4 rounded-2xl border border-violet-100 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(124,58,237,0.08)] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-slate-950">Need deeper insights?</p>
          <p className="mt-1 text-sm text-slate-500">
            Lifecycle cohorts, upgrade flows, country analysis, and behavior signals are moved to detailed analytics.
          </p>
        </div>
        <button className="inline-flex h-11 items-center justify-center rounded-xl border border-violet-200 px-5 text-sm font-bold text-violet-600 transition hover:bg-violet-50">
          View Detailed Analytics
        </button>
      </section>

      <SideDrawer
        open={Boolean(drawer)}
        title={drawer ? String(Object.values(drawer)[0]) : "Subscription detail"}
        description="Mock subscription intelligence detail. Replace with customer, invoice, cohort, and event-level API data later."
        onClose={() => setDrawer(null)}
      >
        {drawer ? (
          <div className="space-y-4">
            {Object.entries(drawer).map(([key, value]) => (
              <div key={key} className="rounded-xl border border-slate-100 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  {key}
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-950">
                  {String(value)}
                </p>
              </div>
            ))}
          </div>
        ) : null}
      </SideDrawer>
    </DashboardLayout>
  )
}

function SubscriptionSummary({
  metrics,
  isMounted,
}: {
  metrics: SummaryMetric[]
  isMounted: boolean
}) {
  return (
    <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_16px_40px_rgba(15,23,42,0.06)]">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-violet-600 text-sm font-bold text-white">
          1
        </div>
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-950">
            Subscription Summary
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Paid user base, revenue, and churn health at a glance.
          </p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} isMounted={isMounted} />
        ))}
      </div>
    </section>
  )
}

function MetricCard({
  metric,
  isMounted,
}: {
  metric: SummaryMetric
  isMounted: boolean
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            {metric.label}
          </p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
            {metric.value}
          </p>
        </div>
        <StatusBadge tone={metric.tone}>{metric.delta}</StatusBadge>
      </div>
      <p className="mt-3 text-sm font-medium text-slate-500">{metric.detail}</p>
      <div className="mt-4 h-10">
        {isMounted ? (
          <Sparkline values={metric.sparkline} tone={metric.tone} />
        ) : (
          <ChartSkeleton />
        )}
      </div>
    </div>
  )
}

function RevenueConversionSection({
  activePaidUsers,
  bestSource,
  churnUsers,
  growthRows,
  isMounted,
  mrr,
  netPaidGrowth,
  newPaidUsers,
  topUpgradeFlow,
}: {
  activePaidUsers: number
  bestSource: AcquisitionRow
  churnUsers: number
  growthRows: typeof paidUserGrowthTrend
  isMounted: boolean
  mrr: number
  netPaidGrowth: number
  newPaidUsers: number
  topUpgradeFlow: (typeof upgradeDowngradeFlows)[number]
}) {
  return (
    <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_16px_40px_rgba(15,23,42,0.06)]">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-violet-600 text-sm font-bold text-white">
            2
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-950">
              Revenue & Conversion
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Paid growth, conversion timing, funnel quality, and top movement signals.
            </p>
          </div>
        </div>
        <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
          {["Daily", "Weekly", "Monthly"].map((item, index) => (
            <button
              key={item}
              className={cn(
                "h-9 rounded-lg px-4 text-sm font-semibold transition",
                index === 1
                  ? "bg-violet-600 text-white shadow-sm shadow-violet-600/20"
                  : "text-slate-600 hover:bg-white"
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <CompactMetric
          delta="+14.2%"
          isMounted={isMounted}
          label="MRR Trend"
          tone="success"
          value={`$${formatNumber(Math.round(mrr))}`}
          values={growthRows.map((row) => row.activePaid * 6.5)}
        />
        <CompactMetric
          delta="+1.23pp"
          isMounted={isMounted}
          label="Paid Conversion Rate"
          tone="success"
          value="6.51%"
          values={paidConversionTimeline.map((row) => row.cumulative)}
        />
        <CompactMetric
          delta="+18.7%"
          isMounted={isMounted}
          label="Net Paid Growth"
          tone="success"
          value={formatNumber(netPaidGrowth)}
          values={growthRows.map((row) => row.netGrowth)}
        />
        <CompactMetric
          delta="-5.1%"
          isMounted={isMounted}
          label="Churn Users"
          tone="danger"
          value={formatNumber(churnUsers)}
          values={growthRows.map((row) => row.churn)}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <ChartPanel title="Paid Growth Trend">
          {isMounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthRows}>
                <CartesianGrid stroke="#eef2f7" vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={64} />
                <Tooltip />
                <Line dataKey="activePaid" name="Active Paid" stroke="#7c3aed" strokeWidth={3} />
                <Line dataKey="newPaid" name="New Paid" stroke="#2563eb" strokeWidth={2.5} />
                <Line dataKey="churn" name="Churned" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <ChartSkeleton />
          )}
        </ChartPanel>

        <ChartPanel title="Paid Conversion Funnel">
          <PaidConversionFunnel
            activePaidUsers={activePaidUsers}
            newPaidUsers={newPaidUsers}
          />
        </ChartPanel>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <FactPanel
          title="Top Acquisition Source"
          primary={bestSource.source}
          rows={[
            ["Visitors", formatNumber(bestSource.visitors)],
            ["Paid Users", formatNumber(bestSource.paidUsers)],
            ["Paid Conversion", bestSource.paidConversion],
          ]}
        />
        <FactPanel
          title="Top Upgrade Flow"
          primary={topUpgradeFlow.flow}
          rows={[
            ["Upgrade Users", `${formatNumber(topUpgradeFlow.users)} users`],
            ["Average Timing", topUpgradeFlow.avgTiming],
            ["Revenue Impact", topUpgradeFlow.revenueImpact],
          ]}
        />
      </div>
    </section>
  )
}

function PlanDistributionSection({
  isMounted,
  plans,
}: {
  isMounted: boolean
  plans: PlanRow[]
}) {
  const totalSubscribers = plans.reduce((sum, row) => sum + row.activeSubscribers, 0)
  const planMixTrend = buildPlanMixTrend(plans)

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_16px_40px_rgba(15,23,42,0.06)]">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-violet-600 text-sm font-bold text-white">
            3
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-950">
              Plan Distribution
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Current paid user mix and plan movement.
            </p>
          </div>
        </div>
        <StatusBadge tone="neutral">Last 30 Days</StatusBadge>
      </div>

      <div className="grid gap-6 lg:grid-cols-[210px_1fr]">
        <div className="relative h-56">
          {isMounted ? (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={plans}
                    dataKey="activeSubscribers"
                    innerRadius={72}
                    outerRadius={98}
                    paddingAngle={3}
                  >
                    {plans.map((plan, index) => (
                      <Cell key={plan.plan} fill={palette[index % palette.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatNumber(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-slate-950">
                  {formatNumber(totalSubscribers)}
                </span>
                <span className="text-xs font-bold text-slate-500">
                  Total Paid Users
                </span>
              </div>
            </>
          ) : (
            <ChartSkeleton />
          )}
        </div>

        <div className="space-y-3">
          {plans.map((plan, index) => {
            const share = (plan.activeSubscribers / Math.max(totalSubscribers, 1)) * 100

            return (
              <div key={`${plan.service}-${plan.plan}`}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className="size-2.5 rounded-sm"
                      style={{ backgroundColor: palette[index % palette.length] }}
                    />
                    <span className="font-semibold text-slate-800">
                      {plan.plan}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-950">
                      {formatNumber(plan.activeSubscribers)}
                    </span>
                    <span className="ml-2 text-xs font-semibold text-slate-500">
                      {share.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${share}%`,
                      backgroundColor: palette[index % palette.length],
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-6">
        <p className="mb-3 text-sm font-semibold text-slate-950">
          Plan Mix Over Time
        </p>
        <div className="h-48">
          {isMounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={planMixTrend}>
                <CartesianGrid stroke="#eef2f7" vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} />
                <YAxis tickFormatter={(value) => `${value}%`} tickLine={false} axisLine={false} width={48} />
                <Tooltip />
                {plans.map((plan, index) => (
                  <Area
                    key={plan.plan}
                    dataKey={plan.plan}
                    fill={palette[index % palette.length]}
                    stackId="plans"
                    stroke={palette[index % palette.length]}
                    type="monotone"
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <ChartSkeleton />
          )}
        </div>
      </div>
    </section>
  )
}

function AcquisitionSourcesModule({
  acquisitionRows,
  isMounted,
  landingRows,
  onRowClick,
}: {
  acquisitionRows: AcquisitionRow[]
  isMounted: boolean
  landingRows: DrawerItem[]
  onRowClick: (row: DrawerItem) => void
}) {
  const [activeTab, setActiveTab] = useState<AcquisitionTab>("source")
  const config = useMemo(
    () => buildAcquisitionConfig(activeTab, acquisitionRows, landingRows),
    [activeTab, acquisitionRows, landingRows]
  )

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_16px_40px_rgba(15,23,42,0.06)]">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-violet-600 text-sm font-bold text-white">
            4
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-950">
              Acquisition Sources
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Paid user quality by source, campaign, and landing page.
            </p>
          </div>
        </div>
        <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
          {acquisitionTabs.map((tab) => (
            <button
              key={tab.id}
              className={cn(
                "h-9 rounded-lg px-3 text-sm font-semibold transition",
                activeTab === tab.id
                  ? "bg-violet-600 text-white shadow-sm shadow-violet-600/20"
                  : "text-slate-600 hover:bg-white"
              )}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_220px]">
        <div>
          <p className="mb-4 text-sm font-semibold text-slate-950">
            {config.title}
          </p>
          <div className="space-y-4">
            {config.distribution.map((row) => {
              const share = (row.value / Math.max(config.totalPaidUsers, 1)) * 100

              return (
                <div key={row.label}>
                  <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                    <span className="font-semibold text-slate-700">{row.label}</span>
                    <span className="font-bold text-slate-950">
                      {formatNumber(row.value)} ({share.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-violet-600"
                      style={{ width: `${share}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="relative h-56">
          {isMounted ? (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={config.distribution}
                    dataKey="value"
                    innerRadius={68}
                    outerRadius={96}
                    paddingAngle={3}
                  >
                    {config.distribution.map((row, index) => (
                      <Cell key={row.label} fill={palette[index % palette.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatNumber(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-slate-950">
                  {formatNumber(config.totalPaidUsers)}
                </span>
                <span className="text-xs font-bold text-slate-500">
                  Paid Users
                </span>
              </div>
            </>
          ) : (
            <ChartSkeleton />
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {config.kpis.map((metric) => (
          <div key={metric.label} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              {metric.label}
            </p>
            <p className="mt-2 text-xl font-bold text-slate-950">{metric.value}</p>
            <p className="mt-1 text-sm text-slate-500">{metric.detail}</p>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <DataTable
          columns={config.columns}
          data={config.rows}
          summary={`Showing 1 to ${config.rows.length} of ${config.rows.length} rows`}
          compactPagination
          onRowClick={onRowClick}
        />
      </div>
    </section>
  )
}

function CompactMetric({
  delta,
  isMounted,
  label,
  tone,
  value,
  values,
}: {
  delta: string
  isMounted: boolean
  label: string
  tone: "success" | "danger" | "neutral"
  value: string
  values: number[]
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <div className="mt-3 flex items-end justify-between gap-4">
        <div>
          <p className="text-2xl font-bold text-slate-950">{value}</p>
          <StatusBadge tone={tone}>{delta}</StatusBadge>
        </div>
        <div className="h-10 w-24">
          {isMounted ? <Sparkline values={values} tone={tone} /> : <ChartSkeleton />}
        </div>
      </div>
    </div>
  )
}

function ChartPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-5">
      <h3 className="mb-4 text-sm font-semibold text-slate-950">{title}</h3>
      <div className="h-80">{children}</div>
    </div>
  )
}

function PaidConversionFunnel({
  activePaidUsers,
  newPaidUsers,
}: {
  activePaidUsers: number
  newPaidUsers: number
}) {
  const rows = [
    { label: "Visitors", value: 112540, rate: "100%", width: 100 },
    { label: "Signups", value: 23476, rate: "20.8%", width: 72 },
    { label: "Paid Users", value: newPaidUsers, rate: "39.2%", width: 46 },
    { label: "Conversion Rate", value: 6.51, rate: "6.51%", width: 18 },
  ]

  return (
    <div className="grid h-full gap-5 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="space-y-4 self-center">
        {rows.map((row) => (
          <div key={row.label} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  {row.label}
                </p>
                <p className="mt-1 text-xl font-bold text-slate-950">
                  {typeof row.value === "number" && row.value > 100
                    ? formatNumber(row.value)
                    : row.value}
                </p>
              </div>
              <span className="text-sm font-bold text-slate-600">{row.rate}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center justify-center gap-2">
        {rows.map((row, index) => (
          <div
            key={row.label}
            className="h-14 rounded-sm bg-violet-500/70"
            style={{
              width: `${row.width}%`,
              clipPath:
                index === rows.length - 1
                  ? "polygon(42% 0, 58% 0, 58% 100%, 42% 100%)"
                  : "polygon(10% 0, 90% 0, 78% 100%, 22% 100%)",
              opacity: 1 - index * 0.12,
            }}
            title={`${row.label}: ${row.rate}`}
          />
        ))}
        <p className="mt-2 text-xs font-semibold text-slate-500">
          Current active paid users: {formatNumber(activePaidUsers)}
        </p>
      </div>
    </div>
  )
}

function FactPanel({
  title,
  primary,
  rows,
}: {
  title: string
  primary: string
  rows: [string, string][]
}) {
  return (
    <div className="rounded-2xl border border-slate-200 p-5">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {title}
      </p>
      <p className="mt-2 text-2xl font-bold text-slate-950">{primary}</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {rows.map(([label, value]) => (
          <div key={label} className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs font-bold text-slate-500">{label}</p>
            <p className="mt-1 text-sm font-semibold text-slate-950">{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function Sparkline({
  values,
  tone,
}: {
  values: number[]
  tone: "success" | "danger" | "neutral"
}) {
  const data = values.map((value, index) => ({ index, value }))
  const stroke = tone === "danger" ? "#ef4444" : tone === "success" ? "#10b981" : "#7c3aed"

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <XAxis dataKey="index" hide />
        <YAxis hide domain={["dataMin", "dataMax"]} />
        <Line dataKey="value" dot={false} stroke={stroke} strokeWidth={2.5} type="monotone" />
      </LineChart>
    </ResponsiveContainer>
  )
}

function ChartSkeleton() {
  return <div className="h-full rounded-xl bg-slate-100" />
}

function buildPlanMixTrend(plans: PlanRow[]) {
  const dates = ["Apr 27", "May 4", "May 11", "May 18", "May 25"]
  const total = plans.reduce((sum, row) => sum + row.activeSubscribers, 0)

  return dates.map((date, dateIndex) => {
    const row: Record<string, string | number> = { date }

    plans.forEach((plan, planIndex) => {
      const baseShare = (plan.activeSubscribers / total) * 100
      row[plan.plan] = Math.max(
        2,
        Number((baseShare + dateIndex * (0.6 - planIndex * 0.12)).toFixed(1))
      )
    })

    return row
  })
}

function buildAcquisitionConfig(
  tab: AcquisitionTab,
  acquisitionRows: AcquisitionRow[],
  landingRows: DrawerItem[]
): AcquisitionTabConfig {
  if (tab === "campaign") {
    const rows = acquisitionRows.map((row) => ({
      campaign: row.utmCampaign,
      source: row.source,
      paidUsers: row.paidUsers,
      paidConversion: row.paidConversion,
      churnRate: row.churnRate,
      arpu: row.arpu,
    }))
    const best = maxBy(rows, (row) => Number(row.paidConversion.replace("%", "")))
    const totalPaidUsers = rows.reduce((sum, row) => sum + row.paidUsers, 0)

    return {
      title: "Top Campaigns by Paid Users",
      description: "Campaign paid conversion and churn quality.",
      totalPaidUsers,
      rows,
      columns: campaignColumns,
      distribution: rows.map((row) => ({
        label: String(row.campaign),
        value: Number(row.paidUsers),
        detail: String(row.paidConversion),
      })),
      kpis: [
        { label: "Best Campaign", value: String(best.campaign), detail: best.paidConversion },
        { label: "Top Source", value: String(best.source), detail: `${formatNumber(best.paidUsers)} users` },
        { label: "Campaign Churn", value: best.churnRate, detail: "best campaign" },
      ],
      trend: [],
    }
  }

  if (tab === "landing") {
    const best = maxBy(landingRows, (row) => Number(String(row.paidConversion).replace("%", "")))
    const totalPaidUsers = landingRows.reduce((sum, row) => sum + Number(row.paidUsers), 0)

    return {
      title: "Top Landing Pages by Paid Users",
      description: "Landing pages that convert visitors into paid subscribers.",
      totalPaidUsers,
      rows: landingRows,
      columns: landingColumns,
      distribution: landingRows.map((row) => ({
        label: String(row.landingPage),
        value: Number(row.paidUsers),
        detail: String(row.paidConversion),
      })),
      kpis: [
        { label: "Top Landing Page", value: String(best.landingPage), detail: `${formatNumber(Number(best.paidUsers))} users` },
        { label: "Paid Conversion", value: String(best.paidConversion), detail: String(best.intent) },
        { label: "MRR", value: String(best.mrr), detail: "top landing" },
      ],
      trend: [],
    }
  }

  const best = maxBy(acquisitionRows, (row) => row.paidUsers)
  const totalPaidUsers = acquisitionRows.reduce((sum, row) => sum + row.paidUsers, 0)

  return {
    title: "Top Acquisition Sources by Paid Users",
    description: "Source-level paid conversion and retention.",
    totalPaidUsers,
    rows: acquisitionRows,
    columns: sourceColumns,
    distribution: acquisitionRows.map((row) => ({
      label: row.source,
      value: row.paidUsers,
      detail: row.paidConversion,
    })),
    kpis: [
      { label: "Top Source", value: best.source, detail: `${formatNumber(best.paidUsers)} users` },
      { label: "Paid Conversion", value: best.paidConversion, detail: best.utmCampaign },
      { label: "Retention", value: best.retention, detail: best.group },
    ],
    trend: [],
  }
}

function maxBy<T>(rows: T[], getValue: (row: T) => number) {
  return rows.reduce((best, row) => (getValue(row) > getValue(best) ? row : best))
}

function scale(value: number, multiplier: number) {
  return Math.round(value * multiplier)
}

const sourceColumns: DataTableColumn<DrawerItem>[] = [
  { key: "source", header: "Source", render: (row) => <span className="font-semibold">{row.source}</span> },
  { key: "group", header: "Group", render: (row) => row.group },
  { key: "utmCampaign", header: "Campaign", render: (row) => row.utmCampaign },
  { key: "visitors", header: "Visitors", render: (row) => formatNumber(Number(row.visitors)) },
  { key: "paidUsers", header: "Paid Users", render: (row) => formatNumber(Number(row.paidUsers)) },
  { key: "paidConversion", header: "Paid Conv.", render: (row) => <span className="font-semibold text-violet-600">{row.paidConversion}</span> },
  { key: "churnRate", header: "Churn", render: (row) => row.churnRate },
]

const campaignColumns: DataTableColumn<DrawerItem>[] = [
  { key: "campaign", header: "Campaign", render: (row) => <span className="font-semibold">{row.campaign}</span> },
  { key: "source", header: "Source", render: (row) => row.source },
  { key: "paidUsers", header: "Paid Users", render: (row) => formatNumber(Number(row.paidUsers)) },
  { key: "paidConversion", header: "Paid Conv.", render: (row) => <span className="font-semibold text-violet-600">{row.paidConversion}</span> },
  { key: "churnRate", header: "Churn", render: (row) => row.churnRate },
  { key: "arpu", header: "ARPU", render: (row) => row.arpu },
]

const landingColumns: DataTableColumn<DrawerItem>[] = [
  { key: "landingPage", header: "Landing Page", render: (row) => <span className="font-semibold">{row.landingPage}</span> },
  { key: "intent", header: "Intent", render: (row) => row.intent },
  { key: "visitors", header: "Visitors", render: (row) => formatNumber(Number(row.visitors)) },
  { key: "paidUsers", header: "Paid Users", render: (row) => formatNumber(Number(row.paidUsers)) },
  { key: "paidConversion", header: "Paid Conv.", render: (row) => <span className="font-semibold text-violet-600">{row.paidConversion}</span> },
  { key: "mrr", header: "MRR", render: (row) => row.mrr },
  { key: "churnRate", header: "Churn", render: (row) => row.churnRate },
]
