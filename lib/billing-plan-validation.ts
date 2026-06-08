import {
  type BillingPlan,
  type BillingPlanEffectiveMode,
  type BillingPlanFeature,
  type BillingPlanService,
  type BillingPlanStatus,
  type BillingPlanType,
  billingPlanFeatures,
  billingPlanStatuses,
  billingPlanTypes,
} from "@/lib/billing-plan-catalog"

export type BillingPlanSaveMode = "create" | "duplicate" | "update"

export type BillingPlanValidationError = {
  field: string
  message: string
}

const billingPlanServices: BillingPlanService[] = ["Yettey", "Vpick"]
const billingPlanEffectiveModes: BillingPlanEffectiveMode[] = [
  "Immediately",
  "Scheduled",
]

export function validateBillingPlan(
  plan: Partial<BillingPlan> | null | undefined
) {
  const errors: BillingPlanValidationError[] = []

  if (!plan || typeof plan !== "object") {
    return {
      ok: false,
      errors: [
        {
          field: "plan",
          message: "Plan data is required.",
        },
      ],
    }
  }

  validateText(errors, plan.id, "id", "Plan ID is required.")
  validateText(errors, plan.name, "name", "Plan name is required.")
  validateText(
    errors,
    plan.description,
    "description",
    "Description is required."
  )
  validateText(errors, plan.slug, "slug", "Plan slug is required.")
  validateText(errors, plan.createdAt, "createdAt", "Created date is required.")
  validateText(errors, plan.updatedAt, "updatedAt", "Updated date is required.")
  validateText(
    errors,
    plan.effectiveDate,
    "effectiveDate",
    "Effective date is required."
  )
  validateText(
    errors,
    plan.salesStartAt,
    "salesStartAt",
    "Sales start date is required."
  )
  validateText(
    errors,
    plan.salesEndAt,
    "salesEndAt",
    "Sales end date is required."
  )

  if (!billingPlanServices.includes(plan.service as BillingPlanService)) {
    errors.push({
      field: "service",
      message: "Service must be Yettey or Vpick.",
    })
  }

  if (!billingPlanTypes.includes(plan.type as BillingPlanType)) {
    errors.push({
      field: "type",
      message: "Plan type must be Subscription or Credit Pack.",
    })
  }

  if (!billingPlanStatuses.includes(plan.status as BillingPlanStatus)) {
    errors.push({
      field: "status",
      message: "Status must be Draft, Active, or Inactive.",
    })
  }

  if (
    !billingPlanEffectiveModes.includes(
      plan.applyMode as BillingPlanEffectiveMode
    )
  ) {
    errors.push({
      field: "applyMode",
      message: "Apply mode must be Immediately or Scheduled.",
    })
  }

  validateNumber(errors, plan.monthlyPrice, "monthlyPrice", "Monthly price")
  validateNumber(errors, plan.annualPrice, "annualPrice", "Annual price")
  validateNumber(errors, plan.credits, "credits", "Credits")
  validateNumber(errors, plan.projects, "projects", "Projects")
  validateNumber(errors, plan.users, "users", "Users")
  validateNumber(errors, plan.storage, "storage", "Storage")
  validateNumber(errors, plan.uploadMinutes, "uploadMinutes", "Upload minutes")
  validateNumber(
    errors,
    plan.shortformGeneration,
    "shortformGeneration",
    "Shortform generation"
  )
  validateNumber(
    errors,
    plan.downloadTraffic,
    "downloadTraffic",
    "Download traffic"
  )
  validateNumber(
    errors,
    plan.creditExpirationDays,
    "creditExpirationDays",
    "Credit expiration"
  )
  validateNumber(errors, plan.freeTrialDays, "freeTrialDays", "Free trial")
  validateNumber(errors, plan.displayOrder, "displayOrder", "Display order")

  if (!plan.languageData?.ko?.name?.trim()) {
    errors.push({
      field: "languageData.ko.name",
      message: "Korean plan name is required.",
    })
  }

  if (!plan.languageData?.ko?.description?.trim()) {
    errors.push({
      field: "languageData.ko.description",
      message: "Korean description is required.",
    })
  }

  if (!plan.languageData?.en?.name?.trim()) {
    errors.push({
      field: "languageData.en.name",
      message: "English plan name is required.",
    })
  }

  if (!plan.languageData?.en?.description?.trim()) {
    errors.push({
      field: "languageData.en.description",
      message: "English description is required.",
    })
  }

  if (!Array.isArray(plan.features)) {
    errors.push({
      field: "features",
      message: "Feature settings are required.",
    })
  } else {
    const invalidFeature = plan.features.find(
      (feature) => !billingPlanFeatures.includes(feature as BillingPlanFeature)
    )

    if (invalidFeature) {
      errors.push({
        field: "features",
        message: `Unknown feature: ${invalidFeature}.`,
      })
    }
  }

  if (!Array.isArray(plan.changeHistory)) {
    errors.push({
      field: "changeHistory",
      message: "Change history must be an array.",
    })
  }

  return {
    ok: errors.length === 0,
    errors,
  }
}

function validateText(
  errors: BillingPlanValidationError[],
  value: unknown,
  field: string,
  message: string
) {
  if (typeof value !== "string" || !value.trim()) {
    errors.push({ field, message })
  }
}

function validateNumber(
  errors: BillingPlanValidationError[],
  value: unknown,
  field: string,
  label: string
) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    errors.push({
      field,
      message: `${label} must be a number greater than or equal to 0.`,
    })
  }
}
