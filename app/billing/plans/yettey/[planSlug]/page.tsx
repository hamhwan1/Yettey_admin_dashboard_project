import { notFound } from "next/navigation"

import BillingPlanDetailClient from "@/components/billing/BillingPlanDetailClient"
import {
  getBillingPlanBySlug,
  getBillingPlansByService,
} from "@/lib/billing-plan-catalog"

export function generateStaticParams() {
  return getBillingPlansByService("Yettey").map((plan) => ({
    planSlug: plan.slug,
  }))
}

export default async function YetteyPlanDetailPage({
  params,
}: {
  params: Promise<{ planSlug: string }>
}) {
  const { planSlug } = await params
  const plan = getBillingPlanBySlug("Yettey", planSlug)

  if (!plan) {
    notFound()
  }

  return <BillingPlanDetailClient mode="edit" plan={plan} service="Yettey" />
}
