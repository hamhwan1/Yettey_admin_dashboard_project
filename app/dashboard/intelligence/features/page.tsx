import IntelligenceDashboard from "@/components/intelligence/IntelligenceDashboard"

export default function FeatureIntelligenceIndexPage() {
  return (
    <IntelligenceDashboard
      dashboardKey="retention"
      focusLabel="All Features"
      focusType="Feature"
    />
  )
}
