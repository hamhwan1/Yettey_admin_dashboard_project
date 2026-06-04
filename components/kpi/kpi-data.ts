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

export type EnterpriseContract = {
  companyName: string
  contractAmount: number
  contractEndDate: string
  contractStartDate: string
  contractStatus: EnterpriseContractStatus
  id: string
  notes: string
}

export type KpiConfiguration = {
  calculationType: KpiCalculationType
  currentValue: number
  description: string
  direction: KpiDirection
  displayOrder: number
  format: KpiFormat
  id: string
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

export const initialEnterpriseContracts: EnterpriseContract[] = [
  {
    companyName: "Blue Ocean Studios",
    contractAmount: 90000000,
    contractEndDate: "2026-12-31",
    contractStartDate: "2026-01-01",
    contractStatus: "Active",
    id: "enterprise-blue-ocean",
    notes: "Annual creator workflow contract, recognized in monthly enterprise revenue.",
  },
  {
    companyName: "Nova Media Group",
    contractAmount: 80000000,
    contractEndDate: "2026-09-30",
    contractStartDate: "2026-04-01",
    contractStatus: "Active",
    id: "enterprise-nova-media",
    notes: "VPICK enterprise package with dedicated onboarding support.",
  },
  {
    companyName: "Han River Commerce",
    contractAmount: 45000000,
    contractEndDate: "2026-08-31",
    contractStartDate: "2026-06-15",
    contractStatus: "Pending",
    id: "enterprise-han-river",
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
    id: "signup-conversion-rate",
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
    id: "activation-rate",
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
    id: "d30-retention",
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
    description: "Total recurring revenue combining subscription revenue and active enterprise contracts.",
    direction: "higher",
    displayOrder: 4,
    format: "currency",
    id: "mrr",
    name: "MRR",
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
    id: "churn-rate",
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
    id: "paid-conversion-rate",
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
    id: "enterprise-revenue",
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
    id: "arpu",
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
    id: "ltv",
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
    id: "cac",
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
    .filter((contract) => contract.contractStatus === "Active")
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
