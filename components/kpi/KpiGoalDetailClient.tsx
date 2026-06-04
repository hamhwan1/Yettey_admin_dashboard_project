"use client"

import Link from "next/link"
import { useMemo, useState, type ReactNode } from "react"
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  Eye,
  EyeOff,
  Pin,
  Save,
  Settings2,
} from "lucide-react"

import AdminButton from "@/components/admin/AdminButton"
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
  kpiPeriodTypes,
  kpiServices,
  type EnterpriseContract,
  type KpiCalculationType,
  type KpiConfiguration,
  type KpiDirection,
  type KpiFormat,
  type KpiPeriodType,
  type KpiService,
} from "./kpi-data"

type KpiEditForm = Pick<
  KpiConfiguration,
  | "calculationType"
  | "currentValue"
  | "description"
  | "direction"
  | "displayOrder"
  | "format"
  | "name"
  | "periodLabel"
  | "periodType"
  | "pinned"
  | "service"
  | "showOnOverview"
  | "targetValue"
> & {
  reason: string
}

const kpiCalculationTypes: Array<{ label: string; value: KpiCalculationType }> = [
  { label: "Manual", value: "manual" },
  { label: "Total Revenue", value: "totalRevenue" },
  { label: "Enterprise Revenue", value: "enterpriseRevenue" },
]

const kpiDirections: Array<{ label: string; value: KpiDirection }> = [
  { label: "Higher is better", value: "higher" },
  { label: "Lower is better", value: "lower" },
]

const kpiFormats: Array<{ label: string; value: KpiFormat }> = [
  { label: "Percentage", value: "percentage" },
  { label: "Currency", value: "currency" },
  { label: "Number", value: "number" },
]

export default function KpiGoalDetailClient({
  initialEditOpen = false,
  kpiId,
}: {
  initialEditOpen?: boolean
  kpiId: string
}) {
  const { contracts, kpis, updateKpi } = useKpiManagementStore()
  const kpi = useMemo(() => kpis.find((item) => item.id === kpiId), [kpiId, kpis])
  const [editOpen, setEditOpen] = useState(initialEditOpen)
  const [feedback, setFeedback] = useState("KPI detail loaded")
  const [form, setForm] = useState<KpiEditForm | null>(() =>
    kpi ? toKpiEditForm(kpi) : null
  )

  if (!kpi) {
    return (
      <DashboardLayout>
        <PageHeader
          breadcrumbs={[{ label: "Dashboards" }, { label: "KPI" }, { label: "Goals" }]}
          title="KPI Not Found"
          description="The selected mock KPI definition is not available."
          actions={<BackLink />}
        />
      </DashboardLayout>
    )
  }

  const currentValue = getKpiCurrentValue(kpi, contracts)
  const progress = getKpiProgress(kpi, contracts)
  const status = getKpiStatus(kpi, contracts)

  const handleSave = () => {
    if (!form) {
      return
    }

    const patch: Partial<KpiConfiguration> = {
      calculationType: form.calculationType,
      currentValue: form.currentValue,
      description: form.description,
      direction: form.direction,
      displayOrder: Math.max(1, Math.floor(form.displayOrder || 1)),
      format: form.format,
      name: form.name,
      periodLabel: form.periodLabel,
      periodType: form.periodType,
      pinned: form.pinned,
      precision: form.format === "percentage" ? 1 : 0,
      service: form.service,
      showOnOverview: form.showOnOverview,
      targetPrefix: form.direction === "lower" ? "<" : undefined,
      targetValue: form.targetValue,
    }

    updateKpi(kpi.id, patch, form.reason.trim() || "KPI target updated")
    setFeedback(`${form.name} saved with history tracking`)
    setEditOpen(false)
  }

  return (
    <DashboardLayout>
      <PageHeader
        breadcrumbs={[
          { label: "Dashboards" },
          { label: "KPI" },
          { label: "Goals" },
          { label: kpi.name },
        ]}
        title={kpi.name}
        description="Review KPI settings, current health, and historical target changes."
        actions={
          <>
            <BackLink />
            <AdminButton
              onClick={() => {
                setForm(toKpiEditForm(kpi))
                setEditOpen(true)
              }}
              variant="primary"
            >
              <Settings2 className="size-4" />
              Edit KPI
            </AdminButton>
          </>
        }
      />

      <div className="mb-6 rounded-2xl border border-violet-100 bg-violet-50 px-5 py-4 text-sm font-bold text-violet-700">
        {feedback}
      </div>

      <div className="grid gap-8 xl:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <InfoSection kpi={kpi} />
          <HistorySection kpi={kpi} />
        </div>

        <StatusSection
          contracts={contracts}
          currentValue={currentValue}
          kpi={kpi}
          progress={progress}
          status={status}
        />
      </div>

      {editOpen && form ? (
        <KpiEditModal
          form={form}
          onCancel={() => setEditOpen(false)}
          onChange={setForm}
          onSave={handleSave}
        />
      ) : null}
    </DashboardLayout>
  )
}

function InfoSection({ kpi }: { kpi: KpiConfiguration }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_16px_40px_rgba(15,23,42,0.06)]">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-950">
            KPI Information
          </h2>
          <p className="mt-1 text-sm text-slate-500">{kpi.description}</p>
        </div>
        <StatusBadge tone={kpi.archived ? "danger" : "neutral"}>
          {kpi.archived ? "Archived" : "Active"}
        </StatusBadge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <InfoItem label="KPI Name" value={kpi.name} />
        <InfoItem label="Service" value={kpi.service} />
        <InfoItem label="Format" value={formatLabel(kpi.format)} />
        <InfoItem label="Calculation Type" value={formatLabel(kpi.calculationType)} />
        <InfoItem label="Display Order" value={String(kpi.displayOrder)} />
        <InfoItem label="Period" value={`${kpi.periodLabel} / ${kpi.periodType}`} />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <FlagBadge active={kpi.showOnOverview} icon={<Eye className="size-3.5" />}>
          {kpi.showOnOverview ? "Visible" : "Hidden"}
        </FlagBadge>
        <FlagBadge active={kpi.pinned} icon={<Pin className="size-3.5" />}>
          {kpi.pinned ? "Pinned" : "Not Pinned"}
        </FlagBadge>
      </div>
    </section>
  )
}

function StatusSection({
  contracts,
  currentValue,
  kpi,
  progress,
  status,
}: {
  contracts: EnterpriseContract[]
  currentValue: number
  kpi: KpiConfiguration
  progress: number
  status: string
}) {
  return (
    <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-950">
            Current KPI Status
          </h2>
          <p className="mt-1 text-sm text-slate-500">{kpi.periodLabel}</p>
        </div>
        <StatusBadge tone={statusTone(status)}>{status}</StatusBadge>
      </div>

      <dl className="mt-6 space-y-4">
        <MetricRow
          label="Current Value"
          title={getRevenueTitle(kpi, contracts)}
          value={formatKpiValue(currentValue, kpi.format, kpi.precision)}
        />
        <MetricRow label="Target Value" value={formatKpiTarget(kpi)} />
        <MetricRow label="Progress" value={`${progress}%`} />
        <div className="pt-1">
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-violet-500"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
          <span className="text-sm font-bold text-slate-500">Trend</span>
          <TrendBadge kpi={kpi} />
        </div>
      </dl>
    </aside>
  )
}

function HistorySection({ kpi }: { kpi: KpiConfiguration }) {
  const history = kpi.history ?? []

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06),0_16px_40px_rgba(15,23,42,0.06)]">
      <div className="border-b border-slate-100 p-6">
        <h2 className="text-xl font-semibold tracking-tight text-slate-950">
          KPI History
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Target changes created by administrator edits.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-[820px] w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Changed By</th>
              <th className="px-6 py-4">Previous Value</th>
              <th className="px-6 py-4">New Value</th>
              <th className="px-6 py-4">Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {history.length ? (
              history.map((record) => (
                <tr key={record.id}>
                  <td className="whitespace-nowrap px-6 py-5 font-semibold text-slate-700">
                    {record.date}
                  </td>
                  <td className="whitespace-nowrap px-6 py-5 font-semibold text-slate-700">
                    {record.changedBy}
                  </td>
                  <td className="whitespace-nowrap px-6 py-5 font-semibold text-slate-500">
                    {record.previousValue}
                  </td>
                  <td className="whitespace-nowrap px-6 py-5 font-bold text-slate-950">
                    {record.newValue}
                  </td>
                  <td className="px-6 py-5 font-medium text-slate-600">
                    {record.reason}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-6 py-8 text-sm font-semibold text-slate-500" colSpan={5}>
                  No KPI target history yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function KpiEditModal({
  form,
  onCancel,
  onChange,
  onSave,
}: {
  form: KpiEditForm
  onCancel: () => void
  onChange: (form: KpiEditForm) => void
  onSave: () => void
}) {
  const updateForm = (patch: Partial<KpiEditForm>) => {
    onChange({ ...form, ...patch })
  }

  return (
    <ModalShell title="Edit KPI" onCancel={onCancel}>
      <div className="grid gap-4">
        <Field
          label="KPI Name"
          onChange={(value) => updateForm({ name: value })}
          value={form.name}
        />
        <TextAreaField
          label="Description"
          onChange={(value) => updateForm({ description: value })}
          value={form.description}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Service"
            onChange={(value) => updateForm({ service: value as KpiService })}
            options={kpiServices.map((service) => ({ label: service, value: service }))}
            value={form.service}
          />
          <SelectField
            label="Period Type"
            onChange={(value) => updateForm({ periodType: value as KpiPeriodType })}
            options={kpiPeriodTypes.map((periodType) => ({
              label: periodType,
              value: periodType,
            }))}
            value={form.periodType}
          />
        </div>
        <Field
          label="Period Label"
          onChange={(value) => updateForm({ periodLabel: value })}
          value={form.periodLabel}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Format"
            onChange={(value) => updateForm({ format: value as KpiFormat })}
            options={kpiFormats}
            value={form.format}
          />
          <SelectField
            label="Direction"
            onChange={(value) => updateForm({ direction: value as KpiDirection })}
            options={kpiDirections}
            value={form.direction}
          />
        </div>
        <SelectField
          label="Calculation Type"
          onChange={(value) =>
            updateForm({
              calculationType: value as KpiCalculationType,
              format: value === "manual" ? form.format : "currency",
            })
          }
          options={kpiCalculationTypes}
          value={form.calculationType}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <ToggleField
            checked={form.showOnOverview}
            label="Show on KPI Overview"
            onChange={() => updateForm({ showOnOverview: !form.showOnOverview })}
          />
          <ToggleField
            checked={form.pinned}
            label="Pin KPI"
            onChange={() => updateForm({ pinned: !form.pinned })}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <NumberField
            label="Display Order"
            onChange={(value) => updateForm({ displayOrder: value })}
            value={form.displayOrder}
          />
          <NumberField
            label={
              form.calculationType === "totalRevenue"
                ? "Subscription Revenue"
                : "Current Value"
            }
            onChange={(value) => updateForm({ currentValue: value })}
            step={form.format === "currency" ? 1000000 : 0.1}
            suffix={form.format === "percentage" ? "%" : undefined}
            value={form.currentValue}
          />
          <NumberField
            label="Target Value"
            onChange={(value) => updateForm({ targetValue: value })}
            step={form.format === "currency" ? 1000000 : 0.1}
            suffix={form.format === "percentage" ? "%" : undefined}
            value={form.targetValue}
          />
        </div>
        <TextAreaField
          label="Change Reason"
          onChange={(value) => updateForm({ reason: value })}
          value={form.reason}
        />
      </div>

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <AdminButton className="sm:w-28" onClick={onCancel}>
          Cancel
        </AdminButton>
        <AdminButton className="sm:w-32" onClick={onSave} variant="primary">
          <Save className="size-4" />
          Save KPI
        </AdminButton>
      </div>
    </ModalShell>
  )
}

const fieldClassName =
  "mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-950 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"

function BackLink() {
  return (
    <Link
      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-950 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:shadow-md"
      href="/dashboard/kpi/goals"
    >
      <ArrowLeft className="size-4" />
      Back
    </Link>
  )
}

function Field({
  label,
  onChange,
  type = "text",
  value,
}: {
  label: string
  onChange: (value: string) => void
  type?: string
  value: string
}) {
  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      <input
        className={fieldClassName}
        onChange={(event) => onChange(event.target.value)}
        type={type}
        value={value}
      />
    </label>
  )
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
      {children}
    </span>
  )
}

function FlagBadge({
  active,
  children,
  icon,
}: {
  active: boolean
  children: ReactNode
  icon: ReactNode
}) {
  return (
    <span
      className={cn(
        "inline-flex h-8 items-center gap-2 rounded-full px-3 text-xs font-bold",
        active ? "bg-violet-50 text-violet-700" : "bg-slate-100 text-slate-500"
      )}
    >
      {active ? icon : <EyeOff className="size-3.5" />}
      {children}
    </span>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-sm font-bold text-slate-950">{value}</p>
    </div>
  )
}

function MetricRow({
  label,
  title,
  value,
}: {
  label: string
  title?: string
  value: string
}) {
  return (
    <div
      className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
      title={title}
    >
      <dt className="text-sm font-bold text-slate-500">{label}</dt>
      <dd className="text-lg font-bold text-slate-950">{value}</dd>
    </div>
  )
}

function ModalShell({
  children,
  onCancel,
  title,
}: {
  children: ReactNode
  onCancel: () => void
  title: string
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-950">
              {title}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Saving a target change adds a KPI history record.
            </p>
          </div>
          <button
            className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
            onClick={onCancel}
            type="button"
          >
            x
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function NumberField({
  label,
  onChange,
  step = 1,
  suffix,
  value,
}: {
  label: string
  onChange: (value: number) => void
  step?: number
  suffix?: string
  value: number
}) {
  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      <div className="mt-2 flex h-11 overflow-hidden rounded-xl border border-slate-200 bg-white focus-within:border-violet-400 focus-within:ring-4 focus-within:ring-violet-500/10">
        <input
          className="min-w-0 flex-1 px-3 text-sm font-semibold text-slate-950 outline-none"
          min={0}
          onChange={(event) => onChange(Number(event.target.value))}
          step={step}
          type="number"
          value={value}
        />
        {suffix ? (
          <span className="flex items-center border-l border-slate-100 bg-slate-50 px-3 text-sm font-bold text-slate-500">
            {suffix}
          </span>
        ) : null}
      </div>
    </label>
  )
}

function SelectField({
  label,
  onChange,
  options,
  value,
}: {
  label: string
  onChange: (value: string) => void
  options: Array<{ label: string; value: string }>
  value: string
}) {
  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      <select
        className={fieldClassName}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function TextAreaField({
  label,
  onChange,
  value,
}: {
  label: string
  onChange: (value: string) => void
  value: string
}) {
  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      <textarea
        className="mt-2 min-h-28 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm font-medium text-slate-950 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      />
    </label>
  )
}

function ToggleField({
  checked,
  label,
  onChange,
}: {
  checked: boolean
  label: string
  onChange: () => void
}) {
  return (
    <button
      className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-left"
      onClick={onChange}
      type="button"
    >
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <span
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition",
          checked ? "bg-violet-600" : "bg-slate-300"
        )}
      >
        <span
          className={cn(
            "inline-block size-5 rounded-full bg-white shadow-sm transition",
            checked ? "translate-x-5" : "translate-x-0.5"
          )}
        />
      </span>
    </button>
  )
}

function TrendBadge({ kpi }: { kpi: KpiConfiguration }) {
  const healthy = isTrendHealthy(kpi)
  const Icon = kpi.trend.direction === "up" ? ArrowUpRight : ArrowDownRight

  return (
    <span
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-xs font-bold",
        healthy ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"
      )}
    >
      <Icon className="size-3.5" />
      {formatTrend(kpi.trend)}
    </span>
  )
}

function formatLabel(value: string) {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (letter) => letter.toUpperCase())
}

function getRevenueTitle(
  kpi: KpiConfiguration,
  contracts: EnterpriseContract[]
) {
  if (kpi.calculationType !== "totalRevenue") {
    return kpi.description
  }

  const enterpriseRevenue = getActiveEnterpriseRevenue(contracts)
  const totalRevenue = kpi.currentValue + enterpriseRevenue

  return `Subscription Revenue ${formatKpiValue(
    kpi.currentValue,
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

function toKpiEditForm(kpi: KpiConfiguration): KpiEditForm {
  return {
    calculationType: kpi.calculationType,
    currentValue: kpi.currentValue,
    description: kpi.description,
    direction: kpi.direction,
    displayOrder: kpi.displayOrder,
    format: kpi.format,
    name: kpi.name,
    periodLabel: kpi.periodLabel,
    periodType: kpi.periodType,
    pinned: kpi.pinned,
    reason: "Target adjustment after business review",
    service: kpi.service,
    showOnOverview: kpi.showOnOverview,
    targetValue: kpi.targetValue,
  }
}
