"use client"

import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react"
import { useMemo, useState } from "react"
import {
  ArrowLeft,
  Eye,
  Image as ImageIcon,
  Link as LinkIcon,
  Plus,
  Save,
  Trash2,
  Upload,
} from "lucide-react"
import { useRouter } from "next/navigation"

import AdminButton from "@/components/admin/AdminButton"
import PageHeader from "@/components/admin/PageHeader"
import {
  getLandingPage,
  landingPages,
} from "@/components/content/landingPageMock"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { cn } from "@/lib/utils"

export default function LandingPageDetailClient({ pageId }: { pageId: string }) {
  const router = useRouter()
  const page = useMemo(() => getLandingPage(pageId) ?? landingPages[0], [pageId])
  const [selectedBlockName, setSelectedBlockName] = useState(
    page.contentBlocks[0]?.name ?? ""
  )
  const selectedBlock =
    page.contentBlocks.find((block) => block.name === selectedBlockName) ??
    page.contentBlocks[0]
  const [imageDrafts, setImageDrafts] = useState(() =>
    Object.fromEntries(page.images.map((asset) => [asset.id, asset.url]))
  )
  const [uploadedFileNames, setUploadedFileNames] = useState<Record<string, string>>(
    {}
  )

  return (
    <DashboardLayout>
      <PageHeader
        breadcrumbs={[
          { label: "Content" },
          { label: "Landing Pages" },
          { label: page.name },
        ]}
        title={page.name}
        description={`Editing ${page.url}. Manage this page's metadata, SEO, images, and lightweight content.`}
        actions={
          <>
            <AdminButton
              variant="secondary"
              onClick={() => router.push("/content/landing-pages")}
            >
              <ArrowLeft className="size-4" />
              Back to List
            </AdminButton>
            <AdminButton variant="secondary">
              <Eye className="size-4" />
              Preview
            </AdminButton>
            <AdminButton variant="primary">
              <Save className="size-4" />
              Save Draft
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
            description="Page-level CMS fields that identify this landing page entity."
          />
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <CmsInput label="Page Name" defaultValue={page.name} />
            <CmsInput label="URL" defaultValue={page.url} />
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
            <CmsInput label="Updated By" defaultValue={page.updatedBy} readOnly />
            <CmsTextArea
              label="Short Description"
              defaultValue={page.shortDescription}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
          <SectionTitle
            title="SEO Management"
            description="Highest-priority editable metadata for search result previews and social sharing."
          />
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <CmsInput label="Meta Title" defaultValue={page.metaTitle} />
            <CmsInput label="OG Title" defaultValue={page.ogTitle} />
            <CmsTextArea label="Meta Description" defaultValue={page.metaDescription} />
            <CmsTextArea
              label="OG Description"
              defaultValue={page.ogDescription}
            />
            <CmsInput label="Keywords" defaultValue={page.keywords} />
            <CmsInput label="OG Image" defaultValue={page.ogImage} />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <SectionTitle
              title="Image Management"
              description="Connected page assets. Upload a replacement or paste an image URL per asset."
            />
            <AdminButton variant="secondary">
              <Plus className="size-4" />
              Add Image Slot
            </AdminButton>
          </div>
          <div className="mt-6 grid gap-4 xl:grid-cols-2">
            {page.images.map((asset) => (
              <div
                key={asset.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-950">{asset.label}</p>
                      <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-slate-500 ring-1 ring-slate-200">
                        {asset.type}
                      </span>
                    </div>
                    <p className="mt-1 text-xs font-medium text-slate-500">
                      {asset.alt}
                    </p>
                  </div>
                  <ImageIcon className="size-5 shrink-0 text-violet-500" />
                </div>
                <div className="mt-4 flex h-32 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white">
                  <div className="max-w-full px-4 text-center">
                    <ImageIcon className="mx-auto size-7 text-slate-400" />
                    <p className="mt-2 truncate text-xs font-semibold text-slate-500">
                      {uploadedFileNames[asset.id] || imageDrafts[asset.id]}
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid gap-3">
                  <label className="block">
                    <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Upload from computer
                    </span>
                    <input
                      className="mt-2 block w-full rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 file:mr-4 file:h-10 file:border-0 file:bg-slate-100 file:px-4 file:text-sm file:font-bold file:text-slate-700 hover:file:bg-slate-200"
                      type="file"
                      accept="image/*"
                      onChange={(event) => {
                        const file = event.target.files?.[0]
                        setUploadedFileNames((current) => ({
                          ...current,
                          [asset.id]: file?.name ?? "",
                        }))
                      }}
                    />
                  </label>
                  <CmsInput
                    label="Paste Image URL"
                    value={imageDrafts[asset.id] ?? ""}
                    onChange={(event) =>
                      setImageDrafts((current) => ({
                        ...current,
                        [asset.id]: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <AdminButton variant="secondary">
                    <Upload className="size-4" />
                    Replace
                  </AdminButton>
                  <AdminButton
                    variant="ghost"
                    onClick={() =>
                      setImageDrafts((current) => ({ ...current, [asset.id]: "" }))
                    }
                  >
                    <Trash2 className="size-4" />
                    Remove
                  </AdminButton>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
          <div className="border-b border-slate-100 p-6">
            <SectionTitle
              title="Lightweight Content"
              description="Edit simple titles, subtitles, CTA text, short descriptions, and page section copy."
            />
          </div>
          <div className="grid lg:grid-cols-[280px_1fr]">
            <aside className="border-b border-slate-100 bg-slate-50 p-4 lg:border-b-0 lg:border-r">
              <div className="space-y-2">
                {page.contentBlocks.map((block) => (
                  <button
                    key={block.name}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-bold transition",
                      selectedBlock.name === block.name
                        ? "bg-violet-600 text-white shadow-sm shadow-violet-600/20"
                        : "text-slate-600 hover:bg-white hover:text-slate-950 hover:shadow-sm"
                    )}
                    onClick={() => setSelectedBlockName(block.name)}
                    type="button"
                  >
                    <span>{block.name}</span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs",
                        selectedBlock.name === block.name
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 text-slate-500"
                      )}
                    >
                      {block.fields.length}
                    </span>
                  </button>
                ))}
              </div>
            </aside>

            <div className="p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-slate-950">
                      {selectedBlock.name}
                    </h2>
                    <StatusPill status={selectedBlock.status} />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {selectedBlock.description}
                  </p>
                </div>
                <AdminButton variant="secondary">
                  <Plus className="size-4" />
                  Add Field
                </AdminButton>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {selectedBlock.fields.map((field) => (
                  <CmsTextArea
                    key={`${selectedBlock.name}-${field.label}`}
                    label={field.label}
                    defaultValue={field.value}
                  />
                ))}
                <CmsInput
                  label="Section Anchor"
                  defaultValue={`#${selectedBlock.name.toLowerCase().replace(/\s+/g, "-")}`}
                />
                <CmsInput
                  label="CTA Link"
                  defaultValue={
                    selectedBlock.name === "Pricing" ? "/pricing" : "/signup"
                  }
                />
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                  <LinkIcon className="size-4 text-slate-400" />
                  Changes are saved as mock draft data until API integration.
                </div>
                <AdminButton variant="primary">
                  <Save className="size-4" />
                  Save Section Draft
                </AdminButton>
              </div>
            </div>
          </div>
        </section>
      </div>
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
        className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-950 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
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
    <label className="block md:col-span-1">
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
    status === "Published" || status === "Ready"
      ? "bg-emerald-50 text-emerald-600 ring-emerald-100"
      : status === "Draft" || status === "Scheduled"
        ? "bg-violet-50 text-violet-600 ring-violet-100"
        : status === "Needs Review"
          ? "bg-orange-50 text-orange-600 ring-orange-100"
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
