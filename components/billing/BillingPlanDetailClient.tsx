"use client"

import type { ReactNode } from "react"
import { useMemo, useState } from "react"
import {
  Check,
  Monitor,
  PauseCircle,
  PlayCircle,
  Save,
  Smartphone,
} from "lucide-react"

import AdminButton from "@/components/admin/AdminButton"
import PageHeader from "@/components/admin/PageHeader"
import StatusBadge from "@/components/admin/StatusBadge"
import DashboardLayout from "@/components/layout/DashboardLayout"
import {
  type BillingPlan,
  type BillingPlanFeature,
  type BillingPlanService,
  type BillingPlanStatus,
  type PlanChangeHistory,
  billingPlanFeatures,
  billingPlanStatuses,
  billingPlanTypes,
  createBlankBillingPlan,
  formatNumber,
  getPlanCreditsLabel,
  getPlanLimits,
  getStatusTone,
} from "@/lib/billing-plan-catalog"
import { formatKrw } from "@/lib/pricing-plans"
import { cn } from "@/lib/utils"

type BillingPlanDetailClientProps = {
  mode: "create" | "edit"
  plan?: BillingPlan
  service: BillingPlanService
}

type PreviewDevice = "Desktop" | "Mobile"
type PreviewLanguage = "Korean" | "English"

export default function BillingPlanDetailClient({
  mode,
  plan,
  service,
}: BillingPlanDetailClientProps) {
  const initialPlan = useMemo(
    () => plan ?? createBlankBillingPlan(service),
    [plan, service]
  )
  const [form, setForm] = useState<BillingPlan>(initialPlan)
  const [changeReason, setChangeReason] = useState(
    mode === "create" ? "Draft plan created" : "Policy update"
  )
  const [savedMessage, setSavedMessage] = useState("")
  const pendingChanges = useMemo(
    () =>
      mode === "edit"
        ? buildPendingHistoryRows(initialPlan, form, changeReason)
        : [],
    [changeReason, form, initialPlan, mode]
  )
  const historyRows =
    mode === "create"
      ? form.changeHistory
      : [...pendingChanges, ...form.changeHistory]
  const pageTitle = mode === "create" ? "Create New Plan" : form.name

  function updateField<K extends keyof BillingPlan>(
    field: K,
    value: BillingPlan[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }))
    setSavedMessage("")
  }

  function savePlan() {
    setSavedMessage(
      mode === "create"
        ? "Draft plan has been saved in the mock workspace."
        : "Plan changes have been saved in the mock workspace."
    )
  }

  return (
    <DashboardLayout>
      <PageHeader
        title={pageTitle}
        description="Manage product package information, pricing, benefit limits, feature access, and lifecycle status."
        breadcrumbs={[
          { label: "Billing" },
          { label: "Plans" },
          { label: service },
          { label: mode === "create" ? "Create Plan" : form.name },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone={getStatusTone(form.status)}>{form.status}</StatusBadge>
            <AdminButton onClick={savePlan}>
              <Save className="size-4" />
              Save
            </AdminButton>
            <AdminButton
              variant="primary"
              onClick={() => updateField("status", "Active")}
            >
              <PlayCircle className="size-4" />
              Activate
            </AdminButton>
            <AdminButton
              onClick={() => updateField("status", "Inactive")}
              disabled={form.status === "Inactive"}
            >
              <PauseCircle className="size-4" />
              Deactivate
            </AdminButton>
          </div>
        }
      />

      {savedMessage ? (
        <div className="mb-6 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          {savedMessage}
        </div>
      ) : null}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_448px]">
        <div className="space-y-6">
          <StepRail />
          <SectionPanel
            eyebrow="Basic Information"
            title="Product identity"
            description="Core plan fields shared by Create Plan and Edit Plan."
          >
            <div className="grid gap-5 md:grid-cols-2">
              <FieldLabel label="Service">
                <select
                  className={inputClass}
                  disabled
                  value={form.service}
                  onChange={(event) =>
                    updateField("service", event.target.value as BillingPlanService)
                  }
                >
                  <option>Yettey</option>
                  <option>Vpick</option>
                </select>
              </FieldLabel>
              <FieldLabel label="Plan Name">
                <input
                  className={inputClass}
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                />
              </FieldLabel>
              <FieldLabel className="md:col-span-2" label="Description">
                <textarea
                  className={cn(inputClass, "h-28 resize-none py-3 leading-6")}
                  value={form.description}
                  onChange={(event) =>
                    updateField("description", event.target.value)
                  }
                />
              </FieldLabel>
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              <OptionGroup label="Plan Type">
                {billingPlanTypes.map((type) => (
                  <RadioCard
                    key={type}
                    active={form.type === type}
                    description={
                      type === "Subscription"
                        ? "Recurring billing product."
                        : "One-time credit purchase product."
                    }
                    label={type}
                    onClick={() => updateField("type", type)}
                  />
                ))}
              </OptionGroup>
              <OptionGroup label="Status">
                {billingPlanStatuses.map((status) => (
                  <RadioCard
                    key={status}
                    active={form.status === status}
                    description={getStatusDescription(status)}
                    label={status}
                    onClick={() => updateField("status", status)}
                  />
                ))}
              </OptionGroup>
            </div>
          </SectionPanel>

          <SectionPanel
            eyebrow="Pricing"
            title="Commercial settings"
            description="Monthly, annual, trial, and renewal rules."
          >
            <div className="grid gap-5 md:grid-cols-2">
              <NumberField
                label="Monthly Price"
                prefix="KRW"
                value={form.monthlyPrice}
                onChange={(value) => updateField("monthlyPrice", value)}
              />
              <NumberField
                label="Annual Price"
                prefix="KRW"
                value={form.annualPrice}
                onChange={(value) => updateField("annualPrice", value)}
              />
              <NumberField
                label="Free Trial"
                suffix="days"
                value={form.freeTrialDays}
                onChange={(value) => updateField("freeTrialDays", value)}
              />
              <label className="flex min-h-20 items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
                <span>
                  <span className="block text-sm font-bold text-slate-950">
                    Auto Renewal
                  </span>
                  <span className="mt-1 block text-sm text-slate-500">
                    Renew paid subscriptions automatically.
                  </span>
                </span>
                <input
                  checked={form.autoRenewal}
                  className="size-5 accent-violet-600"
                  type="checkbox"
                  onChange={(event) =>
                    updateField("autoRenewal", event.target.checked)
                  }
                />
              </label>
            </div>
          </SectionPanel>

          <SectionPanel
            eyebrow="Benefits / Limits"
            title={`${service} allowances`}
            description="Operational product limits shown to customers and support teams."
          >
            {service === "Yettey" ? (
              <div className="grid gap-5 md:grid-cols-3">
                <NumberField
                  label="Credits"
                  value={form.credits}
                  onChange={(value) => updateField("credits", value)}
                />
                <NumberField
                  label="Projects"
                  value={form.projects}
                  onChange={(value) => updateField("projects", value)}
                />
                <NumberField
                  label="Users"
                  value={form.users}
                  onChange={(value) => updateField("users", value)}
                />
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                <NumberField
                  label="Upload Minutes"
                  suffix="min"
                  value={form.uploadMinutes}
                  onChange={(value) => updateField("uploadMinutes", value)}
                />
                <NumberField
                  label="Shortform Generation"
                  suffix="min"
                  value={form.shortformGeneration}
                  onChange={(value) => updateField("shortformGeneration", value)}
                />
                <NumberField
                  label="Storage"
                  suffix="GB"
                  value={form.storage}
                  onChange={(value) => updateField("storage", value)}
                />
                <NumberField
                  label="Download Traffic"
                  suffix="GB"
                  value={form.downloadTraffic}
                  onChange={(value) => updateField("downloadTraffic", value)}
                />
                <NumberField
                  label="Projects"
                  value={form.projects}
                  onChange={(value) => updateField("projects", value)}
                />
              </div>
            )}
          </SectionPanel>

          <SectionPanel
            eyebrow="Features"
            title="Entitlement rules"
            description="Feature access managed as product policy, not sales performance."
          >
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {billingPlanFeatures.map((feature) => (
                <FeatureCheckbox
                  key={feature}
                  checked={form.features.includes(feature)}
                  label={feature}
                  onChange={(checked) =>
                    updateField(
                      "features",
                      toggleFeature(form.features, feature, checked)
                    )
                  }
                />
              ))}
            </div>
          </SectionPanel>

          <SectionPanel
            eyebrow="Change History"
            title="Plan policy audit"
            description="Creation and modification history is kept in latest-first order."
          >
            <FieldLabel label="Change Reason">
              <input
                className={inputClass}
                value={changeReason}
                onChange={(event) => setChangeReason(event.target.value)}
              />
            </FieldLabel>
            <ChangeHistoryTable rows={historyRows} />
          </SectionPanel>
        </div>

        <PlanPreview plan={form} />
      </div>
    </DashboardLayout>
  )
}

function StepRail() {
  return (
    <div className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-500 shadow-sm sm:grid-cols-3">
      {["Basic Information", "Benefits & Limits", "Change History"].map(
        (step, index) => (
          <div
            key={step}
            className={cn(
              "flex items-center gap-3 border-slate-100 px-5 py-4 sm:border-r",
              index === 0 && "text-violet-600",
              index === 2 && "sm:border-r-0"
            )}
          >
            <span
              className={cn(
                "inline-flex size-7 items-center justify-center rounded-full border text-xs",
                index === 0
                  ? "border-violet-600 bg-violet-600 text-white"
                  : "border-slate-300 text-slate-500"
              )}
            >
              {index + 1}
            </span>
            {step}
          </div>
        )
      )}
    </div>
  )
}

function SectionPanel({
  children,
  description,
  eyebrow,
  title,
}: {
  children: ReactNode
  description: string
  eyebrow: string
  title: string
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
      <p className="text-xs font-bold uppercase tracking-wide text-violet-600">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-lg font-bold text-slate-950">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
      <div className="mt-6">{children}</div>
    </section>
  )
}

function FieldLabel({
  children,
  className,
  label,
}: {
  children: ReactNode
  className?: string
  label: string
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-2 block text-sm font-bold text-slate-950">{label}</span>
      {children}
    </label>
  )
}

function OptionGroup({
  children,
  label,
}: {
  children: ReactNode
  label: string
}) {
  return (
    <div>
      <p className="mb-3 text-sm font-bold text-slate-950">{label}</p>
      <div className="grid gap-3">{children}</div>
    </div>
  )
}

function RadioCard({
  active,
  description,
  label,
  onClick,
}: {
  active: boolean
  description: string
  label: string
  onClick: () => void
}) {
  return (
    <button
      className={cn(
        "flex min-h-20 items-start gap-3 rounded-xl border p-4 text-left transition",
        active
          ? "border-violet-500 bg-violet-50 text-violet-700 ring-2 ring-violet-500/10"
          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
      )}
      onClick={onClick}
      type="button"
    >
      <span
        className={cn(
          "mt-0.5 inline-flex size-5 items-center justify-center rounded-full border",
          active ? "border-violet-600 bg-violet-600" : "border-slate-300"
        )}
      >
        {active ? <span className="size-2 rounded-full bg-white" /> : null}
      </span>
      <span>
        <span className="block text-sm font-bold">{label}</span>
        <span className="mt-1 block text-sm leading-5 text-slate-500">
          {description}
        </span>
      </span>
    </button>
  )
}

function NumberField({
  label,
  onChange,
  prefix,
  suffix,
  value,
}: {
  label: string
  onChange: (value: number) => void
  prefix?: string
  suffix?: string
  value: number
}) {
  return (
    <FieldLabel label={label}>
      <div className="flex overflow-hidden rounded-xl border border-slate-200 bg-white focus-within:border-violet-400 focus-within:ring-4 focus-within:ring-violet-500/10">
        {prefix ? (
          <span className="flex h-12 items-center border-r border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-500">
            {prefix}
          </span>
        ) : null}
        <input
          className="h-12 min-w-0 flex-1 px-4 text-sm font-semibold text-slate-950 outline-none"
          inputMode="numeric"
          value={value}
          onChange={(event) => onChange(Number(event.target.value) || 0)}
        />
        {suffix ? (
          <span className="flex h-12 items-center border-l border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-500">
            {suffix}
          </span>
        ) : null}
      </div>
    </FieldLabel>
  )
}

function FeatureCheckbox({
  checked,
  label,
  onChange,
}: {
  checked: boolean
  label: BillingPlanFeature
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 transition hover:border-slate-300 hover:bg-slate-50">
      <input
        checked={checked}
        className="size-5 accent-violet-600"
        type="checkbox"
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="text-sm font-bold text-slate-800">{label}</span>
    </label>
  )
}

function PlanPreview({ plan }: { plan: BillingPlan }) {
  const [device, setDevice] = useState<PreviewDevice>("Desktop")
  const [language, setLanguage] = useState<PreviewLanguage>("Korean")
  const benefits = getPlanLimits(plan)
  const primaryBenefit =
    plan.service === "Yettey"
      ? getPlanCreditsLabel(plan)
      : `${formatNumber(plan.uploadMinutes)} minutes upload and analysis`

  return (
    <aside className="xl:sticky xl:top-24 xl:self-start">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-950">Live Preview</h2>
            <p className="mt-1 text-sm text-slate-500">
              Customer-facing plan card updates in real time.
            </p>
          </div>
          <StatusBadge tone={getStatusTone(plan.status)}>{plan.status}</StatusBadge>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {(["Desktop", "Mobile"] as PreviewDevice[]).map((item) => (
            <button
              key={item}
              className={previewToggleClass(device === item)}
              onClick={() => setDevice(item)}
              type="button"
            >
              {item === "Desktop" ? (
                <Monitor className="size-4" />
              ) : (
                <Smartphone className="size-4" />
              )}
              {item}
            </button>
          ))}
        </div>

        <div className="mt-6 flex gap-6 border-b border-slate-100 text-sm font-bold">
          {(["Korean", "English"] as PreviewLanguage[]).map((item) => (
            <button
              key={item}
              className={cn(
                "border-b-2 px-1 pb-3 transition",
                language === item
                  ? "border-violet-600 text-violet-600"
                  : "border-transparent text-slate-400 hover:text-slate-700"
              )}
              onClick={() => setLanguage(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>

        <div
          className={cn(
            "mx-auto mt-6 rounded-[28px] bg-slate-950 p-8 text-white shadow-2xl shadow-slate-900/20",
            device === "Mobile" ? "max-w-72" : "max-w-sm"
          )}
        >
          <p className="text-center text-sm font-semibold text-slate-300">
            {language === "Korean" ? "새로운 플랜" : plan.service}
          </p>
          <h3 className="mt-4 text-center text-2xl font-bold">{plan.name}</h3>
          <div className="mt-5 flex items-end justify-center gap-2">
            <span className="text-4xl font-black">
              {formatKrw(plan.monthlyPrice)}
            </span>
            <span className="pb-1 text-sm font-semibold text-slate-400">/ mo</span>
          </div>
          <p className="mx-auto mt-5 max-w-64 text-center text-sm leading-6 text-slate-400">
            {plan.description}
          </p>
          <div className="mt-8 space-y-4">
            {[primaryBenefit, ...benefits].slice(0, 6).map((benefit) => (
              <div key={benefit} className="flex items-center gap-3 text-sm font-semibold">
                <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-violet-500">
                  <Check className="size-3" />
                </span>
                {benefit}
              </div>
            ))}
          </div>
          <button
            className="mt-8 h-14 w-full rounded-2xl bg-violet-600 text-base font-bold text-white transition hover:bg-violet-500"
            type="button"
          >
            Start Now
          </button>
        </div>

        <p className="mt-6 text-center text-xs font-medium text-slate-400">
          Preview may differ from the actual result.
        </p>
      </div>
    </aside>
  )
}

function ChangeHistoryTable({ rows }: { rows: PlanChangeHistory[] }) {
  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-slate-200">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-separate border-spacing-0">
          <thead>
            <tr className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
              <th className="border-b border-slate-200 px-4 py-3">Changed At</th>
              <th className="border-b border-slate-200 px-4 py-3">Changed By</th>
              <th className="border-b border-slate-200 px-4 py-3">Field</th>
              <th className="border-b border-slate-200 px-4 py-3">Before</th>
              <th className="border-b border-slate-200 px-4 py-3">After</th>
              <th className="border-b border-slate-200 px-4 py-3">Reason</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={`${row.changedAt}-${row.field}-${index}`}>
                <td className="border-b border-slate-100 px-4 py-4 text-sm font-semibold text-slate-950">
                  {row.changedAt}
                </td>
                <td className="border-b border-slate-100 px-4 py-4 text-sm text-slate-600">
                  {row.changedBy}
                </td>
                <td className="border-b border-slate-100 px-4 py-4 text-sm font-semibold text-slate-950">
                  {row.field}
                </td>
                <td className="border-b border-slate-100 px-4 py-4 text-sm text-slate-500">
                  {row.before}
                </td>
                <td className="border-b border-slate-100 px-4 py-4 text-sm text-slate-900">
                  {row.after}
                </td>
                <td className="border-b border-slate-100 px-4 py-4 text-sm text-slate-500">
                  {row.reason}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function buildPendingHistoryRows(
  before: BillingPlan,
  after: BillingPlan,
  reason: string
): PlanChangeHistory[] {
  const rows: PlanChangeHistory[] = []
  const changes: Array<[string, string, string]> = [
    ["Plan Name", before.name, after.name],
    ["Description", before.description, after.description],
    ["Plan Type", before.type, after.type],
    ["Status", before.status, after.status],
    ["Monthly Price", formatKrw(before.monthlyPrice), formatKrw(after.monthlyPrice)],
    ["Annual Price", formatKrw(before.annualPrice), formatKrw(after.annualPrice)],
    ["Free Trial", `${before.freeTrialDays} days`, `${after.freeTrialDays} days`],
    ["Auto Renewal", yesNo(before.autoRenewal), yesNo(after.autoRenewal)],
    ["Credits", formatNumber(before.credits), formatNumber(after.credits)],
    ["Projects", formatNumber(before.projects), formatNumber(after.projects)],
    ["Users", formatNumber(before.users), formatNumber(after.users)],
    [
      "Upload Minutes",
      `${formatNumber(before.uploadMinutes)} min`,
      `${formatNumber(after.uploadMinutes)} min`,
    ],
    [
      "Shortform Generation",
      `${formatNumber(before.shortformGeneration)} min`,
      `${formatNumber(after.shortformGeneration)} min`,
    ],
    ["Storage", `${formatNumber(before.storage)}GB`, `${formatNumber(after.storage)}GB`],
    [
      "Download Traffic",
      `${formatNumber(before.downloadTraffic)}GB`,
      `${formatNumber(after.downloadTraffic)}GB`,
    ],
    [
      "Features",
      before.features.join(", ") || "-",
      after.features.join(", ") || "-",
    ],
  ]

  changes.forEach(([field, beforeValue, afterValue]) => {
    if (beforeValue !== afterValue) {
      rows.push({
        after: afterValue,
        before: beforeValue,
        changedAt: "Unsaved",
        changedBy: "Sarah Mitchell",
        field,
        reason: reason || "Policy update",
      })
    }
  })

  return rows
}

function toggleFeature(
  features: BillingPlanFeature[],
  feature: BillingPlanFeature,
  checked: boolean
) {
  if (checked) {
    return features.includes(feature) ? features : [...features, feature]
  }

  return features.filter((item) => item !== feature)
}

function previewToggleClass(active: boolean) {
  return cn(
    "inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-bold transition",
    active
      ? "bg-violet-50 text-violet-600 ring-1 ring-violet-100"
      : "bg-slate-50 text-slate-400 hover:text-slate-700"
  )
}

function getStatusDescription(status: BillingPlanStatus) {
  if (status === "Active") {
    return "Visible and available for sale."
  }

  if (status === "Inactive") {
    return "Hidden from new purchases."
  }

  return "Editable internal draft."
}

function yesNo(value: boolean) {
  return value ? "Enabled" : "Disabled"
}

const inputClass =
  "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-950 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 disabled:bg-slate-50 disabled:text-slate-500"
