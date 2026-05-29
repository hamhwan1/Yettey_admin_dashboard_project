"use client"

import type { DragEvent, ReactNode } from "react"
import { useEffect, useRef, useState } from "react"
import {
  ArrowLeft,
  Bold,
  Check,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Send,
  Strikethrough,
  Trash2,
  Underline,
  Unlink,
  Upload,
  Video,
} from "lucide-react"
import { useRouter } from "next/navigation"

import AdminButton from "@/components/admin/AdminButton"
import PageHeader from "@/components/admin/PageHeader"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { cn } from "@/lib/utils"

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

type MediaDialogMode = "image-url" | "video-url" | "youtube" | null

const starterContent = `
  <h2>Start writing your article</h2>
  <p>Use the toolbar to format text, add lists, insert media, and structure a complete blog post.</p>
  <blockquote>Tip: drag an image into the editor or use the image tools in the toolbar.</blockquote>
`

export default function BlogCreateClient() {
  const router = useRouter()
  const editorRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [draft, setDraft] = useState<BlogDraft>({
    category: categoryOptions[0],
    content: starterContent,
    seoDescription: "",
    seoTitle: "",
    tags: "",
    thumbnail: "",
    title: "",
  })
  const [feedback, setFeedback] = useState<"deleted" | "draft" | "published" | null>(null)
  const [mediaDialog, setMediaDialog] = useState<MediaDialogMode>(null)
  const [mediaUrl, setMediaUrl] = useState("")
  const [autoSaveState, setAutoSaveState] = useState("Draft autosaved just now")

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML.trim() === "") {
      editorRef.current.innerHTML = draft.content
    }
  }, [draft.content])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setAutoSaveState("Draft autosaved just now")
    }, 700)

    return () => window.clearTimeout(timeout)
  }, [draft])

  const updateDraft = (patch: Partial<BlogDraft>) => {
    setAutoSaveState("Autosaving...")
    setDraft((current) => ({ ...current, ...patch }))
  }

  const syncEditorContent = () => {
    updateDraft({ content: editorRef.current?.innerHTML ?? "" })
  }

  const focusEditor = () => {
    editorRef.current?.focus()
  }

  const runCommand = (command: string, value?: string) => {
    focusEditor()
    document.execCommand(command, false, value)
    syncEditorContent()
  }

  const applyBlock = (tag: "H1" | "H2" | "H3" | "P") => {
    runCommand("formatBlock", tag)
  }

  const insertHtml = (html: string) => {
    focusEditor()
    document.execCommand("insertHTML", false, html)
    syncEditorContent()
  }

  const insertDivider = () => {
    insertHtml('<hr class="my-6 border-slate-200" /><p><br /></p>')
  }

  const insertQuote = () => {
    applyBlock("P")
    insertHtml(
      '<blockquote class="my-4 border-l-4 border-violet-500 bg-violet-50 px-4 py-3 text-slate-700">Quote block</blockquote><p><br /></p>'
    )
  }

  const insertLink = () => {
    const url = window.prompt("Enter link URL")

    if (!url) return

    runCommand("createLink", url)
  }

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith("image/")) return

    const reader = new FileReader()
    reader.onload = () => {
      const src = String(reader.result)
      insertHtml(
        `<figure class="my-6"><img src="${src}" alt="${file.name}" class="max-h-[520px] w-full rounded-2xl border border-slate-200 object-cover" /><figcaption class="mt-2 text-center text-xs text-slate-500">${file.name}</figcaption></figure><p><br /></p>`
      )
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    const files = Array.from(event.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    )

    if (!files.length) return

    event.preventDefault()
    files.forEach(handleFileUpload)
  }

  const handleMediaInsert = () => {
    const trimmedUrl = mediaUrl.trim()

    if (!trimmedUrl || !mediaDialog) return

    if (mediaDialog === "image-url") {
      insertHtml(
        `<figure class="my-6"><img src="${trimmedUrl}" alt="Inserted blog image" class="max-h-[520px] w-full rounded-2xl border border-slate-200 object-cover" /><figcaption class="mt-2 text-center text-xs text-slate-500">${trimmedUrl}</figcaption></figure><p><br /></p>`
      )
    }

    if (mediaDialog === "youtube") {
      const embedUrl = toYoutubeEmbedUrl(trimmedUrl)
      insertHtml(
        `<div class="my-6 aspect-video overflow-hidden rounded-2xl border border-slate-200 bg-slate-950"><iframe src="${embedUrl}" title="YouTube video" class="h-full w-full" allowfullscreen></iframe></div><p><br /></p>`
      )
    }

    if (mediaDialog === "video-url") {
      insertHtml(
        `<video controls src="${trimmedUrl}" class="my-6 max-h-[520px] w-full rounded-2xl border border-slate-200 bg-slate-950"></video><p><br /></p>`
      )
    }

    setMediaUrl("")
    setMediaDialog(null)
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
        description="Write and format a first-party blog article with rich text, images, embeds, SEO metadata, and publishing controls."
        actions={
          <AdminButton onClick={() => router.push("/content/blog")}>
            <ArrowLeft className="size-4" />
            Back to Blog
          </AdminButton>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
          <div className="border-b border-slate-100 p-6">
            <div className="grid gap-5 md:grid-cols-2">
              <Field
                label="Title"
                placeholder="Write a strong blog title..."
                value={draft.title}
                onChange={(value) => updateDraft({ title: value })}
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
                label="Thumbnail"
                placeholder="Paste thumbnail URL..."
                value={draft.thumbnail}
                onChange={(value) => updateDraft({ thumbnail: value })}
              />
              <Field
                label="Tags"
                placeholder="ai, workflow, content"
                value={draft.tags}
                onChange={(value) => updateDraft({ tags: value })}
              />
            </div>
          </div>

          <div className="sticky top-[73px] z-10 border-b border-slate-100 bg-white/95 p-4 backdrop-blur">
            <div className="flex flex-wrap items-center gap-2">
              <ToolbarButton label="Bold" onClick={() => runCommand("bold")}>
                <Bold className="size-4" />
              </ToolbarButton>
              <ToolbarButton label="Italic" onClick={() => runCommand("italic")}>
                <Italic className="size-4" />
              </ToolbarButton>
              <ToolbarButton label="Underline" onClick={() => runCommand("underline")}>
                <Underline className="size-4" />
              </ToolbarButton>
              <ToolbarButton label="Strikethrough" onClick={() => runCommand("strikeThrough")}>
                <Strikethrough className="size-4" />
              </ToolbarButton>
              <ToolbarDivider />
              <ToolbarTextButton label="H1" onClick={() => applyBlock("H1")} />
              <ToolbarTextButton label="H2" onClick={() => applyBlock("H2")} />
              <ToolbarTextButton label="H3" onClick={() => applyBlock("H3")} />
              <ToolbarTextButton label="Normal" onClick={() => applyBlock("P")} />
              <ToolbarDivider />
              <ToolbarButton label="Quote block" onClick={insertQuote}>
                <Quote className="size-4" />
              </ToolbarButton>
              <ToolbarButton label="Divider" onClick={insertDivider}>
                <Minus className="size-4" />
              </ToolbarButton>
              <ToolbarButton label="Unordered list" onClick={() => runCommand("insertUnorderedList")}>
                <List className="size-4" />
              </ToolbarButton>
              <ToolbarButton label="Ordered list" onClick={() => runCommand("insertOrderedList")}>
                <ListOrdered className="size-4" />
              </ToolbarButton>
              <ToolbarDivider />
              <ToolbarButton label="Insert or edit link" onClick={insertLink}>
                <Link2 className="size-4" />
              </ToolbarButton>
              <ToolbarButton label="Remove link" onClick={() => runCommand("unlink")}>
                <Unlink className="size-4" />
              </ToolbarButton>
              <ToolbarDivider />
              <ToolbarButton label="Upload image" onClick={() => fileInputRef.current?.click()}>
                <Upload className="size-4" />
              </ToolbarButton>
              <ToolbarButton label="Insert image URL" onClick={() => setMediaDialog("image-url")}>
                <ImagePlus className="size-4" />
              </ToolbarButton>
              <ToolbarButton label="Insert YouTube" onClick={() => setMediaDialog("youtube")}>
                <Video className="size-4" />
              </ToolbarButton>
              <ToolbarButton label="Insert video URL" onClick={() => setMediaDialog("video-url")}>
                <Video className="size-4" />
              </ToolbarButton>
              <input
                ref={fileInputRef}
                className="hidden"
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) handleFileUpload(file)
                  event.target.value = ""
                }}
              />
            </div>
          </div>

          <div className="p-6">
            <div
              ref={editorRef}
              className={cn(
                "prose prose-slate min-h-[560px] max-w-none rounded-2xl border border-slate-200 bg-white px-8 py-7 text-slate-800 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10",
                "prose-headings:text-slate-950 prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-a:text-violet-600 prose-blockquote:border-violet-500 prose-blockquote:bg-violet-50 prose-blockquote:px-4 prose-blockquote:py-3 prose-blockquote:not-italic"
              )}
              contentEditable
              onDrop={handleDrop}
              onInput={syncEditorContent}
              suppressContentEditableWarning
            />
            <p className="mt-3 text-xs font-semibold text-slate-400">
              Drag and drop images into the editor. Formatting and media are stored in mock HTML state.
            </p>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
            <h2 className="text-lg font-bold text-slate-950">Publishing</h2>
            <p className="mt-2 text-sm font-semibold text-emerald-600">
              {autoSaveState}
            </p>
            <div className="mt-5 grid gap-2">
              <AdminButton onClick={() => setFeedback("draft")}>
                <Check className="size-4" />
                Save Draft
              </AdminButton>
              <AdminButton onClick={() => setFeedback("published")} variant="primary">
                <Send className="size-4" />
                Publish
              </AdminButton>
              <AdminButton
                className="border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50"
                onClick={() => setFeedback("deleted")}
              >
                <Trash2 className="size-4" />
                Delete
              </AdminButton>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
            <h2 className="text-lg font-bold text-slate-950">SEO</h2>
            <div className="mt-5 grid gap-4">
              <Field
                label="SEO Title"
                placeholder="Search-friendly title..."
                value={draft.seoTitle}
                onChange={(value) => updateDraft({ seoTitle: value })}
              />
              <TextArea
                label="SEO Description"
                placeholder="Short search snippet..."
                value={draft.seoDescription}
                onChange={(value) => updateDraft({ seoDescription: value })}
              />
            </div>
          </section>
        </aside>
      </div>

      {mediaDialog ? (
        <MediaInsertDialog
          mode={mediaDialog}
          onCancel={() => {
            setMediaDialog(null)
            setMediaUrl("")
          }}
          onChange={setMediaUrl}
          onInsert={handleMediaInsert}
          value={mediaUrl}
        />
      ) : null}

      {feedback ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-950">
              {feedback === "draft"
                ? "Draft Saved"
                : feedback === "published"
                  ? "Post Published"
                  : "Post Deleted"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {feedback === "draft"
                ? "This mock post has been saved as a draft."
                : feedback === "published"
                  ? "This mock post has been published."
                  : "This mock post has been deleted."}
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

function ToolbarButton({
  children,
  label,
  onClick,
}: {
  children: ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button
      aria-label={label}
      className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      title={label}
      type="button"
    >
      {children}
    </button>
  )
}

function ToolbarTextButton({
  label,
  onClick,
}: {
  label: string
  onClick: () => void
}) {
  return (
    <button
      className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 shadow-sm transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  )
}

function ToolbarDivider() {
  return <span className="mx-1 h-6 w-px bg-slate-200" />
}

function MediaInsertDialog({
  mode,
  onCancel,
  onChange,
  onInsert,
  value,
}: {
  mode: Exclude<MediaDialogMode, null>
  onCancel: () => void
  onChange: (value: string) => void
  onInsert: () => void
  value: string
}) {
  const title =
    mode === "image-url"
      ? "Insert Image URL"
      : mode === "youtube"
        ? "Insert YouTube Embed"
        : "Insert Video URL"
  const placeholder =
    mode === "image-url"
      ? "https://cdn.example.com/image.jpg"
      : mode === "youtube"
        ? "https://www.youtube.com/watch?v=..."
        : "https://cdn.example.com/video.mp4"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <h2 className="text-lg font-bold text-slate-950">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Paste a URL to insert the media block directly into the blog editor.
        </p>
        <div className="mt-5">
          <Field label="Media URL" placeholder={placeholder} value={value} onChange={onChange} />
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <AdminButton onClick={onCancel}>Cancel</AdminButton>
          <AdminButton disabled={!value.trim()} onClick={onInsert} variant="primary">
            Insert
          </AdminButton>
        </div>
      </div>
    </div>
  )
}

function toYoutubeEmbedUrl(url: string) {
  try {
    const parsed = new URL(url)
    const videoId =
      parsed.hostname.includes("youtu.be")
        ? parsed.pathname.replace("/", "")
        : parsed.searchParams.get("v")

    return videoId ? `https://www.youtube.com/embed/${videoId}` : url
  } catch {
    return url
  }
}

function Field({
  label,
  onChange,
  placeholder,
  value,
}: {
  label: string
  onChange: (value: string) => void
  placeholder?: string
  value: string
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <input
        className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-950 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

function TextArea({
  label,
  onChange,
  placeholder,
  value,
}: {
  label: string
  onChange: (value: string) => void
  placeholder?: string
  value: string
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <textarea
        className="mt-2 min-h-32 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm font-medium text-slate-950 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}
