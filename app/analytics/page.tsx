import AdminSectionPage from "@/components/layout/AdminSectionPage"

export default function AnalyticsPage() {
  return (
    <AdminSectionPage
      eyebrow="Analytics"
      title="Overview"
      description="Temporary analytics navigation surface for traffic, product usage, conversion, and operational reporting."
      metrics={[
        {
          label: "Visitors",
          value: "42.8K",
          detail: "Mock monthly sessions",
        },
        {
          label: "Conversion",
          value: "6.4%",
          detail: "Trial to paid",
        },
        {
          label: "Reports",
          value: "4",
          detail: "Pending setup",
        },
      ]}
    />
  )
}
