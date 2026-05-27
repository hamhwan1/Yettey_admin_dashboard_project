"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
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
import {
  AlertTriangle,
  BarChart3,
  ChartPie,
  DollarSign,
  FileText,
  Megaphone,
  RefreshCcw,
  Target,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react"

import DateRangeControl from "@/components/admin/DateRangeControl"
import ExportActions from "@/components/admin/ExportActions"
import PageHeader from "@/components/admin/PageHeader"
import ServiceSegmentFilter from "@/components/admin/ServiceSegmentFilter"
import SideDrawer from "@/components/admin/SideDrawer"
import StatusBadge from "@/components/admin/StatusBadge"
import { formatNumber } from "@/components/dashboard/dashboard-data"
import DashboardLayout from "@/components/layout/DashboardLayout"
import {
  type DashboardCompareMode,
  getCompareModeLabel,
  getDateRangeLabel,
  getPeriodMultiplier,
  useDashboardDateRange,
} from "@/lib/dashboard-date-store"
import {
  type DashboardService,
  useDashboardServiceFilter,
} from "@/lib/dashboard-service-store"
import {
  compareBaseline,
  getCompareDelta,
  getPeriodBuckets,
} from "@/lib/mock-analytics-engine"
import {
  type CurrentPlanName,
  formatKrw,
  getPlanPrice,
} from "@/lib/pricing-plans"
import { cn } from "@/lib/utils"
import {
  paidAcquisitionSources,
  paidConversionTimeline,
  paidUserGrowthTrend,
  planDistribution,
} from "./subscription-data"

type DrawerItem = Record<string, string | number>
type GrowthRow = (typeof paidUserGrowthTrend)[number]
type AcquisitionRow = (typeof paidAcquisitionSources)[number]
type PlanRow = (typeof planDistribution)[number]
type RevenueTab = "revenue" | "paidUsers" | "churn" | "conversion"
type CompositionTab = "plans" | "sources" | "campaigns" | "landing"

type RecentPayment = {
  time: string
  user: string
  plan: string
  amount: number
  status: "Paid" | "Failed"
  method: string
}

type TableColumn<T extends DrawerItem> = {
  header: string
  render: (row: T) => ReactNode
}

const chartColors = ["#7c3aed", "#2563eb", "#10b981", "#f59e0b", "#94a3b8"]
const priorityPlans = ["Starter", "Growth", "Pro"]

const revenueTabs: { id: RevenueTab; label: string; icon: typeof BarChart3 }[] = [
  { id: "revenue", label: "Revenue", icon: TrendingUp },
  { id: "paidUsers", label: "Paid Users", icon: Users },
  { id: "churn", label: "Churn", icon: RefreshCcw },
  { id: "conversion", label: "Conversion", icon: Target },
]

const compositionTabs: {
  id: CompositionTab
  label: string
  icon: typeof ChartPie
}[] = [
  { id: "plans", label: "Plans", icon: ChartPie },
  { id: "sources", label: "Acquisition Sources", icon: Users },
  { id: "campaigns", label: "Campaigns / UTM", icon: Megaphone },
  { id: "landing", label: "Landing Pages", icon: FileText },
]

const paidLandingPages = [
  {
    landingPage: "/pricing",
    intent: "Pricing intent",
    visitors: 18420,
    paidUsers: 821,
    paidConversion: "4.46%",
    revenue: 18400000,
    churnRate: "2.9%",
  },
  {
    landingPage: "/vpick-shortform",
    intent: "Creator workflow",
    visitors: 14680,
    paidUsers: 612,
    paidConversion: "4.17%",
    revenue: 12900000,
    churnRate: "3.4%",
  },
  {
    landingPage: "/studio",
    intent: "Workspace activation",
    visitors: 22840,
    paidUsers: 704,
    paidConversion: "3.08%",
    revenue: 16200000,
    churnRate: "3.1%",
  },
  {
    landingPage: "/ai-video-generator",
    intent: "AI generation",
    visitors: 9360,
    paidUsers: 460,
    paidConversion: "4.91%",
    revenue: 10800000,
    churnRate: "2.6%",
  },
  {
    landingPage: "/thumbnail-generator",
    intent: "Image workflow",
    visitors: 8240,
    paidUsers: 318,
    paidConversion: "3.86%",
    revenue: 7200000,
    churnRate: "3.8%",
  },
]

const subscriptionServiceProfiles: Record<
  DashboardService,
  {
    activeFactor: number
    newPaidFactor: number
    churnFactor: number
    failedPaymentFactor: number
    refundRate: number
    sourceBias: Record<string, number>
    landingBias: Record<string, number>
  }
> = {
  Overall: {
    activeFactor: 1,
    churnFactor: 1,
    failedPaymentFactor: 1,
    landingBias: {},
    newPaidFactor: 1,
    refundRate: 0.096,
    sourceBias: {},
  },
  Yettey: {
    activeFactor: 0.796,
    churnFactor: 0.68,
    failedPaymentFactor: 0.62,
    landingBias: {
      "/ai-video-generator": 0.74,
      "/pricing": 1.18,
      "/studio": 1.24,
      "/thumbnail-generator": 1.12,
      "/vpick-shortform": 0.52,
    },
    newPaidFactor: 0.72,
    refundRate: 0.082,
    sourceBias: {
      Direct: 1.12,
      "Google Search": 1.18,
      Instagram: 0.78,
      "Paid Ads": 0.74,
      Referral: 1.16,
      YouTube: 0.82,
    },
  },
  VPICK: {
    activeFactor: 0.204,
    churnFactor: 0.32,
    failedPaymentFactor: 0.38,
    landingBias: {
      "/ai-video-generator": 1.26,
      "/pricing": 0.86,
      "/studio": 0.72,
      "/thumbnail-generator": 0.9,
      "/vpick-shortform": 1.48,
    },
    newPaidFactor: 0.28,
    refundRate: 0.124,
    sourceBias: {
      Direct: 0.82,
      "Google Search": 0.78,
      Instagram: 1.2,
      "Paid Ads": 1.18,
      Referral: 0.86,
      YouTube: 1.34,
    },
  },
}

const paymentUsers = [
  "minjun.kim@example.com",
  "jina.park@example.com",
  "seoho.lee@example.com",
  "danyang.choi@example.com",
  "hyunwoo.yoon@example.com",
  "minseo.kang@example.com",
  "soyoung.han@example.com",
  "jiwon.oh@example.com",
]

export default function SubscriptionIntelligenceDashboard() {
  const [isMounted, setIsMounted] = useState(false)
  const [drawer, setDrawer] = useState<DrawerItem | null>(null)
  const { period, startDate, endDate, compareMode, resetDateRange } =
    useDashboardDateRange()
  const { resetService, service, setService } = useDashboardServiceFilter()
  const periodMultiplier = getPeriodMultiplier(period)
  const serviceProfile = subscriptionServiceProfiles[service]
  const trendBuckets = useMemo(
    () =>
      getPeriodBuckets({
        compareMode,
        endDate,
        period,
        service,
        startDate,
      }),
    [compareMode, endDate, period, service, startDate]
  )
  const paidDelta = getCompareDelta(compareMode, "paidUsers")
  const revenueDelta = getCompareDelta(compareMode, "revenue")
  const churnDelta = getCompareDelta(compareMode, "churn")

  const growthRows = useMemo(
    () =>
      trendBuckets.map((bucket, index) => {
        const row = paidUserGrowthTrend[index % paidUserGrowthTrend.length]
        const bucketShare = bucket.share * 7
        const activePaid = scale(
          row.activePaid,
          serviceProfile.activeFactor * bucket.level
        )
        const newPaid = scale(
          row.newPaid,
          serviceProfile.newPaidFactor * bucketShare * (1 + paidDelta / 420)
        )
        const churn = scale(
          row.churn,
          serviceProfile.churnFactor *
            bucketShare *
            (1 + Math.max(churnDelta, -4) / 100)
        )

        return {
          ...row,
          activePaid,
          churn,
          date: bucket.label,
          monthly: scale(row.monthly, serviceProfile.activeFactor * bucket.level),
          netGrowth: newPaid - churn,
          newPaid,
          previousActivePaid: compareBaseline(activePaid, paidDelta),
          yearly: scale(row.yearly, serviceProfile.activeFactor * bucket.level),
        }
      }),
    [churnDelta, paidDelta, serviceProfile, trendBuckets]
  )

  const acquisitionRows = useMemo(
    () =>
      paidAcquisitionSources.map((row) => {
        const bias = serviceProfile.sourceBias[row.source] ?? 1
        const visitors = scale(row.visitors, periodMultiplier * serviceProfile.activeFactor * bias * (1 + paidDelta / 520))
        const paidUsers = scale(row.paidUsers, periodMultiplier * serviceProfile.newPaidFactor * bias * (1 + paidDelta / 260))
        const paidConversion = (paidUsers / Math.max(visitors, 1)) * 100
        const retention = clamp(
          percentValue(row.retention) * (0.92 + serviceProfile.activeFactor * 0.08),
          24,
          72
        )
        const churnRate = clamp(
          percentValue(row.churnRate) * (1.08 - serviceProfile.activeFactor * 0.08),
          1.6,
          7.2
        )

        return {
          ...row,
          arpu: currency(parseCurrency(row.arpu) * (0.82 + serviceProfile.activeFactor * 0.18)),
          churnRate: `${churnRate.toFixed(1)}%`,
          paidConversion: `${paidConversion.toFixed(2)}%`,
          paidUsers,
          retention: `${retention.toFixed(0)}%`,
          visitors,
        }
      }),
    [paidDelta, periodMultiplier, serviceProfile]
  )

  const landingRows = useMemo(
    () =>
      paidLandingPages.map((row) => {
        const bias = serviceProfile.landingBias[row.landingPage] ?? 1
        const visitors = scale(row.visitors, periodMultiplier * serviceProfile.activeFactor * bias * (1 + paidDelta / 520))
        const paidUsers = scale(row.paidUsers, periodMultiplier * serviceProfile.newPaidFactor * bias * (1 + paidDelta / 260))
        const revenue = scale(row.revenue, periodMultiplier * serviceProfile.activeFactor * bias * (1 + revenueDelta / 260))
        const paidConversion = (paidUsers / Math.max(visitors, 1)) * 100
        const churnRate = clamp(
          percentValue(row.churnRate) * (1.08 - serviceProfile.activeFactor * 0.08),
          1.6,
          7.2
        )

        return {
          ...row,
          churnRate: `${churnRate.toFixed(1)}%`,
          paidConversion: `${paidConversion.toFixed(2)}%`,
          paidUsers,
          revenue,
          visitors,
        }
      }),
    [paidDelta, periodMultiplier, revenueDelta, serviceProfile]
  )

  const planRows = useMemo(
    () => buildPlanRows(planDistribution, service, compareMode, periodMultiplier),
    [compareMode, periodMultiplier, service]
  )
  const activePaidUsers = planRows.reduce((sum, row) => sum + row.activePaidUsers, 0)
  const newPaidUsers = growthRows.reduce((sum, row) => sum + row.newPaid, 0)
  const churnUsers = growthRows.reduce((sum, row) => sum + row.churn, 0)
  const netPaidGrowth = newPaidUsers - churnUsers
  const totalRevenue = Math.round(
    planRows.reduce((sum, row) => sum + row.revenue, 0) * periodMultiplier
  )
  const arpu = totalRevenue / Math.max(activePaidUsers, 1)
  const failedPayments = Math.round(674 * periodMultiplier * serviceProfile.failedPaymentFactor)
  const totalRefunds = Math.round(totalRevenue * serviceProfile.refundRate)
  const grossRevenue = totalRevenue + totalRefunds

  const recentPayments = useMemo(
    () =>
      Array.from({ length: 8 }, (_, index): RecentPayment => {
        const plan = planRows[index % planRows.length]

        return {
          time: `2026-05-${String(27 - Math.floor(index / 2)).padStart(2, "0")} ${["14:32", "13:18", "11:05", "10:22", "09:44", "08:30", "07:58", "07:22"][index]}`,
          user: paymentUsers[index % paymentUsers.length],
          plan: plan.plan,
          amount: Math.round(plan.arpu),
          status: index === 4 ? "Failed" : "Paid",
          method: "Card",
        }
      }),
    [planRows]
  )

  const exportPayload = useMemo(
    () => ({
      title: "Subscription Executive Dashboard Report",
      subtitle:
        "Executive subscription report covering paid user growth, revenue, churn, plan mix, acquisition quality, and recent payments.",
      filename: "subscription-executive-dashboard-report",
      filters: {
        Service: service,
        "Date range": getDateRangeLabel(startDate, endDate),
        Compare: getCompareModeLabel(compareMode),
      },
      kpis: [
        {
          label: "Active Paid Users",
          value: formatNumber(activePaidUsers),
          detail: "Active subscription + valid payment",
        },
        {
          label: "New Paid Users",
          value: formatNumber(newPaidUsers),
          detail: "First paid users in selected period",
        },
        {
          label: "Net Paid Growth",
          value: formatNumber(netPaidGrowth),
          detail: "New paid users - churn users",
        },
        {
          label: "ARPU",
          value: currency(arpu),
          detail: "Revenue / active paid users",
        },
        {
          label: "Failed Payments",
          value: formatNumber(failedPayments),
          detail: "Payment failure count",
        },
      ],
      charts: [
        {
          title: "Paid User Growth",
          points: growthRows.map((row) => ({
            label: row.date,
            value: row.activePaid,
            secondary: `${row.netGrowth} net paid growth`,
          })),
        },
        {
          title: "Plan Mix",
          points: planRows.map((row) => ({
            label: row.plan,
            value: row.activePaidUsers,
            secondary: currency(row.revenue),
          })),
        },
      ],
      datasets: [
        { name: "Paid User Growth", rows: growthRows },
        { name: "Plan Composition", rows: planRows },
        { name: "Acquisition Sources", rows: acquisitionRows },
        { name: "Landing Pages", rows: landingRows },
        { name: "Recent Payments", rows: recentPayments },
      ],
    }),
    [
      activePaidUsers,
      acquisitionRows,
      arpu,
      compareMode,
      endDate,
      failedPayments,
      growthRows,
      landingRows,
      netPaidGrowth,
      newPaidUsers,
      planRows,
      recentPayments,
      service,
      startDate,
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
          { label: "Revenue" },
          { label: "Subscriptions" },
        ]}
        title="Subscription Analytics Dashboard"
        description="Track paid subscription performance, churn, acquisition quality, and revenue health."
        actions={<ExportActions payload={exportPayload} />}
      />

      <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
        <ServiceSegmentFilter service={service} onChange={setService} />
        <div className="mt-5">
          <DateRangeControl />
        </div>
        <button
          className="mt-5 rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
          onClick={() => {
            resetService()
            resetDateRange()
          }}
          type="button"
        >
          Reset filters
        </button>
      </section>

      <section className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06),0_16px_40px_rgba(15,23,42,0.06)]">
        <div className="grid divide-y divide-slate-100 lg:grid-cols-3 lg:divide-x lg:divide-y-0 2xl:grid-cols-5">
          <MetricCard
            detail="Active subscription + valid payment"
            icon={<Users className="size-5" />}
            label="Active Paid Users"
            onClick={() =>
              setDrawer({
                label: "Active Paid Users",
                value: formatNumber(activePaidUsers),
                calculation: "active subscription + payment valid",
              })
            }
            tone="violet"
            value={formatNumber(activePaidUsers)}
          />
          <MetricCard
            detail="First paid users in period"
            icon={<UserPlus className="size-5" />}
            label="New Paid Users"
            onClick={() =>
              setDrawer({
                label: "New Paid Users",
                value: formatNumber(newPaidUsers),
                calculation: "free/trial users converted to paid",
              })
            }
            tone="blue"
            value={formatNumber(newPaidUsers)}
          />
          <MetricCard
            detail="New Paid - Churn Users"
            icon={<TrendingUp className="size-5" />}
            label="Net Paid Growth"
            onClick={() =>
              setDrawer({
                label: "Net Paid Growth",
                value: formatNumber(netPaidGrowth),
                calculation: `${formatNumber(newPaidUsers)} new - ${formatNumber(churnUsers)} churn`,
              })
            }
            tone="green"
            value={formatNumber(netPaidGrowth)}
          />
          <MetricCard
            detail="Revenue / Active Paid Users"
            icon={<DollarSign className="size-5" />}
            label="ARPU"
            onClick={() =>
              setDrawer({
                label: "ARPU",
                value: currency(arpu),
                calculation: `${currency(totalRevenue)} / ${formatNumber(activePaidUsers)} active paid users`,
              })
            }
            tone="amber"
            value={currency(arpu)}
          />
          <MetricCard
            detail="Payment failure count"
            icon={<AlertTriangle className="size-5" />}
            label="Failed Payments"
            onClick={() =>
              setDrawer({
                label: "Failed Payments",
                value: formatNumber(failedPayments),
                calculation: "failed card and invoice payment attempts",
              })
            }
            tone="rose"
            value={formatNumber(failedPayments)}
          />
        </div>
      </section>

      <RevenueIntelligence
        activePaidUsers={activePaidUsers}
        churnUsers={churnUsers}
        failedPayments={failedPayments}
        grossRevenue={grossRevenue}
        growthRows={growthRows}
        isMounted={isMounted}
        netPaidGrowth={netPaidGrowth}
        newPaidUsers={newPaidUsers}
        totalRefunds={totalRefunds}
        totalRevenue={totalRevenue}
      />

      <CompositionIntelligence
        acquisitionRows={acquisitionRows}
        isMounted={isMounted}
        landingRows={landingRows}
        onRowClick={(row) => setDrawer(row)}
        planRows={planRows}
      />

      <RecentPayments
        onRowClick={(row) => setDrawer(row)}
        payments={recentPayments}
      />

      <SideDrawer
        open={Boolean(drawer)}
        title={drawer ? String(Object.values(drawer)[0]) : "Subscription detail"}
        description="Mock subscription detail. Replace with customer, invoice, cohort, and event API data later."
        onClose={() => setDrawer(null)}
      >
        {drawer ? <KeyValueGrid item={drawer} /> : null}
      </SideDrawer>
    </DashboardLayout>
  )
}

function MetricCard({
  detail,
  icon,
  label,
  onClick,
  tone,
  value,
}: {
  detail: string
  icon: ReactNode
  label: string
  onClick: () => void
  tone: "violet" | "blue" | "green" | "amber" | "rose"
  value: string
}) {
  const toneClass = {
    amber: "bg-amber-50 text-amber-600",
    blue: "bg-blue-50 text-blue-600",
    green: "bg-emerald-50 text-emerald-600",
    rose: "bg-rose-50 text-rose-600",
    violet: "bg-violet-50 text-violet-600",
  }[tone]

  return (
    <button
      className="group flex h-full min-h-44 flex-col items-start p-6 text-left transition hover:bg-slate-50"
      onClick={onClick}
    >
      <div className={cn("flex size-10 items-center justify-center rounded-xl", toneClass)}>
        {icon}
      </div>
      <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
        {value}
      </p>
      <div className="mt-auto pt-4">
        <StatusBadge tone={tone === "rose" ? "danger" : "success"}>
          {tone === "rose" ? "-15.2%" : "+8.6%"}
        </StatusBadge>
        <p className="mt-3 text-sm font-medium text-slate-500">{detail}</p>
      </div>
    </button>
  )
}

function RevenueIntelligence({
  activePaidUsers,
  churnUsers,
  failedPayments,
  grossRevenue,
  growthRows,
  isMounted,
  netPaidGrowth,
  newPaidUsers,
  totalRefunds,
  totalRevenue,
}: {
  activePaidUsers: number
  churnUsers: number
  failedPayments: number
  grossRevenue: number
  growthRows: Array<GrowthRow & { newPaid: number; churn: number; netGrowth: number; previousActivePaid?: number }>
  isMounted: boolean
  netPaidGrowth: number
  newPaidUsers: number
  totalRefunds: number
  totalRevenue: number
}) {
  const [activeTab, setActiveTab] = useState<RevenueTab>("revenue")
  const [cadence, setCadence] = useState("Daily")
  const config = buildRevenueTabConfig({
    activePaidUsers,
    activeTab,
    churnUsers,
    failedPayments,
    grossRevenue,
    growthRows,
    netPaidGrowth,
    newPaidUsers,
    totalRefunds,
    totalRevenue,
  })

  return (
    <section className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06),0_16px_40px_rgba(15,23,42,0.06)]">
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
          {revenueTabs.map((tab) => {
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
          <p className="text-sm font-semibold text-slate-600">{config.kicker}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
            {config.value}
          </p>
          <StatusBadge tone={config.tone}>{config.delta}</StatusBadge>
          <div className="mt-6 space-y-4">
            {config.details.map((item) => (
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
          <div className="h-[360px]">
            {isMounted ? config.chart : <ChartSkeleton />}
          </div>
        </div>
      </div>

      <div className="grid divide-y divide-slate-100 border-t border-slate-100 bg-violet-50/35 md:grid-cols-4 md:divide-x md:divide-y-0">
        {config.footer.map((item) => (
          <div key={item.label} className="p-5 text-center">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              {item.label}
            </p>
            <p className="mt-2 text-lg font-bold text-slate-950">{item.value}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function CompositionIntelligence({
  acquisitionRows,
  isMounted,
  landingRows,
  onRowClick,
  planRows,
}: {
  acquisitionRows: Array<AcquisitionRow & { visitors: number; paidUsers: number }>
  isMounted: boolean
  landingRows: Array<(typeof paidLandingPages)[number]>
  onRowClick: (row: DrawerItem) => void
  planRows: Array<DrawerItem & { plan: string; activePaidUsers: number; revenue: number; arpu: number; growth: string; churnRate: string }>
}) {
  const [activeTab, setActiveTab] = useState<CompositionTab>("plans")
  const config = buildCompositionConfig(activeTab, planRows, acquisitionRows, landingRows)

  return (
    <section className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06),0_16px_40px_rgba(15,23,42,0.06)]">
      <div className="flex flex-col gap-4 border-b border-slate-100 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-950">
            Paid User Composition Intelligence
          </h2>
        </div>
        <StatusBadge tone="neutral">Last 30 Days</StatusBadge>
      </div>

      <div className="border-b border-slate-100 px-6 pt-5">
        <div className="inline-flex max-w-full overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-1">
          {compositionTabs.map((tab) => {
            const Icon = tab.icon

            return (
              <button
                key={tab.id}
                className={cn(
                  "inline-flex h-10 min-w-36 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition",
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

      <div className="grid gap-0 xl:grid-cols-[0.86fr_1.14fr]">
        <div className="border-b border-slate-100 p-6 xl:border-b-0 xl:border-r">
          <h3 className="text-sm font-semibold text-slate-950">
            {config.visualTitle}
          </h3>
          <div className="mt-6 grid gap-6 md:grid-cols-[220px_1fr] xl:grid-cols-1 2xl:grid-cols-[220px_1fr]">
            <div className="relative h-56">
              {isMounted ? (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={config.distribution}
                        dataKey="value"
                        innerRadius={74}
                        outerRadius={104}
                        paddingAngle={3}
                      >
                        {config.distribution.map((row, index) => (
                          <Cell key={row.label} fill={chartColors[index % chartColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatNumber(Number(value))} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-slate-950">
                      {formatNumber(config.total)}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      {config.totalLabel}
                    </span>
                  </div>
                </>
              ) : (
                <ChartSkeleton />
              )}
            </div>

            <div className="space-y-4 self-center">
              {config.distribution.map((row, index) => {
                const share = (row.value / Math.max(config.total, 1)) * 100

                return (
                  <div key={row.label}>
                    <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                      <div className="flex min-w-0 items-center gap-2">
                        <span
                          className="size-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: chartColors[index % chartColors.length] }}
                        />
                        <span className="truncate font-semibold text-slate-800">
                          {row.label}
                        </span>
                      </div>
                      <span className="font-bold text-slate-950">
                        {formatNumber(row.value)} ({share.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${share}%`,
                          backgroundColor: chartColors[index % chartColors.length],
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {activeTab === "plans" ? (
            <div className="mt-6">
              <h3 className="mb-3 text-sm font-semibold text-slate-950">
                Plan Mix Trend
              </h3>
              <div className="h-40">
                {isMounted ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={buildPlanMixTrend(planRows)}>
                      <CartesianGrid stroke="#eef2f7" vertical={false} />
                      <XAxis dataKey="date" tickLine={false} axisLine={false} />
                      <YAxis tickFormatter={(value) => `${value}%`} tickLine={false} axisLine={false} width={42} />
                      <Tooltip />
                      {planRows.map((plan, index) => (
                        <Area
                          key={plan.plan}
                          dataKey={plan.plan}
                          fill={chartColors[index % chartColors.length]}
                          stackId="plan"
                          stroke={chartColors[index % chartColors.length]}
                        />
                      ))}
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <ChartSkeleton />
                )}
              </div>
            </div>
          ) : null}
        </div>

        <div className="p-6">
          <h3 className="mb-4 text-sm font-semibold text-slate-950">
            {config.tableTitle}
          </h3>
          <SimpleTable
            columns={config.columns}
            onRowClick={onRowClick}
            rows={config.rows}
          />
        </div>
      </div>
    </section>
  )
}

function RecentPayments({
  onRowClick,
  payments,
}: {
  onRowClick: (row: DrawerItem) => void
  payments: RecentPayment[]
}) {
  return (
    <section className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06),0_16px_40px_rgba(15,23,42,0.06)]">
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 p-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-950">
            Latest Payments
          </h2>
        </div>
        <button className="text-sm font-bold text-violet-600 transition hover:text-violet-700">
          View all payments
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-6 py-4">Payment Time</th>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Plan</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Method</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {payments.map((payment) => (
              <tr
                key={`${payment.time}-${payment.user}`}
                className="cursor-pointer transition hover:bg-violet-50/50"
                onClick={() => onRowClick(payment)}
              >
                <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-700">
                  {payment.time}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-slate-700">
                  {payment.user}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <StatusBadge tone={payment.plan === "Pro" ? "success" : "neutral"}>
                    {payment.plan}
                  </StatusBadge>
                </td>
                <td className="whitespace-nowrap px-6 py-4 font-semibold text-slate-950">
                  {currency(payment.amount)}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <StatusBadge tone={payment.status === "Failed" ? "danger" : "success"}>
                    {payment.status}
                  </StatusBadge>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-slate-700">
                  {payment.method}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function buildRevenueTabConfig({
  activePaidUsers,
  activeTab,
  churnUsers,
  failedPayments,
  grossRevenue,
  growthRows,
  netPaidGrowth,
  newPaidUsers,
  totalRefunds,
  totalRevenue,
}: {
  activePaidUsers: number
  activeTab: RevenueTab
  churnUsers: number
  failedPayments: number
  grossRevenue: number
  growthRows: Array<GrowthRow & { newPaid: number; churn: number; netGrowth: number; previousActivePaid?: number }>
  netPaidGrowth: number
  newPaidUsers: number
  totalRefunds: number
  totalRevenue: number
}) {
  const revenueTrend = growthRows.map((row, index) => {
    const gross = Math.round(row.activePaid * 210.45 * (0.92 + index * 0.035))
    const refunds = Math.round(gross * (0.06 + (index % 3) * 0.006))
    const previousGross = Math.round(
      (row.previousActivePaid ?? row.activePaid * 0.92) *
        210.45 *
        (0.9 + index * 0.025)
    )
    const previousRefunds = Math.round(previousGross * 0.065)

    return {
      date: row.date,
      grossRevenue: gross,
      netRevenue: gross - refunds,
      previousNetRevenue: previousGross - previousRefunds,
      refunds,
    }
  })
  const highestDay = maxBy(revenueTrend, (row) => row.netRevenue)
  const lowestDay = minBy(revenueTrend, (row) => row.netRevenue)
  const paidConversion = (newPaidUsers / Math.max(newPaidUsers + churnUsers, 1)) * 100

  if (activeTab === "paidUsers") {
    return {
      kicker: "Active Paid Users",
      value: formatNumber(activePaidUsers),
      delta: "+6.2%",
      tone: "success" as const,
      details: [
        { label: "New Paid Users", value: formatNumber(newPaidUsers) },
        { label: "Net Paid Growth", value: formatNumber(netPaidGrowth) },
        { label: "Churn Users", value: formatNumber(churnUsers) },
      ],
      chart: (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={growthRows}>
            <CartesianGrid stroke="#eef2f7" vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} width={72} />
            <Tooltip />
            <Line dataKey="activePaid" name="Active Paid Users" stroke="#7c3aed" strokeWidth={3} type="monotone" />
            <Line dataKey="previousActivePaid" name="Previous Active Paid" stroke="#a78bfa" strokeDasharray="5 5" strokeWidth={2} dot={false} type="monotone" />
            <Line dataKey="newPaid" name="New Paid Users" stroke="#2563eb" strokeWidth={2.5} />
          </LineChart>
        </ResponsiveContainer>
      ),
      footer: [
        { label: "New Paid Users", value: formatNumber(newPaidUsers) },
        { label: "Net Paid Growth", value: formatNumber(netPaidGrowth) },
        { label: "Average New Paid / Day", value: formatNumber(Math.round(newPaidUsers / Math.max(growthRows.length, 1))) },
        { label: "Latest Active Paid", value: formatNumber(activePaidUsers) },
      ],
    }
  }

  if (activeTab === "churn") {
    return {
      kicker: "Churn Users",
      value: formatNumber(churnUsers),
      delta: "-5.1%",
      tone: "danger" as const,
      details: [
        { label: "Churn Rate", value: `${((churnUsers / Math.max(activePaidUsers, 1)) * 100).toFixed(1)}%` },
        { label: "Failed Payments", value: formatNumber(failedPayments) },
        { label: "Active Paid Users", value: formatNumber(activePaidUsers) },
      ],
      chart: (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={growthRows}>
            <CartesianGrid stroke="#eef2f7" vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} width={72} />
            <Tooltip />
            <Bar dataKey="churn" name="Churn Users" fill="#ef4444" radius={[8, 8, 0, 0]} isAnimationActive />
          </BarChart>
        </ResponsiveContainer>
      ),
      footer: [
        { label: "Churn Users", value: formatNumber(churnUsers) },
        { label: "Churn Rate", value: `${((churnUsers / Math.max(activePaidUsers, 1)) * 100).toFixed(1)}%` },
        { label: "Payment Failures", value: formatNumber(failedPayments) },
        { label: "Recovery Priority", value: "High" },
      ],
    }
  }

  if (activeTab === "conversion") {
    return {
      kicker: "Paid Conversion",
      value: `${paidConversion.toFixed(1)}%`,
      delta: "+3.7%",
      tone: "success" as const,
      details: [
        { label: "New Paid Users", value: formatNumber(newPaidUsers) },
        { label: "Churn Users", value: formatNumber(churnUsers) },
        { label: "Net Paid Growth", value: formatNumber(netPaidGrowth) },
      ],
      chart: (
        <div className="grid h-full items-center gap-6 md:grid-cols-[0.82fr_1.18fr]">
          <div className="space-y-4">
            {[
              { label: "New Paid Users", value: newPaidUsers, rate: "100%" },
              { label: "Net Paid Growth", value: netPaidGrowth, rate: `${((netPaidGrowth / Math.max(newPaidUsers, 1)) * 100).toFixed(1)}%` },
              { label: "Active Paid Base", value: activePaidUsers, rate: "Active" },
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
            <LineChart data={paidConversionTimeline}>
              <CartesianGrid stroke="#eef2f7" vertical={false} />
              <XAxis dataKey="day" tickLine={false} axisLine={false} />
              <YAxis tickFormatter={(value) => `${value}%`} tickLine={false} axisLine={false} width={48} />
              <Tooltip />
              <Line dataKey="cumulative" name="Cumulative Paid Conversion" stroke="#7c3aed" strokeWidth={3} />
              <Line dataKey="distribution" name="Distribution" stroke="#10b981" strokeWidth={2.5} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ),
      footer: [
        { label: "Paid Conversion", value: `${paidConversion.toFixed(1)}%` },
        { label: "New Paid Users", value: formatNumber(newPaidUsers) },
        { label: "Net Paid Growth", value: formatNumber(netPaidGrowth) },
        { label: "ARPU", value: currency(totalRevenue / Math.max(activePaidUsers, 1)) },
      ],
    }
  }

  return {
    kicker: "Total Revenue",
    value: currency(totalRevenue),
    delta: "+8.6%",
    tone: "success" as const,
    details: [
      { label: "Gross Revenue", value: currency(grossRevenue) },
      { label: "Refunds", value: `-${currency(totalRefunds)}` },
      { label: "Net Revenue", value: currency(totalRevenue) },
    ],
    chart: (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={revenueTrend}>
          <defs>
            <linearGradient id="subscriptionRevenueFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.22} />
              <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#eef2f7" vertical={false} />
          <XAxis dataKey="date" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} width={72} />
          <Tooltip formatter={(value) => currency(Number(value))} />
          <Area dataKey="netRevenue" fill="url(#subscriptionRevenueFill)" name="Net Revenue" stroke="#7c3aed" strokeWidth={3} type="monotone" />
          <Line dataKey="previousNetRevenue" name="Previous Net Revenue" stroke="#a78bfa" strokeDasharray="5 5" strokeWidth={2} dot={false} type="monotone" />
          <Line dataKey="grossRevenue" name="Gross Revenue" stroke="#0f172a" strokeWidth={2} dot={false} />
          <Line dataKey="refunds" name="Refunds" stroke="#0ea5e9" strokeWidth={2} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    ),
    footer: [
      { label: "Average Daily Revenue", value: currency(totalRevenue / Math.max(growthRows.length, 1)) },
      { label: "Highest Day", value: `${highestDay.date} ${currency(highestDay.netRevenue)}` },
      { label: "Lowest Day", value: `${lowestDay.date} ${currency(lowestDay.netRevenue)}` },
      { label: "Growth Rate", value: "+8.6%" },
    ],
  }
}

function buildCompositionConfig(
  activeTab: CompositionTab,
  planRows: Array<DrawerItem & { plan: string; activePaidUsers: number; revenue: number; arpu: number; growth: string; churnRate: string }>,
  acquisitionRows: Array<AcquisitionRow & { visitors: number; paidUsers: number }>,
  landingRows: Array<(typeof paidLandingPages)[number]>
) {
  if (activeTab === "sources") {
    const total = acquisitionRows.reduce((sum, row) => sum + row.paidUsers, 0)
    const rows = acquisitionRows.map((row) => ({ ...row })) as DrawerItem[]

    return {
      visualTitle: "Paid Users by Source",
      tableTitle: "Source Performance Summary",
      total,
      totalLabel: "Paid Users",
      rows,
      distribution: acquisitionRows.map((row) => ({
        label: row.source,
        value: row.paidUsers,
      })),
      columns: sourceColumns,
    }
  }

  if (activeTab === "campaigns") {
    const rows = acquisitionRows.map((row) => ({
      campaign: row.utmCampaign,
      source: row.source,
      paidUsers: row.paidUsers,
      paidConversion: row.paidConversion,
      retention: row.retention,
      churnRate: row.churnRate,
      arpu: row.arpu,
    }))
    const total = rows.reduce((sum, row) => sum + row.paidUsers, 0)

    return {
      visualTitle: "Paid Users by Campaign",
      tableTitle: "Campaign / UTM Performance",
      total,
      totalLabel: "Paid Users",
      rows: rows as DrawerItem[],
      distribution: rows.map((row) => ({
        label: row.campaign,
        value: row.paidUsers,
      })),
      columns: campaignColumns,
    }
  }

  if (activeTab === "landing") {
    const total = landingRows.reduce((sum, row) => sum + row.paidUsers, 0)

    return {
      visualTitle: "Paid Users by Landing Page",
      tableTitle: "Landing Page Performance",
      total,
      totalLabel: "Paid Users",
      rows: landingRows as DrawerItem[],
      distribution: landingRows.map((row) => ({
        label: row.landingPage,
        value: row.paidUsers,
      })),
      columns: landingColumns,
    }
  }

  const total = planRows.reduce((sum, row) => sum + row.activePaidUsers, 0)

  return {
    visualTitle: "Plan Mix (Active Paid Users)",
    tableTitle: "Plan Performance Summary",
    total,
    totalLabel: "Active Paid",
    rows: planRows,
    distribution: planRows.map((row) => ({
      label: row.plan,
      value: row.activePaidUsers,
    })),
    columns: planColumns,
  }
}

function SimpleTable<T extends DrawerItem>({
  columns,
  onRowClick,
  rows,
}: {
  columns: TableColumn<T>[]
  onRowClick: (row: DrawerItem) => void
  rows: T[]
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
            <tr>
              {columns.map((column) => (
                <th key={column.header} className="px-5 py-4">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, index) => (
              <tr
                key={index}
                className="cursor-pointer transition hover:bg-violet-50/50"
                onClick={() => onRowClick(row)}
              >
                {columns.map((column) => (
                  <td key={column.header} className="whitespace-nowrap px-5 py-4 text-slate-700">
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function KeyValueGrid({ item }: { item: DrawerItem }) {
  return (
    <div className="space-y-4">
      {Object.entries(item).map(([key, value]) => (
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
  )
}

function buildPlanRows(
  plans: PlanRow[],
  service: DashboardService,
  compareMode: DashboardCompareMode,
  periodMultiplier: number
) {
  const paidLift = getCompareDelta(compareMode, "paidUsers") / 420
  const periodLift = (periodMultiplier - 1) * 0.016
  const focused = plans
    .filter((plan) => service === "Overall" || plan.service === service)
    .map((plan, index) => {
      const planName = plan.plan as CurrentPlanName
      const planPulse = 1 + paidLift + periodLift + (index % 2 === 0 ? 0.018 : -0.01)
      const activePaidUsers = Math.round(plan.activeSubscribers * planPulse)
      const growthMap: Record<string, string> = {
        Basic: formatPercent(-1.2 + getCompareDelta(compareMode, "churn") * -0.2),
        Growth: formatPercent(9.8 + getCompareDelta(compareMode, "paidUsers") * 0.08),
        Professional: formatPercent(-2.5 + getCompareDelta(compareMode, "revenue") * 0.05),
        Pro: formatPercent(6.1 + getCompareDelta(compareMode, "revenue") * 0.06),
        Starter: formatPercent(7.6 + getCompareDelta(compareMode, "paidUsers") * 0.06),
      }

      return {
        plan: plan.plan,
        activePaidUsers,
        revenue: Math.round(activePaidUsers * getPlanPrice(planName)),
        arpu: getPlanPrice(planName),
        growth: growthMap[plan.plan] ?? "+3.2%",
        churnRate: plan.churnRate,
      }
    })
    .sort((a, b) => {
      const aIndex = priorityPlans.indexOf(a.plan)
      const bIndex = priorityPlans.indexOf(b.plan)

      return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex)
    })

  return focused
}

function buildPlanMixTrend(
  planRows: Array<DrawerItem & { plan: string; activePaidUsers: number }>
) {
  const dates = ["Apr 27", "May 4", "May 11", "May 18", "May 25"]
  const total = planRows.reduce((sum, row) => sum + row.activePaidUsers, 0)

  return dates.map((date, dateIndex) => {
    const row: Record<string, string | number> = { date }

    planRows.forEach((plan, planIndex) => {
      const baseShare = (plan.activePaidUsers / Math.max(total, 1)) * 100
      row[plan.plan] = Math.max(
        2,
        Number((baseShare + dateIndex * (0.5 - planIndex * 0.1)).toFixed(1))
      )
    })

    return row
  })
}

function ChartSkeleton() {
  return <div className="h-full rounded-xl bg-slate-100" />
}

function currency(value: number) {
  return formatKrw(value)
}

function formatPercent(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`
}

function parseCurrency(value: string) {
  return Number(value.replace(/[^0-9.-]/g, ""))
}

function percentValue(value: string) {
  return Number(value.replace("%", ""))
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function maxBy<T>(rows: T[], getValue: (row: T) => number) {
  return rows.reduce((best, row) => (getValue(row) > getValue(best) ? row : best))
}

function minBy<T>(rows: T[], getValue: (row: T) => number) {
  return rows.reduce((best, row) => (getValue(row) < getValue(best) ? row : best))
}

function scale(value: number, multiplier: number) {
  return Math.round(value * multiplier)
}

const planColumns: TableColumn<DrawerItem>[] = [
  {
    header: "Plan",
    render: (row) => <span className="font-semibold text-slate-950">{row.plan}</span>,
  },
  {
    header: "Active Paid Users",
    render: (row) => formatNumber(Number(row.activePaidUsers)),
  },
  {
    header: "Revenue",
    render: (row) => currency(Number(row.revenue)),
  },
  {
    header: "ARPU",
    render: (row) => currency(Number(row.arpu)),
  },
  {
    header: "Growth",
    render: (row) => (
      <span className={String(row.growth).startsWith("-") ? "font-semibold text-rose-500" : "font-semibold text-emerald-600"}>
        {row.growth}
      </span>
    ),
  },
  { header: "Churn Rate", render: (row) => row.churnRate },
]

const sourceColumns: TableColumn<DrawerItem>[] = [
  { header: "Source", render: (row) => <span className="font-semibold text-slate-950">{row.source}</span> },
  { header: "Paid Users", render: (row) => formatNumber(Number(row.paidUsers)) },
  { header: "Paid Conv.", render: (row) => <span className="font-semibold text-violet-600">{row.paidConversion}</span> },
  { header: "Retention", render: (row) => row.retention },
  { header: "Churn", render: (row) => row.churnRate },
  { header: "ARPU", render: (row) => row.arpu },
]

const campaignColumns: TableColumn<DrawerItem>[] = [
  { header: "Campaign", render: (row) => <span className="font-semibold text-slate-950">{row.campaign}</span> },
  { header: "Source", render: (row) => row.source },
  { header: "Paid Users", render: (row) => formatNumber(Number(row.paidUsers)) },
  { header: "Paid Conv.", render: (row) => <span className="font-semibold text-violet-600">{row.paidConversion}</span> },
  { header: "Retention", render: (row) => row.retention },
  { header: "Churn", render: (row) => row.churnRate },
]

const landingColumns: TableColumn<DrawerItem>[] = [
  { header: "Landing Page", render: (row) => <span className="font-semibold text-slate-950">{row.landingPage}</span> },
  { header: "Intent", render: (row) => row.intent },
  { header: "Paid Users", render: (row) => formatNumber(Number(row.paidUsers)) },
  { header: "Paid Conv.", render: (row) => <span className="font-semibold text-violet-600">{row.paidConversion}</span> },
  { header: "Revenue", render: (row) => currency(Number(row.revenue)) },
  { header: "Churn", render: (row) => row.churnRate },
]
