export type ProductService = "Yettey" | "VPICK"

export type CurrentPlanName =
  | "Starter"
  | "Growth"
  | "Pro"
  | "Basic"
  | "Professional"

export type CurrentPlan = {
  credits: string
  limits: string[]
  name: CurrentPlanName
  price: number
  priceLabel: string
  product: ProductService
}

export const currentPlans: CurrentPlan[] = [
  {
    credits: "1,800 credits",
    limits: ["4 projects", "2 users"],
    name: "Starter",
    price: 49000,
    priceLabel: `${formatKrw(49000)} / mo`,
    product: "Yettey",
  },
  {
    credits: "4,000 credits",
    limits: ["10 projects", "3 users"],
    name: "Growth",
    price: 99000,
    priceLabel: `${formatKrw(99000)} / mo`,
    product: "Yettey",
  },
  {
    credits: "11,000 credits",
    limits: ["Unlimited projects", "10 users"],
    name: "Pro",
    price: 249000,
    priceLabel: `${formatKrw(249000)} / mo`,
    product: "Yettey",
  },
  {
    credits: "900 credits",
    limits: [
      "60 min video analysis and shortform generation",
      "20GB storage",
      "10GB download traffic",
      "10 projects",
    ],
    name: "Basic",
    price: 20000,
    priceLabel: `${formatKrw(20000)} / mo, VAT included`,
    product: "VPICK",
  },
  {
    credits: "1,900 credits",
    limits: [
      "Basic upper-tier mock plan",
      "150 min video analysis and shortform generation",
      "80GB storage",
      "40GB download traffic",
      "30 projects",
    ],
    name: "Professional",
    price: 40000,
    priceLabel: `${formatKrw(40000)} / mo, VAT included`,
    product: "VPICK",
  },
]

export const planPrices = currentPlans.reduce(
  (acc, plan) => ({
    ...acc,
    [plan.name]: plan.price,
  }),
  {} as Record<CurrentPlanName, number>
)

export const planProducts = currentPlans.reduce(
  (acc, plan) => ({
    ...acc,
    [plan.name]: plan.product,
  }),
  {} as Record<CurrentPlanName, ProductService>
)

export function getPlansByProduct(product: ProductService) {
  return currentPlans.filter((plan) => plan.product === product)
}

export function getPlanPrice(plan: CurrentPlanName) {
  return planPrices[plan]
}

export function formatKrw(value: number) {
  return new Intl.NumberFormat("ko-KR", {
    currency: "KRW",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value)
}
