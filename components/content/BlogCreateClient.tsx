"use client"

import { useState } from "react"
import { ArrowLeft, Check, Send } from "lucide-react"
import { useRouter } from "next/navigation"

import AdminButton from "@/components/admin/AdminButton"
import PageHeader from "@/components/admin/PageHeader"
import DashboardLayout from "@/components/layout/DashboardLayout"

const categoryOptions = ["AI Content", "Video Editing", "Product Updates", "Social Media"]

type BlogDraft = {
  category: string
  content: string
  seoDescription: string
  seoTitle: string
  tags: string
  thumbnail: string
  title: string
}

export default function BlogCreateClient() {
  const router = useRouter()
  const [draft, setDraft] = useState<BlogDraft>({
    category: categoryOptions[0],
    content: "",
    seoDescription: "",
    seoTitle: "",
    tags: "",
    thumbnail: "",
    title: "",
  })
  const [feedback, setFeedback] = useState<"draft" | "published" | null>(null)

  const updateDraft = (patch: Partial<BlogDraft>) => {
    setDraft((current) => ({ ...current, ...patch }))
  }

  return (
    <DashboardLayout>
      <PageHeader
        breadcrumbs={[
          { label: "Content" },
          { label: "Blog" },
          { label: "Create" },
        ]}
        title="Create Manual Post"
        description="Write a first-party blog article, manage metadata, then save as draft or publish."
        actions={
          <AdminButton onClick={() => router.push("/content/blog")}>
            <ArrowLeft className="size-4" />
            Back to Blog
          </AdminButton>
        }
      />

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
        <div className="border-b border-slate-100 p-6">
          <h2 className="text-lg font-bold text-slate-950">Manual Post Editor</h2>
          <p className="mt-1 text-sm text-slate-500">
            This mock editor stores local form state only. Backend publishing will be connected later.
          </p>
        </div>
        <div className="grid gap-5 p-6 md:grid-cols-2">
          <Field
            label="Title"
            value={draft.title}
            onChange={(value) => updateDraft({ title: value })}
          />
          <Field
            label="Thumbnail"
            value={draft.thumbnail}
            onChange={(value) => updateDraft({ thumbnail: value })}
          />
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Category
            </span>
            <select
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-950 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
              value={draft.category}
              onChange={(event) => updateDraft({ category: event.target.value })}
            >
              {categoryOptions.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </label>
          <Field
            label="Tags"
            value={draft.tags}
            onChange={(value) => updateDraft({ tags: value })}
          />
          <TextArea
            label="Content"
            value={draft.content}
            onChange={(value) => updateDraft({ content: value })}
          />
          <Field
            label="SEO Title"
            value={draft.seoTitle}
            onChange={(value) => updateDraft({ seoTitle: value })}
          />
          <TextArea
            label="SEO Description"
            value={draft.seoDescription}
            onChange={(value) => updateDraft({ seoDescription: value })}
          />
        </div>
        <div className="flex flex-col gap-3 border-t border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-slate-500">
            Manual posts can be edited after creation. Imported URL posts are managed separately as references.
          </p>
          <div className="flex flex-wrap gap-2">
            <AdminButton onClick={() => setFeedback("draft")}>
              <Check className="size-4" />
              Save Draft
            </AdminButton>
            <AdminButton onClick={() => setFeedback("published")} variant="primary">
              <Send className="size-4" />
              Publish
            </AdminButton>
          </div>
        </div>
      </section>

      {feedback ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-950">
              {feedback === "draft" ? "Draft Saved" : "Post Published"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {feedback === "draft"
                ? "This mock post has been saved as a draft."
                : "This mock post has been published."}
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <AdminButton onClick={() => setFeedback(null)}>OK</AdminButton>
              <AdminButton onClick={() => router.push("/content/blog")} variant="primary">
                Back to Blog
              </AdminButton>
            </div>
          </div>
        </div>
      ) : null}
    </DashboardLayout>
  )
}

function Field({
  label,
  onChange,
  value,
}: {
  label: string
  onChange: (value: string) => void
  value: string
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <input
        className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-950 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

function TextArea({
  label,
  onChange,
  value,
}: {
  label: string
  onChange: (value: string) => void
  value: string
}) {
  return (
    <label className="block md:col-span-2">
      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <textarea
        className="mt-2 min-h-36 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm font-medium text-slate-950 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}
