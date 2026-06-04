"use client"

import {
  ArrowDownRight,
  ArrowUpRight,
  Target,
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
  isTrendHealthy,
  type EnterpriseContract,
  type KpiConfiguration,
  type KpiTone,
} from "./kpi-data"

export default function KpiOverviewClient() {
  const { contracts, kpis } = useKpiManagementStore()
  const visibleKpis = kpis
    .filter((kpi) => !kpi.archived && kpi.showOnOverview)
    .sort((a, b) => a.displayOrder - b.displayOrder)
  const representativeKpis = visibleKpis.filter((kpi) => kpi.representative)
  const scoreboardKpis = visibleKpis.filter((kpi) => !kpi.representative)

  return (
    <DashboardLayout>
      <PageHeader
        breadcrumbs={[{ label: "Dashboards" }, { label: "KPI" }, { label: "Overview" }]}
        title="KPI Overview"
        description="Monitor administrator-selected business health indicators for Yettey and VPICK."
      />

      <section
        className={cn(
          "mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
          representativeGridClass(representativeKpis.length)
        )}
      >
        {representativeKpis.length ? (
          representativeKpis.map((metric) => (
            <KpiSummaryCard key={metric.id} contracts={contracts} metric={metric} />
          ))
        ) : (
          <EmptyPanel message="No representative KPIs are configured for the top area." />
        )}
      </section>

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
            <table className="w-full min-w-[1080px] table-fixed text-sm">
              <colgroup>
                <col className="w-[30%]" />
                <col className="w-[15%]" />
                <col className="w-[15%]" />
                <col className="w-[20%]" />
                <col className="w-[10%]" />
                <col className="w-[10%]" />
              </colgroup>
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
                        <div className="min-w-0">
                          <p className="whitespace-nowrap font-bold text-slate-950">
                            {metric.name}
                          </p>
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
  const formattedCurrentValue = formatKpiValue(
    currentValue,
    metric.format,
    metric.precision
  )

  return (
    <article className="flex min-h-56 min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-[0_2px_4px_rgba(15,23,42,0.08),0_16px_32px_rgba(15,23,42,0.08)] min-[1180px]:p-4">
      <div className="min-w-0">
        <p className="text-xs font-semibold leading-4 text-slate-500">
          {metric.name}
        </p>
        <p
          className={cn(
            "mt-3 max-w-full whitespace-nowrap font-bold leading-tight tracking-tight text-slate-950 tabular-nums",
            valueSizeClass(formattedCurrentValue)
          )}
          title={getCurrentValueTitle(metric, contracts)}
        >
          {formattedCurrentValue}
        </p>
      </div>

      <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Target
          </span>
          <span
            className={cn(
              "min-w-0 max-w-full whitespace-nowrap text-right font-bold text-slate-950 tabular-nums",
              compactValueSizeClass(formatKpiTarget(metric))
            )}
          >
            {formatKpiTarget(metric)}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Progress
          </span>
          <span className="whitespace-nowrap text-sm font-bold text-slate-950 tabular-nums">
            {progress}%
          </span>
        </div>
        <ProgressBar progress={progress} tone={metric.tone} className="mt-3" />
      </div>

      <p className="mt-5 text-xs leading-5 text-slate-500">
        {metric.description}
      </p>
    </article>
  )
}

function representativeGridClass(count: number) {
  if (count >= 5) {
    return "[@media(min-width:1180px)]:grid-cols-5"
  }

  if (count === 4) {
    return "[@media(min-width:1180px)]:grid-cols-4"
  }

  return ""
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
    return "text-xs"
  }

  if (value.length >= 15) {
    return "text-sm"
  }

  if (value.length >= 13) {
    return "text-base"
  }

  if (value.length >= 12) {
    return "text-lg"
  }

  return "text-3xl"
}

function compactValueSizeClass(value: string) {
  if (value.length >= 18) {
    return "text-[10px]"
  }

  if (value.length >= 13) {
    return "text-[11px]"
  }

  return "text-sm"
}
