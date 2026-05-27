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
import { FileText, Globe2, Tag, UserRound } from "lucide-react"

import DataTable, { type DataTableColumn } from "@/components/admin/DataTable"
import DateRangeControl from "@/components/admin/DateRangeControl"
import ExportActions from "@/components/admin/ExportActions"
import PageHeader from "@/components/admin/PageHeader"
import SideDrawer from "@/components/admin/SideDrawer"
import StatusBadge from "@/components/admin/StatusBadge"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { formatNumber } from "@/components/dashboard/dashboard-data"
import {
  getCompareModeLabel,
  getDateRangeLabel,
  getPeriodMultiplier,
  useDashboardDateRange,
} from "@/lib/dashboard-date-store"
import { cn } from "@/lib/utils"
import {
  landingPagePerformance,
  loginProviderAnalytics,
  monthlySignupAnalytics,
  regionBreakdown,
  signupConversionDrivers,
  signupFunnel,
  signupSourceBreakdown,
  signupTrafficGroups,
  signupTrend,
  utmPerformance,
} from "./signup-data"

type DrawerItem = Record<string, string | number>

type SourceRow = (typeof signupSourceBreakdown)[number]
type UtmRow = (typeof utmPerformance)[number]
type RegionRow = (typeof regionBreakdown)[number]
type LandingRow = (typeof landingPagePerformance)[number]
type ProviderRow = (typeof loginProviderAnalytics)[number]
type AcquisitionTab = "landing" | "providers" | "countries" | "utm"

type AcquisitionKpi = {
  label: string
  value: string
  detail: string
  tone?: "success" | "danger" | "neutral"
}

type AcquisitionTabConfig = {
  distributionTitle: string
  trendTitle: string
  totalSignups: number
  distribution: { label: string; value: number; detail: string }[]
  series: TrendSeries[]
  kpis: AcquisitionKpi[]
}

type TrendSeries = {
  label: string
  color: string
  values: number[]
}

const acquisitionColors = ["#7c3aed", "#2563eb", "#10b981", "#f59e0b", "#ec4899"]

const acquisitionTabs: {
  id: AcquisitionTab
  label: string
  icon: typeof FileText
}[] = [
  { id: "landing", label: "Landing Pages", icon: FileText },
  { id: "providers", label: "Login Providers", icon: UserRound },
  { id: "countries", label: "Countries", icon: Globe2 },
  { id: "utm", label: "UTM Campaigns", icon: Tag },
]

export default function SignupIntelligenceDashboard() {
  const [isMounted, setIsMounted] = useState(false)
  const [drawer, setDrawer] = useState<DrawerItem | null>(null)
  const { period, startDate, endDate, compareMode } = useDashboardDateRange()
  const periodMultiplier = getPeriodMultiplier(period)

  const trendRows = useMemo(
    () =>
      signupTrend.map((row) => ({
        ...row,
        visitors: scale(row.visitors, periodMultiplier),
        signupStarted: scale(row.signupStarted, periodMultiplier),
        signups: scale(row.signups, periodMultiplier),
        paidUsers: scale(row.paidUsers, periodMultiplier),
      })),
    [periodMultiplier]
  )

  const sourceRows = useMemo(
    () =>
      signupSourceBreakdown.map((row) => ({
        ...row,
        visitors: scale(row.visitors, periodMultiplier),
        signups: scale(row.signups, periodMultiplier),
        signupRate: percentValue(row.signupConversion),
        paidRate: percentValue(row.paidConversion),
      })),
    [periodMultiplier]
  )

  const landingRows = useMemo(
    () =>
      landingPagePerformance.map((row) => ({
        ...row,
        visitors: scale(row.visitors, periodMultiplier),
        signups: scale(row.signups, periodMultiplier),
        signupRate: percentValue(row.signupConversion),
        paidRate: percentValue(row.paidConversion),
      })),
    [periodMultiplier]
  )

  const providerRows = useMemo(
    () =>
      loginProviderAnalytics.map((row) => ({
        ...row,
        signupStarted: scale(row.signupStarted, periodMultiplier),
        signups: scale(row.signups, periodMultiplier),
        completionRate: percentValue(row.signupCompletion),
      })),
    [periodMultiplier]
  )

  const regionRows = useMemo(
    () =>
      regionBreakdown.map((row) => ({
        ...row,
        signups: scale(row.signups, periodMultiplier),
        signupRate: percentValue(row.conversion),
        paidRate: percentValue(row.paidConversion),
      })),
    [periodMultiplier]
  )

  const utmRows = useMemo(
    () =>
      utmPerformance.map((row) => ({
        ...row,
        visitors: scale(row.visitors, periodMultiplier),
        signups: scale(row.signups, periodMultiplier),
      })),
    [periodMultiplier]
  )

  const monthlyRows = useMemo(
    () =>
      monthlySignupAnalytics.map((row) => ({
        ...row,
        signups: scale(row.signups, periodMultiplier),
        organic: scale(row.organic, periodMultiplier),
        paid: scale(row.paid, periodMultiplier),
        referral: scale(row.referral, periodMultiplier),
      })),
    [periodMultiplier]
  )

  const trafficGroupRows = useMemo(
    () =>
      signupTrafficGroups.map((row) => ({
        ...row,
        visitors: scale(row.visitors, periodMultiplier),
        signups: scale(row.signups, periodMultiplier),
      })),
    [periodMultiplier]
  )

  const totalSignups = sourceRows.reduce((sum, row) => sum + row.signups, 0)
  const totalVisitors = sourceRows.reduce((sum, row) => sum + row.visitors, 0)
  const signupConversion = (totalSignups / Math.max(totalVisitors, 1)) * 100
  const organicSignups = sourceRows
    .filter((row) => row.group === "Organic")
    .reduce((sum, row) => sum + row.signups, 0)
  const paidSignups = sourceRows
    .filter((row) => row.group === "Paid")
    .reduce((sum, row) => sum + row.signups, 0)
  const bestSource = sourceRows.reduce((best, row) =>
    row.signupRate > best.signupRate ? row : best
  )
  const bestLanding = landingRows.reduce((best, row) =>
    row.signupRate > best.signupRate ? row : best
  )
  const bestProvider = providerRows.reduce((best, row) =>
    row.signups > best.signups ? row : best
  )

  const exportPayload = useMemo(
    () => ({
      title: "Signup Conversion Intelligence Report",
      subtitle:
        "Signup conversion report covering trend, source quality, landing pages, login providers, countries, UTM, and funnel drop-off.",
      filename: "signup-conversion-intelligence-report",
      filters: {
        "Date range": getDateRangeLabel(startDate, endDate),
        Compare: getCompareModeLabel(compareMode),
      },
      kpis: [
        {
          label: "Signup Conversion",
          value: `${signupConversion.toFixed(2)}%`,
          detail: "+0.6pp vs comparison period",
        },
        {
          label: "Signups",
          value: formatNumber(totalSignups),
          detail: "Completed signups",
        },
        {
          label: "Top Source",
          value: bestSource.source,
          detail: `${bestSource.signupConversion} signup conversion`,
        },
        {
          label: "Top Landing Page",
          value: bestLanding.landingPage,
          detail: `${bestLanding.signupConversion} signup conversion`,
        },
        {
          label: "Top Login Provider",
          value: bestProvider.provider,
          detail: `${bestProvider.share} of signups`,
        },
      ],
      charts: [
        {
          title: "Signup Trend",
          points: trendRows.map((point) => ({
            label: point.date,
            value: point.signups,
            secondary: `${point.signupConversion}% conversion`,
          })),
        },
        {
          title: "Source Conversion",
          points: sourceRows.map((row) => ({
            label: row.source,
            value: row.signupRate,
            secondary: `${formatNumber(row.signups)} signups`,
          })),
        },
      ],
      datasets: [
        { name: "Signup Trend", rows: trendRows },
        { name: "Source Conversion", rows: sourceRows },
        { name: "Landing Page Conversion", rows: landingRows },
        { name: "Login Provider Analytics", rows: providerRows },
        { name: "Country Signup Analytics", rows: regionRows },
        { name: "UTM Performance", rows: utmRows },
        { name: "Organic vs Paid", rows: trafficGroupRows },
        { name: "Monthly Signup Analytics", rows: monthlyRows },
        { name: "Conversion Funnel", rows: signupFunnel },
      ],
    }),
    [
      bestLanding,
      bestProvider,
      bestSource,
      compareMode,
      endDate,
      landingRows,
      monthlyRows,
      providerRows,
      regionRows,
      signupConversion,
      sourceRows,
      startDate,
      totalSignups,
      trafficGroupRows,
      trendRows,
      utmRows,
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
          { label: "Signups" },
        ]}
        eyebrow="Growth Intelligence"
        title="Signup Conversion Intelligence"
        description="Understand why visitors become signups, which sources create intent, and which landing pages drive conversion."
        actions={<ExportActions payload={exportPayload} />}
      />

      <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
        <DateRangeControl />
      </section>

      <section className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06),0_16px_40px_rgba(15,23,42,0.06)]">
        <div className="grid gap-0 xl:grid-cols-[0.88fr_1.12fr]">
          <div className="border-b border-slate-100 p-6 xl:border-b-0 xl:border-r">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Signup Conversion
                </p>
                <div className="mt-3 flex flex-wrap items-end gap-3">
                  <p className="text-5xl font-bold tracking-tight text-slate-950">
                    {signupConversion.toFixed(2)}%
                  </p>
                  <StatusBadge tone="success">+0.6pp</StatusBadge>
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  Compared with {getCompareModeLabel(compareMode).toLowerCase()}.
                </p>
              </div>
              <StatusBadge tone="success">Healthy</StatusBadge>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <MetricTile
                label="Completed Signups"
                value={formatNumber(totalSignups)}
                detail={`${formatNumber(totalVisitors)} visitors`}
              />
              <MetricTile
                label="Organic Signups"
                value={formatNumber(organicSignups)}
                detail={`${((organicSignups / Math.max(totalSignups, 1)) * 100).toFixed(1)}% share`}
              />
              <MetricTile
                label="Paid Signups"
                value={formatNumber(paidSignups)}
                detail={`${((paidSignups / Math.max(totalSignups, 1)) * 100).toFixed(1)}% share`}
              />
              <MetricTile
                label="Top Provider"
                value={bestProvider.provider}
                detail={`${bestProvider.share} signup share`}
              />
            </div>

            <div className="mt-8 space-y-3">
              <DriverRow
                label="Top source"
                value={bestSource.source}
                detail={`${bestSource.signupConversion} signup conversion`}
              />
              <DriverRow
                label="Top landing page"
                value={bestLanding.landingPage}
                detail={`${bestLanding.signupConversion} signup conversion`}
              />
              <DriverRow
                label="Weakest source"
                value="Unknown"
                detail="Attribution cleanup needed"
                tone="danger"
              />
            </div>
          </div>

          <div className="p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  Signup Trend
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Visitors, signup starts, completed signups, and paid users over time.
                </p>
              </div>
            </div>
            <div className="h-[340px]">
              {isMounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendRows}>
                    <CartesianGrid stroke="#eef2f7" vertical={false} />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} />
                    <YAxis yAxisId="count" tickLine={false} axisLine={false} width={70} />
                    <YAxis
                      yAxisId="rate"
                      orientation="right"
                      tickLine={false}
                      axisLine={false}
                      width={48}
                    />
                    <Tooltip />
                    <Line yAxisId="count" dataKey="visitors" stroke="#0f172a" strokeWidth={2} dot={false} />
                    <Line yAxisId="count" dataKey="signupStarted" stroke="#94a3b8" strokeWidth={2} dot={false} />
                    <Line yAxisId="count" dataKey="signups" stroke="#7c3aed" strokeWidth={3} />
                    <Line yAxisId="count" dataKey="paidUsers" stroke="#10b981" strokeWidth={2} />
                    <Line yAxisId="rate" dataKey="signupConversion" stroke="#f59e0b" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <ChartSkeleton />
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-0 border-t border-slate-100 md:grid-cols-3">
          {signupConversionDrivers.map((driver) => (
            <div key={driver.title} className="border-b border-slate-100 p-5 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-slate-950">{driver.title}</p>
                <StatusBadge tone={driver.tone === "negative" ? "danger" : "success"}>
                  {driver.metric}
                </StatusBadge>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-500">{driver.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mb-8 grid gap-6 xl:grid-cols-2">
        <ChartCard
          title="Source Conversion"
          description="Signup and paid conversion by acquisition source."
        >
          {isMounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourceRows}>
                <CartesianGrid stroke="#eef2f7" vertical={false} />
                <XAxis dataKey="source" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={56} />
                <Tooltip />
                <Bar dataKey="signupRate" fill="#7c3aed" radius={[8, 8, 0, 0]} />
                <Bar dataKey="paidRate" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ChartSkeleton />
          )}
        </ChartCard>

        <ChartCard
          title="Monthly Signup Mix"
          description="Organic, paid, and referral signup growth by month."
        >
          {isMounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRows}>
                <CartesianGrid stroke="#eef2f7" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={72} />
                <Tooltip />
                <Area dataKey="organic" stackId="1" stroke="#10b981" fill="#d1fae5" />
                <Area dataKey="paid" stackId="1" stroke="#7c3aed" fill="#ede9fe" />
                <Area dataKey="referral" stackId="1" stroke="#f59e0b" fill="#fef3c7" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <ChartSkeleton />
          )}
        </ChartCard>
      </div>

      <div className="mb-8 grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <section>
          <SectionTitle
            title="Source Detail"
            description="Source-level visitors, signups, signup conversion, paid conversion, and retention."
          />
          <DataTable
            columns={sourceColumns}
            data={sourceRows}
            summary={`Showing 1 to ${sourceRows.length} of ${sourceRows.length} source rows`}
            compactPagination
            onRowClick={(row) => setDrawer(row)}
          />
        </section>

        <section>
          <SectionTitle
            title="Conversion Flow"
            description="Visitor to signup start to signup completed."
          />
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
            <div className="space-y-5">
              {signupFunnel.map((step, index) => (
                <div key={step.stage}>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-950">{step.stage}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {formatNumber(scale(step.value, periodMultiplier))} users
                      </p>
                    </div>
                    <StatusBadge tone={index === 0 ? "success" : "neutral"}>
                      {step.conversion}
                    </StatusBadge>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-violet-600"
                      style={{ width: step.conversion }}
                    />
                  </div>
                  <p className="mt-2 text-xs font-medium text-slate-500">
                    Drop-off: {step.dropOff}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <SignupAcquisitionModule
        isMounted={isMounted}
        landingRows={landingRows}
        providerRows={providerRows}
        regionRows={regionRows}
        trendRows={trendRows}
        utmRows={utmRows}
        onRowClick={(row) => setDrawer(row)}
      />

      <SideDrawer
        open={Boolean(drawer)}
        title={drawer ? String(Object.values(drawer)[0]) : "Signup detail"}
        description="Mock signup intelligence detail. Replace with campaign, cohort, and event-level API data later."
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

function SignupAcquisitionModule({
  isMounted,
  landingRows,
  providerRows,
  regionRows,
  trendRows,
  utmRows,
  onRowClick,
}: {
  isMounted: boolean
  landingRows: Array<LandingRow & { signupRate: number; paidRate: number }>
  providerRows: Array<ProviderRow & { completionRate: number }>
  regionRows: Array<RegionRow & { signupRate: number; paidRate: number }>
  trendRows: typeof signupTrend
  utmRows: UtmRow[]
  onRowClick: (row: DrawerItem) => void
}) {
  const [activeTab, setActiveTab] = useState<AcquisitionTab>("landing")
  const config = useMemo(
    () =>
      buildAcquisitionTabConfig({
        activeTab,
        landingRows,
        providerRows,
        regionRows,
        trendRows,
        utmRows,
      }),
    [activeTab, landingRows, providerRows, regionRows, trendRows, utmRows]
  )

  return (
    <section className="mb-8 overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06),0_20px_48px_rgba(124,58,237,0.08)]">
      <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-950">
            Signup Acquisition Intelligence
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Understand where signups come from across landing pages, providers, countries, and campaigns.
          </p>
        </div>
        <div className="grid overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-1 sm:grid-cols-4 lg:w-auto">
          {acquisitionTabs.map((tab) => {
            const Icon = tab.icon

            return (
              <button
                key={tab.id}
                className={cn(
                  "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold transition",
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

      <div className="grid gap-0 xl:grid-cols-[0.78fr_1.22fr]">
        <div className="border-b border-slate-100 p-5 xl:border-b-0 xl:border-r">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-950">
                {config.distributionTitle}
              </p>
              <p className="mt-1 text-xs font-medium text-slate-500">
                Top records by completed signup volume.
              </p>
            </div>
            <span className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-600">
              Top {config.distribution.length}
            </span>
          </div>

          <div className="grid gap-5 sm:grid-cols-[180px_1fr] xl:grid-cols-1 2xl:grid-cols-[180px_1fr]">
            <div className="relative h-48">
              {isMounted ? (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={config.distribution}
                        dataKey="value"
                        innerRadius={58}
                        outerRadius={82}
                        paddingAngle={3}
                      >
                        {config.distribution.map((row, index) => (
                          <Cell
                            key={row.label}
                            fill={acquisitionColors[index % acquisitionColors.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatNumber(Number(value))} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-xs font-bold text-slate-500">
                      Total
                    </span>
                    <span className="text-xl font-bold text-slate-950">
                      {formatNumber(config.totalSignups)}
                    </span>
                  </div>
                </>
              ) : (
                <ChartSkeleton />
              )}
            </div>

            <div className="space-y-3 self-center">
              {config.distribution.map((row, index) => (
                <div key={row.label}>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{
                          backgroundColor:
                            acquisitionColors[index % acquisitionColors.length],
                        }}
                      />
                      <span className="truncate font-semibold text-slate-800">
                        {row.label}
                      </span>
                    </div>
                    <span className="font-bold text-slate-950">
                      {formatNumber(row.value)}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(row.value / Math.max(config.totalSignups, 1)) * 100}%`,
                        backgroundColor:
                          acquisitionColors[index % acquisitionColors.length],
                      }}
                    />
                  </div>
                  <p className="mt-1 text-xs font-medium text-slate-500">
                    {row.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-950">
                {config.trendTitle}
              </p>
              <p className="mt-1 text-xs font-medium text-slate-500">
                Mock trend split by current tab selection.
              </p>
            </div>
            <span className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-600">
              Last 30 Days
            </span>
          </div>
          <div className="h-64">
            {isMounted ? (
              <MultiSeriesTrendChart series={config.series} trendRows={trendRows} />
            ) : (
              <ChartSkeleton />
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-3 border-t border-slate-100 bg-slate-50/60 p-5 md:grid-cols-2 xl:grid-cols-4">
        {config.kpis.map((metric) => (
          <div
            key={metric.label}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                {metric.label}
              </p>
              <StatusBadge tone={metric.tone ?? "success"}>{metric.detail}</StatusBadge>
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight text-slate-950">
              {metric.value}
            </p>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-100 p-5">
        {activeTab === "landing" ? (
          <DataTable
            columns={landingColumns}
            data={landingRows}
            summary={`Showing 1 to ${landingRows.length} of ${landingRows.length} landing pages`}
            compactPagination
            onRowClick={onRowClick}
          />
        ) : null}
        {activeTab === "providers" ? (
          <DataTable
            columns={providerColumns}
            data={providerRows}
            summary={`Showing 1 to ${providerRows.length} of ${providerRows.length} login providers`}
            compactPagination
            onRowClick={onRowClick}
          />
        ) : null}
        {activeTab === "countries" ? (
          <DataTable
            columns={regionColumns}
            data={regionRows}
            summary={`Showing 1 to ${regionRows.length} of ${regionRows.length} countries`}
            compactPagination
            onRowClick={onRowClick}
          />
        ) : null}
        {activeTab === "utm" ? (
          <DataTable
            columns={utmColumns}
            data={utmRows}
            summary={`Showing 1 to ${utmRows.length} of ${utmRows.length} UTM rows`}
            compactPagination
            onRowClick={onRowClick}
          />
        ) : null}
      </div>
    </section>
  )
}

function MultiSeriesTrendChart({
  series,
  trendRows,
}: {
  series: TrendSeries[]
  trendRows: typeof signupTrend
}) {
  const data = trendRows.map((row, index) => {
    const point: Record<string, string | number> = { date: row.date }

    series.forEach((item, seriesIndex) => {
      point[`series${seriesIndex}`] = item.values[index] ?? 0
    })

    return point
  })

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid stroke="#eef2f7" vertical={false} />
        <XAxis dataKey="date" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} width={64} />
        <Tooltip />
        {series.map((item, index) => (
          <Line
            key={item.label}
            dataKey={`series${index}`}
            dot={index === 0 ? { r: 3 } : false}
            name={item.label}
            stroke={item.color}
            strokeWidth={index === 0 ? 3 : 2}
            type="monotone"
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

function buildAcquisitionTabConfig({
  activeTab,
  landingRows,
  providerRows,
  regionRows,
  trendRows,
  utmRows,
}: {
  activeTab: AcquisitionTab
  landingRows: Array<LandingRow & { signupRate: number; paidRate: number }>
  providerRows: Array<ProviderRow & { completionRate: number }>
  regionRows: Array<RegionRow & { signupRate: number; paidRate: number }>
  trendRows: typeof signupTrend
  utmRows: UtmRow[]
}): AcquisitionTabConfig {
  if (activeTab === "providers") {
    const totalSignups = providerRows.reduce((sum, row) => sum + row.signups, 0)
    const topProvider = maxBy(providerRows, (row) => row.signups)
    const bestCompletion = maxBy(providerRows, (row) => row.completionRate)
    const bestPaid = maxBy(providerRows, (row) => percentValue(row.paidConversion))

    return {
      distributionTitle: "Provider signup share",
      trendTitle: "Signup Trend by Login Provider",
      totalSignups,
      distribution: providerRows.map((row) => ({
        label: row.provider,
        value: row.signups,
        detail: `${row.share} share / ${row.signupCompletion} completion`,
      })),
      series: createSeries(
        providerRows.map((row) => ({ label: row.provider, value: row.signups })),
        trendRows,
        0.13
      ),
      kpis: [
        {
          label: "Top Provider",
          value: topProvider.provider,
          detail: `${formatNumber(topProvider.signups)} signups`,
        },
        {
          label: "Provider Share",
          value: topProvider.share,
          detail: "Top provider",
        },
        {
          label: "Completion Rate",
          value: bestCompletion.signupCompletion,
          detail: bestCompletion.provider,
        },
        {
          label: "Best Paid Conv.",
          value: bestPaid.paidConversion,
          detail: bestPaid.provider,
        },
      ] satisfies AcquisitionKpi[],
    }
  }

  if (activeTab === "countries") {
    const totalSignups = regionRows.reduce((sum, row) => sum + row.signups, 0)
    const topCountry = maxBy(regionRows, (row) => row.signups)
    const bestConversion = maxBy(regionRows, (row) => row.signupRate)
    const bestPaid = maxBy(regionRows, (row) => row.paidRate)

    return {
      distributionTitle: "Country signup distribution",
      trendTitle: "Signup Trend by Country",
      totalSignups,
      distribution: regionRows.map((row) => ({
        label: row.country,
        value: row.signups,
        detail: `${row.region} / ${row.conversion} signup conv.`,
      })),
      series: createSeries(
        regionRows.map((row) => ({ label: row.country, value: row.signups })),
        trendRows,
        0.16
      ),
      kpis: [
        {
          label: "Top Country",
          value: topCountry.country,
          detail: `${formatNumber(topCountry.signups)} signups`,
        },
        {
          label: "Country Signup Conv.",
          value: bestConversion.conversion,
          detail: bestConversion.country,
        },
        {
          label: "Regional Growth",
          value: "+7.8%",
          detail: "South Korea",
        },
        {
          label: "Best Paid Conv.",
          value: bestPaid.paidConversion,
          detail: bestPaid.country,
        },
      ] satisfies AcquisitionKpi[],
    }
  }

  if (activeTab === "utm") {
    const totalSignups = utmRows.reduce((sum, row) => sum + row.signups, 0)
    const topSource = maxBy(utmRows, (row) => row.signups)
    const bestCampaign = maxBy(utmRows, (row) => percentValue(row.signupConversion))
    const bestPaid = maxBy(utmRows, (row) => percentValue(row.paidConversion))

    return {
      distributionTitle: "UTM source distribution",
      trendTitle: "Signup Trend by UTM Source",
      totalSignups,
      distribution: utmRows.map((row) => ({
        label: row.utmSource,
        value: row.signups,
        detail: `${row.utmCampaign} / ${row.signupConversion}`,
      })),
      series: createSeries(
        utmRows.map((row) => ({ label: row.utmSource, value: row.signups })),
        trendRows,
        0.18
      ),
      kpis: [
        {
          label: "Top UTM Source",
          value: topSource.utmSource,
          detail: `${formatNumber(topSource.signups)} signups`,
        },
        {
          label: "Best Campaign",
          value: bestCampaign.utmCampaign,
          detail: bestCampaign.signupConversion,
        },
        {
          label: "Paid Conversion",
          value: bestPaid.paidConversion,
          detail: bestPaid.utmSource,
        },
        {
          label: "Total UTM Signups",
          value: formatNumber(totalSignups),
          detail: "+6.5%",
        },
      ] satisfies AcquisitionKpi[],
    }
  }

  const totalSignups = landingRows.reduce((sum, row) => sum + row.signups, 0)
  const topLanding = maxBy(landingRows, (row) => row.signups)
  const bestConversion = maxBy(landingRows, (row) => row.signupRate)
  const bestPaid = maxBy(landingRows, (row) => row.paidRate)

  return {
    distributionTitle: "Top Landing Pages",
    trendTitle: "Signup Trend by Top Landing Pages",
    totalSignups,
    distribution: landingRows.map((row) => ({
      label: row.landingPage,
      value: row.signups,
      detail: `${row.signupConversion} signup conv. / ${row.intent}`,
    })),
    series: createSeries(
      landingRows.map((row) => ({ label: row.landingPage, value: row.signups })),
      trendRows,
      0.12
    ),
    kpis: [
      {
        label: "Top Landing Page",
        value: topLanding.landingPage,
        detail: `${formatNumber(topLanding.signups)} signups`,
      },
      {
        label: "Signup Conversion",
        value: bestConversion.signupConversion,
        detail: bestConversion.landingPage,
      },
      {
        label: "Total Signups",
        value: formatNumber(totalSignups),
        detail: "+18.8%",
      },
      {
        label: "Avg Time to Signup",
        value: "3m 42s",
        detail: bestPaid.landingPage,
      },
    ] satisfies AcquisitionKpi[],
  }
}

function createSeries(
  rows: { label: string; value: number }[],
  trendRows: typeof signupTrend,
  wobble: number
): TrendSeries[] {
  const total = rows.reduce((sum, row) => sum + row.value, 0)

  return rows.slice(0, 5).map((row, seriesIndex) => ({
    label: row.label,
    color: acquisitionColors[seriesIndex % acquisitionColors.length],
    values: trendRows.map((point, pointIndex) => {
      const share = row.value / Math.max(total, 1)
      const pulse =
        1 +
        (pointIndex % 2 === 0 ? wobble : -wobble / 1.8) +
        seriesIndex * 0.018

      return Math.round(point.signups * share * pulse)
    }),
  }))
}

function maxBy<T>(rows: T[], getValue: (row: T) => number) {
  return rows.reduce((best, row) => (getValue(row) > getValue(best) ? row : best))
}

function MetricTile({
  label,
  value,
  detail,
}: {
  label: string
  value: string
  detail: string
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{detail}</p>
    </div>
  )
}

function DriverRow({
  label,
  value,
  detail,
  tone = "success",
}: {
  label: string
  value: string
  detail: string
  tone?: "success" | "danger"
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 p-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
        <p className="mt-1 font-semibold text-slate-950">{value}</p>
      </div>
      <StatusBadge tone={tone}>{detail}</StatusBadge>
    </div>
  )
}

function ChartCard({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
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

function SectionTitle({
  title,
  description,
}: {
  title: string
  description?: string
}) {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
      {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
    </div>
  )
}

function ChartSkeleton() {
  return <div className="h-full rounded-xl bg-slate-100" />
}

function percentValue(value: string) {
  return Number(value.replace("%", ""))
}

function scale(value: number, multiplier: number) {
  return Math.round(value * multiplier)
}

const sourceColumns: DataTableColumn<SourceRow & { signupRate: number; paidRate: number }>[] = [
  {
    key: "source",
    header: "Source",
    render: (row) => <span className="font-semibold">{row.source}</span>,
  },
  { key: "group", header: "Group", render: (row) => row.group },
  { key: "visitors", header: "Visitors", render: (row) => formatNumber(row.visitors) },
  { key: "signups", header: "Signups", render: (row) => formatNumber(row.signups) },
  {
    key: "signupConversion",
    header: "Signup Conv.",
    render: (row) => <span className="font-semibold text-violet-600">{row.signupConversion}</span>,
  },
  { key: "paidConversion", header: "Paid Conv.", render: (row) => row.paidConversion },
  { key: "retention", header: "Retention", render: (row) => row.retention },
]

const landingColumns: DataTableColumn<LandingRow & { signupRate: number; paidRate: number }>[] = [
  {
    key: "landingPage",
    header: "Landing Page",
    render: (row) => <span className="font-semibold">{row.landingPage}</span>,
  },
  { key: "intent", header: "Intent", render: (row) => row.intent },
  { key: "visitors", header: "Visitors", render: (row) => formatNumber(row.visitors) },
  { key: "signups", header: "Signups", render: (row) => formatNumber(row.signups) },
  { key: "signupConversion", header: "Signup Conv.", render: (row) => row.signupConversion },
  { key: "paidConversion", header: "Paid Conv.", render: (row) => row.paidConversion },
]

const providerColumns: DataTableColumn<ProviderRow & { completionRate: number }>[] = [
  { key: "provider", header: "Provider", render: (row) => <span className="font-semibold">{row.provider}</span> },
  { key: "signupStarted", header: "Started", render: (row) => formatNumber(row.signupStarted) },
  { key: "signups", header: "Completed", render: (row) => formatNumber(row.signups) },
  { key: "share", header: "Share", render: (row) => row.share },
  { key: "signupCompletion", header: "Completion", render: (row) => row.signupCompletion },
  { key: "paidConversion", header: "Paid Conv.", render: (row) => row.paidConversion },
]

const regionColumns: DataTableColumn<RegionRow & { signupRate: number; paidRate: number }>[] = [
  { key: "country", header: "Country", render: (row) => row.country },
  { key: "region", header: "Region", render: (row) => row.region },
  { key: "signups", header: "Signups", render: (row) => formatNumber(row.signups) },
  { key: "conversion", header: "Signup Conv.", render: (row) => row.conversion },
  { key: "paidConversion", header: "Paid Conv.", render: (row) => row.paidConversion },
]

const utmColumns: DataTableColumn<UtmRow>[] = [
  { key: "utmSource", header: "utm_source", render: (row) => row.utmSource },
  { key: "utmMedium", header: "utm_medium", render: (row) => row.utmMedium },
  { key: "utmCampaign", header: "utm_campaign", render: (row) => row.utmCampaign },
  { key: "utmContent", header: "utm_content", render: (row) => row.utmContent },
  { key: "signups", header: "Signups", render: (row) => formatNumber(row.signups) },
  { key: "signupConversion", header: "Signup Conv.", render: (row) => row.signupConversion },
  { key: "paidConversion", header: "Paid Conv.", render: (row) => row.paidConversion },
]
