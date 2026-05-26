"use client"

import Link from "next/link"
import { useMemo, useState } from "react"

import DataTable, { type DataTableColumn } from "@/components/admin/DataTable"
import DateRangeControl from "@/components/admin/DateRangeControl"
import ExportActions from "@/components/admin/ExportActions"
import PageHeader from "@/components/admin/PageHeader"
import SideDrawer from "@/components/admin/SideDrawer"
import StatCard from "@/components/admin/StatCard"
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
  type RevenueDailyRow,
  type RevenueService,
} from "./revenue-data"

type RevenuePageProps = {
  service: RevenueService
}

type DrawerState =
  | { type: "payment"; item: RevenueDailyRow }
  | { type: "plan"; item: { plan: string; revenue: number; activePaidUsers: number } }
  | { type: "metric"; item: { label: string; value: string; detail: string } }
  | { type: "failed"; rows: RevenueDailyRow[] }
  | { type: "cancelled"; rows: RevenueDailyRow[] }
  | null

const serviceFilters: { label: string; value: RevenueService; href: string }[] = [
  { label: "Overall", value: "Overall", href: "/dashboard/revenue" },
  { label: "Yettey", value: "Yettey", href: "/dashboard/revenue/yettey" },
  { label: "VPICK", value: "VPICK", href: "/dashboard/revenue/vpick" },
]

const planFilters = ["All", "Free", "Starter", "Growth", "Pro", "Enterprise"]

export default function RevenuePage({ service }: RevenuePageProps) {
  const [plan, setPlan] = useState("All")
  const [page, setPage] = useState(1)
  const [drawer, setDrawer] = useState<DrawerState>(null)
  const { period, startDate, endDate, compareMode, resetDateRange } =
    useDashboardDateRange()
  const periodMultiplier = getPeriodMultiplier(period)

  const rows = useMemo(() => {
    const source = getRevenueRows(service).filter(
      (row) => plan === "All" || row.plan === plan
    )

    return source.map((row) => ({
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
    }))
  }, [periodMultiplier, plan, service])

  const summary = getRevenueSummary(rows)
  const planBreakdown = getPlanBreakdown(rows)
  const pageTitle = service === "Overall" ? "Revenue Analytics" : `${service} Revenue`
  const exportPayload = useMemo(
    () => ({
      title: `${pageTitle} Report`,
      subtitle:
        "Revenue, paid user movement, cancellation, refund, net revenue, and failed payment report.",
      filename: `${service.toLowerCase()}-revenue-report`,
      filters: {
        Service: service,
        Plan: plan,
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
          label: "New Paid Users",
          value: formatNumber(summary.newPaidUsers),
          detail: "New paid conversions",
        },
        {
          label: "Active Paid Users",
          value: formatNumber(summary.activePaidUsers),
          detail: "Basis for net paid users",
        },
        {
          label: "Cancelled Subscribers",
          value: formatNumber(summary.cancelledSubscribers),
          detail: "Separate cancellation count",
        },
        {
          label: "Churn Rate",
          value: `${summary.churnRate.toFixed(1)}%`,
          detail: "Cancelled / active paid users",
        },
        {
          label: "Net Paid Users",
          value: formatNumber(summary.netPaidUsers),
          detail: "Equals active paid users",
        },
        {
          label: "ARPU",
          value: formatCurrency(summary.arpu),
          detail: "Net revenue per active paid user",
        },
        {
          label: "Failed Payments",
          value: formatNumber(summary.failedPayments),
          detail: "Payment recovery queue",
        },
      ],
      charts: [
        {
          title: "Revenue by Plan",
          points: planBreakdown.map((item) => ({
            label: item.plan,
            value: item.revenue,
            secondary: `${item.activePaidUsers} active users`,
          })),
        },
        {
          title: "Daily Net Revenue",
          points: rows.map((row) => ({
            label: row.date,
            value: row.netRevenue,
            secondary: `${row.failedPayments} failed payments`,
          })),
        },
      ],
      datasets: [
        {
          name: "Plan-level Payment Table",
          rows: rows.map((row) => ({
            Date: row.date,
            Service: row.service,
            Plan: row.plan,
            "New Paid Users": row.newPaidUsers,
            "Active Paid Users": row.activePaidUsers,
            "Cancelled Subscribers": row.cancelledSubscribers,
            "Gross Revenue": row.grossRevenue,
            Refunds: row.refunds,
            "Net Revenue": row.netRevenue,
            "Failed Payments": row.failedPayments,
          })),
        },
        {
          name: "Revenue by Plan",
          rows: planBreakdown.map((item) => ({
            Plan: item.plan,
            Revenue: item.revenue,
            "Active Paid Users": item.activePaidUsers,
          })),
        },
      ],
    }),
    [
      compareMode,
      endDate,
      pageTitle,
      plan,
      planBreakdown,
      rows,
      service,
      startDate,
      summary,
    ]
  )
  const openMetric = (label: string, value: string, detail: string) => {
    setDrawer({ type: "metric", item: { label, value, detail } })
  }

  const columns: DataTableColumn<RevenueDailyRow>[] = [
    { key: "date", header: "Date", render: (row) => row.date },
    { key: "service", header: "Service", render: (row) => row.service },
    {
      key: "plan",
      header: "Plan",
      render: (row) => (
        <button
          className="font-semibold text-violet-600 transition hover:text-violet-700"
          onClick={(event) => {
            event.stopPropagation()
            const planItem = planBreakdown.find((item) => item.plan === row.plan)
            if (planItem) {
              setDrawer({ type: "plan", item: planItem })
            }
          }}
        >
          {row.plan}
        </button>
      ),
    },
    {
      key: "newPaidUsers",
      header: "New Paid Users",
      render: (row) => formatNumber(row.newPaidUsers),
    },
    {
      key: "activePaidUsers",
      header: "Active Paid Users",
      render: (row) => formatNumber(row.activePaidUsers),
    },
    {
      key: "cancelledSubscribers",
      header: "Cancelled Subscribers",
      render: (row) => formatNumber(row.cancelledSubscribers),
    },
    {
      key: "grossRevenue",
      header: "Gross Revenue",
      render: (row) => formatCurrency(row.grossRevenue),
    },
    {
      key: "refunds",
      header: "Refunds",
      render: (row) => (
        <span className="text-rose-500">{formatCurrency(row.refunds)}</span>
      ),
    },
    {
      key: "netRevenue",
      header: "Net Revenue",
      render: (row) => (
        <span className="font-semibold">{formatCurrency(row.netRevenue)}</span>
      ),
    },
    {
      key: "failedPayments",
      header: "Failed Payments",
      render: (row) => formatNumber(row.failedPayments),
    },
  ]

  return (
    <DashboardLayout>
      <PageHeader
        breadcrumbs={[
          { label: "Dashboards" },
          { label: "Revenue" },
          { label: service },
        ]}
        title={pageTitle}
        description="Interactive mock analysis for service revenue, paid user movement, cancellations, refunds, and failed payments."
        actions={<ExportActions payload={exportPayload} />}
      />

      <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
        <div className="mb-6 grid gap-6 xl:grid-cols-[1fr_1.4fr]">
          <FilterGroup label="Service">
            {serviceFilters.map((item) => (
              <Link
                key={item.value}
                href={item.href}
                className={filterClass(service === item.value)}
              >
                {item.label}
              </Link>
            ))}
          </FilterGroup>
          <FilterGroup label="Plan">
            {planFilters.map((item) => (
              <button
                key={item}
                className={filterClass(plan === item)}
                onClick={() => {
                  setPlan(item)
                  setPage(1)
                }}
              >
                {item}
              </button>
            ))}
          </FilterGroup>
        </div>
        <DateRangeControl />
        <button
          className="mt-5 rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
          onClick={() => {
            resetDateRange()
            setPlan("All")
            setPage(1)
          }}
        >
          Reset All
        </button>
      </section>

      <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <button
          className="h-full text-left"
          onClick={() =>
            openMetric(
              "Total Revenue",
              formatCurrency(summary.totalRevenue),
              "Net revenue after refunds"
            )
          }
        >
          <StatCard
            label="Total Revenue"
            value={formatCurrency(summary.totalRevenue)}
            detail="Net revenue after refunds"
            insight="Revenue trend is separated into gross, refunds, and net movement."
            ctaLabel="View revenue detail"
            interactive
          />
        </button>
        <button
          className="h-full text-left"
          onClick={() =>
            openMetric(
              "New Paid Users",
              formatNumber(summary.newPaidUsers),
              "New paid conversions"
            )
          }
        >
          <StatCard
            label="New Paid Users"
            value={formatNumber(summary.newPaidUsers)}
            detail="New paid conversions"
            insight="New paid users are the leading indicator for plan-level growth."
            ctaLabel="View paid conversion detail"
            interactive
          />
        </button>
        <button
          className="h-full text-left"
          onClick={() =>
            openMetric(
              "Active Paid Users",
              formatNumber(summary.activePaidUsers),
              "Basis for net paid users"
            )
          }
        >
          <StatCard
            label="Active Paid Users"
            value={formatNumber(summary.activePaidUsers)}
            detail="Basis for net paid users"
            insight="Active paid users are the source of truth for net paid users."
            ctaLabel="Open paid user detail"
            interactive
          />
        </button>
        <button
          className="h-full text-left"
          onClick={() => setDrawer({ type: "cancelled", rows })}
        >
          <StatCard
            label="Cancelled Subscribers"
            value={formatNumber(summary.cancelledSubscribers)}
            detail="Open cancellation list"
            insight="Cancellations are tracked separately from inactive free users."
            ctaLabel="View cancellation list"
            interactive
          />
        </button>
        <button
          className="h-full text-left"
          onClick={() =>
            openMetric(
              "Churn Rate",
              `${summary.churnRate.toFixed(1)}%`,
              "Cancelled / active paid users"
            )
          }
        >
          <StatCard
            label="Churn Rate"
            value={`${summary.churnRate.toFixed(1)}%`}
            detail="Cancelled / active paid users"
            insight="Churn should be interpreted alongside failed payments and refunds."
            ctaLabel="Open churn detail"
            interactive
          />
        </button>
        <button
          className="h-full text-left"
          onClick={() =>
            openMetric(
              "Net Paid Users",
              formatNumber(summary.netPaidUsers),
              "Equals active paid users"
            )
          }
        >
          <StatCard
            label="Net Paid Users"
            value={formatNumber(summary.netPaidUsers)}
            detail="Equals active paid users"
            insight="Net paid users are counted from active paid subscriptions."
            ctaLabel="View net paid user detail"
            interactive
          />
        </button>
        <button
          className="h-full text-left"
          onClick={() =>
            openMetric(
              "ARPU",
              formatCurrency(summary.arpu),
              "Net revenue per active paid user"
            )
          }
        >
          <StatCard
            label="ARPU"
            value={formatCurrency(summary.arpu)}
            detail="Net revenue per active paid user"
            insight="ARPU helps compare plan quality and expansion potential."
            ctaLabel="Open ARPU detail"
            interactive
          />
        </button>
        <button
          className="h-full text-left"
          onClick={() => setDrawer({ type: "failed", rows })}
        >
          <StatCard
            label="Failed Payments"
            value={formatNumber(summary.failedPayments)}
            detail="Open failed payment list"
            insight="Failed payments are an operational risk for revenue recovery."
            ctaLabel="View failed payments"
            interactive
          />
        </button>
      </div>

      <div className="mb-8">
        <RevenueCharts
          dailyTrend={getDailyTrend(rows)}
          planBreakdown={planBreakdown}
          subscriberTrend={getSubscriberTrend(rows)}
        />
      </div>

      <DataTable
        columns={columns}
        data={rows}
        summary={`Showing page ${page} of 4 plan-level payment pages`}
        page={page}
        totalPages={4}
        onPageChange={setPage}
        onRowClick={(item) => setDrawer({ type: "payment", item })}
      />

      <RevenueDrawer drawer={drawer} onClose={() => setDrawer(null)} />
    </DashboardLayout>
  )
}

function FilterGroup({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
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
          ? `${drawer.item.service} ${drawer.item.plan} Payment`
          : drawer?.type === "plan"
            ? `${drawer.item.plan} Revenue`
            : drawer?.type === "metric"
              ? drawer.item.label
              : drawer?.type === "failed"
                ? "Failed Payments"
                : drawer?.type === "cancelled"
                  ? "Cancelled Subscribers"
                  : "Revenue Detail"
      }
      description="Interactive mock drawer for API-backed details later."
      onClose={onClose}
    >
      {drawer?.type === "payment" ? <KeyValueGrid item={drawer.item} /> : null}
      {drawer?.type === "plan" ? <KeyValueGrid item={drawer.item} /> : null}
      {drawer?.type === "metric" ? <KeyValueGrid item={drawer.item} /> : null}
      {drawer?.type === "failed" || drawer?.type === "cancelled" ? (
        <div className="space-y-3">
          {drawer.rows.slice(0, 5).map((row) => (
            <div
              key={`${row.date}-${row.service}-${row.plan}`}
              className="rounded-xl border border-slate-100 p-4"
            >
              <p className="font-semibold text-slate-950">
                {row.date} / {row.service} / {row.plan}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Failed payments: {row.failedPayments} / Cancelled:{" "}
                {row.cancelledSubscribers}
              </p>
            </div>
          ))}
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
