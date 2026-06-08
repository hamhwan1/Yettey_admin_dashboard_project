import { formatKrw } from "@/lib/pricing-plans"

export type BillingPlanService = "Yettey" | "Vpick"
export type BillingPlanStatus = "Draft" | "Active" | "Inactive"
export type BillingPlanType = "Subscription" | "Credit Pack"
export type BillingPlanEffectiveMode = "Immediately" | "Scheduled"
export type BillingPlanLanguage = "ko" | "en"

export type BillingPlanFeature =
  | "AI Image Generation"
  | "AI Video Generation"
  | "Video Analysis"
  | "Max Video Length"
  | "Download Limit"
  | "Upload Limit"
  | "Traffic (Bandwidth)"
  | "AI Assistant"
  | "Content Transformation"
  | "Video Editing Tools"
  | "Shortform Automation"

export type PlanChangeHistory = {
  after: string
  before: string
  changedAt: string
  changedBy: string
  field: string
  reason: string
}

export type BillingPlanLanguageData = Record<
  BillingPlanLanguage,
  {
    description: string
    name: string
  }
>

export type BillingPlan = {
  accessAfterCancellation: string
  annualPrice: number
  allowCancellation: boolean
  applyMode: BillingPlanEffectiveMode
  autoRenewal: boolean
  changeHistory: PlanChangeHistory[]
  createdAt: string
  creditExpirationDays: number
  credits: number
  description: string
  displayOrder: number
  downloadTraffic: number
  effectiveDate: string
  eligibleUsers: string
  expireRemainingCreditsAfterPartialUse: boolean
  features: BillingPlanFeature[]
  freeTrialDays: number
  id: string
  languageData: BillingPlanLanguageData
  monthlyPrice: number
  name: string
  projects: number
  recommended: boolean
  refundPolicy: string
  salesEndAt: string
  salesStartAt: string
  service: BillingPlanService
  showInComparison: boolean
  shortformGeneration: number
  slug: string
  status: BillingPlanStatus
  stoppedAt: string
  storage: number
  type: BillingPlanType
  uploadMinutes: number
  users: number
  updatedAt: string
}

export const billingPlanFeatures: BillingPlanFeature[] = [
  "AI Image Generation",
  "AI Video Generation",
  "Video Analysis",
  "Max Video Length",
  "Download Limit",
  "Upload Limit",
  "Traffic (Bandwidth)",
  "AI Assistant",
  "Content Transformation",
  "Video Editing Tools",
  "Shortform Automation",
]

export const billingPlanStatuses: BillingPlanStatus[] = [
  "Draft",
  "Active",
  "Inactive",
]

export const billingPlanTypes: BillingPlanType[] = ["Subscription", "Credit Pack"]

export const billingPlans: BillingPlan[] = [
  {
    accessAfterCancellation: "Until End of Period",
    annualPrice: 490000,
    allowCancellation: true,
    applyMode: "Immediately",
    autoRenewal: true,
    changeHistory: [
      {
        after: "Active",
        before: "Draft",
        changedAt: "2026-06-08 10:22",
        changedBy: "Ham Hwan",
        field: "Status",
        reason: "Launch-ready plan configuration approved",
      },
      {
        after: "Created",
        before: "-",
        changedAt: "2026-05-27 15:40",
        changedBy: "Sarah Mitchell",
        field: "Plan",
        reason: "Initial self-serve plan setup",
      },
    ],
    createdAt: "2026-05-27",
    creditExpirationDays: 90,
    credits: 1800,
    description: "Entry subscription plan for small creator teams.",
    displayOrder: 1,
    downloadTraffic: 0,
    effectiveDate: "2026-06-08 10:22",
    eligibleUsers: "All users",
    expireRemainingCreditsAfterPartialUse: true,
    features: [
      "AI Image Generation",
      "AI Video Generation",
      "Video Analysis",
      "Download Limit",
      "Upload Limit",
    ],
    freeTrialDays: 7,
    id: "plan_yettey_starter",
    languageData: createLanguageData(
      "Starter",
      "Entry subscription plan for small creator teams."
    ),
    monthlyPrice: 49000,
    name: "Starter",
    projects: 4,
    recommended: false,
    refundPolicy: "Non-refundable",
    salesEndAt: "2999-01-01",
    salesStartAt: "2026-05-27",
    service: "Yettey",
    showInComparison: true,
    shortformGeneration: 0,
    slug: "starter",
    status: "Active",
    stoppedAt: "-",
    storage: 0,
    type: "Subscription",
    uploadMinutes: 0,
    users: 2,
    updatedAt: "2026-06-08 10:22",
  },
  {
    accessAfterCancellation: "Until End of Period",
    annualPrice: 990000,
    allowCancellation: true,
    applyMode: "Immediately",
    autoRenewal: true,
    changeHistory: [
      {
        after: formatKrw(99000),
        before: formatKrw(89000),
        changedAt: "2026-06-08 10:22",
        changedBy: "Ham Hwan",
        field: "Monthly Price",
        reason: "Pricing policy update",
      },
      {
        after: "Created",
        before: "-",
        changedAt: "2026-05-27 15:48",
        changedBy: "Sarah Mitchell",
        field: "Plan",
        reason: "Initial growth plan setup",
      },
    ],
    createdAt: "2026-05-27",
    creditExpirationDays: 90,
    credits: 4000,
    description: "Growth plan for teams scaling content operations.",
    displayOrder: 2,
    downloadTraffic: 0,
    effectiveDate: "2026-06-08 10:22",
    eligibleUsers: "All users",
    expireRemainingCreditsAfterPartialUse: true,
    features: [
      "AI Image Generation",
      "AI Video Generation",
      "Video Analysis",
      "Max Video Length",
      "Download Limit",
      "Upload Limit",
      "Traffic (Bandwidth)",
      "AI Assistant",
    ],
    freeTrialDays: 14,
    id: "plan_yettey_growth",
    languageData: createLanguageData(
      "Growth",
      "Growth plan for teams scaling content operations."
    ),
    monthlyPrice: 99000,
    name: "Growth",
    projects: 10,
    recommended: true,
    refundPolicy: "Non-refundable",
    salesEndAt: "2999-01-01",
    salesStartAt: "2026-05-27",
    service: "Yettey",
    showInComparison: true,
    shortformGeneration: 0,
    slug: "growth",
    status: "Active",
    stoppedAt: "-",
    storage: 0,
    type: "Subscription",
    uploadMinutes: 0,
    users: 3,
    updatedAt: "2026-06-08 10:22",
  },
  {
    accessAfterCancellation: "Until End of Period",
    annualPrice: 2490000,
    allowCancellation: true,
    applyMode: "Immediately",
    autoRenewal: true,
    changeHistory: [
      {
        after: "10 users",
        before: "8 users",
        changedAt: "2026-06-03 13:10",
        changedBy: "Sarah Mitchell",
        field: "Users",
        reason: "Team policy expansion",
      },
      {
        after: "Created",
        before: "-",
        changedAt: "2026-05-27 16:05",
        changedBy: "Sarah Mitchell",
        field: "Plan",
        reason: "Initial pro plan setup",
      },
    ],
    createdAt: "2026-05-27",
    creditExpirationDays: 90,
    credits: 11000,
    description: "Advanced subscription plan for high-volume teams.",
    displayOrder: 3,
    downloadTraffic: 0,
    effectiveDate: "2026-06-03 13:10",
    eligibleUsers: "All users",
    expireRemainingCreditsAfterPartialUse: true,
    features: [
      "AI Image Generation",
      "AI Video Generation",
      "Video Analysis",
      "Max Video Length",
      "Download Limit",
      "Upload Limit",
      "Traffic (Bandwidth)",
      "AI Assistant",
      "Content Transformation",
      "Video Editing Tools",
      "Shortform Automation",
    ],
    freeTrialDays: 14,
    id: "plan_yettey_pro",
    languageData: createLanguageData(
      "Pro",
      "Advanced subscription plan for high-volume teams."
    ),
    monthlyPrice: 249000,
    name: "Pro",
    projects: 999,
    recommended: false,
    refundPolicy: "Non-refundable",
    salesEndAt: "2999-01-01",
    salesStartAt: "2026-05-27",
    service: "Yettey",
    showInComparison: true,
    shortformGeneration: 0,
    slug: "pro",
    status: "Active",
    stoppedAt: "-",
    storage: 0,
    type: "Subscription",
    uploadMinutes: 0,
    users: 10,
    updatedAt: "2026-06-03 13:10",
  },
  {
    accessAfterCancellation: "Until End of Period",
    annualPrice: 200000,
    allowCancellation: true,
    applyMode: "Immediately",
    autoRenewal: true,
    changeHistory: [
      {
        after: "Active",
        before: "Draft",
        changedAt: "2026-06-01 09:20",
        changedBy: "Ham Hwan",
        field: "Status",
        reason: "VPICK base plan opened for sale",
      },
      {
        after: "Created",
        before: "-",
        changedAt: "2026-05-27 16:18",
        changedBy: "Sarah Mitchell",
        field: "Plan",
        reason: "Initial VPICK plan setup",
      },
    ],
    createdAt: "2026-05-27",
    creditExpirationDays: 90,
    credits: 900,
    description: "Base VPICK plan for shortform video production.",
    displayOrder: 1,
    downloadTraffic: 10,
    effectiveDate: "2026-06-01 09:20",
    eligibleUsers: "All users",
    expireRemainingCreditsAfterPartialUse: true,
    features: [
      "AI Image Generation",
      "AI Video Generation",
      "Video Analysis",
      "Download Limit",
      "Upload Limit",
    ],
    freeTrialDays: 0,
    id: "plan_vpick_basic",
    languageData: createLanguageData(
      "Basic",
      "Base VPICK plan for shortform video production."
    ),
    monthlyPrice: 20000,
    name: "Basic",
    projects: 10,
    recommended: false,
    refundPolicy: "Non-refundable",
    salesEndAt: "2999-01-01",
    salesStartAt: "2026-05-27",
    service: "Vpick",
    showInComparison: true,
    shortformGeneration: 60,
    slug: "basic",
    status: "Active",
    stoppedAt: "-",
    storage: 20,
    type: "Subscription",
    uploadMinutes: 60,
    users: 0,
    updatedAt: "2026-06-01 09:20",
  },
  {
    accessAfterCancellation: "Until End of Period",
    annualPrice: 400000,
    allowCancellation: true,
    applyMode: "Immediately",
    autoRenewal: true,
    changeHistory: [
      {
        after: "40GB",
        before: "30GB",
        changedAt: "2026-06-08 10:22",
        changedBy: "Ham Hwan",
        field: "Download Traffic",
        reason: "Higher usage allowance for professional customers",
      },
      {
        after: "Created",
        before: "-",
        changedAt: "2026-05-27 16:34",
        changedBy: "Sarah Mitchell",
        field: "Plan",
        reason: "Initial VPICK professional plan setup",
      },
    ],
    createdAt: "2026-05-27",
    creditExpirationDays: 90,
    credits: 1900,
    description: "Professional VPICK plan for teams with recurring video volume.",
    displayOrder: 2,
    downloadTraffic: 40,
    effectiveDate: "2026-06-08 10:22",
    eligibleUsers: "All users",
    expireRemainingCreditsAfterPartialUse: true,
    features: [
      "AI Image Generation",
      "AI Video Generation",
      "Video Analysis",
      "Max Video Length",
      "Download Limit",
      "Upload Limit",
      "Traffic (Bandwidth)",
      "Shortform Automation",
    ],
    freeTrialDays: 0,
    id: "plan_vpick_professional",
    languageData: createLanguageData(
      "Professional",
      "Professional VPICK plan for teams with recurring video volume."
    ),
    monthlyPrice: 40000,
    name: "Professional",
    projects: 30,
    recommended: true,
    refundPolicy: "Non-refundable",
    salesEndAt: "2999-01-01",
    salesStartAt: "2026-05-27",
    service: "Vpick",
    showInComparison: true,
    shortformGeneration: 150,
    slug: "professional",
    status: "Active",
    stoppedAt: "-",
    storage: 80,
    type: "Subscription",
    uploadMinutes: 150,
    users: 0,
    updatedAt: "2026-06-08 10:22",
  },
]

export function createBlankBillingPlan(service: BillingPlanService): BillingPlan {
  const description =
    service === "Yettey"
      ? "Plan for teams that want to grow content production sustainably."
      : "Plan for teams that want to create and manage shortform videos."

  return {
    accessAfterCancellation: "Until End of Period",
    annualPrice: 0,
    allowCancellation: true,
    applyMode: "Immediately",
    autoRenewal: true,
    changeHistory: [],
    createdAt: "2026-06-08",
    creditExpirationDays: 90,
    credits: 0,
    description,
    displayOrder: 1,
    downloadTraffic: 0,
    effectiveDate: "2026-06-08 10:22",
    eligibleUsers: "All users",
    expireRemainingCreditsAfterPartialUse: true,
    features: ["AI Image Generation"],
    freeTrialDays: service === "Yettey" ? 7 : 0,
    id: `draft_${service.toLowerCase()}_new_plan`,
    languageData: createLanguageData("New Plan", description),
    monthlyPrice: 0,
    name: "New Plan",
    projects: 0,
    recommended: false,
    refundPolicy: "Non-refundable",
    salesEndAt: "2999-01-01",
    salesStartAt: "2026-06-08",
    service,
    showInComparison: true,
    shortformGeneration: 0,
    slug: "new-plan",
    status: "Draft",
    stoppedAt: "-",
    storage: 0,
    type: "Subscription",
    uploadMinutes: 0,
    users: service === "Yettey" ? 1 : 0,
    updatedAt: "2026-06-08 10:22",
  }
}

export function createLanguageData(
  name: string,
  description: string
): BillingPlanLanguageData {
  return {
    en: {
      description,
      name,
    },
    ko: {
      description,
      name,
    },
  }
}

export function getBillingPlansByService(service: BillingPlanService) {
  return billingPlans.filter((plan) => plan.service === service)
}

export function getBillingPlanBySlug(
  service: BillingPlanService,
  slug: string
) {
  return getBillingPlansByService(service).find((plan) => plan.slug === slug)
}

export function getServicePath(service: BillingPlanService) {
  return service === "Yettey" ? "yettey" : "vpick"
}

export function getPlanCreditsLabel(plan: BillingPlan) {
  return `${formatNumber(plan.credits)} credits`
}

export function getPlanLimits(plan: BillingPlan) {
  if (plan.service === "Yettey") {
    return [
      `${formatNumber(plan.projects)} projects`,
      `${formatNumber(plan.users)} users`,
    ]
  }

  return [
    `${formatNumber(plan.uploadMinutes)} min upload`,
    `${formatNumber(plan.shortformGeneration)} shortform min`,
    `${formatNumber(plan.storage)}GB storage`,
    `${formatNumber(plan.downloadTraffic)}GB traffic`,
    `${formatNumber(plan.projects)} projects`,
  ]
}

export function getStatusTone(status: BillingPlanStatus) {
  if (status === "Active") {
    return "success"
  }

  if (status === "Inactive") {
    return "danger"
  }

  return "neutral"
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value)
}
