"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export type DashboardService = "Overall" | "Yettey" | "VPICK"

export const serviceOptions: DashboardService[] = ["Overall", "Yettey", "VPICK"]

type DashboardServiceState = {
  service: DashboardService
  setService: (service: DashboardService) => void
  resetService: () => void
}

export const useDashboardServiceFilter = create<DashboardServiceState>()(
  persist(
    (set) => ({
      service: "Overall",
      setService: (service) => set({ service }),
      resetService: () => set({ service: "Overall" }),
    }),
    {
      name: "yettey-dashboard-service-filter",
      partialize: (state) => ({ service: state.service }),
    }
  )
)
