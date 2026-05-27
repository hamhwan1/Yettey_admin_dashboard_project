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
import { MousePointerClick, TrendingDown, TrendingUp } from "lucide-react"

import DataTable, { type DataTableColumn } from "@/components/admin/DataTable"
import DateRangeControl from "@/components/admin/DateRangeControl"
import ExportActions from "@/components/admin/ExportActions"
import PageHeader from "@/components/admin/PageHeader"
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

type SummaryMetric = {
  label: string
  value: string
  delta: string
  detail: string
  tone?: "positive" | "negative" | "neutral"
}

type VisitorTrendRow = {
  date: string
  visitors: number
  newVisitors: number
  returningVisitors: number
  signups: number
  paidUsers: number
}

type SourceRow = {
  source: string
  type: string
  visitors: number
  newVisitors: number
  returningVisitors: number
  signups: number
  paidUsers: number
  signupConversion: number
  paidConversion: number
  retention: number
}

type UtmRow = {
  utmSource: string
  utmMedium: string
  utmCampaign: string
  utmContent: string
  visitors: number
  signupConversion: number
  paidConversion: number
  quality: "High" | "Medium" | "Low"
}

type SegmentRow = {
  segment: string
  visitors: number
  share: number
  conversion: string
}

const visitorTrendBase: VisitorTrendRow[] = [
  { date: "05-01", visitors: 18400, newVisitors: 13240, returningVisitors: 5160, signups: 980, paidUsers: 260 },
  { date: "05-05", visitors: 22600, newVisitors: 16100, returningVisitors: 6500, signups: 1260, paidUsers: 330 },
  { date: "05-10", visitors: 24800, newVisitors: 17420, returningVisitors: 7380, signups: 1480, paidUsers: 390 },
  { date: "05-15", visitors: 29200, newVisitors: 20180, returningVisitors: 9020, signups: 1760, paidUsers: 470 },
  { date: "05-20", visitors: 31800, newVisitors: 21580, returningVisitors: 10220, signups: 1980, paidUsers: 540 },
  { date: "05-25", visitors: 35400, newVisitors: 23600, returningVisitors: 11800, signups: 2240, paidUsers: 610 },
  { date: "05-30", visitors: 38200, newVisitors: 25180, returningVisitors: 13020, signups: 2510, paidUsers: 690 },
]

const weekdayVisitors = [
  { day: "Mon", visitors: 104200 },
  { day: "Tue", visitors: 118400 },
  { day: "Wed", visitors: 126800 },
  { day: "Thu", visitors: 122600 },
  { day: "Fri", visitors: 113200 },
  { day: "Sat", visitors: 84600 },
  { day: "Sun", visitors: 72800 },
]

const hourlyVisitors = [
  { hour: "00", visitors: 18400 },
  { hour: "03", visitors: 13200 },
  { hour: "06", visitors: 16800 },
  { hour: "09", visitors: 38600 },
  { hour: "12", visitors: 52800 },
  { hour: "15", visitors: 61200 },
  { hour: "18", visitors: 56800 },
  { hour: "21", visitors: 43200 },
]

const monthlyVisitors = [
  { month: "Jun", visitors: 412000, signups: 21600 },
  { month: "Jul", visitors: 438000, signups: 23100 },
  { month: "Aug", visitors: 482000, signups: 25800 },
  { month: "Sep", visitors: 506000, signups: 27900 },
  { month: "Oct", visitors: 532000, signups: 29400 },
  { month: "Nov", visitors: 574000, signups: 31800 },
  { month: "Dec", visitors: 548000, signups: 30600 },
  { month: "Jan", visitors: 612000, signups: 35200 },
  { month: "Feb", visitors: 668000, signups: 38400 },
  { month: "Mar", visitors: 724000, signups: 42100 },
  { month: "Apr", visitors: 786000, signups: 45600 },
  { month: "May", visitors: 842390, signups: 48210 },
]

const sourceBreakdownBase: SourceRow[] = [
  { source: "Organic", type: "Organic", visitors: 226000, newVisitors: 154800, returningVisitors: 71200, signups: 14820, paidUsers: 6820, signupConversion: 6.6, paidConversion: 3.0, retention: 54 },
  { source: "Google Search", type: "Organic", visitors: 184200, newVisitors: 128400, returningVisitors: 55800, signups: 12460, paidUsers: 5940, signupConversion: 6.8, paidConversion: 3.2, retention: 52 },
  { source: "Direct", type: "Direct", visitors: 196400, newVisitors: 118600, returningVisitors: 77800, signups: 11620, paidUsers: 7210, signupConversion: 5.9, paidConversion: 3.7, retention: 58 },
  { source: "YouTube", type: "Organic", visitors: 86200, newVisitors: 62400, returningVisitors: 23800, signups: 4920, paidUsers: 2510, signupConversion: 5.7, paidConversion: 2.9, retention: 61 },
  { source: "Instagram", type: "Social", visitors: 62800, newVisitors: 48200, returningVisitors: 14600, signups: 4210, paidUsers: 1980, signupConversion: 6.7, paidConversion: 3.2, retention: 38 },
  { source: "Referral", type: "Referral", visitors: 48200, newVisitors: 28400, returningVisitors: 19800, signups: 3860, paidUsers: 2420, signupConversion: 8.0, paidConversion: 5.0, retention: 64 },
  { source: "Paid Ads", type: "Paid", visitors: 39800, newVisitors: 32800, returningVisitors: 7000, signups: 2420, paidUsers: 1260, signupConversion: 6.1, paidConversion: 3.2, retention: 34 },
  { source: "Unknown", type: "Unknown", visitors: 28400, newVisitors: 20400, returningVisitors: 8000, signups: 980, paidUsers: 380, signupConversion: 3.5, paidConversion: 1.3, retention: 29 },
]

const utmRowsBase: UtmRow[] = [
  { utmSource: "google", utmMedium: "organic", utmCampaign: "always-on-search", utmContent: "pricing-snippet", visitors: 126400, signupConversion: 6.9, paidConversion: 3.4, quality: "High" },
  { utmSource: "youtube", utmMedium: "creator", utmCampaign: "shorts-launch", utmContent: "tutorial-midroll", visitors: 86200, signupConversion: 5.7, paidConversion: 2.9, quality: "High" },
  { utmSource: "instagram", utmMedium: "social", utmCampaign: "creator-clips", utmContent: "story-link", visitors: 62800, signupConversion: 6.7, paidConversion: 3.2, quality: "Medium" },
  { utmSource: "naver", utmMedium: "organic", utmCampaign: "kr-search", utmContent: "blog-serp", visitors: 52400, signupConversion: 5.4, paidConversion: 2.7, quality: "Medium" },
  { utmSource: "meta", utmMedium: "paid", utmCampaign: "vpick-prospecting", utmContent: "lookalike-video", visitors: 39800, signupConversion: 6.1, paidConversion: 3.2, quality: "Low" },
  { utmSource: "partner", utmMedium: "referral", utmCampaign: "agency-bundle", utmContent: "landing-cta", visitors: 28400, signupConversion: 8.2, paidConversion: 5.4, quality: "High" },
]

const visitorSegmentsBase: SegmentRow[] = [
  { segment: "New Visitors", visitors: 584200, share: 69, conversion: "5.1%" },
  { segment: "Returning Visitors", visitors: 258190, share: 31, conversion: "7.3%" },
  { segment: "Signup Users", visitors: 48210, share: 5.7, conversion: "100%" },
  { segment: "Paid Users", visitors: 12480, share: 1.5, conversion: "25.9%" },
  { segment: "Active Users", visitors: 36480, share: 4.3, conversion: "75.7%" },
]

const conversionFlow = [
  { stage: "Visitor", value: 842390, rate: "100%", dropOff: "0%" },
  { stage: "Signup", value: 48210, rate: "5.7%", dropOff: "94.3%" },
  { stage: "Activated", value: 36480, rate: "75.7%", dropOff: "24.3%" },
  { stage: "Paid", value: 12480, rate: "34.2%", dropOff: "65.8%" },
]

const sourceColors = ["#7c3aed", "#3b82f6", "#10b981", "#f59e0b", "#64748b", "#14b8a6", "#ef4444", "#94a3b8"]

const sourceColumns: DataTableColumn<SourceRow>[] = [
  {
    key: "source",
    header: "Source",
    render: (row) => <span className="font-semibold">{row.source}</span>,
  },
  {
    key: "type",
    header: "Type",
    render: (row) => <StatusBadge tone={row.type === "Paid" ? "danger" : row.type === "Unknown" ? "neutral" : "success"}>{row.type}</StatusBadge>,
  },
  {
    key: "visitors",
    header: "Visitors",
    render: (row) => formatNumber(row.visitors),
  },
  {
    key: "signups",
    header: "Signups",
    render: (row) => formatNumber(row.signups),
  },
  {
    key: "paidUsers",
    header: "Paid Users",
    render: (row) => formatNumber(row.paidUsers),
  },
  {
    key: "signupConversion",
    header: "Signup CVR",
    render: (row) => `${row.signupConversion.toFixed(1)}%`,
  },
  {
    key: "paidConversion",
    header: "Paid CVR",
    render: (row) => `${row.paidConversion.toFixed(1)}%`,
  },
  {
    key: "retention",
    header: "Retention",
    render: (row) => `${row.retention}%`,
  },
]

const utmColumns: DataTableColumn<UtmRow>[] = [
  {
    key: "utmSource",
    header: "utm_source",
    render: (row) => <span className="font-semibold">{row.utmSource}</span>,
  },
  {
    key: "utmMedium",
    header: "utm_medium",
    render: (row) => row.utmMedium,
  },
  {
    key: "utmCampaign",
    header: "utm_campaign",
    render: (row) => row.utmCampaign,
  },
  {
    key: "utmContent",
    header: "utm_content",
    render: (row) => row.utmContent,
  },
  {
    key: "visitors",
    header: "Visitors",
    render: (row) => formatNumber(row.visitors),
  },
  {
    key: "signupConversion",
    header: "Signup CVR",
    render: (row) => `${row.signupConversion.toFixed(1)}%`,
  },
  {
    key: "paidConversion",
    header: "Paid CVR",
    render: (row) => `${row.paidConversion.toFixed(1)}%`,
  },
  {
    key: "quality",
    header: "Quality",
    render: (row) => (
      <StatusBadge tone={row.quality === "High" ? "success" : row.quality === "Low" ? "danger" : "neutral"}>
        {row.quality}
      </StatusBadge>
    ),
  },
]

export default function VisitorAnalyticsDashboard() {
  const [isMounted, setIsMounted] = useState(false)
  const { period, startDate, endDate, compareMode } = useDashboardDateRange()
  const periodMultiplier = getPeriodMultiplier(period)

  const visitorTrend = useMemo(
    () =>
      visitorTrendBase.map((row) => ({
        ...row,
        visitors: scale(row.visitors, periodMultiplier),
        newVisitors: scale(row.newVisitors, periodMultiplier),
        returningVisitors: scale(row.returningVisitors, periodMultiplier),
        signups: scale(row.signups, periodMultiplier),
        paidUsers: scale(row.paidUsers, periodMultiplier),
      })),
    [periodMultiplier]
  )

  const sources = useMemo(
    () =>
      sourceBreakdownBase.map((row) => ({
        ...row,
        visitors: scale(row.visitors, periodMultiplier),
        newVisitors: scale(row.newVisitors, periodMultiplier),
        returningVisitors: scale(row.returningVisitors, periodMultiplier),
        signups: scale(row.signups, periodMultiplier),
        paidUsers: scale(row.paidUsers, periodMultiplier),
      })),
    [periodMultiplier]
  )

  const utmRows = useMemo(
    () =>
      utmRowsBase.map((row) => ({
        ...row,
        visitors: scale(row.visitors, periodMultiplier),
      })),
    [periodMultiplier]
  )

  const segments = useMemo(
    () =>
      visitorSegmentsBase.map((row) => ({
        ...row,
        visitors: scale(row.visitors, periodMultiplier),
      })),
    [periodMultiplier]
  )

  const flow = useMemo(
    () =>
      conversionFlow.map((row) => ({
        ...row,
        value: scale(row.value, periodMultiplier),
      })),
    [periodMultiplier]
  )

  const totalVisitors = sources.reduce((sum, row) => sum + row.visitors, 0)
  const newVisitors = sources.reduce((sum, row) => sum + row.newVisitors, 0)
  const returningVisitors = sources.reduce((sum, row) => sum + row.returningVisitors, 0)
  const totalSignups = sources.reduce((sum, row) => sum + row.signups, 0)
  const paidUsers = sources.reduce((sum, row) => sum + row.paidUsers, 0)
  const signupConversion = (totalSignups / totalVisitors) * 100
  const paidConversion = (paidUsers / totalVisitors) * 100

  const summary: SummaryMetric[] = useMemo(
    () => [
      {
        label: "Total Visitors",
        value: formatNumber(totalVisitors),
        delta: "+18.4%",
        detail: "All tracked sessions",
        tone: "positive",
      },
      {
        label: "New Visitors",
        value: formatNumber(newVisitors),
        delta: "+14.8%",
        detail: `${((newVisitors / totalVisitors) * 100).toFixed(1)}% of traffic`,
        tone: "positive",
      },
      {
        label: "Returning Visitors",
        value: formatNumber(returningVisitors),
        delta: "+9.2%",
        detail: `${((returningVisitors / totalVisitors) * 100).toFixed(1)}% repeat traffic`,
        tone: "positive",
      },
      {
        label: "Signup Conversion",
        value: `${signupConversion.toFixed(2)}%`,
        delta: "+0.6pp",
        detail: "Visitors to signups",
        tone: "positive",
      },
      {
        label: "Paid Conversion",
        value: `${paidConversion.toFixed(2)}%`,
        delta: "-0.2pp",
        detail: "Visitors to paid users",
        tone: "negative",
      },
    ],
    [
      newVisitors,
      paidConversion,
      returningVisitors,
      signupConversion,
      totalVisitors,
    ]
  )

  const exportPayload = useMemo(
    () => ({
      title: "Visitor Analytics Report",
      subtitle:
        "Visitor-only report covering traffic trend, acquisition, UTM, segmentation, and conversion flow.",
      filename: "visitor-analytics-report",
      filters: {
        "Date range": getDateRangeLabel(startDate, endDate),
        Compare: getCompareModeLabel(compareMode),
      },
      kpis: summary.map((metric) => ({
        label: metric.label,
        value: metric.value,
        detail: `${metric.delta} / ${metric.detail}`,
      })),
      charts: [
        {
          title: "Visitor Trend",
          points: visitorTrend.map((row) => ({
            label: row.date,
            value: row.visitors,
            secondary: `${row.signups} signups`,
          })),
        },
        {
          title: "Monthly Visitor Trend",
          points: monthlyVisitors.map((row) => ({
            label: row.month,
            value: row.visitors,
            secondary: `${row.signups} signups`,
          })),
        },
      ],
      datasets: [
        {
          name: "Visitor Summary",
          rows: summary.map((metric) => ({
            Metric: metric.label,
            Value: metric.value,
            Delta: metric.delta,
            Detail: metric.detail,
          })),
        },
        { name: "Visitor Trend", rows: visitorTrend },
        { name: "Acquisition Sources", rows: sources },
        { name: "UTM Breakdown", rows: utmRows },
        { name: "Visitor Segmentation", rows: segments },
        { name: "Conversion Flow", rows: flow },
      ],
    }),
    [
      compareMode,
      endDate,
      flow,
      segments,
      sources,
      startDate,
      summary,
      utmRows,
      visitorTrend,
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
          { label: "Visitors" },
        ]}
        title="Visitor Analytics Dashboard"
        description="Analyze where visitors come from, how they behave, and how traffic converts into signups and paid users."
        actions={<ExportActions payload={exportPayload} />}
      />

      <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
        <DateRangeControl />
      </section>

      <SectionHeader
        title="Visitor Summary"
        description="Traffic volume, returning behavior, and visitor-to-signup/payment conversion."
      />
      <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {summary.map((metric) => (
          <SummaryCard key={metric.label} metric={metric} />
        ))}
      </section>

      <section className="mb-8 grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
        <ChartCard
          title="Visitor Trend Analytics"
          description="Daily visitors, new visitors, signups, and paid conversion movement."
        >
          {isMounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={visitorTrend}>
                <CartesianGrid stroke="#eef2f7" vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={72} />
                <Tooltip />
                <Line dataKey="visitors" stroke="#7c3aed" strokeWidth={2.5} type="monotone" />
                <Line dataKey="newVisitors" stroke="#3b82f6" strokeWidth={2} type="monotone" />
                <Line dataKey="signups" stroke="#10b981" strokeWidth={2} type="monotone" />
                <Line dataKey="paidUsers" stroke="#f59e0b" strokeWidth={2} type="monotone" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <ChartSkeleton />
          )}
        </ChartCard>

        <ConversionFlowCard flow={flow} />
      </section>

      <section className="mb-8">
        <SectionHeader
          title="Time Pattern Analytics"
          description="Understand when visitors arrive by weekday, hour, and month."
        />
        <div className="grid gap-6 xl:grid-cols-3">
          <ChartCard title="Weekday Average Visitors" description="Average visitor volume by day of week.">
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scaleRows(weekdayVisitors, "visitors", periodMultiplier)}>
                  <CartesianGrid stroke="#eef2f7" vertical={false} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} width={64} />
                  <Tooltip />
                  <Bar dataKey="visitors" fill="#7c3aed" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ChartSkeleton />
            )}
          </ChartCard>

          <ChartCard title="Hourly Visitor Pattern" description="Traffic concentration across the day.">
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={scaleRows(hourlyVisitors, "visitors", periodMultiplier)}>
                  <CartesianGrid stroke="#eef2f7" vertical={false} />
                  <XAxis dataKey="hour" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} width={64} />
                  <Tooltip />
                  <Area dataKey="visitors" stroke="#3b82f6" fill="#dbeafe" strokeWidth={2} type="monotone" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <ChartSkeleton />
            )}
          </ChartCard>

          <ChartCard title="Recent 1Y Visitor Trend" description="Monthly traffic and signup movement.">
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyVisitors}>
                  <CartesianGrid stroke="#eef2f7" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} width={64} />
                  <Tooltip />
                  <Line dataKey="visitors" stroke="#7c3aed" strokeWidth={2.5} type="monotone" />
                  <Line dataKey="signups" stroke="#10b981" strokeWidth={2} type="monotone" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <ChartSkeleton />
            )}
          </ChartCard>
        </div>
      </section>

      <section className="mb-8 grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <ChartCard
          title="Acquisition Source Mix"
          description="Visitor distribution by organic, direct, referral, paid, social, and unknown sources."
        >
          {isMounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sources}
                  dataKey="visitors"
                  nameKey="source"
                  innerRadius={68}
                  outerRadius={108}
                  paddingAngle={2}
                >
                  {sources.map((source, index) => (
                    <Cell key={source.source} fill={sourceColors[index % sourceColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <ChartSkeleton />
          )}
        </ChartCard>

        <ChartCard
          title="Visitor Segmentation"
          description="New, returning, signup, paid, and active visitor segments."
        >
          <div className="space-y-4">
            {segments.map((segment) => (
              <SegmentRow key={segment.segment} segment={segment} />
            ))}
          </div>
        </ChartCard>
      </section>

      <section className="mb-8">
        <SectionHeader
          title="Acquisition / UTM Analytics"
          description="Visitor source quality and UTM campaign breakdown focused on signup and paid conversion."
        />
        <DataTable
          columns={sourceColumns}
          data={sources}
          summary={`Showing 1 to ${sources.length} of ${sources.length} visitor acquisition sources`}
          compactPagination
        />
      </section>

      <section>
        <SectionHeader
          title="UTM Breakdown"
          description="Mock UTM-level traffic quality for source, medium, campaign, and content analysis."
        />
        <DataTable
          columns={utmColumns}
          data={utmRows}
          summary={`Showing 1 to ${utmRows.length} of ${utmRows.length} UTM rows`}
          compactPagination
        />
      </section>
    </DashboardLayout>
  )
}

function SummaryCard({ metric }: { metric: SummaryMetric }) {
  const positive = metric.tone !== "negative"

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_10px_24px_rgba(15,23,42,0.04)]">
      <p className="text-sm font-medium text-slate-500">{metric.label}</p>
      <p className="mt-3 text-2xl font-bold tracking-tight text-slate-950">
        {metric.value}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold",
            positive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"
          )}
        >
          {positive ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
          {metric.delta}
        </span>
        <span className="text-xs font-semibold text-slate-500">{metric.detail}</span>
      </div>
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
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      <div className="h-80">{children}</div>
    </section>
  )
}

function ConversionFlowCard({ flow }: { flow: typeof conversionFlow }) {
  const max = flow[0]?.value ?? 1

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-950">Conversion Flow</h2>
        <p className="mt-1 text-sm text-slate-500">
          Visitor to signup, activation, and paid conversion path.
        </p>
      </div>
      <div className="space-y-5">
        {flow.map((step) => (
          <div key={step.stage}>
            <div className="mb-2 flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-slate-950">{step.stage}</p>
                <p className="text-sm text-slate-500">
                  {formatNumber(step.value)} visitors / {step.rate}
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                Drop-off {step.dropOff}
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-violet-600"
                style={{ width: `${Math.max(2, (step.value / max) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function SegmentRow({ segment }: { segment: SegmentRow }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <MousePointerClick className="size-4 text-violet-600" />
          <span className="font-semibold text-slate-950">{segment.segment}</span>
        </div>
        <span className="text-sm font-bold text-slate-950">
          {formatNumber(segment.visitors)}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-violet-600"
          style={{ width: `${Math.min(100, segment.share)}%` }}
        />
      </div>
      <p className="mt-2 text-xs font-semibold text-slate-500">
        Share {segment.share}% / Conversion {segment.conversion}
      </p>
    </div>
  )
}

function SectionHeader({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  )
}

function ChartSkeleton() {
  return <div className="h-full animate-pulse rounded-xl bg-slate-100" />
}

function scale(value: number, multiplier: number) {
  return Math.round(value * multiplier)
}

function scaleRows<T extends Record<string, unknown>, K extends keyof T>(
  rows: T[],
  key: K,
  multiplier: number
) {
  return rows.map((row) => ({
    ...row,
    [key]: typeof row[key] === "number" ? scale(row[key], multiplier) : row[key],
  }))
}
