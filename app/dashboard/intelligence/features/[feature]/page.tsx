import IntelligenceDashboard from "@/components/intelligence/IntelligenceDashboard"

export default async function FeatureIntelligencePage({
  params,
}: {
  params: Promise<{ feature: string }>
}) {
  const { feature } = await params

  return (
    <IntelligenceDashboard
      dashboardKey="retention"
      focusLabel={toTitle(feature)}
      focusType="Feature"
    />
  )
}

function toTitle(value: string) {
  return value
    .split("-")
    .map((part) => part.toUpperCase() === "ai" ? "AI" : part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}
