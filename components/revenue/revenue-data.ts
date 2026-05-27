export type RevenueService = "Overall" | "Yettey" | "VPICK"

export type RevenueDailyRow = {
  date: string
  service: "Yettey" | "VPICK"
  plan: "Free" | "Starter" | "Growth" | "Pro" | "Enterprise"
  newPaidUsers: number
  activePaidUsers: number
  cancelledSubscribers: number
  grossRevenue: number
  refunds: number
  netRevenue: number
  failedPayments: number
}

export const revenueRows: RevenueDailyRow[] = [
  {
    date: "2026-05-16",
    service: "Yettey",
    plan: "Starter",
    newPaidUsers: 42,
    activePaidUsers: 1840,
    cancelledSubscribers: 12,
    grossRevenue: 28400,
    refunds: 820,
    netRevenue: 27580,
    failedPayments: 9,
  },
  {
    date: "2026-05-17",
    service: "Yettey",
    plan: "Growth",
    newPaidUsers: 38,
    activePaidUsers: 1878,
    cancelledSubscribers: 10,
    grossRevenue: 31500,
    refunds: 640,
    netRevenue: 30860,
    failedPayments: 7,
  },
  {
    date: "2026-05-18",
    service: "Yettey",
    plan: "Pro",
    newPaidUsers: 51,
    activePaidUsers: 1929,
    cancelledSubscribers: 14,
    grossRevenue: 36200,
    refunds: 920,
    netRevenue: 35280,
    failedPayments: 11,
  },
  {
    date: "2026-05-19",
    service: "Yettey",
    plan: "Enterprise",
    newPaidUsers: 19,
    activePaidUsers: 1948,
    cancelledSubscribers: 5,
    grossRevenue: 42800,
    refunds: 1100,
    netRevenue: 41700,
    failedPayments: 5,
  },
  {
    date: "2026-05-20",
    service: "Yettey",
    plan: "Pro",
    newPaidUsers: 47,
    activePaidUsers: 1995,
    cancelledSubscribers: 8,
    grossRevenue: 38400,
    refunds: 760,
    netRevenue: 37640,
    failedPayments: 8,
  },
  {
    date: "2026-05-16",
    service: "VPICK",
    plan: "Starter",
    newPaidUsers: 31,
    activePaidUsers: 1260,
    cancelledSubscribers: 9,
    grossRevenue: 18200,
    refunds: 420,
    netRevenue: 17780,
    failedPayments: 6,
  },
  {
    date: "2026-05-17",
    service: "VPICK",
    plan: "Growth",
    newPaidUsers: 35,
    activePaidUsers: 1295,
    cancelledSubscribers: 7,
    grossRevenue: 21400,
    refunds: 520,
    netRevenue: 20880,
    failedPayments: 4,
  },
  {
    date: "2026-05-18",
    service: "VPICK",
    plan: "Pro",
    newPaidUsers: 28,
    activePaidUsers: 1323,
    cancelledSubscribers: 11,
    grossRevenue: 23600,
    refunds: 680,
    netRevenue: 22920,
    failedPayments: 8,
  },
  {
    date: "2026-05-19",
    service: "VPICK",
    plan: "Enterprise",
    newPaidUsers: 12,
    activePaidUsers: 1335,
    cancelledSubscribers: 4,
    grossRevenue: 29400,
    refunds: 740,
    netRevenue: 28660,
    failedPayments: 3,
  },
  {
    date: "2026-05-20",
    service: "VPICK",
    plan: "Pro",
    newPaidUsers: 34,
    activePaidUsers: 1369,
    cancelledSubscribers: 6,
    grossRevenue: 25100,
    refunds: 500,
    netRevenue: 24600,
    failedPayments: 5,
  },
]

export function getRevenueRows(service: RevenueService) {
  if (service === "Overall") {
    return revenueRows
  }

  return revenueRows.filter((row) => row.service === service)
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
    style: "currency",
    currency: "USD",
  }).format(value)
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
  const arpu = activePaidUsers > 0 ? totalRevenue / activePaidUsers : 0

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
    rows.reduce<Record<string, { date: string; grossRevenue: number; refunds: number; netRevenue: number }>>(
      (acc, row) => {
        acc[row.date] ??= {
          date: row.date.slice(5),
          grossRevenue: 0,
          refunds: 0,
          netRevenue: 0,
        }
        acc[row.date].grossRevenue += row.grossRevenue
        acc[row.date].refunds += row.refunds
        acc[row.date].netRevenue += row.netRevenue
        return acc
      },
      {}
    )
  )
}

export function getPlanBreakdown(rows: RevenueDailyRow[]) {
  const breakdown = rows.reduce<
    Record<string, { plan: string; revenue: number; activePaidUsers: number; servicePlanUsers: Record<string, number> }>
  >((acc, row) => {
    acc[row.plan] ??= {
      plan: row.plan,
      revenue: 0,
      activePaidUsers: 0,
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
    const dayRows = rows.filter((row) => row.date.slice(5) === item.date)

    return {
      date: item.date,
      activePaidUsers: dayRows.reduce(
        (sum, row) => sum + row.activePaidUsers,
        0
      ),
      newPaidUsers: dayRows.reduce((sum, row) => sum + row.newPaidUsers, 0),
      cancelledSubscribers: dayRows.reduce(
        (sum, row) => sum + row.cancelledSubscribers,
        0
      ),
    }
  })
}
