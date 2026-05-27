"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import {
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
import { ArrowRight, CheckCircle2, FileText, Globe2, Tag, UserRound } from "lucide-react"

import DataTable, { type DataTableColumn } from "@/components/admin/DataTable"
import DateRangeControl from "@/components/admin/DateRangeControl"
import ExportActions from "@/components/admin/ExportActions"
import PageHeader from "@/components/admin/PageHeader"
import ServiceSegmentFilter from "@/components/admin/ServiceSegmentFilter"
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
import {
  type DashboardService,
  useDashboardServiceFilter,
} from "@/lib/dashboard-service-store"
import { cn } from "@/lib/utils"
import {
  landingPagePerformance,
  loginProviderAnalytics,
  regionBreakdown,
  signupSourceBreakdown,
  signupTrend,
  utmPerformance,
} from "./signup-data"

type DrawerItem = Record<string, string | number>

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

const signupServiceProfiles: Record<
  DashboardService,
  {
    visitorFactor: number
    signupFactor: number
    paidFactor: number
    sourceBias: Record<string, number>
    landingBias: Record<string, number>
    providerBias: Record<string, number>
    regionBias: Record<string, number>
    utmBias: Record<string, number>
  }
> = {
  Overall: {
    visitorFactor: 1,
    signupFactor: 1,
    paidFactor: 1,
    sourceBias: {},
    landingBias: {},
    providerBias: {},
    regionBias: {},
    utmBias: {},
  },
  Yettey: {
    visitorFactor: 0.62,
    signupFactor: 0.66,
    paidFactor: 0.7,
    sourceBias: {
      Direct: 1.12,
      "Google Search": 1.18,
      Instagram: 0.82,
      Organic: 1.16,
      "Paid Ads": 0.76,
      Referral: 1.08,
      Unknown: 0.84,
      YouTube: 0.78,
    },
    landingBias: {
      "/ai-video-generator": 0.74,
      "/pricing": 1.14,
      "/studio": 1.24,
      "/thumbnail-generator": 1.18,
      "/vpick-shortform": 0.56,
    },
    providerBias: {
      Email: 1.06,
      Google: 1.08,
      Kakao: 1.02,
      Naver: 1.12,
    },
    regionBias: {
      Indonesia: 0.82,
      Japan: 1.02,
      "South Korea": 1.18,
      "United States": 0.94,
      Vietnam: 0.88,
    },
    utmBias: {
      google: 1.16,
      instagram: 0.78,
      kakao: 0.86,
      naver: 1.2,
      youtube: 0.74,
    },
  },
  VPICK: {
    visitorFactor: 0.38,
    signupFactor: 0.34,
    paidFactor: 0.3,
    sourceBias: {
      Direct: 0.82,
      "Google Search": 0.76,
      Instagram: 1.2,
      Organic: 0.74,
      "Paid Ads": 1.18,
      Referral: 0.88,
      Unknown: 1,
      YouTube: 1.34,
    },
    landingBias: {
      "/ai-video-generator": 1.28,
      "/pricing": 0.86,
      "/studio": 0.72,
      "/thumbnail-generator": 0.9,
      "/vpick-shortform": 1.46,
    },
    providerBias: {
      Email: 0.9,
      Google: 0.96,
      Kakao: 1.16,
      Naver: 0.82,
    },
    regionBias: {
      Indonesia: 1.16,
      Japan: 1.14,
      "South Korea": 0.9,
      "United States": 1.08,
      Vietnam: 1.22,
    },
    utmBias: {
      google: 0.78,
      instagram: 1.18,
      kakao: 1.32,
      naver: 0.84,
      youtube: 1.42,
    },
  },
}

export default function SignupIntelligenceDashboard() {
  const [isMounted, setIsMounted] = useState(false)
  const [drawer, setDrawer] = useState<DrawerItem | null>(null)
  const { period, startDate, endDate, compareMode, resetDateRange } =
    useDashboardDateRange()
  const { resetService, service, setService } = useDashboardServiceFilter()
  const periodMultiplier = getPeriodMultiplier(period)
  const serviceProfile = signupServiceProfiles[service]

  const trendRows = useMemo(
    () =>
      signupTrend.map((row, index) => {
        const visitors = scale(
          row.visitors,
          periodMultiplier * serviceProfile.visitorFactor * (0.96 + index * 0.012)
        )
        const signups = scale(
          row.signups,
          periodMultiplier * serviceProfile.signupFactor * (0.98 + index * 0.01)
        )
        const signupStarted = scale(
          row.signupStarted,
          periodMultiplier * serviceProfile.signupFactor * 1.04
        )

        return {
          ...row,
          paidUsers: scale(row.paidUsers, periodMultiplier * serviceProfile.paidFactor),
          signupConversion: Number(((signups / Math.max(visitors, 1)) * 100).toFixed(1)),
          signupStarted,
          signups,
          visitors,
        }
      }),
    [periodMultiplier, serviceProfile]
  )

  const sourceRows = useMemo(
    () =>
      signupSourceBreakdown.map((row) => {
        const bias = serviceProfile.sourceBias[row.source] ?? 1
        const visitors = scale(row.visitors, periodMultiplier * serviceProfile.visitorFactor * bias)
        const signups = scale(row.signups, periodMultiplier * serviceProfile.signupFactor * bias)
        const signupRate = (signups / Math.max(visitors, 1)) * 100
        const paidRate = clamp(
          percentValue(row.paidConversion) * serviceProfile.paidFactor * (1 / Math.max(serviceProfile.signupFactor, 0.1)),
          0.8,
          8.5
        )

        return {
          ...row,
          paidConversion: `${paidRate.toFixed(2)}%`,
          paidRate,
          signups,
          signupConversion: `${signupRate.toFixed(2)}%`,
          signupRate,
          visitors,
        }
      }),
    [periodMultiplier, serviceProfile]
  )

  const landingRows = useMemo(
    () =>
      landingPagePerformance.map((row) => {
        const bias = serviceProfile.landingBias[row.landingPage] ?? 1
        const visitors = scale(row.visitors, periodMultiplier * serviceProfile.visitorFactor * bias)
        const signups = scale(row.signups, periodMultiplier * serviceProfile.signupFactor * bias)
        const signupRate = (signups / Math.max(visitors, 1)) * 100
        const paidRate = clamp(
          percentValue(row.paidConversion) * serviceProfile.paidFactor * (1 / Math.max(serviceProfile.signupFactor, 0.1)),
          0.8,
          9.5
        )

        return {
          ...row,
          paidConversion: `${paidRate.toFixed(2)}%`,
          paidRate,
          signups,
          signupConversion: `${signupRate.toFixed(2)}%`,
          signupRate,
          visitors,
        }
      }),
    [periodMultiplier, serviceProfile]
  )

  const providerRows = useMemo(
    () => {
      const rows = loginProviderAnalytics.map((row) => {
        const bias = serviceProfile.providerBias[row.provider] ?? 1

        return {
          ...row,
          completionRate: percentValue(row.signupCompletion),
          signups: scale(row.signups, periodMultiplier * serviceProfile.signupFactor * bias),
          signupStarted: scale(
            row.signupStarted,
            periodMultiplier * serviceProfile.signupFactor * bias
          ),
        }
      })
      const providerTotal = rows.reduce((sum, row) => sum + row.signups, 0)

      return rows.map((row) => ({
        ...row,
        share: `${((row.signups / Math.max(providerTotal, 1)) * 100).toFixed(1)}%`,
      }))
    },
    [periodMultiplier, serviceProfile]
  )

  const regionRows = useMemo(
    () =>
      regionBreakdown.map((row) => {
        const bias = serviceProfile.regionBias[row.country] ?? 1
        const signupRate = percentValue(row.conversion) * (0.96 + bias * 0.04)
        const paidRate = percentValue(row.paidConversion) * (0.9 + serviceProfile.paidFactor * 0.1)

        return {
          ...row,
          paidConversion: `${paidRate.toFixed(2)}%`,
          paidRate,
          signups: scale(row.signups, periodMultiplier * serviceProfile.signupFactor * bias),
          signupRate,
          conversion: `${signupRate.toFixed(2)}%`,
        }
      }),
    [periodMultiplier, serviceProfile]
  )

  const utmRows = useMemo(
    () =>
      utmPerformance.map((row) => {
        const bias = serviceProfile.utmBias[row.utmSource] ?? 1
        const visitors = scale(row.visitors, periodMultiplier * serviceProfile.visitorFactor * bias)
        const signups = scale(row.signups, periodMultiplier * serviceProfile.signupFactor * bias)
        const signupRate = (signups / Math.max(visitors, 1)) * 100
        const paidRate = clamp(
          percentValue(row.paidConversion) * serviceProfile.paidFactor * (1 / Math.max(serviceProfile.signupFactor, 0.1)),
          0.8,
          8.5
        )

        return {
          ...row,
          paidConversion: `${paidRate.toFixed(2)}%`,
          signups,
          signupConversion: `${signupRate.toFixed(2)}%`,
          visitors,
        }
      }),
    [periodMultiplier, serviceProfile]
  )

  const totalSignups = sourceRows.reduce((sum, row) => sum + row.signups, 0)
  const totalVisitors = sourceRows.reduce((sum, row) => sum + row.visitors, 0)
  const signupConversion = (totalSignups / Math.max(totalVisitors, 1)) * 100
  const signupPageEntered = Math.round(totalSignups / 0.705)
  const visitorToEntered = (signupPageEntered / Math.max(totalVisitors, 1)) * 100
  const enteredToCompleted = (totalSignups / Math.max(signupPageEntered, 1)) * 100
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
  const funnelSteps = useMemo(
    () => [
      {
        label: "Landing Page Visitors",
        value: totalVisitors,
        rate: "100%",
        note: "Entry traffic",
        tone: "violet",
      },
      {
        label: "Signup Page Entered",
        value: signupPageEntered,
        rate: `${visitorToEntered.toFixed(1)}%`,
        note: `${(100 - visitorToEntered).toFixed(1)}% drop-off`,
        tone: "blue",
      },
      {
        label: "Signup Completed",
        value: totalSignups,
        rate: `${enteredToCompleted.toFixed(1)}%`,
        note: `${(100 - enteredToCompleted).toFixed(1)}% drop-off`,
        tone: "green",
      },
    ],
    [enteredToCompleted, signupPageEntered, totalSignups, totalVisitors, visitorToEntered]
  )
  const sourceChartRows = useMemo(
    () =>
      sourceRows
        .map((row) => ({
          source: row.source,
          signupRate: row.signupRate,
          signups: row.signups,
        }))
        .sort((a, b) => b.signupRate - a.signupRate),
    [sourceRows]
  )

  const exportPayload = useMemo(
    () => ({
      title: "Signup Conversion Intelligence Report",
      subtitle:
        "Signup acquisition and conversion report covering source, landing page, provider, country, UTM, and funnel performance.",
      filename: "signup-conversion-intelligence-report",
      filters: {
        Service: service,
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
        { name: "Signup Funnel", rows: funnelSteps },
      ],
    }),
    [
      bestLanding,
      bestProvider,
      bestSource,
      compareMode,
      endDate,
      funnelSteps,
      landingRows,
      providerRows,
      regionRows,
      service,
      signupConversion,
      sourceRows,
      startDate,
      totalSignups,
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
        <div className="grid divide-y divide-slate-100 md:grid-cols-5 md:divide-x md:divide-y-0">
          <SummaryMetric
            delta="+0.6pp"
            label="Signup Conversion"
            value={`${signupConversion.toFixed(2)}%`}
          />
          <SummaryMetric
            label="Total Signups"
            subtext={`vs ${getCompareModeLabel(compareMode).toLowerCase()}`}
            value={formatNumber(totalSignups)}
          />
          <SummaryMetric
            delta="+8.3%"
            label="Organic Signups"
            subtext={`${((organicSignups / Math.max(totalSignups, 1)) * 100).toFixed(1)}% of total`}
            value={formatNumber(organicSignups)}
          />
          <SummaryMetric
            delta="+6.1%"
            label="Paid Signups"
            subtext={`${((paidSignups / Math.max(totalSignups, 1)) * 100).toFixed(1)}% of total`}
            value={formatNumber(paidSignups)}
          />
          <SummaryMetric
            label="Top Provider"
            subtext={`${bestProvider.share} share`}
            value={bestProvider.provider}
          />
        </div>
      </section>

      <section className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06),0_16px_40px_rgba(15,23,42,0.06)]">
        <div className="grid gap-0 xl:grid-cols-[1.22fr_0.78fr]">
          <div className="border-b border-slate-100 p-6 xl:border-b-0 xl:border-r">
            <h2 className="text-xl font-semibold tracking-tight text-slate-950">
              Signup Funnel Overview
            </h2>
            <div className="mt-6 grid items-center gap-4 lg:grid-cols-[1fr_auto_1fr_auto_1fr]">
              {funnelSteps.map((step, index) => (
                <div key={step.label} className="contents">
                  <FunnelStepCard step={step} />
                  {index < funnelSteps.length - 1 ? (
                    <div className="hidden items-center justify-center lg:flex">
                      <ArrowRight className="size-6 text-violet-500" />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <div className="p-6">
            <h3 className="text-sm font-semibold text-slate-950">
              Funnel Conversion Rate
            </h3>
            <div className="mt-6 space-y-6">
              <ConversionBar
                label="Visitor -> Entered"
                value={visitorToEntered}
              />
              <ConversionBar
                label="Entered -> Completed"
                value={enteredToCompleted}
              />
              <ConversionBar
                label="Visitor -> Completed"
                value={signupConversion}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="mb-8 grid gap-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06),0_16px_40px_rgba(15,23,42,0.06)] xl:grid-cols-[1.1fr_0.9fr]">
        <ChartCard
          flush
          title="Signup Trend"
        >
          {isMounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendRows}>
                <CartesianGrid stroke="#eef2f7" vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={72} />
                <Tooltip />
                <Line dataKey="visitors" name="Visitors" stroke="#7c3aed" strokeWidth={2.5} dot={false} />
                <Line dataKey="signupStarted" name="Signup Page Entered" stroke="#2563eb" strokeWidth={2.5} dot={false} />
                <Line dataKey="signups" name="Signup Completed" stroke="#10b981" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <ChartSkeleton />
          )}
        </ChartCard>

        <ChartCard
          flush
          title="Signup by Source"
        >
          {isMounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourceChartRows} layout="vertical" margin={{ left: 16 }}>
                <CartesianGrid stroke="#eef2f7" horizontal={false} />
                <XAxis type="number" tickFormatter={(value) => `${value}%`} tickLine={false} axisLine={false} />
                <YAxis dataKey="source" type="category" tickLine={false} axisLine={false} width={104} />
                <Tooltip />
                <Bar dataKey="signupRate" name="Signup Conversion" fill="#9f7aea" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ChartSkeleton />
          )}
        </ChartCard>
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
            Landing, provider, country, and campaign performance in one module.
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
                Completed signup volume and conversion quality.
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
                Conversion movement by selected acquisition dimension.
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

function SummaryMetric({
  delta,
  label,
  subtext,
  value,
}: {
  delta?: string
  label: string
  subtext?: string
  value: string
}) {
  return (
    <div className="p-6">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <p className="text-3xl font-bold tracking-tight text-slate-950">
          {value}
        </p>
        {delta ? <StatusBadge tone="success">{delta}</StatusBadge> : null}
      </div>
      {subtext ? <p className="mt-3 text-sm font-medium text-slate-500">{subtext}</p> : null}
    </div>
  )
}

function FunnelStepCard({
  step,
}: {
  step: {
    label: string
    value: number
    rate: string
    note: string
    tone: string
  }
}) {
  const toneClass =
    step.tone === "green"
      ? "border-emerald-100 bg-emerald-50/30 text-emerald-600"
      : step.tone === "blue"
        ? "border-blue-100 bg-blue-50/30 text-blue-600"
        : "border-violet-100 bg-violet-50/40 text-violet-600"

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className={cn("mb-6 flex size-10 items-center justify-center rounded-xl border", toneClass)}>
        <CheckCircle2 className="size-5" />
      </div>
      <p className="text-sm font-semibold text-slate-950">{step.label}</p>
      <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
        {formatNumber(step.value)}
      </p>
      <div className="mt-5 flex items-center justify-between text-sm">
        <span className="font-bold text-violet-600">{step.rate}</span>
        <span className="text-slate-500">{step.note}</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-violet-600"
          style={{ width: step.rate }}
        />
      </div>
    </div>
  )
}

function ConversionBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-semibold text-slate-700">{label}</span>
        <span className="font-bold text-slate-950">{value.toFixed(2)}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-violet-600"
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  )
}

function ChartCard({
  flush = false,
  title,
  children,
}: {
  flush?: boolean
  title: string
  children: ReactNode
}) {
  return (
    <section
      className={cn(
        "bg-white p-6",
        flush
          ? "border-b border-slate-100 xl:border-b-0 xl:border-r xl:last:border-r-0"
          : "rounded-2xl border border-slate-200 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]"
      )}
    >
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
      </div>
      <div className="h-72">{children}</div>
    </section>
  )
}

function ChartSkeleton() {
  return <div className="h-full rounded-xl bg-slate-100" />
}

function percentValue(value: string) {
  return Number(value.replace("%", ""))
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function scale(value: number, multiplier: number) {
  return Math.round(value * multiplier)
}

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
