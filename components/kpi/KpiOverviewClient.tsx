"use client"

import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BadgeDollarSign,
  Building2,
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
import { useKpiManagementStore } from "@/lib/kpi-management-store"
import { cn } from "@/lib/utils"
import {
  formatKpiTarget,
  formatKpiValue,
  formatTrend,
  getActiveEnterpriseRevenue,
  getKpiCurrentValue,
  getKpiProgress,
  getKpiStatus,
  isKpiAtRisk,
  isTrendHealthy,
  type EnterpriseContract,
  type KpiConfiguration,
  type KpiTone,
} from "./kpi-data"

const summaryIcons = {
  "activation-rate": Gauge,
  "arpu": BadgeDollarSign,
  "cac": AlertTriangle,
  "churn-rate": AlertTriangle,
  "d30-retention": Target,
  "enterprise-revenue": Building2,
  "ltv": TrendingUp,
  "mrr": CreditCard,
  "paid-conversion-rate": CreditCard,
  "signup-conversion-rate": UserPlus,
}

export default function KpiOverviewClient() {
  const { contracts, kpis } = useKpiManagementStore()
  const visibleKpis = kpis
    .filter((kpi) => !kpi.archived && kpi.showOnOverview)
    .sort((a, b) => a.displayOrder - b.displayOrder)
  const representativeKpis = visibleKpis.filter((kpi) => kpi.representative)
  const scoreboardKpis = visibleKpis.filter((kpi) => !kpi.representative)
  const riskMetrics = visibleKpis.filter((kpi) => isKpiAtRisk(kpi, contracts))

  return (
    <DashboardLayout>
      <PageHeader
        breadcrumbs={[{ label: "Dashboards" }, { label: "KPI" }, { label: "Overview" }]}
        title="KPI Overview"
        description="Monitor administrator-selected business health indicators for Yettey and VPICK."
      />

      <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {representativeKpis.length ? (
          representativeKpis.map((metric) => (
            <KpiSummaryCard key={metric.id} contracts={contracts} metric={metric} />
          ))
        ) : (
          <EmptyPanel message="No representative KPIs are configured for the top area." />
        )}
      </section>

      <div className="grid gap-8 xl:grid-cols-[1fr_360px]">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06),0_16px_40px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-950">
                KPI Scoreboard
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Supporting KPIs selected by administrators for the overview.
              </p>
            </div>
            <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-600">
              <Target className="size-4 text-violet-600" />
              {scoreboardKpis.length} visible KPIs
            </div>
          </div>

          {scoreboardKpis.length ? (
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
                  {scoreboardKpis.map((metric) => {
                    const progress = getKpiProgress(metric, contracts)
                    const status = getKpiStatus(metric, contracts)

                    return (
                      <tr key={metric.id} className="transition hover:bg-violet-50/40">
                        <td className="px-6 py-5">
                          <div>
                            <p className="font-bold text-slate-950">{metric.name}</p>
                            <p className="mt-1 text-xs font-semibold text-slate-500">
                              {metric.service} / {metric.periodType}
                            </p>
                          </div>
                        </td>
                        <td
                          className="whitespace-nowrap px-6 py-5 font-semibold text-slate-800"
                          title={getCurrentValueTitle(metric, contracts)}
                        >
                          {formatKpiValue(
                            getKpiCurrentValue(metric, contracts),
                            metric.format,
                            metric.precision
                          )}
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
          ) : (
            <div className="p-6">
              <EmptyPanel message="No non-pinned KPIs are visible on the scoreboard." />
            </div>
          )}
        </section>

        <RiskKpiPanel contracts={contracts} metrics={riskMetrics} />
      </div>
    </DashboardLayout>
  )
}

function KpiSummaryCard({
  contracts,
  metric,
}: {
  contracts: EnterpriseContract[]
  metric: KpiConfiguration
}) {
  const currentValue = getKpiCurrentValue(metric, contracts)
  const progress = getKpiProgress(metric, contracts)
  const status = getKpiStatus(metric, contracts)
  const Icon = summaryIcons[metric.id as keyof typeof summaryIcons] ?? TrendingUp
  const formattedCurrentValue = formatKpiValue(
    currentValue,
    metric.format,
    metric.precision
  )

  return (
    <article className="flex min-h-64 flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-[0_2px_4px_rgba(15,23,42,0.08),0_16px_32px_rgba(15,23,42,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-500">{metric.name}</p>
          <p
            className={cn(
              "mt-3 max-w-full whitespace-nowrap font-bold tracking-tight text-slate-950",
              valueSizeClass(formattedCurrentValue)
            )}
            title={getCurrentValueTitle(metric, contracts)}
          >
            {formattedCurrentValue}
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

      {metric.calculationType === "totalRevenue" ? (
        <RevenueBreakdownDetails
          contracts={contracts}
          subscriptionRevenue={metric.currentValue}
        />
      ) : null}

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

function RevenueBreakdownDetails({
  contracts,
  subscriptionRevenue,
}: {
  contracts: EnterpriseContract[]
  subscriptionRevenue: number
}) {
  const enterpriseRevenue = getActiveEnterpriseRevenue(contracts)
  const totalRevenue = subscriptionRevenue + enterpriseRevenue

  return (
    <details className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/70 p-3">
      <summary className="cursor-pointer text-xs font-bold uppercase tracking-wide text-emerald-700">
        Revenue Detail
      </summary>
      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="font-semibold text-emerald-700">Subscription Revenue</dt>
          <dd className="font-bold text-slate-950">
            {formatKpiValue(subscriptionRevenue, "currency")}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="font-semibold text-emerald-700">Enterprise Revenue</dt>
          <dd className="font-bold text-slate-950">
            {formatKpiValue(enterpriseRevenue, "currency")}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-emerald-100 pt-2">
          <dt className="font-bold text-emerald-800">Total Revenue</dt>
          <dd className="font-bold text-slate-950">
            {formatKpiValue(totalRevenue, "currency")}
          </dd>
        </div>
      </dl>
    </details>
  )
}

function RiskKpiPanel({
  contracts,
  metrics,
}: {
  contracts: EnterpriseContract[]
  metrics: KpiConfiguration[]
}) {
  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-950">
            Risk KPI
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Visible KPIs below their intervention threshold.
          </p>
        </div>
        <span className="flex size-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
          <AlertTriangle className="size-5" />
        </span>
      </div>

      <div className="mt-6 space-y-3">
        {metrics.length ? (
          metrics.map((metric) => {
            const currentValue = getKpiCurrentValue(metric, contracts)
            const progress = getKpiProgress(metric, contracts)
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
                      {metric.name}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      {formatKpiValue(currentValue, metric.format, metric.precision)} /{" "}
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
                All visible KPIs are within the current health threshold.
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

function TrendBadge({ metric }: { metric: KpiConfiguration }) {
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

function EmptyPanel({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm font-semibold text-slate-500">
      {message}
    </div>
  )
}

function getCurrentValueTitle(
  metric: KpiConfiguration,
  contracts: EnterpriseContract[]
) {
  if (metric.calculationType !== "totalRevenue") {
    return metric.description
  }

  const enterpriseRevenue = getActiveEnterpriseRevenue(contracts)
  const totalRevenue = metric.currentValue + enterpriseRevenue

  return `Subscription Revenue ${formatKpiValue(
    metric.currentValue,
    "currency"
  )} + Enterprise Revenue ${formatKpiValue(
    enterpriseRevenue,
    "currency"
  )} = Total Revenue ${formatKpiValue(totalRevenue, "currency")}`
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

function valueSizeClass(value: string) {
  if (value.length >= 18) {
    return "text-lg"
  }

  if (value.length >= 15) {
    return "text-xl"
  }

  if (value.length >= 12) {
    return "text-2xl"
  }

  return "text-3xl"
}
