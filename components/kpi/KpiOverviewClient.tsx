import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Gauge,
  Target,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react"

import PageHeader from "@/components/admin/PageHeader"
import StatusBadge from "@/components/admin/StatusBadge"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { cn } from "@/lib/utils"
import {
  formatKpiValue,
  getKpiProgress,
  getKpiStatus,
  kpiScoreboardMetrics,
  kpiSummaryMetrics,
  type KpiMetricType,
  type KpiTone,
} from "./kpi-data"

const summaryIcons = {
  "paid-user-goal": Users,
  "retention-goal": Gauge,
  "revenue-goal": TrendingUp,
  "signup-goal": UserPlus,
}

const riskThreshold = 75

export default function KpiOverviewClient() {
  const riskMetrics = kpiScoreboardMetrics
    .map((metric) => ({
      ...metric,
      progress: getKpiProgress(metric.current, metric.target),
    }))
    .filter((metric) => metric.progress < riskThreshold)

  return (
    <DashboardLayout>
      <PageHeader
        breadcrumbs={[{ label: "Dashboards" }, { label: "KPI" }, { label: "Overview" }]}
        title="KPI Overview"
        description="Track goal progress across revenue, acquisition, paid conversion, and retention."
      />

      <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpiSummaryMetrics.map((metric) => (
          <KpiSummaryCard key={metric.id} metric={metric} />
        ))}
      </section>

      <div className="grid gap-8 xl:grid-cols-[1fr_360px]">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06),0_16px_40px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-950">
                KPI Scoreboard
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Current period mock performance against approved KPI targets.
              </p>
            </div>
            <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-600">
              <Target className="size-4 text-violet-600" />
              6 tracked KPIs
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[860px] w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-4">KPI</th>
                  <th className="px-6 py-4">Current</th>
                  <th className="px-6 py-4">Target</th>
                  <th className="px-6 py-4">Progress</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {kpiScoreboardMetrics.map((metric) => {
                  const progress = getKpiProgress(metric.current, metric.target)
                  const status = getKpiStatus(progress)

                  return (
                    <tr key={metric.id} className="transition hover:bg-violet-50/40">
                      <td className="px-6 py-5">
                        <div>
                          <p className="font-bold text-slate-950">{metric.label}</p>
                          <p className="mt-1 text-xs font-semibold text-slate-500">
                            {metric.owner}
                          </p>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-5 font-semibold text-slate-800">
                        {formatKpiValue(metric.current, metric.type)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-5 font-semibold text-slate-500">
                        {formatKpiValue(metric.target, metric.type)}
                      </td>
                      <td className="px-6 py-5">
                        <ProgressMeter progress={progress} tone={metric.tone} />
                      </td>
                      <td className="whitespace-nowrap px-6 py-5">
                        <StatusBadge tone={statusTone(status)}>{status}</StatusBadge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        <RiskKpiPanel metrics={riskMetrics} />
      </div>
    </DashboardLayout>
  )
}

function KpiSummaryCard({
  metric,
}: {
  metric: {
    current: number
    description: string
    id: string
    label: string
    target: number
    tone: KpiTone
    type: KpiMetricType
  }
}) {
  const progress = getKpiProgress(metric.current, metric.target)
  const Icon = summaryIcons[metric.id as keyof typeof summaryIcons] ?? BarChart3

  return (
    <article className="flex min-h-56 flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-[0_2px_4px_rgba(15,23,42,0.08),0_16px_32px_rgba(15,23,42,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{metric.label}</p>
          <p className="mt-3 text-2xl font-bold tracking-tight text-slate-950">
            {formatKpiValue(metric.current, metric.type)} /{" "}
            {formatKpiValue(metric.target, metric.type)}
          </p>
        </div>
        <span
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl",
            toneClass(metric.tone, "soft")
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </div>

      <div className="mt-auto pt-6">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-bold text-slate-700">{progress}%</span>
          <span className="text-xs font-semibold text-slate-500">Target progress</span>
        </div>
        <ProgressBar progress={progress} tone={metric.tone} className="mt-3" />
        <p className="mt-4 text-sm leading-5 text-slate-500">{metric.description}</p>
      </div>
    </article>
  )
}

function RiskKpiPanel({
  metrics,
}: {
  metrics: Array<{
    current: number
    id: string
    label: string
    progress: number
    target: number
    type: KpiMetricType
  }>
}) {
  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-950">
            Risk KPI
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Below {riskThreshold}% of current target.
          </p>
        </div>
        <span className="flex size-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
          <AlertTriangle className="size-5" />
        </span>
      </div>

      <div className="mt-6 space-y-3">
        {metrics.map((metric) => {
          const critical = metric.progress < 70

          return (
            <div
              key={metric.id}
              className={cn(
                "rounded-2xl border p-4",
                critical
                  ? "border-rose-100 bg-rose-50/70"
                  : "border-amber-100 bg-amber-50/70"
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full",
                    critical
                      ? "bg-rose-100 text-rose-600"
                      : "bg-amber-100 text-amber-600"
                  )}
                >
                  {critical ? (
                    <AlertTriangle className="size-4" />
                  ) : (
                    <Gauge className="size-4" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-950">
                    {metric.label}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    {metric.progress}% of target
                  </p>
                </div>
                <p className="shrink-0 text-lg font-bold text-slate-950">
                  {formatKpiValue(metric.current, metric.type)}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="size-5 text-emerald-600" />
          <p className="text-sm font-bold text-emerald-700">
            Revenue remains on track at 75%.
          </p>
        </div>
      </div>
    </aside>
  )
}

function ProgressMeter({ progress, tone }: { progress: number; tone: KpiTone }) {
  return (
    <div className="min-w-52">
      <div className="flex items-center justify-between gap-3">
        <span className="font-bold text-slate-950">{progress}%</span>
        <span className="text-xs font-semibold text-slate-500">
          {Math.max(0, 100 - progress)}% gap
        </span>
      </div>
      <ProgressBar progress={progress} tone={tone} className="mt-2" />
    </div>
  )
}

function ProgressBar({
  className,
  progress,
  tone,
}: {
  className?: string
  progress: number
  tone: KpiTone
}) {
  return (
    <div className={cn("h-2.5 overflow-hidden rounded-full bg-slate-100", className)}>
      <div
        className={cn("h-full rounded-full", toneClass(tone, "solid"))}
        style={{ width: `${Math.min(progress, 100)}%` }}
      />
    </div>
  )
}

function statusTone(status: string) {
  if (status === "Ahead" || status === "On Track") {
    return "success"
  }

  if (status === "At Risk") {
    return "danger"
  }

  return "neutral"
}

function toneClass(tone: KpiTone, variant: "soft" | "solid") {
  const tones = {
    amber: {
      soft: "bg-amber-50 text-amber-600",
      solid: "bg-amber-500",
    },
    emerald: {
      soft: "bg-emerald-50 text-emerald-600",
      solid: "bg-emerald-500",
    },
    rose: {
      soft: "bg-rose-50 text-rose-600",
      solid: "bg-rose-500",
    },
    sky: {
      soft: "bg-sky-50 text-sky-600",
      solid: "bg-sky-500",
    },
    violet: {
      soft: "bg-violet-50 text-violet-600",
      solid: "bg-violet-500",
    },
  }

  return tones[tone][variant]
}
