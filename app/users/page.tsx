"use client"

import { useDeferredValue, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { CalendarDays, Plus, Search, X } from "lucide-react"

import AdminButton from "@/components/admin/AdminButton"
import ExportActions from "@/components/admin/ExportActions"
import PageHeader from "@/components/admin/PageHeader"
import Pagination from "@/components/admin/Pagination"
import StatCard from "@/components/admin/StatCard"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { cn } from "@/lib/utils"

type UserStatus = "Active" | "Trial" | "Suspended" | "Blocked" | "Expired"
type UserType = "YETTEY" | "VPICK"
type AuthType = "Google" | "Kakao" | "Naver" | "Email"
type UserRole = "User" | "Admin" | "Owner"

type UserRow = {
  authType: AuthType
  created: string
  email: string
  id: string
  lastActive: string
  name: string
  nickname: string
  oauthEmail: string
  plan: "Free" | "Starter" | "Growth" | "Pro" | "Basic" | "Professional" | "Enterprise"
  projectName: string
  role: UserRole
  status: UserStatus
  userType: UserType
  workspaceName: string
}

const users: UserRow[] = [
  {
    authType: "Google",
    created: "2026-05-26",
    email: "mina.park@studioalpha.co",
    id: "usr_1001",
    lastActive: "2026-05-27",
    name: "Mina Park",
    nickname: "mina",
    oauthEmail: "mina.park@gmail.com",
    plan: "Growth",
    projectName: "Launch DAM Workspace",
    role: "Owner",
    status: "Active",
    userType: "YETTEY",
    workspaceName: "Studio Alpha",
  },
  {
    authType: "Kakao",
    created: "2026-05-26",
    email: "jun.choi@creatorpack.io",
    id: "usr_1002",
    lastActive: "2026-05-27",
    name: "Jun Choi",
    nickname: "junchoi",
    oauthEmail: "jun.kakao@example.com",
    plan: "Professional",
    projectName: "Weekly Shorts Pipeline",
    role: "Admin",
    status: "Trial",
    userType: "VPICK",
    workspaceName: "Creator Pack",
  },
  {
    authType: "Naver",
    created: "2026-05-25",
    email: "sarah.kim@cloudike.io",
    id: "usr_1003",
    lastActive: "2026-05-26",
    name: "Sarah Kim",
    nickname: "sarah",
    oauthEmail: "sarah.naver@example.com",
    plan: "Pro",
    projectName: "Brand Asset Migration",
    role: "Owner",
    status: "Active",
    userType: "YETTEY",
    workspaceName: "Cloudike Team",
  },
  {
    authType: "Email",
    created: "2026-05-24",
    email: "media.lab@example.com",
    id: "usr_1004",
    lastActive: "2026-05-24",
    name: "Media Lab",
    nickname: "medialab",
    oauthEmail: "media.lab@example.com",
    plan: "Starter",
    projectName: "Thumbnail Generator",
    role: "User",
    status: "Blocked",
    userType: "YETTEY",
    workspaceName: "Media Lab",
  },
  {
    authType: "Google",
    created: "2026-05-23",
    email: "noah.lee@vpick.ai",
    id: "usr_1005",
    lastActive: "2026-05-26",
    name: "Noah Lee",
    nickname: "noah",
    oauthEmail: "noah.creator@gmail.com",
    plan: "Basic",
    projectName: "Product Picks Uploads",
    role: "User",
    status: "Active",
    userType: "VPICK",
    workspaceName: "Noah Studio",
  },
  {
    authType: "Email",
    created: "2026-05-22",
    email: "ops@yettey-enterprise.com",
    id: "usr_1006",
    lastActive: "2026-05-25",
    name: "Yettey Ops",
    nickname: "ops-team",
    oauthEmail: "ops@yettey-enterprise.com",
    plan: "Enterprise",
    projectName: "Enterprise Asset Review",
    role: "Admin",
    status: "Suspended",
    userType: "YETTEY",
    workspaceName: "Enterprise Ops",
  },
  {
    authType: "Kakao",
    created: "2026-05-21",
    email: "arin.song@shortsco.kr",
    id: "usr_1007",
    lastActive: "2026-05-22",
    name: "Arin Song",
    nickname: "arin",
    oauthEmail: "arin.kakao@example.com",
    plan: "Professional",
    projectName: "Shortform Campaign",
    role: "Owner",
    status: "Expired",
    userType: "VPICK",
    workspaceName: "Shorts Co",
  },
  {
    authType: "Google",
    created: "2026-05-21",
    email: "lucas.han@designflow.io",
    id: "usr_1008",
    lastActive: "2026-05-27",
    name: "Lucas Han",
    nickname: "lucas",
    oauthEmail: "lucas.han@gmail.com",
    plan: "Free",
    projectName: "Free Trial Workspace",
    role: "User",
    status: "Trial",
    userType: "YETTEY",
    workspaceName: "Design Flow",
  },
  {
    authType: "Naver",
    created: "2026-05-20",
    email: "jiwoo.kang@retailkit.kr",
    id: "usr_1009",
    lastActive: "2026-05-27",
    name: "Jiwoo Kang",
    nickname: "jiwoo",
    oauthEmail: "jiwoo.naver@example.com",
    plan: "Growth",
    projectName: "Retail Content Library",
    role: "Admin",
    status: "Active",
    userType: "YETTEY",
    workspaceName: "Retail Kit",
  },
  {
    authType: "Google",
    created: "2026-05-19",
    email: "alex.moon@videokit.com",
    id: "usr_1010",
    lastActive: "2026-05-21",
    name: "Alex Moon",
    nickname: "alex",
    oauthEmail: "alex.video@gmail.com",
    plan: "Basic",
    projectName: "Video Analysis Batch",
    role: "User",
    status: "Active",
    userType: "VPICK",
    workspaceName: "Video Kit",
  },
  {
    authType: "Email",
    created: "2026-05-18",
    email: "owner@brandlab.com",
    id: "usr_1011",
    lastActive: "2026-05-18",
    name: "Brand Lab",
    nickname: "brandlab",
    oauthEmail: "owner@brandlab.com",
    plan: "Starter",
    projectName: "Brand Kit Setup",
    role: "Owner",
    status: "Suspended",
    userType: "YETTEY",
    workspaceName: "Brand Lab",
  },
  {
    authType: "Kakao",
    created: "2026-05-17",
    email: "sumin@kcreator.co",
    id: "usr_1012",
    lastActive: "2026-05-26",
    name: "Sumin Yoo",
    nickname: "sumin",
    oauthEmail: "sumin.kakao@example.com",
    plan: "Professional",
    projectName: "Creator Shorts",
    role: "Admin",
    status: "Active",
    userType: "VPICK",
    workspaceName: "K Creator",
  },
]

const pageSize = 8

const baseStats = [
  { label: "Total Users", value: "500,000" },
  { label: "Sign Up Today", value: "2,000" },
  { label: "Paid Users", value: "50,000" },
  { label: "YETTEY Users", value: "250,000" },
  { label: "VPICK Users", value: "250,000" },
  { label: "Active Users", value: "384,200" },
  { label: "Suspended Users", value: "1,284" },
  { label: "Trial Users", value: "18,420" },
]

export default function UsersPage() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const deferredSearch = useDeferredValue(search)
  const [userType, setUserType] = useState("All")
  const [status, setStatus] = useState("All")
  const [plan, setPlan] = useState("All")
  const [authType, setAuthType] = useState("All")
  const [role, setRole] = useState("All")
  const [createdFrom, setCreatedFrom] = useState("")
  const [createdTo, setCreatedTo] = useState("")
  const [lastActiveFrom, setLastActiveFrom] = useState("")
  const [lastActiveTo, setLastActiveTo] = useState("")
  const [page, setPage] = useState(1)

  const filtered = useMemo(
    () =>
      users.filter((user) => {
        const query = deferredSearch.trim().toLowerCase()
        const searchable = [
          user.email,
          user.name,
          user.nickname,
          user.id,
          user.oauthEmail,
          user.workspaceName,
          user.projectName,
        ]
          .join(" ")
          .toLowerCase()

        return (
          (!query || searchable.includes(query)) &&
          (userType === "All" || user.userType === userType) &&
          (status === "All" || user.status === status) &&
          (plan === "All" || user.plan === plan) &&
          (authType === "All" || user.authType === authType) &&
          (role === "All" || user.role === role) &&
          isWithinDateRange(user.created, createdFrom, createdTo) &&
          isWithinDateRange(user.lastActive, lastActiveFrom, lastActiveTo)
        )
      }),
    [
      authType,
      createdFrom,
      createdTo,
      deferredSearch,
      lastActiveFrom,
      lastActiveTo,
      plan,
      role,
      status,
      userType,
    ]
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pagedUsers = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const isFiltering = search !== deferredSearch

  const exportPayload = useMemo(
    () => ({
      title: "Users Report",
      subtitle: "Filtered user list export for operational user management.",
      filename: "users-report",
      filters: {
        Search: deferredSearch || "All",
        "User Type": userType,
        Status: status,
        Plan: plan,
        "Auth Type": authType,
        Role: role,
        "Created Date": formatDateFilter(createdFrom, createdTo),
        "Last Active Date": formatDateFilter(lastActiveFrom, lastActiveTo),
      },
      kpis: baseStats.map((stat) => ({
        label: stat.label,
        value: stat.value,
      })),
      datasets: [
        {
          name: "Users",
          rows: filtered.map((user) => ({
            "User ID": user.id,
            Name: user.name,
            Email: user.email,
            Nickname: user.nickname,
            "OAuth Email": user.oauthEmail,
            Workspace: user.workspaceName,
            Project: user.projectName,
            "User Type": user.userType,
            Status: user.status,
            Plan: user.plan,
            Auth: user.authType,
            Role: user.role,
            Created: user.created,
            "Last Active": user.lastActive,
          })),
        },
      ],
    }),
    [
      authType,
      createdFrom,
      createdTo,
      deferredSearch,
      filtered,
      lastActiveFrom,
      lastActiveTo,
      plan,
      role,
      status,
      userType,
    ]
  )

  const resetFilters = () => {
    setSearch("")
    setUserType("All")
    setStatus("All")
    setPlan("All")
    setAuthType("All")
    setRole("All")
    setCreatedFrom("")
    setCreatedTo("")
    setLastActiveFrom("")
    setLastActiveTo("")
    setPage(1)
  }

  const updateFilter = (setter: (value: string) => void, value: string) => {
    setter(value)
    setPage(1)
  }

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Users"
        title="Users"
        description="Search, review, and manage platform users by status, plan, role, and activity."
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

      <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {baseStats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </div>

      <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_auto] xl:items-start">
          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Global Search
            </span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value)
                  setPage(1)
                }}
                placeholder="Search users by email, nickname, workspace, or project..."
                className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-11 text-sm font-semibold text-slate-800 shadow-sm transition placeholder:text-slate-400 hover:border-slate-300 focus:border-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-500/10"
              />
              {search ? (
                <button
                  className="absolute right-3 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  onClick={() => {
                    setSearch("")
                    setPage(1)
                  }}
                  type="button"
                >
                  <X className="size-4" />
                </button>
              ) : null}
            </div>
          </label>

          <button
            className="h-10 rounded-lg px-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 xl:mt-6"
            onClick={resetFilters}
          >
            Reset All
          </button>
        </div>

        <div className="mt-6 grid gap-5 xl:grid-cols-3">
          <FilterGroup label="User Type">
            <SegmentedControl
              options={["All", "YETTEY", "VPICK"]}
              value={userType}
              onChange={(value) => updateFilter(setUserType, value)}
            />
          </FilterGroup>
          <FilterGroup label="Status">
            <SegmentedControl
              options={["All", "Active", "Trial", "Suspended", "Blocked", "Expired"]}
              value={status}
              onChange={(value) => updateFilter(setStatus, value)}
            />
          </FilterGroup>
          <FilterGroup label="Plan">
            <SelectFilter
              value={plan}
              options={[
                "All",
                "Free",
                "Starter",
                "Growth",
                "Pro",
                "Basic",
                "Professional",
                "Enterprise",
              ]}
              onChange={(value) => updateFilter(setPlan, value)}
            />
          </FilterGroup>
          <FilterGroup label="Auth Type">
            <SegmentedControl
              options={["All", "Google", "Kakao", "Naver", "Email"]}
              value={authType}
              onChange={(value) => updateFilter(setAuthType, value)}
            />
          </FilterGroup>
          <FilterGroup label="Role">
            <SegmentedControl
              options={["All", "User", "Admin", "Owner"]}
              value={role}
              onChange={(value) => updateFilter(setRole, value)}
            />
          </FilterGroup>
          <FilterGroup label="Created Date">
            <DateRangeInputs
              from={createdFrom}
              to={createdTo}
              onFromChange={(value) => updateFilter(setCreatedFrom, value)}
              onToChange={(value) => updateFilter(setCreatedTo, value)}
            />
          </FilterGroup>
          <FilterGroup label="Last Active Date">
            <DateRangeInputs
              from={lastActiveFrom}
              to={lastActiveTo}
              onFromChange={(value) => updateFilter(setLastActiveFrom, value)}
              onToChange={(value) => updateFilter(setLastActiveTo, value)}
            />
          </FilterGroup>
        </div>
      </section>

      <UsersTable
        isLoading={isFiltering}
        page={currentPage}
        rows={pagedUsers}
        totalCount={filtered.length}
        totalPages={totalPages}
        onPageChange={setPage}
        onRowClick={(user) => router.push(`/users/${user.id}`)}
      />
    </DashboardLayout>
  )
}

function UsersTable({
  isLoading,
  page,
  rows,
  totalCount,
  totalPages,
  onPageChange,
  onRowClick,
}: {
  isLoading: boolean
  page: number
  rows: UserRow[]
  totalCount: number
  totalPages: number
  onPageChange: (page: number) => void
  onRowClick: (user: UserRow) => void
}) {
  const start = totalCount === 0 ? 0 : (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, totalCount)

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
      <div className="max-h-[720px] overflow-auto">
        <table className="w-full min-w-[1120px] border-separate border-spacing-0">
          <thead className="sticky top-0 z-10 bg-white shadow-[0_1px_0_#e2e8f0]">
            <tr>
              {[
                "User",
                "User Type",
                "Status",
                "Plan",
                "Auth",
                "Role",
                "Created",
                "Last Active",
              ].map((header) => (
                <th
                  key={header}
                  className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <TableSkeleton />
            ) : rows.length > 0 ? (
              rows.map((user) => (
                <tr
                  key={user.id}
                  className="group cursor-pointer transition-colors hover:bg-violet-50/50 focus-within:bg-violet-50/50"
                  onClick={() => onRowClick(user)}
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      onRowClick(user)
                    }
                  }}
                >
                  <td className="border-b border-slate-100 px-6 py-5">
                    <UserIdentity user={user} />
                  </td>
                  <td className="border-b border-slate-100 px-6 py-5">
                    <ServiceBadge service={user.userType} />
                  </td>
                  <td className="border-b border-slate-100 px-6 py-5">
                    <UserStatusBadge status={user.status} />
                  </td>
                  <td className="border-b border-slate-100 px-6 py-5 text-sm font-semibold text-slate-800">
                    {user.plan}
                  </td>
                  <td className="border-b border-slate-100 px-6 py-5">
                    <AuthBadge auth={user.authType} />
                  </td>
                  <td className="border-b border-slate-100 px-6 py-5">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="whitespace-nowrap border-b border-slate-100 px-6 py-5 text-sm font-medium text-slate-600">
                    {formatDate(user.created)}
                  </td>
                  <td className="whitespace-nowrap border-b border-slate-100 px-6 py-5 text-sm font-semibold text-slate-800">
                    {formatDate(user.lastActive)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-6 py-16">
                  <div className="mx-auto max-w-md text-center">
                    <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                      <Search className="size-5" />
                    </div>
                    <p className="mt-4 text-base font-bold text-slate-950">
                      No users found
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Try another email, workspace, project, status, or date range.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        summary={`Showing ${start}-${end} of ${totalCount} users`}
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </section>
  )
}

function UserIdentity({ user }: { user: UserRow }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700 ring-1 ring-violet-200">
        {getInitials(user.name)}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-slate-950">{user.name}</p>
        <p className="truncate text-sm text-slate-500">{user.email}</p>
        <p className="mt-1 truncate text-xs font-semibold text-slate-400">
          {user.id} / {user.workspaceName}
        </p>
      </div>
    </div>
  )
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }, (_, index) => (
        <tr key={index}>
          {Array.from({ length: 8 }, (_, cellIndex) => (
            <td key={cellIndex} className="border-b border-slate-100 px-6 py-5">
              <div className="h-5 animate-pulse rounded bg-slate-100" />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

function FilterGroup({
  children,
  label,
}: {
  children: React.ReactNode
  label: string
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      {children}
    </div>
  )
}

function SegmentedControl({
  options,
  value,
  onChange,
}: {
  options: string[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          className={filterClass(value === option)}
          onClick={() => onChange(option)}
        >
          {option}
        </button>
      ))}
    </div>
  )
}

function SelectFilter({
  options,
  value,
  onChange,
}: {
  options: string[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 focus:border-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-500/10"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option === "All" ? "All Plans" : option}
        </option>
      ))}
    </select>
  )
}

function DateRangeInputs({
  from,
  to,
  onFromChange,
  onToChange,
}: {
  from: string
  to: string
  onFromChange: (value: string) => void
  onToChange: (value: string) => void
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <label className="relative block">
        <span className="sr-only">From</span>
        <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input
          type="date"
          value={from}
          onChange={(event) => onFromChange(event.target.value)}
          className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 focus:border-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-500/10"
        />
      </label>
      <label className="relative block">
        <span className="sr-only">To</span>
        <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input
          type="date"
          value={to}
          onChange={(event) => onToChange(event.target.value)}
          className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 focus:border-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-500/10"
        />
      </label>
    </div>
  )
}

function UserStatusBadge({ status }: { status: UserStatus }) {
  const classes = {
    Active: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    Blocked: "bg-rose-50 text-rose-600 ring-rose-100",
    Expired: "bg-slate-100 text-slate-600 ring-slate-200",
    Suspended: "bg-orange-50 text-orange-600 ring-orange-100",
    Trial: "bg-blue-50 text-blue-600 ring-blue-100",
  } satisfies Record<UserStatus, string>

  return <span className={badgeClass(classes[status])}>{status}</span>
}

function ServiceBadge({ service }: { service: UserType }) {
  return (
    <span
      className={badgeClass(
        service === "YETTEY"
          ? "bg-violet-50 text-violet-600 ring-violet-100"
          : "bg-blue-50 text-blue-600 ring-blue-100"
      )}
    >
      {service}
    </span>
  )
}

function AuthBadge({ auth }: { auth: AuthType }) {
  return <span className={badgeClass("bg-slate-50 text-slate-700 ring-slate-200")}>{auth}</span>
}

function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span
      className={badgeClass(
        role === "Owner"
          ? "bg-violet-50 text-violet-600 ring-violet-100"
          : role === "Admin"
            ? "bg-slate-900 text-white ring-slate-900"
            : "bg-slate-100 text-slate-700 ring-slate-200"
      )}
    >
      {role}
    </span>
  )
}

function badgeClass(extra: string) {
  return cn(
    "inline-flex h-6 items-center rounded-full px-2.5 text-xs font-bold ring-1",
    extra
  )
}

function filterClass(active: boolean) {
  return cn(
    "h-9 rounded-lg px-3 text-sm font-semibold transition hover:bg-slate-100 hover:text-slate-950",
    active
      ? "bg-violet-600 text-white shadow-sm shadow-violet-600/20 hover:bg-violet-600 hover:text-white"
      : "text-slate-600"
  )
}

function isWithinDateRange(value: string, from: string, to: string) {
  return (!from || value >= from) && (!to || value <= to)
}

function formatDateFilter(from: string, to: string) {
  if (!from && !to) {
    return "All"
  }

  return `${from || "Any"} - ${to || "Any"}`
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`))
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}
