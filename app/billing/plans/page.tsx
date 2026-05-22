import AdminSectionPage from "@/components/layout/AdminSectionPage"

export default function BillingPlansPage() {
  return (
    <AdminSectionPage
      eyebrow="Billing"
      title="Plans"
      description="Manage commercial plan groups and product-specific plan configuration."
      metrics={[
        {
          label: "Plan Groups",
          value: "2",
          detail: "Yettey and Vpick",
        },
        {
          label: "Published Plans",
          value: "6",
          detail: "Mock pricing records",
        },
        {
          label: "Draft Changes",
          value: "1",
          detail: "Pending review",
        },
      ]}
    />
  )
}
