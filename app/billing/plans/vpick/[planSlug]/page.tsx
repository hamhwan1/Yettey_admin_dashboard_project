import BillingPlanDetailClient from "@/components/billing/BillingPlanDetailClient"
import {
  getBillingPlanBySlug,
  getBillingPlansByService,
} from "@/lib/billing-plan-catalog"

export function generateStaticParams() {
  return getBillingPlansByService("Vpick").map((plan) => ({
    planSlug: plan.slug,
  }))
}

export default async function VpickPlanDetailPage({
  params,
}: {
  params: Promise<{ planSlug: string }>
}) {
  const { planSlug } = await params
  const plan = getBillingPlanBySlug("Vpick", planSlug)

  return (
    <BillingPlanDetailClient
      mode="edit"
      plan={plan}
      planSlug={planSlug}
      service="Vpick"
    />
  )
}
