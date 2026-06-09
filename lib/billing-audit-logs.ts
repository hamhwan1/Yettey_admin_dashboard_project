export type BillingAuditLog = {
  action: string
  actor: string
  createdAt: string
  details: string
  id: string
  scope: string
}

const STORAGE_KEY = "yettey.billing-audit-logs.v1"
const STORE_EVENT = "billing-audit-logs:updated"

export const billingAuditLogOperator = "Sarah Mitchell"

export const defaultBillingAuditLogs: BillingAuditLog[] = [
  {
    action: "Admin updated Billing Rules",
    actor: "Sarah Mitchell",
    createdAt: "2026-06-08 10:22",
    details: "Initial billing policy configuration reviewed.",
    id: "billing_log_rules_initial",
    scope: "Billing Rules",
  },
  {
    action: "Plan lifecycle updated",
    actor: "Ham Hwan",
    createdAt: "2026-06-08 13:22",
    details: "Plan status and pricing policy were updated.",
    id: "billing_log_plan_lifecycle",
    scope: "Plans",
  },
]

export function appendBillingAuditLog(log: Omit<BillingAuditLog, "id">) {
  if (typeof window === "undefined") {
    return
  }

  const nextLogs = [
    {
      ...log,
      id: `billing_log_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    },
    ...readBillingAuditLogs(),
  ]

  writeBillingAuditLogs(nextLogs)
}

export function readBillingAuditLogs() {
  if (typeof window === "undefined") {
    return defaultBillingAuditLogs
  }

  const stored = window.localStorage.getItem(STORAGE_KEY)

  if (!stored) {
    return defaultBillingAuditLogs
  }

  try {
    const parsed = JSON.parse(stored) as { logs?: BillingAuditLog[] }

    if (Array.isArray(parsed.logs)) {
      return parsed.logs
    }
  } catch {
    return defaultBillingAuditLogs
  }

  return defaultBillingAuditLogs
}

export function subscribeToBillingAuditLogs(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {}
  }

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

function writeBillingAuditLogs(logs: BillingAuditLog[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ logs, version: 1 }))
  window.dispatchEvent(new Event(STORE_EVENT))
}
