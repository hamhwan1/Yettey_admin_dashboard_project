"use client"

import { useMemo, useState, type ReactNode } from "react"
import {
  Archive,
  Ban,
  CheckCircle2,
  Coins,
  Copy,
  Edit3,
  FileText,
  FileImage,
  KeyRound,
  LogIn,
  MessageSquare,
  ReceiptText,
  ShieldCheck,
  Trash2,
  Undo2,
  UserPlus,
  X,
} from "lucide-react"

import AdminButton from "@/components/admin/AdminButton"
import PageHeader from "@/components/admin/PageHeader"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { cn } from "@/lib/utils"

type UserStatus = "Active" | "Trial" | "Suspended" | "Blocked" | "Expired"
type UserType = "YETTEY" | "VPICK"
type AuthProvider = "Google" | "Kakao" | "Naver" | "Email"
type UserRole = "User" | "Admin" | "Owner"
type CreditType = "Subscription Credits" | "Purchased Credits"
type NoteTab = "inquiries" | "internal"
type ProjectRole = "Owner" | "Admin" | "Editor" | "Viewer"
type BillingEventType =
  | "Subscription Renewal"
  | "Upgrade"
  | "Downgrade"
  | "Manual Adjustment"
  | "Refund"
  | "Failed Payment"
type PlanChangeStage = "form" | "confirm"
type ProjectConfirmAction =
  | {
      projectId: string
      projectName: string
      type: "archive"
    }
  | {
      memberId: string
      memberName: string
      projectId: string
      projectName: string
      type: "remove-member" | "transfer-ownership"
    }

type UserDetail = {
  authProvider: AuthProvider
  billingHistory: BillingHistoryRow[]
  billingCycle: string
  billingStartDate: string
  consecutiveSubscriptionCount: string
  createdDate: string
  creditHistory: CreditLedgerEntry[]
  customerInquiries: CustomerInquiry[]
  email: string
  id: string
  internalNotes: InternalNote[]
  language: string
  lastActive: string
  lastLogin: string
  lastPasswordChange: string
  linkedProviders: AuthProvider[]
  mfaEnabled: boolean
  name: string
  nextBillingDate: string
  plan: string
  planChangeLogs: PlanChangeLog[]
  projects: ProjectRow[]
  purchasedCredits: number
  recoveryEmail: string
  role: UserRole
  status: UserStatus
  subscriptionCredits: SubscriptionCredits
  subscriptionPeriod: string
  subscriptionStatus: "Active" | "Trialing" | "Past Due" | "Canceled"
  userType: UserType
  workspaceCount: number
  autoRenewalStatus: "Enabled" | "Disabled"
}

type SubscriptionCredits = {
  limit: number
  remaining: number
  resetsOn: string
}

type ProjectRow = {
  activity: ProjectActivity[]
  createdDate: string
  generatedAssets: number
  id: string
  images: number
  memberList: ProjectMember[]
  members: number
  mostActiveMember: string
  name: string
  owner: string
  recentAssets: ProjectAsset[]
  storageUsage: string
  uploadedAssets: number
  videos: number
  workspace: string
}

type ProjectMember = {
  email: string
  id: string
  lastActive: string
  name: string
  role: ProjectRole
}

type ProjectAsset = {
  createdAt: string
  createdBy: string
  fileCount: number
  id: string
  name: string
  type: "Image" | "Video" | "Folder"
}

type ProjectActivity = {
  actor: string
  event: string
  id: string
  timestamp: string
}

type BillingHistoryRow = {
  amount: string
  date: string
  eventType: BillingEventType
  id: string
  newPlan: string
  paymentMethod: string
  previousPlan: string
  receipt: ReceiptInfo
  status: "Paid" | "Completed" | "Failed" | "Refunded" | "Scheduled" | "Trialing"
}

type ReceiptInfo = {
  amount: string
  billingDate: string
  card: string
  eventType: BillingEventType
  paymentMethod: string
  receiptId: string
  status: string
  taxInvoiceStatus: string
  transactionId: string
}

type PlanChangeLog = {
  admin: string
  effectivePeriod: string
  id: string
  newPlan: string
  note: string
  previousPlan: string
  timestamp: string
}

type PlanChangeForm = {
  adminNote: string
  applyPeriod: "After current subscription ends" | "Custom period"
  effectiveEndDate: string
  effectiveStartDate: string
  newPlan: string
}

type CreditLedgerEntry = {
  admin: string
  amount: number
  id: string
  reason: string
  recipient: string
  timestamp: string
  type: CreditType
}

type CustomerInquiry = {
  author: string
  body: string
  noteType: "Customer Inquiry"
  timestamp: string
}

type InternalNote = {
  author: string
  body: string
  noteType: "Internal Note" | "Support Action" | "Risk Flag"
  timestamp: string
}

const users: Record<string, UserDetail> = {
  usr_1001: {
    authProvider: "Google",
    autoRenewalStatus: "Enabled",
    billingHistory: [
      {
        amount: "₩99,000",
        date: "May 26, 2026",
        eventType: "Subscription Renewal",
        id: "bill_1001_1",
        newPlan: "Growth",
        paymentMethod: "Card",
        previousPlan: "Growth",
        receipt: {
          amount: "₩99,000",
          billingDate: "May 26, 2026",
          card: "Visa ending 4242",
          eventType: "Subscription Renewal",
          paymentMethod: "Card",
          receiptId: "rcpt_1001_0526",
          status: "Paid",
          taxInvoiceStatus: "Not requested",
          transactionId: "txn_kr_20260526_1001",
        },
        status: "Paid",
      },
      {
        amount: "₩49,000",
        date: "Apr 26, 2026",
        eventType: "Subscription Renewal",
        id: "bill_1001_2",
        newPlan: "Starter",
        paymentMethod: "Card",
        previousPlan: "Starter",
        receipt: {
          amount: "₩49,000",
          billingDate: "Apr 26, 2026",
          card: "Visa ending 4242",
          eventType: "Subscription Renewal",
          paymentMethod: "Card",
          receiptId: "rcpt_1001_0426",
          status: "Paid",
          taxInvoiceStatus: "Not requested",
          transactionId: "txn_kr_20260426_1001",
        },
        status: "Paid",
      },
      {
        amount: "₩50,000",
        date: "Apr 12, 2026",
        eventType: "Upgrade",
        id: "bill_1001_3",
        newPlan: "Growth",
        paymentMethod: "Card",
        previousPlan: "Starter",
        receipt: {
          amount: "₩50,000",
          billingDate: "Apr 12, 2026",
          card: "Visa ending 4242",
          eventType: "Upgrade",
          paymentMethod: "Card",
          receiptId: "rcpt_1001_0412",
          status: "Completed",
          taxInvoiceStatus: "Not requested",
          transactionId: "txn_kr_20260412_1001",
        },
        status: "Completed",
      },
    ],
    billingCycle: "Monthly",
    billingStartDate: "May 12, 2024",
    consecutiveSubscriptionCount: "14 months",
    createdDate: "May 12, 2024",
    creditHistory: [
      {
        admin: "Sarah Admin",
        amount: 3000,
        id: "credit_1001_1",
        reason: "Credits compensated due to upload issue.",
        recipient: "mina.park@studioalpha.co",
        timestamp: "May 24, 2026 02:42 PM",
        type: "Purchased Credits",
      },
      {
        admin: "Minjun Ops",
        amount: 1500,
        id: "credit_1001_2",
        reason: "Promotion credit for annual renewal discussion.",
        recipient: "mina.park@studioalpha.co",
        timestamp: "May 10, 2026 11:18 AM",
        type: "Purchased Credits",
      },
    ],
    customerInquiries: [
      {
        author: "Mina Park",
        body: "Can you resend the May invoice to our finance mailbox?",
        noteType: "Customer Inquiry",
        timestamp: "May 28, 2026 08:56 AM",
      },
      {
        author: "Mina Park",
        body: "One upload batch failed after processing. Please check if credits were deducted.",
        noteType: "Customer Inquiry",
        timestamp: "May 23, 2026 05:31 PM",
      },
    ],
    email: "mina.park@studioalpha.co",
    id: "usr_1001",
    internalNotes: [
      {
        author: "Sarah Admin",
        body: "Requested invoice resend for May billing cycle.",
        noteType: "Support Action",
        timestamp: "May 28, 2026 09:12 AM",
      },
      {
        author: "Minjun Ops",
        body: "Credits compensated due to upload issue.",
        noteType: "Support Action",
        timestamp: "May 24, 2026 02:44 PM",
      },
      {
        author: "Sarah Admin",
        body: "VIP customer. Keep renewal support response within same business day.",
        noteType: "Internal Note",
        timestamp: "May 21, 2026 03:40 PM",
      },
    ],
    language: "English",
    lastActive: "May 27, 2026 10:24 AM",
    lastLogin: "May 27, 2026 10:18 AM",
    lastPasswordChange: "Mar 18, 2026",
    linkedProviders: ["Google", "Email"],
    mfaEnabled: true,
    name: "Mina Park",
    nextBillingDate: "Jun 26, 2026",
    plan: "Growth",
    planChangeLogs: [
      {
        admin: "Sarah Admin",
        effectivePeriod: "Apr 12, 2026 ~ Current",
        id: "planlog_1001_1",
        newPlan: "Growth",
        note: "Customer upgraded after storage usage review.",
        previousPlan: "Starter",
        timestamp: "Apr 12, 2026 10:22 AM",
      },
    ],
    projects: [
      {
        activity: [
          {
            actor: "Mina Park",
            event: "Uploaded 18 product images",
            id: "act_launch_1",
            timestamp: "May 27, 2026 10:12 AM",
          },
          {
            actor: "Eun Seo",
            event: "Generated campaign thumbnails",
            id: "act_launch_2",
            timestamp: "May 26, 2026 04:18 PM",
          },
        ],
        createdDate: "May 14, 2026",
        generatedAssets: 420,
        id: "prj_launch_dam",
        images: 1160,
        memberList: [
          {
            email: "mina.park@studioalpha.co",
            id: "mem_launch_1",
            lastActive: "May 27, 2026",
            name: "Mina Park",
            role: "Owner",
          },
          {
            email: "eun.seo@studioalpha.co",
            id: "mem_launch_2",
            lastActive: "May 26, 2026",
            name: "Eun Seo",
            role: "Admin",
          },
          {
            email: "ops@studioalpha.co",
            id: "mem_launch_3",
            lastActive: "May 24, 2026",
            name: "Studio Ops",
            role: "Editor",
          },
        ],
        members: 8,
        mostActiveMember: "Mina Park",
        name: "Launch DAM Workspace",
        owner: "Mina Park",
        recentAssets: [
          {
            createdAt: "May 27, 2026",
            createdBy: "Mina Park",
            fileCount: 18,
            id: "asset_launch_1",
            name: "Summer product set",
            type: "Image",
          },
          {
            createdAt: "May 26, 2026",
            createdBy: "Eun Seo",
            fileCount: 32,
            id: "asset_launch_2",
            name: "Campaign thumbnail batch",
            type: "Folder",
          },
        ],
        storageUsage: "1.8 TB",
        uploadedAssets: 1240,
        videos: 80,
        workspace: "Studio Alpha",
      },
      {
        activity: [
          {
            actor: "Studio Ops",
            event: "Moved 86 files into archive folder",
            id: "act_brand_1",
            timestamp: "May 24, 2026 03:02 PM",
          },
          {
            actor: "Mina Park",
            event: "Renamed workspace collection",
            id: "act_brand_2",
            timestamp: "May 20, 2026 01:30 PM",
          },
        ],
        createdDate: "Apr 28, 2026",
        generatedAssets: 96,
        id: "prj_brand_migration",
        images: 780,
        memberList: [
          {
            email: "mina.park@studioalpha.co",
            id: "mem_brand_1",
            lastActive: "May 24, 2026",
            name: "Mina Park",
            role: "Owner",
          },
          {
            email: "ops@studioalpha.co",
            id: "mem_brand_2",
            lastActive: "May 24, 2026",
            name: "Studio Ops",
            role: "Editor",
          },
        ],
        members: 5,
        mostActiveMember: "Studio Ops",
        name: "Brand Asset Migration",
        owner: "Mina Park",
        recentAssets: [
          {
            createdAt: "May 24, 2026",
            createdBy: "Studio Ops",
            fileCount: 86,
            id: "asset_brand_1",
            name: "Legacy brand archive",
            type: "Folder",
          },
          {
            createdAt: "May 20, 2026",
            createdBy: "Mina Park",
            fileCount: 24,
            id: "asset_brand_2",
            name: "Logo source files",
            type: "Image",
          },
        ],
        storageUsage: "842 GB",
        uploadedAssets: 804,
        videos: 24,
        workspace: "Studio Alpha",
      },
      {
        activity: [
          {
            actor: "Mina Park",
            event: "Generated 42 thumbnails",
            id: "act_thumb_1",
            timestamp: "May 25, 2026 09:22 AM",
          },
          {
            actor: "Creator Team",
            event: "Uploaded product reference images",
            id: "act_thumb_2",
            timestamp: "May 22, 2026 02:44 PM",
          },
        ],
        createdDate: "Mar 03, 2026",
        generatedAssets: 520,
        id: "prj_thumbnail_production",
        images: 602,
        memberList: [
          {
            email: "mina.park@studioalpha.co",
            id: "mem_thumb_1",
            lastActive: "May 25, 2026",
            name: "Mina Park",
            role: "Owner",
          },
          {
            email: "creator@studioalpha.co",
            id: "mem_thumb_2",
            lastActive: "May 22, 2026",
            name: "Creator Team",
            role: "Editor",
          },
        ],
        members: 3,
        mostActiveMember: "Mina Park",
        name: "Thumbnail Production",
        owner: "Mina Park",
        recentAssets: [
          {
            createdAt: "May 25, 2026",
            createdBy: "Mina Park",
            fileCount: 42,
            id: "asset_thumb_1",
            name: "May thumbnail exports",
            type: "Image",
          },
          {
            createdAt: "May 22, 2026",
            createdBy: "Creator Team",
            fileCount: 14,
            id: "asset_thumb_2",
            name: "Reference uploads",
            type: "Folder",
          },
        ],
        storageUsage: "420 GB",
        uploadedAssets: 616,
        videos: 14,
        workspace: "Creator Team",
      },
    ],
    purchasedCredits: 4420,
    recoveryEmail: "recovery@studioalpha.co",
    role: "Owner",
    status: "Active",
    subscriptionCredits: {
      limit: 10000,
      remaining: 8000,
      resetsOn: "Jun 1, 2026",
    },
    subscriptionPeriod: "May 26, 2026 ~ Jun 26, 2026",
    subscriptionStatus: "Active",
    userType: "YETTEY",
    workspaceCount: 4,
  },
  usr_1002: {
    authProvider: "Kakao",
    autoRenewalStatus: "Enabled",
    billingHistory: [
      {
        amount: "₩40,000",
        date: "May 26, 2026",
        eventType: "Manual Adjustment",
        id: "bill_1002_1",
        newPlan: "Professional",
        paymentMethod: "Card authorization",
        previousPlan: "Trial",
        receipt: {
          amount: "₩40,000",
          billingDate: "May 26, 2026",
          card: "Kakao Pay card ending 0921",
          eventType: "Manual Adjustment",
          paymentMethod: "Card authorization",
          receiptId: "rcpt_1002_0526",
          status: "Trialing",
          taxInvoiceStatus: "Not available",
          transactionId: "txn_kr_20260526_1002",
        },
        status: "Trialing",
      },
    ],
    billingCycle: "Monthly",
    billingStartDate: "May 26, 2026",
    consecutiveSubscriptionCount: "0 months",
    createdDate: "May 26, 2026",
    creditHistory: [
      {
        admin: "Sarah Admin",
        amount: 1200,
        id: "credit_1002_1",
        reason: "Trial onboarding support for video processing test.",
        recipient: "jun.choi@creatorpack.io",
        timestamp: "May 27, 2026 12:10 PM",
        type: "Subscription Credits",
      },
    ],
    customerInquiries: [
      {
        author: "Jun Choi",
        body: "How many shortform clips can I generate during the trial?",
        noteType: "Customer Inquiry",
        timestamp: "May 27, 2026 11:02 AM",
      },
    ],
    email: "jun.choi@creatorpack.io",
    id: "usr_1002",
    internalNotes: [
      {
        author: "Sarah Admin",
        body: "Trial account asked about upload processing limits.",
        noteType: "Internal Note",
        timestamp: "May 27, 2026 11:08 AM",
      },
      {
        author: "Minjun Ops",
        body: "Potential abuse monitoring: high upload retries during trial.",
        noteType: "Risk Flag",
        timestamp: "May 27, 2026 04:21 PM",
      },
    ],
    language: "Korean",
    lastActive: "May 27, 2026 08:44 AM",
    lastLogin: "May 27, 2026 08:41 AM",
    lastPasswordChange: "Not set",
    linkedProviders: ["Kakao"],
    mfaEnabled: false,
    name: "Jun Choi",
    nextBillingDate: "Jun 09, 2026",
    plan: "Professional",
    planChangeLogs: [
      {
        admin: "Sarah Admin",
        effectivePeriod: "May 26, 2026 ~ Jun 09, 2026",
        id: "planlog_1002_1",
        newPlan: "Professional",
        note: "Temporary trial authorization for VPICK onboarding.",
        previousPlan: "Trial",
        timestamp: "May 26, 2026 06:32 PM",
      },
    ],
    projects: [
      {
        activity: [
          {
            actor: "Jun Choi",
            event: "Generated 12 shortform clips",
            id: "act_shorts_1",
            timestamp: "May 27, 2026 08:35 AM",
          },
          {
            actor: "Creator Pack Ops",
            event: "Uploaded source video batch",
            id: "act_shorts_2",
            timestamp: "May 26, 2026 07:18 PM",
          },
        ],
        createdDate: "May 26, 2026",
        generatedAssets: 64,
        id: "prj_weekly_shorts",
        images: 18,
        memberList: [
          {
            email: "jun.choi@creatorpack.io",
            id: "mem_shorts_1",
            lastActive: "May 27, 2026",
            name: "Jun Choi",
            role: "Owner",
          },
          {
            email: "ops@creatorpack.io",
            id: "mem_shorts_2",
            lastActive: "May 26, 2026",
            name: "Creator Pack Ops",
            role: "Editor",
          },
        ],
        members: 3,
        mostActiveMember: "Jun Choi",
        name: "Weekly Shorts Pipeline",
        owner: "Jun Choi",
        recentAssets: [
          {
            createdAt: "May 27, 2026",
            createdBy: "Jun Choi",
            fileCount: 12,
            id: "asset_shorts_1",
            name: "Weekly shorts exports",
            type: "Video",
          },
          {
            createdAt: "May 26, 2026",
            createdBy: "Creator Pack Ops",
            fileCount: 6,
            id: "asset_shorts_2",
            name: "Raw upload batch",
            type: "Folder",
          },
        ],
        storageUsage: "64 GB",
        uploadedAssets: 42,
        videos: 88,
        workspace: "Creator Pack",
      },
    ],
    purchasedCredits: 900,
    recoveryEmail: "jun.ops@creatorpack.io",
    role: "Admin",
    status: "Trial",
    subscriptionCredits: {
      limit: 5000,
      remaining: 4700,
      resetsOn: "Jun 9, 2026",
    },
    subscriptionPeriod: "May 26, 2026 ~ Jun 09, 2026",
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
  const user = useMemo(() => getUser(userId), [userId])

  return <UserDetailWorkspace key={user.id} user={user} />
}

function UserDetailWorkspace({ user }: { user: UserDetail }) {
  const [activeTab, setActiveTab] = useState<Tab>("profile")
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState(user.name)
  const [language, setLanguage] = useState(user.language)
  const [subscriptionCredits, setSubscriptionCredits] = useState(user.subscriptionCredits)
  const [purchasedCredits, setPurchasedCredits] = useState(user.purchasedCredits)
  const [creditHistory, setCreditHistory] = useState(user.creditHistory)
  const [grantStage, setGrantStage] = useState<"form" | "confirm" | null>(null)
  const [grantAmount, setGrantAmount] = useState("")
  const [grantReason, setGrantReason] = useState("")
  const [grantType, setGrantType] = useState<CreditType>("Purchased Credits")
  const [currentPlan, setCurrentPlan] = useState(user.plan)
  const [billingHistory, setBillingHistory] = useState(user.billingHistory)
  const [planChangeLogs, setPlanChangeLogs] = useState(user.planChangeLogs)
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptInfo | null>(null)
  const [planChangeStage, setPlanChangeStage] = useState<PlanChangeStage | null>(null)
  const [planChangeForm, setPlanChangeForm] = useState<PlanChangeForm>({
    adminNote: "",
    applyPeriod: "After current subscription ends",
    effectiveEndDate: "",
    effectiveStartDate: "",
    newPlan: getFallbackNextPlan(user.plan),
  })

  const displayUser = useMemo<UserDetail>(
    () => ({
      ...user,
      billingHistory,
      creditHistory,
      language,
      name: displayName,
      plan: currentPlan,
      planChangeLogs,
      purchasedCredits,
      subscriptionCredits,
    }),
    [
      billingHistory,
      creditHistory,
      currentPlan,
      displayName,
      language,
      planChangeLogs,
      purchasedCredits,
      subscriptionCredits,
      user,
    ]
  )

  const parsedGrantAmount = Number.parseInt(grantAmount.replaceAll(",", ""), 10)
  const canReviewGrant =
    Number.isFinite(parsedGrantAmount) && parsedGrantAmount > 0 && grantReason.trim().length > 0
  const canReviewPlanChange =
    planChangeForm.newPlan !== displayUser.plan &&
    (planChangeForm.applyPeriod === "After current subscription ends" ||
      (planChangeForm.effectiveStartDate.length > 0 &&
        planChangeForm.effectiveEndDate.length > 0))

  async function handleCopy(label: string, value: string) {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedField(label)
      window.setTimeout(() => setCopiedField(null), 1200)
    } catch {
      setCopiedField(null)
    }
  }

  function resetGrantForm() {
    setGrantStage(null)
    setGrantAmount("")
    setGrantReason("")
    setGrantType("Purchased Credits")
  }

  function confirmCreditGrant() {
    if (!Number.isFinite(parsedGrantAmount) || parsedGrantAmount <= 0) {
      return
    }

    if (grantType === "Purchased Credits") {
      setPurchasedCredits((current) => current + parsedGrantAmount)
    } else {
      setSubscriptionCredits((current) => ({
        ...current,
        remaining: current.remaining + parsedGrantAmount,
      }))
    }

    setCreditHistory((current) => [
      {
        admin: "Sarah Mitchell",
        amount: parsedGrantAmount,
        id: `credit_${Date.now()}`,
        reason: grantReason.trim(),
        recipient: displayUser.email,
        timestamp: formatAuditTimestamp(new Date()),
        type: grantType,
      },
      ...current,
    ])
    resetGrantForm()
  }

  function openPlanChangeDialog() {
    setPlanChangeForm({
      adminNote: "",
      applyPeriod: "After current subscription ends",
      effectiveEndDate: "",
      effectiveStartDate: "",
      newPlan: getFallbackNextPlan(displayUser.plan),
    })
    setPlanChangeStage("form")
  }

  function resetPlanChangeDialog() {
    setPlanChangeStage(null)
  }

  function confirmPlanChange() {
    const effectivePeriod =
      planChangeForm.applyPeriod === "Custom period" &&
      planChangeForm.effectiveStartDate &&
      planChangeForm.effectiveEndDate
        ? `${planChangeForm.effectiveStartDate} ~ ${planChangeForm.effectiveEndDate}`
        : `After current period ends (${displayUser.subscriptionPeriod})`
    const timestamp = formatAuditTimestamp(new Date())

    setPlanChangeLogs((current) => [
      {
        admin: "Sarah Mitchell",
        effectivePeriod,
        id: `planlog_${Date.now()}`,
        newPlan: planChangeForm.newPlan,
        note: planChangeForm.adminNote.trim() || "Manual subscription plan change.",
        previousPlan: displayUser.plan,
        timestamp,
      },
      ...current,
    ])

    setBillingHistory((current) => [
      {
        amount:
          planChangeForm.applyPeriod === "Custom period"
            ? "₩0"
            : getPlanMonthlyPrice(planChangeForm.newPlan),
        date: "May 28, 2026",
        eventType: "Manual Adjustment",
        id: `bill_manual_${Date.now()}`,
        newPlan: planChangeForm.newPlan,
        paymentMethod: "Admin adjustment",
        previousPlan: displayUser.plan,
        receipt: {
          amount:
            planChangeForm.applyPeriod === "Custom period"
              ? "₩0"
              : getPlanMonthlyPrice(planChangeForm.newPlan),
          billingDate: "May 28, 2026",
          card: "No card charge",
          eventType: "Manual Adjustment",
          paymentMethod: "Admin adjustment",
          receiptId: `rcpt_manual_${Date.now()}`,
          status: "Scheduled",
          taxInvoiceStatus: "Not applicable",
          transactionId: `manual_${Date.now()}`,
        },
        status: "Scheduled",
      },
      ...current,
    ])

    setCurrentPlan(planChangeForm.newPlan)
    resetPlanChangeDialog()
  }

  return (
    <DashboardLayout>
      <PageHeader
        breadcrumbs={[
          { label: "Users" },
          { label: displayUser.name },
        ]}
        title={displayUser.name}
        description={`${displayUser.email} / ${displayUser.workspaceCount} workspaces`}
      />

      <UserSummary user={displayUser} onCopy={handleCopy} copiedField={copiedField} />

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
        {activeTab === "profile" ? (
          <ProfileTab
            user={displayUser}
            copiedField={copiedField}
            onCopy={handleCopy}
            onNameSave={setDisplayName}
            onLanguageSave={setLanguage}
          />
        ) : null}
        {activeTab === "projects" ? <ProjectsTab projects={displayUser.projects} /> : null}
        {activeTab === "billing" ? (
          <BillingTab
            user={displayUser}
            onChangePlan={openPlanChangeDialog}
            onGrantCredits={() => setGrantStage("form")}
            onViewReceipt={setSelectedReceipt}
          />
        ) : null}
      </div>

      <NotesSection
        customerInquiries={displayUser.customerInquiries}
        internalNotes={displayUser.internalNotes}
      />

      <GrantCreditsDialog
        amount={grantAmount}
        canReview={canReviewGrant}
        creditType={grantType}
        isOpen={grantStage !== null}
        reason={grantReason}
        stage={grantStage}
        user={displayUser}
        onAmountChange={setGrantAmount}
        onCancel={resetGrantForm}
        onConfirm={confirmCreditGrant}
        onReasonChange={setGrantReason}
        onReview={() => setGrantStage("confirm")}
        onTypeChange={setGrantType}
      />
      <PlanChangeDialog
        canReview={canReviewPlanChange}
        currentPlan={displayUser.plan}
        form={planChangeForm}
        stage={planChangeStage}
        user={displayUser}
        onCancel={resetPlanChangeDialog}
        onConfirm={confirmPlanChange}
        onFormChange={setPlanChangeForm}
        onReview={() => setPlanChangeStage("confirm")}
      />
      <ReceiptDialog receipt={selectedReceipt} onClose={() => setSelectedReceipt(null)} />
    </DashboardLayout>
  )
}

function UserSummary({
  copiedField,
  onCopy,
  user,
}: {
  copiedField: string | null
  onCopy: (label: string, value: string) => void
  user: UserDetail
}) {
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
            <button
              className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-slate-400 transition hover:text-slate-700"
              onClick={() => onCopy("summary-user-id", user.id)}
              type="button"
            >
              <span>User ID: {user.id}</span>
              <Copy className="size-3.5" />
              {copiedField === "summary-user-id" ? (
                <span className="text-emerald-600">Copied</span>
              ) : null}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <AdminButton variant="primary">
            <LogIn className="size-4" />
            Login as Yettey
          </AdminButton>
          <AdminButton>
            <LogIn className="size-4" />
            Login as VPick
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

      <div className="grid border-t border-slate-100 md:grid-cols-3 xl:grid-cols-6">
        <SummaryItem label="Service" value={<ServicePill service={user.userType} />} />
        <SummaryItem label="Plan" value={user.plan} detail="View billing" />
        <SummaryItem
          label="Subscription Credits"
          value={`${formatNumber(user.subscriptionCredits.remaining)} / ${formatNumber(user.subscriptionCredits.limit)}`}
          detail={`Resets ${user.subscriptionCredits.resetsOn}`}
        />
        <SummaryItem label="Purchased Credits" value={formatNumber(user.purchasedCredits)} />
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
  value: ReactNode
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

function ProfileTab({
  copiedField,
  onCopy,
  onLanguageSave,
  onNameSave,
  user,
}: {
  copiedField: string | null
  onCopy: (label: string, value: string) => void
  onLanguageSave: (value: string) => void
  onNameSave: (value: string) => void
  user: UserDetail
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
        <h3 className="text-lg font-bold text-slate-950">Profile</h3>
        <div className="mt-6 grid gap-x-10 gap-y-6 md:grid-cols-2">
          <InfoField
            label="User ID"
            value={user.id}
            copied={copiedField === "profile-user-id"}
            copyable
            onCopy={() => onCopy("profile-user-id", user.id)}
          />
          <InfoField
            label="Email"
            value={user.email}
            copied={copiedField === "profile-email"}
            copyable
            onCopy={() => onCopy("profile-email", user.email)}
          />
          <EditableInfoField label="Name" value={user.name} onSave={onNameSave} />
          <InfoField label="Auth Provider" value={user.authProvider} />
          <EditableInfoField label="Language" value={user.language} onSave={onLanguageSave} />
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
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [memberLists, setMemberLists] = useState<Record<string, ProjectMember[]>>(
    () =>
      Object.fromEntries(
        projects.map((project) => [project.id, project.memberList])
      )
  )
  const [projectNames, setProjectNames] = useState<Record<string, string>>({})
  const [archivedProjects, setArchivedProjects] = useState<Record<string, boolean>>({})
  const [confirmAction, setConfirmAction] = useState<ProjectConfirmAction | null>(null)
  const selectedProject = selectedProjectId
    ? projects.find((project) => project.id === selectedProjectId)
    : null

  function getProjectMembers(project: ProjectRow) {
    return memberLists[project.id] ?? project.memberList
  }

  function changeMemberRole(projectId: string, memberId: string, role: ProjectRole) {
    setMemberLists((current) => ({
      ...current,
      [projectId]: (current[projectId] ?? []).map((member) =>
        member.id === memberId ? { ...member, role } : member
      ),
    }))
  }

  function addMockMember(projectId: string) {
    setMemberLists((current) => {
      const members = current[projectId] ?? []
      return {
        ...current,
        [projectId]: [
          ...members,
          {
            email: "support@yettey.com",
            id: `mem_${Date.now()}`,
            lastActive: "Just now",
            name: "Support Admin",
            role: "Viewer",
          },
        ],
      }
    })
  }

  function removeMember(projectId: string, memberId: string) {
    setMemberLists((current) => ({
      ...current,
      [projectId]: (current[projectId] ?? []).filter(
        (member) => member.id !== memberId
      ),
    }))
  }

  function transferOwnership(projectId: string, memberId: string) {
    setMemberLists((current) => ({
      ...current,
      [projectId]: (current[projectId] ?? []).map((member) => ({
        ...member,
        role: member.id === memberId ? "Owner" : member.role === "Owner" ? "Admin" : member.role,
      })),
    }))
  }

  function handleConfirmAction() {
    if (!confirmAction) {
      return
    }

    if (confirmAction.type === "archive") {
      setArchivedProjects((current) => ({
        ...current,
        [confirmAction.projectId]: true,
      }))
    }

    if (confirmAction.type === "remove-member") {
      removeMember(confirmAction.projectId, confirmAction.memberId)
    }

    if (confirmAction.type === "transfer-ownership") {
      transferOwnership(confirmAction.projectId, confirmAction.memberId)
    }

    setConfirmAction(null)
  }

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
        <div className="border-b border-slate-100 p-6">
          <h3 className="text-lg font-bold text-slate-950">Projects</h3>
          <p className="mt-1 text-sm text-slate-500">
            Click a project row to inspect workspace, members, permissions, assets, and recent activity.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px]">
            <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-4">Project Name</th>
                <th className="px-6 py-4">Workspace</th>
                <th className="px-6 py-4">Members</th>
                <th className="px-6 py-4">Created Date</th>
                <th className="px-6 py-4">Storage Usage</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projects.map((project) => {
                const isArchived = archivedProjects[project.id]
                return (
                  <tr
                    key={project.id}
                    className="cursor-pointer transition hover:bg-violet-50/60"
                    onClick={() => setSelectedProjectId(project.id)}
                  >
                    <td className="px-6 py-5">
                      <div className="text-sm font-bold text-slate-950">
                        {projectNames[project.id] ?? project.name}
                      </div>
                      <div className="mt-1 text-xs font-semibold text-slate-400">
                        {project.id}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-600">
                      {project.workspace}
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-600">
                      {formatNumber(getProjectMembers(project).length)}
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-600">
                      {project.createdDate}
                    </td>
                    <td className="px-6 py-5 text-sm font-semibold text-slate-800">
                      {project.storageUsage}
                    </td>
                    <td className="px-6 py-5">
                      {isArchived ? (
                        <span className={pillClass("bg-slate-100 text-slate-600 ring-slate-200")}>
                          Archived
                        </span>
                      ) : (
                        <span className={pillClass("bg-emerald-50 text-emerald-600 ring-emerald-100")}>
                          Active
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {selectedProject ? (
        <ProjectDetailDrawer
          key={selectedProject.id}
          archived={Boolean(archivedProjects[selectedProject.id])}
          members={getProjectMembers(selectedProject)}
          project={{
            ...selectedProject,
            name: projectNames[selectedProject.id] ?? selectedProject.name,
          }}
          onAddMember={() => addMockMember(selectedProject.id)}
          onArchive={() =>
            setConfirmAction({
              projectId: selectedProject.id,
              projectName: projectNames[selectedProject.id] ?? selectedProject.name,
              type: "archive",
            })
          }
          onChangeRole={(memberId, role) =>
            changeMemberRole(selectedProject.id, memberId, role)
          }
          onClose={() => setSelectedProjectId(null)}
          onRemoveMember={(member) =>
            setConfirmAction({
              memberId: member.id,
              memberName: member.name,
              projectId: selectedProject.id,
              projectName: projectNames[selectedProject.id] ?? selectedProject.name,
              type: "remove-member",
            })
          }
          onRename={(name) =>
            setProjectNames((current) => ({
              ...current,
              [selectedProject.id]: name,
            }))
          }
          onTransferOwnership={(member) =>
            setConfirmAction({
              memberId: member.id,
              memberName: member.name,
              projectId: selectedProject.id,
              projectName: projectNames[selectedProject.id] ?? selectedProject.name,
              type: "transfer-ownership",
            })
          }
        />
      ) : null}

      <ProjectConfirmDialog
        action={confirmAction}
        onCancel={() => setConfirmAction(null)}
        onConfirm={handleConfirmAction}
      />
    </>
  )
}

function ProjectDetailDrawer({
  archived,
  members,
  onAddMember,
  onArchive,
  onChangeRole,
  onClose,
  onRemoveMember,
  onRename,
  onTransferOwnership,
  project,
}: {
  archived: boolean
  members: ProjectMember[]
  onAddMember: () => void
  onArchive: () => void
  onChangeRole: (memberId: string, role: ProjectRole) => void
  onClose: () => void
  onRemoveMember: (member: ProjectMember) => void
  onRename: (name: string) => void
  onTransferOwnership: (member: ProjectMember) => void
  project: ProjectRow
}) {
  const [isRenaming, setIsRenaming] = useState(false)
  const [nameDraft, setNameDraft] = useState(project.name)
  const currentOwner = members.find((member) => member.role === "Owner")?.name ?? project.owner

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-slate-950/25 backdrop-blur-sm">
      <aside className="h-full w-full max-w-3xl overflow-y-auto border-l border-slate-200 bg-white shadow-2xl shadow-slate-950/20">
        <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 p-6 backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Project Detail
                </p>
                {archived ? (
                  <span className={pillClass("bg-slate-100 text-slate-600 ring-slate-200")}>
                    Archived
                  </span>
                ) : (
                  <span className={pillClass("bg-emerald-50 text-emerald-600 ring-emerald-100")}>
                    Active
                  </span>
                )}
              </div>
              {isRenaming ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  <input
                    className="h-10 min-w-0 flex-1 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-950 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
                    value={nameDraft}
                    onChange={(event) => setNameDraft(event.target.value)}
                  />
                  <AdminButton
                    className="h-10 px-3"
                    disabled={nameDraft.trim().length === 0}
                    variant="primary"
                    onClick={() => {
                      onRename(nameDraft.trim())
                      setIsRenaming(false)
                    }}
                  >
                    Save
                  </AdminButton>
                  <AdminButton
                    className="h-10 px-3"
                    onClick={() => {
                      setNameDraft(project.name)
                      setIsRenaming(false)
                    }}
                  >
                    Cancel
                  </AdminButton>
                </div>
              ) : (
                <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                  {project.name}
                </h3>
              )}
              <p className="mt-1 text-sm font-medium text-slate-500">
                {project.workspace} / {project.id}
              </p>
            </div>
            <button
              className="inline-flex size-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-950"
              onClick={onClose}
              type="button"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <AdminButton onClick={() => setIsRenaming(true)}>
              <Edit3 className="size-4" />
              Rename Project
            </AdminButton>
            <AdminButton onClick={onAddMember}>
              <UserPlus className="size-4" />
              Add Member
            </AdminButton>
            <AdminButton onClick={onArchive} disabled={archived}>
              <Archive className="size-4" />
              Archive Project
            </AdminButton>
          </div>
        </div>

        <div className="space-y-6 p-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
            <h4 className="text-base font-bold text-slate-950">Basic Information</h4>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <ProjectDetailRow label="Project Name" value={project.name} />
              <ProjectDetailRow label="Workspace" value={project.workspace} />
              <ProjectDetailRow label="Project ID" value={project.id} />
              <ProjectDetailRow label="Created Date" value={project.createdDate} />
              <ProjectDetailRow label="Owner" value={currentOwner} />
              <ProjectDetailRow label="Current Storage Usage" value={project.storageUsage} />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="text-base font-bold text-slate-950">Member Management</h4>
                <p className="mt-1 text-sm text-slate-500">
                  Adjust roles, transfer ownership, or remove project members.
                </p>
              </div>
              <AdminButton onClick={onAddMember}>
                <UserPlus className="size-4" />
                Add Member
              </AdminButton>
            </div>
            <div className="mt-5 space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="grid gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 md:grid-cols-[1fr_auto_auto_auto]"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-bold text-slate-950">
                        {member.name}
                      </p>
                      <ProjectRolePill role={member.role} />
                    </div>
                    <p className="mt-1 truncate text-xs font-medium text-slate-500">
                      {member.email} / Last active {member.lastActive}
                    </p>
                  </div>
                  <select
                    className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-950 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
                    value={member.role}
                    onChange={(event) =>
                      onChangeRole(member.id, event.target.value as ProjectRole)
                    }
                  >
                    <option>Owner</option>
                    <option>Admin</option>
                    <option>Editor</option>
                    <option>Viewer</option>
                  </select>
                  <AdminButton
                    className="h-10 px-3"
                    disabled={member.role === "Owner"}
                    onClick={() => onTransferOwnership(member)}
                  >
                    Make Owner
                  </AdminButton>
                  <AdminButton
                    className="h-10 border-rose-200 px-3 text-rose-600 hover:border-rose-300 hover:bg-rose-50"
                    disabled={member.role === "Owner"}
                    onClick={() => onRemoveMember(member)}
                  >
                    Remove
                  </AdminButton>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
            <h4 className="text-base font-bold text-slate-950">Content / Asset Overview</h4>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <ProjectMetricCard label="Uploaded Assets" value={formatNumber(project.uploadedAssets)} />
              <ProjectMetricCard label="Generated Assets" value={formatNumber(project.generatedAssets)} />
              <ProjectMetricCard label="Images / Videos" value={`${formatNumber(project.images)} / ${formatNumber(project.videos)}`} />
              <ProjectMetricCard label="Most Active Member" value={project.mostActiveMember} />
            </div>
          </section>

          <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
              <h4 className="text-base font-bold text-slate-950">Recent Content</h4>
              <div className="mt-5 space-y-3">
                {project.recentAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4"
                  >
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                      <FileImage className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-bold text-slate-950">{asset.name}</p>
                        <span className={pillClass("bg-white text-slate-600 ring-slate-200")}>
                          {asset.type}
                        </span>
                      </div>
                      <p className="mt-1 text-xs font-medium text-slate-500">
                        {asset.fileCount} files / {asset.createdBy} / {asset.createdAt}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
              <h4 className="text-base font-bold text-slate-950">Recent Activity</h4>
              <div className="mt-5 space-y-3">
                {project.activity.map((activity) => (
                  <div
                    key={activity.id}
                    className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                  >
                    <p className="text-sm font-bold text-slate-950">
                      {activity.event}
                    </p>
                    <p className="mt-1 text-xs font-medium text-slate-500">
                      {activity.actor} / {activity.timestamp}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </aside>
    </div>
  )
}

function ProjectDetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-sm font-bold text-slate-950">{value}</p>
    </div>
  )
}

function ProjectMetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-3 text-lg font-bold text-slate-950">{value}</p>
    </div>
  )
}

function ProjectConfirmDialog({
  action,
  onCancel,
  onConfirm,
}: {
  action: ProjectConfirmAction | null
  onCancel: () => void
  onConfirm: () => void
}) {
  if (!action) {
    return null
  }

  const message =
    action.type === "archive"
      ? `Are you sure you want to archive ${action.projectName}?`
      : action.type === "remove-member"
        ? `Are you sure you want to remove ${action.memberName} from ${action.projectName}?`
        : `Are you sure you want to transfer ownership of ${action.projectName} to ${action.memberName}?`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-950/20">
        <h3 className="text-lg font-bold text-slate-950">Confirm Project Action</h3>
        <p className="mt-3 text-sm leading-6 text-slate-600">{message}</p>
        <div className="mt-6 flex justify-end gap-2">
          <AdminButton onClick={onCancel}>Cancel</AdminButton>
          <AdminButton
            className={cn(
              action.type === "archive" || action.type === "remove-member"
                ? "border-rose-200 bg-rose-500 text-white hover:border-rose-500 hover:bg-rose-600"
                : ""
            )}
            variant={action.type === "transfer-ownership" ? "primary" : "secondary"}
            onClick={onConfirm}
          >
            Confirm
          </AdminButton>
        </div>
      </div>
    </div>
  )
}

function BillingTab({
  onChangePlan,
  onGrantCredits,
  onViewReceipt,
  user,
}: {
  onChangePlan: () => void
  onGrantCredits: () => void
  onViewReceipt: (receipt: ReceiptInfo) => void
  user: UserDetail
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <SubscriptionLifecycleCard user={user} onChangePlan={onChangePlan} />

        <CreditManagementCard user={user} onGrantCredits={onGrantCredits} />
      </div>

      <CreditHistoryTable rows={user.creditHistory} />

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-950">Billing History</h3>
            <p className="mt-1 text-sm text-slate-500">
              Subscription events, payment results, receipts, and manual adjustments.
            </p>
          </div>
          <AdminButton onClick={onChangePlan}>
            <ReceiptText className="size-4" />
            Change Plan
          </AdminButton>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px]">
            <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Event Type</th>
                <th className="px-6 py-4">Previous Plan</th>
                <th className="px-6 py-4">New Plan</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Payment Method</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {user.billingHistory.map((row) => (
                <tr key={row.id} className="transition hover:bg-slate-50">
                  <td className="px-6 py-5 text-sm font-medium text-slate-700">
                    {row.date}
                  </td>
                  <td className="px-6 py-5 text-sm font-bold text-slate-950">
                    {row.eventType}
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-600">
                    {row.previousPlan}
                  </td>
                  <td className="px-6 py-5 text-sm font-semibold text-slate-800">
                    {row.newPlan}
                  </td>
                  <td className="px-6 py-5 text-sm font-semibold text-slate-800">
                    {row.amount}
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-600">
                    {row.paymentMethod}
                  </td>
                  <td className="px-6 py-5">
                    <BillingStatusPill status={row.status} />
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-wrap gap-2">
                      <AdminButton
                        className="h-9 px-3"
                        onClick={() => onViewReceipt(row.receipt)}
                      >
                        View
                      </AdminButton>
                      <AdminButton
                        className="h-9 px-3"
                        onClick={() => onViewReceipt(row.receipt)}
                      >
                        Download
                      </AdminButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
        <div className="border-b border-slate-100 p-6">
          <h3 className="text-lg font-bold text-slate-950">Plan Change Audit</h3>
          <p className="mt-1 text-sm text-slate-500">
            Admin plan changes, effective periods, and operational notes.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px]">
            <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Admin</th>
                <th className="px-6 py-4">Previous Plan</th>
                <th className="px-6 py-4">New Plan</th>
                <th className="px-6 py-4">Effective Period</th>
                <th className="px-6 py-4">Reason / Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {user.planChangeLogs.map((row) => (
                <tr key={row.id} className="transition hover:bg-slate-50">
                  <td className="px-6 py-5 text-sm font-medium text-slate-700">
                    {row.timestamp}
                  </td>
                  <td className="px-6 py-5 text-sm font-bold text-slate-950">
                    {row.admin}
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-600">
                    {row.previousPlan}
                  </td>
                  <td className="px-6 py-5 text-sm font-semibold text-slate-900">
                    {row.newPlan}
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-600">
                    {row.effectivePeriod}
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-600">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function SubscriptionLifecycleCard({
  onChangePlan,
  user,
}: {
  onChangePlan: () => void
  user: UserDetail
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-950">Subscription Information</h3>
          <p className="mt-1 text-sm text-slate-500">
            Billing lifecycle and subscription state for operational support.
          </p>
        </div>
        <AdminButton variant="primary" onClick={onChangePlan}>
          <ReceiptText className="size-4" />
          Change Plan
        </AdminButton>
      </div>

      <div className="mt-6 space-y-5">
        <SecurityRow label="Current Plan" value={user.plan} />
        <SecurityRow label="Subscription Status" value={user.subscriptionStatus} />
        <SecurityRow label="Billing Start Date" value={user.billingStartDate} />
        <SecurityRow label="Next Billing Date" value={user.nextBillingDate} />
        <SecurityRow
          label="Consecutive Subscription Count"
          value={user.consecutiveSubscriptionCount}
        />
        <SecurityRow label="Billing Cycle" value={user.billingCycle} />
        <SecurityRow label="Auto Renewal Status" value={user.autoRenewalStatus} />
        <SecurityRow
          label="Current Subscription Period"
          value={user.subscriptionPeriod}
        />
      </div>
    </section>
  )
}

function CreditManagementCard({
  onGrantCredits,
  user,
}: {
  onGrantCredits: () => void
  user: UserDetail
}) {
  const subscriptionUsed =
    user.subscriptionCredits.limit - user.subscriptionCredits.remaining
  const subscriptionRemainingRatio = Math.min(
    100,
    Math.round((user.subscriptionCredits.remaining / user.subscriptionCredits.limit) * 100)
  )

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-2">
          <Coins className="size-5 text-violet-600" />
          <div>
            <h3 className="text-lg font-bold text-slate-950">Credit Management</h3>
            <p className="mt-1 text-sm text-slate-500">
              Subscription credits reset monthly. Purchased credits do not expire monthly.
            </p>
          </div>
        </div>
        <AdminButton variant="primary" onClick={onGrantCredits}>
          <Coins className="size-4" />
          Grant Credits
        </AdminButton>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Monthly Subscription Credits
          </p>
          <div className="mt-3 flex items-end justify-between gap-4">
            <p className="text-2xl font-bold text-slate-950">
              {formatNumber(user.subscriptionCredits.remaining)}
              <span className="text-base text-slate-400">
                {" "}
                / {formatNumber(user.subscriptionCredits.limit)}
              </span>
            </p>
            <p className="text-xs font-bold text-slate-500">
              {subscriptionRemainingRatio}% left
            </p>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-violet-600"
              style={{ width: `${subscriptionRemainingRatio}%` }}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold text-slate-500">
            <span>Used {formatNumber(subscriptionUsed)}</span>
            <span>Resets {user.subscriptionCredits.resetsOn}</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Purchased Credits
          </p>
          <p className="mt-3 text-2xl font-bold text-slate-950">
            {formatNumber(user.purchasedCredits)}
          </p>
          <p className="mt-3 text-xs font-semibold leading-5 text-slate-500">
            Extra purchased credits remain available after monthly subscription reset.
          </p>
        </div>
      </div>
    </section>
  )
}

function CreditHistoryTable({ rows }: { rows: CreditLedgerEntry[] }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
      <div className="border-b border-slate-100 p-6">
        <h3 className="text-lg font-bold text-slate-950">Credit Audit Log</h3>
        <p className="mt-1 text-sm text-slate-500">
          Manual grants and operational credit adjustments for audit review.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px]">
          <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-6 py-4">Timestamp</th>
              <th className="px-6 py-4">Admin</th>
              <th className="px-6 py-4">Recipient</th>
              <th className="px-6 py-4">Credit Type</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.id} className="transition hover:bg-slate-50">
                <td className="px-6 py-5 text-sm font-medium text-slate-700">
                  {row.timestamp}
                </td>
                <td className="px-6 py-5 text-sm font-bold text-slate-950">
                  {row.admin}
                </td>
                <td className="px-6 py-5 text-sm text-slate-600">{row.recipient}</td>
                <td className="px-6 py-5">
                  <CreditTypePill type={row.type} />
                </td>
                <td className="px-6 py-5 text-sm font-bold text-slate-950">
                  +{formatNumber(row.amount)}
                </td>
                <td className="px-6 py-5 text-sm text-slate-600">{row.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function NotesSection({
  customerInquiries,
  internalNotes,
}: {
  customerInquiries: CustomerInquiry[]
  internalNotes: InternalNote[]
}) {
  const [activeNoteTab, setActiveNoteTab] = useState<NoteTab>("inquiries")
  const notes =
    activeNoteTab === "inquiries" ? customerInquiries : internalNotes

  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <MessageSquare className="mt-0.5 size-5 text-violet-600" />
          <div>
            <h3 className="text-lg font-bold text-slate-950">Notes</h3>
            <p className="mt-1 text-sm text-slate-500">
              Customer messages and private operational notes for admin review.
            </p>
          </div>
        </div>
        <AdminButton>Add Note</AdminButton>
      </div>

      <div className="mt-6 inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
        <NoteTabButton
          active={activeNoteTab === "inquiries"}
          count={customerInquiries.length}
          label="Customer Inquiries"
          onClick={() => setActiveNoteTab("inquiries")}
        />
        <NoteTabButton
          active={activeNoteTab === "internal"}
          count={internalNotes.length}
          label="Internal Notes"
          onClick={() => setActiveNoteTab("internal")}
        />
      </div>

      <div className="mt-6 space-y-3">
        {notes.map((note) => (
          <div
            key={`${note.author}-${note.timestamp}`}
            className="rounded-xl border border-slate-100 bg-slate-50 p-4"
          >
            <div className="flex flex-wrap items-center gap-2">
              <NoteTypePill type={note.noteType} />
              <span className="text-xs font-semibold text-slate-500">
                {note.timestamp}
              </span>
            </div>
            <p className="mt-3 text-sm font-semibold leading-6 text-slate-900">
              {note.body}
            </p>
            <p className="mt-3 text-xs font-bold text-slate-500">
              {note.author}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

function GrantCreditsDialog({
  amount,
  canReview,
  creditType,
  isOpen,
  onAmountChange,
  onCancel,
  onConfirm,
  onReasonChange,
  onReview,
  onTypeChange,
  reason,
  stage,
  user,
}: {
  amount: string
  canReview: boolean
  creditType: CreditType
  isOpen: boolean
  onAmountChange: (value: string) => void
  onCancel: () => void
  onConfirm: () => void
  onReasonChange: (value: string) => void
  onReview: () => void
  onTypeChange: (value: CreditType) => void
  reason: string
  stage: "form" | "confirm" | null
  user: UserDetail
}) {
  const parsedAmount = Number.parseInt(amount.replaceAll(",", ""), 10) || 0

  if (!isOpen || stage === null) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20">
        {stage === "form" ? (
          <>
            <div className="border-b border-slate-100 p-6">
              <div className="flex items-center gap-2">
                <Coins className="size-5 text-violet-600" />
                <h3 className="text-lg font-bold text-slate-950">Grant Credits</h3>
              </div>
              <p className="mt-2 text-sm text-slate-500">
                Add operational credits for compensation, support, promotion, or recovery.
              </p>
            </div>
            <div className="space-y-5 p-6">
              <FieldLabel label="Credit Amount">
                <input
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-950 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
                  inputMode="numeric"
                  placeholder="5,000"
                  value={amount}
                  onChange={(event) => onAmountChange(event.target.value)}
                />
              </FieldLabel>
              <FieldLabel label="Credit Type">
                <select
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-950 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
                  value={creditType}
                  onChange={(event) => onTypeChange(event.target.value as CreditType)}
                >
                  <option>Purchased Credits</option>
                  <option>Subscription Credits</option>
                </select>
              </FieldLabel>
              <FieldLabel label="Reason / Note">
                <textarea
                  className="min-h-24 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm font-medium text-slate-950 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
                  placeholder="Credits compensated due to upload issue."
                  value={reason}
                  onChange={(event) => onReasonChange(event.target.value)}
                />
              </FieldLabel>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 p-6">
              <AdminButton onClick={onCancel}>Cancel</AdminButton>
              <AdminButton disabled={!canReview} variant="primary" onClick={onReview}>
                Review Grant
              </AdminButton>
            </div>
          </>
        ) : (
          <>
            <div className="border-b border-slate-100 p-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-slate-950">Confirm Credit Grant</h3>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Are you sure you want to grant{" "}
                <span className="font-bold text-slate-950">
                  {formatNumber(parsedAmount)} {creditType.toLowerCase()}
                </span>{" "}
                to <span className="font-bold text-slate-950">{user.email}</span>?
              </p>
            </div>
            <div className="space-y-3 p-6">
              <ConfirmRow label="Recipient" value={user.email} />
              <ConfirmRow label="Credit Type" value={creditType} />
              <ConfirmRow label="Amount" value={formatNumber(parsedAmount)} />
              <ConfirmRow label="Reason" value={reason} />
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 p-6">
              <AdminButton onClick={onCancel}>Cancel</AdminButton>
              <AdminButton variant="primary" onClick={onConfirm}>
                Confirm
              </AdminButton>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function PlanChangeDialog({
  canReview,
  currentPlan,
  form,
  onCancel,
  onConfirm,
  onFormChange,
  onReview,
  stage,
  user,
}: {
  canReview: boolean
  currentPlan: string
  form: PlanChangeForm
  onCancel: () => void
  onConfirm: () => void
  onFormChange: (form: PlanChangeForm) => void
  onReview: () => void
  stage: PlanChangeStage | null
  user: UserDetail
}) {
  if (stage === null) {
    return null
  }

  const effectivePeriod =
    form.applyPeriod === "Custom period" && form.effectiveStartDate && form.effectiveEndDate
      ? `${form.effectiveStartDate} ~ ${form.effectiveEndDate}`
      : `After current subscription ends (${user.subscriptionPeriod})`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20">
        {stage === "form" ? (
          <>
            <div className="border-b border-slate-100 p-6">
              <div className="flex items-center gap-2">
                <ReceiptText className="size-5 text-violet-600" />
                <h3 className="text-lg font-bold text-slate-950">Change Subscription Plan</h3>
              </div>
              <p className="mt-2 text-sm text-slate-500">
                Apply a permanent plan change after the current period, or a temporary adjustment for a custom period.
              </p>
            </div>
            <div className="grid gap-5 p-6 md:grid-cols-2">
              <FieldLabel label="Current Plan">
                <div className="flex h-11 items-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-950">
                  {currentPlan}
                </div>
              </FieldLabel>
              <FieldLabel label="New Plan">
                <select
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-950 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
                  value={form.newPlan}
                  onChange={(event) =>
                    onFormChange({ ...form, newPlan: event.target.value })
                  }
                >
                  {getAvailablePlans(user.userType).map((plan) => (
                    <option key={plan}>{plan}</option>
                  ))}
                </select>
              </FieldLabel>
              <FieldLabel label="Apply Period">
                <select
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-950 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
                  value={form.applyPeriod}
                  onChange={(event) =>
                    onFormChange({
                      ...form,
                      applyPeriod: event.target.value as PlanChangeForm["applyPeriod"],
                    })
                  }
                >
                  <option>After current subscription ends</option>
                  <option>Custom period</option>
                </select>
              </FieldLabel>
              <FieldLabel label="Effective Start Date">
                <input
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-950 outline-none transition disabled:bg-slate-50 disabled:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
                  disabled={form.applyPeriod !== "Custom period"}
                  type="date"
                  value={form.effectiveStartDate}
                  onChange={(event) =>
                    onFormChange({ ...form, effectiveStartDate: event.target.value })
                  }
                />
              </FieldLabel>
              <FieldLabel label="Effective End Date">
                <input
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-950 outline-none transition disabled:bg-slate-50 disabled:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
                  disabled={form.applyPeriod !== "Custom period"}
                  type="date"
                  value={form.effectiveEndDate}
                  onChange={(event) =>
                    onFormChange({ ...form, effectiveEndDate: event.target.value })
                  }
                />
              </FieldLabel>
              <FieldLabel label="Admin Note">
                <textarea
                  className="min-h-24 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm font-medium text-slate-950 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
                  placeholder="Promotion, compensation, enterprise support, or temporary upgrade reason."
                  value={form.adminNote}
                  onChange={(event) =>
                    onFormChange({ ...form, adminNote: event.target.value })
                  }
                />
              </FieldLabel>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 p-6">
              <AdminButton onClick={onCancel}>Cancel</AdminButton>
              <AdminButton disabled={!canReview} variant="primary" onClick={onReview}>
                Review Change
              </AdminButton>
            </div>
          </>
        ) : (
          <>
            <div className="border-b border-slate-100 p-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-slate-950">Confirm Plan Change</h3>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Are you sure you want to change this user&apos;s plan from{" "}
                <span className="font-bold text-slate-950">{currentPlan}</span> to{" "}
                <span className="font-bold text-slate-950">{form.newPlan}</span>?
              </p>
            </div>
            <div className="grid gap-3 p-6 md:grid-cols-2">
              <ConfirmRow label="Current Plan" value={currentPlan} />
              <ConfirmRow label="New Plan" value={form.newPlan} />
              <ConfirmRow label="Effective Period" value={effectivePeriod} />
              <ConfirmRow label="Admin Note" value={form.adminNote || "Manual subscription plan change."} />
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 p-6">
              <AdminButton onClick={onCancel}>Cancel</AdminButton>
              <AdminButton variant="primary" onClick={onConfirm}>
                Confirm
              </AdminButton>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function ReceiptDialog({
  onClose,
  receipt,
}: {
  onClose: () => void
  receipt: ReceiptInfo | null
}) {
  if (!receipt) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-6">
          <div className="flex items-center gap-2">
            <FileText className="size-5 text-violet-600" />
            <div>
              <h3 className="text-lg font-bold text-slate-950">Billing Receipt</h3>
              <p className="mt-1 text-sm text-slate-500">{receipt.receiptId}</p>
            </div>
          </div>
          <button
            className="inline-flex size-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-950"
            onClick={onClose}
            type="button"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="grid gap-3 p-6">
          <ConfirmRow label="Billing Date" value={receipt.billingDate} />
          <ConfirmRow label="Event Type" value={receipt.eventType} />
          <ConfirmRow label="Amount" value={receipt.amount} />
          <ConfirmRow label="Payment Method" value={receipt.paymentMethod} />
          <ConfirmRow label="Card Information" value={receipt.card} />
          <ConfirmRow label="Transaction ID" value={receipt.transactionId} />
          <ConfirmRow label="Status" value={receipt.status} />
          <ConfirmRow label="Tax Invoice" value={receipt.taxInvoiceStatus} />
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-100 p-6">
          <AdminButton onClick={onClose}>Close</AdminButton>
          <AdminButton variant="primary">
            <FileText className="size-4" />
            Download Receipt
          </AdminButton>
        </div>
      </div>
    </div>
  )
}

function InfoField({
  copied,
  copyable,
  label,
  onCopy,
  value,
}: {
  copied?: boolean
  copyable?: boolean
  label: string
  onCopy?: () => void
  value: ReactNode
}) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
          {label}
        </p>
        {copyable ? (
          <button
            className="inline-flex items-center gap-1 text-slate-400 transition hover:text-slate-700"
            onClick={onCopy}
            type="button"
          >
            <Copy className="size-3.5" />
            {copied ? (
              <span className="text-[11px] font-bold text-emerald-600">Copied</span>
            ) : null}
          </button>
        ) : null}
      </div>
      <div className="mt-2 text-sm font-semibold text-slate-900">{value}</div>
    </div>
  )
}

function EditableInfoField({
  label,
  onSave,
  value,
}: {
  label: string
  onSave: (value: string) => void
  value: string
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  if (isEditing) {
    return (
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <input
            className="h-10 min-w-0 flex-1 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-950 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
          <AdminButton
            className="h-10 px-3"
            disabled={draft.trim().length === 0}
            variant="primary"
            onClick={() => {
              onSave(draft.trim())
              setIsEditing(false)
            }}
          >
            Save
          </AdminButton>
          <AdminButton
            className="h-10 px-3"
            onClick={() => {
              setDraft(value)
              setIsEditing(false)
            }}
          >
            Cancel
          </AdminButton>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <button
          className="inline-flex items-center gap-1 text-slate-400 transition hover:text-slate-700"
          onClick={() => {
            setDraft(value)
            setIsEditing(true)
          }}
          type="button"
        >
          <Edit3 className="size-3.5" />
          <span className="text-[11px] font-bold">Edit</span>
        </button>
      </div>
      <div className="mt-2 inline-flex rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900">
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

function ConfirmRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold text-slate-950">{value}</p>
    </div>
  )
}

function FieldLabel({
  children,
  label,
}: {
  children: ReactNode
  label: string
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <div className="mt-2">{children}</div>
    </label>
  )
}

function NoteTabButton({
  active,
  count,
  label,
  onClick,
}: {
  active: boolean
  count: number
  label: string
  onClick: () => void
}) {
  return (
    <button
      className={cn(
        "h-9 rounded-lg px-3 text-sm font-bold transition",
        active
          ? "bg-white text-violet-600 shadow-sm ring-1 ring-slate-200"
          : "text-slate-500 hover:text-slate-950"
      )}
      onClick={onClick}
      type="button"
    >
      {label} <span className="text-xs text-slate-400">{count}</span>
    </button>
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

function ProjectRolePill({ role }: { role: ProjectRole }) {
  const classes = {
    Admin: "bg-slate-900 text-white ring-slate-900",
    Editor: "bg-blue-50 text-blue-600 ring-blue-100",
    Owner: "bg-violet-50 text-violet-600 ring-violet-100",
    Viewer: "bg-slate-100 text-slate-700 ring-slate-200",
  } satisfies Record<ProjectRole, string>

  return <span className={pillClass(classes[role])}>{role}</span>
}

function BillingStatusPill({ status }: { status: BillingHistoryRow["status"] }) {
  const classes = {
    Completed: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    Failed: "bg-rose-50 text-rose-600 ring-rose-100",
    Paid: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    Refunded: "bg-orange-50 text-orange-600 ring-orange-100",
    Scheduled: "bg-blue-50 text-blue-600 ring-blue-100",
    Trialing: "bg-violet-50 text-violet-600 ring-violet-100",
  } satisfies Record<BillingHistoryRow["status"], string>

  return <span className={pillClass(classes[status])}>{status}</span>
}

function CreditTypePill({ type }: { type: CreditType }) {
  return (
    <span
      className={pillClass(
        type === "Purchased Credits"
          ? "bg-emerald-50 text-emerald-600 ring-emerald-100"
          : "bg-violet-50 text-violet-600 ring-violet-100"
      )}
    >
      {type}
    </span>
  )
}

function NoteTypePill({
  type,
}: {
  type: CustomerInquiry["noteType"] | InternalNote["noteType"]
}) {
  const classes = {
    "Customer Inquiry": "bg-blue-50 text-blue-600 ring-blue-100",
    "Internal Note": "bg-slate-100 text-slate-700 ring-slate-200",
    "Risk Flag": "bg-rose-50 text-rose-600 ring-rose-100",
    "Support Action": "bg-violet-50 text-violet-600 ring-violet-100",
  } satisfies Record<CustomerInquiry["noteType"] | InternalNote["noteType"], string>

  return <span className={pillClass(classes[type])}>{type}</span>
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
      customerInquiries: [
        {
          author: "Mock User",
          body: "Mock account generated for route validation.",
          noteType: "Customer Inquiry",
          timestamp: "May 28, 2026 10:00 AM",
        },
      ],
      email: `${userId}@example.com`,
      id: userId,
      internalNotes: [
        {
          author: "Sarah Admin",
          body: "Mock account generated for route validation.",
          noteType: "Internal Note",
          timestamp: "May 28, 2026 10:00 AM",
        },
      ],
      name: "Mock User",
    }
  )
}

function getAvailablePlans(userType: UserType) {
  return userType === "YETTEY"
    ? ["Starter", "Growth", "Pro", "Enterprise"]
    : ["Basic", "Professional", "Enterprise"]
}

function getFallbackNextPlan(currentPlan: string) {
  const order = ["Free", "Starter", "Growth", "Pro", "Basic", "Professional", "Enterprise"]
  const currentIndex = order.indexOf(currentPlan)

  return currentIndex >= 0 && currentIndex < order.length - 1
    ? order[currentIndex + 1]
    : "Enterprise"
}

function getPlanMonthlyPrice(plan: string) {
  const prices: Record<string, string> = {
    Basic: "₩20,000",
    Enterprise: "Custom",
    Growth: "₩99,000",
    Pro: "₩249,000",
    Professional: "₩40,000",
    Starter: "₩49,000",
  }

  return prices[plan] ?? "Custom"
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value)
}

function formatAuditTimestamp(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}
