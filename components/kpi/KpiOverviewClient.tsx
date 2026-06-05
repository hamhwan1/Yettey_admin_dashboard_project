"use client"

import { useEffect, useMemo, useState } from "react"
import {
  ArrowDownRight,
  ArrowUpRight,
  FileSpreadsheet,
  Target,
  X,
} from "lucide-react"
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import PageHeader from "@/components/admin/PageHeader"
import StatusBadge from "@/components/admin/StatusBadge"
import DashboardLayout from "@/components/layout/DashboardLayout"
import {
  downloadXlsxReport,
  type ExportReportPayload,
  type ExportRow,
} from "@/lib/export-files"
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
  type KpiFormat,
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

type KpiDetailField = {
  axis?: "left" | "right"
  color?: string
  format: KpiFormat
  key: string
  label: string
  precision?: number
}

type KpiDetailRow = {
  month: string
  values: Record<string, number>
}

type KpiDetailType =
  | "activation"
  | "churn"
  | "generic"
  | "paidConversion"
  | "retention"
  | "revenue"
  | "signupConversion"
  | "visitors"

type KpiDetailModel = {
  chartFields: KpiDetailField[]
  editFields: KpiDetailField[]
  primaryValueKey: string
  summaryItems: Array<{ label: string; value: string }>
  tableFields: KpiDetailField[]
}

type KpiCardContextItem = {
  label: string
  value: string
}

type KpiDetailReportPeriod = KpiPeriodType | "Custom Range"

const kpiDetailReportPeriods: KpiDetailReportPeriod[] = [
  "Monthly",
  "Quarterly",
  "Yearly",
  "Custom Range",
]

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
  const [detailMetric, setDetailMetric] = useState<KpiConfiguration | null>(null)
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
              detailRows={getKpiDetailRows(
                metric,
                overviewContracts
              )}
              metric={metric}
              onOpen={() => setDetailMetric(metric)}
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

      {detailMetric ? (
        <KpiDetailModal
          key={getKpiSeriesKey(detailMetric)}
          detailRows={getKpiDetailRows(
            detailMetric,
            overviewContracts
          )}
          metric={detailMetric}
          onClose={() => setDetailMetric(null)}
        />
      ) : null}
    </DashboardLayout>
  )
}

function KpiSummaryCard({
  contracts,
  detailRows,
  metric,
  onOpen,
}: {
  contracts: EnterpriseContract[]
  detailRows: KpiDetailRow[]
  metric: KpiConfiguration
  onOpen: () => void
}) {
  const currentValue = getLatestKpiDetailValue(metric, detailRows)
  const contextItems = getKpiCardContextItems(metric, detailRows)
  const progress = getKpiProgressFromValue(metric, currentValue)
  const formattedCurrentValue = formatKpiValue(
    currentValue,
    metric.format,
    metric.precision
  )

  return (
    <button
      aria-label={`Open ${metric.name} KPI detail`}
      className="flex min-h-56 w-full min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-[0_2px_4px_rgba(15,23,42,0.08),0_16px_32px_rgba(15,23,42,0.08)] focus:outline-none focus:ring-4 focus:ring-violet-500/15 min-[1180px]:p-4"
      onClick={onOpen}
      type="button"
    >
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

      {contextItems.length ? (
        <div className="mt-3 space-y-1.5 rounded-xl border border-slate-100 bg-white/70 px-3 py-2">
          {contextItems.map((item) => (
            <div
              className="flex min-w-0 items-center justify-between gap-2 text-xs"
              key={item.label}
            >
              <span className="truncate font-semibold text-slate-500">
                {item.label}
              </span>
              <span
                className="shrink-0 whitespace-nowrap font-bold text-slate-950 tabular-nums"
                title={`${item.value} ${item.label}`}
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>
      ) : null}

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
    </button>
  )
}

function KpiDetailModal({
  detailRows,
  metric,
  onClose,
}: {
  detailRows: KpiDetailRow[]
  metric: KpiConfiguration
  onClose: () => void
}) {
  const [reportPeriod, setReportPeriod] =
    useState<KpiDetailReportPeriod>(metric.periodType)
  const [isExporting, setIsExporting] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const reportRows = useMemo(
    () => buildKpiDetailReportRows(detailRows, reportPeriod, metric),
    [detailRows, metric, reportPeriod]
  )
  const model = useMemo(
    () => buildKpiDetailModel(metric, reportRows),
    [metric, reportRows]
  )
  const chartRows = reportRows.map((row) => ({
    month: row.month,
    ...row.values,
  }))
  const reportPeriodLabel = getKpiDetailReportPeriodLabel(
    reportRows,
    reportPeriod
  )
  const exportPayload = useMemo(
    () =>
      buildKpiDetailExportPayload({
        metric,
        model,
        reportPeriod,
        reportPeriodLabel,
        rows: reportRows,
      }),
    [metric, model, reportPeriod, reportPeriodLabel, reportRows]
  )

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsMounted(true))

    return () => cancelAnimationFrame(frame)
  }, [])

  const exportExcel = () => {
    setIsExporting(true)
    try {
      downloadXlsxReport(exportPayload)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4 backdrop-blur-sm">
      <div
        aria-modal="true"
        className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
        role="dialog"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-violet-600">
              KPI Detail
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
              {metric.name}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {metric.service} / {metric.periodType} KPI analysis and reporting view.
            </p>
          </div>
          <button
            aria-label="Close KPI detail"
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
            onClick={onClose}
            type="button"
          >
            <X className="size-4" />
          </button>
        </div>

        <section className="mb-6">
          <h3 className="text-lg font-semibold tracking-tight text-slate-950">
            KPI Summary
          </h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {model.summaryItems.map((item) => (
              <KpiDetailSummaryCard
                key={item.label}
                label={item.label}
                value={item.value}
              />
            ))}
          </div>
        </section>

        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <SegmentedFilter
              label="Period Selector"
              onChange={setReportPeriod}
              options={kpiDetailReportPeriods}
              value={reportPeriod}
            />
            <div className="text-sm text-slate-500 lg:max-w-sm lg:text-right">
              Export uses {metric.service} data with the selected{" "}
              <span className="font-semibold text-slate-700">
                {reportPeriodLabel}
              </span>{" "}
              report period.
            </div>
          </div>
        </section>

        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold tracking-tight text-slate-950">
                Trend Chart
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Source trend data showing how this KPI has moved over time.
              </p>
            </div>
            <span className="inline-flex w-fit items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
              {reportPeriodLabel}
            </span>
          </div>
          <KpiDetailChartLegend fields={model.chartFields} />
          <div className="h-80">
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartRows} margin={{ left: 4, right: 16, top: 8 }}>
                  <CartesianGrid stroke="#eef2f7" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <YAxis
                    yAxisId="left"
                    tickFormatter={(value) =>
                      formatKpiChartAxisValue(value, model.chartFields, "left")
                    }
                    tickLine={false}
                    axisLine={false}
                    width={getChartAxisWidth(model.chartFields, "left")}
                  />
                  {hasRightAxis(model.chartFields) ? (
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tickFormatter={(value) =>
                        formatKpiChartAxisValue(value, model.chartFields, "right")
                      }
                      tickLine={false}
                      axisLine={false}
                      width={64}
                    />
                  ) : null}
                  <Tooltip
                    formatter={(value, name) =>
                      formatKpiChartTooltipValue(value, name, model.chartFields)
                    }
                    labelFormatter={(label) => `${label}`}
                  />
                  {model.chartFields.map((field) => (
                    <Line
                      dataKey={field.key}
                      dot={{ r: 3 }}
                      key={field.key}
                      name={field.label}
                      stroke={field.color ?? "#7c3aed"}
                      strokeWidth={2.6}
                      type="monotone"
                      yAxisId={field.axis ?? "left"}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full rounded-xl bg-slate-100" />
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200">
          <div className="flex flex-col gap-3 border-b border-slate-100 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold tracking-tight text-slate-950">
                Data Table
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Table data follows the selected modal report period.
              </p>
            </div>
            <button
              className="inline-flex h-10 w-fit items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isExporting}
              onClick={exportExcel}
              type="button"
            >
              <FileSpreadsheet className="size-4 text-violet-600" />
              {isExporting ? "Exporting..." : "Export Excel"}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Month</th>
                  {model.tableFields.map((field) => (
                    <th key={field.key} className="px-5 py-3 text-right">
                      {field.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportRows.map((row) => (
                <tr key={row.month}>
                  <td className="whitespace-nowrap px-5 py-4 font-bold text-slate-950">
                    {row.month}
                  </td>
                  {model.tableFields.map((field) => (
                    <td
                      key={field.key}
                      className="whitespace-nowrap px-5 py-4 text-right font-semibold text-slate-700"
                    >
                      {formatDetailValue(row.values[field.key] ?? 0, field)}
                    </td>
                  ))}
                </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}

function KpiDetailSummaryCard({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 max-w-full whitespace-nowrap font-bold leading-tight tracking-tight text-slate-950 tabular-nums",
          valueSizeClass(value)
        )}
        title={value}
      >
        {value}
      </p>
    </div>
  )
}

function KpiDetailChartLegend({ fields }: { fields: KpiDetailField[] }) {
  return (
    <div className="mb-5 flex flex-wrap items-center gap-3">
      {fields.map((field) => (
        <span
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500"
          key={field.key}
        >
          <span
            className="size-2.5 rounded-full"
            style={{ backgroundColor: field.color ?? "#7c3aed" }}
          />
          {field.label}
        </span>
      ))}
    </div>
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

const monthlyKpiMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]

const detailChartColors = [
  "#7c3aed",
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#f43f5e",
  "#64748b",
]

function getKpiDetailRows(
  metric: KpiConfiguration,
  contracts: EnterpriseContract[]
) {
  return createMockKpiDetailRows(metric, contracts)
}

function getKpiSeriesKey(metric: KpiConfiguration) {
  return `${metric.service}-${metric.periodType}-${normalizeKpiKey(metric.name)}`
}

function getKpiCardContextItems(
  metric: KpiConfiguration,
  rows: KpiDetailRow[]
): KpiCardContextItem[] {
  const values = rows.at(-1)?.values

  if (!values) {
    return []
  }

  const detailType = getKpiDetailType(metric)

  if (detailType === "visitors") {
    return [
      {
        label: "Organic Visitors",
        value: formatKpiValue(
          values.organicVisitors ??
            sumValues(values, ["yetteyOrganicVisitors", "vpickOrganicVisitors"]),
          "number"
        ),
      },
      {
        label: "Paid Visitors",
        value: formatKpiValue(
          values.paidVisitors ??
            sumValues(values, ["yetteyPaidVisitors", "vpickPaidVisitors"]),
          "number"
        ),
      },
    ]
  }

  if (detailType === "signupConversion") {
    return [
      {
        label: "Signups",
        value: formatKpiValue(values.totalSignups, "number"),
      },
    ]
  }

  if (detailType === "activation") {
    return [
      {
        label: "Activated Users",
        value: formatKpiValue(values.activatedUsers, "number"),
      },
    ]
  }

  if (detailType === "retention") {
    return [
      {
        label: "Retained Users",
        value: formatKpiValue(values.retainedUsers, "number"),
      },
    ]
  }

  if (detailType === "revenue") {
    return [
      {
        label: "Subscription Users",
        value: formatKpiValue(values.subscriptionUsers, "number"),
      },
      {
        label: "Enterprise Customers",
        value: formatKpiValue(values.enterpriseCustomers, "number"),
      },
    ]
  }

  if (detailType === "churn") {
    return [
      {
        label: "Churned Users",
        value: formatKpiValue(values.churnedUsers, "number"),
      },
    ]
  }

  if (detailType === "paidConversion") {
    return [
      {
        label: "Paid Users",
        value: formatKpiValue(values.paidUsers, "number"),
      },
    ]
  }

  return []
}

function buildKpiDetailReportRows(
  rows: KpiDetailRow[],
  reportPeriod: KpiDetailReportPeriod,
  metric: KpiConfiguration
) {
  if (reportPeriod === "Monthly") {
    return rows
  }

  if (reportPeriod === "Custom Range") {
    return rows.slice(Math.max(0, rows.length - 4))
  }

  if (reportPeriod === "Quarterly") {
    return [
      aggregateKpiDetailRows("Q1", rows.slice(0, 3), metric),
      aggregateKpiDetailRows("Q2", rows.slice(3, 6), metric),
    ].filter((row) => Object.keys(row.values).length)
  }

  return [aggregateKpiDetailRows("2026", rows, metric)].filter((row) =>
    Object.keys(row.values).length
  )
}

function aggregateKpiDetailRows(
  label: string,
  rows: KpiDetailRow[],
  metric: KpiConfiguration
): KpiDetailRow {
  if (!rows.length) {
    return { month: label, values: {} }
  }

  const fieldModel = getKpiDetailFieldModel(metric)
  const fieldsByKey = new Map(
    [...fieldModel.editFields, ...fieldModel.chartFields, ...fieldModel.tableFields].map(
      (field) => [field.key, field]
    )
  )
  const keys = new Set(rows.flatMap((row) => Object.keys(row.values)))
  const values: Record<string, number> = {}

  keys.forEach((key) => {
    const field = fieldsByKey.get(key)
    const rowValues = rows.map((row) => row.values[key] ?? 0)
    const shouldAverage =
      getKpiDetailType(metric) === "generic" || field?.format === "percentage"

    values[key] = shouldAverage
      ? rowValues.reduce((total, value) => total + value, 0) / rowValues.length
      : rowValues.reduce((total, value) => total + value, 0)
  })

  return normalizeKpiDetailRow({ month: label, values }, metric)
}

function getKpiDetailReportPeriodLabel(
  rows: KpiDetailRow[],
  reportPeriod: KpiDetailReportPeriod
) {
  if (!rows.length) {
    return reportPeriod
  }

  if (reportPeriod === "Quarterly") {
    return rows.map((row) => row.month).join(" / ")
  }

  if (reportPeriod === "Yearly") {
    return rows[0]?.month ?? "2026"
  }

  const first = rows[0]?.month
  const last = rows.at(-1)?.month

  return first && last && first !== last ? `${first} - ${last}` : first ?? reportPeriod
}

function buildKpiDetailExportPayload({
  metric,
  model,
  reportPeriod,
  reportPeriodLabel,
  rows,
}: {
  metric: KpiConfiguration
  model: KpiDetailModel
  reportPeriod: KpiDetailReportPeriod
  reportPeriodLabel: string
  rows: KpiDetailRow[]
}): ExportReportPayload {
  return {
    datasets: [
      {
        name: "Chart Source Data",
        rows: toKpiDetailExportRows(rows, model.chartFields),
      },
      {
        name: "Data Table",
        rows: toKpiDetailExportRows(rows, model.tableFields),
      },
    ],
    filename: [
      "kpi-detail",
      normalizeKpiKey(metric.name),
      normalizeKpiKey(metric.service),
      normalizeKpiKey(reportPeriod),
    ].join("-"),
    filters: {
      KPI: metric.name,
      "Selected Service": metric.service,
      "Overview Period": metric.periodType,
      "Detail Period": reportPeriod,
      "Report Range": reportPeriodLabel,
    },
    kpis: model.summaryItems.map((item) => ({
      label: item.label,
      value: item.value,
    })),
    subtitle:
      "Mock KPI analysis export including chart source data, table data, selected service, and selected period.",
    title: `${metric.name} KPI Detail`,
  }
}

function toKpiDetailExportRows(
  rows: KpiDetailRow[],
  fields: KpiDetailField[]
): ExportRow[] {
  return rows.map((row) => {
    const exportRow: ExportRow = { Period: row.month }

    fields.forEach((field) => {
      exportRow[field.label] = normalizeExportFieldValue(
        row.values[field.key] ?? 0,
        field
      )
    })

    return exportRow
  })
}

function normalizeExportFieldValue(value: number, field: KpiDetailField) {
  if (field.format === "percentage") {
    return roundToPrecision(value, field.precision ?? 1)
  }

  return Math.round(value)
}

function createMockKpiDetailRows(
  metric: KpiConfiguration,
  contracts: EnterpriseContract[]
): KpiDetailRow[] {
  const detailType = getKpiDetailType(metric)
  const primaryValue = getFallbackAwareCurrentKpiValue(metric, contracts)
  const ratios = getMonthlyKpiRatios(detailType, metric)

  return monthlyKpiMonths.map((month, index) =>
    normalizeKpiDetailRow(
      {
        month,
        values: createMockKpiDetailValues({
          contracts,
          detailType,
          metric,
          ratio: ratios[index],
          value: primaryValue,
        }),
      },
      metric
    )
  )
}

function createMockKpiDetailValues({
  contracts,
  detailType,
  metric,
  ratio,
  value,
}: {
  contracts: EnterpriseContract[]
  detailType: KpiDetailType
  metric: KpiConfiguration
  ratio: number
  value: number
}) {
  const isOverall = metric.service === "Overall"

  if (detailType === "visitors") {
    const totalVisitors = Math.round(value * ratio)

    return isOverall
      ? buildOverallVisitorValues(totalVisitors)
      : buildServiceVisitorValues(totalVisitors, metric.service)
  }

  if (detailType === "signupConversion") {
    const visitors = Math.round(getContextualCount(235869, metric) * ratio)
    const conversionRate = normalizePercentageValue(value * ratio)
    const totalSignups = Math.round(visitors * (conversionRate / 100))

    return isOverall
      ? {
          ...buildOverallVisitorValues(visitors),
          totalSignups,
        }
      : {
          ...buildServiceVisitorValues(visitors, metric.service),
          totalSignups,
        }
  }

  if (detailType === "activation") {
    const signups = Math.round(getContextualCount(13444, metric) * ratio)
    const activationRate = normalizePercentageValue(value * ratio)
    const activatedUsers = Math.round(signups * (activationRate / 100))

    return isOverall
      ? splitOverallCountValues(signups, activatedUsers, "signups", "activatedUsers")
      : { activatedUsers, signups }
  }

  if (detailType === "retention") {
    const activeUsers = Math.round(getContextualCount(4980, metric) * ratio)
    const retentionRate = normalizePercentageValue(value * ratio)
    const retainedUsers = Math.round(activeUsers * (retentionRate / 100))

    return isOverall
      ? splitOverallCountValues(
          activeUsers,
          retainedUsers,
          "activeUsers",
          "retainedUsers"
        )
      : { activeUsers, retainedUsers }
  }

  if (detailType === "revenue") {
    const revenueValues = getRevenueDetailValues(metric, contracts, value, ratio)

    return isOverall
      ? splitOverallRevenueValues(revenueValues)
      : revenueValues
  }

  if (detailType === "churn") {
    const paidUsers = Math.round(getContextualCount(1524, metric) * ratio)
    const churnRate = normalizePercentageValue(value * ratio)
    const churnedUsers = Math.round(paidUsers * (churnRate / 100))

    return isOverall
      ? splitOverallCountValues(paidUsers, churnedUsers, "paidUsers", "churnedUsers")
      : { churnedUsers, paidUsers }
  }

  if (detailType === "paidConversion") {
    const signups = Math.round(getContextualCount(13444, metric) * ratio)
    const paidConversionRate = normalizePercentageValue(value * ratio)
    const paidUsers = Math.round(signups * (paidConversionRate / 100))

    return isOverall
      ? splitOverallCountValues(signups, paidUsers, "signups", "paidUsers")
      : { paidUsers, signups }
  }

  return { value: normalizeDetailFieldValue(value * ratio, getGenericField(metric)) }
}

function getFallbackAwareCurrentKpiValue(
  metric: KpiConfiguration,
  contracts: EnterpriseContract[]
) {
  const normalizedName = normalizeKpiKey(metric.name)
  const currentValue = getKpiCurrentValue(metric, contracts)

  if (currentValue > 0) {
    return currentValue
  }

  if (normalizedName === "visitors") {
    return getContextualCount(235869, metric)
  }

  if (normalizedName === "signup-conversion-rate") {
    return 5.7
  }

  if (normalizedName === "activation-rate") {
    return 54
  }

  if (normalizedName === "d7-retention") {
    return 42
  }

  if (normalizedName === "d14-retention") {
    return 48
  }

  if (normalizedName === "d30-retention" || normalizedName.endsWith("retention")) {
    return 47
  }

  if (normalizedName === "churn-rate") {
    return 2.1
  }

  if (normalizedName === "paid-conversion-rate") {
    return 18.4
  }

  if (normalizedName === "enterprise-revenue") {
    return 170000000
  }

  if (
    normalizedName === "mrr" ||
    normalizedName === "revenue" ||
    normalizedName === "total-revenue"
  ) {
    return 545000000
  }

  if (metric.targetValue) {
    return metric.direction === "lower"
      ? metric.targetValue * 0.9
      : metric.targetValue * 0.75
  }

  return metric.format === "percentage" ? 50 : 100
}

function getMonthlyKpiRatios(
  detailType: KpiDetailType,
  metric: KpiConfiguration
) {
  if (metric.direction === "lower" || detailType === "churn") {
    return [1.43, 1.33, 1.24, 1.15, 1.07, 1]
  }

  if (metric.format === "percentage") {
    return [0.73, 0.78, 0.84, 0.9, 0.95, 1]
  }

  if (metric.format === "currency") {
    return [0.56, 0.64, 0.72, 0.81, 0.91, 1]
  }

  return [0.51, 0.55, 0.62, 0.7, 0.82, 1]
}

function buildKpiDetailModel(
  metric: KpiConfiguration,
  rows: KpiDetailRow[]
): KpiDetailModel {
  const fieldModel = getKpiDetailFieldModel(metric)
  const latestRow = rows.at(-1)

  return {
    ...fieldModel,
    summaryItems: getKpiDetailSummaryItems(metric, latestRow, fieldModel),
  }
}

function getKpiDetailFieldModel(
  metric: KpiConfiguration
): Omit<KpiDetailModel, "summaryItems"> {
  const detailType = getKpiDetailType(metric)
  const isOverall = metric.service === "Overall"

  if (detailType === "visitors") {
    const editFields = isOverall
      ? [
          detailField("yetteyOrganicVisitors", "Yettey Organic", "number", 0),
          detailField("yetteyPaidVisitors", "Yettey Paid", "number", 1),
          detailField("vpickOrganicVisitors", "VPICK Organic", "number", 2),
          detailField("vpickPaidVisitors", "VPICK Paid", "number", 3),
        ]
      : [
          detailField("organicVisitors", "Organic Visitors", "number", 0),
          detailField("paidVisitors", "Paid Visitors", "number", 1),
        ]
    const totalField = detailField("totalVisitors", "Total Visitors", "number", 4)

    return {
      chartFields: [...editFields, totalField],
      editFields,
      primaryValueKey: "totalVisitors",
      tableFields: [...editFields, totalField],
    }
  }

  if (detailType === "signupConversion") {
    const editFields = isOverall
      ? [
          detailField("yetteyOrganicVisitors", "Yettey Organic Visitors", "number", 0),
          detailField("yetteyPaidVisitors", "Yettey Paid Visitors", "number", 1),
          detailField("vpickOrganicVisitors", "VPICK Organic Visitors", "number", 2),
          detailField("vpickPaidVisitors", "VPICK Paid Visitors", "number", 3),
          detailField("totalSignups", "Total Signups", "number", 4),
        ]
      : [
          detailField("organicVisitors", "Organic Visitors", "number", 0),
          detailField("paidVisitors", "Paid Visitors", "number", 1),
          detailField("totalSignups", "Total Signups", "number", 2),
        ]
    const conversionRate = detailField(
      "conversionRate",
      "Conversion Rate",
      "percentage",
      5,
      { axis: "right", precision: 1 }
    )
    const chartFields = isOverall
      ? [
          detailField("yetteyOrganicSignups", "Yettey Organic Signups", "number", 0),
          detailField("yetteyPaidSignups", "Yettey Paid Signups", "number", 1),
          detailField("vpickOrganicSignups", "VPICK Organic Signups", "number", 2),
          detailField("vpickPaidSignups", "VPICK Paid Signups", "number", 3),
          detailField("totalSignups", "Total Signups", "number", 4),
        ]
      : [
          detailField("organicSignups", "Organic Signups", "number", 0),
          detailField("paidSignups", "Paid Signups", "number", 1),
          detailField("totalSignups", "Total Signups", "number", 2),
        ]

    return {
      chartFields,
      editFields,
      primaryValueKey: "conversionRate",
      tableFields: [...editFields, conversionRate],
    }
  }

  if (detailType === "activation" || detailType === "paidConversion") {
    const countLabel = detailType === "activation" ? "Activated Users" : "Paid Users"
    const countKey = detailType === "activation" ? "activatedUsers" : "paidUsers"
    const rateKey = detailType === "activation" ? "activationRate" : "paidConversionRate"
    const rateLabel =
      detailType === "activation" ? "Activation Rate" : "Paid Conversion Rate"
    const editFields = isOverall
      ? [
          detailField("yetteySignups", "Yettey Signups", "number", 0),
          detailField(`yettey${capitalize(countKey)}`, `Yettey ${countLabel}`, "number", 1),
          detailField("vpickSignups", "VPICK Signups", "number", 2),
          detailField(`vpick${capitalize(countKey)}`, `VPICK ${countLabel}`, "number", 3),
        ]
      : [
          detailField("signups", "Signups", "number", 0),
          detailField(countKey, countLabel, "number", 1),
        ]
    const rateField = detailField(rateKey, rateLabel, "percentage", 4, {
      axis: "right",
      precision: 1,
    })
    const totalCountField = detailField(countKey, countLabel, "number", 4)

    return {
      chartFields: isOverall
        ? [
            detailField(`yettey${capitalize(countKey)}`, `Yettey ${countLabel}`, "number", 0),
            detailField(`vpick${capitalize(countKey)}`, `VPICK ${countLabel}`, "number", 1),
            totalCountField,
            rateField,
          ]
        : [totalCountField, rateField],
      editFields,
      primaryValueKey: rateKey,
      tableFields: isOverall
        ? [
            ...editFields,
            detailField("signups", "Total Signups", "number", 4),
            totalCountField,
            rateField,
          ]
        : [...editFields, rateField],
    }
  }

  if (detailType === "retention") {
    const editFields = isOverall
      ? [
          detailField("yetteyActiveUsers", "Yettey Active Users", "number", 0),
          detailField("yetteyRetainedUsers", "Yettey Retained Users", "number", 1),
          detailField("vpickActiveUsers", "VPICK Active Users", "number", 2),
          detailField("vpickRetainedUsers", "VPICK Retained Users", "number", 3),
        ]
      : [
          detailField("activeUsers", "Active Users", "number", 0),
          detailField("retainedUsers", "Retained Users", "number", 1),
        ]
    const retainedUsers = detailField("retainedUsers", "Retained Users", "number", 2)
    const retentionRate = detailField("retentionRate", "Retention Rate", "percentage", 3, {
      axis: "right",
      precision: 1,
    })

    return {
      chartFields: isOverall
        ? [
            detailField("yetteyRetainedUsers", "Yettey Retained Users", "number", 0),
            detailField("vpickRetainedUsers", "VPICK Retained Users", "number", 1),
            retainedUsers,
            retentionRate,
          ]
        : [retainedUsers, retentionRate],
      editFields,
      primaryValueKey: "retentionRate",
      tableFields: isOverall
        ? [
            ...editFields,
            detailField("activeUsers", "Total Active Users", "number", 4),
            retainedUsers,
            retentionRate,
          ]
        : [...editFields, retentionRate],
    }
  }

  if (detailType === "revenue") {
    const editFields = isOverall
      ? [
          detailField("yetteySubscriptionRevenue", "Yettey Subscription", "currency", 0),
          detailField("yetteyEnterpriseRevenue", "Yettey Enterprise", "currency", 1),
          detailField("vpickSubscriptionRevenue", "VPICK Subscription", "currency", 2),
          detailField("vpickEnterpriseRevenue", "VPICK Enterprise", "currency", 3),
          detailField("subscriptionUsers", "Subscription Users", "number", 4),
          detailField("enterpriseCustomers", "Enterprise Customers", "number", 5),
        ]
      : [
          detailField("subscriptionRevenue", "Subscription Revenue", "currency", 0),
          detailField("enterpriseRevenue", "Enterprise Revenue", "currency", 1),
          detailField("subscriptionUsers", "Subscription Users", "number", 2),
          detailField("enterpriseCustomers", "Enterprise Customers", "number", 3),
        ]
    const totalRevenue = detailField("totalRevenue", "Total Revenue", "currency", 4)
    const revenueChartFields = isOverall
      ? [
          detailField("yetteySubscriptionRevenue", "Yettey Subscription", "currency", 0),
          detailField("yetteyEnterpriseRevenue", "Yettey Enterprise", "currency", 1),
          detailField("vpickSubscriptionRevenue", "VPICK Subscription", "currency", 2),
          detailField("vpickEnterpriseRevenue", "VPICK Enterprise", "currency", 3),
          totalRevenue,
        ]
      : [
          detailField("subscriptionRevenue", "Subscription Revenue", "currency", 0),
          detailField("enterpriseRevenue", "Enterprise Revenue", "currency", 1),
          totalRevenue,
        ]

    return {
      chartFields: revenueChartFields,
      editFields,
      primaryValueKey: "totalRevenue",
      tableFields: [...editFields, totalRevenue],
    }
  }

  if (detailType === "churn") {
    const editFields = isOverall
      ? [
          detailField("yetteyPaidUsers", "Yettey Paid Users", "number", 0),
          detailField("yetteyChurnedUsers", "Yettey Churned Users", "number", 1),
          detailField("vpickPaidUsers", "VPICK Paid Users", "number", 2),
          detailField("vpickChurnedUsers", "VPICK Churned Users", "number", 3),
        ]
      : [
          detailField("paidUsers", "Paid Users", "number", 0),
          detailField("churnedUsers", "Churned Users", "number", 1),
        ]
    const churnedUsers = detailField("churnedUsers", "Churned Users", "number", 2)
    const churnRate = detailField("churnRate", "Churn Rate", "percentage", 3, {
      axis: "right",
      precision: 1,
    })

    return {
      chartFields: isOverall
        ? [
            detailField("yetteyChurnedUsers", "Yettey Churned Users", "number", 0),
            detailField("vpickChurnedUsers", "VPICK Churned Users", "number", 1),
            churnedUsers,
            churnRate,
          ]
        : [churnedUsers, churnRate],
      editFields,
      primaryValueKey: "churnRate",
      tableFields: isOverall
        ? [
            ...editFields,
            detailField("paidUsers", "Total Paid Users", "number", 4),
            churnedUsers,
            churnRate,
          ]
        : [...editFields, churnRate],
    }
  }

  const genericField = getGenericField(metric)

  return {
    chartFields: [genericField],
    editFields: [genericField],
    primaryValueKey: genericField.key,
    tableFields: [genericField],
  }
}

function getKpiDetailSummaryItems(
  metric: KpiConfiguration,
  latestRow: KpiDetailRow | undefined,
  model: Omit<KpiDetailModel, "summaryItems">
) {
  const values = latestRow?.values ?? {}
  const primaryValue = values[model.primaryValueKey] ?? 0
  const achievement = getKpiProgressFromValue(metric, primaryValue)
  const detailType = getKpiDetailType(metric)
  const countOrRateItems =
    detailType === "visitors"
      ? [
          summaryItem("Organic Visitors", values.organicVisitors ?? sumValues(values, ["yetteyOrganicVisitors", "vpickOrganicVisitors"])),
          summaryItem("Paid Visitors", values.paidVisitors ?? sumValues(values, ["yetteyPaidVisitors", "vpickPaidVisitors"])),
          summaryItem("Total Visitors", values.totalVisitors, "number"),
        ]
      : detailType === "signupConversion"
        ? [
            summaryItem("Visitors", values.totalVisitors, "number"),
            summaryItem("Signups", values.totalSignups, "number"),
            summaryItem("Conversion Rate", values.conversionRate, "percentage", 1),
          ]
        : detailType === "activation"
          ? [
              summaryItem("Signups", values.signups, "number"),
              summaryItem("Activated Users", values.activatedUsers, "number"),
              summaryItem("Activation Rate", values.activationRate, "percentage", 1),
            ]
          : detailType === "retention"
            ? [
                summaryItem("Active Users", values.activeUsers, "number"),
                summaryItem("Retained Users", values.retainedUsers, "number"),
                summaryItem("Retention Rate", values.retentionRate, "percentage", 1),
              ]
            : detailType === "revenue"
              ? [
                  summaryItem("Subscription Revenue", values.subscriptionRevenue, "currency"),
                  summaryItem("Enterprise Revenue", values.enterpriseRevenue, "currency"),
                  summaryItem("Total Revenue", values.totalRevenue, "currency"),
                  summaryItem("Subscription Users", values.subscriptionUsers, "number"),
                  summaryItem("Enterprise Customers", values.enterpriseCustomers, "number"),
                ]
              : detailType === "churn"
                ? [
                    summaryItem("Paid Users", values.paidUsers, "number"),
                    summaryItem("Churned Users", values.churnedUsers, "number"),
                    summaryItem("Churn Rate", values.churnRate, "percentage", 1),
                  ]
                : detailType === "paidConversion"
                  ? [
                      summaryItem("Signups", values.signups, "number"),
                      summaryItem("Paid Users", values.paidUsers, "number"),
                      summaryItem("Paid Conversion", values.paidConversionRate, "percentage", 1),
                    ]
                  : [
                      {
                        label: "Current",
                        value: formatKpiValue(primaryValue, metric.format, metric.precision),
                      },
                    ]

  return [
    ...countOrRateItems,
    { label: "Target", value: formatKpiTarget(metric) },
    { label: "Achievement", value: `${achievement}%` },
  ]
}

function normalizeKpiDetailRow(row: KpiDetailRow, metric: KpiConfiguration) {
  const detailType = getKpiDetailType(metric)
  const values = { ...row.values }
  const isOverall = metric.service === "Overall"

  if (detailType === "visitors") {
    values.totalVisitors = isOverall
      ? sumValues(values, [
          "yetteyOrganicVisitors",
          "yetteyPaidVisitors",
          "vpickOrganicVisitors",
          "vpickPaidVisitors",
        ])
      : sumValues(values, ["organicVisitors", "paidVisitors"])
  }

  if (detailType === "signupConversion") {
    values.totalVisitors = isOverall
      ? sumValues(values, [
          "yetteyOrganicVisitors",
          "yetteyPaidVisitors",
          "vpickOrganicVisitors",
          "vpickPaidVisitors",
        ])
      : sumValues(values, ["organicVisitors", "paidVisitors"])
    values.conversionRate = percent(values.totalSignups, values.totalVisitors, 1)
    assignSignupBreakdown(values, isOverall)
  }

  if (detailType === "activation") {
    normalizeRateFromCounts(values, isOverall, {
      denominator: "signups",
      numerator: "activatedUsers",
      rate: "activationRate",
    })
  }

  if (detailType === "retention") {
    normalizeRateFromCounts(values, isOverall, {
      denominator: "activeUsers",
      numerator: "retainedUsers",
      rate: "retentionRate",
    })
  }

  if (detailType === "revenue") {
    values.subscriptionRevenue = isOverall
      ? sumValues(values, ["yetteySubscriptionRevenue", "vpickSubscriptionRevenue"])
      : values.subscriptionRevenue ?? 0
    values.enterpriseRevenue = isOverall
      ? sumValues(values, ["yetteyEnterpriseRevenue", "vpickEnterpriseRevenue"])
      : values.enterpriseRevenue ?? 0
    values.subscriptionUsers = values.subscriptionUsers ?? 0
    values.enterpriseCustomers = values.enterpriseCustomers ?? 0
    values.totalRevenue = sumValues(values, [
      "subscriptionRevenue",
      "enterpriseRevenue",
    ])
  }

  if (detailType === "churn") {
    normalizeRateFromCounts(values, isOverall, {
      denominator: "paidUsers",
      numerator: "churnedUsers",
      rate: "churnRate",
    })
  }

  if (detailType === "paidConversion") {
    normalizeRateFromCounts(values, isOverall, {
      denominator: "signups",
      numerator: "paidUsers",
      rate: "paidConversionRate",
    })
  }

  return { ...row, values: roundDetailValues(values) }
}

function getKpiDetailType(metric: KpiConfiguration): KpiDetailType {
  const normalizedName = normalizeKpiKey(metric.name)

  if (normalizedName === "visitors") {
    return "visitors"
  }

  if (normalizedName === "signup-conversion-rate") {
    return "signupConversion"
  }

  if (normalizedName === "activation-rate") {
    return "activation"
  }

  if (normalizedName.includes("retention")) {
    return "retention"
  }

  if (
    normalizedName === "mrr" ||
    normalizedName === "revenue" ||
    normalizedName === "total-revenue"
  ) {
    return "revenue"
  }

  if (normalizedName === "churn-rate") {
    return "churn"
  }

  if (normalizedName === "paid-conversion-rate") {
    return "paidConversion"
  }

  return "generic"
}

function getLatestKpiDetailValue(metric: KpiConfiguration, rows: KpiDetailRow[]) {
  const primaryValueKey = getKpiDetailFieldModel(metric).primaryValueKey

  return rows.at(-1)?.values[primaryValueKey] ?? 0
}

function getKpiProgressFromValue(metric: KpiConfiguration, currentValue: number) {
  if (!metric.targetValue || !currentValue) {
    return 0
  }

  if (metric.direction === "lower") {
    return Math.min(100, Math.round((metric.targetValue / currentValue) * 100))
  }

  return Math.min(100, Math.round((currentValue / metric.targetValue) * 100))
}

function formatKpiChartAxisValue(
  value: unknown,
  fields: KpiDetailField[],
  axis: "left" | "right"
) {
  const field = fields.find((item) => (item.axis ?? "left") === axis) ?? fields[0]

  return formatDetailValue(Number(value), field)
}

function formatKpiChartTooltipValue(
  value: unknown,
  name: unknown,
  fields: KpiDetailField[]
) {
  const label = String(name)
  const field = fields.find((item) => item.label === label) ?? fields[0]

  return [formatDetailValue(Number(value), field), label]
}

function hasRightAxis(fields: KpiDetailField[]) {
  return fields.some((field) => field.axis === "right")
}

function getChartAxisWidth(fields: KpiDetailField[], axis: "left" | "right") {
  const field = fields.find((item) => (item.axis ?? "left") === axis)

  return field?.format === "currency" ? 110 : 70
}

function formatDetailValue(value: number, field: KpiDetailField) {
  return formatKpiValue(
    Number.isFinite(value) ? value : 0,
    field.format,
    field.precision
  )
}

function normalizeDetailFieldValue(value: number, field: KpiDetailField) {
  if (!Number.isFinite(value)) {
    return 0
  }

  if (field.format === "percentage") {
    return normalizePercentageValue(value)
  }

  return Math.max(0, Math.round(value))
}

function detailField(
  key: string,
  label: string,
  format: KpiFormat,
  colorIndex: number,
  options: Partial<KpiDetailField> = {}
): KpiDetailField {
  return {
    color: detailChartColors[colorIndex % detailChartColors.length],
    format,
    key,
    label,
    ...options,
  }
}

function getGenericField(metric: KpiConfiguration) {
  return detailField("value", metric.name, metric.format, 0, {
    precision: metric.precision,
  })
}

function summaryItem(
  label: string,
  value = 0,
  format: KpiFormat = "number",
  precision = 0
) {
  return {
    label,
    value: formatKpiValue(value, format, precision),
  }
}

function buildServiceVisitorValues(totalVisitors: number, service: KpiService) {
  const paidShare = service === "VPICK" ? 0.34 : 0.28
  const paidVisitors = Math.round(totalVisitors * paidShare)

  return {
    organicVisitors: totalVisitors - paidVisitors,
    paidVisitors,
  }
}

function buildOverallVisitorValues(totalVisitors: number) {
  const yetteyVisitors = Math.round(totalVisitors * overviewServiceProfiles.Yettey.countScale)
  const vpickVisitors = totalVisitors - yetteyVisitors
  const yetteyPaidVisitors = Math.round(yetteyVisitors * 0.28)
  const vpickPaidVisitors = Math.round(vpickVisitors * 0.34)

  return {
    vpickOrganicVisitors: vpickVisitors - vpickPaidVisitors,
    vpickPaidVisitors,
    yetteyOrganicVisitors: yetteyVisitors - yetteyPaidVisitors,
    yetteyPaidVisitors,
  }
}

function splitOverallCountValues(
  denominator: number,
  numerator: number,
  denominatorKey: string,
  numeratorKey: string
) {
  const yetteyDenominator = Math.round(denominator * overviewServiceProfiles.Yettey.countScale)
  const vpickDenominator = denominator - yetteyDenominator
  const yetteyNumerator = Math.round(numerator * 0.58)

  return {
    [`vpick${capitalize(denominatorKey)}`]: vpickDenominator,
    [`vpick${capitalize(numeratorKey)}`]: numerator - yetteyNumerator,
    [`yettey${capitalize(denominatorKey)}`]: yetteyDenominator,
    [`yettey${capitalize(numeratorKey)}`]: yetteyNumerator,
  }
}

function getRevenueDetailValues(
  metric: KpiConfiguration,
  contracts: EnterpriseContract[],
  value: number,
  ratio: number
) {
  const enterpriseRevenue =
    getActiveEnterpriseRevenue(contracts) ||
    getContextualRevenue(170000000, metric)
  const subscriptionRevenue = Math.max(value - enterpriseRevenue, 0)
  const subscriptionUsers = Math.max(
    1,
    Math.round(getContextualCount(1247, metric) * ratio)
  )
  const enterpriseCustomers = Math.max(
    1,
    Math.round(getContextualCount(8, metric) * ratio)
  )

  return {
    enterpriseRevenue: Math.round(enterpriseRevenue * ratio),
    enterpriseCustomers,
    subscriptionRevenue: Math.round(subscriptionRevenue * ratio),
    subscriptionUsers,
  }
}

function splitOverallRevenueValues(values: Record<string, number>) {
  const subscriptionRevenue = values.subscriptionRevenue ?? 0
  const enterpriseRevenue = values.enterpriseRevenue ?? 0

  return {
    enterpriseCustomers: values.enterpriseCustomers ?? 0,
    subscriptionUsers: values.subscriptionUsers ?? 0,
    vpickEnterpriseRevenue: Math.round(enterpriseRevenue * 0.45),
    vpickSubscriptionRevenue: Math.round(subscriptionRevenue * 0.36),
    yetteyEnterpriseRevenue: Math.round(enterpriseRevenue * 0.55),
    yetteySubscriptionRevenue: Math.round(subscriptionRevenue * 0.64),
  }
}

function assignSignupBreakdown(
  values: Record<string, number>,
  isOverall: boolean
) {
  const totalSignups = values.totalSignups ?? 0
  const totalVisitors = values.totalVisitors ?? 0

  if (!totalVisitors) {
    return
  }

  if (isOverall) {
    ;[
      ["yetteyOrganicVisitors", "yetteyOrganicSignups"],
      ["yetteyPaidVisitors", "yetteyPaidSignups"],
      ["vpickOrganicVisitors", "vpickOrganicSignups"],
      ["vpickPaidVisitors", "vpickPaidSignups"],
    ].forEach(([visitorKey, signupKey]) => {
      values[signupKey] = Math.round(
        totalSignups * ((values[visitorKey] ?? 0) / totalVisitors)
      )
    })

    return
  }

  values.organicSignups = Math.round(
    totalSignups * ((values.organicVisitors ?? 0) / totalVisitors)
  )
  values.paidSignups = totalSignups - values.organicSignups
}

function normalizeRateFromCounts(
  values: Record<string, number>,
  isOverall: boolean,
  keys: {
    denominator: string
    numerator: string
    rate: string
  }
) {
  if (isOverall) {
    values[keys.denominator] = sumValues(values, [
      `yettey${capitalize(keys.denominator)}`,
      `vpick${capitalize(keys.denominator)}`,
    ])
    values[keys.numerator] = sumValues(values, [
      `yettey${capitalize(keys.numerator)}`,
      `vpick${capitalize(keys.numerator)}`,
    ])
  }

  values[keys.rate] = percent(values[keys.numerator], values[keys.denominator], 1)
}

function roundDetailValues(values: Record<string, number>) {
  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => [
      key,
      key.toLowerCase().includes("rate")
        ? normalizePercentageValue(value)
        : Math.max(0, Math.round(value)),
    ])
  )
}

function getContextualCount(baseValue: number, metric: KpiConfiguration) {
  return Math.round(
    baseValue *
      overviewServiceProfiles[metric.service].countScale *
      overviewPeriodProfiles[metric.periodType].countScale
  )
}

function getContextualRevenue(baseValue: number, metric: KpiConfiguration) {
  return Math.round(
    baseValue *
      overviewServiceProfiles[metric.service].revenueScale *
      overviewPeriodProfiles[metric.periodType].revenueScale
  )
}

function percent(numerator = 0, denominator = 0, precision = 1) {
  if (!denominator) {
    return 0
  }

  return roundToPrecision((numerator / denominator) * 100, precision)
}

function normalizePercentageValue(value: number) {
  return roundToPrecision(clamp(value, 0, 100), 1)
}

function sumValues(values: Record<string, number>, keys: string[]) {
  return keys.reduce((total, key) => total + (values[key] ?? 0), 0)
}

function capitalize(value: string) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`
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
