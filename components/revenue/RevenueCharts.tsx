"use client"

import { useEffect, useState } from "react"
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

type ChartCardProps = {
  title: string
  description: string
  children: React.ReactNode
}

function ChartCard({ title, description, children }: ChartCardProps) {
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

type RevenueChartsProps = {
  dailyTrend: {
    date: string
    grossRevenue: number
    refunds: number
    netRevenue: number
  }[]
  planBreakdown: {
    plan: string
    revenue: number
    activePaidUsers: number
  }[]
  subscriberTrend: {
    date: string
    activePaidUsers: number
    newPaidUsers: number
    cancelledSubscribers: number
  }[]
}

export default function RevenueCharts({
  dailyTrend,
  planBreakdown,
  subscriberTrend,
}: RevenueChartsProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsMounted(true))

    return () => cancelAnimationFrame(frame)
  }, [])

  if (!isMounted) {
    return (
      <div className="grid gap-6 xl:grid-cols-2">
        {[
          "Daily Revenue Trend",
          "Revenue by Plan",
          "Paid User Trend",
          "Cancelled Subscribers Trend",
        ].map((title) => (
          <section
            key={title}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]"
          >
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
        title="Daily Revenue Trend"
        description="Gross revenue, refunds, and net revenue by day."
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={dailyTrend}>
            <defs>
              <linearGradient id="netRevenue" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="#6d5dfc" stopOpacity={0.22} />
                <stop offset="95%" stopColor="#6d5dfc" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#eef2f7" vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} width={72} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="netRevenue"
              stroke="#5b3df5"
              fill="url(#netRevenue)"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="grossRevenue"
              stroke="#0f172a"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="refunds"
              stroke="#ef4444"
              strokeWidth={2}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Revenue by Plan"
        description="Net revenue and active paid users by plan."
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={planBreakdown}>
            <CartesianGrid stroke="#eef2f7" vertical={false} />
            <XAxis dataKey="plan" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} width={72} />
            <Tooltip />
            <Bar dataKey="revenue" fill="#5b3df5" radius={[8, 8, 0, 0]} />
            <Bar
              dataKey="activePaidUsers"
              fill="#cbd5e1"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Paid User Trend"
        description="Active paid users and newly converted paid users."
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={subscriberTrend}>
            <CartesianGrid stroke="#eef2f7" vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} width={72} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="activePaidUsers"
              stroke="#5b3df5"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="newPaidUsers"
              stroke="#10b981"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Cancelled Subscribers Trend"
        description="Subscription cancellations are tracked separately."
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={subscriberTrend}>
            <CartesianGrid stroke="#eef2f7" vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} width={72} />
            <Tooltip />
            <Bar
              dataKey="cancelledSubscribers"
              fill="#ef4444"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}
