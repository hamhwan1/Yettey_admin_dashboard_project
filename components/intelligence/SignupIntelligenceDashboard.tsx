"use client"

import { useEffect, useMemo, useState } from "react"
import {
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
import DashboardLayout from "@/components/layout/DashboardLayout"
import {
  getCompareModeLabel,
  getDateRangeLabel,
  getPeriodMultiplier,
  useDashboardDateRange,
} from "@/lib/dashboard-date-store"
import { formatNumber } from "@/components/dashboard/dashboard-data"
import {
  landingPagePerformance,
  monthlySignupAnalytics,
  regionBreakdown,
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

export default function SignupIntelligenceDashboard() {
  const [isMounted, setIsMounted] = useState(false)
  const [drawer, setDrawer] = useState<DrawerItem | null>(null)
  const { period, startDate, endDate, compareMode } = useDashboardDateRange()
  const periodMultiplier = getPeriodMultiplier(period)
  const totalSignups = Math.round(
    signupSourceBreakdown.reduce((sum, row) => sum + row.signups, 0) *
      periodMultiplier
  )
  const totalVisitors = Math.round(
    signupSourceBreakdown.reduce((sum, row) => sum + row.visitors, 0) *
      periodMultiplier
  )
  const organicSignups = Math.round(
    signupSourceBreakdown
      .filter((row) => row.group === "Organic")
      .reduce((sum, row) => sum + row.signups, 0) * periodMultiplier
  )
  const paidSignups = Math.round(
    signupSourceBreakdown
      .filter((row) => row.group === "Paid")
      .reduce((sum, row) => sum + row.signups, 0) * periodMultiplier
  )
  const bestSource = signupSourceBreakdown.reduce((best, row) =>
    row.signups > best.signups ? row : best
  )
  const bestLanding = landingPagePerformance.reduce((best, row) =>
    row.signups > best.signups ? row : best
  )
  const sourceRows = signupSourceBreakdown.map((row) => ({
    ...row,
    visitors: Math.round(row.visitors * periodMultiplier),
    signups: Math.round(row.signups * periodMultiplier),
  }))
  const utmRows = utmPerformance.map((row) => ({
    ...row,
    visitors: Math.round(row.visitors * periodMultiplier),
    signups: Math.round(row.signups * periodMultiplier),
  }))
  const exportPayload = useMemo(
    () => ({
      title: "Signup Acquisition Intelligence Report",
      subtitle:
        "Signup acquisition, UTM performance, organic vs paid quality, landing page conversion, and signup funnel report.",
      filename: "signup-acquisition-intelligence-report",
      filters: {
        "Date range": getDateRangeLabel(startDate, endDate),
        Compare: getCompareModeLabel(compareMode),
      },
      kpis: [
        {
          label: "New Signups",
          value: formatNumber(totalSignups),
          detail: "Filtered signup volume",
        },
        {
          label: "Signup Conversion",
          value: `${((totalSignups / totalVisitors) * 100).toFixed(2)}%`,
          detail: "Signups / visitors",
        },
        {
          label: "Organic Signups",
          value: formatNumber(organicSignups),
          detail: "Search, direct, and creator-led sources",
        },
        {
          label: "Paid Signups",
          value: formatNumber(paidSignups),
          detail: "Paid social and CPC sources",
        },
        {
          label: "Best Source",
          value: bestSource.source,
          detail: `${bestSource.signupConversion} signup conversion`,
        },
        {
          label: "Best Landing Page",
          value: bestLanding.landingPage,
          detail: `${bestLanding.signupConversion} signup conversion`,
        },
      ],
      charts: [
        {
          title: "Signup Trend",
          points: signupTrend.map((point) => ({
            label: point.date,
            value: point.signups,
            secondary: `${point.signupConversion}% conversion`,
          })),
        },
        {
          title: "Organic vs Paid",
          points: signupTrafficGroups.map((group) => ({
            label: group.group,
            value: group.signups,
            secondary: `${group.retention}% retention`,
          })),
        },
      ],
      datasets: [
        { name: "UTM Performance", rows: utmRows },
        { name: "Channel Metrics", rows: sourceRows },
        { name: "Organic vs Paid", rows: signupTrafficGroups },
        { name: "Monthly Analytics", rows: monthlySignupAnalytics },
        { name: "Country Region Breakdown", rows: regionBreakdown },
        { name: "Landing Page Analysis", rows: landingPagePerformance },
        { name: "Conversion Funnel", rows: signupFunnel },
      ],
    }),
    [
      bestLanding,
      bestSource,
      compareMode,
      endDate,
      organicSignups,
      paidSignups,
      sourceRows,
      startDate,
      totalSignups,
      totalVisitors,
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
        title="Signup Acquisition Intelligence Dashboard"
        description="Understand which channels, UTM campaigns, landing pages, and regions are creating high-quality signups."
        actions={<ExportActions payload={exportPayload} />}
      />

      <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
        <DateRangeControl />
      </section>

      <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="New Signups"
          value={formatNumber(totalSignups)}
          detail="+5.7% vs baseline"
          insight="Signup lift is concentrated in search, referral, and creator-led YouTube traffic."
          href="/dashboard/intelligence/signups?metric=new-signups"
          ctaLabel="View signup trend"
        />
        <StatCard
          label="Signup Conversion"
          value={`${((totalSignups / totalVisitors) * 100).toFixed(2)}%`}
          detail="Signups / visitors"
          insight="Referral traffic converts best, while broad paid ads need landing page tightening."
          href="/dashboard/intelligence/signups?metric=signup-conversion"
          ctaLabel="Open conversion detail"
        />
        <StatCard
          label="Organic Signups"
          value={formatNumber(organicSignups)}
          detail="Search, direct, creator-led"
          insight="Organic signup quality is stronger than paid traffic by retention and paid conversion."
          href="/dashboard/intelligence/signups?segment=organic"
          ctaLabel="View organic sources"
        />
        <StatCard
          label="Paid Signups"
          value={formatNumber(paidSignups)}
          detail="Paid social and CPC"
          insight="Paid acquisition volume is useful, but retention quality trails organic cohorts."
          href="/dashboard/intelligence/signups?segment=paid"
          ctaLabel="View paid sources"
        />
        <StatCard
          label="Best Source"
          value={bestSource.source}
          detail={`${bestSource.signupConversion} signup conversion`}
          insight="Referral currently produces the best signup-to-paid quality signal."
          href="/dashboard/intelligence/acquisition/referral"
          ctaLabel="Open source detail"
        />
        <StatCard
          label="Best Landing Page"
          value={bestLanding.landingPage}
          detail={`${bestLanding.signupConversion} signup conversion`}
          insight="Thumbnail-focused traffic is showing the strongest signup intent."
          href="/dashboard/intelligence/signups?landing=thumbnail"
          ctaLabel="View landing analysis"
        />
      </div>

      <div className="mb-8 grid gap-6 xl:grid-cols-2">
        {isMounted ? (
          <>
            <ChartCard
              title="Signup Trend Chart"
              description="Visitors, signups, and signup conversion over the selected period."
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={signupTrend}>
                  <CartesianGrid stroke="#eef2f7" vertical={false} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} width={72} />
                  <Tooltip />
                  <Line dataKey="visitors" stroke="#0f172a" strokeWidth={2} />
                  <Line dataKey="signups" stroke="#5b3df5" strokeWidth={2} />
                  <Line dataKey="signupConversion" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="Organic vs Paid Comparison"
              description="Signup volume and retention quality by acquisition group."
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={signupTrafficGroups}>
                  <CartesianGrid stroke="#eef2f7" vertical={false} />
                  <XAxis dataKey="group" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} width={72} />
                  <Tooltip />
                  <Bar dataKey="signups" fill="#5b3df5" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="retention" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="Source Breakdown"
              description="Channel-level signup creation across search, paid, direct, referral, and owned traffic."
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sourceRows}>
                  <CartesianGrid stroke="#eef2f7" vertical={false} />
                  <XAxis dataKey="source" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} width={72} />
                  <Tooltip />
                  <Bar dataKey="signups" fill="#5b3df5" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="Monthly Signup Analytics"
              description="Monthly signup growth split by organic, paid, and referral traffic."
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlySignupAnalytics}>
                  <CartesianGrid stroke="#eef2f7" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} width={72} />
                  <Tooltip />
                  <Bar dataKey="organic" fill="#10b981" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="paid" fill="#5b3df5" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="referral" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </>
        ) : (
          ["Signup Trend Chart", "Organic vs Paid Comparison", "Source Breakdown", "Monthly Signup Analytics"].map((title) => (
            <ChartCard
              key={title}
              title={title}
              description="Loading chart preview..."
            >
              <div className="h-full rounded-xl bg-slate-100" />
            </ChartCard>
          ))
        )}
      </div>

      <div className="mb-8">
        <DataTable
          columns={sourceColumns}
          data={sourceRows}
          summary={`Showing 1 to ${sourceRows.length} of ${sourceRows.length} channel metrics`}
          compactPagination
          onRowClick={(row) => setDrawer(row)}
        />
      </div>

      <div className="mb-8 grid gap-8 xl:grid-cols-2">
        <TableBlock title="UTM / Acquisition Analysis">
          <DataTable
            columns={utmColumns}
            data={utmRows}
            summary={`Showing 1 to ${utmRows.length} of ${utmRows.length} UTM rows`}
            compactPagination
            onRowClick={(row) => setDrawer(row)}
          />
        </TableBlock>

        <TableBlock title="Country / Region Breakdown">
          <DataTable
            columns={regionColumns}
            data={regionBreakdown}
            summary={`Showing 1 to ${regionBreakdown.length} of ${regionBreakdown.length} regions`}
            compactPagination
            onRowClick={(row) => setDrawer(row)}
          />
        </TableBlock>
      </div>

      <div className="mb-8 grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <TableBlock title="Landing Page Analysis">
          <DataTable
            columns={landingColumns}
            data={landingPagePerformance}
            summary={`Showing 1 to ${landingPagePerformance.length} of ${landingPagePerformance.length} landing pages`}
            compactPagination
            onRowClick={(row) => setDrawer(row)}
          />
        </TableBlock>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
          <h2 className="text-lg font-semibold text-slate-950">
            Signup Conversion Funnel
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Visitor to signup completion path with drop-off visibility.
          </p>
          <div className="mt-6 space-y-4">
            {signupFunnel.map((step) => (
              <div key={step.stage} className="rounded-xl border border-slate-100 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-slate-950">{step.stage}</p>
                  <StatusBadge tone={step.dropOff === "0%" ? "success" : "neutral"}>
                    {step.conversion}
                  </StatusBadge>
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  {formatNumber(step.value)} users / {step.dropOff} drop-off
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

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

const sourceColumns: DataTableColumn<SourceRow>[] = [
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
    header: "Signup Conversion",
    render: (row) => <span className="font-semibold text-violet-600">{row.signupConversion}</span>,
  },
  { key: "paidConversion", header: "Paid Conversion", render: (row) => row.paidConversion },
  { key: "retention", header: "Retention", render: (row) => row.retention },
]

const utmColumns: DataTableColumn<UtmRow>[] = [
  { key: "utmSource", header: "utm_source", render: (row) => row.utmSource },
  { key: "utmMedium", header: "utm_medium", render: (row) => row.utmMedium },
  { key: "utmCampaign", header: "utm_campaign", render: (row) => row.utmCampaign },
  { key: "utmContent", header: "utm_content", render: (row) => row.utmContent },
  { key: "signups", header: "Signups", render: (row) => formatNumber(row.signups) },
  { key: "signupConversion", header: "Signup Conv.", render: (row) => row.signupConversion },
]

const regionColumns: DataTableColumn<RegionRow>[] = [
  { key: "country", header: "Country", render: (row) => row.country },
  { key: "region", header: "Region", render: (row) => row.region },
  { key: "signups", header: "Signups", render: (row) => formatNumber(row.signups) },
  { key: "conversion", header: "Conversion", render: (row) => row.conversion },
]

const landingColumns: DataTableColumn<LandingRow>[] = [
  {
    key: "landingPage",
    header: "Landing Page",
    render: (row) => <span className="font-semibold">{row.landingPage}</span>,
  },
  { key: "visitors", header: "Visitors", render: (row) => formatNumber(row.visitors) },
  { key: "signups", header: "Signups", render: (row) => formatNumber(row.signups) },
  { key: "signupConversion", header: "Signup Conv.", render: (row) => row.signupConversion },
  { key: "paidConversion", header: "Paid Conv.", render: (row) => row.paidConversion },
]
