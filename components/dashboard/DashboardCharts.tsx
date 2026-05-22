"use client"

import { useEffect, useState } from "react"
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

import { growthTrend, retentionTrend } from "./dashboard-data"

function ChartShell({
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

export function DashboardCharts() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsMounted(true))

    return () => cancelAnimationFrame(frame)
  }, [])

  if (!isMounted) {
    return (
      <div className="grid gap-6 xl:grid-cols-2">
        {["User Growth Trend", "Retention"].map((title) => (
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
      <ChartShell
        title="User Growth Trend"
        description="Visitors, signups, returning users, and paid conversions."
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={growthTrend}>
            <CartesianGrid stroke="#eef2f7" vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} width={72} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="visitors"
              stroke="#0f172a"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="signups"
              stroke="#5b3df5"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="returningUsers"
              stroke="#10b981"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="paidConversions"
              stroke="#f59e0b"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartShell>

      <ChartShell
        title="Retention"
        description="D1, D7, D30 retention and returning user trend."
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={retentionTrend}>
            <CartesianGrid stroke="#eef2f7" vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} width={72} />
            <Tooltip />
            <Bar dataKey="d1" fill="#5b3df5" radius={[8, 8, 0, 0]} />
            <Bar dataKey="d7" fill="#94a3b8" radius={[8, 8, 0, 0]} />
            <Bar dataKey="d30" fill="#cbd5e1" radius={[8, 8, 0, 0]} />
            <Line
              type="monotone"
              dataKey="returningUsers"
              stroke="#10b981"
              strokeWidth={2}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartShell>
    </div>
  )
}
