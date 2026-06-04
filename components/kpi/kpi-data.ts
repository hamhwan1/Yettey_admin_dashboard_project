export type EnterpriseContractStatus = "Active" | "Expired" | "Pending"

export type KpiCalculationType = "enterpriseRevenue" | "manual" | "totalRevenue"

export type KpiDirection = "higher" | "lower"

export type KpiFormat = "currency" | "number" | "percentage"

export type KpiPeriodType = "Monthly" | "Quarterly" | "Yearly"

export type KpiService = "Overall" | "VPICK" | "Yettey"

export type KpiTone = "amber" | "emerald" | "rose" | "sky" | "violet"

export type KpiTrend = {
  direction: "down" | "up"
  unit: "%" | "pp"
  value: number
}

export type ContractHistoryRecord = {
  changedBy: string
  date: string
  field: string
  id: string
  newValue: string
  previousValue: string
}

export type KpiHistoryRecord = {
  changedBy: string
  date: string
  id: string
  newValue: string
  previousValue: string
  reason: string
}

export type EnterpriseContract = {
  archived?: boolean
  companyName: string
  contractAmount: number
  contractEndDate: string
  contractStartDate: string
  contractStatus: EnterpriseContractStatus
  history: ContractHistoryRecord[]
  id: string
  lastUpdated: string
  notes: string
}

export type KpiConfiguration = {
  archived?: boolean
  calculationType: KpiCalculationType
  currentValue: number
  description: string
  direction: KpiDirection
  displayOrder: number
  format: KpiFormat
  history: KpiHistoryRecord[]
  id: string
  lastUpdated: string
  name: string
  periodLabel: string
  periodType: KpiPeriodType
  pinned: boolean
  precision?: number
  riskThreshold?: number
  service: KpiService
  showOnOverview: boolean
  targetPrefix?: "<"
  targetValue: number
  tone: KpiTone
  trend: KpiTrend
}

export const kpiNameOptions = [
  "Signup Conversion Rate",
  "Activation Rate",
  "D30 Retention",
  "Total Revenue",
  "MRR",
  "Churn Rate",
  "Paid Conversion Rate",
  "Enterprise Revenue",
  "ARPU",
  "LTV",
  "CAC",
]

export const kpiPeriodTypes: KpiPeriodType[] = ["Monthly", "Quarterly", "Yearly"]

export const kpiServices: KpiService[] = ["Overall", "Yettey", "VPICK"]

const changedBy = "Ham Hwan"

export const initialEnterpriseContracts: EnterpriseContract[] = [
  {
    companyName: "Blue Ocean Studios",
    contractAmount: 90000000,
    contractEndDate: "2026-12-31",
    contractStartDate: "2026-01-01",
    contractStatus: "Active",
    history: [
      {
        changedBy,
        date: "2026-06-01",
        field: "Contract Amount",
        id: "contract-history-blue-ocean-1",
        newValue: "\u20a990M",
        previousValue: "\u20a982M",
      },
    ],
    id: "enterprise-blue-ocean",
    lastUpdated: "2026-06-01",
    notes: "Annual creator workflow contract, recognized in monthly enterprise revenue.",
  },
  {
    companyName: "Nova Media Group",
    contractAmount: 80000000,
    contractEndDate: "2026-09-30",
    contractStartDate: "2026-04-01",
    contractStatus: "Active",
    history: [
      {
        changedBy,
        date: "2026-05-24",
        field: "Status",
        id: "contract-history-nova-media-1",
        newValue: "Active",
        previousValue: "Pending",
      },
    ],
    id: "enterprise-nova-media",
    lastUpdated: "2026-05-24",
    notes: "VPICK enterprise package with dedicated onboarding support.",
  },
  {
    companyName: "Han River Commerce",
    contractAmount: 45000000,
    contractEndDate: "2026-08-31",
    contractStartDate: "2026-06-15",
    contractStatus: "Pending",
    history: [
      {
        changedBy,
        date: "2026-06-03",
        field: "Contract Status",
        id: "contract-history-han-river-1",
        newValue: "Pending",
        previousValue: "Draft",
      },
    ],
    id: "enterprise-han-river",
    lastUpdated: "2026-06-03",
    notes: "Procurement review pending before revenue recognition.",
  },
]

export const initialKpiConfigurations: KpiConfiguration[] = [
  {
    calculationType: "manual",
    currentValue: 5.7,
    description: "Visitor to signup conversion across website and product entry points.",
    direction: "higher",
    displayOrder: 1,
    format: "percentage",
    history: [
      {
        changedBy,
        date: "2026-06-01",
        id: "kpi-history-signup-conversion-1",
        newValue: "8.0%",
        previousValue: "5.0%",
        reason: "Target adjustment after growth review",
      },
    ],
    id: "signup-conversion-rate",
    lastUpdated: "2026-06-01",
    name: "Signup Conversion Rate",
    periodLabel: "June 2026",
    periodType: "Monthly",
    pinned: true,
    precision: 1,
    riskThreshold: 70,
    service: "Overall",
    showOnOverview: true,
    targetValue: 8,
    tone: "sky",
    trend: { direction: "up", unit: "pp", value: 0.4 },
  },
  {
    calculationType: "manual",
    currentValue: 54,
    description: "Signup to first successful content generation. This is a priority Yettey health signal.",
    direction: "higher",
    displayOrder: 2,
    format: "percentage",
    history: [
      {
        changedBy,
        date: "2026-06-01",
        id: "kpi-history-activation-1",
        newValue: "70%",
        previousValue: "64%",
        reason: "Activation became the main Yettey health KPI for Q2",
      },
    ],
    id: "activation-rate",
    lastUpdated: "2026-06-01",
    name: "Activation Rate",
    periodLabel: "June 2026",
    periodType: "Monthly",
    pinned: true,
    riskThreshold: 80,
    service: "Overall",
    showOnOverview: true,
    targetValue: 70,
    tone: "violet",
    trend: { direction: "down", unit: "pp", value: 3.2 },
  },
  {
    calculationType: "manual",
    currentValue: 47,
    description: "Users returning after 30 days.",
    direction: "higher",
    displayOrder: 3,
    format: "percentage",
    history: [
      {
        changedBy,
        date: "2026-05-28",
        id: "kpi-history-d30-retention-1",
        newValue: "60%",
        previousValue: "55%",
        reason: "Retention benchmark updated after cohort analysis",
      },
    ],
    id: "d30-retention",
    lastUpdated: "2026-05-28",
    name: "D30 Retention",
    periodLabel: "June 2026",
    periodType: "Monthly",
    pinned: true,
    riskThreshold: 80,
    service: "Overall",
    showOnOverview: true,
    targetValue: 60,
    tone: "amber",
    trend: { direction: "down", unit: "pp", value: 1.8 },
  },
  {
    calculationType: "totalRevenue",
    currentValue: 375000000,
    description: "Total revenue combining subscription revenue and active enterprise contracts.",
    direction: "higher",
    displayOrder: 4,
    format: "currency",
    history: [
      {
        changedBy,
        date: "2026-06-01",
        id: "kpi-history-total-revenue-1",
        newValue: "\u20a9500M",
        previousValue: "\u20a9450M",
        reason: "Subscription plus enterprise revenue target aligned to June plan",
      },
    ],
    id: "mrr",
    lastUpdated: "2026-06-01",
    name: "Total Revenue",
    periodLabel: "June 2026",
    periodType: "Monthly",
    pinned: true,
    riskThreshold: 75,
    service: "Overall",
    showOnOverview: true,
    targetValue: 500000000,
    tone: "emerald",
    trend: { direction: "up", unit: "%", value: 6.1 },
  },
  {
    calculationType: "manual",
    currentValue: 2.1,
    description: "Subscription cancellation rate. Lower is healthier.",
    direction: "lower",
    displayOrder: 5,
    format: "percentage",
    history: [
      {
        changedBy,
        date: "2026-05-27",
        id: "kpi-history-churn-1",
        newValue: "3.0%",
        previousValue: "3.5%",
        reason: "Churn ceiling tightened after self-serve plan stabilization",
      },
    ],
    id: "churn-rate",
    lastUpdated: "2026-05-27",
    name: "Churn Rate",
    periodLabel: "June 2026",
    periodType: "Monthly",
    pinned: false,
    precision: 1,
    riskThreshold: 100,
    service: "Overall",
    showOnOverview: true,
    targetPrefix: "<",
    targetValue: 3,
    tone: "rose",
    trend: { direction: "down", unit: "pp", value: 0.6 },
  },
  {
    calculationType: "manual",
    currentValue: 18.4,
    description: "Signup to paid subscription conversion across self-serve plans.",
    direction: "higher",
    displayOrder: 6,
    format: "percentage",
    history: [
      {
        changedBy,
        date: "2026-05-20",
        id: "kpi-history-paid-conversion-1",
        newValue: "24.0%",
        previousValue: "21.0%",
        reason: "Self-serve conversion target raised for Q2 growth plan",
      },
    ],
    id: "paid-conversion-rate",
    lastUpdated: "2026-05-20",
    name: "Paid Conversion Rate",
    periodLabel: "June 2026",
    periodType: "Monthly",
    pinned: false,
    precision: 1,
    riskThreshold: 80,
    service: "Overall",
    showOnOverview: true,
    targetValue: 24,
    tone: "sky",
    trend: { direction: "up", unit: "pp", value: 1.1 },
  },
  {
    calculationType: "enterpriseRevenue",
    currentValue: 0,
    description: "Manual enterprise contract revenue from active contracts.",
    direction: "higher",
    displayOrder: 7,
    format: "currency",
    history: [
      {
        changedBy,
        date: "2026-05-18",
        id: "kpi-history-enterprise-revenue-1",
        newValue: "\u20a9200M",
        previousValue: "\u20a9150M",
        reason: "Enterprise sales forecast updated after contract pipeline review",
      },
    ],
    id: "enterprise-revenue",
    lastUpdated: "2026-05-18",
    name: "Enterprise Revenue",
    periodLabel: "June 2026",
    periodType: "Monthly",
    pinned: false,
    riskThreshold: 75,
    service: "Overall",
    showOnOverview: true,
    targetValue: 200000000,
    tone: "violet",
    trend: { direction: "up", unit: "%", value: 14.5 },
  },
  {
    calculationType: "manual",
    currentValue: 86000,
    description: "Average revenue per paying account.",
    direction: "higher",
    displayOrder: 8,
    format: "currency",
    history: [
      {
        changedBy,
        date: "2026-05-15",
        id: "kpi-history-arpu-1",
        newValue: "\u20a995,000",
        previousValue: "\u20a990,000",
        reason: "Plan mix target adjusted after premium tier review",
      },
    ],
    id: "arpu",
    lastUpdated: "2026-05-15",
    name: "ARPU",
    periodLabel: "June 2026",
    periodType: "Monthly",
    pinned: false,
    service: "Overall",
    showOnOverview: false,
    targetValue: 95000,
    tone: "emerald",
    trend: { direction: "up", unit: "%", value: 2.4 },
  },
  {
    calculationType: "manual",
    currentValue: 980000,
    description: "Estimated customer lifetime value.",
    direction: "higher",
    displayOrder: 9,
    format: "currency",
    history: [
      {
        changedBy,
        date: "2026-05-11",
        id: "kpi-history-ltv-1",
        newValue: "\u20a91,200,000",
        previousValue: "\u20a91,050,000",
        reason: "LTV model refreshed after retention cohort update",
      },
    ],
    id: "ltv",
    lastUpdated: "2026-05-11",
    name: "LTV",
    periodLabel: "Q2 2026",
    periodType: "Quarterly",
    pinned: false,
    service: "Overall",
    showOnOverview: false,
    targetValue: 1200000,
    tone: "amber",
    trend: { direction: "up", unit: "%", value: 3.7 },
  },
  {
    calculationType: "manual",
    currentValue: 152000,
    description: "Customer acquisition cost. Lower is healthier.",
    direction: "lower",
    displayOrder: 10,
    format: "currency",
    history: [
      {
        changedBy,
        date: "2026-05-07",
        id: "kpi-history-cac-1",
        newValue: "\u20a9140,000",
        previousValue: "\u20a9155,000",
        reason: "CAC ceiling lowered after paid channel optimization",
      },
    ],
    id: "cac",
    lastUpdated: "2026-05-07",
    name: "CAC",
    periodLabel: "Q2 2026",
    periodType: "Quarterly",
    pinned: false,
    riskThreshold: 95,
    service: "Overall",
    showOnOverview: false,
    targetValue: 140000,
    tone: "rose",
    trend: { direction: "down", unit: "%", value: 4.1 },
  },
]

export function createKpiId(name: string) {
  return `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${Date.now()}`
}

export function formatKpiValue(value: number, format: KpiFormat, precision = 0) {
  if (format === "currency") {
    if (value >= 100000000) {
      return `\u20a9${Math.round(value / 1000000).toLocaleString()}M`
    }

    return new Intl.NumberFormat("ko-KR", {
      currency: "KRW",
      maximumFractionDigits: 0,
      style: "currency",
    }).format(value)
  }

  if (format === "number") {
    return value.toLocaleString()
  }

  return `${value.toFixed(precision)}%`
}

export function formatKpiTarget(kpi: KpiConfiguration) {
  return `${kpi.targetPrefix ?? ""}${formatKpiValue(
    kpi.targetValue,
    kpi.format,
    kpi.precision
  )}`
}

export function formatTrend(trend: KpiTrend) {
  const sign = trend.direction === "up" ? "+" : "-"

  return `${sign}${trend.value}${trend.unit}`
}

export function getActiveEnterpriseRevenue(contracts: EnterpriseContract[]) {
  return contracts
    .filter((contract) => !contract.archived && contract.contractStatus === "Active")
    .reduce((total, contract) => total + contract.contractAmount, 0)
}

export function getKpiCurrentValue(
  kpi: KpiConfiguration,
  contracts: EnterpriseContract[]
) {
  const enterpriseRevenue = getActiveEnterpriseRevenue(contracts)

  if (kpi.calculationType === "enterpriseRevenue") {
    return enterpriseRevenue
  }

  if (kpi.calculationType === "totalRevenue") {
    return kpi.currentValue + enterpriseRevenue
  }

  return kpi.currentValue
}

export function getKpiProgress(
  kpi: KpiConfiguration,
  contracts: EnterpriseContract[]
) {
  const currentValue = getKpiCurrentValue(kpi, contracts)

  if (!kpi.targetValue || !currentValue) {
    return 0
  }

  if (kpi.direction === "lower") {
    return Math.min(100, Math.round((kpi.targetValue / currentValue) * 100))
  }

  return Math.min(100, Math.round((currentValue / kpi.targetValue) * 100))
}

export function getKpiStatus(
  kpi: KpiConfiguration,
  contracts: EnterpriseContract[]
) {
  const currentValue = getKpiCurrentValue(kpi, contracts)
  const progress = getKpiProgress(kpi, contracts)

  if (kpi.archived) {
    return "Archived"
  }

  if (kpi.direction === "lower" && currentValue <= kpi.targetValue) {
    return "Healthy"
  }

  if (kpi.direction === "higher" && currentValue >= kpi.targetValue) {
    return "Healthy"
  }

  if (progress >= (kpi.riskThreshold ?? 80)) {
    return "Watch"
  }

  return "At Risk"
}

export function isKpiAtRisk(
  kpi: KpiConfiguration,
  contracts: EnterpriseContract[]
) {
  return getKpiStatus(kpi, contracts) === "At Risk"
}

export function isTrendHealthy(kpi: KpiConfiguration) {
  if (kpi.direction === "lower") {
    return kpi.trend.direction === "down"
  }

  return kpi.trend.direction === "up"
}
