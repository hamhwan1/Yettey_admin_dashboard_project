"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

import {
  initialEnterpriseContracts,
  initialKpiConfigurations,
  type EnterpriseContract,
  type KpiConfiguration,
} from "@/components/kpi/kpi-data"

type KpiManagementState = {
  contracts: EnterpriseContract[]
  kpis: KpiConfiguration[]
  addContract: (contract: EnterpriseContract) => void
  addKpi: (kpi: KpiConfiguration) => void
  deleteContract: (contractId: string) => void
  deleteKpi: (kpiId: string) => void
  resetKpiManagement: () => void
  updateContract: (contractId: string, patch: Partial<EnterpriseContract>) => void
  updateKpi: (kpiId: string, patch: Partial<KpiConfiguration>) => void
}

export const useKpiManagementStore = create<KpiManagementState>()(
  persist(
    (set) => ({
      contracts: initialEnterpriseContracts,
      kpis: initialKpiConfigurations,
      addContract: (contract) =>
        set((state) => ({ contracts: [contract, ...state.contracts] })),
      addKpi: (kpi) => set((state) => ({ kpis: [kpi, ...state.kpis] })),
      deleteContract: (contractId) =>
        set((state) => ({
          contracts: state.contracts.filter((contract) => contract.id !== contractId),
        })),
      deleteKpi: (kpiId) =>
        set((state) => ({
          kpis: state.kpis.filter((kpi) => kpi.id !== kpiId),
        })),
      resetKpiManagement: () =>
        set({
          contracts: initialEnterpriseContracts,
          kpis: initialKpiConfigurations,
        }),
      updateContract: (contractId, patch) =>
        set((state) => ({
          contracts: state.contracts.map((contract) =>
            contract.id === contractId ? { ...contract, ...patch } : contract
          ),
        })),
      updateKpi: (kpiId, patch) =>
        set((state) => ({
          kpis: state.kpis.map((kpi) =>
            kpi.id === kpiId ? { ...kpi, ...patch } : kpi
          ),
        })),
    }),
    {
      name: "yettey-kpi-management",
      partialize: (state) => ({
        contracts: state.contracts,
        kpis: state.kpis,
      }),
    }
  )
)
