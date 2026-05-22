import AdminSectionPage from "@/components/layout/AdminSectionPage"

export default function UserDetailPage() {
  return (
    <AdminSectionPage
      eyebrow="Users"
      title="User Detail"
      description="Inspect an individual user profile, plan assignment, content activity, and account status."
      metrics={[
        {
          label: "Selected User",
          value: "Mina Park",
          detail: "Mock profile",
        },
        {
          label: "Current Plan",
          value: "Enterprise",
          detail: "Yettey workspace",
        },
        {
          label: "Monthly Usage",
          value: "84%",
          detail: "Media capacity",
        },
      ]}
    />
  )
}
