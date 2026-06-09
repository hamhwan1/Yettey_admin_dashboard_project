"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Check,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react"

import AdminButton from "@/components/admin/AdminButton"
import PageHeader from "@/components/admin/PageHeader"
import SideDrawer from "@/components/admin/SideDrawer"
import DashboardLayout from "@/components/layout/DashboardLayout"
import {
  type BillingPlan,
  type BillingPlanFeature,
  billingPlanFeatures,
  formatNumber,
} from "@/lib/billing-plan-catalog"
import { useBillingPlanStore } from "@/lib/billing-plan-store"
import { cn } from "@/lib/utils"

type FeatureCategory = "Video" | "Image" | "Storage" | "Credits" | "AI" | "System"
type FeatureBillingType = "Recurring" | "One-Time" | "Usage-Based"
type FeatureUnit = "Minute" | "Credit" | "GB" | "Item" | "Request"

type FeatureCatalogItem = {
  billingType: FeatureBillingType
  category: FeatureCategory
  description: string
  displayName: string
  estimatedRevenue: number
  id: string
  internalCode: string
  monthlyUsage: number
  planFeatureKeys: BillingPlanFeature[]
  providerCost: number
  unit: FeatureUnit
  updatedAt: string
  userConsumption: number
}

type FeatureFormState = Pick<
  FeatureCatalogItem,
  | "billingType"
  | "category"
  | "description"
  | "displayName"
  | "internalCode"
  | "providerCost"
  | "unit"
  | "userConsumption"
>

type DrawerMode = "create" | "edit" | "view"

const STORAGE_KEY = "yettey.billing-feature-catalog.v1"

const categories: Array<"All" | FeatureCategory> = [
  "All",
  "Video",
  "Image",
  "Storage",
  "Credits",
  "AI",
  "System",
]

const billingTypes: Array<"All" | FeatureBillingType> = [
  "All",
  "Recurring",
  "One-Time",
  "Usage-Based",
]

const units: FeatureUnit[] = ["Minute", "Credit", "GB", "Item", "Request"]

const defaultFeatures: FeatureCatalogItem[] = [
  {
    billingType: "Usage-Based",
    category: "Video",
    description: "Video analysis and AI insight generation for uploaded media.",
    displayName: "Video Analysis",
    estimatedRevenue: 2300,
    id: "feature_video_analysis",
    internalCode: "video/analysis/gemini",
    monthlyUsage: 125000,
    planFeatureKeys: ["Video Analysis"],
    providerCost: 0.01,
    unit: "Minute",
    updatedAt: "2026-06-08",
    userConsumption: 10,
  },
  {
    billingType: "Usage-Based",
    category: "Video",
    description: "Speech-to-text processing for source videos and captions.",
    displayName: "Video Transcription",
    estimatedRevenue: 1440,
    id: "feature_video_transcription",
    internalCode: "video/transcription/assemblyai/universal-2",
    monthlyUsage: 180000,
    planFeatureKeys: ["Video Analysis"],
    providerCost: 0.006,
    unit: "Minute",
    updatedAt: "2026-06-08",
    userConsumption: 5,
  },
  {
    billingType: "Usage-Based",
    category: "AI",
    description: "AI summary generation for video scripts, scenes, and briefs.",
    displayName: "Video Summary",
    estimatedRevenue: 980,
    id: "feature_video_summary",
    internalCode: "gemini-2.5-pro-preview",
    monthlyUsage: 42000,
    planFeatureKeys: ["Content Transformation"],
    providerCost: 0.012,
    unit: "Request",
    updatedAt: "2026-06-07",
    userConsumption: 25,
  },
  {
    billingType: "Usage-Based",
    category: "Video",
    description: "Shortform video generation and automation from long-form sources.",
    displayName: "Shortform Generation",
    estimatedRevenue: 3100,
    id: "feature_shortform_generation",
    internalCode: "video/name_suggestion/gemini",
    monthlyUsage: 16800,
    planFeatureKeys: ["Shortform Automation", "Video Editing Tools"],
    providerCost: 0.08,
    unit: "Item",
    updatedAt: "2026-06-06",
    userConsumption: 120,
  },
  {
    billingType: "Usage-Based",
    category: "Image",
    description: "AI image generation for thumbnails, concepts, and campaign assets.",
    displayName: "AI Image Generation",
    estimatedRevenue: 1900,
    id: "feature_ai_image_generation",
    internalCode: "image/generation/openai/gpt-image-1",
    monthlyUsage: 32000,
    planFeatureKeys: ["AI Image Generation"],
    providerCost: 0.04,
    unit: "Request",
    updatedAt: "2026-06-08",
    userConsumption: 80,
  },
  {
    billingType: "Usage-Based",
    category: "AI",
    description: "AI assistant requests for operational support and content workflows.",
    displayName: "AI Assistant",
    estimatedRevenue: 760,
    id: "feature_ai_assistant",
    internalCode: "assistant/chat/gemini-2.5-pro-preview",
    monthlyUsage: 24000,
    planFeatureKeys: ["AI Assistant"],
    providerCost: 0.015,
    unit: "Request",
    updatedAt: "2026-06-05",
    userConsumption: 30,
  },
  {
    billingType: "Recurring",
    category: "Storage",
    description: "Managed media storage for uploaded source files and generated outputs.",
    displayName: "Storage",
    estimatedRevenue: 620,
    id: "feature_storage",
    internalCode: "storage/s3/standard",
    monthlyUsage: 18500,
    planFeatureKeys: ["Upload Limit"],
    providerCost: 0.023,
    unit: "GB",
    updatedAt: "2026-06-04",
    userConsumption: 1,
  },
  {
    billingType: "Usage-Based",
    category: "Storage",
    description: "Download traffic for customer exports and shared assets.",
    displayName: "Download Traffic",
    estimatedRevenue: 1180,
    id: "feature_download_traffic",
    internalCode: "cdn/download/traffic",
    monthlyUsage: 9400,
    planFeatureKeys: ["Download Limit", "Traffic (Bandwidth)"],
    providerCost: 0.08,
    unit: "GB",
    updatedAt: "2026-06-03",
    userConsumption: 3,
  },
  {
    billingType: "Usage-Based",
    category: "Credits",
    description: "Credit balance consumption used to meter premium features.",
    displayName: "Credit Consumption",
    estimatedRevenue: 4200,
    id: "feature_credit_consumption",
    internalCode: "credits/ledger/consumption",
    monthlyUsage: 1250000,
    planFeatureKeys: billingPlanFeatures,
    providerCost: 0.001,
    unit: "Credit",
    updatedAt: "2026-06-08",
    userConsumption: 1,
  },
  {
    billingType: "Recurring",
    category: "System",
    description: "Team workspace entitlement for multi-user plan collaboration.",
    displayName: "Team Workspace",
    estimatedRevenue: 850,
    id: "feature_team_workspace",
    internalCode: "system/team-workspace",
    monthlyUsage: 520,
    planFeatureKeys: [],
    providerCost: 0,
    unit: "Item",
    updatedAt: "2026-06-01",
    userConsumption: 0,
  },
]

const emptyForm: FeatureFormState = {
  billingType: "Usage-Based",
  category: "Video",
  description: "",
  displayName: "",
  internalCode: "",
  providerCost: 0,
  unit: "Minute",
  userConsumption: 0,
}

export default function BillingFeaturesClient() {
  const { plans } = useBillingPlanStore()
  const [features, setFeatures] = useState(defaultFeatures)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<"All" | FeatureCategory>("All")
  const [billingType, setBillingType] = useState<"All" | FeatureBillingType>("All")
  const [selectedFeatureId, setSelectedFeatureId] = useState(defaultFeatures[0]?.id)
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("view")
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [form, setForm] = useState<FeatureFormState>(emptyForm)
  const [message, setMessage] = useState("")

  useEffect(() => {
    queueMicrotask(() => {
      const stored = window.localStorage.getItem(STORAGE_KEY)

      if (!stored) {
        return
      }

      try {
        const parsed = JSON.parse(stored) as { features?: FeatureCatalogItem[] }

        if (Array.isArray(parsed.features)) {
          setFeatures(parsed.features)
        }
      } catch {
        setFeatures(defaultFeatures)
      }
    })
  }, [])

  function persistFeatures(nextFeatures: FeatureCatalogItem[]) {
    setFeatures(nextFeatures)
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ features: nextFeatures, version: 1 })
    )
  }

  const selectedFeature = useMemo(
    () => features.find((feature) => feature.id === selectedFeatureId),
    [features, selectedFeatureId]
  )

  const filteredFeatures = useMemo(() => {
    const searchValue = search.trim().toLowerCase()

    return features.filter((feature) => {
      const matchesSearch =
        !searchValue ||
        [
          feature.displayName,
          feature.internalCode,
          feature.description,
          feature.category,
          feature.billingType,
        ]
          .join(" ")
          .toLowerCase()
          .includes(searchValue)
      const matchesCategory = category === "All" || feature.category === category
      const matchesBillingType =
        billingType === "All" || feature.billingType === billingType

      return matchesSearch && matchesCategory && matchesBillingType
    })
  }, [billingType, category, features, search])

  function openCreateDrawer() {
    setForm(emptyForm)
    setDrawerMode("create")
    setDrawerOpen(true)
    setMessage("")
  }

  function openViewDrawer(feature: FeatureCatalogItem) {
    setSelectedFeatureId(feature.id)
    setDrawerMode("view")
    setDrawerOpen(true)
    setMessage("")
  }

  function openEditDrawer(feature: FeatureCatalogItem) {
    setSelectedFeatureId(feature.id)
    setForm(toFormState(feature))
    setDrawerMode("edit")
    setDrawerOpen(true)
    setMessage("")
  }

  function saveFeature() {
    const now = formatDate(new Date())

    if (!form.displayName.trim() || !form.internalCode.trim()) {
      setMessage("Display Name and Internal Code are required.")
      return
    }

    if (drawerMode === "create") {
      const nextFeature: FeatureCatalogItem = {
        ...form,
        description: form.description.trim(),
        displayName: form.displayName.trim(),
        estimatedRevenue: 0,
        id: createFeatureId(form.displayName),
        internalCode: form.internalCode.trim(),
        monthlyUsage: 0,
        planFeatureKeys: [],
        updatedAt: now,
      }

      const nextFeatures = [...features, nextFeature]
      persistFeatures(nextFeatures)
      setSelectedFeatureId(nextFeature.id)
      setDrawerMode("view")
      setMessage("Feature has been created.")
      return
    }

    if (!selectedFeature) {
      return
    }

    const nextFeatures = features.map((feature) =>
      feature.id === selectedFeature.id
        ? {
            ...feature,
            ...form,
            description: form.description.trim(),
            displayName: form.displayName.trim(),
            internalCode: form.internalCode.trim(),
            updatedAt: now,
          }
        : feature
    )

    persistFeatures(nextFeatures)
    setDrawerMode("view")
    setMessage("Feature has been updated.")
  }

  function deleteFeature(feature: FeatureCatalogItem) {
    const connectedPlans = getConnectedPlans(feature, plans)

    if (connectedPlans.length > 0) {
      setMessage("This feature is currently assigned to one or more plans.")
      return
    }

    const nextFeatures = features.filter((item) => item.id !== feature.id)
    persistFeatures(nextFeatures)
    setDrawerOpen(false)
    setSelectedFeatureId(nextFeatures[0]?.id)
    setMessage("Feature has been deleted.")
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Features"
        description="Manage billable product capabilities, provider costs, credit consumption, connected plans, and monthly usage."
        breadcrumbs={[{ label: "Billing" }, { label: "Features" }]}
        actions={
          <AdminButton variant="primary" onClick={openCreateDrawer}>
            <Plus className="size-4" />
            Create Feature
          </AdminButton>
        }
      />

      {message ? (
        <div className="mb-6 rounded-xl border border-violet-100 bg-violet-50 px-4 py-3 text-sm font-semibold text-violet-700">
          {message}
        </div>
      ) : null}

      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
        <div className="grid gap-4 xl:grid-cols-[minmax(240px,1fr)_auto_auto]">
          <label>
            <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Search Features
            </span>
            <span className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                className={cn(inputClass, "pl-10")}
                placeholder="Search Features"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </span>
          </label>
          <FilterSelect
            label="Category"
            value={category}
            options={categories}
            onChange={(value) => setCategory(value as typeof category)}
          />
          <FilterSelect
            label="Billing Type"
            value={billingType}
            options={billingTypes}
            onChange={(value) => setBillingType(value as typeof billingType)}
          />
        </div>
      </section>

      <FeatureTable
        features={filteredFeatures}
        plans={plans}
        onEdit={openEditDrawer}
        onRowClick={openViewDrawer}
      />

      <SideDrawer
        title={
          drawerMode === "create"
            ? "Create Feature"
            : drawerMode === "edit"
              ? "Edit Feature"
              : selectedFeature?.displayName ?? "Feature Detail"
        }
        description={
          drawerMode === "view"
            ? selectedFeature?.internalCode
            : "Configure the catalog fields used by billing plans and operations."
        }
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        {drawerMode === "view" && selectedFeature ? (
          <FeatureDetail
            feature={selectedFeature}
            plans={plans}
            onDelete={() => deleteFeature(selectedFeature)}
            onEdit={() => openEditDrawer(selectedFeature)}
          />
        ) : (
          <FeatureForm
            form={form}
            mode={drawerMode}
            onCancel={() => {
              if (selectedFeature) {
                setDrawerMode("view")
              } else {
                setDrawerOpen(false)
              }
            }}
            onChange={setForm}
            onSave={saveFeature}
          />
        )}
      </SideDrawer>
    </DashboardLayout>
  )
}

function FeatureTable({
  features,
  plans,
  onEdit,
  onRowClick,
}: {
  features: FeatureCatalogItem[]
  plans: BillingPlan[]
  onEdit: (feature: FeatureCatalogItem) => void
  onRowClick: (feature: FeatureCatalogItem) => void
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1480px] border-separate border-spacing-0">
          <thead>
            <tr className="bg-white">
              {[
                "Feature Name",
                "Category",
                "Description",
                "Billing Type",
                "Unit",
                "Provider Cost",
                "User Consumption",
                "Used By Plans",
                "Updated At",
              ].map((header) => (
                <th
                  key={header}
                  className="border-b border-slate-100 px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500"
                >
                  {header}
                </th>
              ))}
              <th className="w-20 border-b border-slate-100 px-5 py-4" />
            </tr>
          </thead>
          <tbody>
            {features.map((feature) => {
              const connectedPlans = getConnectedPlans(feature, plans)

              return (
                <tr
                  key={feature.id}
                  className="cursor-pointer transition-colors hover:bg-slate-50"
                  onClick={() => onRowClick(feature)}
                >
                  <td className={cellClass}>
                    <p className="font-bold text-slate-950">{feature.displayName}</p>
                    <p className="mt-1 max-w-64 truncate text-xs text-slate-500">
                      {feature.internalCode}
                    </p>
                  </td>
                  <td className={cellClass}>
                    <CategoryBadge category={feature.category} />
                  </td>
                  <td className={cellClass}>
                    <p className="max-w-72 leading-5 text-slate-600">
                      {feature.description}
                    </p>
                  </td>
                  <td className={cellClass}>{feature.billingType}</td>
                  <td className={cellClass}>{feature.unit}</td>
                  <td className={cellClass}>
                    {formatProviderCost(feature)}
                  </td>
                  <td className={cellClass}>
                    {formatUserConsumption(feature)}
                  </td>
                  <td className={cellClass}>
                    {connectedPlans.length ? (
                      <div className="flex max-w-80 flex-wrap gap-1.5">
                        {connectedPlans.slice(0, 4).map((plan) => (
                          <span
                            key={`${plan.service}-${plan.id}`}
                            className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600"
                          >
                            {plan.name}
                          </span>
                        ))}
                        {connectedPlans.length > 4 ? (
                          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500">
                            +{connectedPlans.length - 4}
                          </span>
                        ) : null}
                      </div>
                    ) : (
                      <span className="text-slate-400">Not assigned</span>
                    )}
                  </td>
                  <td className={cellClass}>{feature.updatedAt}</td>
                  <td className={cellClass}>
                    <button
                      className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-600"
                      onClick={(event) => {
                        event.stopPropagation()
                        onEdit(feature)
                      }}
                      type="button"
                      aria-label={`Edit ${feature.displayName}`}
                    >
                      <Pencil className="size-4" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 text-sm text-slate-500">
        <span>{formatNumber(features.length)} features</span>
        <span>Feature Catalog</span>
      </div>
    </section>
  )
}

function FeatureDetail({
  feature,
  plans,
  onDelete,
  onEdit,
}: {
  feature: FeatureCatalogItem
  plans: BillingPlan[]
  onDelete: () => void
  onEdit: () => void
}) {
  const connectedPlans = getConnectedPlans(feature, plans)
  const estimatedCost = getEstimatedCost(feature)
  const margin = feature.estimatedRevenue - estimatedCost

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <AdminButton onClick={onEdit}>
          <Pencil className="size-4" />
          Edit
        </AdminButton>
        <AdminButton onClick={onDelete}>
          <Trash2 className="size-4" />
          Delete
        </AdminButton>
      </div>

      <DrawerSection title="Basic Information">
        <InfoRow label="Display Name" value={feature.displayName} />
        <InfoRow label="Internal Code" value={feature.internalCode} />
        <InfoRow label="Category" value={feature.category} />
        <InfoRow label="Description" value={feature.description} />
      </DrawerSection>

      <DrawerSection title="Billing Information">
        <InfoRow label="Billing Type" value={feature.billingType} />
        <InfoRow label="Unit" value={feature.unit} />
        <InfoRow label="Provider Cost" value={formatProviderCost(feature)} />
        <InfoRow
          label="User Consumption Cost"
          value={formatUserConsumption(feature)}
        />
      </DrawerSection>

      <DrawerSection title="Connected Plans">
        {connectedPlans.length ? (
          <div className="grid gap-2">
            {connectedPlans.map((plan) => (
              <div
                key={`${plan.service}-${plan.id}`}
                className="flex items-center gap-2 text-sm font-semibold text-slate-700"
              >
                <Check className="size-4 text-violet-600" />
                {plan.name}
                <span className="text-xs font-medium text-slate-400">
                  {plan.service}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No connected plans.</p>
        )}
      </DrawerSection>

      <DrawerSection title="Usage Statistics">
        <InfoRow
          label="Monthly Usage"
          value={`${formatNumber(feature.monthlyUsage)} ${pluralizeUnit(feature.unit)}`}
        />
        <InfoRow label="Estimated Cost" value={formatUsd(estimatedCost)} />
        <InfoRow
          label="User Consumption"
          value={`${formatNumber(feature.monthlyUsage * feature.userConsumption)} Credits`}
        />
      </DrawerSection>

      <DrawerSection title="Cost Summary">
        <InfoRow label="Provider Cost" value={formatUsd(estimatedCost)} />
        <InfoRow
          label="Estimated Revenue"
          value={formatUsd(feature.estimatedRevenue)}
        />
        <InfoRow
          label="Margin"
          value={formatUsd(margin)}
          valueClassName={margin >= 0 ? "text-emerald-600" : "text-rose-500"}
        />
      </DrawerSection>
    </div>
  )
}

function FeatureForm({
  form,
  mode,
  onCancel,
  onChange,
  onSave,
}: {
  form: FeatureFormState
  mode: DrawerMode
  onCancel: () => void
  onChange: (form: FeatureFormState) => void
  onSave: () => void
}) {
  return (
    <div className="space-y-6">
      <DrawerSection title="Basic Information">
        <FormField label="Display Name">
          <input
            className={inputClass}
            value={form.displayName}
            onChange={(event) =>
              onChange({ ...form, displayName: event.target.value })
            }
          />
        </FormField>
        <FormField label="Internal Code">
          <input
            className={inputClass}
            value={form.internalCode}
            onChange={(event) =>
              onChange({ ...form, internalCode: event.target.value })
            }
          />
        </FormField>
        <FormField label="Category">
          <select
            className={inputClass}
            value={form.category}
            onChange={(event) =>
              onChange({ ...form, category: event.target.value as FeatureCategory })
            }
          >
            {categories
              .filter((item): item is FeatureCategory => item !== "All")
              .map((item) => (
                <option key={item}>{item}</option>
              ))}
          </select>
        </FormField>
        <FormField label="Description">
          <textarea
            className={cn(inputClass, "h-28 resize-none py-3 leading-6")}
            value={form.description}
            onChange={(event) =>
              onChange({ ...form, description: event.target.value })
            }
          />
        </FormField>
      </DrawerSection>

      <DrawerSection title="Billing Information">
        <FormField label="Billing Type">
          <select
            className={inputClass}
            value={form.billingType}
            onChange={(event) =>
              onChange({
                ...form,
                billingType: event.target.value as FeatureBillingType,
              })
            }
          >
            {billingTypes
              .filter((item): item is FeatureBillingType => item !== "All")
              .map((item) => (
                <option key={item}>{item}</option>
              ))}
          </select>
        </FormField>
        <FormField label="Unit">
          <select
            className={inputClass}
            value={form.unit}
            onChange={(event) =>
              onChange({ ...form, unit: event.target.value as FeatureUnit })
            }
          >
            {units.map((unit) => (
              <option key={unit}>{unit}</option>
            ))}
          </select>
        </FormField>
        <FormField label="Provider Cost">
          <CostInput
            prefix="$"
            suffix={`/${form.unit.toLowerCase()}`}
            value={form.providerCost}
            onChange={(providerCost) => onChange({ ...form, providerCost })}
          />
        </FormField>
        <FormField label="User Consumption Cost">
          <CostInput
            suffix={`Credits / ${form.unit.toLowerCase()}`}
            value={form.userConsumption}
            onChange={(userConsumption) =>
              onChange({ ...form, userConsumption })
            }
          />
        </FormField>
      </DrawerSection>

      <div className="flex justify-end gap-2">
        <AdminButton onClick={onCancel}>Cancel</AdminButton>
        <AdminButton variant="primary" onClick={onSave}>
          {mode === "create" ? "Create Feature" : "Save Feature"}
        </AdminButton>
      </div>
    </div>
  )
}

function CostInput({
  onChange,
  prefix,
  suffix,
  value,
}: {
  onChange: (value: number) => void
  prefix?: string
  suffix: string
  value: number
}) {
  return (
    <div className="flex overflow-hidden rounded-xl border border-slate-200 bg-white focus-within:border-violet-400 focus-within:ring-4 focus-within:ring-violet-500/10">
      {prefix ? (
        <span className="flex h-12 items-center border-r border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-500">
          {prefix}
        </span>
      ) : null}
      <input
        className="h-12 min-w-0 flex-1 px-4 text-sm font-semibold text-slate-950 outline-none"
        min={0}
        step="0.001"
        type="number"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <span className="flex h-12 items-center border-l border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-500">
        {suffix}
      </span>
    </div>
  )
}

function FilterSelect({
  label,
  onChange,
  options,
  value,
}: {
  label: string
  onChange: (value: string) => void
  options: string[]
  value: string
}) {
  return (
    <label className="min-w-52">
      <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <select
        className={inputClass}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  )
}

function DrawerSection({
  children,
  title,
}: {
  children: React.ReactNode
  title: string
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <h3 className="text-base font-bold text-slate-950">{title}</h3>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  )
}

function FormField({
  children,
  label,
}: {
  children: React.ReactNode
  label: string
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-950">{label}</span>
      {children}
    </label>
  )
}

function InfoRow({
  label,
  value,
  valueClassName,
}: {
  label: string
  value: string
  valueClassName?: string
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className={cn("mt-1 text-sm font-semibold text-slate-800", valueClassName)}>
        {value}
      </p>
    </div>
  )
}

function CategoryBadge({ category }: { category: FeatureCategory }) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-full px-3 text-xs font-bold",
        category === "Video" && "bg-sky-50 text-sky-600",
        category === "Image" && "bg-fuchsia-50 text-fuchsia-600",
        category === "Storage" && "bg-amber-50 text-amber-700",
        category === "Credits" && "bg-emerald-50 text-emerald-600",
        category === "AI" && "bg-violet-50 text-violet-600",
        category === "System" && "bg-slate-100 text-slate-600"
      )}
    >
      {category}
    </span>
  )
}

function getConnectedPlans(feature: FeatureCatalogItem, plans: BillingPlan[]) {
  if (!feature.planFeatureKeys.length) {
    return []
  }

  return plans.filter((plan) =>
    feature.planFeatureKeys.some((featureKey) => plan.features.includes(featureKey))
  )
}

function formatProviderCost(feature: FeatureCatalogItem) {
  return `${formatUsd(feature.providerCost)} / ${feature.unit.toLowerCase()}`
}

function formatUserConsumption(feature: FeatureCatalogItem) {
  return `${formatNumber(feature.userConsumption)} Credits / ${feature.unit.toLowerCase()}`
}

function getEstimatedCost(feature: FeatureCatalogItem) {
  return feature.monthlyUsage * feature.providerCost
}

function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: value >= 100 ? 0 : 3,
    minimumFractionDigits: value >= 100 ? 0 : 2,
    style: "currency",
  }).format(value)
}

function formatDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

function createFeatureId(name: string) {
  return `feature_${name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")}_${Date.now()}`
}

function pluralizeUnit(unit: FeatureUnit) {
  if (unit === "GB") {
    return "GB"
  }

  return `${unit}s`
}

function toFormState(feature: FeatureCatalogItem): FeatureFormState {
  return {
    billingType: feature.billingType,
    category: feature.category,
    description: feature.description,
    displayName: feature.displayName,
    internalCode: feature.internalCode,
    providerCost: feature.providerCost,
    unit: feature.unit,
    userConsumption: feature.userConsumption,
  }
}

const cellClass = "border-b border-slate-100 px-5 py-5 text-sm text-slate-900"

const inputClass =
  "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-950 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
