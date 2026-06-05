"use client"

import { useMemo, useState } from "react"
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
import KpiTrendCharts from "./KpiTrendCharts"
import {
  formatKpiTarget,
  formatKpiValue,
  formatTrend,
  getActiveEnterpriseRevenue,
  getKpiCurrentValue,
  getKpiProgress,
  getKpiStatus,
  isTrendHealthy,
  kpiOverviewServices,
  kpiPeriodTypes,
  type EnterpriseContract,
  type KpiConfiguration,
  type KpiPeriodType,
  type KpiService,
  type KpiTone,
} from "./kpi-data"

type OverviewServiceProfile = {
  cacScale: number
  countScale: number
  enterpriseRevenueShare: number
  ltvScale: number
  percentageShifts: Partial<Record<string, number>>
  revenueScale: number
  unitRevenueScale: number
}

type OverviewPeriodProfile = {
  countScale: number
  label: string
  percentageShift: number
  revenueScale: number
  unitRevenueScale: number
}

type ServiceFunnelMetrics = {
  activatedUsers: number
  churnedUsers: number
  paidUsers: number
  retainedUsers: number
  service: Exclude<KpiService, "Overall">
  signups: number
  visitors: number
}

type ServiceFunnelMetricKey = Exclude<keyof ServiceFunnelMetrics, "service">

const overviewServiceProfiles: Record<KpiService, OverviewServiceProfile> = {
  Overall: {
    cacScale: 1,
    countScale: 1,
    enterpriseRevenueShare: 1,
    ltvScale: 1,
    percentageShifts: {},
    revenueScale: 1,
    unitRevenueScale: 1,
  },
  Yettey: {
    cacScale: 0.92,
    countScale: 0.62,
    enterpriseRevenueShare: 0.55,
    ltvScale: 1.03,
    percentageShifts: {
      "activation-rate": 6,
      "churn-rate": -0.2,
      "d30-retention": 2.5,
      "paid-conversion-rate": -0.8,
      "signup-conversion-rate": 0.4,
    },
    revenueScale: 0.64,
    unitRevenueScale: 1.04,
  },
  VPICK: {
    cacScale: 1.08,
    countScale: 0.38,
    enterpriseRevenueShare: 0.45,
    ltvScale: 1.16,
    percentageShifts: {
      "activation-rate": -3,
      "churn-rate": 0.3,
      "d30-retention": -1.5,
      "paid-conversion-rate": 1.4,
      "signup-conversion-rate": 0.1,
    },
    revenueScale: 0.36,
    unitRevenueScale: 1.12,
  },
}

const overviewPeriodProfiles: Record<KpiPeriodType, OverviewPeriodProfile> = {
  Monthly: {
    countScale: 1,
    label: "June 2026",
    percentageShift: 0,
    revenueScale: 1,
    unitRevenueScale: 1,
  },
  Quarterly: {
    countScale: 3.1,
    label: "Q2 2026",
    percentageShift: 0.6,
    revenueScale: 3,
    unitRevenueScale: 1.04,
  },
  Yearly: {
    countScale: 12.4,
    label: "2026",
    percentageShift: 1.1,
    revenueScale: 12,
    unitRevenueScale: 1.08,
  },
}

const periodRevenueKpiKeys = new Set([
  "enterprise-revenue",
  "mrr",
  "total-revenue",
])

const managedOverviewServices: Array<Exclude<KpiService, "Overall">> = [
  "Yettey",
  "VPICK",
]

export default function KpiOverviewClient() {
  const { contracts, kpis } = useKpiManagementStore()
  const [selectedService, setSelectedService] = useState<KpiService>("Overall")
  const [selectedPeriod, setSelectedPeriod] = useState<KpiPeriodType>("Monthly")
  const overviewContracts = useMemo(
    () => buildOverviewContracts(contracts, selectedService, selectedPeriod),
    [contracts, selectedPeriod, selectedService]
  )
  const overviewKpis = useMemo(
    () => buildOverviewKpis(kpis, selectedService, selectedPeriod),
    [kpis, selectedPeriod, selectedService]
  )
  const representativeKpis = overviewKpis
    .filter((kpi) => kpi.representative)
    .sort(sortKpisByDisplayOrder)
  const scoreboardKpis = overviewKpis
    .filter((kpi) => !kpi.representative)
    .sort(sortKpisByDisplayOrder)

  return (
    <DashboardLayout>
      <PageHeader
        breadcrumbs={[{ label: "Dashboards" }, { label: "KPI" }, { label: "Overview" }]}
        title="KPI Overview"
        description="Monitor administrator-selected business health indicators for Yettey and VPICK."
      />

      <KpiOverviewFilterPanel
        period={selectedPeriod}
        service={selectedService}
        onPeriodChange={setSelectedPeriod}
        onReset={() => {
          setSelectedService("Overall")
          setSelectedPeriod("Monthly")
        }}
        onServiceChange={setSelectedService}
      />

      <section
        className={cn(
          "mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
          representativeGridClass(representativeKpis.length)
        )}
      >
        {representativeKpis.length ? (
          representativeKpis.map((metric) => (
            <KpiSummaryCard
              key={`${metric.id}-${selectedService}-${selectedPeriod}`}
              contracts={overviewContracts}
              metric={metric}
            />
          ))
        ) : (
          <EmptyPanel message="No representative KPIs are configured for the top area." />
        )}
      </section>

      <KpiTrendCharts period={selectedPeriod} service={selectedService} />

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
                  const progress = getKpiProgress(metric, overviewContracts)
                  const status = getKpiStatus(metric, overviewContracts)

                  return (
                    <tr
                      key={`${metric.id}-${selectedService}-${selectedPeriod}`}
                      className="transition hover:bg-violet-50/40"
                    >
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
                        title={getCurrentValueTitle(metric, overviewContracts)}
                      >
                        {formatKpiValue(
                          getKpiCurrentValue(metric, overviewContracts),
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

function KpiOverviewFilterPanel({
  onPeriodChange,
  onReset,
  onServiceChange,
  period,
  service,
}: {
  onPeriodChange: (period: KpiPeriodType) => void
  onReset: () => void
  onServiceChange: (service: KpiService) => void
  period: KpiPeriodType
  service: KpiService
}) {
  return (
    <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end">
        <SegmentedFilter
          label="Service"
          onChange={onServiceChange}
          options={kpiOverviewServices}
          value={service}
        />
        <SegmentedFilter
          label="Period"
          onChange={onPeriodChange}
          options={kpiPeriodTypes}
          value={period}
        />
        <button
          className="h-9 w-fit rounded-lg px-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
          onClick={onReset}
          type="button"
        >
          Reset filters
        </button>
      </div>
    </section>
  )
}

function SegmentedFilter<T extends string>({
  label,
  onChange,
  options,
  value,
}: {
  label: string
  onChange: (value: T) => void
  options: T[]
  value: T
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            aria-pressed={value === option}
            className={cn(
              "h-9 rounded-lg px-3 text-sm font-semibold transition hover:bg-slate-100 hover:text-slate-950",
              value === option
                ? "bg-violet-600 text-white shadow-sm shadow-violet-600/20 hover:bg-violet-600 hover:text-white"
                : "text-slate-600"
            )}
            onClick={() => onChange(option)}
            type="button"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
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

function sortKpisByDisplayOrder(
  first: KpiConfiguration,
  second: KpiConfiguration
) {
  return normalizedDisplayOrder(first) - normalizedDisplayOrder(second)
}

function normalizedDisplayOrder(kpi: KpiConfiguration) {
  return Number.isFinite(kpi.displayOrder)
    ? kpi.displayOrder
    : Number.MAX_SAFE_INTEGER
}

function buildOverviewKpis(
  kpis: KpiConfiguration[],
  service: KpiService,
  period: KpiPeriodType
) {
  const groupedKpis = new Map<string, KpiConfiguration[]>()

  kpis
    .filter((kpi) => !kpi.archived && kpi.showOnOverview)
    .forEach((kpi) => {
      const key = normalizeKpiKey(kpi.name)
      const group = groupedKpis.get(key) ?? []

      groupedKpis.set(key, [...group, kpi])
    })

  return Array.from(groupedKpis.values()).map((group) => {
    if (service === "Overall") {
      return aggregateOverviewKpiGroup(group, period, groupedKpis)
    }

    const sourceKpi = pickOverviewSourceKpi(group, service, period)

    if (sourceKpi.service === service && sourceKpi.periodType === period) {
      return {
        ...sourceKpi,
        periodLabel: sourceKpi.periodLabel || overviewPeriodProfiles[period].label,
      }
    }

    return adaptKpiToOverviewFilter(sourceKpi, service, period)
  })
}

function pickOverviewSourceKpi(
  kpis: KpiConfiguration[],
  service: KpiService,
  period: KpiPeriodType
) {
  return (
    kpis.find((kpi) => kpi.service === service && kpi.periodType === period) ??
    kpis.find((kpi) => kpi.service === service) ??
    kpis.find((kpi) => kpi.service === "Overall" && kpi.periodType === period) ??
    kpis.find((kpi) => kpi.service === "Overall") ??
    kpis[0]
  )
}

function aggregateOverviewKpiGroup(
  group: KpiConfiguration[],
  period: KpiPeriodType,
  groupedKpis: Map<string, KpiConfiguration[]>
) {
  const serviceKpis = managedOverviewServices
    .map((service) => pickServiceKpiForOverall(group, service, period))
    .filter((kpi): kpi is KpiConfiguration => Boolean(kpi))
    .map((kpi) =>
      kpi.periodType === period
        ? {
            ...kpi,
            periodLabel: kpi.periodLabel || overviewPeriodProfiles[period].label,
          }
        : adaptKpiToOverviewFilter(kpi, kpi.service, period)
    )

  if (!serviceKpis.length) {
    return adaptKpiToOverviewFilter(group[0], "Overall", period)
  }

  const baseKpi = serviceKpis[0]
  const key = normalizeKpiKey(baseKpi.name)

  return {
    ...baseKpi,
    currentValue: aggregateKpiValues(
      serviceKpis,
      "currentValue",
      key,
      groupedKpis,
      period
    ),
    id: `overall-${key}-${period.toLowerCase()}`,
    periodLabel: overviewPeriodProfiles[period].label,
    periodType: period,
    service: "Overall" as KpiService,
    targetValue: aggregateKpiValues(
      serviceKpis,
      "targetValue",
      key,
      groupedKpis,
      period
    ),
    trend: aggregateTrend(serviceKpis),
  }
}

function pickServiceKpiForOverall(
  group: KpiConfiguration[],
  service: Exclude<KpiService, "Overall">,
  period: KpiPeriodType
) {
  return (
    group.find((kpi) => kpi.service === service && kpi.periodType === period) ??
    group.find((kpi) => kpi.service === service) ??
    null
  )
}

function aggregateKpiValues(
  kpis: KpiConfiguration[],
  key: "currentValue" | "targetValue",
  normalizedName: string,
  groupedKpis: Map<string, KpiConfiguration[]>,
  period: KpiPeriodType
) {
  const sample = kpis[0]

  if (sample.format === "number" || periodRevenueKpiKeys.has(normalizedName)) {
    return Math.round(kpis.reduce((total, kpi) => total + kpi[key], 0))
  }

  if (sample.format === "percentage") {
    const formulaValue = calculateOverallFormulaValue(
      normalizedName,
      key,
      groupedKpis,
      period,
      sample.precision ?? 0
    )

    if (formulaValue !== null) {
      return formulaValue
    }
  }

  return roundToPrecision(
    weightedAverage(kpis.map((kpi) => ({ service: kpi.service, value: kpi[key] }))),
    sample.precision ?? 0
  )
}

function calculateOverallFormulaValue(
  normalizedName: string,
  key: "currentValue" | "targetValue",
  groupedKpis: Map<string, KpiConfiguration[]>,
  period: KpiPeriodType,
  precision: number
) {
  const funnels = managedOverviewServices
    .map((service) => buildServiceFunnelMetrics(service, key, groupedKpis, period))
    .filter((metrics): metrics is ServiceFunnelMetrics => Boolean(metrics))

  if (!funnels.length) {
    return null
  }

  if (normalizedName === "signup-conversion-rate") {
    return percentFromTotals(funnels, "signups", "visitors", precision)
  }

  if (normalizedName === "activation-rate") {
    return percentFromTotals(funnels, "activatedUsers", "signups", precision)
  }

  if (normalizedName === "paid-conversion-rate") {
    return percentFromTotals(funnels, "paidUsers", "signups", precision)
  }

  if (normalizedName === "d30-retention") {
    return percentFromTotals(funnels, "retainedUsers", "activatedUsers", precision)
  }

  if (normalizedName === "churn-rate") {
    return percentFromTotals(funnels, "churnedUsers", "paidUsers", precision)
  }

  return null
}

function buildServiceFunnelMetrics(
  service: Exclude<KpiService, "Overall">,
  key: "currentValue" | "targetValue",
  groupedKpis: Map<string, KpiConfiguration[]>,
  period: KpiPeriodType
): ServiceFunnelMetrics | null {
  const visitors = getOverviewKpiValueForService(
    groupedKpis,
    "visitors",
    service,
    period,
    key
  )
  const signupConversionRate = getOverviewKpiValueForService(
    groupedKpis,
    "signup-conversion-rate",
    service,
    period,
    key
  )

  if (visitors === null || signupConversionRate === null) {
    return null
  }

  const activationRate =
    getOverviewKpiValueForService(
      groupedKpis,
      "activation-rate",
      service,
      period,
      key
    ) ?? 0
  const paidConversionRate =
    getOverviewKpiValueForService(
      groupedKpis,
      "paid-conversion-rate",
      service,
      period,
      key
    ) ?? 0
  const retentionRate =
    getOverviewKpiValueForService(
      groupedKpis,
      "d30-retention",
      service,
      period,
      key
    ) ?? 0
  const churnRate =
    getOverviewKpiValueForService(
      groupedKpis,
      "churn-rate",
      service,
      period,
      key
    ) ?? 0
  const signups = visitors * (signupConversionRate / 100)
  const activatedUsers = signups * (activationRate / 100)
  const paidUsers = signups * (paidConversionRate / 100)
  const retainedUsers = activatedUsers * (retentionRate / 100)
  const churnedUsers = paidUsers * (churnRate / 100)

  return {
    activatedUsers,
    churnedUsers,
    paidUsers,
    retainedUsers,
    service,
    signups,
    visitors,
  }
}

function getOverviewKpiValueForService(
  groupedKpis: Map<string, KpiConfiguration[]>,
  normalizedName: string,
  service: Exclude<KpiService, "Overall">,
  period: KpiPeriodType,
  key: "currentValue" | "targetValue"
) {
  const group = groupedKpis.get(normalizedName)

  if (!group) {
    return null
  }

  const sourceKpi = pickServiceKpiForOverall(group, service, period)

  if (!sourceKpi) {
    return null
  }

  const kpi =
    sourceKpi.periodType === period
      ? sourceKpi
      : adaptKpiToOverviewFilter(sourceKpi, sourceKpi.service, period)

  return kpi[key]
}

function percentFromTotals(
  metrics: ServiceFunnelMetrics[],
  numeratorKey: ServiceFunnelMetricKey,
  denominatorKey: ServiceFunnelMetricKey,
  precision: number
) {
  const numerator = metrics.reduce(
    (total, metric) => total + metric[numeratorKey],
    0
  )
  const denominator = metrics.reduce(
    (total, metric) => total + metric[denominatorKey],
    0
  )

  if (!denominator) {
    return null
  }

  return roundToPrecision((numerator / denominator) * 100, precision)
}

function aggregateTrend(kpis: KpiConfiguration[]) {
  const sample = kpis[0]
  const averageTrend = weightedAverage(
    kpis.map((kpi) => ({ service: kpi.service, value: kpi.trend.value }))
  )

  return {
    ...sample.trend,
    direction: averageTrend >= sample.trend.value ? sample.trend.direction : "down",
    value: roundToPrecision(averageTrend, 1),
  }
}

function weightedAverage(
  values: Array<{ service: KpiService; value: number }>
) {
  const weightedValues = values.map(({ service, value }) => {
    const weight =
      service === "Yettey"
        ? overviewServiceProfiles.Yettey.countScale
        : service === "VPICK"
          ? overviewServiceProfiles.VPICK.countScale
          : 1

    return { value, weight }
  })
  const totalWeight = weightedValues.reduce((total, item) => total + item.weight, 0)

  if (!totalWeight) {
    return 0
  }

  return (
    weightedValues.reduce(
      (total, item) => total + item.value * item.weight,
      0
    ) / totalWeight
  )
}

function adaptKpiToOverviewFilter(
  kpi: KpiConfiguration,
  service: KpiService,
  period: KpiPeriodType
): KpiConfiguration {
  return {
    ...kpi,
    currentValue: adaptKpiNumericValue(kpi.currentValue, kpi, service, period),
    periodLabel: overviewPeriodProfiles[period].label,
    periodType: period,
    service,
    targetValue: adaptKpiNumericValue(
      kpi.targetValue,
      kpi,
      service,
      period,
      "target"
    ),
    trend: {
      ...kpi.trend,
      value: roundToPrecision(
        kpi.trend.value *
          (service === "Overall" ? 1 : 1.08) *
          (period === "Monthly" ? 1 : period === "Quarterly" ? 1.15 : 1.25),
        1
      ),
    },
  }
}

function buildOverviewContracts(
  contracts: EnterpriseContract[],
  service: KpiService,
  period: KpiPeriodType
) {
  const serviceProfile = overviewServiceProfiles[service]
  const periodProfile = overviewPeriodProfiles[period]

  return contracts.map((contract) => ({
    ...contract,
    contractAmount: Math.round(
      contract.contractAmount *
        serviceProfile.enterpriseRevenueShare *
        periodProfile.revenueScale
    ),
  }))
}

function adaptKpiNumericValue(
  value: number,
  kpi: KpiConfiguration,
  service: KpiService,
  period: KpiPeriodType,
  valueType: "current" | "target" = "current"
) {
  const key = normalizeKpiKey(kpi.name)
  const serviceProfile = overviewServiceProfiles[service]
  const sourceServiceProfile = overviewServiceProfiles[kpi.service]
  const periodProfile = overviewPeriodProfiles[period]

  if (kpi.format === "number") {
    return Math.round(
      value *
        (serviceProfile.countScale / sourceServiceProfile.countScale) *
        periodProfile.countScale
    )
  }

  if (kpi.format === "currency") {
    const periodScale = periodRevenueKpiKeys.has(key)
      ? periodProfile.revenueScale
      : periodProfile.unitRevenueScale
    const serviceScale =
      key === "cac"
        ? serviceProfile.cacScale / sourceServiceProfile.cacScale
        : key === "ltv"
          ? serviceProfile.ltvScale / sourceServiceProfile.ltvScale
          : periodRevenueKpiKeys.has(key)
            ? serviceProfile.revenueScale / sourceServiceProfile.revenueScale
            : serviceProfile.unitRevenueScale / sourceServiceProfile.unitRevenueScale

    return Math.round(value * serviceScale * periodScale)
  }

  const serviceShift =
    (serviceProfile.percentageShifts[key] ?? 0) -
    (sourceServiceProfile.percentageShifts[key] ?? 0)
  const periodShift =
    kpi.direction === "lower"
      ? -periodProfile.percentageShift
      : periodProfile.percentageShift
  const shift =
    valueType === "target"
      ? serviceShift * 0.25 + periodShift * 0.25
      : serviceShift + periodShift

  return roundToPrecision(
    clamp(value + shift, 0, 100),
    kpi.precision ?? 0
  )
}

function normalizeKpiKey(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function roundToPrecision(value: number, precision: number) {
  const multiplier = 10 ** precision

  return Math.round(value * multiplier) / multiplier
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
