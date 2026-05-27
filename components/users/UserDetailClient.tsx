"use client"

import { useMemo, useState } from "react"
import {
  Ban,
  Copy,
  Edit3,
  KeyRound,
  ShieldCheck,
  Trash2,
  Undo2,
  UserRound,
} from "lucide-react"

import AdminButton from "@/components/admin/AdminButton"
import PageHeader from "@/components/admin/PageHeader"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { cn } from "@/lib/utils"

type UserStatus = "Active" | "Trial" | "Suspended" | "Blocked" | "Expired"
type UserType = "YETTEY" | "VPICK"
type AuthProvider = "Google" | "Kakao" | "Naver" | "Email"
type UserRole = "User" | "Admin" | "Owner"

type UserDetail = {
  authProvider: AuthProvider
  billingHistory: BillingHistoryRow[]
  creditBalance: number
  createdDate: string
  email: string
  id: string
  language: string
  lastActive: string
  lastLogin: string
  lastPasswordChange: string
  linkedProviders: AuthProvider[]
  mfaEnabled: boolean
  name: string
  nextBillingDate: string
  notes: InternalNote[]
  plan: string
  projects: ProjectRow[]
  recoveryEmail: string
  role: UserRole
  status: UserStatus
  subscriptionStatus: "Active" | "Trialing" | "Past Due" | "Canceled"
  userType: UserType
  workspaceCount: number
}

type ProjectRow = {
  createdDate: string
  members: number
  name: string
  storageUsage: string
  workspace: string
}

type BillingHistoryRow = {
  amount: string
  date: string
  event: string
  status: string
}

type InternalNote = {
  author: string
  body: string
  timestamp: string
}

const users: Record<string, UserDetail> = {
  usr_1001: {
    authProvider: "Google",
    billingHistory: [
      {
        amount: "₩99,000",
        date: "May 26, 2026",
        event: "Growth renewal",
        status: "Paid",
      },
      {
        amount: "₩49,000",
        date: "Apr 26, 2026",
        event: "Starter renewal",
        status: "Paid",
      },
      {
        amount: "₩50,000",
        date: "Apr 12, 2026",
        event: "Starter → Growth upgrade",
        status: "Completed",
      },
    ],
    creditBalance: 12420,
    createdDate: "May 12, 2024",
    email: "mina.park@studioalpha.co",
    id: "usr_1001",
    language: "English",
    lastActive: "May 27, 2026 10:24 AM",
    lastLogin: "May 27, 2026 10:18 AM",
    lastPasswordChange: "Mar 18, 2026",
    linkedProviders: ["Google", "Email"],
    mfaEnabled: true,
    name: "Mina Park",
    nextBillingDate: "Jun 26, 2026",
    notes: [
      {
        author: "Sarah Admin",
        body: "Requested invoice resend for May billing cycle.",
        timestamp: "May 28, 2026 09:12 AM",
      },
      {
        author: "Minjun Ops",
        body: "Workspace owner confirmed Growth plan seat allocation.",
        timestamp: "May 21, 2026 03:40 PM",
      },
    ],
    plan: "Growth",
    projects: [
      {
        createdDate: "May 14, 2026",
        members: 8,
        name: "Launch DAM Workspace",
        storageUsage: "1.8 TB",
        workspace: "Studio Alpha",
      },
      {
        createdDate: "Apr 28, 2026",
        members: 5,
        name: "Brand Asset Migration",
        storageUsage: "842 GB",
        workspace: "Studio Alpha",
      },
      {
        createdDate: "Mar 03, 2026",
        members: 3,
        name: "Thumbnail Production",
        storageUsage: "420 GB",
        workspace: "Creator Team",
      },
    ],
    recoveryEmail: "recovery@studioalpha.co",
    role: "Owner",
    status: "Active",
    subscriptionStatus: "Active",
    userType: "YETTEY",
    workspaceCount: 4,
  },
  usr_1002: {
    authProvider: "Kakao",
    billingHistory: [
      {
        amount: "₩40,000",
        date: "May 26, 2026",
        event: "Professional trial authorization",
        status: "Trialing",
      },
    ],
    creditBalance: 5600,
    createdDate: "May 26, 2026",
    email: "jun.choi@creatorpack.io",
    id: "usr_1002",
    language: "Korean",
    lastActive: "May 27, 2026 08:44 AM",
    lastLogin: "May 27, 2026 08:41 AM",
    lastPasswordChange: "Not set",
    linkedProviders: ["Kakao"],
    mfaEnabled: false,
    name: "Jun Choi",
    nextBillingDate: "Jun 09, 2026",
    notes: [
      {
        author: "Sarah Admin",
        body: "Trial account asked about upload processing limits.",
        timestamp: "May 27, 2026 11:02 AM",
      },
    ],
    plan: "Professional",
    projects: [
      {
        createdDate: "May 26, 2026",
        members: 3,
        name: "Weekly Shorts Pipeline",
        storageUsage: "64 GB",
        workspace: "Creator Pack",
      },
    ],
    recoveryEmail: "jun.ops@creatorpack.io",
    role: "Admin",
    status: "Trial",
    subscriptionStatus: "Trialing",
    userType: "VPICK",
    workspaceCount: 1,
  },
}

type Tab = "profile" | "projects" | "billing"

const tabs: { id: Tab; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "projects", label: "Projects" },
  { id: "billing", label: "Billing & Plan" },
]

export default function UserDetailClient({ userId }: { userId: string }) {
  const [activeTab, setActiveTab] = useState<Tab>("profile")
  const user = useMemo(() => getUser(userId), [userId])

  return (
    <DashboardLayout>
      <PageHeader
        breadcrumbs={[
          { label: "Users" },
          { label: `User Detail (${user.id})` },
        ]}
        title={user.name}
        description={`${user.email} / ${user.workspaceCount} workspaces`}
      />

      <UserSummary user={user} />

      <div className="mt-8 border-b border-slate-200">
        <div className="flex flex-wrap gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={cn(
                "-mb-px border-b-2 px-0 pb-4 text-sm font-bold transition",
                activeTab === tab.id
                  ? "border-violet-600 text-violet-600"
                  : "border-transparent text-slate-500 hover:text-slate-950"
              )}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        {activeTab === "profile" ? <ProfileTab user={user} /> : null}
        {activeTab === "projects" ? <ProjectsTab projects={user.projects} /> : null}
        {activeTab === "billing" ? <BillingTab user={user} /> : null}
      </div>

      <NotesSection notes={user.notes} />
    </DashboardLayout>
  )
}

function UserSummary({ user }: { user: UserDetail }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06),0_16px_40px_rgba(15,23,42,0.06)]">
      <div className="flex flex-col gap-6 p-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-lg font-bold text-violet-700 ring-1 ring-violet-200">
            {getInitials(user.name)}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                {user.name}
              </h2>
              <StatusPill status={user.status} />
            </div>
            <p className="mt-1 text-sm font-medium text-slate-500">{user.email}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-400">
              <span>User ID: {user.id}</span>
              <Copy className="size-3.5" />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <AdminButton>
            <UserRound className="size-4" />
            Impersonate
          </AdminButton>
          {user.status === "Active" || user.status === "Trial" ? (
            <>
              <AdminButton>
                <ShieldCheck className="size-4" />
                Suspend User
              </AdminButton>
              <AdminButton>
                <Ban className="size-4" />
                Block User
              </AdminButton>
            </>
          ) : (
            <AdminButton>
              <Undo2 className="size-4" />
              Restore User
            </AdminButton>
          )}
          <AdminButton className="border-rose-200 bg-rose-500 text-white hover:border-rose-500 hover:bg-rose-600">
            <Trash2 className="size-4" />
            Delete
          </AdminButton>
        </div>
      </div>

      <div className="grid border-t border-slate-100 md:grid-cols-3 xl:grid-cols-5">
        <SummaryItem label="Service" value={<ServicePill service={user.userType} />} />
        <SummaryItem label="Plan" value={user.plan} detail="View billing" />
        <SummaryItem label="Credits" value={formatNumber(user.creditBalance)} />
        <SummaryItem label="Projects" value={formatNumber(user.projects.length)} />
        <SummaryItem label="Workspaces" value={formatNumber(user.workspaceCount)} />
        <SummaryItem label="Role" value={<RolePill role={user.role} />} />
        <SummaryItem label="Auth Provider" value={user.authProvider} />
        <SummaryItem label="Joined" value={user.createdDate} />
        <SummaryItem label="Last Active" value={user.lastActive} />
        <SummaryItem label="Status" value={<StatusPill status={user.status} />} />
      </div>
    </section>
  )
}

function SummaryItem({
  detail,
  label,
  value,
}: {
  detail?: string
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="min-h-24 border-b border-r border-slate-100 p-5 last:border-r-0">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <div className="mt-3 text-sm font-bold text-slate-950">{value}</div>
      {detail ? (
        <p className="mt-2 text-xs font-bold text-violet-600">{detail}</p>
      ) : null}
    </div>
  )
}

function ProfileTab({ user }: { user: UserDetail }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
        <h3 className="text-lg font-bold text-slate-950">Profile</h3>
        <div className="mt-6 grid gap-x-10 gap-y-6 md:grid-cols-2">
          <InfoField label="User ID" value={user.id} copyable />
          <InfoField label="Email" value={user.email} copyable />
          <InfoField label="Name" value={user.name} editable />
          <InfoField label="Auth Provider" value={user.authProvider} />
          <InfoField label="Language" value={user.language} editable />
          <InfoField label="Created Date" value={user.createdDate} />
          <InfoField label="Last Login" value={user.lastLogin} />
          <InfoField label="MFA Status" value={user.mfaEnabled ? "Enabled" : "Disabled"} />
          <InfoField
            label="User Type"
            value={<ServicePill service={user.userType} />}
          />
          <InfoField label="Role" value={<RolePill role={user.role} />} />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
        <div className="flex items-center gap-2">
          <KeyRound className="size-5 text-violet-600" />
          <h3 className="text-lg font-bold text-slate-950">Security</h3>
        </div>
        <div className="mt-6 space-y-5">
          <SecurityRow label="MFA Enabled" value={user.mfaEnabled ? "Enabled" : "Disabled"} />
          <SecurityRow label="Recovery Email" value={user.recoveryEmail} />
          <SecurityRow label="Linked Providers" value={user.linkedProviders.join(", ")} />
          <SecurityRow label="Last Password Change" value={user.lastPasswordChange} />
          <SecurityRow label="Last Login" value={user.lastLogin} />
        </div>
      </section>
    </div>
  )
}

function ProjectsTab({ projects }: { projects: ProjectRow[] }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
      <div className="border-b border-slate-100 p-6">
        <h3 className="text-lg font-bold text-slate-950">Projects</h3>
        <p className="mt-1 text-sm text-slate-500">
          Operational project records for this user and related workspaces.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px]">
          <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-6 py-4">Project Name</th>
              <th className="px-6 py-4">Workspace</th>
              <th className="px-6 py-4">Members</th>
              <th className="px-6 py-4">Created Date</th>
              <th className="px-6 py-4">Storage Usage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {projects.map((project) => (
              <tr key={project.name} className="transition hover:bg-slate-50">
                <td className="px-6 py-5 text-sm font-bold text-slate-950">
                  {project.name}
                </td>
                <td className="px-6 py-5 text-sm text-slate-600">{project.workspace}</td>
                <td className="px-6 py-5 text-sm text-slate-600">{project.members}</td>
                <td className="px-6 py-5 text-sm text-slate-600">{project.createdDate}</td>
                <td className="px-6 py-5 text-sm font-semibold text-slate-800">
                  {project.storageUsage}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function BillingTab({ user }: { user: UserDetail }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
        <h3 className="text-lg font-bold text-slate-950">Billing & Plan</h3>
        <div className="mt-6 space-y-5">
          <SecurityRow label="Current Plan" value={user.plan} />
          <SecurityRow label="Subscription Status" value={user.subscriptionStatus} />
          <SecurityRow label="Next Billing Date" value={user.nextBillingDate} />
          <SecurityRow label="Credit Balance" value={formatNumber(user.creditBalance)} />
          <SecurityRow label="Role" value={user.role} />
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
        <div className="border-b border-slate-100 p-6">
          <h3 className="text-lg font-bold text-slate-950">Billing History</h3>
          <p className="mt-1 text-sm text-slate-500">
            Payment, renewal, and upgrade events for operational review.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px]">
            <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Event</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {user.billingHistory.map((row) => (
                <tr key={`${row.date}-${row.event}`} className="transition hover:bg-slate-50">
                  <td className="px-6 py-5 text-sm font-medium text-slate-700">
                    {row.date}
                  </td>
                  <td className="px-6 py-5 text-sm font-bold text-slate-950">
                    {row.event}
                  </td>
                  <td className="px-6 py-5 text-sm font-semibold text-slate-800">
                    {row.amount}
                  </td>
                  <td className="px-6 py-5">
                    <span className="inline-flex h-6 items-center rounded-full bg-emerald-50 px-2.5 text-xs font-bold text-emerald-600">
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function NotesSection({ notes }: { notes: InternalNote[] }) {
  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-950">Notes</h3>
          <p className="mt-1 text-sm text-slate-500">
            Internal operational notes visible to admins only.
          </p>
        </div>
        <AdminButton>Add Note</AdminButton>
      </div>

      <div className="mt-6 space-y-3">
        {notes.map((note) => (
          <div key={`${note.author}-${note.timestamp}`} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-sm font-semibold leading-6 text-slate-900">
              {note.body}
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
              <span>{note.author}</span>
              <span>/</span>
              <span>{note.timestamp}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function InfoField({
  copyable,
  editable,
  label,
  value,
}: {
  copyable?: boolean
  editable?: boolean
  label: string
  value: React.ReactNode
}) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
          {label}
        </p>
        {editable ? <Edit3 className="size-3.5 text-slate-500" /> : null}
        {copyable ? <Copy className="size-3.5 text-slate-400" /> : null}
      </div>
      <div className={cn("mt-2 text-sm font-semibold text-slate-900", editable && "inline-flex rounded-lg border border-slate-200 bg-slate-50 px-3 py-2")}>
        {value}
      </div>
    </div>
  )
}

function SecurityRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-6 border-b border-slate-100 pb-4 last:border-b-0 last:pb-0">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="text-right text-sm font-bold text-slate-950">{value}</p>
    </div>
  )
}

function StatusPill({ status }: { status: UserStatus }) {
  const classes = {
    Active: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    Blocked: "bg-rose-50 text-rose-600 ring-rose-100",
    Expired: "bg-slate-100 text-slate-600 ring-slate-200",
    Suspended: "bg-orange-50 text-orange-600 ring-orange-100",
    Trial: "bg-blue-50 text-blue-600 ring-blue-100",
  } satisfies Record<UserStatus, string>

  return <span className={pillClass(classes[status])}>{status}</span>
}

function ServicePill({ service }: { service: UserType }) {
  return (
    <span
      className={pillClass(
        service === "YETTEY"
          ? "bg-violet-50 text-violet-600 ring-violet-100"
          : "bg-blue-50 text-blue-600 ring-blue-100"
      )}
    >
      {service}
    </span>
  )
}

function RolePill({ role }: { role: UserRole }) {
  return (
    <span
      className={pillClass(
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

function pillClass(extra: string) {
  return cn(
    "inline-flex h-6 items-center rounded-full px-2.5 text-xs font-bold ring-1",
    extra
  )
}

function getUser(userId: string): UserDetail {
  return (
    users[userId] ?? {
      ...users.usr_1001,
      email: `${userId}@example.com`,
      id: userId,
      name: "Mock User",
      notes: [
        {
          author: "Sarah Admin",
          body: "Mock account generated for route validation.",
          timestamp: "May 28, 2026 10:00 AM",
        },
      ],
    }
  )
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value)
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}
