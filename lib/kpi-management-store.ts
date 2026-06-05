"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

import {
  formatKpiTarget,
  formatKpiValue,
  initialEnterpriseContracts,
  initialKpiConfigurations,
  type ContractHistoryRecord,
  type EnterpriseContract,
  type KpiConfiguration,
  type KpiHistoryRecord,
} from "@/components/kpi/kpi-data"

const mockChangedBy = "Ham Hwan"
const mockToday = "2026-06-04"

const legacyDefaultKpiOrders = new Map([
  ["signup-conversion-rate", 1],
  ["activation-rate", 2],
  ["d30-retention", 3],
  ["mrr", 4],
  ["churn-rate", 5],
  ["paid-conversion-rate", 6],
  ["enterprise-revenue", 7],
  ["arpu", 8],
  ["ltv", 9],
  ["cac", 10],
])

type KpiManagementState = {
  contracts: EnterpriseContract[]
  kpis: KpiConfiguration[]
  addContract: (contract: EnterpriseContract) => void
  addKpi: (kpi: KpiConfiguration) => void
  archiveContract: (contractId: string) => void
  archiveKpi: (kpiId: string) => void
  resetKpiManagement: () => void
  restoreContract: (contractId: string) => void
  restoreKpi: (kpiId: string) => void
  updateContract: (
    contractId: string,
    patch: Partial<EnterpriseContract>
  ) => void
  updateKpi: (
    kpiId: string,
    patch: Partial<KpiConfiguration>,
    reason?: string
  ) => void
}

export const useKpiManagementStore = create<KpiManagementState>()(
  persist(
    (set) => ({
      contracts: initialEnterpriseContracts,
      kpis: initialKpiConfigurations,
      addContract: (contract) =>
        set((state) => ({
          contracts: [normalizeContract(contract), ...state.contracts],
        })),
      addKpi: (kpi) =>
        set((state) => ({ kpis: [normalizeKpi(kpi), ...state.kpis] })),
      archiveContract: (contractId) =>
        set((state) => ({
          contracts: state.contracts.map((contract) => {
            if (contract.id !== contractId) {
              return contract
            }

            const previousValue = contract.archived ? "Archived" : "Active"

            return {
              ...contract,
              archived: true,
              history: [
                createContractHistory("Archive Status", previousValue, "Archived"),
                ...(contract.history ?? []),
              ],
              lastUpdated: mockToday,
            }
          }),
        })),
      archiveKpi: (kpiId) =>
        set((state) => ({
          kpis: state.kpis.map((kpi) => {
            if (kpi.id !== kpiId) {
              return kpi
            }

            return {
              ...kpi,
              archived: true,
              history: [
                createKpiHistory(
                  formatKpiTarget(kpi),
                  "Archived",
                  "KPI archived from active management"
                ),
                ...(kpi.history ?? []),
              ],
              lastUpdated: mockToday,
            }
          }),
        })),
      resetKpiManagement: () =>
        set({
          contracts: initialEnterpriseContracts,
          kpis: initialKpiConfigurations,
        }),
      restoreContract: (contractId) =>
        set((state) => ({
          contracts: state.contracts.map((contract) => {
            if (contract.id !== contractId) {
              return contract
            }

            return {
              ...contract,
              archived: false,
              history: [
                createContractHistory("Archive Status", "Archived", "Active"),
                ...(contract.history ?? []),
              ],
              lastUpdated: mockToday,
            }
          }),
        })),
      restoreKpi: (kpiId) =>
        set((state) => ({
          kpis: state.kpis.map((kpi) => {
            if (kpi.id !== kpiId) {
              return kpi
            }

            return {
              ...kpi,
              archived: false,
              history: [
                createKpiHistory(
                  "Archived",
                  formatKpiTarget(kpi),
                  "KPI restored to active management"
                ),
                ...(kpi.history ?? []),
              ],
              lastUpdated: mockToday,
            }
          }),
        })),
      updateContract: (contractId, patch) =>
        set((state) => ({
          contracts: state.contracts.map((contract) => {
            if (contract.id !== contractId) {
              return contract
            }

            const nextContract = normalizeContract({
              ...contract,
              ...patch,
              lastUpdated: mockToday,
            })
            const history = createContractHistories(contract, nextContract)

            return {
              ...nextContract,
              history: [...history, ...(contract.history ?? [])],
            }
          }),
        })),
      updateKpi: (kpiId, patch, reason = "KPI target updated by administrator") =>
        set((state) => ({
          kpis: state.kpis.map((kpi) => {
            if (kpi.id !== kpiId) {
              return kpi
            }

            const nextKpi = normalizeKpi({ ...kpi, ...patch, lastUpdated: mockToday })
            const targetChanged = kpi.targetValue !== nextKpi.targetValue
            const nextHistory = targetChanged
              ? [
                  createKpiHistory(
                    formatKpiTarget(kpi),
                    formatKpiTarget(nextKpi),
                    reason
                  ),
                  ...(kpi.history ?? []),
                ]
              : kpi.history ?? []

            return {
              ...nextKpi,
              history: nextHistory,
            }
          }),
        })),
    }),
    {
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<KpiManagementState> | undefined

        return {
          ...currentState,
          ...persisted,
          contracts: (persisted?.contracts ?? currentState.contracts).map(
            normalizeContract
          ),
          kpis: mergeKpisWithInitialDefaults(
            persisted?.kpis ?? currentState.kpis
          ),
        }
      },
      name: "yettey-kpi-management",
      partialize: (state) => ({
        contracts: state.contracts,
        kpis: state.kpis,
      }),
      version: 2,
    }
  )
)

function createContractHistories(
  previous: EnterpriseContract,
  next: EnterpriseContract
) {
  const changes: ContractHistoryRecord[] = []
  const trackedFields: Array<{
    field: string
    format: (contract: EnterpriseContract) => string
    key: keyof EnterpriseContract
  }> = [
    {
      field: "Company Name",
      format: (contract) => contract.companyName,
      key: "companyName",
    },
    {
      field: "Contract Amount",
      format: (contract) => formatKpiValue(contract.contractAmount, "currency"),
      key: "contractAmount",
    },
    {
      field: "Start Date",
      format: (contract) => contract.contractStartDate,
      key: "contractStartDate",
    },
    {
      field: "End Date",
      format: (contract) => contract.contractEndDate,
      key: "contractEndDate",
    },
    {
      field: "Status",
      format: (contract) => contract.contractStatus,
      key: "contractStatus",
    },
    {
      field: "Notes",
      format: (contract) => contract.notes,
      key: "notes",
    },
  ]

  trackedFields.forEach(({ field, format, key }) => {
    if (previous[key] !== next[key]) {
      changes.push(createContractHistory(field, format(previous), format(next)))
    }
  })

  return changes
}

function createContractHistory(
  field: string,
  previousValue: string,
  newValue: string
): ContractHistoryRecord {
  return {
    changedBy: mockChangedBy,
    date: mockToday,
    field,
    id: `contract-history-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    newValue,
    previousValue,
  }
}

function createKpiHistory(
  previousValue: string,
  newValue: string,
  reason: string
): KpiHistoryRecord {
  return {
    changedBy: mockChangedBy,
    date: mockToday,
    id: `kpi-history-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    newValue,
    previousValue,
    reason,
  }
}

function normalizeContract(contract: EnterpriseContract): EnterpriseContract {
  return {
    ...contract,
    archived: contract.archived ?? false,
    history: contract.history ?? [],
    lastUpdated: contract.lastUpdated ?? mockToday,
  }
}

function normalizeKpi(kpi: KpiConfiguration): KpiConfiguration {
  return {
    ...kpi,
    archived: kpi.archived ?? false,
    history: kpi.history ?? [],
    lastUpdated: kpi.lastUpdated ?? mockToday,
    representative: kpi.representative ?? kpi.pinned ?? false,
    targetPrefix: kpi.direction === "lower" ? "<" : undefined,
  }
}

function mergeKpisWithInitialDefaults(kpis: KpiConfiguration[]) {
  const normalizedKpis = kpis
    .map(normalizeKpi)
    .filter((kpi) => kpi.service !== "Overall")
  const adoptUpdatedDefaultOrder = usesLegacyDefaultKpiOrder(normalizedKpis)
  const usedKpiIds = new Set<string>()

  const defaultKpis = initialKpiConfigurations.map((defaultKpi) => {
    const existingKpi = normalizedKpis.find(
      (kpi) =>
        kpi.id === defaultKpi.id ||
        (normalizeKpiName(kpi.name) === normalizeKpiName(defaultKpi.name) &&
          kpi.service === defaultKpi.service)
    )

    if (!existingKpi) {
      return normalizeKpi(defaultKpi)
    }

    usedKpiIds.add(existingKpi.id)

    if (adoptUpdatedDefaultOrder && legacyDefaultKpiOrders.has(existingKpi.id)) {
      return normalizeKpi({
        ...existingKpi,
        displayOrder: defaultKpi.displayOrder,
      })
    }

    return existingKpi
  })

  const customKpis = normalizedKpis.filter((kpi) => !usedKpiIds.has(kpi.id))

  return [...defaultKpis, ...customKpis]
}

function usesLegacyDefaultKpiOrder(kpis: KpiConfiguration[]) {
  const hasVisitors = kpis.some(
    (kpi) => normalizeKpiName(kpi.name) === "visitors"
  )

  if (hasVisitors) {
    return false
  }

  return kpis.every((kpi) => {
    const legacyOrder = legacyDefaultKpiOrders.get(kpi.id)

    return legacyOrder === undefined || kpi.displayOrder === legacyOrder
  })
}

function normalizeKpiName(name: string) {
  return name.trim().toLowerCase()
}
