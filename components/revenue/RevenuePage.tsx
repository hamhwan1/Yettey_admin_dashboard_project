"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import {
  AlertTriangle,
  CreditCard,
  DollarSign,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react"

import DateRangeControl from "@/components/admin/DateRangeControl"
import ExportActions from "@/components/admin/ExportActions"
import PageHeader from "@/components/admin/PageHeader"
import SideDrawer from "@/components/admin/SideDrawer"
import StatusBadge from "@/components/admin/StatusBadge"
import DashboardLayout from "@/components/layout/DashboardLayout"
import {
  getCompareModeLabel,
  getDateRangeLabel,
  getPeriodMultiplier,
  useDashboardDateRange,
} from "@/lib/dashboard-date-store"
import { cn } from "@/lib/utils"
import RevenueCharts from "./RevenueCharts"
import {
  formatCurrency,
  formatNumber,
  getDailyTrend,
  getPlanBreakdown,
  getRevenueRows,
  getRevenueSummary,
  getSubscriberTrend,
  type RevenueService,
} from "./revenue-data"

type RevenuePageProps = {
  service: RevenueService
}

type RecentPayment = {
  time: string
  user: string
  plan: string
  amount: number
  status: "Paid" | "Failed"
  method: string
  service: string
}

type DrawerState =
  | { type: "payment"; item: RecentPayment }
  | { type: "metric"; item: { label: string; value: string; detail: string } }
  | { type: "failed"; rows: RecentPayment[] }
  | null

const serviceFilters: { label: string; value: RevenueService; href: string }[] = [
  { label: "Overall", value: "Overall", href: "/dashboard/revenue" },
  { label: "Yettey", value: "Yettey", href: "/dashboard/revenue/yettey" },
  { label: "VPICK", value: "VPICK", href: "/dashboard/revenue/vpick" },
]

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

export default function RevenuePage({ service }: RevenuePageProps) {
  const [drawer, setDrawer] = useState<DrawerState>(null)
  const { period, startDate, endDate, compareMode, resetDateRange } =
    useDashboardDateRange()
  const periodMultiplier = getPeriodMultiplier(period)

  const rows = useMemo(
    () =>
      getRevenueRows(service).map((row) => ({
        ...row,
        newPaidUsers: Math.round(row.newPaidUsers * periodMultiplier),
        activePaidUsers: Math.round(row.activePaidUsers * periodMultiplier),
        cancelledSubscribers: Math.round(
          row.cancelledSubscribers * periodMultiplier
        ),
        grossRevenue: Math.round(row.grossRevenue * periodMultiplier),
        refunds: Math.round(row.refunds * periodMultiplier),
        netRevenue: Math.round(row.netRevenue * periodMultiplier),
        failedPayments: Math.round(row.failedPayments * periodMultiplier),
      })),
    [periodMultiplier, service]
  )

  const summary = getRevenueSummary(rows)
  const planBreakdown = getPlanBreakdown(rows)
  const dailyTrend = getDailyTrend(rows)
  const subscriberTrend = getSubscriberTrend(rows)
  const netPaidGrowth = summary.newPaidUsers - summary.cancelledSubscribers
  const pageTitle = service === "Overall" ? "Revenue Overview" : `${service} Revenue`

  const recentPayments = useMemo(
    () =>
      [...rows]
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 8)
        .map((row, index): RecentPayment => ({
          time: `${row.date} ${["14:32", "13:18", "11:05", "10:22", "09:44", "08:30", "07:58", "07:22"][index]}`,
          user: paymentUsers[index % paymentUsers.length],
          plan: row.plan,
          amount: Math.max(row.netRevenue, 0),
          status: row.failedPayments > 7 && index % 3 === 1 ? "Failed" : "Paid",
          method: "Card",
          service: row.service,
        })),
    [rows]
  )

  const exportPayload = useMemo(
    () => ({
      title: `${pageTitle} Report`,
      subtitle:
        "Executive revenue report covering revenue health, paid growth, churn, plan performance, and recent payments.",
      filename: `${service.toLowerCase()}-revenue-overview-report`,
      filters: {
        Service: service,
        "Date range": getDateRangeLabel(startDate, endDate),
        Compare: getCompareModeLabel(compareMode),
      },
      kpis: [
        {
          label: "Total Revenue",
          value: formatCurrency(summary.totalRevenue),
          detail: "Net revenue after refunds",
        },
        {
          label: "Active Paid Users",
          value: formatNumber(summary.activePaidUsers),
          detail: "Active paid subscription users",
        },
        {
          label: "New Paid Users",
          value: formatNumber(summary.newPaidUsers),
          detail: "Selected period first paid users",
        },
        {
          label: "Net Paid Growth",
          value: formatNumber(netPaidGrowth),
          detail: "New paid users - churn users",
        },
        {
          label: "ARPU",
          value: formatCurrency(summary.arpu),
          detail: "Revenue / active paid users",
        },
        {
          label: "Failed Payments",
          value: formatNumber(summary.failedPayments),
          detail: "Payment failure count",
        },
      ],
      charts: [
        {
          title: "Daily Net Revenue",
          points: dailyTrend.map((row) => ({
            label: row.date,
            value: row.netRevenue,
            secondary: `${formatCurrency(row.grossRevenue)} gross`,
          })),
        },
        {
          title: "Plan Revenue",
          points: planBreakdown.map((row) => ({
            label: row.plan,
            value: row.revenue,
            secondary: `${formatNumber(row.activePaidUsers)} active paid users`,
          })),
        },
      ],
      datasets: [
        { name: "Daily Revenue Trend", rows: dailyTrend },
        { name: "Subscriber Trend", rows: subscriberTrend },
        { name: "Plan Distribution", rows: planBreakdown },
        { name: "Recent Payments", rows: recentPayments },
      ],
    }),
    [
      compareMode,
      dailyTrend,
      endDate,
      netPaidGrowth,
      pageTitle,
      planBreakdown,
      recentPayments,
      service,
      startDate,
      subscriberTrend,
      summary,
    ]
  )

  const openMetric = (label: string, value: string, detail: string) => {
    setDrawer({ type: "metric", item: { label, value, detail } })
  }

  return (
    <DashboardLayout>
      <PageHeader
        breadcrumbs={[
          { label: "Dashboards" },
          { label: "Revenue" },
          { label: service === "Overall" ? "Overview" : service },
        ]}
        title={pageTitle}
        description="Track paid subscription performance and revenue health."
        actions={<ExportActions payload={exportPayload} />}
      />

      <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-2">
            {serviceFilters.map((item) => (
              <Link
                key={item.value}
                href={item.href}
                className={filterClass(service === item.value)}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <button
            className="w-fit rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
            onClick={resetDateRange}
          >
            Reset Date
          </button>
        </div>
        <DateRangeControl />
      </section>

      <section className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06),0_16px_40px_rgba(15,23,42,0.06)]">
        <div className="grid divide-y divide-slate-100 lg:grid-cols-3 lg:divide-x lg:divide-y-0 2xl:grid-cols-6">
          <RevenueMetricCard
            detail="Net revenue after refunds"
            icon={<DollarSign className="size-5" />}
            label="Total Revenue"
            onClick={() =>
              openMetric(
                "Total Revenue",
                formatCurrency(summary.totalRevenue),
                "Net revenue after refunds"
              )
            }
            tone="violet"
            value={formatCurrency(summary.totalRevenue)}
          />
          <RevenueMetricCard
            detail="Current valid paid users"
            icon={<Users className="size-5" />}
            label="Active Paid Users"
            onClick={() =>
              openMetric(
                "Active Paid Users",
                formatNumber(summary.activePaidUsers),
                "Active subscription + valid payment"
              )
            }
            tone="blue"
            value={formatNumber(summary.activePaidUsers)}
          />
          <RevenueMetricCard
            detail="First paid users in period"
            icon={<UserPlus className="size-5" />}
            label="New Paid Users"
            onClick={() =>
              openMetric(
                "New Paid Users",
                formatNumber(summary.newPaidUsers),
                "Selected period first paid conversions"
              )
            }
            tone="blue"
            value={formatNumber(summary.newPaidUsers)}
          />
          <RevenueMetricCard
            detail="New paid - churn users"
            icon={<TrendingUp className="size-5" />}
            label="Net Paid Growth"
            onClick={() =>
              openMetric(
                "Net Paid Growth",
                formatNumber(netPaidGrowth),
                "New paid users - churn users"
              )
            }
            tone="green"
            value={formatNumber(netPaidGrowth)}
          />
          <RevenueMetricCard
            detail="Revenue / active paid users"
            icon={<CreditCard className="size-5" />}
            label="ARPU"
            onClick={() =>
              openMetric(
                "ARPU",
                formatCurrency(summary.arpu),
                "Revenue / active paid users"
              )
            }
            tone="amber"
            value={formatCurrency(summary.arpu)}
          />
          <RevenueMetricCard
            detail="Payment failure count"
            icon={<AlertTriangle className="size-5" />}
            label="Failed Payments"
            onClick={() =>
              setDrawer({
                type: "failed",
                rows: recentPayments.filter((payment) => payment.status === "Failed"),
              })
            }
            tone="rose"
            value={formatNumber(summary.failedPayments)}
          />
        </div>
      </section>

      <div className="mb-8">
        <RevenueCharts
          dailyTrend={dailyTrend}
          planBreakdown={planBreakdown}
          subscriberTrend={subscriberTrend}
          summary={summary}
        />
      </div>

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
              {recentPayments.slice(0, 8).map((payment) => (
                <tr
                  key={`${payment.time}-${payment.user}-${payment.plan}`}
                  className="cursor-pointer transition hover:bg-violet-50/50"
                  onClick={() => setDrawer({ type: "payment", item: payment })}
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
                    {formatCurrency(payment.amount)}
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

      <RevenueDrawer drawer={drawer} onClose={() => setDrawer(null)} />
    </DashboardLayout>
  )
}

function RevenueMetricCard({
  detail,
  icon,
  label,
  onClick,
  tone,
  value,
}: {
  detail: string
  icon: React.ReactNode
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

function filterClass(active: boolean) {
  return cn(
    "flex h-9 items-center rounded-lg px-3 text-sm font-semibold transition hover:bg-slate-100 hover:text-slate-950",
    active
      ? "bg-violet-600 text-white shadow-sm shadow-violet-600/20 hover:bg-violet-600 hover:text-white"
      : "text-slate-600"
  )
}

function RevenueDrawer({
  drawer,
  onClose,
}: {
  drawer: DrawerState
  onClose: () => void
}) {
  return (
    <SideDrawer
      open={Boolean(drawer)}
      title={
        drawer?.type === "payment"
          ? `${drawer.item.plan} Payment`
          : drawer?.type === "metric"
            ? drawer.item.label
            : drawer?.type === "failed"
              ? "Failed Payments"
              : "Revenue Detail"
      }
      description="Mock revenue detail. Replace with payment, invoice, and subscription API data later."
      onClose={onClose}
    >
      {drawer?.type === "payment" ? <KeyValueGrid item={drawer.item} /> : null}
      {drawer?.type === "metric" ? <KeyValueGrid item={drawer.item} /> : null}
      {drawer?.type === "failed" ? (
        <div className="space-y-3">
          {drawer.rows.length ? (
            drawer.rows.map((payment) => (
              <div
                key={`${payment.time}-${payment.user}`}
                className="rounded-xl border border-slate-100 p-4"
              >
                <p className="font-semibold text-slate-950">{payment.user}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {payment.time} / {payment.plan} / {formatCurrency(payment.amount)}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">
              No failed payment rows in the current mock slice.
            </p>
          )}
        </div>
      ) : null}
    </SideDrawer>
  )
}

function KeyValueGrid({ item }: { item: Record<string, string | number> }) {
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
