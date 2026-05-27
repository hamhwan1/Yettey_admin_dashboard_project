"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
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
import {
  paidAcquisitionSources,
  paidBehaviorIntelligence,
  paidConversionTimeline,
  paidRegionAnalysis,
  paidUserGrowthTrend,
  planDistribution,
  subscriptionLifecycle,
  upgradeDowngradeFlows,
} from "./subscription-data"

type DrawerItem = Record<string, string | number>
type AcquisitionRow = (typeof paidAcquisitionSources)[number]
type RegionRow = (typeof paidRegionAnalysis)[number]
type PlanRow = (typeof planDistribution)[number]
type FlowRow = (typeof upgradeDowngradeFlows)[number]
type LifecycleRow = (typeof subscriptionLifecycle)[number]
type BehaviorRow = (typeof paidBehaviorIntelligence)[number]

export default function SubscriptionIntelligenceDashboard() {
  const [isMounted, setIsMounted] = useState(false)
  const [drawer, setDrawer] = useState<DrawerItem | null>(null)
  const { period, startDate, endDate, compareMode } = useDashboardDateRange()
  const periodMultiplier = getPeriodMultiplier(period)
  const currentGrowthSnapshot =
    paidUserGrowthTrend[paidUserGrowthTrend.length - 1]
  const activePaidUsers = currentGrowthSnapshot.activePaid
  const newPaidUsers = Math.round(
    paidUserGrowthTrend.reduce((sum, row) => sum + row.newPaid, 0) *
      periodMultiplier
  )
  const monthlySubscribers = Math.round(
    planDistribution.reduce((sum, row) => sum + row.monthly, 0)
  )
  const yearlySubscribers = Math.round(
    planDistribution.reduce((sum, row) => sum + row.yearly, 0)
  )
  const churnUsers = Math.round(
    paidUserGrowthTrend.reduce((sum, row) => sum + row.churn, 0) *
      periodMultiplier
  )
  const netPaidGrowth = newPaidUsers - churnUsers
  const topUpgradeFlow = upgradeDowngradeFlows[0]
  const planRows = planDistribution
  const acquisitionRows = useMemo(
    () =>
      paidAcquisitionSources.map((row) => ({
        ...row,
        visitors: Math.round(row.visitors * periodMultiplier),
        paidUsers: Math.round(row.paidUsers * periodMultiplier),
      })),
    [periodMultiplier]
  )
  const bestSource = acquisitionRows.reduce((best, row) =>
    row.paidUsers > best.paidUsers ? row : best
  )
  const exportPayload = useMemo(
    () => ({
      title: "Subscription Intelligence Report",
      subtitle:
        "Subscription analytics report with metric definitions, paid acquisition, plan distribution, upgrade flow, lifecycle, behavior, and churn data.",
      filename: "subscription-intelligence-report",
      filters: {
        "Date range": getDateRangeLabel(startDate, endDate),
        Compare: getCompareModeLabel(compareMode),
      },
      kpis: [
        { label: "Active Paid Users", value: formatNumber(activePaidUsers), detail: "Current paid subscriber base" },
        { label: "New Paid Users", value: formatNumber(newPaidUsers), detail: "New paid conversions" },
        { label: "Net Paid Growth", value: formatNumber(netPaidGrowth), detail: `${formatNumber(newPaidUsers)} - ${formatNumber(churnUsers)}` },
        { label: "Monthly Subscribers", value: formatNumber(monthlySubscribers), detail: "Monthly plans" },
        { label: "Yearly Subscribers", value: formatNumber(yearlySubscribers), detail: "Annual plans" },
        { label: "Churn Users", value: formatNumber(churnUsers), detail: "Cancelled paid users" },
      ],
      charts: [
        {
          title: "Paid User Growth Trend",
          points: paidUserGrowthTrend.map((point) => ({
            label: point.date,
            value: point.activePaid,
            secondary: `${point.netGrowth} net growth`,
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
        {
          title: "Plan Distribution",
          points: planRows.map((plan) => ({
            label: `${plan.service} ${plan.plan}`,
            value: plan.activeSubscribers,
            secondary: `${plan.upgradeRate} upgrade`,
          })),
        },
      ],
      datasets: [
        { name: "Paid Acquisition Intelligence", rows: acquisitionRows },
        { name: "Country Region Paid Analysis", rows: paidRegionAnalysis },
        { name: "Plan Distribution", rows: planRows },
        { name: "Upgrade Downgrade Intelligence", rows: upgradeDowngradeFlows },
        { name: "Subscription Lifecycle", rows: subscriptionLifecycle },
        { name: "Paid User Behavior Intelligence", rows: paidBehaviorIntelligence },
      ],
    }),
    [
      acquisitionRows,
      activePaidUsers,
      churnUsers,
      compareMode,
      endDate,
      monthlySubscribers,
      netPaidGrowth,
      newPaidUsers,
      planRows,
      startDate,
      yearlySubscribers,
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
        description="Subscription, payment, churn, plan, upgrade, and lifecycle metrics with explicit calculation rules."
        actions={<ExportActions payload={exportPayload} />}
      />

      <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
        <DateRangeControl />
      </section>

      <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <MetricDefinitionCard
          label="Active Paid Users"
          value={formatNumber(activePaidUsers)}
          description="현재 활성 구독 상태 유지 사용자"
          calculation={[
            "active subscription",
            "payment valid",
            "canceled/refunded 제외",
          ]}
        />
        <MetricDefinitionCard
          label="New Paid Users"
          value={formatNumber(newPaidUsers)}
          description="선택 기간 내 첫 유료 결제 사용자"
          calculation={["free -> paid", "trial -> paid 포함"]}
        />
        <MetricDefinitionCard
          label="Net Paid Growth"
          value={formatNumber(netPaidGrowth)}
          description="신규 유료 가입 - 이탈 사용자"
          calculation={[
            `${formatNumber(newPaidUsers)} 신규 유료 가입`,
            `${formatNumber(churnUsers)} churn`,
            `= +${formatNumber(netPaidGrowth)}`,
          ]}
        />
        <MetricDefinitionCard
          label="Monthly Subscribers"
          value={formatNumber(monthlySubscribers)}
          description="월간 결제 주기 활성 구독자"
          calculation={["billing_cycle = monthly", "active subscription"]}
        />
        <MetricDefinitionCard
          label="Yearly Subscribers"
          value={formatNumber(yearlySubscribers)}
          description="연간 결제 주기 활성 구독자"
          calculation={["billing_cycle = yearly", "active subscription"]}
        />
        <MetricDefinitionCard
          label="Churn Users"
          value={formatNumber(churnUsers)}
          description="선택 기간 내 유료 구독 이탈 사용자"
          calculation={["cancelled subscription", "expired unpaid", "refund-only 제외"]}
        />
      </div>

      <div className="mb-8 grid gap-4 xl:grid-cols-2">
        <DataFactCard
          title="Highest Paid Acquisition Source"
          primary={bestSource.source}
          rows={[
            ["Visitors", formatNumber(bestSource.visitors)],
            ["Paid Users", formatNumber(bestSource.paidUsers)],
            ["Paid Conversion", bestSource.paidConversion],
          ]}
        />
        <DataFactCard
          title="Top Upgrade Flow"
          primary={topUpgradeFlow.flow}
          rows={[
            ["Upgrade Users", `${formatNumber(topUpgradeFlow.users)} users`],
            ["Average Upgrade Timing", topUpgradeFlow.avgTiming],
            ["Revenue Impact", topUpgradeFlow.revenueImpact],
          ]}
        />
      </div>

      <div className="mb-8 grid gap-6 xl:grid-cols-2">
        {isMounted ? (
          <>
            <ChartCard
              title="Paid User Growth Trend"
              description="New paid users, active paid users, monthly subscribers, yearly subscribers, churn, and net growth."
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={paidUserGrowthTrend}>
                  <CartesianGrid stroke="#eef2f7" vertical={false} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} width={72} />
                  <Tooltip />
                  <Line dataKey="newPaid" stroke="#5b3df5" strokeWidth={2} />
                  <Line dataKey="activePaid" stroke="#0f172a" strokeWidth={2} />
                  <Line dataKey="monthly" stroke="#10b981" strokeWidth={2} />
                  <Line dataKey="yearly" stroke="#f59e0b" strokeWidth={2} />
                  <Line dataKey="churn" stroke="#ef4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="Paid Conversion Timeline"
              description="Distribution and cumulative conversion timing after signup."
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={paidConversionTimeline}>
                  <CartesianGrid stroke="#eef2f7" vertical={false} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} width={72} />
                  <Tooltip />
                  <Bar dataKey="distribution" fill="#c4b5fd" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="cumulative" fill="#5b3df5" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="Plan Distribution"
              description="Active subscribers split by Yettey and VPICK plans."
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={planRows}>
                  <CartesianGrid stroke="#eef2f7" vertical={false} />
                  <XAxis dataKey="plan" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} width={72} />
                  <Tooltip />
                  <Bar dataKey="monthly" fill="#5b3df5" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="yearly" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="Subscription Lifecycle"
              description="Consecutive billing months, renewal rate, churn timing, and lifetime value."
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={subscriptionLifecycle}>
                  <CartesianGrid stroke="#eef2f7" vertical={false} />
                  <XAxis dataKey="age" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} width={72} />
                  <Tooltip />
                  <Area dataKey="subscribers" stroke="#5b3df5" fill="#ede9fe" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </>
        ) : (
          ["Paid User Growth Trend", "Paid Conversion Timeline", "Plan Distribution", "Subscription Lifecycle"].map((title) => (
            <ChartCard key={title} title={title} description="Loading chart preview...">
              <div className="h-full rounded-xl bg-slate-100" />
            </ChartCard>
          ))
        )}
      </div>

      <div className="mb-8">
        <TableBlock title="Paid User Acquisition Intelligence">
          <DataTable
            columns={acquisitionColumns}
            data={acquisitionRows}
            summary={`Showing 1 to ${acquisitionRows.length} of ${acquisitionRows.length} acquisition rows`}
            compactPagination
            onRowClick={(row) => setDrawer(row)}
          />
        </TableBlock>
      </div>

      <div className="mb-8 grid gap-8 xl:grid-cols-2">
        <TableBlock title="Country / Region Paid Analysis">
          <DataTable
            columns={regionColumns}
            data={paidRegionAnalysis}
            summary={`Showing 1 to ${paidRegionAnalysis.length} of ${paidRegionAnalysis.length} countries`}
            compactPagination
            onRowClick={(row) => setDrawer(row)}
          />
        </TableBlock>

        <TableBlock title="Plan Distribution">
          <DataTable
            columns={planColumns}
            data={planRows}
            summary={`Showing 1 to ${planRows.length} of ${planRows.length} plans`}
            compactPagination
            onRowClick={(row) => setDrawer(row)}
          />
        </TableBlock>
      </div>

      <div className="mb-8 grid gap-8 xl:grid-cols-2">
        <TableBlock title="Upgrade / Downgrade Intelligence">
          <DataTable
            columns={flowColumns}
            data={upgradeDowngradeFlows}
            summary={`Showing 1 to ${upgradeDowngradeFlows.length} of ${upgradeDowngradeFlows.length} flows`}
            compactPagination
            onRowClick={(row) => setDrawer(row)}
          />
        </TableBlock>

        <TableBlock title="Subscription Lifecycle">
          <DataTable
            columns={lifecycleColumns}
            data={subscriptionLifecycle}
            summary={`Showing 1 to ${subscriptionLifecycle.length} of ${subscriptionLifecycle.length} lifecycle cohorts`}
            compactPagination
            onRowClick={(row) => setDrawer(row)}
          />
        </TableBlock>
      </div>

      <div className="mb-8">
        <TableBlock title="Paid User Behavior Intelligence">
          <DataTable
            columns={behaviorColumns}
            data={paidBehaviorIntelligence}
            summary={`Showing 1 to ${paidBehaviorIntelligence.length} of ${paidBehaviorIntelligence.length} behavior signals`}
            compactPagination
            onRowClick={(row) => setDrawer(row)}
          />
        </TableBlock>
      </div>

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

function ChartCard({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      <div className="h-72">{children}</div>
    </section>
  )
}

function MetricDefinitionCard({
  label,
  value,
  description,
  calculation,
}: {
  label: string
  value: string
  description: string
  calculation: string[]
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_10px_24px_rgba(15,23,42,0.04)]">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
        {value}
      </p>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
      <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
          Calculation
        </p>
        <ul className="mt-3 space-y-2 text-sm text-slate-700">
          {calculation.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="mt-2 size-1.5 rounded-full bg-slate-400" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function DataFactCard({
  title,
  primary,
  rows,
}: {
  title: string
  primary: string
  rows: [string, string][]
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {title}
      </p>
      <p className="mt-3 text-2xl font-bold tracking-tight text-slate-950">
        {primary}
      </p>
      <div className="mt-5 divide-y divide-slate-100 rounded-xl border border-slate-100">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
          >
            <span className="text-slate-500">{label}</span>
            <span className="font-semibold text-slate-950">{value}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

function TableBlock({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold text-slate-950">{title}</h2>
      {children}
    </section>
  )
}

const acquisitionColumns: DataTableColumn<AcquisitionRow>[] = [
  { key: "source", header: "Source", render: (row) => <span className="font-semibold">{row.source}</span> },
  { key: "group", header: "Group", render: (row) => row.group },
  { key: "utmCampaign", header: "Campaign", render: (row) => row.utmCampaign },
  { key: "visitors", header: "Visitors", render: (row) => formatNumber(row.visitors) },
  { key: "paidUsers", header: "Paid Users", render: (row) => formatNumber(row.paidUsers) },
  { key: "paidConversion", header: "Paid Conv.", render: (row) => <span className="font-semibold text-violet-600">{row.paidConversion}</span> },
  { key: "churnRate", header: "Churn", render: (row) => row.churnRate },
  { key: "retention", header: "Retention", render: (row) => row.retention },
  { key: "arpu", header: "ARPU", render: (row) => row.arpu },
]

const regionColumns: DataTableColumn<RegionRow>[] = [
  { key: "country", header: "Country", render: (row) => <span className="font-semibold">{row.country}</span> },
  { key: "paidUsers", header: "Paid Users", render: (row) => formatNumber(row.paidUsers) },
  { key: "revenue", header: "Revenue", render: (row) => `$${formatNumber(row.revenue)}` },
  { key: "arpu", header: "ARPU", render: (row) => row.arpu },
  { key: "retention", header: "Retention", render: (row) => row.retention },
  { key: "upgradeRate", header: "Upgrade Rate", render: (row) => row.upgradeRate },
]

const planColumns: DataTableColumn<PlanRow>[] = [
  { key: "service", header: "Service", render: (row) => row.service },
  { key: "plan", header: "Plan", render: (row) => <span className="font-semibold">{row.plan}</span> },
  { key: "activeSubscribers", header: "Active Subscribers", render: (row) => formatNumber(row.activeSubscribers) },
  { key: "monthly", header: "Monthly", render: (row) => formatNumber(row.monthly) },
  { key: "yearly", header: "Yearly", render: (row) => formatNumber(row.yearly) },
  { key: "upgradeRate", header: "Upgrade", render: (row) => row.upgradeRate },
  { key: "churnRate", header: "Churn", render: (row) => row.churnRate },
  { key: "avgDuration", header: "Avg Duration", render: (row) => row.avgDuration },
]

const flowColumns: DataTableColumn<FlowRow>[] = [
  { key: "flow", header: "Flow", render: (row) => <span className="font-semibold">{row.flow}</span> },
  { key: "direction", header: "Direction", render: (row) => <StatusBadge tone={row.direction === "Upgrade" ? "success" : "neutral"}>{row.direction}</StatusBadge> },
  { key: "users", header: "Users", render: (row) => formatNumber(row.users) },
  { key: "avgTiming", header: "Avg Timing", render: (row) => row.avgTiming },
  { key: "trigger", header: "Trigger Event", render: (row) => row.trigger },
  { key: "revenueImpact", header: "Revenue Impact", render: (row) => row.revenueImpact },
]

const lifecycleColumns: DataTableColumn<LifecycleRow>[] = [
  { key: "age", header: "Subscription Age", render: (row) => <span className="font-semibold">{row.age}</span> },
  { key: "subscribers", header: "Subscribers", render: (row) => formatNumber(row.subscribers) },
  { key: "renewalRate", header: "Renewal Rate", render: (row) => row.renewalRate },
  { key: "churnTiming", header: "Churn Timing", render: (row) => row.churnTiming },
  { key: "lifetimeValue", header: "Avg Lifetime", render: (row) => row.lifetimeValue },
]

const behaviorColumns: DataTableColumn<BehaviorRow>[] = [
  { key: "behavior", header: "Behavior", render: (row) => <span className="font-semibold">{row.behavior}</span> },
  { key: "users", header: "Users", render: (row) => formatNumber(row.users) },
  { key: "frequency", header: "Frequency", render: (row) => row.frequency },
  { key: "creditConsumption", header: "Credit Usage", render: (row) => row.creditConsumption },
  { key: "upgradeCorrelation", header: "Upgrade Correlation", render: (row) => row.upgradeCorrelation },
]
