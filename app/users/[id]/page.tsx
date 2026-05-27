import AdminSectionPage from "@/components/layout/AdminSectionPage"

const userDetails: Record<
  string,
  {
    email: string
    lastActive: string
    name: string
    plan: string
    status: string
    userType: string
    workspace: string
  }
> = {
  usr_1001: {
    email: "mina.park@studioalpha.co",
    lastActive: "May 27, 2026",
    name: "Mina Park",
    plan: "Growth",
    status: "Active",
    userType: "YETTEY",
    workspace: "Studio Alpha",
  },
  usr_1002: {
    email: "jun.choi@creatorpack.io",
    lastActive: "May 27, 2026",
    name: "Jun Choi",
    plan: "Professional",
    status: "Trial",
    userType: "VPICK",
    workspace: "Creator Pack",
  },
  usr_1003: {
    email: "sarah.kim@cloudike.io",
    lastActive: "May 26, 2026",
    name: "Sarah Kim",
    plan: "Pro",
    status: "Active",
    userType: "YETTEY",
    workspace: "Cloudike Team",
  },
}

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = userDetails[id] ?? {
    email: `${id}@example.com`,
    lastActive: "May 27, 2026",
    name: "Mock User",
    plan: "Free",
    status: "Active",
    userType: "YETTEY",
    workspace: "Mock Workspace",
  }

  return (
    <AdminSectionPage
      eyebrow="Users"
      title={user.name}
      description={`${user.email} / ${user.workspace}`}
      metrics={[
        {
          label: "User ID",
          value: id,
          detail: user.status,
        },
        {
          label: "Current Plan",
          value: user.plan,
          detail: user.userType,
        },
        {
          label: "Last Active",
          value: user.lastActive,
          detail: user.workspace,
        },
      ]}
    />
  )
}
