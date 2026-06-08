"use client"

import { Plus } from "lucide-react"
import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import DataTable, { type DataTableColumn } from "@/components/admin/DataTable"
import PageHeader from "@/components/admin/PageHeader"
import StatusBadge from "@/components/admin/StatusBadge"
import DashboardLayout from "@/components/layout/DashboardLayout"
import {
  type BillingPlan,
  type BillingPlanService,
  billingPlanStatuses,
  billingPlanTypes,
  formatNumber,
  getBillingPlansByService,
  getPlanCreditsLabel,
  getPlanLimits,
  getServicePath,
  getStatusTone,
} from "@/lib/billing-plan-catalog"
import { formatKrw } from "@/lib/pricing-plans"
import { cn } from "@/lib/utils"

export default function BillingPlansClient({
  product,
}: {
  product: BillingPlanService
}) {
  const router = useRouter()
  const plans = useMemo(() => getBillingPlansByService(product), [product])
  const [status, setStatus] = useState<"All" | BillingPlan["status"]>("All")
  const [planType, setPlanType] = useState<"All" | BillingPlan["type"]>("All")
  const [page, setPage] = useState(1)
  const productPath = getServicePath(product)
  const filtered = useMemo(
    () =>
      plans.filter(
        (plan) =>
          (status === "All" || plan.status === status) &&
          (planType === "All" || plan.type === planType)
      ),
    [planType, plans, status]
  )
  const columns: DataTableColumn<BillingPlan>[] = [
    {
      key: "name",
      header: "Plan Name",
      render: (plan) => (
        <div>
          <Link
            className="font-semibold text-slate-950 underline-offset-4 hover:text-violet-600 hover:underline"
            href={`/billing/plans/${productPath}/${plan.slug}`}
            onClick={(event) => event.stopPropagation()}
          >
            {plan.name}
          </Link>
          <p className="mt-1 max-w-72 text-xs leading-5 text-slate-500">
            {plan.description}
          </p>
        </div>
      ),
    },
    {
      key: "price",
      header: "Price",
      render: (plan) => (
        <span className="font-semibold text-slate-950">
          {formatKrw(plan.monthlyPrice)}
        </span>
      ),
    },
    {
      key: "credits",
      header: "Credits",
      render: (plan) => getPlanCreditsLabel(plan),
    },
    {
      key: "limits",
      header: "Limits",
      render: (plan) => (
        <span className="text-slate-600">{getPlanLimits(plan).join(" / ")}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (plan) => (
        <StatusBadge tone={getStatusTone(plan.status)}>{plan.status}</StatusBadge>
      ),
    },
    {
      key: "createdAt",
      header: "Created At",
      render: (plan) => plan.createdAt,
    },
    {
      key: "stoppedAt",
      header: "Stopped At",
      render: (plan) => (
        <span className={plan.stoppedAt === "-" ? "text-slate-400" : undefined}>
          {plan.stoppedAt}
        </span>
      ),
    },
  ]

  return (
    <DashboardLayout>
      <PageHeader
        title={`${product} Plans`}
        description={`Manage ${product} product packages, pricing, benefits, feature access, and lifecycle status.`}
        breadcrumbs={[{ label: "Billing" }, { label: "Plans" }, { label: product }]}
        actions={
          <Link
            className={primaryLinkClass}
            href={`/billing/plans/${productPath}/create`}
          >
            <Plus className="size-4" />
            Create Plan
          </Link>
        }
      />

      <section className="mb-8 grid gap-4 md:grid-cols-3">
        <PlanCatalogCard
          label="Total Plans"
          value={formatNumber(plans.length)}
          detail="Configured products"
        />
        <PlanCatalogCard
          label="Active"
          value={formatNumber(plans.filter((plan) => plan.status === "Active").length)}
          detail="Visible for sale"
        />
        <PlanCatalogCard
          label="Draft or Inactive"
          value={formatNumber(plans.filter((plan) => plan.status !== "Active").length)}
          detail="Needs review"
        />
      </section>

      <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
        <div className="grid gap-5 lg:grid-cols-2">
          <FilterGroup label="Status">
            {["All", ...billingPlanStatuses].map((item) => (
              <button
                key={item}
                className={filterClass(status === item)}
                onClick={() => {
                  setStatus(item as typeof status)
                  setPage(1)
                }}
              >
                {item}
              </button>
            ))}
          </FilterGroup>
          <FilterGroup label="Plan Type">
            {["All", ...billingPlanTypes].map((item) => (
              <button
                key={item}
                className={filterClass(planType === item)}
                onClick={() => {
                  setPlanType(item as typeof planType)
                  setPage(1)
                }}
              >
                {item}
              </button>
            ))}
          </FilterGroup>
        </div>
        <button
          className="mt-5 rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
          onClick={() => {
            setStatus("All")
            setPlanType("All")
            setPage(1)
          }}
        >
          Reset All
        </button>
      </section>

      <DataTable
        columns={columns}
        data={filtered}
        summary={`Showing page ${page} of 1 plan page`}
        compactPagination
        page={page}
        totalPages={1}
        onPageChange={setPage}
        onRowClick={(plan) =>
          router.push(`/billing/plans/${productPath}/${plan.slug}`)
        }
      />
    </DashboardLayout>
  )
}

function FilterGroup({
  children,
  label,
}: {
  children: React.ReactNode
  label: string
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

function PlanCatalogCard({
  detail,
  label,
  value,
}: {
  detail: string
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-3 text-2xl font-bold text-slate-950">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{detail}</p>
    </div>
  )
}

function filterClass(active: boolean) {
  return cn(
    "h-9 rounded-lg px-3 text-sm font-semibold transition hover:bg-slate-100 hover:text-slate-950",
    active
      ? "bg-violet-600 text-white shadow-sm shadow-violet-600/20 hover:bg-violet-600 hover:text-white"
      : "text-slate-600"
  )
}

const primaryLinkClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 text-sm font-semibold text-white shadow-sm shadow-violet-600/20 transition-all duration-150 hover:bg-violet-700 hover:shadow-md hover:shadow-violet-600/25 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-500/15 active:translate-y-px"
