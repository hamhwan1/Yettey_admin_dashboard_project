"use client"

import { Plus } from "lucide-react"
import { useMemo, useState } from "react"

import AdminButton from "@/components/admin/AdminButton"
import DataTable, { type DataTableColumn } from "@/components/admin/DataTable"
import DateRangeControl from "@/components/admin/DateRangeControl"
import ExportActions from "@/components/admin/ExportActions"
import PageHeader from "@/components/admin/PageHeader"
import SideDrawer from "@/components/admin/SideDrawer"
import StatusBadge from "@/components/admin/StatusBadge"
import DashboardLayout from "@/components/layout/DashboardLayout"
import {
  getCompareModeLabel,
  getDateRangeLabel,
  useDashboardDateRange,
} from "@/lib/dashboard-date-store"
import {
  type ProductService,
  formatKrw,
  getPlansByProduct,
} from "@/lib/pricing-plans"
import { cn } from "@/lib/utils"

type Plan = ReturnType<typeof createBillingPlans>[number]

export default function BillingPlansClient({ product }: { product: "Yettey" | "Vpick" }) {
  const productKey: ProductService = product === "Vpick" ? "VPICK" : "Yettey"
  const plans = useMemo(() => createBillingPlans(productKey), [productKey])
  const [status, setStatus] = useState("All")
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Plan | null>(null)
  const { startDate, endDate, compareMode, resetDateRange } =
    useDashboardDateRange()
  const filtered = useMemo(
    () => plans.filter((plan) => status === "All" || plan.status === status),
    [plans, status]
  )
  const exportPayload = useMemo(
    () => ({
      title: `${product} Plans Report`,
      subtitle: "Filtered billing plan configuration and lifecycle report.",
      filename: `${product.toLowerCase()}-plans-report`,
      filters: {
        Product: product,
        Status: status,
        "Date range": getDateRangeLabel(startDate, endDate),
        Compare: getCompareModeLabel(compareMode),
      },
      kpis: [
        { label: "Plans", value: String(filtered.length), detail: "Filtered rows" },
        {
          label: "Active Plans",
          value: String(filtered.filter((plan) => plan.status === "Active").length),
        },
        {
          label: "Inactive Plans",
          value: String(filtered.filter((plan) => plan.status === "Inactive").length),
        },
      ],
      datasets: [
        {
          name: "Billing Data",
          rows: filtered.map((plan) => ({
            "Plan Name": plan.name,
            Price: formatKrw(plan.price),
            Credits: plan.credits,
            Limits: plan.limits.join(", "),
            Status: plan.status,
            "Created At": plan.createdAt,
            "Stopped At": plan.stoppedAt,
          })),
        },
      ],
    }),
    [compareMode, endDate, filtered, product, startDate, status]
  )
  const columns: DataTableColumn<Plan>[] = [
    { key: "name", header: "Plan Name", render: (plan) => <span className="font-semibold">{plan.name}</span> },
    {
      key: "price",
      header: "Price",
      render: (plan) => (
        <span className="font-semibold text-slate-950">{formatKrw(plan.price)}</span>
      ),
    },
    { key: "credits", header: "Credits", render: (plan) => plan.credits },
    {
      key: "limits",
      header: "Limits",
      render: (plan) => <span className="text-slate-600">{plan.limits.join(" / ")}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (plan) => <StatusBadge tone={plan.status === "Active" ? "success" : "danger"}>{plan.status}</StatusBadge>,
    },
    { key: "createdAt", header: "Created At", render: (plan) => plan.createdAt },
    { key: "stoppedAt", header: "Stopped At", render: (plan) => <span className={plan.stoppedAt === "-" ? "text-slate-400" : undefined}>{plan.stoppedAt}</span> },
  ]

  return (
    <DashboardLayout>
      <PageHeader
        title={`${product} Plans`}
        description={`Manage ${product} subscription plans and pricing`}
        breadcrumbs={[{ label: "Billing" }, { label: "Plans" }, { label: product }]}
        actions={
          <div className="flex flex-wrap gap-2">
            <ExportActions payload={exportPayload} />
            <AdminButton variant="primary"><Plus className="size-4" />Create Plan</AdminButton>
          </div>
        }
      />
      <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Status</p>
        <div className="mb-6 flex flex-wrap gap-2">
          {["All", "Active", "Inactive"].map((item) => (
            <button key={item} className={filterClass(status === item)} onClick={() => { setStatus(item); setPage(1) }}>
              {item}
            </button>
          ))}
        </div>
        <DateRangeControl />
        <button className="mt-5 rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-950" onClick={() => { setStatus("All"); resetDateRange() }}>
          Reset All
        </button>
      </section>
      <DataTable columns={columns} data={filtered} summary={`Showing page ${page} of 1 plan page`} compactPagination page={page} totalPages={1} onPageChange={setPage} onRowClick={setSelected} />
      <SideDrawer open={Boolean(selected)} title={`${selected?.name ?? "Plan"} detail`} description="Mock plan detail drawer" onClose={() => setSelected(null)}>
        {selected ? <div className="space-y-4">{Object.entries(selected).map(([key, value]) => <div key={key} className="rounded-xl border border-slate-100 p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">{key}</p><p className="mt-1 text-sm font-semibold text-slate-950">{value}</p></div>)}</div> : null}
      </SideDrawer>
    </DashboardLayout>
  )
}

function filterClass(active: boolean) {
  return cn("h-9 rounded-lg px-3 text-sm font-semibold transition hover:bg-slate-100 hover:text-slate-950", active ? "bg-violet-600 text-white shadow-sm shadow-violet-600/20 hover:bg-violet-600 hover:text-white" : "text-slate-600")
}

function createBillingPlans(product: ProductService) {
  return getPlansByProduct(product).map((plan) => ({
    ...plan,
    createdAt: "2026-05-27",
    status: "Active",
    stoppedAt: "2999-01-01",
  }))
}
