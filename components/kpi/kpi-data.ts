export type KpiDirection = "higher" | "lower"

export type KpiTone = "amber" | "emerald" | "rose" | "sky" | "violet"

export type KpiMetricType = "currency" | "percentage"

export type KpiTrend = {
  direction: "down" | "up"
  value: number
  unit: "%" | "pp"
}

export type BusinessKpiMetric = {
  current: number
  description: string
  direction: KpiDirection
  id: string
  label: string
  owner: string
  precision?: number
  riskThreshold?: number
  target: number
  targetPrefix?: "<"
  tone: KpiTone
  trend: KpiTrend
  type: KpiMetricType
}

export type KpiGoal = {
  activationRateTarget: number
  churnRateTarget: number
  d30RetentionTarget: number
  id: string
  mrrTarget: number
  periodLabel: string
  periodType: KpiPeriodType
  service: KpiService
  signupConversionTarget: number
}

export type KpiPeriodType = "Monthly" | "Quarterly" | "Yearly"

export type KpiService = "Overall" | "VPICK" | "Yettey"

export const businessKpiMetrics: BusinessKpiMetric[] = [
  {
    current: 5.7,
    description: "Visitor to signup conversion across website and product entry points",
    direction: "higher",
    id: "signup-conversion-rate",
    label: "Signup Conversion Rate",
    owner: "Acquisition",
    precision: 1,
    riskThreshold: 70,
    target: 8,
    tone: "sky",
    trend: { direction: "up", unit: "pp", value: 0.4 },
    type: "percentage",
  },
  {
    current: 54,
    description: "Signup to first successful content generation",
    direction: "higher",
    id: "activation-rate",
    label: "Activation Rate",
    owner: "Product",
    riskThreshold: 80,
    target: 70,
    tone: "violet",
    trend: { direction: "down", unit: "pp", value: 3.2 },
    type: "percentage",
  },
  {
    current: 47,
    description: "Users returning after 30 days",
    direction: "higher",
    id: "d30-retention-rate",
    label: "D30 Retention Rate",
    owner: "Lifecycle",
    riskThreshold: 80,
    target: 60,
    tone: "amber",
    trend: { direction: "down", unit: "pp", value: 1.8 },
    type: "percentage",
  },
  {
    current: 375000000,
    description: "Monthly recurring revenue from active subscriptions",
    direction: "higher",
    id: "mrr",
    label: "MRR",
    owner: "Revenue",
    riskThreshold: 75,
    target: 500000000,
    tone: "emerald",
    trend: { direction: "up", unit: "%", value: 6.1 },
    type: "currency",
  },
  {
    current: 2.1,
    description: "Subscription cancellation rate",
    direction: "lower",
    id: "churn-rate",
    label: "Churn Rate",
    owner: "Revenue",
    precision: 1,
    riskThreshold: 100,
    target: 3,
    targetPrefix: "<",
    tone: "rose",
    trend: { direction: "down", unit: "pp", value: 0.6 },
    type: "percentage",
  },
]

export const initialKpiGoals: KpiGoal[] = [
  {
    activationRateTarget: 70,
    churnRateTarget: 3,
    d30RetentionTarget: 60,
    id: "goal-overall-jun",
    mrrTarget: 500000000,
    periodLabel: "June 2026",
    periodType: "Monthly",
    service: "Overall",
    signupConversionTarget: 8,
  },
  {
    activationRateTarget: 74,
    churnRateTarget: 2.8,
    d30RetentionTarget: 63,
    id: "goal-yettey-q2",
    mrrTarget: 320000000,
    periodLabel: "Q2 2026",
    periodType: "Quarterly",
    service: "Yettey",
    signupConversionTarget: 8.4,
  },
  {
    activationRateTarget: 66,
    churnRateTarget: 3.2,
    d30RetentionTarget: 55,
    id: "goal-vpick-q2",
    mrrTarget: 180000000,
    periodLabel: "Q2 2026",
    periodType: "Quarterly",
    service: "VPICK",
    signupConversionTarget: 7.2,
  },
]

export const kpiPeriodTypes: KpiPeriodType[] = ["Monthly", "Quarterly", "Yearly"]

export const kpiServices: KpiService[] = ["Overall", "Yettey", "VPICK"]

export function formatKpiValue(
  value: number,
  type: KpiMetricType,
  precision = 0
) {
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

  return `${value.toFixed(precision)}%`
}

export function formatKpiTarget(metric: BusinessKpiMetric) {
  return `${metric.targetPrefix ?? ""}${formatKpiValue(
    metric.target,
    metric.type,
    metric.precision
  )}`
}

export function formatTrend(trend: KpiTrend) {
  const sign = trend.direction === "up" ? "+" : "-"

  return `${sign}${trend.value}${trend.unit}`
}

export function getKpiProgress(metric: BusinessKpiMetric) {
  if (!metric.target) {
    return 0
  }

  if (metric.direction === "lower") {
    return Math.min(100, Math.round((metric.target / metric.current) * 100))
  }

  return Math.min(100, Math.round((metric.current / metric.target) * 100))
}

export function getKpiStatus(metric: BusinessKpiMetric) {
  const progress = getKpiProgress(metric)

  if (metric.direction === "lower" && metric.current <= metric.target) {
    return "Healthy"
  }

  if (metric.direction === "higher" && metric.current >= metric.target) {
    return "Healthy"
  }

  if (progress >= (metric.riskThreshold ?? 80)) {
    return "Watch"
  }

  return "At Risk"
}

export function isKpiAtRisk(metric: BusinessKpiMetric) {
  return getKpiStatus(metric) === "At Risk"
}

export function isTrendHealthy(metric: BusinessKpiMetric) {
  if (metric.direction === "lower") {
    return metric.trend.direction === "down"
  }

  return metric.trend.direction === "up"
}
