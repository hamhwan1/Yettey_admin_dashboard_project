"use client"

import type { ReactNode } from "react"
import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Bot,
  Calendar,
  Check,
  Clapperboard,
  Clock,
  Copy,
  Download,
  Image as ImageIcon,
  Info,
  MessageCircle,
  Monitor,
  PauseCircle,
  Play,
  PlayCircle,
  Save,
  Scissors,
  Smartphone,
  UploadCloud,
  Video,
  Wand2,
} from "lucide-react"

import AdminButton from "@/components/admin/AdminButton"
import PageHeader from "@/components/admin/PageHeader"
import StatusBadge from "@/components/admin/StatusBadge"
import DashboardLayout from "@/components/layout/DashboardLayout"
import {
  type BillingPlan,
  type BillingPlanEffectiveMode,
  type BillingPlanFeature,
  type BillingPlanLanguage,
  type BillingPlanService,
  type BillingPlanStatus,
  type PlanChangeHistory,
  billingPlanFeatures,
  billingPlanStatuses,
  billingPlanTypes,
  createBlankBillingPlan,
  formatNumber,
  getPlanCreditsLabel,
  getPlanLimits,
  getServicePath,
  getStatusTone,
} from "@/lib/billing-plan-catalog"
import {
  billingPlanOperator,
  createBillingPlanId,
  createUniqueBillingPlanCopyName,
  createUniqueBillingPlanSlug,
  formatBillingPlanDate,
  formatBillingPlanTimestamp,
  useBillingPlanStore,
} from "@/lib/billing-plan-store"
import { formatKrw } from "@/lib/pricing-plans"
import { cn } from "@/lib/utils"

type BillingPlanDetailClientProps = {
  mode: "create" | "edit"
  plan?: BillingPlan
  planSlug?: string
  service: BillingPlanService
}

type PlanTab = "basic" | "configuration" | "advanced" | "history"
type PreviewDevice = "Desktop" | "Mobile"
type PreviewLanguage = "Korean" | "English"

type FeaturePolicy = {
  description: string
  icon: ReactNode
  key: BillingPlanFeature
  limitLabel: string
  unit: string
}

const tabs: Array<{ id: PlanTab; label: string }> = [
  { id: "basic", label: "Basic Info" },
  { id: "configuration", label: "Configuration" },
  { id: "advanced", label: "Advanced Settings" },
  { id: "history", label: "Change History" },
]

const featurePolicies: FeaturePolicy[] = [
  {
    description: "Generate images with AI",
    icon: <ImageIcon className="size-5" />,
    key: "AI Image Generation",
    limitLabel: "Monthly Limit",
    unit: "credits",
  },
  {
    description: "Generate videos with AI",
    icon: <Play className="size-5" />,
    key: "AI Video Generation",
    limitLabel: "Monthly Limit",
    unit: "credits",
  },
  {
    description: "Create shortform videos",
    icon: <Clapperboard className="size-5" />,
    key: "Video Analysis",
    limitLabel: "Monthly Limit",
    unit: "mins",
  },
  {
    description: "Max video length for upload",
    icon: <UploadCloud className="size-5" />,
    key: "Max Video Length",
    limitLabel: "Max Duration",
    unit: "mins",
  },
  {
    description: "Max total download per month",
    icon: <Download className="size-5" />,
    key: "Download Limit",
    limitLabel: "Monthly Limit",
    unit: "GB",
  },
  {
    description: "Max total upload per month",
    icon: <UploadCloud className="size-5" />,
    key: "Upload Limit",
    limitLabel: "Monthly Limit",
    unit: "GB",
  },
  {
    description: "Monthly bandwidth limit",
    icon: <Wand2 className="size-5" />,
    key: "Traffic (Bandwidth)",
    limitLabel: "Monthly Limit",
    unit: "GB",
  },
  {
    description: "AI chat and assistant",
    icon: <Bot className="size-5" />,
    key: "AI Assistant",
    limitLabel: "Monthly Limit",
    unit: "credits",
  },
  {
    description: "Content transformation features",
    icon: <MessageCircle className="size-5" />,
    key: "Content Transformation",
    limitLabel: "Monthly Limit",
    unit: "credits",
  },
  {
    description: "Advanced video features",
    icon: <Video className="size-5" />,
    key: "Video Editing Tools",
    limitLabel: "Monthly Limit",
    unit: "credits",
  },
  {
    description: "Shortform editing and automation",
    icon: <Scissors className="size-5" />,
    key: "Shortform Automation",
    limitLabel: "Monthly Limit",
    unit: "credits",
  },
]

const saveReasonExamples = [
  "Pricing policy update",
  "Free trial period added",
  "Credits increased",
]

export default function BillingPlanDetailClient({
  mode,
  plan,
  planSlug,
  service,
}: BillingPlanDetailClientProps) {
  const router = useRouter()
  const productPath = getServicePath(service)
  const { hydrated, plans, upsertPlan } = useBillingPlanStore()
  const storedPlan = useMemo(
    () =>
      planSlug
        ? plans.find(
            (item) => item.service === service && item.slug === planSlug
          )
        : undefined,
    [planSlug, plans, service]
  )
  const resolvedPlan = storedPlan ?? plan
  const initialPlan = useMemo(() => {
    if (mode === "edit" && resolvedPlan) {
      return resolvedPlan
    }

    return createBlankBillingPlan(service)
  }, [mode, resolvedPlan, service])
  const [workingMode, setWorkingMode] = useState<"create" | "edit">(mode)
  const [activeTab, setActiveTab] = useState<PlanTab>("basic")
  const [baseline, setBaseline] = useState<BillingPlan>(initialPlan)
  const [form, setForm] = useState<BillingPlan>(initialPlan)
  const [history, setHistory] = useState<PlanChangeHistory[]>(
    initialPlan.changeHistory
  )
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [saveReason, setSaveReason] = useState("")
  const [savedMessage, setSavedMessage] = useState("")
  const [duplicateMessage, setDuplicateMessage] = useState("")
  const initialPlanSignature = useMemo(
    () => getPlanSignature(initialPlan),
    [initialPlan]
  )
  const [loadedSignature, setLoadedSignature] = useState(initialPlanSignature)
  const pendingChanges = useMemo(
    () =>
      workingMode === "edit"
        ? buildPendingHistoryRows(baseline, form, "Pending save")
        : [],
    [baseline, form, workingMode]
  )
  const pageTitle =
    workingMode === "create" ? "Create New Plan" : "Edit Plan"
  const hasPendingChanges =
    workingMode === "create" || pendingChanges.length > 0

  if (loadedSignature !== initialPlanSignature) {
    setLoadedSignature(initialPlanSignature)
    setWorkingMode(mode)
    setBaseline(initialPlan)
    setForm(initialPlan)
    setHistory(initialPlan.changeHistory)
  }

  function updateField<K extends keyof BillingPlan>(
    field: K,
    value: BillingPlan[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }))
    setSavedMessage("")
    setDuplicateMessage("")
  }

  function openSaveDialog() {
    setSaveReason("")
    setSaveDialogOpen(true)
  }

  function confirmSave() {
    const reason = saveReason.trim()

    if (!reason) {
      return
    }

    const now = new Date()
    const savedAt = formatBillingPlanTimestamp(now)
    const currentPlans = plans
    const newRows =
      workingMode === "create"
        ? [
            {
              after: form.name,
              before: "-",
              changedAt: savedAt,
              changedBy: billingPlanOperator,
              field: "Plan",
              reason,
            },
          ]
        : buildPendingHistoryRows(baseline, form, reason).map((row) => ({
            ...row,
            changedAt: savedAt,
            changedBy: billingPlanOperator,
          }))
    const savedPlan: BillingPlan = {
      ...form,
      changeHistory: [...newRows, ...history],
      createdAt:
        workingMode === "create" ? formatBillingPlanDate(now) : form.createdAt,
      id: workingMode === "create" ? createBillingPlanId(service) : form.id,
      service,
      slug:
        workingMode === "create"
          ? createUniqueBillingPlanSlug({
              name: form.name,
              plans: currentPlans,
              service,
            })
          : form.slug,
      stoppedAt: getSavedStoppedAt(baseline, form, now),
    }

    const persistedPlan = upsertPlan(savedPlan)
    const persistedSignature = getPlanSignature(persistedPlan)

    setLoadedSignature(persistedSignature)
    setBaseline(persistedPlan)
    setForm(persistedPlan)
    setHistory(persistedPlan.changeHistory)
    setWorkingMode("edit")
    setSaveDialogOpen(false)
    setSavedMessage("Plan changes have been saved.")

    if (workingMode === "create") {
      router.replace(`/billing/plans/${productPath}/${persistedPlan.slug}`)
    }
  }

  function duplicatePlan() {
    const now = new Date()
    const copyName = createUniqueBillingPlanCopyName({
      name: form.name,
      plans,
      service,
    })
    const duplicate: BillingPlan = {
      ...form,
      changeHistory: [
        {
          after: copyName,
          before: form.name,
          changedAt: formatBillingPlanTimestamp(now),
          changedBy: billingPlanOperator,
          field: "Plan",
          reason: "Plan duplicated for new product setup",
        },
      ],
      createdAt: formatBillingPlanDate(now),
      id: createBillingPlanId(service),
      languageData: {
        en: {
          ...form.languageData.en,
          name: copyName,
        },
        ko: {
          ...form.languageData.ko,
          name: copyName,
        },
      },
      name: copyName,
      recommended: false,
      service,
      slug: createUniqueBillingPlanSlug({
        name: copyName,
        plans,
        service,
      }),
      status: "Draft",
      stoppedAt: "-",
    }
    const persistedPlan = upsertPlan(duplicate)

    router.push(`/billing/plans/${productPath}/${persistedPlan.slug}`)
  }

  if (mode === "edit" && !resolvedPlan && !hydrated) {
    return (
      <DashboardLayout>
        <PageHeader
          title="Loading Plan"
          description="Loading the saved plan data from this browser."
          breadcrumbs={[
            { label: "Billing" },
            { label: "Plans" },
            { label: service },
          ]}
        />
      </DashboardLayout>
    )
  }

  if (mode === "edit" && !resolvedPlan && hydrated) {
    return (
      <DashboardLayout>
        <PageHeader
          title="Plan Not Found"
          description="This plan is not available in the saved plan catalog."
          breadcrumbs={[
            { label: "Billing" },
            { label: "Plans" },
            { label: service },
          ]}
          actions={
            <AdminButton onClick={() => router.push(`/billing/plans/${productPath}`)}>
              Back to Plans
            </AdminButton>
          }
        />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <PageHeader
        title={pageTitle}
        description="Manage sellable plan products, entitlement policy, lifecycle status, and policy change history."
        eyebrow={
          workingMode === "create"
            ? `${service} / Create Plan`
            : `${service} / ${form.name}`
        }
        breadcrumbs={[
          { label: "Billing" },
          { label: "Plans" },
          { label: service },
          { label: workingMode === "create" ? "Create Plan" : form.name },
        ]}
        actions={
          <div className="flex flex-wrap items-end gap-2">
            <label className="min-w-52">
              <span className="mb-2 block text-sm font-bold text-slate-950">
                Status
              </span>
              <select
                className={inputClass}
                value={form.status}
                onChange={(event) =>
                  updateField("status", event.target.value as BillingPlanStatus)
                }
              >
                {billingPlanStatuses.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </label>
            {workingMode === "edit" ? (
              <AdminButton onClick={duplicatePlan}>
                <Copy className="size-4" />
                Duplicate
              </AdminButton>
            ) : null}
            <AdminButton
              variant="primary"
              disabled={!hasPendingChanges}
              onClick={openSaveDialog}
            >
              <Save className="size-4" />
              Save Plan
            </AdminButton>
            <AdminButton
              onClick={() => updateField("status", "Active")}
              disabled={form.status === "Active"}
            >
              <PlayCircle className="size-4" />
              Activate
            </AdminButton>
            <AdminButton
              onClick={() => updateField("status", "Inactive")}
              disabled={form.status === "Inactive"}
            >
              <PauseCircle className="size-4" />
              Deactivate
            </AdminButton>
          </div>
        }
      />

      {savedMessage ? (
        <Notice tone="success">{savedMessage}</Notice>
      ) : null}
      {duplicateMessage ? (
        <Notice tone="info">{duplicateMessage}</Notice>
      ) : null}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_448px]">
        <div className="space-y-6">
          <StepTabs activeTab={activeTab} onChange={setActiveTab} />
          {activeTab === "basic" ? (
            <BasicInfoTab form={form} updateField={updateField} />
          ) : null}
          {activeTab === "configuration" ? (
            <ConfigurationTab form={form} updateField={updateField} />
          ) : null}
          {activeTab === "advanced" ? (
            <AdvancedSettingsTab form={form} updateField={updateField} />
          ) : null}
          {activeTab === "history" ? (
            <ChangeHistoryTab
              history={history}
              pendingChanges={pendingChanges}
              workingMode={workingMode}
            />
          ) : null}
        </div>

        <PlanPreview plan={form} />
      </div>

      {saveDialogOpen ? (
        <SaveReasonModal
          onCancel={() => setSaveDialogOpen(false)}
          onConfirm={confirmSave}
          reason={saveReason}
          setReason={setSaveReason}
        />
      ) : null}
    </DashboardLayout>
  )
}

function StepTabs({
  activeTab,
  onChange,
}: {
  activeTab: PlanTab
  onChange: (tab: PlanTab) => void
}) {
  return (
    <div className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-500 shadow-sm sm:grid-cols-4">
      {tabs.map((tab, index) => (
        <button
          key={tab.id}
          className={cn(
            "flex items-center gap-3 border-slate-100 px-5 py-4 text-left transition sm:border-r",
            activeTab === tab.id && "text-violet-600",
            index === tabs.length - 1 && "sm:border-r-0"
          )}
          onClick={() => onChange(tab.id)}
          type="button"
        >
          <span
            className={cn(
              "inline-flex size-7 shrink-0 items-center justify-center rounded-full border text-xs",
              activeTab === tab.id
                ? "border-violet-600 bg-violet-600 text-white"
                : "border-slate-300 text-slate-500"
            )}
          >
            {index + 1}
          </span>
          <span className="truncate">{tab.label}</span>
        </button>
      ))}
    </div>
  )
}

function BasicInfoTab({
  form,
  updateField,
}: {
  form: BillingPlan
  updateField: <K extends keyof BillingPlan>(
    field: K,
    value: BillingPlan[K]
  ) => void
}) {
  const isCreditPack = form.type === "Credit Pack"
  const [activeLanguage, setActiveLanguage] =
    useState<BillingPlanLanguage>("ko")
  const localized = form.languageData[activeLanguage]

  function updateLocalizedField(
    field: "description" | "name",
    value: string
  ) {
    const nextLanguageData = {
      ...form.languageData,
      [activeLanguage]: {
        ...form.languageData[activeLanguage],
        [field]: value,
      },
    }

    updateField("languageData", nextLanguageData)

    if (activeLanguage === "ko") {
      updateField(field, value)
    }
  }

  return (
    <SectionPanel>
      <h2 className="text-lg font-bold text-slate-950">Plan Type</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {billingPlanTypes.map((type) => (
          <RadioCard
            key={type}
            active={form.type === type}
            description={
              type === "Subscription"
                ? "A recurring subscription-based plan."
                : "A one-time credit purchase product."
            }
            label={type}
            onClick={() => updateField("type", type)}
          />
        ))}
      </div>

      <Divider />

      <h2 className="text-lg font-bold text-slate-950">Language Settings</h2>
      <p className="mt-1 text-sm text-slate-500">
        Manage localized content shown to customers.
      </p>
      <div className="mt-4 inline-flex overflow-hidden rounded-xl border border-slate-200 bg-white">
        <button
          className={languageTabClass(activeLanguage === "ko")}
          onClick={() => setActiveLanguage("ko")}
          type="button"
        >
          Korean (default)
        </button>
        <button
          className={languageTabClass(activeLanguage === "en")}
          onClick={() => setActiveLanguage("en")}
          type="button"
        >
          English
        </button>
      </div>

      <div className="mt-6 grid gap-5">
        <FieldLabel label="Plan Name">
          <input
            className={inputClass}
            value={localized.name}
            onChange={(event) =>
              updateLocalizedField("name", event.target.value)
            }
          />
        </FieldLabel>
        <FieldLabel label="Description">
          <textarea
            className={cn(inputClass, "h-28 resize-none py-3 leading-6")}
            maxLength={200}
            value={localized.description}
            onChange={(event) =>
              updateLocalizedField("description", event.target.value)
            }
          />
          <p className="mt-1 text-right text-xs font-medium text-slate-400">
            {localized.description.length}/200
          </p>
        </FieldLabel>
        <NumberField
          label="Price"
          prefix="KRW"
          suffix={isCreditPack ? undefined : "/ mo"}
          value={form.monthlyPrice}
          onChange={(value) => updateField("monthlyPrice", value)}
        />
      </div>

      {isCreditPack ? (
        <div className="mt-6 grid gap-4">
          <h2 className="text-lg font-bold text-slate-950">
            Credit Expiration Period
          </h2>
          <p className="text-sm text-slate-500">
            Purchased credits expire according to the policy below.
          </p>
          <InfoBox
            icon={<Clock className="size-5" />}
            title={`Automatically expires ${form.creditExpirationDays} days after purchase`}
            description="Unused credits are reset after the configured expiration period."
          />
          <InfoBox
            icon={<Calendar className="size-5" />}
            title="Reset Policy"
            description="Each credit purchase has its own expiration date and is managed separately."
          />
        </div>
      ) : null}
    </SectionPanel>
  )
}

function ConfigurationTab({
  form,
  updateField,
}: {
  form: BillingPlan
  updateField: <K extends keyof BillingPlan>(
    field: K,
    value: BillingPlan[K]
  ) => void
}) {
  if (form.type === "Credit Pack") {
    return (
      <SectionPanel>
        <h2 className="text-lg font-bold text-slate-950">Configuration</h2>
        <p className="mt-1 text-sm text-slate-500">
          Set the amount of credits provided with this product.
        </p>
        <div className="mt-8 grid gap-5 md:grid-cols-[1fr_260px] md:items-center">
          <div>
            <h3 className="text-sm font-bold text-slate-950">Provided Credits</h3>
            <p className="mt-1 text-sm text-slate-500">
              Set the number of credits granted upon purchase.
            </p>
          </div>
          <NumberField
            label="Credits"
            suffix="credits"
            value={form.credits}
            onChange={(value) => updateField("credits", value)}
          />
        </div>
        <p className="mt-2 text-right text-xs font-medium text-slate-400">
          A minimum of 100 credits is required.
        </p>
      </SectionPanel>
    )
  }

  return (
    <div className="space-y-6">
      <SectionPanel>
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-bold text-slate-950">Limit Settings</h2>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-slate-400">
            <Info className="size-4" />
            Core benefits displayed at the top for customers
          </span>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <LimitCard
            icon={<Wand2 className="size-4" />}
            label="Credits"
            suffix="credits"
            value={form.credits}
            onChange={(value) => updateField("credits", value)}
          />
          <LimitCard
            icon={<Copy className="size-4" />}
            label="Projects"
            suffix="projects"
            value={form.projects}
            onChange={(value) => updateField("projects", value)}
          />
          <LimitCard
            icon={<MessageCircle className="size-4" />}
            label="Users"
            suffix="users"
            value={form.users}
            onChange={(value) => updateField("users", value)}
          />
          <LimitCard
            icon={<UploadCloud className="size-4" />}
            label="Storage"
            suffix="GB"
            value={form.storage}
            onChange={(value) => updateField("storage", value)}
          />
        </div>
      </SectionPanel>

      <SectionPanel>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-950">Feature Settings</h2>
            <p className="mt-1 text-sm text-slate-500">
              Choose additional features from all feature policies.
            </p>
          </div>
          <div className="rounded-xl border border-violet-100 bg-white px-5 py-2 text-sm font-bold text-violet-600">
            {form.features.length}/{billingPlanFeatures.length}
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="h-11 min-w-64 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-400">
            <span className="flex h-full items-center">Search features</span>
          </div>
          <label className="inline-flex items-center gap-3 text-sm font-bold text-slate-700">
            <input className="size-5 accent-violet-600" type="checkbox" defaultChecked />
            Show All Features
          </label>
        </div>
        <div className="mt-6 divide-y divide-slate-100">
          {featurePolicies.map((policy) => (
            <FeaturePolicyRow
              key={policy.key}
              checked={form.features.includes(policy.key)}
              policy={policy}
              value={getFeatureLimitValue(form, policy)}
              onCheckedChange={(checked) =>
                updateField(
                  "features",
                  toggleFeature(form.features, policy.key, checked)
                )
              }
              onLimitChange={(value) =>
                updateFeatureLimit(policy, value, updateField)
              }
            />
          ))}
        </div>
      </SectionPanel>

      <Notice tone="info">
        Advanced feature policies are managed separately in Billing Rules.
      </Notice>
    </div>
  )
}

function AdvancedSettingsTab({
  form,
  updateField,
}: {
  form: BillingPlan
  updateField: <K extends keyof BillingPlan>(
    field: K,
    value: BillingPlan[K]
  ) => void
}) {
  if (form.type === "Credit Pack") {
    return (
      <SectionPanel>
        <AdvancedSalesPeriod form={form} updateField={updateField} />
        <Divider />
        <h2 className="text-xl font-bold text-slate-950">Purchase Conditions</h2>
        <p className="mt-1 text-sm text-slate-500">
          Set the conditions required to purchase this product.
        </p>
        <Notice tone="info">
          Recurring purchase credit packs can only be purchased by monthly subscription users.
        </Notice>
        <div className="mt-6">
          <p className="mb-3 text-sm font-bold text-slate-950">Eligible Users</p>
          <RadioCard
            active={form.eligibleUsers === "Monthly Subscription Users Only"}
            description="Only users with an active monthly subscription can purchase this product."
            label="Monthly Subscription Users Only"
            onClick={() =>
              updateField("eligibleUsers", "Monthly Subscription Users Only")
            }
          />
        </div>
        <Divider />
        <h2 className="text-xl font-bold text-slate-950">Credit Policy</h2>
        <p className="mt-1 text-sm text-slate-500">
          Set the credit expiration period and reset policy.
        </p>
        <div className="mt-6 grid gap-5 md:grid-cols-[1fr_180px] md:items-center">
          <div>
            <h3 className="text-sm font-bold text-slate-950">
              Credit Expiration Period
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Credits automatically expire after purchase.
            </p>
          </div>
          <NumberField
            label="Days"
            suffix="days"
            value={form.creditExpirationDays}
            onChange={(value) => updateField("creditExpirationDays", value)}
          />
        </div>
        <InfoBox
          icon={<Clock className="size-5" />}
          title="Automatic Reset Policy"
          description="For multiple purchases, expiration dates are applied separately to each purchase."
        />
        <div className="mt-6 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-950">
              Expire Remaining Credits After Partial Use
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Unused credits are automatically removed upon expiration.
            </p>
          </div>
          <input
            checked={form.expireRemainingCreditsAfterPartialUse}
            className="size-5 accent-violet-600"
            type="checkbox"
            onChange={(event) =>
              updateField(
                "expireRemainingCreditsAfterPartialUse",
                event.target.checked
              )
            }
          />
        </div>
        <Divider />
        <EffectiveDateFields form={form} updateField={updateField} />
      </SectionPanel>
    )
  }

  return (
    <div className="space-y-6">
      <SectionPanel>
        <h2 className="text-xl font-bold text-slate-950">Plan Settings</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <NumberField
            label="Display Order"
            value={form.displayOrder}
            onChange={(value) => updateField("displayOrder", value)}
          />
          <ToggleRow
            checked={form.showInComparison}
            description="Show this plan in pricing comparison."
            label="Show in Comparison Table"
            onChange={(checked) => updateField("showInComparison", checked)}
          />
          <ToggleRow
            checked={form.recommended}
            description="Highlight this plan in pricing."
            label="Recommended Plan"
            onChange={(checked) => updateField("recommended", checked)}
          />
          <div className="grid gap-2">
            <ToggleRow
              checked={form.freeTrialDays > 0}
              description="Enable or disable trial period."
              label="Free Trial Period"
              onChange={(checked) =>
                updateField("freeTrialDays", checked ? 14 : 0)
              }
            />
            <NumberField
              label="Trial Length"
              suffix="days"
              value={form.freeTrialDays}
              onChange={(value) => updateField("freeTrialDays", value)}
            />
          </div>
        </div>
      </SectionPanel>

      <SectionPanel>
        <AdvancedSalesPeriod form={form} updateField={updateField} />
      </SectionPanel>

      <SectionPanel>
        <h2 className="text-xl font-bold text-slate-950">
          Subscription & Cancellation
        </h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <ToggleRow
            checked={form.autoRenewal}
            description="Automatically renews after the subscription period ends."
            label="Auto-renewal"
            onChange={(checked) => updateField("autoRenewal", checked)}
          />
          <ToggleRow
            checked={form.allowCancellation}
            description="Users can cancel their subscription at any time."
            label="Allow Cancellation"
            onChange={(checked) => updateField("allowCancellation", checked)}
          />
          <FieldLabel label="Access Period After Cancellation">
            <select
              className={inputClass}
              value={form.accessAfterCancellation}
              onChange={(event) =>
                updateField("accessAfterCancellation", event.target.value)
              }
            >
              <option>Until End of Period</option>
              <option>Immediately</option>
            </select>
          </FieldLabel>
          <FieldLabel label="Refund Policy">
            <select
              className={inputClass}
              value={form.refundPolicy}
              onChange={(event) => updateField("refundPolicy", event.target.value)}
            >
              <option>Non-refundable</option>
              <option>Prorated refund</option>
              <option>Full refund within 7 days</option>
            </select>
          </FieldLabel>
        </div>
      </SectionPanel>

      <SectionPanel>
        <EffectiveDateFields form={form} updateField={updateField} />
      </SectionPanel>

      <Notice tone="info">
        Advanced feature policies are managed separately in Billing Rules.
      </Notice>
    </div>
  )
}

function ChangeHistoryTab({
  history,
  pendingChanges,
  workingMode,
}: {
  history: PlanChangeHistory[]
  pendingChanges: PlanChangeHistory[]
  workingMode: "create" | "edit"
}) {
  const rows =
    workingMode === "edit" ? [...pendingChanges, ...history] : history

  return (
    <SectionPanel>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-950">Change History</h2>
          <p className="mt-1 text-sm text-slate-500">
            Creation and modification history is immutable and sorted latest first.
          </p>
        </div>
        <StatusBadge tone="neutral">{`${rows.length} records`}</StatusBadge>
      </div>
      {pendingChanges.length > 0 ? (
        <Notice tone="info">
          Unsaved field changes are previewed at the top. Save Plan records only changed fields.
        </Notice>
      ) : null}
      <ChangeHistoryTable rows={rows} />
    </SectionPanel>
  )
}

function AdvancedSalesPeriod({
  form,
  updateField,
}: {
  form: BillingPlan
  updateField: <K extends keyof BillingPlan>(
    field: K,
    value: BillingPlan[K]
  ) => void
}) {
  return (
    <div>
      <h2 className="text-xl font-bold text-slate-950">Sales Period Settings</h2>
      <p className="mt-1 text-sm text-slate-500">
        Set the sales start and end dates for this product.
      </p>
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <FieldLabel label="Sales Start Date">
          <input
            className={inputClass}
            value={form.salesStartAt}
            onChange={(event) => updateField("salesStartAt", event.target.value)}
          />
        </FieldLabel>
        <FieldLabel label="Sales End Date">
          <input
            className={inputClass}
            value={form.salesEndAt}
            onChange={(event) => updateField("salesEndAt", event.target.value)}
          />
        </FieldLabel>
      </div>
      <Notice tone="info">
        If the end date is set to 2999-01-01, the product will be available indefinitely.
      </Notice>
    </div>
  )
}

function EffectiveDateFields({
  form,
  updateField,
}: {
  form: BillingPlan
  updateField: <K extends keyof BillingPlan>(
    field: K,
    value: BillingPlan[K]
  ) => void
}) {
  return (
    <div>
      <h2 className="text-xl font-bold text-slate-950">Effective Date</h2>
      <p className="mt-1 text-sm text-slate-500">
        Apply changes immediately or schedule them for a future policy update.
      </p>
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <FieldLabel label="Apply Mode">
          <select
            className={inputClass}
            value={form.applyMode}
            onChange={(event) =>
              updateField("applyMode", event.target.value as BillingPlanEffectiveMode)
            }
          >
            <option>Immediately</option>
            <option>Scheduled</option>
          </select>
        </FieldLabel>
        <FieldLabel label="Effective Date">
          <input
            className={inputClass}
            value={form.effectiveDate}
            onChange={(event) => updateField("effectiveDate", event.target.value)}
          />
        </FieldLabel>
      </div>
    </div>
  )
}

function PlanPreview({ plan }: { plan: BillingPlan }) {
  const [device, setDevice] = useState<PreviewDevice>("Desktop")
  const [language, setLanguage] = useState<PreviewLanguage>("Korean")
  const isCreditPack = plan.type === "Credit Pack"
  const previewLanguage = language === "Korean" ? "ko" : "en"
  const localized = plan.languageData[previewLanguage]
  const benefits = isCreditPack
    ? [
        `${formatNumber(plan.credits)} credits instantly granted`,
        `Expires ${formatNumber(plan.creditExpirationDays)} days after purchase`,
        "Multiple purchases are tracked separately",
        "Available to monthly subscription users",
      ]
    : [getPlanCreditsLabel(plan), ...getPlanLimits(plan)]

  return (
    <aside className="xl:sticky xl:top-24 xl:self-start">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-950">Live Preview</h2>
            <p className="mt-1 text-sm text-slate-500">
              This is how it will appear to customers.
            </p>
          </div>
          <StatusBadge tone={getStatusTone(plan.status)}>{plan.status}</StatusBadge>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {(["Desktop", "Mobile"] as PreviewDevice[]).map((item) => (
            <button
              key={item}
              className={previewToggleClass(device === item)}
              onClick={() => setDevice(item)}
              type="button"
            >
              {item === "Desktop" ? (
                <Monitor className="size-4" />
              ) : (
                <Smartphone className="size-4" />
              )}
              {item}
            </button>
          ))}
        </div>

        <div className="mt-6 flex gap-6 border-b border-slate-100 text-sm font-bold">
          {(["Korean", "English"] as PreviewLanguage[]).map((item) => (
            <button
              key={item}
              className={cn(
                "border-b-2 px-1 pb-3 transition",
                language === item
                  ? "border-violet-600 text-violet-600"
                  : "border-transparent text-slate-400 hover:text-slate-700"
              )}
              onClick={() => setLanguage(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>

        <div
          className={cn(
            "mx-auto mt-6 rounded-[28px] bg-slate-950 p-8 text-white shadow-2xl shadow-slate-900/20",
            device === "Mobile" ? "max-w-72" : "max-w-sm"
          )}
        >
          <p className="text-center text-sm font-semibold text-slate-300">
            {isCreditPack ? "Credit Pack" : plan.service}
          </p>
          <h3 className="mt-4 text-center text-2xl font-bold">{localized.name}</h3>
          <div className="mt-5 flex items-end justify-center gap-2">
            <span className="text-4xl font-black">
              {formatKrw(plan.monthlyPrice)}
            </span>
            <span className="pb-1 text-sm font-semibold text-slate-400">
              {isCreditPack ? "" : "/ mo"}
            </span>
          </div>
          <p className="mx-auto mt-5 max-w-64 text-center text-sm leading-6 text-slate-400">
            {localized.description}
          </p>
          <div className="mt-8 space-y-4">
            {benefits.slice(0, 6).map((benefit, index) => (
              <div
                key={`${benefit}-${index}`}
                className={cn(
                  "flex items-center gap-3 text-sm font-semibold",
                  isCreditPack && index === 0 && "rounded-2xl bg-slate-800 p-4"
                )}
              >
                <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-violet-500">
                  <Check className="size-3" />
                </span>
                {benefit}
              </div>
            ))}
          </div>
          <button
            className="mt-8 h-14 w-full rounded-2xl bg-violet-600 text-base font-bold text-white transition hover:bg-violet-500"
            type="button"
          >
            {isCreditPack ? "Start Free" : "Start Now"}
          </button>
          {isCreditPack ? (
            <div className="mt-8 border-t border-slate-800 pt-6 text-xs leading-5 text-slate-400">
              Credit expiration notice: purchased credits expire according to each purchase date.
            </div>
          ) : null}
        </div>

        <p className="mt-6 text-center text-xs font-medium text-slate-400">
          Preview may differ from the actual result.
        </p>
      </div>
    </aside>
  )
}

function SaveReasonModal({
  onCancel,
  onConfirm,
  reason,
  setReason,
}: {
  onCancel: () => void
  onConfirm: () => void
  reason: string
  setReason: (reason: string) => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-slate-950">Save Change Reason</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Enter the reason for this product policy change. The reason is recorded in Change History.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {saveReasonExamples.map((example) => (
            <button
              key={example}
              className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-violet-50 hover:text-violet-600"
              onClick={() => setReason(example)}
              type="button"
            >
              {example}
            </button>
          ))}
        </div>
        <textarea
          className={cn(inputClass, "mt-4 h-28 resize-none py-3 leading-6")}
          placeholder="e.g. Pricing policy update"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />
        <div className="mt-6 flex justify-end gap-2">
          <AdminButton onClick={onCancel}>Cancel</AdminButton>
          <AdminButton
            variant="primary"
            disabled={!reason.trim()}
            onClick={onConfirm}
          >
            Save Plan
          </AdminButton>
        </div>
      </div>
    </div>
  )
}

function SectionPanel({ children }: { children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
      {children}
    </section>
  )
}

function FieldLabel({
  children,
  className,
  label,
}: {
  children: ReactNode
  className?: string
  label: string
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-2 block text-sm font-bold text-slate-950">{label}</span>
      {children}
    </label>
  )
}

function RadioCard({
  active,
  description,
  label,
  onClick,
}: {
  active: boolean
  description: string
  label: string
  onClick: () => void
}) {
  return (
    <button
      className={cn(
        "flex min-h-24 items-start gap-3 rounded-xl border p-4 text-left transition",
        active
          ? "border-violet-500 bg-violet-50 text-violet-700 ring-2 ring-violet-500/10"
          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
      )}
      onClick={onClick}
      type="button"
    >
      <span
        className={cn(
          "mt-0.5 inline-flex size-5 items-center justify-center rounded-full border",
          active ? "border-violet-600 bg-violet-600" : "border-slate-300"
        )}
      >
        {active ? <span className="size-2 rounded-full bg-white" /> : null}
      </span>
      <span>
        <span className="block text-sm font-bold">{label}</span>
        <span className="mt-1 block text-sm leading-5 text-slate-500">
          {description}
        </span>
      </span>
    </button>
  )
}

function NumberField({
  label,
  onChange,
  prefix,
  suffix,
  value,
}: {
  label: string
  onChange: (value: number) => void
  prefix?: string
  suffix?: string
  value: number
}) {
  return (
    <FieldLabel label={label}>
      <div className="flex overflow-hidden rounded-xl border border-slate-200 bg-white focus-within:border-violet-400 focus-within:ring-4 focus-within:ring-violet-500/10">
        {prefix ? (
          <span className="flex h-12 items-center border-r border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-500">
            {prefix}
          </span>
        ) : null}
        <input
          className="h-12 min-w-0 flex-1 px-4 text-sm font-semibold text-slate-950 outline-none"
          inputMode="numeric"
          value={value}
          onChange={(event) => onChange(Number(event.target.value) || 0)}
        />
        {suffix ? (
          <span className="flex h-12 items-center border-l border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-500">
            {suffix}
          </span>
        ) : null}
      </div>
    </FieldLabel>
  )
}

function LimitCard({
  icon,
  label,
  onChange,
  suffix,
  value,
}: {
  icon: ReactNode
  label: string
  onChange: (value: number) => void
  suffix: string
  value: number
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-700">
        <span className="inline-flex size-7 items-center justify-center rounded-lg bg-white text-violet-600 shadow-sm">
          {icon}
        </span>
        {label}
      </div>
      <div className="flex overflow-hidden rounded-xl border border-slate-200 bg-white">
        <input
          className="h-12 min-w-0 flex-1 px-4 text-lg font-bold text-slate-950 outline-none"
          inputMode="numeric"
          value={value}
          onChange={(event) => onChange(Number(event.target.value) || 0)}
        />
        <span className="flex h-12 items-center px-4 text-sm font-semibold text-slate-400">
          {suffix}
        </span>
      </div>
    </div>
  )
}

function FeaturePolicyRow({
  checked,
  onCheckedChange,
  onLimitChange,
  policy,
  value,
}: {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  onLimitChange: (value: number) => void
  policy: FeaturePolicy
  value: number
}) {
  return (
    <div className="grid gap-4 py-5 lg:grid-cols-[1fr_120px_150px] lg:items-center">
      <div className="flex gap-4">
        <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-700">
          {policy.icon}
        </span>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold text-slate-950">{policy.key}</h3>
            <span className="rounded-md bg-violet-50 px-2 py-0.5 text-xs font-bold text-violet-600">
              AI
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">{policy.description}</p>
        </div>
      </div>
      <label className="inline-flex items-center gap-3 text-sm font-bold text-violet-600">
        <input
          checked={checked}
          className="size-5 accent-violet-600"
          type="checkbox"
          onChange={(event) => onCheckedChange(event.target.checked)}
        />
        Enabled
      </label>
      <div className="grid gap-1">
        <span className="text-xs font-bold uppercase text-slate-400">
          {policy.limitLabel}
        </span>
        <div className="flex overflow-hidden rounded-lg border border-slate-200">
          <input
            className="h-10 min-w-0 flex-1 px-3 text-sm font-bold text-slate-950 outline-none"
            inputMode="numeric"
            value={value}
            onChange={(event) => onLimitChange(Number(event.target.value) || 0)}
          />
          <span className="flex h-10 items-center bg-slate-50 px-3 text-xs font-bold uppercase text-slate-400">
            {policy.unit}
          </span>
        </div>
      </div>
    </div>
  )
}

function ToggleRow({
  checked,
  description,
  label,
  onChange,
}: {
  checked: boolean
  description: string
  label: string
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex min-h-20 items-center justify-between gap-4 rounded-xl bg-white py-2">
      <span>
        <span className="block text-sm font-bold text-slate-950">{label}</span>
        <span className="mt-1 block text-sm leading-6 text-slate-500">
          {description}
        </span>
      </span>
      <input
        checked={checked}
        className="size-5 accent-violet-600"
        type="checkbox"
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  )
}

function InfoBox({
  description,
  icon,
  title,
}: {
  description: string
  icon: ReactNode
  title: string
}) {
  return (
    <div className="flex gap-4 rounded-xl bg-slate-50 p-4">
      <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-violet-600 shadow-sm">
        {icon}
      </span>
      <span>
        <span className="block text-sm font-bold text-violet-600">{title}</span>
        <span className="mt-1 block text-sm leading-6 text-slate-500">
          {description}
        </span>
      </span>
    </div>
  )
}

function Notice({
  children,
  tone,
}: {
  children: ReactNode
  tone: "info" | "success"
}) {
  return (
    <div
      className={cn(
        "my-6 rounded-xl border px-4 py-3 text-sm font-semibold",
        tone === "info" && "border-violet-100 bg-violet-50 text-violet-600",
        tone === "success" &&
          "border-emerald-100 bg-emerald-50 text-emerald-700"
      )}
    >
      {children}
    </div>
  )
}

function ChangeHistoryTable({ rows }: { rows: PlanChangeHistory[] }) {
  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-slate-200">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-separate border-spacing-0">
          <thead>
            <tr className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
              <th className="border-b border-slate-200 px-4 py-3">Changed At</th>
              <th className="border-b border-slate-200 px-4 py-3">Changed By</th>
              <th className="border-b border-slate-200 px-4 py-3">Field</th>
              <th className="border-b border-slate-200 px-4 py-3">Before</th>
              <th className="border-b border-slate-200 px-4 py-3">After</th>
              <th className="border-b border-slate-200 px-4 py-3">Reason</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={`${row.changedAt}-${row.field}-${index}`}>
                <td className="border-b border-slate-100 px-4 py-4 text-sm font-semibold text-slate-950">
                  {row.changedAt}
                </td>
                <td className="border-b border-slate-100 px-4 py-4 text-sm text-slate-600">
                  {row.changedBy}
                </td>
                <td className="border-b border-slate-100 px-4 py-4 text-sm font-semibold text-slate-950">
                  {row.field}
                </td>
                <td className="border-b border-slate-100 px-4 py-4 text-sm text-slate-500">
                  {row.before}
                </td>
                <td className="border-b border-slate-100 px-4 py-4 text-sm text-slate-900">
                  {row.after}
                </td>
                <td className="border-b border-slate-100 px-4 py-4 text-sm text-slate-500">
                  {row.reason}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function buildPendingHistoryRows(
  before: BillingPlan,
  after: BillingPlan,
  reason: string
): PlanChangeHistory[] {
  const rows: PlanChangeHistory[] = []
  const changes: Array<[string, string, string]> = [
    ["Plan Name", before.name, after.name],
    ["Description", before.description, after.description],
    ["Plan Type", before.type, after.type],
    ["Status", before.status, after.status],
    ["Price", formatKrw(before.monthlyPrice), formatKrw(after.monthlyPrice)],
    ["Annual Price", formatKrw(before.annualPrice), formatKrw(after.annualPrice)],
    ["Free Trial", `${before.freeTrialDays} days`, `${after.freeTrialDays} days`],
    ["Auto Renewal", yesNo(before.autoRenewal), yesNo(after.autoRenewal)],
    ["Allow Cancellation", yesNo(before.allowCancellation), yesNo(after.allowCancellation)],
    ["Apply Mode", before.applyMode, after.applyMode],
    ["Effective Date", before.effectiveDate, after.effectiveDate],
    ["Sales Start Date", before.salesStartAt, after.salesStartAt],
    ["Sales End Date", before.salesEndAt, after.salesEndAt],
    ["Credits", formatNumber(before.credits), formatNumber(after.credits)],
    ["Projects", formatNumber(before.projects), formatNumber(after.projects)],
    ["Users", formatNumber(before.users), formatNumber(after.users)],
    ["Storage", `${formatNumber(before.storage)}GB`, `${formatNumber(after.storage)}GB`],
    [
      "Upload Minutes",
      `${formatNumber(before.uploadMinutes)} min`,
      `${formatNumber(after.uploadMinutes)} min`,
    ],
    [
      "Shortform Generation",
      `${formatNumber(before.shortformGeneration)} min`,
      `${formatNumber(after.shortformGeneration)} min`,
    ],
    [
      "Download Traffic",
      `${formatNumber(before.downloadTraffic)}GB`,
      `${formatNumber(after.downloadTraffic)}GB`,
    ],
    [
      "Credit Expiration",
      `${formatNumber(before.creditExpirationDays)} days`,
      `${formatNumber(after.creditExpirationDays)} days`,
    ],
    [
      "Features",
      before.features.join(", ") || "-",
      after.features.join(", ") || "-",
    ],
    [
      "Language Data",
      summarizeLanguageData(before),
      summarizeLanguageData(after),
    ],
  ]

  changes.forEach(([field, beforeValue, afterValue]) => {
    if (beforeValue !== afterValue) {
      rows.push({
        after: afterValue,
        before: beforeValue,
        changedAt: "Unsaved",
        changedBy: "Sarah Mitchell",
        field,
        reason,
      })
    }
  })

  return rows
}

function getFeatureLimitValue(plan: BillingPlan, policy: FeaturePolicy) {
  if (policy.key === "Video Analysis") {
    return plan.shortformGeneration
  }

  if (policy.key === "Max Video Length") {
    return plan.uploadMinutes
  }

  if (policy.key === "Download Limit") {
    return plan.downloadTraffic
  }

  if (policy.key === "Upload Limit" || policy.key === "Traffic (Bandwidth)") {
    return plan.storage
  }

  return policy.key === "AI Image Generation" ? plan.credits : 0
}

function summarizeLanguageData(plan: BillingPlan) {
  return `EN: ${plan.languageData.en.name} / ${plan.languageData.en.description}`
}

function updateFeatureLimit(
  policy: FeaturePolicy,
  value: number,
  updateField: <K extends keyof BillingPlan>(
    field: K,
    value: BillingPlan[K]
  ) => void
) {
  if (policy.key === "Video Analysis") {
    updateField("shortformGeneration", value)
    return
  }

  if (policy.key === "Max Video Length") {
    updateField("uploadMinutes", value)
    return
  }

  if (policy.key === "Download Limit") {
    updateField("downloadTraffic", value)
    return
  }

  if (policy.key === "Upload Limit" || policy.key === "Traffic (Bandwidth)") {
    updateField("storage", value)
    return
  }

  if (policy.key === "AI Image Generation") {
    updateField("credits", value)
  }
}

function toggleFeature(
  features: BillingPlanFeature[],
  feature: BillingPlanFeature,
  checked: boolean
) {
  if (checked) {
    return features.includes(feature) ? features : [...features, feature]
  }

  return features.filter((item) => item !== feature)
}

function previewToggleClass(active: boolean) {
  return cn(
    "inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-bold transition",
    active
      ? "bg-violet-50 text-violet-600 ring-1 ring-violet-100"
      : "bg-slate-50 text-slate-400 hover:text-slate-700"
  )
}

function languageTabClass(active: boolean) {
  return cn(
    "h-11 border-l border-slate-200 px-5 text-sm font-semibold transition first:border-l-0",
    active
      ? "bg-violet-50 text-violet-600"
      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
  )
}

function yesNo(value: boolean) {
  return value ? "Enabled" : "Disabled"
}

function getPlanSignature(plan: BillingPlan) {
  return JSON.stringify(plan)
}

function getSavedStoppedAt(
  before: BillingPlan,
  after: BillingPlan,
  savedAt: Date
) {
  if (after.status !== "Inactive") {
    return "-"
  }

  if (before.status === "Inactive" && before.stoppedAt !== "-") {
    return before.stoppedAt
  }

  return formatBillingPlanDate(savedAt)
}

const inputClass =
  "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-950 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 disabled:bg-slate-50 disabled:text-slate-500"

function Divider() {
  return <div className="my-8 border-t border-slate-100" />
}
