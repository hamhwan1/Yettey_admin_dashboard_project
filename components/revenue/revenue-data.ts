import type {
  DashboardCompareMode,
  DashboardPeriod,
} from "@/lib/dashboard-date-store"
import {
  compareBaseline,
  getCompareDelta,
  getPeriodBuckets,
} from "@/lib/mock-analytics-engine"
import {
  type CurrentPlanName,
  type ProductService,
  formatKrw,
  getPlanPrice,
} from "@/lib/pricing-plans"

export type RevenueService = "Overall" | ProductService

export type RevenueDailyRow = {
  activePaidUsers: number
  cancelledSubscribers: number
  date: string
  failedPayments: number
  grossRevenue: number
  netRevenue: number
  newPaidUsers: number
  plan: CurrentPlanName
  previousActivePaidUsers: number
  previousNetRevenue: number
  refunds: number
  service: ProductService
}

export type RevenueMockContext = {
  compareMode: DashboardCompareMode
  endDate: string
  period: DashboardPeriod
  service?: RevenueService
  startDate: string
}

const planSnapshots: Array<{
  activePaidUsers: number
  cancelledSubscribers: number
  failedPayments: number
  newPaidUsers: number
  plan: CurrentPlanName
  refundRate: number
  service: ProductService
}> = [
  {
    activePaidUsers: 5200,
    cancelledSubscribers: 24,
    failedPayments: 18,
    newPaidUsers: 86,
    plan: "Starter",
    refundRate: 0.018,
    service: "Yettey",
  },
  {
    activePaidUsers: 4100,
    cancelledSubscribers: 15,
    failedPayments: 12,
    newPaidUsers: 74,
    plan: "Growth",
    refundRate: 0.014,
    service: "Yettey",
  },
  {
    activePaidUsers: 2400,
    cancelledSubscribers: 8,
    failedPayments: 7,
    newPaidUsers: 39,
    plan: "Pro",
    refundRate: 0.011,
    service: "Yettey",
  },
  {
    activePaidUsers: 1800,
    cancelledSubscribers: 16,
    failedPayments: 10,
    newPaidUsers: 58,
    plan: "Basic",
    refundRate: 0.026,
    service: "VPICK",
  },
  {
    activePaidUsers: 1194,
    cancelledSubscribers: 7,
    failedPayments: 6,
    newPaidUsers: 32,
    plan: "Professional",
    refundRate: 0.019,
    service: "VPICK",
  },
]

export const revenueRows: RevenueDailyRow[] = createRevenueRows({
  compareMode: "previous-period",
  endDate: "2026-05-26",
  period: "30D",
  startDate: "2026-04-27",
})

export function getRevenueRows(
  service: RevenueService,
  context?: RevenueMockContext
) {
  const rows = context ? createRevenueRows({ ...context, service }) : revenueRows

  if (service === "Overall") {
    return rows
  }

  return rows.filter((row) => row.service === service)
}

export function formatCurrency(value: number) {
  return formatKrw(value)
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value)
}

export function getRevenueSummary(rows: RevenueDailyRow[]) {
  const totalRevenue = rows.reduce((sum, row) => sum + row.netRevenue, 0)
  const newPaidUsers = rows.reduce((sum, row) => sum + row.newPaidUsers, 0)
  const activeByServicePlan = rows.reduce<Record<string, number>>((acc, row) => {
    const key = `${row.service}-${row.plan}`
    acc[key] = Math.max(acc[key] ?? 0, row.activePaidUsers)
    return acc
  }, {})
  const activePaidUsers = Object.values(activeByServicePlan).reduce(
    (sum, value) => sum + value,
    0
  )
  const cancelledSubscribers = rows.reduce(
    (sum, row) => sum + row.cancelledSubscribers,
    0
  )
  const failedPayments = rows.reduce((sum, row) => sum + row.failedPayments, 0)
  const churnRate =
    activePaidUsers > 0 ? (cancelledSubscribers / activePaidUsers) * 100 : 0
  const activeMrr = Object.entries(activeByServicePlan).reduce((sum, [key, active]) => {
    const plan = key.split("-").at(-1) as CurrentPlanName

    return sum + active * getPlanPrice(plan)
  }, 0)
  const arpu = activePaidUsers > 0 ? activeMrr / activePaidUsers : 0

  return {
    totalRevenue,
    newPaidUsers,
    activePaidUsers,
    cancelledSubscribers,
    churnRate,
    netPaidUsers: activePaidUsers,
    arpu,
    failedPayments,
  }
}

export function getDailyTrend(rows: RevenueDailyRow[]) {
  return Object.values(
    rows.reduce<
      Record<
        string,
        {
          date: string
          grossRevenue: number
          netRevenue: number
          previousNetRevenue: number
          refunds: number
        }
      >
    >((acc, row) => {
      acc[row.date] ??= {
        date: formatTrendDate(row.date),
        grossRevenue: 0,
        netRevenue: 0,
        previousNetRevenue: 0,
        refunds: 0,
      }
      acc[row.date].grossRevenue += row.grossRevenue
      acc[row.date].refunds += row.refunds
      acc[row.date].netRevenue += row.netRevenue
      acc[row.date].previousNetRevenue += row.previousNetRevenue
      return acc
    }, {})
  )
}

export function getPlanBreakdown(rows: RevenueDailyRow[]) {
  const breakdown = rows.reduce<
    Record<
      string,
      {
        activePaidUsers: number
        plan: string
        revenue: number
        servicePlanUsers: Record<string, number>
      }
    >
  >((acc, row) => {
    acc[row.plan] ??= {
      activePaidUsers: 0,
      plan: row.plan,
      revenue: 0,
      servicePlanUsers: {},
    }
    acc[row.plan].revenue += row.netRevenue
    acc[row.plan].servicePlanUsers[row.service] = Math.max(
      acc[row.plan].servicePlanUsers[row.service] ?? 0,
      row.activePaidUsers
    )
    return acc
  }, {})

  return Object.values(breakdown).map(({ servicePlanUsers, ...item }) => ({
    ...item,
    activePaidUsers: Object.values(servicePlanUsers).reduce(
      (sum, value) => sum + value,
      0
    ),
  }))
}

export function getSubscriberTrend(rows: RevenueDailyRow[]) {
  return getDailyTrend(rows).map((item) => {
    const dayRows = rows.filter((row) => formatTrendDate(row.date) === item.date)

    return {
      activePaidUsers: dayRows.reduce(
        (sum, row) => sum + row.activePaidUsers,
        0
      ),
      cancelledSubscribers: dayRows.reduce(
        (sum, row) => sum + row.cancelledSubscribers,
        0
      ),
      date: item.date,
      newPaidUsers: dayRows.reduce((sum, row) => sum + row.newPaidUsers, 0),
      previousActivePaidUsers: dayRows.reduce(
        (sum, row) => sum + row.previousActivePaidUsers,
        0
      ),
    }
  })
}

function createRevenueRows(context: RevenueMockContext) {
  const buckets = getPeriodBuckets({
      compareMode: context.compareMode,
      endDate: context.endDate,
      period: context.period,
      service: context.service ?? "Overall",
      startDate: context.startDate,
    })
  const signupDelta = getCompareDelta(context.compareMode, "paidUsers")
  const churnDelta = getCompareDelta(context.compareMode, "churn")

  return buckets.flatMap((bucket, bucketIndex) =>
    planSnapshots.map((snapshot, planIndex) => {
      const planPulse =
        1 + planIndex * 0.012 + (bucketIndex % 2 === 0 ? 0.018 : -0.008)
      const activePaidUsers = Math.round(
        snapshot.activePaidUsers * bucket.level * planPulse
      )
      const previousActivePaidUsers = compareBaseline(
        activePaidUsers,
        getCompareDelta(context.compareMode, "paidUsers")
      )
      const newPaidUsers = Math.round(
        snapshot.newPaidUsers * 5 * bucket.share * (1 + signupDelta / 500)
      )
      const cancelledSubscribers = Math.round(
        snapshot.cancelledSubscribers *
          5 *
          bucket.share *
          (1 + Math.max(churnDelta, -4) / 100)
      )
      const grossRevenue = Math.round(
        snapshot.activePaidUsers *
          getPlanPrice(snapshot.plan) *
          bucket.share *
          planPulse
      )
      const previousGrossRevenue = Math.round(
        snapshot.activePaidUsers *
          getPlanPrice(snapshot.plan) *
          bucket.previousActivity *
          planPulse
      )
      const refunds = Math.round(
        grossRevenue * snapshot.refundRate * (1 + Math.max(churnDelta, 0) / 24)
      )
      const previousRefunds = Math.round(previousGrossRevenue * snapshot.refundRate)

      return {
        activePaidUsers,
        cancelledSubscribers,
        date: bucket.label,
        failedPayments: Math.max(
          1,
          Math.round(
            snapshot.failedPayments *
              5 *
              bucket.share *
              (1 + Math.max(churnDelta, 0) / 80)
          )
        ),
        grossRevenue,
        netRevenue: grossRevenue - refunds,
        newPaidUsers,
        plan: snapshot.plan,
        previousActivePaidUsers,
        previousNetRevenue: previousGrossRevenue - previousRefunds,
        refunds,
        service: snapshot.service,
      }
    })
  )
}

function formatTrendDate(date: string) {
  return date.includes("-") ? date.slice(5) : date
}
