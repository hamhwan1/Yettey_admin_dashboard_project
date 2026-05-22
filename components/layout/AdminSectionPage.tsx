import DashboardLayout from "./DashboardLayout"
import PageHeader from "@/components/admin/PageHeader"
import StatCard from "@/components/admin/StatCard"

type AdminSectionPageProps = {
  title: string
  description: string
  eyebrow?: string
  metrics?: {
    label: string
    value: string
    detail: string
  }[]
}

const defaultMetrics = [
  {
    label: "Status",
    value: "Ready",
    detail: "Mock data only",
  },
  {
    label: "Records",
    value: "0",
    detail: "API connection pending",
  },
  {
    label: "Updated",
    value: "Today",
    detail: "Static placeholder",
  },
]

export default function AdminSectionPage({
  title,
  description,
  eyebrow = "Admin Module",
  metrics = defaultMetrics,
}: AdminSectionPageProps) {
  return (
    <DashboardLayout>
      <PageHeader eyebrow={eyebrow} title={title} description={description} />

      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <StatCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            detail={metric.detail}
          />
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-8 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
        <p className="text-sm font-semibold text-slate-900">
          This page is routed and ready for implementation.
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          API integration is intentionally deferred. Replace this mock surface
          with real tables, forms, and charts when the backend contract is
          available.
        </p>
      </div>
    </DashboardLayout>
  )
}
