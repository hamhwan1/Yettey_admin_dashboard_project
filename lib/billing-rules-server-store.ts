import {
  type BillingRules,
  defaultBillingRules,
  normalizeBillingRules,
} from "@/lib/billing-rules"

let savedBillingRules = normalizeBillingRules(defaultBillingRules)

export function getBillingRulesFromServerStore() {
  return cloneRules(savedBillingRules)
}

export function saveBillingRulesToServerStore(rules: Partial<BillingRules>) {
  savedBillingRules = normalizeBillingRules(rules)

  return cloneRules(savedBillingRules)
}

function cloneRules(rules: BillingRules) {
  return JSON.parse(JSON.stringify(rules)) as BillingRules
}
