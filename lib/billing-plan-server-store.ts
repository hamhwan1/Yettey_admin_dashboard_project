import {
  type BillingPlan,
  billingPlans,
} from "@/lib/billing-plan-catalog"

let savedPlans = clonePlans(billingPlans)

export function listBillingPlansFromServerStore() {
  return clonePlans(savedPlans)
}

export function saveBillingPlanToServerStore(plan: BillingPlan) {
  const index = savedPlans.findIndex(
    (item) =>
      item.id === plan.id ||
      (item.service === plan.service && item.slug === plan.slug)
  )

  savedPlans =
    index >= 0
      ? savedPlans.map((item, itemIndex) =>
          itemIndex === index ? clonePlan(plan) : item
        )
      : [...savedPlans, clonePlan(plan)]

  return clonePlan(plan)
}

function clonePlans(plans: BillingPlan[]) {
  return plans.map(clonePlan)
}

function clonePlan(plan: BillingPlan) {
  return JSON.parse(JSON.stringify(plan)) as BillingPlan
}
