"use client"

import { Plus } from "lucide-react"

import AdminButton from "@/components/admin/AdminButton"
import DataTable, { type DataTableColumn } from "@/components/admin/DataTable"
import DateRangeControl from "@/components/admin/DateRangeControl"
import { FilterBar, FilterField } from "@/components/admin/FilterBar"
import ExportActions from "@/components/admin/ExportActions"
import PageHeader from "@/components/admin/PageHeader"
import StatCard from "@/components/admin/StatCard"
import StatusBadge from "@/components/admin/StatusBadge"
import DashboardLayout from "@/components/layout/DashboardLayout"
import {
  getCompareModeLabel,
  getDateRangeLabel,
  useDashboardDateRange,
} from "@/lib/dashboard-date-store"

const subscriptions = [
  {
    account: "Cloudike Team",
    product: "Yettey",
    plan: "Pro",
    status: "Active",
    amount: "$49",
    renewal: "2026-04-15",
  },
  {
    account: "Studio Alpha",
    product: "Yettey",
    plan: "Growth",
    status: "Active",
    amount: "$129",
    renewal: "2026-04-19",
  },
  {
    account: "Vpick Ops",
    product: "Vpick",
    plan: "Free",
    status: "Inactive",
    amount: "$0",
    renewal: "2026-03-15",
  },
  {
    account: "Media Lab",
    product: "Yettey",
    plan: "Lite",
    status: "Active",
    amount: "$19",
    renewal: "2026-05-01",
  },
]

type Subscription = (typeof subscriptions)[number]

const columns: DataTableColumn<Subscription>[] = [
  {
    key: "account",
    header: "Account",
    render: (subscription) => (
      <span className="font-semibold">{subscription.account}</span>
    ),
  },
  {
    key: "product",
    header: "Product",
    render: (subscription) => subscription.product,
  },
  {
    key: "plan",
    header: "Plan",
    render: (subscription) => subscription.plan,
  },
  {
    key: "status",
    header: "Status",
    render: (subscription) => (
      <StatusBadge
        tone={subscription.status === "Active" ? "success" : "danger"}
      >
        {subscription.status}
      </StatusBadge>
    ),
  },
  {
    key: "amount",
    header: "Amount",
    render: (subscription) => subscription.amount,
  },
  {
    key: "renewal",
    header: "Renewal",
    render: (subscription) => subscription.renewal,
  },
]

export default function BillingOverviewPage() {
  const { startDate, endDate, compareMode } = useDashboardDateRange()
  const exportPayload = {
    title: "Billing Overview Report",
    subtitle:
      "Subscription, revenue, billing health, renewal, and failed payment report.",
    filename: "billing-overview-report",
    filters: {
      Product: "All Products",
      Status: "Active",
      Plan: "All Plans",
      "Date range": getDateRangeLabel(startDate, endDate),
      Compare: getCompareModeLabel(compareMode),
    },
    kpis: [
      { label: "MRR", value: "$24.5K", detail: "+12.9% this month" },
      {
        label: "Active Subscriptions",
        value: "1,284",
        detail: "Mock subscription count",
      },
      { label: "Failed Payments", value: "18", detail: "Needs follow-up" },
    ],
    datasets: [
      {
        name: "Billing Data",
        rows: subscriptions.map((subscription) => ({
          Account: subscription.account,
          Product: subscription.product,
          Plan: subscription.plan,
          Status: subscription.status,
          Amount: subscription.amount,
          Renewal: subscription.renewal,
        })),
      },
    ],
  }

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Billing"
        title="Billing Overview"
        description="Review revenue, subscription movement, billing health, and plan performance across Yettey and Vpick."
        actions={
          <div className="flex flex-wrap gap-2">
            <ExportActions payload={exportPayload} />
            <AdminButton variant="primary">
              <Plus className="size-4" />
              Create invoice
            </AdminButton>
          </div>
        }
      />

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <StatCard label="MRR" value="$24.5K" detail="+12.9% this month" />
        <StatCard
          label="Active Subscriptions"
          value="1,284"
          detail="Mock subscription count"
        />
        <StatCard label="Failed Payments" value="18" detail="Needs follow-up" />
      </div>

      <FilterBar searchPlaceholder="Search account, product or plan...">
        <FilterField label="Product" value="All Products" />
        <FilterField label="Status" value="Active" />
        <FilterField label="Plan" value="All Plans" />
        <FilterField label="Renewal" value="2024-05-01 ~ 2024-05-31" calendar />
      </FilterBar>

      <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
        <DateRangeControl />
      </section>

      <DataTable
        columns={columns}
        data={subscriptions}
        summary="Showing 1-10 of 1,284 subscriptions"
      />
    </DashboardLayout>
  )
}
