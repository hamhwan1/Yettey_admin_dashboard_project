"use client"

import type { ReactNode } from "react"
import { useEffect, useMemo, useState } from "react"
import { RotateCcw, Save } from "lucide-react"

import AdminButton from "@/components/admin/AdminButton"
import PageHeader from "@/components/admin/PageHeader"
import DashboardLayout from "@/components/layout/DashboardLayout"
import {
  appendBillingAuditLog,
  billingAuditLogOperator,
} from "@/lib/billing-audit-logs"
import {
  type BillingCycle,
  type BillingRules,
  type BonusCreditExpiration,
  type CreditExpiration,
  type DowngradePolicy,
  type RefundPolicy,
  type TrialPeriod,
  type UpgradePolicy,
  billingCycleOptions,
  bonusCreditExpirationOptions,
  creditExpirationOptions,
  defaultBillingRules,
  downgradePolicies,
  formatBillingRulesTimestamp,
  gracePeriods,
  normalizeBillingRules,
  summarizeChangedBillingRules,
  trialPeriodOptions,
  upgradePolicies,
} from "@/lib/billing-rules"
import { cn } from "@/lib/utils"

const STORAGE_KEY = "yettey.billing-rules.v1"

export default function BillingRulesClient() {
  const [rules, setRules] = useState(defaultBillingRules)
  const [savedRules, setSavedRules] = useState(defaultBillingRules)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    queueMicrotask(() => {
      const storedRules = readStoredRules()

      if (storedRules) {
        setRules(storedRules)
        setSavedRules(storedRules)
      }

      try {
        void fetch("/api/billing/rules", { cache: "no-store" })
          .then((response) => (response.ok ? response.json() : undefined))
          .then((payload: { rules?: Partial<BillingRules> } | undefined) => {
            if (!payload?.rules || storedRules) {
              return
            }

            const normalized = normalizeBillingRules(payload.rules)
            persistStoredRules(normalized)
            setRules(normalized)
            setSavedRules(normalized)
          })
          .catch(() => undefined)
      } catch {
        if (!storedRules) {
          setRules(defaultBillingRules)
          setSavedRules(defaultBillingRules)
        }
      }
    })
  }, [])

  const hasChanges = useMemo(
    () => JSON.stringify(rules) !== JSON.stringify(savedRules),
    [rules, savedRules]
  )

  function updateRule<K extends keyof BillingRules>(
    field: K,
    value: BillingRules[K]
  ) {
    setRules((current) => ({ ...current, [field]: value }))
    setMessage("")
    setErrorMessage("")
  }

  async function saveRules() {
    const normalized = normalizeBillingRules(rules)
    const savedAt = formatBillingRulesTimestamp(new Date())

    setSaving(true)
    setMessage("")
    setErrorMessage("")

    try {
      const response = await fetch("/api/billing/rules", {
        body: JSON.stringify({ rules: normalized }),
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
        method: "PUT",
      })

      if (!response.ok) {
        throw new Error("Billing rules save failed.")
      }

      const payload = (await response.json()) as {
        rules?: Partial<BillingRules>
      }
      const persistedRules = normalizeBillingRules(payload.rules ?? normalized)

      persistStoredRules(persistedRules)
      appendBillingAuditLog({
        action: "Admin updated Billing Rules",
        actor: billingAuditLogOperator,
        createdAt: savedAt,
        details: summarizeChangedBillingRules(savedRules, persistedRules),
        scope: "Billing Rules",
      })
      setRules(persistedRules)
      setSavedRules(persistedRules)
      setMessage("Billing rules have been saved.")
      window.alert("Billing rules have been saved.")
    } catch {
      setErrorMessage("Billing rules could not be saved. Please try again.")
      window.alert("Billing rules could not be saved. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  function resetRules() {
    setRules(savedRules)
    setMessage("")
    setErrorMessage("")
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Billing Rules"
        description="Configure subscription, refund, credit, and billing cycle policies used across sellable plans."
        breadcrumbs={[{ label: "Billing" }, { label: "Billing Rules" }]}
        actions={
          <div className="flex flex-wrap gap-2">
            <AdminButton disabled={!hasChanges} onClick={resetRules}>
              <RotateCcw className="size-4" />
              Reset Changes
            </AdminButton>
            <AdminButton
              variant="primary"
              disabled={!hasChanges || saving}
              onClick={saveRules}
            >
              <Save className="size-4" />
              {saving ? "Saving..." : "Save Billing Rules"}
            </AdminButton>
          </div>
        }
      />

      {message ? (
        <div className="mb-6 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          {message}
        </div>
      ) : null}
      {errorMessage ? (
        <div className="mb-6 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {errorMessage}
        </div>
      ) : null}

      <div className="grid gap-6">
        <RuleCard
          title="Subscription Rules"
          description="Control subscription purchase, plan change, renewal, and payment failure behavior."
        >
          <ToggleRule
            checked={rules.samePlanRepurchaseBlocked}
            description="Currently active same plan cannot be repurchased."
            label="Same Plan Repurchase"
            offLabel="Disabled"
            onChange={(value) =>
              updateRule("samePlanRepurchaseBlocked", value)
            }
            onLabel="Enabled"
          />
          <SelectRule
            description="How an upper plan upgrade is applied."
            label="Upgrade Policy"
            options={upgradePolicies}
            value={rules.upgradePolicy}
            onChange={(value) => updateRule("upgradePolicy", value as UpgradePolicy)}
          />
          <SelectRule
            description="How a lower plan change is applied."
            label="Downgrade Policy"
            options={downgradePolicies}
            value={rules.downgradePolicy}
            onChange={(value) =>
              updateRule("downgradePolicy", value as DowngradePolicy)
            }
          />
          <ToggleRule
            checked={rules.renewalUsageReset}
            description="Reset usage counters when billing renews."
            label="Renewal Usage Reset"
            offLabel="Disabled"
            onChange={(value) => updateRule("renewalUsageReset", value)}
            onLabel="Enabled"
          />
          <SelectRule
            description="Grace period after failed payment."
            label="Failed Payment Grace Period"
            options={gracePeriods.map((period) => `${period} Days`)}
            value={`${rules.failedPaymentGracePeriod} Days`}
            onChange={(value) =>
              updateRule(
                "failedPaymentGracePeriod",
                Number(value.replace(" Days", "")) as BillingRules["failedPaymentGracePeriod"]
              )
            }
          />
        </RuleCard>

        <RuleCard
          title="Refund Rules"
          description="Define refund handling by usage amount and administrative approval."
        >
          <SelectRule
            description="Usage-based refund policy applied to paid subscriptions."
            label="Refund Policy"
            options={[rules.refundPolicy]}
            value={rules.refundPolicy}
            onChange={(value) => updateRule("refundPolicy", value as RefundPolicy)}
          />
          <div className="rounded-xl border border-slate-200">
            {[
              ["Option A", "0% usage", "100% refund"],
              ["Option B", "1-50% usage", "Partial refund"],
              ["Option C", "50%+ usage", "Non-refundable"],
            ].map(([option, usage, result]) => (
              <div
                key={option}
                className="grid gap-2 border-b border-slate-100 px-4 py-3 last:border-b-0 md:grid-cols-[120px_1fr_1fr]"
              >
                <span className="text-sm font-bold text-slate-950">{option}</span>
                <span className="text-sm text-slate-500">{usage}</span>
                <span className="text-sm font-semibold text-slate-700">
                  {result}
                </span>
              </div>
            ))}
          </div>
          <ToggleRule
            checked={rules.manualRefundApproval}
            description="Require administrator approval before refunds are processed."
            label="Manual Approval Required"
            offLabel="Disabled"
            onChange={(value) => updateRule("manualRefundApproval", value)}
            onLabel="Enabled"
          />
        </RuleCard>

        <RuleCard
          title="Credit Rules"
          description="Manage purchased credit expiration, carry-over, and promotional credit validity."
        >
          <SelectRule
            description="Expiration policy for purchased credits."
            label="Credit Expiration"
            options={creditExpirationOptions}
            value={rules.creditExpiration}
            onChange={(value) =>
              updateRule("creditExpiration", value as CreditExpiration)
            }
          />
          <ToggleRule
            checked={rules.purchasedCreditCarryOver}
            description="Unused purchased credits can be carried over."
            label="Purchased Credit Carry Over"
            offLabel="Disabled"
            onChange={(value) => updateRule("purchasedCreditCarryOver", value)}
            onLabel="Enabled"
          />
          <SelectRule
            description="Expiration period for promotional bonus credits."
            label="Bonus Credit Expiration"
            options={bonusCreditExpirationOptions}
            value={rules.bonusCreditExpiration}
            onChange={(value) =>
              updateRule("bonusCreditExpiration", value as BonusCreditExpiration)
            }
          />
        </RuleCard>

        <RuleCard
          title="Billing Cycle Rules"
          description="Set supported billing cycles, yearly discount, and default trial period."
        >
          <CheckboxRule
            description="Billing cycles available when creating or selling plans."
            label="Supported Billing Cycles"
            options={billingCycleOptions}
            value={rules.supportedBillingCycles}
            onChange={(value) => updateRule("supportedBillingCycles", value)}
          />
          <NumberRule
            description="Discount applied to yearly billing. Enter 0-100%."
            label="Yearly Discount"
            max={100}
            min={0}
            suffix="%"
            value={rules.yearlyDiscount}
            onChange={(value) => updateRule("yearlyDiscount", value)}
          />
          <SelectRule
            description="Default free trial duration."
            label="Trial Period"
            options={trialPeriodOptions}
            value={rules.trialPeriod}
            onChange={(value) => updateRule("trialPeriod", value as TrialPeriod)}
          />
        </RuleCard>
      </div>
    </DashboardLayout>
  )
}

function RuleCard({
  children,
  description,
  title,
}: {
  children: ReactNode
  description: string
  title: string
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-950">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
      </div>
      <div className="grid gap-4">{children}</div>
    </section>
  )
}

function ToggleRule({
  checked,
  description,
  label,
  offLabel,
  onChange,
  onLabel,
}: {
  checked: boolean
  description: string
  label: string
  offLabel: string
  onChange: (value: boolean) => void
  onLabel: string
}) {
  return (
    <RuleRow description={description} label={label}>
      <div className="inline-flex overflow-hidden rounded-xl border border-slate-200 bg-white">
        {[true, false].map((value) => (
          <button
            key={String(value)}
            className={segmentedButtonClass(checked === value)}
            onClick={() => onChange(value)}
            type="button"
          >
            {value ? onLabel : offLabel}
          </button>
        ))}
      </div>
    </RuleRow>
  )
}

function SelectRule({
  description,
  label,
  onChange,
  options,
  value,
}: {
  description: string
  label: string
  onChange: (value: string) => void
  options: string[]
  value: string
}) {
  return (
    <RuleRow description={description} label={label}>
      <select
        className={inputClass}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </RuleRow>
  )
}

function CheckboxRule({
  description,
  label,
  onChange,
  options,
  value,
}: {
  description: string
  label: string
  onChange: (value: BillingCycle[]) => void
  options: BillingCycle[]
  value: BillingCycle[]
}) {
  return (
    <RuleRow description={description} label={label}>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const checked = value.includes(option)

          return (
            <label
              key={option}
              className={cn(
                "inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl border px-4 text-sm font-bold transition",
                checked
                  ? "border-violet-200 bg-violet-50 text-violet-700"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              )}
            >
              <input
                checked={checked}
                className="size-4 accent-violet-600"
                type="checkbox"
                onChange={(event) => {
                  const next = event.target.checked
                    ? [...value, option]
                    : value.filter((item) => item !== option)

                  onChange(next.length ? next : value)
                }}
              />
              {option}
            </label>
          )
        })}
      </div>
    </RuleRow>
  )
}

function NumberRule({
  description,
  label,
  max,
  min,
  onChange,
  suffix,
  value,
}: {
  description: string
  label: string
  max: number
  min: number
  onChange: (value: number) => void
  suffix: string
  value: number
}) {
  return (
    <RuleRow description={description} label={label}>
      <div className="flex max-w-xs overflow-hidden rounded-xl border border-slate-200 bg-white focus-within:border-violet-400 focus-within:ring-4 focus-within:ring-violet-500/10">
        <input
          className="h-12 min-w-0 flex-1 px-4 text-sm font-semibold text-slate-950 outline-none"
          max={max}
          min={min}
          type="number"
          value={value}
          onChange={(event) =>
            onChange(clamp(Number(event.target.value), min, max))
          }
        />
        <span className="flex h-12 items-center border-l border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-500">
          {suffix}
        </span>
      </div>
    </RuleRow>
  )
}

function RuleRow({
  children,
  description,
  label,
}: {
  children: ReactNode
  description: string
  label: string
}) {
  return (
    <div className="grid gap-4 rounded-xl border border-slate-100 px-4 py-4 lg:grid-cols-[minmax(240px,1fr)_minmax(260px,420px)] lg:items-center">
      <div>
        <p className="text-sm font-bold text-slate-950">{label}</p>
        <p className="mt-1 text-sm leading-5 text-slate-500">{description}</p>
      </div>
      <div>{children}</div>
    </div>
  )
}

function segmentedButtonClass(active: boolean) {
  return cn(
    "h-11 px-4 text-sm font-bold transition",
    active
      ? "bg-violet-600 text-white"
      : "bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-950"
  )
}

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) {
    return min
  }

  return Math.min(max, Math.max(min, value))
}

const inputClass =
  "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-950 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"

function readStoredRules() {
  const stored = window.localStorage.getItem(STORAGE_KEY)

  if (!stored) {
    return undefined
  }

  try {
    const parsed = JSON.parse(stored) as { rules?: Partial<BillingRules> }

    if (parsed.rules) {
      return normalizeBillingRules(parsed.rules)
    }
  } catch {
    return undefined
  }

  return undefined
}

function persistStoredRules(rules: BillingRules) {
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ rules, version: 1 })
  )
}
