import type {
  DashboardCompareMode,
  DashboardPeriod,
} from "@/lib/dashboard-date-store"
import type { DashboardService } from "@/lib/dashboard-service-store"

export type AnalyticsBucket = {
  activity: number
  label: string
  level: number
  previousActivity: number
  previousLevel: number
  share: number
}

type AnalyticsMetric =
  | "visitors"
  | "signups"
  | "paidUsers"
  | "revenue"
  | "churn"
  | "retention"

const compareDeltas: Record<
  DashboardCompareMode,
  Record<AnalyticsMetric, number>
> = {
  "previous-period": {
    churn: -1.2,
    paidUsers: 6.2,
    retention: 2.4,
    revenue: 8.6,
    signups: 5.7,
    visitors: 18.4,
  },
  "same-period-last-month": {
    churn: 0.8,
    paidUsers: 3.4,
    retention: -2.1,
    revenue: 4.2,
    signups: -2.4,
    visitors: 7.8,
  },
  "same-period-last-year": {
    churn: -2.6,
    paidUsers: 42.8,
    retention: 8.6,
    revenue: 58.4,
    signups: 34.2,
    visitors: 64.8,
  },
}

const compareVolatility: Record<DashboardCompareMode, number> = {
  "previous-period": 1,
  "same-period-last-month": 1.14,
  "same-period-last-year": 0.82,
}

const serviceMotion: Record<
  DashboardService,
  { phase: number; trendLift: number; volatility: number }
> = {
  Overall: { phase: 0.2, trendLift: 1, volatility: 1 },
  Yettey: { phase: 0.72, trendLift: 1.06, volatility: 0.9 },
  VPICK: { phase: 1.36, trendLift: 0.94, volatility: 1.24 },
}

export function getCompareDelta(
  compareMode: DashboardCompareMode,
  metric: AnalyticsMetric
) {
  return compareDeltas[compareMode][metric]
}

export function getPeriodScale(
  period: DashboardPeriod,
  startDate: string,
  endDate: string
) {
  if (period === "7D") {
    return 0.28
  }

  if (period === "30D") {
    return 1
  }

  if (period === "90D") {
    return 2.85
  }

  if (period === "1Y") {
    return 10.4
  }

  return clamp(getRangeDays(startDate, endDate) / 30, 0.2, 12)
}

export function getPeriodBuckets({
  compareMode,
  endDate,
  period,
  service,
  startDate,
}: {
  compareMode: DashboardCompareMode
  endDate: string
  period: DashboardPeriod
  service: DashboardService
  startDate: string
}): AnalyticsBucket[] {
  const labels = getPeriodLabels(period, startDate, endDate)
  const motion = serviceMotion[service]
  const periodScale = getPeriodScale(period, startDate, endDate)
  const volatility = compareVolatility[compareMode] * motion.volatility
  const raw = labels.map((label, index) => {
    const progress = labels.length === 1 ? 1 : index / (labels.length - 1)
    const weekdayPulse =
      period === "7D" && (index === 4 || index === 5) ? -0.14 : 0
    const launchSpike =
      (period === "7D" && index === 2) ||
      (period === "30D" && index === Math.max(labels.length - 2, 0)) ||
      (period === "90D" && index === Math.floor(labels.length * 0.68))
        ? 0.16
        : 0
    const seasonality =
      Math.sin(index * 1.37 + motion.phase) * 0.055 * volatility +
      Math.cos(index * 0.73 + motion.phase) * 0.028 * volatility
    const longRangeSeasonality =
      period === "1Y" ? Math.sin(index * 0.82 + motion.phase) * 0.08 : 0
    const level = clamp(
      0.74 +
        progress * 0.44 * motion.trendLift +
        weekdayPulse +
        launchSpike +
        seasonality +
        longRangeSeasonality,
      0.48,
      1.48
    )
    const previousLevel = clamp(
      level / (1 + getCompareDelta(compareMode, "revenue") / 100) +
        Math.sin(index * 0.91 + motion.phase + 0.4) * 0.035,
      0.32,
      1.28
    )

    return {
      label,
      level,
      previousLevel,
    }
  })
  const levelTotal = raw.reduce((sum, bucket) => sum + bucket.level, 0)
  const previousTotal = raw.reduce(
    (sum, bucket) => sum + bucket.previousLevel,
    0
  )

  return raw.map((bucket) => ({
    ...bucket,
    activity: bucket.level,
    share: (bucket.level / levelTotal) * periodScale,
    previousLevel: bucket.previousLevel,
    previousActivity:
      (bucket.previousLevel / previousTotal) *
      periodScale *
      (1 - getCompareDelta(compareMode, "revenue") / 1000),
  }))
}

export function compareBaseline(current: number, deltaPercent: number) {
  return Math.round(current / (1 + deltaPercent / 100))
}

function getPeriodLabels(
  period: DashboardPeriod,
  startDate: string,
  endDate: string
) {
  if (period === "7D") {
    return ["May 20", "May 21", "May 22", "May 23", "May 24", "May 25", "May 26"]
  }

  if (period === "30D") {
    return [
      "May 1",
      "May 5",
      "May 9",
      "May 13",
      "May 17",
      "May 21",
      "May 25",
      "May 26",
    ]
  }

  if (period === "90D") {
    return [
      "Mar W1",
      "Mar W2",
      "Mar W3",
      "Mar W4",
      "Apr W1",
      "Apr W2",
      "Apr W3",
      "Apr W4",
      "May W1",
      "May W2",
      "May W3",
      "May W4",
    ]
  }

  if (period === "1Y") {
    return ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"]
  }

  const days = getRangeDays(startDate, endDate)

  if (days <= 10) {
    return ["Start", "D2", "D4", "D6", "D8", "End"]
  }

  if (days <= 60) {
    return ["Start", "W1", "W2", "W3", "W4", "End"]
  }

  return [startDate.slice(5), "25%", "50%", "75%", endDate.slice(5)]
}

function getRangeDays(startDate: string, endDate: string) {
  return (
    Math.round(
      (new Date(`${endDate}T00:00:00`).getTime() -
        new Date(`${startDate}T00:00:00`).getTime()) /
        86400000
    ) + 1
  )
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}
