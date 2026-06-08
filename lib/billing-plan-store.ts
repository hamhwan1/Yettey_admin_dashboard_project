"use client"

import { useCallback, useSyncExternalStore } from "react"

import {
  type BillingPlan,
  type BillingPlanService,
  billingPlans,
  createLanguageData,
} from "@/lib/billing-plan-catalog"
import {
  type BillingPlanSaveMode,
  type BillingPlanValidationError,
} from "@/lib/billing-plan-validation"

const STORAGE_KEY = "yettey.billing-plans.v1"
const STORE_EVENT = "billing-plans:updated"

export const billingPlanOperator = "Sarah Mitchell"

type StoredPlanPayload = {
  plans: BillingPlan[]
  version: 1
}

type SaveBillingPlanResult =
  | {
      ok: true
      plan: BillingPlan
    }
  | {
      errors: BillingPlanValidationError[]
      message: string
      ok: false
    }

let cachedSnapshot: BillingPlan[] | undefined
let cachedSnapshotText = ""

export function useBillingPlanStore() {
  const plans = useSyncExternalStore(
    subscribeToBillingPlanStore,
    getBillingPlanSnapshot,
    getBillingPlanServerSnapshot
  )
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    getHydratedSnapshot,
    getHydratedServerSnapshot
  )

  const upsertPlan = useCallback(
    (plan: BillingPlan) => upsertStoredBillingPlan(plan),
    []
  )
  const savePlan = useCallback(
    (plan: BillingPlan, mode: BillingPlanSaveMode) =>
      saveBillingPlan(plan, mode),
    []
  )

  return { hydrated, plans, savePlan, upsertPlan }
}

export async function saveBillingPlan(
  plan: BillingPlan,
  mode: BillingPlanSaveMode
): Promise<SaveBillingPlanResult> {
  try {
    const response = await fetch("/api/billing/plans", {
      body: JSON.stringify({ mode, plan }),
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
      method: mode === "update" ? "PUT" : "POST",
    })
    const payload = (await parseJsonResponse(response)) as {
      errors?: BillingPlanValidationError[]
      message?: string
      plan?: BillingPlan
    }

    if (!response.ok) {
      return {
        errors: payload.errors ?? [],
        message: payload.message ?? "Plan save failed.",
        ok: false,
      }
    }

    if (!payload.plan) {
      return {
        errors: [],
        message: "Plan save response did not include a plan.",
        ok: false,
      }
    }

    return {
      ok: true,
      plan: upsertStoredBillingPlan(payload.plan),
    }
  } catch {
    return {
      errors: [],
      message: "Network error while saving plan.",
      ok: false,
    }
  }
}

function subscribeToBillingPlanStore(callback: () => void) {
  function handleStorage(event: StorageEvent) {
    if (event.key === STORAGE_KEY) {
      callback()
    }
  }

  window.addEventListener("storage", handleStorage)
  window.addEventListener(STORE_EVENT, callback)

  return () => {
    window.removeEventListener("storage", handleStorage)
    window.removeEventListener(STORE_EVENT, callback)
  }
}

function subscribeToHydration(callback: () => void) {
  queueMicrotask(callback)

  return () => {}
}

function getBillingPlanSnapshot() {
  const plans = readStoredBillingPlans()
  const snapshotText = JSON.stringify(plans)

  if (cachedSnapshot && cachedSnapshotText === snapshotText) {
    return cachedSnapshot
  }

  cachedSnapshot = plans
  cachedSnapshotText = snapshotText

  return plans
}

function getBillingPlanServerSnapshot() {
  return billingPlans
}

function getHydratedSnapshot() {
  return true
}

function getHydratedServerSnapshot() {
  return false
}

export function createUniqueBillingPlanSlug({
  currentSlug,
  name,
  plans,
  service,
}: {
  currentSlug?: string
  name: string
  plans: BillingPlan[]
  service: BillingPlanService
}) {
  const base = slugifyPlanName(name)
  let candidate = base
  let index = 2

  while (
    plans.some(
      (plan) =>
        plan.service === service &&
        plan.slug === candidate &&
        plan.slug !== currentSlug
    )
  ) {
    candidate = `${base}-${index}`
    index += 1
  }

  return candidate
}

export function createBillingPlanId(service: BillingPlanService) {
  return `plan_${service.toLowerCase()}_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 8)}`
}

export function createUniqueBillingPlanCopyName({
  name,
  plans,
  service,
}: {
  name: string
  plans: BillingPlan[]
  service: BillingPlanService
}) {
  const base = `${name} Copy`
  let candidate = base
  let index = 2

  while (
    plans.some((plan) => plan.service === service && plan.name === candidate)
  ) {
    candidate = `${base} ${index}`
    index += 1
  }

  return candidate
}

export function formatBillingPlanDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

export function formatBillingPlanTimestamp(date: Date) {
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")

  return `${formatBillingPlanDate(date)} ${hours}:${minutes}`
}

function readStoredBillingPlans() {
  if (typeof window === "undefined") {
    return clonePlans(billingPlans)
  }

  const stored = window.localStorage.getItem(STORAGE_KEY)

  if (!stored) {
    return clonePlans(billingPlans)
  }

  try {
    const parsed = JSON.parse(stored) as Partial<StoredPlanPayload>

    if (!Array.isArray(parsed.plans)) {
      return clonePlans(billingPlans)
    }

    return mergeCatalogWithStoredPlans(parsed.plans)
  } catch {
    return clonePlans(billingPlans)
  }
}

function writeStoredBillingPlans(plans: BillingPlan[]) {
  if (typeof window === "undefined") {
    return
  }

  const merged = mergeCatalogWithStoredPlans(plans)
  const payload: StoredPlanPayload = {
    plans: merged,
    version: 1,
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  window.dispatchEvent(new Event(STORE_EVENT))
}

function upsertStoredBillingPlan(plan: BillingPlan) {
  const current = readStoredBillingPlans()
  const index = current.findIndex(
    (item) =>
      item.id === plan.id ||
      (item.service === plan.service && item.slug === plan.slug)
  )
  const next =
    index >= 0
      ? current.map((item, itemIndex) => (itemIndex === index ? plan : item))
      : [...current, plan]

  writeStoredBillingPlans(next)

  return clonePlan(plan)
}

function mergeCatalogWithStoredPlans(storedPlans: BillingPlan[]) {
  const normalizedStoredPlans = dedupeStoredPlans(
    storedPlans.map((plan) => normalizePlan(plan))
  )
  const storedByKey = new Map<string, BillingPlan>()
  normalizedStoredPlans.forEach((normalized) => {
    storedByKey.set(getPlanKey(normalized), normalized)
    storedByKey.set(`${normalized.service}:${normalized.slug}`, normalized)
  })
  const merged = billingPlans.map((plan) => storedByKey.get(getPlanKey(plan)) ?? plan)
  const storedOnly = normalizedStoredPlans.filter(
    (plan) =>
      !billingPlans.some(
        (catalogPlan) =>
          catalogPlan.id === plan.id ||
          (catalogPlan.service === plan.service && catalogPlan.slug === plan.slug)
      )
  )

  return clonePlans([...merged, ...storedOnly])
}

function normalizePlan(plan: BillingPlan): BillingPlan {
  const catalogPlan = billingPlans.find(
    (item) =>
      item.id === plan.id ||
      (item.service === plan.service && item.slug === plan.slug)
  )
  const fallback = catalogPlan ?? billingPlans[0]
  const normalizedName = plan.name ?? fallback.name
  const normalizedDescription = plan.description ?? fallback.description

  return {
    ...fallback,
    ...plan,
    changeHistory: Array.isArray(plan.changeHistory)
      ? plan.changeHistory
      : fallback.changeHistory,
    features: Array.isArray(plan.features) ? plan.features : fallback.features,
    id: plan.id ?? fallback.id ?? createBillingPlanId(plan.service),
    languageData: normalizeLanguageData({
      catalogPlan,
      description: normalizedDescription,
      fallback,
      languageData: plan.languageData,
      name: normalizedName,
    }),
    updatedAt: plan.updatedAt ?? fallback.updatedAt ?? plan.createdAt,
  }
}

function dedupeStoredPlans(plans: BillingPlan[]) {
  const latestBySlug = new Map<
    string,
    {
      index: number
      plan: BillingPlan
    }
  >()

  plans.forEach((plan, index) => {
    const slugKey = `${plan.service}:${plan.slug}`
    const existing = latestBySlug.get(slugKey)

    if (
      !existing ||
      isPlanNewer({ index, plan }, existing)
    ) {
      latestBySlug.set(slugKey, { index, plan })
    }
  })

  return Array.from(latestBySlug.values()).map(({ plan }) => plan)
}

function isPlanNewer(
  candidate: { index: number; plan: BillingPlan },
  current: { index: number; plan: BillingPlan }
) {
  const candidateTime = getPlanTime(candidate.plan)
  const currentTime = getPlanTime(current.plan)

  if (candidateTime !== currentTime) {
    return candidateTime > currentTime
  }

  return candidate.index > current.index
}

function getPlanTime(plan: BillingPlan) {
  const timeSource =
    plan.updatedAt || plan.changeHistory?.[0]?.changedAt || plan.createdAt
  const parsed = Date.parse(timeSource.replace(" ", "T"))

  return Number.isFinite(parsed) ? parsed : 0
}

function normalizeLanguageData({
  catalogPlan,
  description,
  fallback,
  languageData,
  name,
}: {
  catalogPlan: BillingPlan | undefined
  description: string
  fallback: BillingPlan
  languageData: BillingPlan["languageData"] | undefined
  name: string
}) {
  if (catalogPlan) {
    return languageData ?? fallback.languageData ?? createLanguageData(name, description)
  }

  const generated = createLanguageData(name, description)
  const fallbackLanguageData =
    languageData ?? generated

  return {
    en: {
      description:
        fallbackLanguageData.en?.description &&
        fallbackLanguageData.en.description !== fallback.languageData.en.description
          ? fallbackLanguageData.en.description
          : generated.en.description,
      name:
        fallbackLanguageData.en?.name &&
        fallbackLanguageData.en.name !== fallback.languageData.en.name
          ? fallbackLanguageData.en.name
          : generated.en.name,
    },
    ko: {
      description:
        fallbackLanguageData.ko?.description &&
        fallbackLanguageData.ko.description !== fallback.languageData.ko.description
          ? fallbackLanguageData.ko.description
          : generated.ko.description,
      name:
        fallbackLanguageData.ko?.name &&
        fallbackLanguageData.ko.name !== fallback.languageData.ko.name
          ? fallbackLanguageData.ko.name
          : generated.ko.name,
    },
  }
}

async function parseJsonResponse(response: Response) {
  try {
    return await response.json()
  } catch {
    return {}
  }
}

function getPlanKey(plan: BillingPlan) {
  return plan.id ?? `${plan.service}:${plan.slug}`
}

function slugifyPlanName(name: string) {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

  return slug || "new-plan"
}

function clonePlans(plans: BillingPlan[]) {
  return plans.map(clonePlan)
}

function clonePlan(plan: BillingPlan) {
  return JSON.parse(JSON.stringify(plan)) as BillingPlan
}
