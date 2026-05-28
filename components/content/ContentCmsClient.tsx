"use client"

import { useMemo, useState } from "react"
import {
  Copy,
  Edit3,
  Eye,
  Image as ImageIcon,
  Plus,
  Search,
  Upload,
} from "lucide-react"

import AdminButton from "@/components/admin/AdminButton"
import PageHeader from "@/components/admin/PageHeader"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { cn } from "@/lib/utils"

type ContentSection =
  | "landing-pages"
  | "blog"
  | "guides-faq"
  | "popups-banners"
  | "seo"
  | "media-library"
  | "navigation"

type LandingBlock = {
  description: string
  fields: string[]
  name: string
  status: "Ready" | "Needs Review"
}

type LandingPageRow = {
  actions: string
  locale: string
  name: string
  status: "Published" | "Draft" | "Scheduled"
  updatedDate: string
}

type BlogPost = {
  author: string
  category: string
  mode: "Manual Write" | "Import From URL"
  status: "Draft" | "Published" | "Review"
  title: string
  updatedDate: string
}

type MediaAsset = {
  name: string
  size: string
  tags: string[]
  type: "Image" | "Video" | "Thumbnail"
  updatedDate: string
  url: string
}

const landingPages: LandingPageRow[] = [
  {
    actions: "Edit / Preview",
    locale: "en-US",
    name: "Homepage",
    status: "Published",
    updatedDate: "May 28, 2026",
  },
  {
    actions: "Edit / Preview",
    locale: "ko-KR",
    name: "Pricing",
    status: "Published",
    updatedDate: "May 27, 2026",
  },
  {
    actions: "Edit / Preview",
    locale: "en-US",
    name: "VPICK Landing",
    status: "Draft",
    updatedDate: "May 25, 2026",
  },
  {
    actions: "Edit / Preview",
    locale: "ko-KR",
    name: "Campaign Landing",
    status: "Scheduled",
    updatedDate: "Jun 01, 2026",
  },
]

const landingBlocks: LandingBlock[] = [
  {
    description: "Main headline, subcopy, primary CTA, and hero media.",
    fields: ["Title", "Description", "Button text", "Hero image"],
    name: "Hero",
    status: "Ready",
  },
  {
    description: "Feature cards used for conversion-focused product messaging.",
    fields: ["Card title", "Card description", "Icon", "Link"],
    name: "Features",
    status: "Ready",
  },
  {
    description: "Step-based flow for user education and onboarding.",
    fields: ["Step title", "Step copy", "Video", "Image"],
    name: "Workflow",
    status: "Needs Review",
  },
  {
    description: "Customer proof, creator quotes, and brand trust content.",
    fields: ["Quote", "Name", "Company", "Avatar"],
    name: "Testimonials",
    status: "Ready",
  },
  {
    description: "Plan messaging, pricing CTA, and conversion copy.",
    fields: ["Plan headline", "Description", "CTA", "Footnote"],
    name: "Pricing",
    status: "Ready",
  },
  {
    description: "Common objections and support answers.",
    fields: ["Question", "Answer", "Visibility"],
    name: "FAQ",
    status: "Ready",
  },
  {
    description: "Final conversion section before footer.",
    fields: ["Title", "Description", "Button text"],
    name: "CTA",
    status: "Needs Review",
  },
  {
    description: "Footer text, legal links, and social links.",
    fields: ["Link label", "URL", "Social channel"],
    name: "Footer",
    status: "Ready",
  },
]

const blogCategories = [
  { name: "AI Content", order: 1, status: "Visible" },
  { name: "Video Editing", order: 2, status: "Visible" },
  { name: "Product Updates", order: 3, status: "Visible" },
  { name: "Social Media", order: 4, status: "Hidden" },
]

const blogPosts: BlogPost[] = [
  {
    author: "Sarah Mitchell",
    category: "AI Content",
    mode: "Manual Write",
    status: "Draft",
    title: "How AI Video Workflows Reduce Editing Time",
    updatedDate: "May 28, 2026",
  },
  {
    author: "Growth Team",
    category: "Product Updates",
    mode: "Import From URL",
    status: "Review",
    title: "VPICK Shortform Workflow Update",
    updatedDate: "May 27, 2026",
  },
  {
    author: "Content Ops",
    category: "Video Editing",
    mode: "Manual Write",
    status: "Published",
    title: "Thumbnail Patterns That Improve Click-Through",
    updatedDate: "May 20, 2026",
  },
]

const mediaAssets: MediaAsset[] = [
  {
    name: "homepage-hero-v2.png",
    size: "1.8 MB",
    tags: ["landing", "hero"],
    type: "Image",
    updatedDate: "May 28, 2026",
    url: "https://cdn.yettey.com/homepage-hero-v2.png",
  },
  {
    name: "vpick-shortform-demo.mp4",
    size: "42 MB",
    tags: ["video", "vpick"],
    type: "Video",
    updatedDate: "May 26, 2026",
    url: "https://cdn.yettey.com/vpick-shortform-demo.mp4",
  },
  {
    name: "blog-thumbnail-ai-workflow.jpg",
    size: "820 KB",
    tags: ["blog", "thumbnail"],
    type: "Thumbnail",
    updatedDate: "May 24, 2026",
    url: "https://cdn.yettey.com/blog-thumbnail-ai-workflow.jpg",
  },
]

const pageCopy: Record<
  ContentSection,
  { action: string; description: string; title: string }
> = {
  blog: {
    action: "New Post",
    description:
      "Draft, import, review, and publish blog content for education, growth campaigns, and product updates.",
    title: "Blog CMS",
  },
  "guides-faq": {
    action: "New Guide",
    description:
      "Maintain support guides, frequently asked questions, onboarding docs, and help content.",
    title: "Guides & FAQ",
  },
  "landing-pages": {
    action: "New Landing Page",
    description:
      "Manage marketing landing pages with block-based content editing, localization, and publishing state.",
    title: "Landing Pages",
  },
  "media-library": {
    action: "Upload Asset",
    description:
      "Organize reusable images, videos, thumbnails, blog media, and campaign assets in one shared library.",
    title: "Media Library",
  },
  navigation: {
    action: "Add Menu Item",
    description:
      "Manage top navigation labels, dropdown descriptions, visibility, order, and marketing links.",
    title: "Navigation",
  },
  "popups-banners": {
    action: "New Banner",
    description:
      "Schedule event banners, maintenance notices, promotional popups, and campaign announcements.",
    title: "Popups & Banners",
  },
  seo: {
    action: "Update SEO",
    description:
      "Manage meta titles, descriptions, OG images, sitemap controls, robots settings, and SEO previews.",
    title: "SEO",
  },
}

export default function ContentCmsClient({ section }: { section: ContentSection }) {
  const copy = pageCopy[section]

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Content Operations"
        title={copy.title}
        description={copy.description}
        actions={
          <AdminButton variant="primary">
            <Plus className="size-4" />
            {copy.action}
          </AdminButton>
        }
      />

      <ContentSummary section={section} />

      <div className="mt-8">
        {section === "landing-pages" ? <LandingPagesFoundation /> : null}
        {section === "blog" ? <BlogFoundation /> : null}
        {section === "guides-faq" ? <GuidesFaqFoundation /> : null}
        {section === "popups-banners" ? <PopupsBannersFoundation /> : null}
        {section === "seo" ? <SeoFoundation /> : null}
        {section === "media-library" ? <MediaLibraryFoundation /> : null}
        {section === "navigation" ? <NavigationFoundation /> : null}
      </div>
    </DashboardLayout>
  )
}

function ContentSummary({ section }: { section: ContentSection }) {
  const metrics = useMemo(() => {
    if (section === "landing-pages") {
      return [
        { detail: "3 published, 1 draft", label: "Pages", value: "4" },
        { detail: "Hero, FAQ, CTA pending", label: "Blocks", value: "28" },
        { detail: "Korean and English", label: "Locales", value: "2" },
      ]
    }

    if (section === "blog") {
      return [
        { detail: "1 draft, 1 review", label: "Posts", value: "3" },
        { detail: "1 hidden category", label: "Categories", value: "4" },
        { detail: "URL import enabled", label: "Import", value: "Ready" },
      ]
    }

    if (section === "media-library") {
      return [
        { detail: "Images, videos, thumbnails", label: "Assets", value: "3" },
        { detail: "Mock CDN paths", label: "Storage", value: "44.6 MB" },
        { detail: "Copy URL supported", label: "Actions", value: "4" },
      ]
    }

    return [
      { detail: "Mock foundation", label: "Status", value: "Ready" },
      { detail: "No API connected", label: "Records", value: "Mock" },
      { detail: "Content ops first pass", label: "Updated", value: "Today" },
    ]
  }, [section])

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]"
        >
          <p className="text-sm font-semibold text-slate-500">{metric.label}</p>
          <p className="mt-3 text-2xl font-bold text-slate-950">{metric.value}</p>
          <p className="mt-2 text-sm font-medium text-slate-500">{metric.detail}</p>
        </div>
      ))}
    </div>
  )
}

function LandingPagesFoundation() {
  const [selectedBlock, setSelectedBlock] = useState(landingBlocks[0])

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
        <SectionHeader
          description="Marketing pages marketers can edit without code."
          title="Landing Page List"
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-4">Page Name</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Updated Date</th>
                <th className="px-6 py-4">Locale</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {landingPages.map((page) => (
                <tr key={page.name} className="transition hover:bg-slate-50">
                  <td className="px-6 py-5 text-sm font-bold text-slate-950">
                    {page.name}
                  </td>
                  <td className="px-6 py-5">
                    <StatusPill status={page.status} />
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-600">
                    {page.updatedDate}
                  </td>
                  <td className="px-6 py-5 text-sm font-semibold text-slate-700">
                    {page.locale}
                  </td>
                  <td className="px-6 py-5 text-sm font-bold text-violet-600">
                    {page.actions}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
        <SectionHeader
          description="Block-based editor foundation. No raw HTML required."
          title="Landing Page Editor"
        />
        <div className="grid gap-0 border-t border-slate-100 lg:grid-cols-[220px_1fr]">
          <div className="border-b border-slate-100 p-4 lg:border-b-0 lg:border-r">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
              Section Structure
            </p>
            <div className="space-y-1">
              {landingBlocks.map((block) => (
                <button
                  key={block.name}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-semibold transition",
                    selectedBlock.name === block.name
                      ? "bg-violet-50 text-violet-700 ring-1 ring-violet-100"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                  )}
                  onClick={() => setSelectedBlock(block)}
                  type="button"
                >
                  {block.name}
                  <span className="text-xs text-slate-400">{block.fields.length}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-950">
                  {selectedBlock.name}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedBlock.description}
                </p>
              </div>
              <StatusPill status={selectedBlock.status} />
            </div>
            <div className="mt-5 space-y-4">
              {selectedBlock.fields.map((field) => (
                <label key={field} className="block">
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    {field}
                  </span>
                  <input
                    className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-950 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
                    defaultValue={`${selectedBlock.name} ${field}`}
                  />
                </label>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <AdminButton variant="primary">
                <Edit3 className="size-4" />
                Save Draft
              </AdminButton>
              <AdminButton>
                <Eye className="size-4" />
                Preview
              </AdminButton>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function BlogFoundation() {
  const [mode, setMode] = useState<"manual" | "import">("manual")
  const [importUrl, setImportUrl] = useState("")
  const hasImportDraft = importUrl.trim().length > 0

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-950">Post Creation</h2>
            <p className="mt-1 text-sm text-slate-500">
              Create manually or import a draft from external article URLs.
            </p>
          </div>
          <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
            <ModeButton active={mode === "manual"} onClick={() => setMode("manual")}>
              Manual Write
            </ModeButton>
            <ModeButton active={mode === "import"} onClick={() => setMode("import")}>
              Import From URL
            </ModeButton>
          </div>
        </div>
        {mode === "manual" ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <ContentInput label="Post Title" value="New product workflow announcement" />
            <ContentInput label="Tags" value="product, ai-workflow, update" />
            <ContentTextArea label="Draft Body" value="Start writing the article draft..." />
            <ContentInput label="SEO Title" value="AI workflow update for creators" />
          </div>
        ) : (
          <div className="mt-6 grid gap-4 xl:grid-cols-[1fr_0.8fr]">
            <div>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  External Article URL
                </span>
                <div className="mt-2 flex gap-2">
                  <input
                    className="h-11 min-w-0 flex-1 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-950 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
                    placeholder="Paste Naver Blog, Tistory, Medium, Brunch, or external URL"
                    value={importUrl}
                    onChange={(event) => setImportUrl(event.target.value)}
                  />
                  <AdminButton variant="primary">Generate Draft</AdminButton>
                </div>
              </label>
              <p className="mt-3 text-sm text-slate-500">
                Flow: Import URL - Generate Draft - Edit - Publish.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Generated Draft Preview
              </p>
              <h3 className="mt-3 text-base font-bold text-slate-950">
                {hasImportDraft ? "Imported article draft" : "Waiting for URL"}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {hasImportDraft
                  ? "Title, content, images, and SEO fields will be extracted into an editable draft."
                  : "Paste a URL to simulate title, content, image extraction, and draft generation."}
              </p>
            </div>
          </div>
        )}
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
        <CategoryManager />
        <PostTable />
      </div>
    </div>
  )
}

function CategoryManager() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
      <SectionTitle title="Blog Categories" description="Edit names, order, and visibility." />
      <div className="mt-5 space-y-3">
        {blogCategories.map((category) => (
          <div
            key={category.name}
            className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4"
          >
            <div>
              <p className="text-sm font-bold text-slate-950">{category.name}</p>
              <p className="text-xs font-semibold text-slate-500">
                Order {category.order}
              </p>
            </div>
            <StatusPill status={category.status} />
          </div>
        ))}
      </div>
    </section>
  )
}

function PostTable() {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
      <SectionHeader description="Draft, publish, and review blog content." title="Blog Posts" />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Mode</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {blogPosts.map((post) => (
              <tr key={post.title} className="transition hover:bg-slate-50">
                <td className="px-6 py-5">
                  <p className="text-sm font-bold text-slate-950">{post.title}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    {post.author}
                  </p>
                </td>
                <td className="px-6 py-5 text-sm text-slate-600">{post.category}</td>
                <td className="px-6 py-5 text-sm text-slate-600">{post.mode}</td>
                <td className="px-6 py-5">
                  <StatusPill status={post.status} />
                </td>
                <td className="px-6 py-5 text-sm text-slate-600">{post.updatedDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function GuidesFaqFoundation() {
  const rows = [
    ["Getting Started", "Guide", "Published", "May 27, 2026"],
    ["Credit usage FAQ", "FAQ", "Draft", "May 25, 2026"],
    ["VPICK upload troubleshooting", "Guide", "Review", "May 22, 2026"],
  ]

  return (
    <FoundationTable
      description="Organize help content for onboarding and support."
      headers={["Title", "Type", "Status", "Updated"]}
      rows={rows}
      title="Guide Library"
    />
  )
}

function PopupsBannersFoundation() {
  const rows = [
    ["Summer launch banner", "Homepage", "Jun 01 - Jun 14", "High", "Active"],
    ["Maintenance notice", "App dashboard", "May 30 - May 31", "High", "Inactive"],
    ["VPICK promo popup", "Pricing", "Jun 03 - Jun 20", "Medium", "Scheduled"],
  ]

  return (
    <FoundationTable
      description="Schedule promotions, maintenance notices, and campaign popups."
      headers={["Name", "Location", "Date Range", "Priority", "Status"]}
      rows={rows}
      title="Popup & Banner Operations"
    />
  )
}

function SeoFoundation() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
        <SectionTitle title="SEO Metadata" description="Edit page-level metadata and OG assets." />
        <div className="mt-5 grid gap-4">
          <ContentInput label="Meta Title" value="Yettey - AI media workflow platform" />
          <ContentTextArea
            label="Meta Description"
            value="Create, manage, and publish AI-powered media workflows for modern teams."
          />
          <ContentInput label="OG Image" value="https://cdn.yettey.com/og/homepage.png" />
          <ContentInput label="Canonical URL" value="https://yettey.com" />
        </div>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
        <SectionTitle title="SEO Preview" description="Search and social preview foundation." />
        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-bold text-blue-700">Yettey - AI media workflow platform</p>
          <p className="mt-1 text-xs text-emerald-700">https://yettey.com</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Create, manage, and publish AI-powered media workflows for modern teams.
          </p>
        </div>
        <div className="mt-5 grid gap-3">
          <ToggleRow label="Sitemap enabled" value="Enabled" />
          <ToggleRow label="Robots indexing" value="Allowed" />
          <ToggleRow label="OG image validation" value="Ready" />
        </div>
      </section>
    </div>
  )
}

function MediaLibraryFoundation() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <SectionTitle title="Shared Assets" description="Search, tag, preview, copy URL, or replace assets." />
        <div className="flex flex-wrap gap-2">
          <AdminButton>
            <Search className="size-4" />
            Filter
          </AdminButton>
          <AdminButton variant="primary">
            <Upload className="size-4" />
            Upload
          </AdminButton>
        </div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {mediaAssets.map((asset) => (
          <div key={asset.name} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex h-32 items-center justify-center rounded-xl bg-white ring-1 ring-slate-100">
              <ImageIcon className="size-8 text-violet-600" />
            </div>
            <p className="mt-4 text-sm font-bold text-slate-950">{asset.name}</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">
              {asset.type} / {asset.size} / {asset.updatedDate}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {asset.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-white px-2 py-1 text-xs font-bold text-slate-500 ring-1 ring-slate-200">
                  {tag}
                </span>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <AdminButton className="h-9 px-3">
                <Copy className="size-4" />
                Copy URL
              </AdminButton>
              <AdminButton className="h-9 px-3">Replace</AdminButton>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function NavigationFoundation() {
  const rows = [
    ["Manage Assets", "Digital asset workflow", "1", "Visible"],
    ["Create with AI", "AI generation entry", "2", "Visible"],
    ["Create Short Clips", "VPICK shortform landing", "3", "Visible"],
    ["For Creators", "Creator use cases", "4", "Visible"],
    ["For Marketers", "Marketing team use cases", "5", "Hidden"],
    ["Blog", "Editorial content", "6", "Visible"],
    ["Guides", "Help and education", "7", "Visible"],
    ["Help Center", "Support destination", "8", "Visible"],
  ]

  return (
    <FoundationTable
      description="Change menu labels, descriptions, order, icons, and visibility."
      headers={["Menu Name", "Description", "Order", "Visibility"]}
      rows={rows}
      title="Top Navigation Menu"
    />
  )
}

function FoundationTable({
  description,
  headers,
  rows,
  title,
}: {
  description: string
  headers: string[]
  rows: string[][]
  title: string
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
      <SectionHeader description={description} title={title} />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px]">
          <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
            <tr>
              {headers.map((header) => (
                <th key={header} className="px-6 py-4">{header}</th>
              ))}
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.join("-")} className="transition hover:bg-slate-50">
                {row.map((cell, index) => (
                  <td
                    key={`${cell}-${index}`}
                    className={cn(
                      "px-6 py-5 text-sm text-slate-600",
                      index === 0 && "font-bold text-slate-950"
                    )}
                  >
                    {cell}
                  </td>
                ))}
                <td className="px-6 py-5 text-sm font-bold text-violet-600">
                  Edit
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function SectionHeader({ description, title }: { description: string; title: string }) {
  return (
    <div className="border-b border-slate-100 p-6">
      <SectionTitle description={description} title={title} />
    </div>
  )
}

function SectionTitle({ description, title }: { description: string; title: string }) {
  return (
    <div>
      <h2 className="text-lg font-bold text-slate-950">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  )
}

function ModeButton({
  active,
  children,
  onClick,
}: {
  active: boolean
  children: React.ReactNode
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
      {children}
    </button>
  )
}

function ContentInput({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <input
        className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-950 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
        defaultValue={value}
      />
    </label>
  )
}

function ContentTextArea({ label, value }: { label: string; value: string }) {
  return (
    <label className="block md:col-span-2">
      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <textarea
        className="mt-2 min-h-28 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm font-medium text-slate-950 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
        defaultValue={value}
      />
    </label>
  )
}

function ToggleRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <StatusPill status={value} />
    </div>
  )
}

function StatusPill({ status }: { status: string }) {
  const tone =
    status === "Published" || status === "Ready" || status === "Visible" || status === "Enabled" || status === "Allowed" || status === "Active"
      ? "bg-emerald-50 text-emerald-600 ring-emerald-100"
      : status === "Draft" || status === "Review" || status === "Scheduled"
        ? "bg-violet-50 text-violet-600 ring-violet-100"
        : status === "Needs Review"
          ? "bg-orange-50 text-orange-600 ring-orange-100"
          : "bg-slate-100 text-slate-600 ring-slate-200"

  return (
    <span className={cn("inline-flex h-6 items-center rounded-full px-2.5 text-xs font-bold ring-1", tone)}>
      {status}
    </span>
  )
}
