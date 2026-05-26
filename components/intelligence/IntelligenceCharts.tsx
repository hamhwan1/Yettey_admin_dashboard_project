"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowRight } from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Radar,
  RadarChart,
  PolarAngleAxis,
  PolarGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

const visitorTrend = [
  { date: "D-6", visitors: 18400, signups: 980, paidUsers: 260 },
  { date: "D-5", visitors: 22600, signups: 1260, paidUsers: 330 },
  { date: "D-4", visitors: 24800, signups: 1480, paidUsers: 390 },
  { date: "D-3", visitors: 29200, signups: 1760, paidUsers: 470 },
  { date: "D-2", visitors: 31800, signups: 1980, paidUsers: 540 },
  { date: "D-1", visitors: 35400, signups: 2240, paidUsers: 610 },
  { date: "Today", visitors: 38200, signups: 2510, paidUsers: 690 },
]

const revenueTrend = [
  { date: "D-6", revenue: 32500, newPaidUsers: 260, activePaidUsers: 12600, arpu: 38 },
  { date: "D-5", revenue: 38400, newPaidUsers: 330, activePaidUsers: 13140, arpu: 41 },
  { date: "D-4", revenue: 42100, newPaidUsers: 390, activePaidUsers: 13940, arpu: 44 },
  { date: "D-3", revenue: 46800, newPaidUsers: 470, activePaidUsers: 14580, arpu: 47 },
  { date: "D-2", revenue: 51200, newPaidUsers: 540, activePaidUsers: 15120, arpu: 49 },
  { date: "D-1", revenue: 56800, newPaidUsers: 610, activePaidUsers: 15880, arpu: 51 },
  { date: "Today", revenue: 62400, newPaidUsers: 690, activePaidUsers: 16420, arpu: 54 },
]

const sourceQuality = [
  { channel: "YouTube", signup: 7.4, paid: 4.9, retention: 61 },
  { channel: "Google", signup: 6.2, paid: 3.6, retention: 52 },
  { channel: "Instagram", signup: 6.7, paid: 3.1, retention: 38 },
  { channel: "Referral", signup: 8.0, paid: 5.0, retention: 58 },
  { channel: "Paid Ads", signup: 6.1, paid: 3.2, retention: 34 },
]

const funnelDropoff = [
  { stage: "Visitor", conversion: 100, dropOff: 0, avgTime: 2 },
  { stage: "Signup", conversion: 5.7, dropOff: 94.3, avgTime: 11 },
  { stage: "Project", conversion: 81.5, dropOff: 18.5, avgTime: 18 },
  { stage: "AI Gen", conversion: 90.2, dropOff: 9.8, avgTime: 23 },
  { stage: "Export", conversion: 75.8, dropOff: 24.2, avgTime: 72 },
  { stage: "Paid", conversion: 33.5, dropOff: 66.5, avgTime: 120 },
]

const retentionCurve = [
  { cohort: "D1", overall: 74, youtube: 82, instagram: 61, thumbnailUsers: 88 },
  { cohort: "D7", overall: 51, youtube: 59, instagram: 37, thumbnailUsers: 68 },
  { cohort: "D30", overall: 34, youtube: 42, instagram: 24, thumbnailUsers: 49 },
]

const productIntelligence = [
  { feature: "Thumbnail", usage: 72, conversion: 88, retention: 84, credit: 46 },
  { feature: "AI Video", usage: 92, conversion: 81, retention: 76, credit: 91 },
  { feature: "Dubbing", usage: 64, conversion: 79, retention: 71, credit: 72 },
  { feature: "Captions", usage: 58, conversion: 54, retention: 63, credit: 38 },
  { feature: "Trend Finder", usage: 43, conversion: 61, retention: 58, credit: 31 },
]

const aiOps = [
  { time: "00:00", queueLatency: 94, processingTime: 132, failRatio: 0.4, retryRatio: 1.8, gpu: 66, credits: 52000 },
  { time: "04:00", queueLatency: 88, processingTime: 128, failRatio: 0.3, retryRatio: 1.6, gpu: 61, credits: 48000 },
  { time: "08:00", queueLatency: 132, processingTime: 156, failRatio: 0.6, retryRatio: 2.2, gpu: 74, credits: 71000 },
  { time: "12:00", queueLatency: 178, processingTime: 188, failRatio: 0.9, retryRatio: 3.1, gpu: 82, credits: 96000 },
  { time: "16:00", queueLatency: 246, processingTime: 214, failRatio: 1.2, retryRatio: 3.7, gpu: 88, credits: 118000 },
  { time: "20:00", queueLatency: 164, processingTime: 176, failRatio: 0.7, retryRatio: 2.5, gpu: 79, credits: 84000 },
]

function ChartCard({
  title,
  description,
  href,
  ctaLabel,
  children,
}: {
  title: string
  description: string
  href: string
  ctaLabel: string
  children: React.ReactNode
}) {
  return (
    <section className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-[0_2px_4px_rgba(15,23,42,0.08),0_16px_32px_rgba(15,23,42,0.08)]">
      <div className="mb-6">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
          <span className="rounded-full border border-slate-200 bg-slate-50 p-1.5 text-slate-400 transition group-hover:border-violet-200 group-hover:bg-violet-50 group-hover:text-violet-600">
            <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      <div className="h-72">{children}</div>
      <Link
        href={href}
        className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-sm font-semibold text-violet-600 transition hover:text-violet-700"
      >
        <span>{ctaLabel}</span>
        <ArrowRight className="size-4 transition group-hover:translate-x-1" />
      </Link>
    </section>
  )
}

export default function IntelligenceCharts() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsMounted(true))

    return () => cancelAnimationFrame(frame)
  }, [])

  if (!isMounted) {
    return (
      <div className="grid gap-6 xl:grid-cols-2">
        {["Visitor Trend", "Revenue Trend", "Traffic Source Quality", "Funnel Drop-off", "Retention Curve", "Product Intelligence", "AI Operations"].map((title) => (
          <section key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
            <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
            <div className="mt-6 h-72 rounded-xl bg-slate-100" />
          </section>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <ChartCard
        title="Visitor Trend Chart"
        description="Visitors, signups, and paid users over the selected period."
        href="/dashboard/intelligence/visitors"
        ctaLabel="View visitor analytics"
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={visitorTrend}>
            <CartesianGrid stroke="#eef2f7" vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} width={72} />
            <Tooltip />
            <Line dataKey="visitors" stroke="#0f172a" strokeWidth={2} />
            <Line dataKey="signups" stroke="#5b3df5" strokeWidth={2} />
            <Line dataKey="paidUsers" stroke="#10b981" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Revenue Trend Chart"
        description="Revenue, new paid users, active paid users, and ARPU trend."
        href="/dashboard/revenue"
        ctaLabel="Open revenue intelligence"
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={revenueTrend}>
            <CartesianGrid stroke="#eef2f7" vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} width={72} />
            <Tooltip />
            <Area dataKey="revenue" stroke="#5b3df5" fill="#ede9fe" strokeWidth={2} />
            <Line dataKey="newPaidUsers" stroke="#10b981" strokeWidth={2} />
            <Line dataKey="activePaidUsers" stroke="#0f172a" strokeWidth={2} />
            <Line dataKey="arpu" stroke="#f59e0b" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Traffic Source Quality Chart"
        description="Signup conversion, paid conversion, and retention by acquisition channel."
        href="/dashboard/intelligence/acquisition"
        ctaLabel="View acquisition intelligence"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sourceQuality}>
            <CartesianGrid stroke="#eef2f7" vertical={false} />
            <XAxis dataKey="channel" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} width={72} />
            <Tooltip />
            <Bar dataKey="signup" fill="#c4b5fd" radius={[8, 8, 0, 0]} />
            <Bar dataKey="paid" fill="#5b3df5" radius={[8, 8, 0, 0]} />
            <Bar dataKey="retention" fill="#10b981" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Funnel Drop-off Chart"
        description="Conversion, drop-off, and average completion time by stage."
        href="/dashboard/intelligence/funnel"
        ctaLabel="Open funnel analytics"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={funnelDropoff}>
            <CartesianGrid stroke="#eef2f7" vertical={false} />
            <XAxis dataKey="stage" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} width={72} />
            <Tooltip />
            <Bar dataKey="conversion" fill="#5b3df5" radius={[8, 8, 0, 0]} />
            <Bar dataKey="dropOff" fill="#ef4444" radius={[8, 8, 0, 0]} />
            <Line dataKey="avgTime" stroke="#0f172a" strokeWidth={2} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Retention Curve"
        description="D1, D7, D30 retention by channel and feature cohort."
        href="/dashboard/intelligence/retention"
        ctaLabel="View retention intelligence"
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={retentionCurve}>
            <CartesianGrid stroke="#eef2f7" vertical={false} />
            <XAxis dataKey="cohort" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} width={72} />
            <Tooltip />
            <Line dataKey="overall" stroke="#5b3df5" strokeWidth={2} />
            <Line dataKey="youtube" stroke="#10b981" strokeWidth={2} />
            <Line dataKey="instagram" stroke="#ef4444" strokeWidth={2} />
            <Line dataKey="thumbnailUsers" stroke="#f59e0b" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Product Intelligence Chart"
        description="Usage, conversion impact, retention impact, and credit usage by feature."
        href="/dashboard/intelligence/features"
        ctaLabel="View feature intelligence"
      >
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={productIntelligence}>
            <PolarGrid />
            <PolarAngleAxis dataKey="feature" />
            <Tooltip />
            <Radar dataKey="usage" stroke="#5b3df5" fill="#5b3df5" fillOpacity={0.18} />
            <Radar dataKey="conversion" stroke="#10b981" fill="#10b981" fillOpacity={0.12} />
            <Radar dataKey="retention" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} />
            <Radar dataKey="credit" stroke="#ef4444" fill="#ef4444" fillOpacity={0.08} />
          </RadarChart>
        </ResponsiveContainer>
      </ChartCard>

      <section className="xl:col-span-2">
        <ChartCard
          title="AI Operations Chart"
          description="Queue latency, processing time, fail ratio, retry ratio, GPU utilization, and credit consumption."
          href="/dashboard/intelligence/ai-operations"
          ctaLabel="View AI operations"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={aiOps}>
              <CartesianGrid stroke="#eef2f7" vertical={false} />
              <XAxis dataKey="time" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} width={72} />
              <Tooltip />
              <Line dataKey="queueLatency" stroke="#5b3df5" strokeWidth={2} />
              <Line dataKey="processingTime" stroke="#0f172a" strokeWidth={2} />
              <Line dataKey="failRatio" stroke="#ef4444" strokeWidth={2} />
              <Line dataKey="retryRatio" stroke="#f59e0b" strokeWidth={2} />
              <Line dataKey="gpu" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>
    </div>
  )
}
