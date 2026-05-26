"use client"

import { Plus } from "lucide-react"
import { useMemo, useState } from "react"

import AdminButton from "@/components/admin/AdminButton"
import DataTable, { type DataTableColumn } from "@/components/admin/DataTable"
import DateRangeControl from "@/components/admin/DateRangeControl"
import ExportActions from "@/components/admin/ExportActions"
import PageHeader from "@/components/admin/PageHeader"
import SideDrawer from "@/components/admin/SideDrawer"
import StatCard from "@/components/admin/StatCard"
import StatusBadge from "@/components/admin/StatusBadge"
import DashboardLayout from "@/components/layout/DashboardLayout"
import {
  getCompareModeLabel,
  getDateRangeLabel,
  useDashboardDateRange,
} from "@/lib/dashboard-date-store"
import { cn } from "@/lib/utils"

const users = [
  {
    email: "admin1@cloudike.io",
    name: "Name",
    userType: "Vpick",
    status: "Active",
    plan: "Free",
    created: "2026-03-04T13:20",
    lastActive: "2026-03-04T13:20",
  },
  {
    email: "admin2@cloudike.io",
    name: "Name",
    userType: "Vpick",
    status: "Active",
    plan: "Free",
    created: "2026-03-04T13:20",
    lastActive: "2026-03-04T13:20",
  },
  {
    email: "admin3@cloudike.io",
    name: "Name",
    userType: "Yettey",
    status: "Active",
    plan: "Starter",
    created: "2026-03-04T13:20",
    lastActive: "2026-03-04T13:20",
  },
  {
    email: "admin4@cloudike.io",
    name: "Name",
    userType: "Yettey",
    status: "Blocked",
    plan: "Growth",
    created: "2026-03-04T13:20",
    lastActive: "2026-03-04T13:20",
  },
  {
    email: "admin5@cloudike.io",
    name: "Name",
    userType: "Yettey",
    status: "Active",
    plan: "Pro",
    created: "2026-03-04T13:20",
    lastActive: "2026-03-04T13:20",
  },
]

type User = (typeof users)[number]

const columns: DataTableColumn<User>[] = [
  {
    key: "email",
    header: "Email",
    render: (user) => (
      <div className="flex items-center gap-3">
        <span className="size-6 rounded-md bg-[radial-gradient(circle_at_1px_1px,#e2e8f0_1px,transparent_0)] [background-size:4px_4px]" />
        <span className="text-slate-600">{user.email}</span>
      </div>
    ),
  },
  {
    key: "name",
    header: "Name",
    render: (user) => user.name,
  },
  {
    key: "userType",
    header: "User Type",
    render: (user) => user.userType,
  },
  {
    key: "status",
    header: "Status",
    render: (user) => (
      <StatusBadge tone={user.status === "Active" ? "success" : "neutral"}>
        {user.status}
      </StatusBadge>
    ),
  },
  {
    key: "plan",
    header: "Plan",
    render: (user) => user.plan,
  },
  {
    key: "created",
    header: "Created",
    render: (user) => user.created,
  },
  {
    key: "lastActive",
    header: "Last Active",
    render: (user) => user.lastActive,
  },
]

const stats = [
  {
    label: "Total Users",
    value: "500,000",
  },
  {
    label: "Sign Up Today",
    value: "2,000",
  },
  {
    label: "Paid Users",
    value: "50,000",
  },
  {
    label: "YETTEY Users",
    value: "250,000",
  },
  {
    label: "VPICK Users",
    value: "250,000",
  },
]

export default function UsersPage() {
  const [userType, setUserType] = useState("All Services")
  const [status, setStatus] = useState("Active")
  const [plan, setPlan] = useState("All Plans")
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<User | null>(null)
  const { startDate, endDate, compareMode, resetDateRange } =
    useDashboardDateRange()
  const filtered = useMemo(
    () =>
      users.filter(
        (user) =>
          (userType === "All Services" || user.userType === userType) &&
          (status === "All" || user.status === status) &&
          (plan === "All Plans" || user.plan === plan)
      ),
    [plan, status, userType]
  )
  const exportPayload = useMemo(
    () => ({
      title: "Users Report",
      subtitle:
        "Filtered user table export for service, status, plan, signup, and activity review.",
      filename: "users-report",
      filters: {
        "User Type": userType,
        Status: status,
        Plan: plan,
        "Date range": getDateRangeLabel(startDate, endDate),
        Compare: getCompareModeLabel(compareMode),
      },
      kpis: stats.map((stat) => ({
        label: stat.label,
        value: stat.value,
      })),
      datasets: [
        {
          name: "User Tables",
          rows: filtered.map((user) => ({
            Email: user.email,
            Name: user.name,
            "User Type": user.userType,
            Status: user.status,
            Plan: user.plan,
            Created: user.created,
            "Last Active": user.lastActive,
          })),
        },
      ],
    }),
    [compareMode, endDate, filtered, plan, startDate, status, userType]
  )

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Users"
        title="Users"
        description="Manage all platform users, their roles, and subscription statuses."
        actions={
          <div className="flex flex-wrap gap-2">
            <ExportActions payload={exportPayload} />
            <AdminButton>
              <Plus className="size-4" />
              User creation
            </AdminButton>
          </div>
        }
      />

      <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </div>

      <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
        <div className="mb-6 grid gap-6 xl:grid-cols-3">
          <FilterGroup label="User Type">
            {["All Services", "Yettey", "Vpick"].map((item) => (
              <button key={item} className={filterClass(userType === item)} onClick={() => { setUserType(item); setPage(1) }}>
                {item}
              </button>
            ))}
          </FilterGroup>
          <FilterGroup label="Status">
            {["All", "Active", "Blocked"].map((item) => (
              <button key={item} className={filterClass(status === item)} onClick={() => { setStatus(item); setPage(1) }}>
                {item}
              </button>
            ))}
          </FilterGroup>
          <FilterGroup label="Plan">
            {["All Plans", "Free", "Starter", "Growth", "Pro"].map((item) => (
              <button key={item} className={filterClass(plan === item)} onClick={() => { setPlan(item); setPage(1) }}>
                {item}
              </button>
            ))}
          </FilterGroup>
        </div>
        <DateRangeControl />
        <button className="mt-5 rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-950" onClick={() => { setUserType("All Services"); setStatus("Active"); setPlan("All Plans"); resetDateRange(); setPage(1) }}>
          Reset All
        </button>
      </section>

      <DataTable
        columns={columns}
        data={filtered}
        summary={`Showing page ${page} of 8 user pages`}
        page={page}
        totalPages={8}
        onPageChange={setPage}
        onRowClick={setSelected}
      />
      <SideDrawer open={Boolean(selected)} title={selected?.email ?? "User detail"} description="Mock user profile detail drawer" onClose={() => setSelected(null)}>
        {selected ? <div className="space-y-4">{Object.entries(selected).map(([key, value]) => <div key={key} className="rounded-xl border border-slate-100 p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">{key}</p><p className="mt-1 text-sm font-semibold text-slate-950">{value}</p></div>)}</div> : null}
      </SideDrawer>
    </DashboardLayout>
  )
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

function filterClass(active: boolean) {
  return cn("h-9 rounded-lg px-3 text-sm font-semibold transition hover:bg-slate-100 hover:text-slate-950", active ? "bg-violet-600 text-white shadow-sm shadow-violet-600/20 hover:bg-violet-600 hover:text-white" : "text-slate-600")
}
