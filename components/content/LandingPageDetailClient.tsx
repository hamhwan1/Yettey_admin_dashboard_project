"use client"

import type {
  Dispatch,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  SetStateAction,
  TextareaHTMLAttributes,
} from "react"
import { useMemo, useState } from "react"
import { AlertTriangle, ArrowLeft, ExternalLink, Save } from "lucide-react"
import { useRouter } from "next/navigation"

import AdminButton from "@/components/admin/AdminButton"
import PageHeader from "@/components/admin/PageHeader"
import {
  getLandingPage,
  landingPages,
  seoLanguages,
  type LandingSeoSettings,
  type SeoLanguage,
} from "@/components/content/landingPageMock"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { cn } from "@/lib/utils"

export default function LandingPageDetailClient({ pageId }: { pageId: string }) {
  const router = useRouter()
  const page = useMemo(() => getLandingPage(pageId) ?? landingPages[0], [pageId])
  const initialLanguage: SeoLanguage = page.locale === "ko-KR" ? "Korean" : "English"
  const [selectedLanguage, setSelectedLanguage] =
    useState<SeoLanguage>(initialLanguage)
  const [savedSeo, setSavedSeo] = useState(() => cloneSeoState(page.seo))
  const [seoDrafts, setSeoDrafts] = useState(() => cloneSeoState(page.seo))
  const [urlDraft, setUrlDraft] = useState(page.url)
  const [pendingUrl, setPendingUrl] = useState("")
  const [showUrlWarning, setShowUrlWarning] = useState(false)
  const [urlWarningAccepted, setUrlWarningAccepted] = useState(false)
  const [saveDialog, setSaveDialog] = useState<
    "confirm" | "failure" | "success" | null
  >(null)
  const seo = seoDrafts[selectedLanguage]
  const hasSeoChanges = hasSeoStateChanges(savedSeo, seoDrafts)

  const handleUrlChange = (value: string) => {
    if (!urlWarningAccepted && value !== page.url) {
      setPendingUrl(value)
      setShowUrlWarning(true)
      return
    }

    setUrlDraft(value)
  }

  return (
    <DashboardLayout>
      <PageHeader
        breadcrumbs={[
          { label: "Content" },
          { label: "Landing Pages" },
          { label: page.name },
        ]}
        title={page.name}
        description={`Managing page information and localized SEO metadata for ${page.url}.`}
        actions={
          <>
            <AdminButton
              variant="secondary"
              onClick={() => router.push("/content/landing-pages")}
            >
              <ArrowLeft className="size-4" />
              Back to List
            </AdminButton>
            <AdminButton
              variant="secondary"
              onClick={() => window.open(page.liveUrl, "_blank", "noopener,noreferrer")}
            >
              <ExternalLink className="size-4" />
              Open Live Page
            </AdminButton>
            <AdminButton
              disabled={!hasSeoChanges}
              onClick={() => setSaveDialog("confirm")}
              variant="primary"
            >
              <Save className="size-4" />
              Save SEO
            </AdminButton>
          </>
        }
      />

      <div className="space-y-6">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
          <div className="grid divide-y divide-slate-100 md:grid-cols-3 md:divide-x md:divide-y-0 xl:grid-cols-6">
            <SummaryCell label="Page Name" value={page.name} />
            <SummaryCell label="URL" value={page.url} />
            <SummaryCell label="Product" value={<ProductPill product={page.product} />} />
            <SummaryCell label="Locale" value={page.locale} />
            <SummaryCell label="Status" value={<StatusPill status={page.status} />} />
            <SummaryCell
              label="Updated"
              value={page.lastUpdated}
              helper={`by ${page.updatedBy}`}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
          <SectionTitle
            title="Basic Information"
            description="Page-level fields for routing, ownership, locale, and publish state."
          />
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <CmsInput label="Page Name" defaultValue={page.name} />
            <CmsInput
              label="URL"
              value={urlDraft}
              onChange={(event) => handleUrlChange(event.target.value)}
            />
            <CmsSelect
              label="Product Group"
              defaultValue={page.product}
              options={["YETTEY", "VPICK", "Shared/Common"]}
            />
            <CmsSelect
              label="Locale"
              defaultValue={page.locale}
              options={["en-US", "ko-KR"]}
            />
            <CmsSelect
              label="Publish Status"
              defaultValue={page.status}
              options={["Published", "Draft", "Scheduled"]}
            />
            <CmsInput label="Last Updated" defaultValue={page.lastUpdated} readOnly />
            <CmsInput label="Updated By" defaultValue={page.updatedBy} readOnly />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
          <div className="border-b border-slate-100 p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <SectionTitle
                title="SEO Management"
                description="Edit localized search metadata for this specific landing page."
              />
              <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
                {seoLanguages.map((language) => (
                  <button
                    key={language}
                    className={cn(
                      "h-9 rounded-lg px-4 text-sm font-bold transition",
                      selectedLanguage === language
                        ? "bg-violet-600 text-white shadow-sm shadow-violet-600/20"
                        : "text-slate-600 hover:bg-white hover:text-slate-950"
                    )}
                    onClick={() => setSelectedLanguage(language)}
                    type="button"
                  >
                    {language}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-0 lg:grid-cols-[280px_1fr]">
            <aside className="border-b border-slate-100 bg-slate-50 p-5 lg:border-b-0 lg:border-r">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Current Language
              </p>
              <p className="mt-2 text-lg font-bold text-slate-950">
                {selectedLanguage}
              </p>
              <div className="mt-5 space-y-3 text-sm font-semibold text-slate-600">
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Page
                  </p>
                  <p className="mt-1 text-slate-950">{page.name}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Live URL
                  </p>
                  <p className="mt-1 break-all text-violet-600">{page.liveUrl}</p>
                </div>
              </div>
            </aside>

            <div className="p-6">
              <div className="grid gap-4">
                <CmsInput
                  label="Meta Title"
                  value={seo.metaTitle}
                  onChange={(event) =>
                    updateSeoDraft(
                      selectedLanguage,
                      "metaTitle",
                      event.target.value,
                      setSeoDrafts
                    )
                  }
                />
                <CmsTextArea
                  label="Meta Description"
                  value={seo.metaDescription}
                  onChange={(event) =>
                    updateSeoDraft(
                      selectedLanguage,
                      "metaDescription",
                      event.target.value,
                      setSeoDrafts
                    )
                  }
                />
                <CmsTextArea
                  label="Keywords"
                  value={seo.keywords}
                  onChange={(event) =>
                    updateSeoDraft(
                      selectedLanguage,
                      "keywords",
                      event.target.value,
                      setSeoDrafts
                    )
                  }
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      {showUrlWarning ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-600">
                <AlertTriangle className="size-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  URL change may affect SEO
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Changing this URL may affect SEO rankings, indexed search
                  results, and existing backlinks. Do you want to continue?
                </p>
                <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm font-semibold text-slate-600">
                  {page.url} -&gt; {pendingUrl || "(empty URL)"}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <AdminButton
                variant="secondary"
                onClick={() => {
                  setPendingUrl("")
                  setShowUrlWarning(false)
                }}
              >
                Cancel
              </AdminButton>
              <AdminButton
                variant="primary"
                onClick={() => {
                  setUrlWarningAccepted(true)
                  setUrlDraft(pendingUrl)
                  setPendingUrl("")
                  setShowUrlWarning(false)
                }}
              >
                Continue
              </AdminButton>
            </div>
          </div>
        </div>
      ) : null}

      {saveDialog === "confirm" ? (
        <Dialog
          message="Are you sure you want to save these SEO changes?"
          onCancel={() => setSaveDialog(null)}
          onConfirm={() => {
            const saveFailed = !seo.metaTitle.trim()

            if (saveFailed) {
              setSaveDialog("failure")
              return
            }

            setSavedSeo(cloneSeoState(seoDrafts))
            setSaveDialog("success")
          }}
          title="Save Changes"
        />
      ) : null}

      {saveDialog === "success" ? (
        <Dialog
          confirmLabel="OK"
          message="SEO information has been saved successfully."
          onConfirm={() => setSaveDialog(null)}
          title="Saved"
        />
      ) : null}

      {saveDialog === "failure" ? (
        <Dialog
          confirmLabel="OK"
          message="Failed to save SEO information. Please try again later."
          onConfirm={() => setSaveDialog(null)}
          title="Save Failed"
          tone="danger"
        />
      ) : null}
    </DashboardLayout>
  )
}

function SummaryCell({
  helper,
  label,
  value,
}: {
  helper?: string
  label: string
  value: ReactNode
}) {
  return (
    <div className="p-5">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <div className="mt-2 text-sm font-bold text-slate-950">{value}</div>
      {helper ? <p className="mt-1 text-xs font-semibold text-slate-500">{helper}</p> : null}
    </div>
  )
}

function SectionTitle({
  description,
  title,
}: {
  description: string
  title: string
}) {
  return (
    <div>
      <h2 className="text-lg font-bold text-slate-950">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  )
}

function CmsInput({
  label,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <input
        className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-950 outline-none transition read-only:bg-slate-50 read-only:text-slate-500 focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
        {...props}
      />
    </label>
  )
}

function CmsSelect({
  label,
  options,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
  options: string[]
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <select
        className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-950 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
        {...props}
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  )
}

function CmsTextArea({
  label,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <textarea
        className="mt-2 min-h-28 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold leading-6 text-slate-950 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
        {...props}
      />
    </label>
  )
}

function StatusPill({ status }: { status: string }) {
  const tone =
    status === "Published"
      ? "bg-emerald-50 text-emerald-600 ring-emerald-100"
      : status === "Draft" || status === "Scheduled"
        ? "bg-violet-50 text-violet-600 ring-violet-100"
        : "bg-slate-100 text-slate-600 ring-slate-200"

  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full px-2.5 text-xs font-bold ring-1",
        tone
      )}
    >
      {status}
    </span>
  )
}

function ProductPill({ product }: { product: string }) {
  const tone =
    product === "YETTEY"
      ? "bg-violet-50 text-violet-600 ring-violet-100"
      : product === "VPICK"
        ? "bg-blue-50 text-blue-600 ring-blue-100"
        : "bg-slate-100 text-slate-600 ring-slate-200"

  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full px-2.5 text-xs font-bold ring-1",
        tone
      )}
    >
      {product}
    </span>
  )
}

function cloneSeoState(seo: Record<SeoLanguage, LandingSeoSettings>) {
  return Object.fromEntries(
    seoLanguages.map((language) => [language, { ...seo[language] }])
  ) as Record<SeoLanguage, LandingSeoSettings>
}

function hasSeoStateChanges(
  savedSeo: Record<SeoLanguage, LandingSeoSettings>,
  seoDrafts: Record<SeoLanguage, LandingSeoSettings>
) {
  return seoLanguages.some((language) => {
    const saved = savedSeo[language]
    const draft = seoDrafts[language]

    return (
      saved.metaTitle !== draft.metaTitle ||
      saved.metaDescription !== draft.metaDescription ||
      saved.keywords !== draft.keywords
    )
  })
}

function updateSeoDraft(
  language: SeoLanguage,
  field: keyof LandingSeoSettings,
  value: string,
  setSeoDrafts: Dispatch<SetStateAction<Record<SeoLanguage, LandingSeoSettings>>>
) {
  setSeoDrafts((current) => ({
    ...current,
    [language]: {
      ...current[language],
      [field]: value,
    },
  }))
}

function Dialog({
  confirmLabel = "Save",
  message,
  onCancel,
  onConfirm,
  title,
  tone = "default",
}: {
  confirmLabel?: string
  message: string
  onCancel?: () => void
  onConfirm: () => void
  title: string
  tone?: "danger" | "default"
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <h2 className="text-lg font-bold text-slate-950">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{message}</p>
        <div className="mt-6 flex justify-end gap-2">
          {onCancel ? (
            <AdminButton variant="secondary" onClick={onCancel}>
              Cancel
            </AdminButton>
          ) : null}
          <AdminButton
            className={
              tone === "danger"
                ? "bg-red-600 shadow-red-600/20 hover:bg-red-700 hover:shadow-red-600/25"
                : undefined
            }
            onClick={onConfirm}
            variant="primary"
          >
            {confirmLabel}
          </AdminButton>
        </div>
      </div>
    </div>
  )
}
