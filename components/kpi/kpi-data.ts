export type KpiTone = "amber" | "emerald" | "rose" | "sky" | "violet"

export type KpiMetricType = "currency" | "number" | "percentage"

export type KpiSummaryMetric = {
  current: number
  description: string
  id: string
  label: string
  target: number
  tone: KpiTone
  type: KpiMetricType
}

export type KpiScoreboardMetric = KpiSummaryMetric & {
  owner: string
}

export type KpiGoal = {
  d7RetentionTarget: number
  d30RetentionTarget: number
  id: string
  mrrTarget: number
  paidUsersTarget: number
  periodLabel: string
  periodType: KpiPeriodType
  service: KpiService
  signupsTarget: number
  visitorsTarget: number
}

export type KpiPeriodType = "Monthly" | "Quarterly" | "Yearly"

export type KpiService = "Overall" | "VPICK" | "Yettey"

export const kpiSummaryMetrics: KpiSummaryMetric[] = [
  {
    current: 375000000,
    description: "Monthly recurring and campaign revenue pacing",
    id: "revenue-goal",
    label: "Revenue Goal",
    target: 500000000,
    tone: "violet",
    type: "currency",
  },
  {
    current: 16840,
    description: "Account creation target across Yettey and VPICK",
    id: "signup-goal",
    label: "Signup Goal",
    target: 25000,
    tone: "sky",
    type: "number",
  },
  {
    current: 4370,
    description: "Active paid subscriptions and paid workspaces",
    id: "paid-user-goal",
    label: "Paid User Goal",
    target: 6000,
    tone: "emerald",
    type: "number",
  },
  {
    current: 47,
    description: "D30 user retention target for creator cohorts",
    id: "retention-goal",
    label: "Retention Goal",
    target: 65,
    tone: "amber",
    type: "percentage",
  },
]

export const kpiScoreboardMetrics: KpiScoreboardMetric[] = [
  {
    current: 235869,
    description: "Unique visitors in the current mock period",
    id: "visitors",
    label: "Visitors",
    owner: "Growth",
    target: 300000,
    tone: "violet",
    type: "number",
  },
  {
    current: 16840,
    description: "New registrations across both services",
    id: "signups",
    label: "Signups",
    owner: "Acquisition",
    target: 25000,
    tone: "sky",
    type: "number",
  },
  {
    current: 4370,
    description: "Paid users with an active plan",
    id: "paid-users",
    label: "Paid Users",
    owner: "Revenue",
    target: 6000,
    tone: "emerald",
    type: "number",
  },
  {
    current: 375000000,
    description: "MRR pacing against the board target",
    id: "mrr",
    label: "MRR",
    owner: "Revenue",
    target: 500000000,
    tone: "violet",
    type: "currency",
  },
  {
    current: 61,
    description: "D7 cohort retention",
    id: "d7-retention",
    label: "D7 Retention",
    owner: "Lifecycle",
    target: 70,
    tone: "amber",
    type: "percentage",
  },
  {
    current: 47,
    description: "D30 cohort retention",
    id: "d30-retention",
    label: "D30 Retention",
    owner: "Lifecycle",
    target: 65,
    tone: "rose",
    type: "percentage",
  },
]

export const initialKpiGoals: KpiGoal[] = [
  {
    d7RetentionTarget: 70,
    d30RetentionTarget: 65,
    id: "goal-overall-jun",
    mrrTarget: 500000000,
    paidUsersTarget: 6000,
    periodLabel: "June 2026",
    periodType: "Monthly",
    service: "Overall",
    signupsTarget: 25000,
    visitorsTarget: 300000,
  },
  {
    d7RetentionTarget: 73,
    d30RetentionTarget: 66,
    id: "goal-yettey-q2",
    mrrTarget: 320000000,
    paidUsersTarget: 3900,
    periodLabel: "Q2 2026",
    periodType: "Quarterly",
    service: "Yettey",
    signupsTarget: 15500,
    visitorsTarget: 180000,
  },
  {
    d7RetentionTarget: 68,
    d30RetentionTarget: 58,
    id: "goal-vpick-q2",
    mrrTarget: 180000000,
    paidUsersTarget: 2100,
    periodLabel: "Q2 2026",
    periodType: "Quarterly",
    service: "VPICK",
    signupsTarget: 9500,
    visitorsTarget: 120000,
  },
]

export const kpiPeriodTypes: KpiPeriodType[] = ["Monthly", "Quarterly", "Yearly"]

export const kpiServices: KpiService[] = ["Overall", "Yettey", "VPICK"]

export function formatKpiValue(value: number, type: KpiMetricType) {
  if (type === "currency") {
    if (value >= 100000000) {
      return `₩${Math.round(value / 1000000).toLocaleString()}M`
    }

    return new Intl.NumberFormat("ko-KR", {
      currency: "KRW",
      maximumFractionDigits: 0,
      style: "currency",
    }).format(value)
  }

  if (type === "percentage") {
    return `${value}%`
  }

  return value.toLocaleString()
}

export function getKpiProgress(current: number, target: number) {
  if (!target) {
    return 0
  }

  return Math.round((current / target) * 100)
}

export function getKpiStatus(progress: number) {
  if (progress >= 90) {
    return "Ahead"
  }

  if (progress >= 75) {
    return "On Track"
  }

  if (progress >= 65) {
    return "Watch"
  }

  return "At Risk"
}
