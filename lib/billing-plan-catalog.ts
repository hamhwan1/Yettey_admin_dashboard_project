import { formatKrw } from "@/lib/pricing-plans"

export type BillingPlanService = "Yettey" | "Vpick"
export type BillingPlanStatus = "Draft" | "Active" | "Inactive"
export type BillingPlanType = "Subscription" | "Credit Pack"

export type BillingPlanFeature =
  | "AI Generate"
  | "AI Edit"
  | "Team Workspace"
  | "API Access"
  | "Priority Queue"
  | "White Label"

export type PlanChangeHistory = {
  after: string
  before: string
  changedAt: string
  changedBy: string
  field: string
  reason: string
}

export type BillingPlan = {
  annualPrice: number
  autoRenewal: boolean
  changeHistory: PlanChangeHistory[]
  createdAt: string
  credits: number
  description: string
  downloadTraffic: number
  features: BillingPlanFeature[]
  freeTrialDays: number
  monthlyPrice: number
  name: string
  projects: number
  service: BillingPlanService
  shortformGeneration: number
  slug: string
  status: BillingPlanStatus
  stoppedAt: string
  storage: number
  type: BillingPlanType
  uploadMinutes: number
  users: number
}

export const billingPlanFeatures: BillingPlanFeature[] = [
  "AI Generate",
  "AI Edit",
  "Team Workspace",
  "API Access",
  "Priority Queue",
  "White Label",
]

export const billingPlanStatuses: BillingPlanStatus[] = [
  "Draft",
  "Active",
  "Inactive",
]

export const billingPlanTypes: BillingPlanType[] = ["Subscription", "Credit Pack"]

export const billingPlans: BillingPlan[] = [
  {
    annualPrice: 490000,
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
    credits: 1800,
    description: "Entry subscription plan for small creator teams.",
    downloadTraffic: 0,
    features: ["AI Generate", "AI Edit", "Team Workspace"],
    freeTrialDays: 7,
    monthlyPrice: 49000,
    name: "Starter",
    projects: 4,
    service: "Yettey",
    shortformGeneration: 0,
    slug: "starter",
    status: "Active",
    stoppedAt: "-",
    storage: 0,
    type: "Subscription",
    uploadMinutes: 0,
    users: 2,
  },
  {
    annualPrice: 990000,
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
    credits: 4000,
    description: "Growth plan for teams scaling content operations.",
    downloadTraffic: 0,
    features: ["AI Generate", "AI Edit", "Team Workspace", "Priority Queue"],
    freeTrialDays: 14,
    monthlyPrice: 99000,
    name: "Growth",
    projects: 10,
    service: "Yettey",
    shortformGeneration: 0,
    slug: "growth",
    status: "Active",
    stoppedAt: "-",
    storage: 0,
    type: "Subscription",
    uploadMinutes: 0,
    users: 3,
  },
  {
    annualPrice: 2490000,
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
    credits: 11000,
    description: "Advanced subscription plan for high-volume teams.",
    downloadTraffic: 0,
    features: [
      "AI Generate",
      "AI Edit",
      "Team Workspace",
      "API Access",
      "Priority Queue",
    ],
    freeTrialDays: 14,
    monthlyPrice: 249000,
    name: "Pro",
    projects: 999,
    service: "Yettey",
    shortformGeneration: 0,
    slug: "pro",
    status: "Active",
    stoppedAt: "-",
    storage: 0,
    type: "Subscription",
    uploadMinutes: 0,
    users: 10,
  },
  {
    annualPrice: 200000,
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
    credits: 900,
    description: "Base VPICK plan for shortform video production.",
    downloadTraffic: 10,
    features: ["AI Generate", "AI Edit"],
    freeTrialDays: 0,
    monthlyPrice: 20000,
    name: "Basic",
    projects: 10,
    service: "Vpick",
    shortformGeneration: 60,
    slug: "basic",
    status: "Active",
    stoppedAt: "-",
    storage: 20,
    type: "Subscription",
    uploadMinutes: 60,
    users: 0,
  },
  {
    annualPrice: 400000,
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
    credits: 1900,
    description: "Professional VPICK plan for teams with recurring video volume.",
    downloadTraffic: 40,
    features: ["AI Generate", "AI Edit", "Priority Queue", "White Label"],
    freeTrialDays: 0,
    monthlyPrice: 40000,
    name: "Professional",
    projects: 30,
    service: "Vpick",
    shortformGeneration: 150,
    slug: "professional",
    status: "Active",
    stoppedAt: "-",
    storage: 80,
    type: "Subscription",
    uploadMinutes: 150,
    users: 0,
  },
]

export function createBlankBillingPlan(service: BillingPlanService): BillingPlan {
  return {
    annualPrice: 0,
    autoRenewal: true,
    changeHistory: [
      {
        after: "Created",
        before: "-",
        changedAt: "2026-06-08 10:22",
        changedBy: "Sarah Mitchell",
        field: "Plan",
        reason: "Draft plan created",
      },
    ],
    createdAt: "2026-06-08",
    credits: 0,
    description:
      service === "Yettey"
        ? "Plan for teams that want to grow content production sustainably."
        : "Plan for teams that want to create and manage shortform videos.",
    downloadTraffic: 0,
    features: ["AI Generate"],
    freeTrialDays: service === "Yettey" ? 7 : 0,
    monthlyPrice: 0,
    name: "New Plan",
    projects: 0,
    service,
    shortformGeneration: 0,
    slug: "new-plan",
    status: "Draft",
    stoppedAt: "-",
    storage: 0,
    type: "Subscription",
    uploadMinutes: 0,
    users: service === "Yettey" ? 1 : 0,
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
