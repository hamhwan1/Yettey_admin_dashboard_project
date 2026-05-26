import IntelligenceDashboard from "@/components/intelligence/IntelligenceDashboard"

export default async function AcquisitionChannelPage({
  params,
}: {
  params: Promise<{ channel: string }>
}) {
  const { channel } = await params

  return (
    <IntelligenceDashboard
      dashboardKey="visitors"
      focusLabel={toTitle(channel)}
      focusType="Channel"
    />
  )
}

function toTitle(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}
