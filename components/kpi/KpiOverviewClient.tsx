import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  CreditCard,
  Gauge,
  Target,
  TrendingUp,
  UserPlus,
} from "lucide-react"

import PageHeader from "@/components/admin/PageHeader"
import StatusBadge from "@/components/admin/StatusBadge"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { cn } from "@/lib/utils"
import {
  businessKpiMetrics,
  formatKpiTarget,
  formatKpiValue,
  formatTrend,
  getKpiProgress,
  getKpiStatus,
  isKpiAtRisk,
  isTrendHealthy,
  type BusinessKpiMetric,
  type KpiTone,
} from "./kpi-data"

const summaryIcons = {
  "activation-rate": Gauge,
  "churn-rate": AlertTriangle,
  "d30-retention-rate": Target,
  mrr: CreditCard,
  "signup-conversion-rate": UserPlus,
}

export default function KpiOverviewClient() {
  const riskMetrics = businessKpiMetrics.filter(isKpiAtRisk)

  return (
    <DashboardLayout>
      <PageHeader
        breadcrumbs={[{ label: "Dashboards" }, { label: "KPI" }, { label: "Overview" }]}
        title="KPI Overview"
        description="Monitor the core business health indicators for Yettey and VPICK."
      />

      <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        {businessKpiMetrics.map((metric) => (
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
                Current period health metrics against approved business thresholds.
              </p>
            </div>
            <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-600">
              <Target className="size-4 text-violet-600" />
              5 core KPIs
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[940px] w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-4">KPI</th>
                  <th className="px-6 py-4">Current</th>
                  <th className="px-6 py-4">Target</th>
                  <th className="px-6 py-4">Progress</th>
                  <th className="px-6 py-4">Trend</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {businessKpiMetrics.map((metric) => {
                  const progress = getKpiProgress(metric)
                  const status = getKpiStatus(metric)

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
                        {formatKpiValue(metric.current, metric.type, metric.precision)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-5 font-semibold text-slate-500">
                        {formatKpiTarget(metric)}
                      </td>
                      <td className="px-6 py-5">
                        <ProgressMeter progress={progress} tone={metric.tone} />
                      </td>
                      <td className="whitespace-nowrap px-6 py-5">
                        <TrendBadge metric={metric} />
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

function KpiSummaryCard({ metric }: { metric: BusinessKpiMetric }) {
  const progress = getKpiProgress(metric)
  const status = getKpiStatus(metric)
  const Icon = summaryIcons[metric.id as keyof typeof summaryIcons] ?? TrendingUp

  return (
    <article className="flex min-h-64 flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-[0_2px_4px_rgba(15,23,42,0.08),0_16px_32px_rgba(15,23,42,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-500">{metric.label}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
            {formatKpiValue(metric.current, metric.type, metric.precision)}
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

      <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Target
          </span>
          <span className="text-sm font-bold text-slate-950">
            {formatKpiTarget(metric)}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Progress
          </span>
          <span className="text-sm font-bold text-slate-950">{progress}%</span>
        </div>
        <ProgressBar progress={progress} tone={metric.tone} className="mt-3" />
      </div>

      <div className="mt-auto pt-5">
        <div className="flex flex-wrap items-center gap-2">
          <TrendBadge metric={metric} />
          <StatusBadge tone={statusTone(status)}>{status}</StatusBadge>
        </div>
        <p className="mt-4 text-sm leading-5 text-slate-500">{metric.description}</p>
      </div>
    </article>
  )
}

function RiskKpiPanel({ metrics }: { metrics: BusinessKpiMetric[] }) {
  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-950">
            Risk KPI
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Health indicators below their intervention threshold.
          </p>
        </div>
        <span className="flex size-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
          <AlertTriangle className="size-5" />
        </span>
      </div>

      <div className="mt-6 space-y-3">
        {metrics.length ? (
          metrics.map((metric) => {
            const progress = getKpiProgress(metric)
            const critical = progress < 75

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
                      {formatKpiValue(metric.current, metric.type, metric.precision)} /{" "}
                      {formatKpiTarget(metric)}
                    </p>
                  </div>
                  <p className="shrink-0 text-lg font-bold text-slate-950">
                    {progress}%
                  </p>
                </div>
              </div>
            )
          })
        ) : (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="size-5 text-emerald-600" />
              <p className="text-sm font-bold text-emerald-700">
                All core KPIs are within the current health threshold.
              </p>
            </div>
          </div>
        )}
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

function TrendBadge({ metric }: { metric: BusinessKpiMetric }) {
  const healthy = isTrendHealthy(metric)
  const Icon = metric.trend.direction === "up" ? ArrowUpRight : ArrowDownRight

  return (
    <span
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-xs font-bold",
        healthy ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"
      )}
    >
      <Icon className="size-3.5" />
      {formatTrend(metric.trend)}
    </span>
  )
}

function statusTone(status: string) {
  if (status === "Healthy") {
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
