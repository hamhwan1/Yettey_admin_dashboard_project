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
import StatCard from "@/components/admin/StatCard"
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
  const activePaidUsers = Math.round(
    planDistribution.reduce((sum, row) => sum + row.activeSubscribers, 0) *
      periodMultiplier
  )
  const newPaidUsers = Math.round(
    paidUserGrowthTrend.reduce((sum, row) => sum + row.newPaid, 0) *
      periodMultiplier
  )
  const monthlySubscribers = Math.round(
    planDistribution.reduce((sum, row) => sum + row.monthly, 0) *
      periodMultiplier
  )
  const yearlySubscribers = Math.round(
    planDistribution.reduce((sum, row) => sum + row.yearly, 0) *
      periodMultiplier
  )
  const churnUsers = Math.round(
    paidUserGrowthTrend.reduce((sum, row) => sum + row.churn, 0) *
      periodMultiplier
  )
  const netPaidGrowth = Math.round(
    paidUserGrowthTrend.reduce((sum, row) => sum + row.netGrowth, 0) *
      periodMultiplier
  )
  const topUpgradeFlow = upgradeDowngradeFlows[0]
  const bestSource = paidAcquisitionSources[0]
  const planRows = planDistribution.map((row) => ({
    ...row,
    activeSubscribers: Math.round(row.activeSubscribers * periodMultiplier),
    monthly: Math.round(row.monthly * periodMultiplier),
    yearly: Math.round(row.yearly * periodMultiplier),
  }))
  const acquisitionRows = paidAcquisitionSources.map((row) => ({
    ...row,
    paidUsers: Math.round(row.paidUsers * periodMultiplier),
  }))
  const exportPayload = useMemo(
    () => ({
      title: "Subscription Intelligence Report",
      subtitle:
        "Paid conversion, acquisition quality, plan distribution, upgrade flow, lifecycle, behavior, and revenue intelligence report.",
      filename: "subscription-intelligence-report",
      filters: {
        "Date range": getDateRangeLabel(startDate, endDate),
        Compare: getCompareModeLabel(compareMode),
      },
      kpis: [
        { label: "Active Paid Users", value: formatNumber(activePaidUsers), detail: "Current paid subscriber base" },
        { label: "New Paid Users", value: formatNumber(newPaidUsers), detail: "New paid conversions" },
        { label: "Net Paid Growth", value: formatNumber(netPaidGrowth), detail: "New paid minus churn" },
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
        title="Subscription Intelligence Dashboard"
        description="Analyze paid user acquisition, conversion timing, upgrades, retention, payment behavior, and subscription lifecycle."
        actions={<ExportActions payload={exportPayload} />}
      />

      <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
        <DateRangeControl />
      </section>

      <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Active Paid Users"
          value={formatNumber(activePaidUsers)}
          detail="+9.4% vs baseline"
          insight="Growth plan users are driving the strongest active paid expansion."
          href="/dashboard/intelligence/subscriptions?metric=active-paid-users"
          ctaLabel="View active paid detail"
        />
        <StatCard
          label="New Paid Users"
          value={formatNumber(newPaidUsers)}
          detail="New paid conversions"
          insight="Most paid conversions happen between D1 and D7 after signup."
          href="/dashboard/intelligence/subscriptions?metric=new-paid-users"
          ctaLabel="Open conversion timeline"
        />
        <StatCard
          label="Net Paid Growth"
          value={formatNumber(netPaidGrowth)}
          detail="New paid minus churn"
          insight="Net paid growth remains positive despite a small churn spike."
          href="/dashboard/intelligence/subscriptions?metric=net-paid-growth"
          ctaLabel="View net growth"
        />
        <StatCard
          label="Best Paid Source"
          value={bestSource.source}
          detail={`${bestSource.paidConversion} paid conversion`}
          insight="YouTube users convert better and retain longer than paid ad cohorts."
          href="/dashboard/intelligence/acquisition/youtube"
          ctaLabel="Open source detail"
        />
        <StatCard
          label="Top Upgrade Flow"
          value={topUpgradeFlow.flow}
          detail={`${topUpgradeFlow.avgTiming} avg timing`}
          insight="Users who export more than 10 assets upgrade 2.4x more frequently."
          href="/dashboard/intelligence/subscriptions?metric=upgrade-flow"
          ctaLabel="View upgrade flow"
        />
        <StatCard
          label="Churn Users"
          value={formatNumber(churnUsers)}
          detail="Cancelled paid subscribers"
          insight="Paid Ads cohorts churn faster than referral and YouTube cohorts."
          href="/dashboard/intelligence/subscriptions?metric=churn"
          ctaLabel="Open churn analysis"
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

      <section className="rounded-2xl border border-violet-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
        <p className="text-xs font-bold uppercase tracking-wide text-violet-600">
          Subscription Intelligence Insights
        </p>
        <div className="mt-4 grid gap-4 xl:grid-cols-3">
          {[
            "Users who export more than 10 assets upgrade 2.4x more frequently.",
            "VPICK users who complete first AI generation upgrade earlier than browse-only users.",
            "Referral and YouTube cohorts retain longer, while Paid Ads users churn faster.",
          ].map((insight) => (
            <div key={insight} className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-800">
              {insight}
            </div>
          ))}
        </div>
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
