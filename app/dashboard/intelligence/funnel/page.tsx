import IntelligenceDashboard from "@/components/intelligence/IntelligenceDashboard"

export default function FunnelIntelligencePage() {
  return (
    <IntelligenceDashboard
      dashboardKey="subscriptions"
      focusLabel="Advanced Funnel"
      focusType="Funnel Stage"
    />
  )
}
