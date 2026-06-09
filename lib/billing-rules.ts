export type UpgradePolicy = "Immediate Upgrade" | "Next Billing Cycle"
export type DowngradePolicy = "Immediate Downgrade" | "Next Billing Cycle"
export type RefundPolicy = "Tiered Usage-Based Refund"
export type CreditExpiration =
  | "Never Expire"
  | "30 Days"
  | "90 Days"
  | "180 Days"
  | "365 Days"
export type BonusCreditExpiration = "7 Days" | "30 Days" | "60 Days" | "90 Days"
export type BillingCycle = "Monthly" | "Yearly"
export type TrialPeriod = "0 Days" | "7 Days" | "14 Days" | "30 Days"

export type BillingRules = {
  bonusCreditExpiration: BonusCreditExpiration
  creditExpiration: CreditExpiration
  downgradePolicy: DowngradePolicy
  failedPaymentGracePeriod: 0 | 3 | 7 | 14
  manualRefundApproval: boolean
  purchasedCreditCarryOver: boolean
  refundPolicy: RefundPolicy
  renewalUsageReset: boolean
  samePlanRepurchaseBlocked: boolean
  supportedBillingCycles: BillingCycle[]
  trialPeriod: TrialPeriod
  upgradePolicy: UpgradePolicy
  yearlyDiscount: number
}

export const defaultBillingRules: BillingRules = {
  bonusCreditExpiration: "30 Days",
  creditExpiration: "Never Expire",
  downgradePolicy: "Next Billing Cycle",
  failedPaymentGracePeriod: 7,
  manualRefundApproval: true,
  purchasedCreditCarryOver: true,
  refundPolicy: "Tiered Usage-Based Refund",
  renewalUsageReset: true,
  samePlanRepurchaseBlocked: true,
  supportedBillingCycles: ["Monthly", "Yearly"],
  trialPeriod: "14 Days",
  upgradePolicy: "Immediate Upgrade",
  yearlyDiscount: 20,
}

export const upgradePolicies: UpgradePolicy[] = [
  "Immediate Upgrade",
  "Next Billing Cycle",
]
export const downgradePolicies: DowngradePolicy[] = [
  "Immediate Downgrade",
  "Next Billing Cycle",
]
export const gracePeriods: BillingRules["failedPaymentGracePeriod"][] = [
  0,
  3,
  7,
  14,
]
export const creditExpirationOptions: CreditExpiration[] = [
  "Never Expire",
  "30 Days",
  "90 Days",
  "180 Days",
  "365 Days",
]
export const bonusCreditExpirationOptions: BonusCreditExpiration[] = [
  "7 Days",
  "30 Days",
  "60 Days",
  "90 Days",
]
export const trialPeriodOptions: TrialPeriod[] = [
  "0 Days",
  "7 Days",
  "14 Days",
  "30 Days",
]
export const billingCycleOptions: BillingCycle[] = ["Monthly", "Yearly"]

export function normalizeBillingRules(rules: Partial<BillingRules>): BillingRules {
  return {
    ...defaultBillingRules,
    ...rules,
    supportedBillingCycles:
      rules.supportedBillingCycles?.filter(isBillingCycle).length
        ? rules.supportedBillingCycles.filter(isBillingCycle)
        : defaultBillingRules.supportedBillingCycles,
    yearlyDiscount: clamp(
      Number(rules.yearlyDiscount ?? defaultBillingRules.yearlyDiscount),
      0,
      100
    ),
  }
}

export function summarizeChangedBillingRules(
  before: BillingRules,
  after: BillingRules
) {
  const changedFields = Object.keys(after).filter(
    (key) =>
      JSON.stringify(before[key as keyof BillingRules]) !==
      JSON.stringify(after[key as keyof BillingRules])
  )

  if (!changedFields.length) {
    return "Billing rules saved without field changes."
  }

  return `Updated ${changedFields.length} billing rule setting${
    changedFields.length > 1 ? "s" : ""
  }: ${changedFields.map(toTitleCase).join(", ")}.`
}

export function formatBillingRulesTimestamp(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")

  return `${year}-${month}-${day} ${hours}:${minutes}`
}

function isBillingCycle(value: string): value is BillingCycle {
  return billingCycleOptions.includes(value as BillingCycle)
}

function toTitleCase(value: string) {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase())
}

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) {
    return min
  }

  return Math.min(max, Math.max(min, value))
}
