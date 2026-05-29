"use client"

import type { ReactNode } from "react"
import { useMemo, useState } from "react"
import {
  ChevronDown,
  Copy,
  ExternalLink,
  GripVertical,
  Image as ImageIcon,
  Plus,
  Search,
  Trash2,
  Upload,
} from "lucide-react"
import { useRouter } from "next/navigation"

import AdminButton from "@/components/admin/AdminButton"
import PageHeader from "@/components/admin/PageHeader"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { getPrimarySeo, landingPages } from "@/components/content/landingPageMock"
import { cn } from "@/lib/utils"

type ContentSection =
  | "landing-pages"
  | "blog"
  | "guides-faq"
  | "popups-banners"
  | "seo"
  | "media-library"
  | "navigation"

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

type NavigationVisibility = "Hidden" | "Visible"

type NavigationChild = {
  description: string
  icon: string
  id: string
  name: string
  sortOrder: number
  url: string
  visibility: NavigationVisibility
}

type NavigationGroup = NavigationChild & {
  children: NavigationChild[]
}

type NavigationMenuForm = {
  description: string
  icon: string
  name: string
  parentId: string
  url: string
  visibility: NavigationVisibility
}

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

const initialNavigationTree: NavigationGroup[] = [
  {
    children: [
      {
        description: "Digital asset management workspace",
        icon: "folder",
        id: "manage-assets",
        name: "Manage Assets",
        sortOrder: 1,
        url: "/product/manage-assets",
        visibility: "Visible",
      },
      {
        description: "AI generation tools and workflow entry",
        icon: "sparkles",
        id: "create-with-ai",
        name: "Create with AI",
        sortOrder: 2,
        url: "/product/create-with-ai",
        visibility: "Visible",
      },
      {
        description: "VPICK shortform creation workflow",
        icon: "video",
        id: "create-short-clips",
        name: "Create Short Clips",
        sortOrder: 3,
        url: "/product/create-short-clips",
        visibility: "Visible",
      },
      {
        description: "Team collaboration and shared workspace",
        icon: "users",
        id: "work-with-team",
        name: "Work with Team",
        sortOrder: 4,
        url: "/product/team",
        visibility: "Visible",
      },
    ],
    description: "Product capabilities and workflow entry points",
    icon: "box",
    id: "product",
    name: "Product",
    sortOrder: 1,
    url: "/product",
    visibility: "Visible",
  },
  {
    children: [
      {
        description: "Creator-focused use cases and examples",
        icon: "pen-tool",
        id: "for-creators",
        name: "For Creators",
        sortOrder: 1,
        url: "/use-cases/creators",
        visibility: "Visible",
      },
      {
        description: "Marketing campaign and content ops use cases",
        icon: "megaphone",
        id: "for-marketers",
        name: "For Marketers",
        sortOrder: 2,
        url: "/use-cases/marketers",
        visibility: "Hidden",
      },
      {
        description: "Team workflow, approval, and workspace use cases",
        icon: "building",
        id: "for-teams",
        name: "For Teams",
        sortOrder: 3,
        url: "/use-cases/teams",
        visibility: "Visible",
      },
    ],
    description: "Audience-specific landing destinations",
    icon: "target",
    id: "use-cases",
    name: "Use Cases",
    sortOrder: 2,
    url: "/use-cases",
    visibility: "Visible",
  },
  {
    children: [
      {
        description: "Editorial articles and product stories",
        icon: "book-open",
        id: "blog",
        name: "Blog",
        sortOrder: 1,
        url: "/blog",
        visibility: "Visible",
      },
      {
        description: "Educational guides and workflow docs",
        icon: "map",
        id: "guides",
        name: "Guides",
        sortOrder: 2,
        url: "/guides",
        visibility: "Visible",
      },
      {
        description: "Support and help center destination",
        icon: "help-circle",
        id: "help-center",
        name: "Help Center",
        sortOrder: 3,
        url: "/help",
        visibility: "Visible",
      },
    ],
    description: "Content, education, and support links",
    icon: "library",
    id: "resources",
    name: "Resources",
    sortOrder: 3,
    url: "/resources",
    visibility: "Visible",
  },
  {
    children: [],
    description: "Pricing page and plan comparison",
    icon: "credit-card",
    id: "pricing",
    name: "Pricing",
    sortOrder: 4,
    url: "/pricing",
    visibility: "Visible",
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
          section === "landing-pages" ? undefined : (
            <AdminButton variant="primary">
              <Plus className="size-4" />
              {copy.action}
            </AdminButton>
          )
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
        { detail: "2 published, 3 draft or scheduled", label: "Pages", value: "5" },
        { detail: "English and Korean metadata", label: "SEO Locales", value: "2" },
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
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [productFilter, setProductFilter] = useState("All")
  const [statusFilter, setStatusFilter] = useState("All")
  const [localeFilter, setLocaleFilter] = useState("All")
  const filteredPages = landingPages.filter((page) => {
    const seo = getPrimarySeo(page)
    const keyword =
      `${page.name} ${page.url} ${page.product} ${seo.metaTitle} ${seo.metaDescription}`.toLowerCase()
    const matchesQuery = keyword.includes(query.toLowerCase())
    const matchesProduct = productFilter === "All" || page.product === productFilter
    const matchesStatus = statusFilter === "All" || page.status === statusFilter
    const matchesLocale = localeFilter === "All" || page.locale === localeFilter

    return matchesQuery && matchesProduct && matchesStatus && matchesLocale
  })

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
      <div className="border-b border-slate-100 p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-950">Landing Page List</h2>
            <p className="mt-1 text-sm text-slate-500">
              Manage page entities by product, URL, metadata, locale, and publishing state.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                className="h-10 w-full min-w-72 rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm font-semibold text-slate-950 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
                placeholder="Search by page, URL, or metadata..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <select
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-950 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
              value={productFilter}
              onChange={(event) => setProductFilter(event.target.value)}
            >
              <option>All</option>
              <option>YETTEY</option>
              <option>VPICK</option>
              <option>Shared/Common</option>
            </select>
            <select
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-950 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option>All</option>
              <option>Published</option>
              <option>Draft</option>
              <option>Scheduled</option>
            </select>
            <select
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-950 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
              value={localeFilter}
              onChange={(event) => setLocaleFilter(event.target.value)}
            >
              <option>All</option>
              <option>en-US</option>
              <option>ko-KR</option>
            </select>
            <AdminButton variant="primary">
              <Plus className="size-4" />
              Create Landing Page
            </AdminButton>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1260px]">
          <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-6 py-4">Page Name</th>
              <th className="px-6 py-4">URL</th>
              <th className="px-6 py-4">Product</th>
              <th className="px-6 py-4">Meta Title</th>
              <th className="px-6 py-4">Meta Description</th>
              <th className="px-6 py-4">Locale</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Last Updated</th>
              <th className="px-6 py-4">Updated By</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredPages.map((page) => {
              const seo = getPrimarySeo(page)

              return (
              <tr
                key={page.id}
                className="cursor-pointer transition hover:bg-violet-50/60"
                onClick={() => router.push(`/content/landing-pages/${page.id}`)}
              >
                <td className="px-6 py-5 text-sm font-bold text-slate-950">
                  {page.name}
                </td>
                <td className="px-6 py-5 text-sm font-semibold text-violet-600">
                  {page.url}
                </td>
                <td className="px-6 py-5">
                  <ProductPill product={page.product} />
                </td>
                <td className="max-w-60 px-6 py-5 text-sm text-slate-700">
                  {seo.metaTitle}
                </td>
                <td className="max-w-72 px-6 py-5 text-sm leading-6 text-slate-600">
                  {seo.metaDescription}
                </td>
                <td className="px-6 py-5 text-sm font-semibold text-slate-700">
                  {page.locale}
                </td>
                <td className="px-6 py-5">
                  <StatusPill status={page.status} />
                </td>
                <td className="px-6 py-5 text-sm text-slate-600">
                  {page.lastUpdated}
                </td>
                <td className="px-6 py-5 text-sm text-slate-600">
                  {page.updatedBy}
                </td>
                <td className="px-6 py-5">
                  <button
                    className="text-sm font-bold text-violet-600 transition hover:text-violet-700"
                    onClick={(event) => {
                      event.stopPropagation()
                      router.push(`/content/landing-pages/${page.id}`)
                    }}
                    type="button"
                  >
                    Open Detail
                  </button>
                </td>
              </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {filteredPages.length === 0 ? (
        <div className="border-t border-slate-100 p-10 text-center">
          <p className="text-sm font-bold text-slate-950">No landing pages found</p>
          <p className="mt-2 text-sm text-slate-500">
            Try adjusting search, status, or locale filters.
          </p>
        </div>
      ) : null}
    </section>
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
  const [navigationTree, setNavigationTree] = useState(initialNavigationTree)
  const [selectedId, setSelectedId] = useState(initialNavigationTree[0].id)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [saveDialog, setSaveDialog] = useState<"confirm" | "success" | null>(null)
  const [menuDialog, setMenuDialog] = useState<"sub" | "top" | null>(null)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [menuForm, setMenuForm] = useState<NavigationMenuForm>({
    description: "",
    icon: "link",
    name: "",
    parentId: initialNavigationTree[0].id,
    url: "",
    visibility: "Visible",
  })
  const selectedItem = findNavigationItem(navigationTree, selectedId)
  const parentMenu = findParentMenu(navigationTree, selectedId)
  const parentOptions = navigationTree.map((item) => item.name)
  const deleteTarget = deleteTargetId
    ? findNavigationItem(navigationTree, deleteTargetId)
    : null
  const deleteTargetChildren =
    navigationTree.find((group) => group.id === deleteTargetId)?.children.length ??
    0

  const markChanged = (nextTree: NavigationGroup[]) => {
    setNavigationTree(nextTree)
    setHasChanges(true)
  }

  const handleFieldChange = (
    field: keyof NavigationChild,
    value: string | number
  ) => {
    if (field === "sortOrder") {
      markChanged(setNavigationSortOrder(navigationTree, selectedId, Number(value)))
      return
    }

    markChanged(
      updateNavigationItem(navigationTree, selectedId, {
        [field]: value,
      })
    )
  }

  const handleDrop = (targetId: string) => {
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null)
      return
    }

    const nextTree = reorderNavigationItem(navigationTree, draggedId, targetId)

    if (nextTree !== navigationTree) {
      markChanged(nextTree)
    }

    setDraggedId(null)
  }

  const openAddTopMenuDialog = () => {
    setMenuForm({
      description: "",
      icon: "menu",
      name: "",
      parentId: navigationTree[0]?.id ?? "",
      url: "",
      visibility: "Visible",
    })
    setMenuDialog("top")
  }

  const openAddSubMenuDialog = () => {
    const parent = parentMenu ?? navigationTree.find((item) => item.id === selectedId)
    setMenuForm({
      description: "",
      icon: "link",
      name: "",
      parentId: parent?.id ?? navigationTree[0]?.id ?? "",
      url: "",
      visibility: "Visible",
    })
    setMenuDialog("sub")
  }

  const handleCreateMenu = () => {
    const menuName =
      menuForm.name.trim() || (menuDialog === "top" ? "New Top Menu" : "New Sub Menu")
    const menuUrl =
      menuForm.url.trim() ||
      `/${menuName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`

    if (menuDialog === "top") {
      const item: NavigationGroup = {
        children: [],
        description: menuForm.description.trim() || "New top navigation group",
        icon: menuForm.icon.trim() || "menu",
        id: createNavigationId("top-menu"),
        name: menuName,
        sortOrder: navigationTree.length + 1,
        url: menuUrl,
        visibility: menuForm.visibility,
      }

      markChanged([...navigationTree, item])
      setSelectedId(item.id)
      setMenuDialog(null)
      return
    }

    const child: NavigationChild = {
      description: menuForm.description.trim() || "New dropdown menu item",
      icon: menuForm.icon.trim() || "link",
      id: createNavigationId("sub-menu"),
      name: menuName,
      sortOrder:
        (navigationTree.find((group) => group.id === menuForm.parentId)?.children
          .length ?? 0) + 1,
      url: menuUrl,
      visibility: menuForm.visibility,
    }

    markChanged(addNavigationChild(navigationTree, menuForm.parentId, child))
    setSelectedId(child.id)
    setMenuDialog(null)
  }

  const handleParentChange = (parentName: string) => {
    if (!parentMenu) return

    const targetParent = navigationTree.find((item) => item.name === parentName)
    if (!targetParent || targetParent.id === parentMenu.id) return

    markChanged(moveNavigationChild(navigationTree, selectedId, targetParent.id))
  }

  const handleToggleVisibility = (id: string) => {
    const item = findNavigationItem(navigationTree, id)
    if (!item) return

    markChanged(
      updateNavigationItem(navigationTree, id, {
        visibility: item.visibility === "Visible" ? "Hidden" : "Visible",
      })
    )
  }

  const handleDuplicate = (id: string) => {
    const nextTree = duplicateNavigationItem(navigationTree, id)

    if (nextTree.tree === navigationTree) return

    markChanged(nextTree.tree)
    setSelectedId(nextTree.newId)
  }

  const handleDeleteMenu = () => {
    if (!deleteTargetId) return

    const nextTree = deleteNavigationItem(navigationTree, deleteTargetId)
    const deletedParent = findParentMenu(navigationTree, deleteTargetId)
    const deletedGroup = navigationTree.find((group) => group.id === deleteTargetId)
    const selectedWasDeleted =
      selectedId === deleteTargetId ||
      Boolean(deletedGroup?.children.some((child) => child.id === selectedId))

    markChanged(nextTree)

    if (selectedWasDeleted) {
      setSelectedId(deletedParent?.id ?? nextTree[0]?.id ?? "")
    }

    setDeleteTargetId(null)
  }

  const handleOpenPage = () => {
    if (!selectedItem) return

    window.open(selectedItem.url, "_blank", "noopener,noreferrer")
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
        <SectionHeader
          description="Manage top navigation groups, dropdown items, visibility, and order."
          title="Navigation Tree"
        />
        <div className="border-b border-slate-100 p-4">
          <div className="flex flex-wrap gap-2">
            <AdminButton className="h-9 px-3" onClick={openAddTopMenuDialog}>
              <Plus className="size-4" />
              Add Top Menu
            </AdminButton>
            <AdminButton
              className="h-9 px-3"
              disabled={!navigationTree.length}
              onClick={openAddSubMenuDialog}
            >
              <Plus className="size-4" />
              Add Sub Menu
            </AdminButton>
          </div>
        </div>
        <div className="space-y-3 p-4">
          {navigationTree.map((group) => (
            <div
              key={group.id}
              draggable
              onDragStart={() => setDraggedId(group.id)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => handleDrop(group.id)}
            >
              <TreeRow
                active={selectedId === group.id}
                item={group}
                level={1}
                onDelete={() => setDeleteTargetId(group.id)}
                onDuplicate={() => handleDuplicate(group.id)}
                onClick={() => setSelectedId(group.id)}
                onToggleVisibility={() => handleToggleVisibility(group.id)}
              />
              {group.children.length ? (
                <div className="ml-7 mt-2 space-y-1 border-l border-slate-200 pl-3">
                  {group.children.map((child) => (
                    <div
                      key={child.id}
                      draggable
                      onDragStart={() => setDraggedId(child.id)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => handleDrop(child.id)}
                    >
                      <TreeRow
                        active={selectedId === child.id}
                        item={child}
                        level={2}
                        onDelete={() => setDeleteTargetId(child.id)}
                        onDuplicate={() => handleDuplicate(child.id)}
                        onClick={() => setSelectedId(child.id)}
                        onToggleVisibility={() => handleToggleVisibility(child.id)}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="ml-11 mt-2 text-xs font-semibold text-slate-400">
                  No dropdown items
                </p>
              )}
            </div>
          ))}
          {!navigationTree.length ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
              <p className="text-sm font-bold text-slate-950">
                No navigation menus
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Add a top menu to start rebuilding website navigation.
              </p>
            </div>
          ) : null}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
        <SectionHeader
          description="Edit the selected menu item as it appears on the website."
          title="Selected Menu Detail"
        />
        {selectedItem ? (
          <div className="grid gap-5 p-6 md:grid-cols-2">
            <ContentInput
              label="Menu Name"
              value={selectedItem.name}
              onChange={(value) => handleFieldChange("name", value)}
            />
            <ContentInput
              label="URL"
              value={selectedItem.url}
              onChange={(value) => handleFieldChange("url", value)}
            />
            <ContentInput
              label="Icon"
              value={selectedItem.icon}
              onChange={(value) => handleFieldChange("icon", value)}
            />
            <ContentInput
              label="Sort Order"
              type="number"
              value={String(selectedItem.sortOrder)}
              onChange={(value) =>
                handleFieldChange("sortOrder", Number(value) || 1)
              }
            />
            <ContentSelect
              label="Visibility"
              options={["Visible", "Hidden"]}
              value={selectedItem.visibility}
              onChange={(value) =>
                handleFieldChange("visibility", value as NavigationVisibility)
              }
            />
            <ContentSelect
              disabled={!parentMenu}
              label="Parent Menu"
              options={parentOptions}
              value={parentMenu?.name ?? "Top Level"}
              onChange={handleParentChange}
            />
            <ContentTextArea
              label="Description"
              value={selectedItem.description}
              onChange={(value) => handleFieldChange("description", value)}
            />
          </div>
        ) : (
          <div className="p-6">
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
              <p className="text-sm font-bold text-slate-950">
                Select a menu item
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Choose an item from the navigation tree or create a new top menu.
              </p>
            </div>
          </div>
        )}
        <div className="flex flex-col gap-3 border-t border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-slate-950">
              Website navigation hierarchy
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {hasChanges
                ? "Unsaved changes are ready to publish to mock navigation."
                : "Drag top menus or sibling submenu items to adjust visual order."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <AdminButton disabled={!selectedItem} onClick={handleOpenPage}>
              <ExternalLink className="size-4" />
              Open Page
            </AdminButton>
            <AdminButton
              disabled={!selectedItem}
              onClick={() => selectedItem && handleDuplicate(selectedItem.id)}
            >
              <Copy className="size-4" />
              Duplicate
            </AdminButton>
            <AdminButton
              className="border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50"
              disabled={!selectedItem}
              onClick={() => selectedItem && setDeleteTargetId(selectedItem.id)}
            >
              <Trash2 className="size-4" />
              Delete
            </AdminButton>
            <AdminButton
              disabled={!hasChanges}
              onClick={() => setSaveDialog("confirm")}
              variant="primary"
            >
              Save Changes
            </AdminButton>
          </div>
        </div>
      </section>

      {menuDialog ? (
        <NavigationMenuDialog
          form={menuForm}
          mode={menuDialog}
          parentOptions={navigationTree.map((group) => ({
            id: group.id,
            name: group.name,
          }))}
          onCancel={() => setMenuDialog(null)}
          onChange={(patch) => setMenuForm((current) => ({ ...current, ...patch }))}
          onCreate={handleCreateMenu}
        />
      ) : null}

      {saveDialog === "confirm" ? (
        <ContentDialog
          confirmLabel="Save"
          message="Do you want to save these navigation changes?"
          onCancel={() => setSaveDialog(null)}
          onConfirm={() => {
            setHasChanges(false)
            setSaveDialog("success")
          }}
          title="Save Navigation Changes"
        />
      ) : null}

      {saveDialog === "success" ? (
        <ContentDialog
          confirmLabel="OK"
          message="Navigation changes have been saved successfully."
          onConfirm={() => setSaveDialog(null)}
          title="Saved"
        />
      ) : null}

      {deleteTarget ? (
        <ContentDialog
          confirmLabel="Delete"
          message={
            deleteTargetChildren
              ? "Are you sure you want to delete this menu? All child menus will also be removed."
              : "Are you sure you want to delete this menu?"
          }
          onCancel={() => setDeleteTargetId(null)}
          onConfirm={handleDeleteMenu}
          title={`Delete ${deleteTarget.name}`}
          tone="danger"
        />
      ) : null}
    </div>
  )
}

function findNavigationItem(tree: NavigationGroup[], id: string): NavigationChild | null {
  for (const group of tree) {
    if (group.id === id) return group

    const child = group.children.find((item) => item.id === id)
    if (child) return child
  }

  return null
}

function findParentMenu(tree: NavigationGroup[], id: string) {
  return tree.find((group) => group.children.some((child) => child.id === id))
}

function updateNavigationItem(
  tree: NavigationGroup[],
  id: string,
  patch: Partial<NavigationChild>
) {
  return tree.map((group) => {
    if (group.id === id) {
      return { ...group, ...patch }
    }

    return {
      ...group,
      children: group.children.map((child) =>
        child.id === id ? { ...child, ...patch } : child
      ),
    }
  })
}

function setNavigationSortOrder(
  tree: NavigationGroup[],
  id: string,
  nextOrder: number
) {
  const normalizedOrder = Math.max(1, Math.floor(nextOrder || 1))
  const topIndex = tree.findIndex((item) => item.id === id)

  if (topIndex >= 0) {
    const targetIndex = Math.min(normalizedOrder - 1, tree.length - 1)
    return normalizeGroupSortOrder(reorderArray(tree, topIndex, targetIndex))
  }

  return tree.map((group) => {
    const childIndex = group.children.findIndex((item) => item.id === id)

    if (childIndex < 0) return group

    const targetIndex = Math.min(normalizedOrder - 1, group.children.length - 1)

    return {
      ...group,
      children: normalizeSortOrder(
        reorderArray(group.children, childIndex, targetIndex)
      ),
    }
  })
}

function addNavigationChild(
  tree: NavigationGroup[],
  parentId: string,
  child: NavigationChild
) {
  return tree.map((group) =>
    group.id === parentId
      ? { ...group, children: [...group.children, child] }
      : group
  )
}

function moveNavigationChild(
  tree: NavigationGroup[],
  childId: string,
  targetParentId: string
) {
  const sourceParent = findParentMenu(tree, childId)
  const child = sourceParent?.children.find((item) => item.id === childId)

  if (!sourceParent || !child) return tree

  return tree.map((group) => {
    if (group.id === sourceParent.id) {
      return {
        ...group,
        children: normalizeSortOrder(
          group.children.filter((item) => item.id !== childId)
        ),
      }
    }

    if (group.id === targetParentId) {
      return {
        ...group,
        children: normalizeSortOrder([
          ...group.children,
          { ...child, sortOrder: group.children.length + 1 },
        ]),
      }
    }

    return group
  })
}

function deleteNavigationItem(tree: NavigationGroup[], id: string) {
  if (tree.some((group) => group.id === id)) {
    return normalizeGroupSortOrder(tree.filter((group) => group.id !== id))
  }

  return tree.map((group) => ({
    ...group,
    children: normalizeSortOrder(
      group.children.filter((child) => child.id !== id)
    ),
  }))
}

function duplicateNavigationItem(tree: NavigationGroup[], id: string) {
  const groupIndex = tree.findIndex((group) => group.id === id)

  if (groupIndex >= 0) {
    const source = tree[groupIndex]
    const newId = createNavigationId("top-menu")
    const copy: NavigationGroup = {
      ...source,
      children: source.children.map((child) => ({
        ...child,
        id: createNavigationId("sub-menu"),
        name: `${child.name} Copy`,
      })),
      id: newId,
      name: `${source.name} Copy`,
    }
    const nextTree = [...tree]
    nextTree.splice(groupIndex + 1, 0, copy)

    return { newId, tree: normalizeGroupSortOrder(nextTree) }
  }

  const parent = findParentMenu(tree, id)

  if (!parent) return { newId: id, tree }

  const childIndex = parent.children.findIndex((child) => child.id === id)
  const source = parent.children[childIndex]
  const newId = createNavigationId("sub-menu")
  const copy: NavigationChild = {
    ...source,
    id: newId,
    name: `${source.name} Copy`,
  }

  return {
    newId,
    tree: tree.map((group) => {
      if (group.id !== parent.id) return group

      const children = [...group.children]
      children.splice(childIndex + 1, 0, copy)

      return {
        ...group,
        children: normalizeSortOrder(children),
      }
    }),
  }
}

function reorderNavigationItem(
  tree: NavigationGroup[],
  draggedId: string,
  targetId: string
) {
  const topDraggedIndex = tree.findIndex((item) => item.id === draggedId)
  const topTargetIndex = tree.findIndex((item) => item.id === targetId)

  if (topDraggedIndex >= 0 && topTargetIndex >= 0) {
    return normalizeGroupSortOrder(
      reorderArray(tree, topDraggedIndex, topTargetIndex)
    )
  }

  return tree.map((group) => {
    const draggedIndex = group.children.findIndex((item) => item.id === draggedId)
    const targetIndex = group.children.findIndex((item) => item.id === targetId)

    if (draggedIndex < 0 || targetIndex < 0) return group

    return {
      ...group,
      children: normalizeSortOrder(
        reorderArray(group.children, draggedIndex, targetIndex)
      ),
    }
  })
}

function reorderArray<T>(items: T[], fromIndex: number, toIndex: number) {
  const nextItems = [...items]
  const [item] = nextItems.splice(fromIndex, 1)
  nextItems.splice(toIndex, 0, item)

  return nextItems
}

function normalizeSortOrder(items: NavigationChild[]) {
  return items.map((item, index) => ({ ...item, sortOrder: index + 1 }))
}

function normalizeGroupSortOrder(items: NavigationGroup[]) {
  return items.map((item, index) => ({ ...item, sortOrder: index + 1 }))
}

function createNavigationId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
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
  children: ReactNode
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

function TreeRow({
  active,
  item,
  level,
  onDelete,
  onDuplicate,
  onClick,
  onToggleVisibility,
}: {
  active: boolean
  item: NavigationChild
  level: 1 | 2
  onDelete: () => void
  onDuplicate: () => void
  onClick: () => void
  onToggleVisibility: () => void
}) {
  return (
    <div
      className={cn(
        "group flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-left transition",
        active
          ? "bg-violet-50 text-violet-700 ring-1 ring-violet-100"
          : "text-slate-700 hover:bg-slate-50 hover:text-slate-950"
      )}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onClick()
        }
      }}
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <GripVertical className="size-4 shrink-0 text-slate-300 transition group-hover:text-slate-500" />
      {level === 1 ? (
        <ChevronDown className="size-4 shrink-0 text-slate-400" />
      ) : (
        <span className="size-4 shrink-0 rounded-full bg-slate-300" />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-bold">{item.name}</span>
          <StatusPill status={item.visibility} />
        </div>
        <p className="mt-1 truncate text-xs font-semibold text-slate-500">
          {item.url}
        </p>
      </div>
      <span className="shrink-0 rounded-full bg-white px-2 py-1 text-xs font-bold text-slate-500 ring-1 ring-slate-200">
        {item.sortOrder}
      </span>
      <div className="flex shrink-0 items-center gap-1 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
        <button
          className={cn(
            "h-7 rounded-lg px-2 text-xs font-bold transition",
            item.visibility === "Visible"
              ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
          )}
          onClick={(event) => {
            event.stopPropagation()
            onToggleVisibility()
          }}
          type="button"
        >
          {item.visibility === "Visible" ? "Hide" : "Show"}
        </button>
        <button
          aria-label={`Duplicate ${item.name}`}
          className="inline-flex size-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white hover:text-violet-600 hover:shadow-sm"
          onClick={(event) => {
            event.stopPropagation()
            onDuplicate()
          }}
          type="button"
        >
          <Copy className="size-3.5" />
        </button>
        <button
          aria-label={`Delete ${item.name}`}
          className="inline-flex size-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
          onClick={(event) => {
            event.stopPropagation()
            onDelete()
          }}
          type="button"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </div>
  )
}

function NavigationMenuDialog({
  form,
  mode,
  onCancel,
  onChange,
  onCreate,
  parentOptions,
}: {
  form: NavigationMenuForm
  mode: "sub" | "top"
  onCancel: () => void
  onChange: (patch: Partial<NavigationMenuForm>) => void
  onCreate: () => void
  parentOptions: Array<{ id: string; name: string }>
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="border-b border-slate-100 p-6">
          <h2 className="text-lg font-bold text-slate-950">
            {mode === "top" ? "Add Top Menu" : "Add Sub Menu"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Create a mock navigation item and place it in the website menu tree.
          </p>
        </div>
        <div className="grid gap-5 p-6 md:grid-cols-2">
          {mode === "sub" ? (
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Parent Menu
              </span>
              <select
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-950 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
                onChange={(event) => onChange({ parentId: event.target.value })}
                value={form.parentId}
              >
                {parentOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <ContentInput
            label="Menu Name"
            value={form.name}
            onChange={(value) => onChange({ name: value })}
          />
          <ContentInput
            label="URL"
            value={form.url}
            onChange={(value) => onChange({ url: value })}
          />
          <ContentInput
            label="Icon"
            value={form.icon}
            onChange={(value) => onChange({ icon: value })}
          />
          <ContentSelect
            label="Visibility"
            options={["Visible", "Hidden"]}
            value={form.visibility}
            onChange={(value) =>
              onChange({ visibility: value as NavigationVisibility })
            }
          />
          <ContentTextArea
            label="Description"
            value={form.description}
            onChange={(value) => onChange({ description: value })}
          />
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-100 p-6">
          <AdminButton onClick={onCancel} variant="secondary">
            Cancel
          </AdminButton>
          <AdminButton onClick={onCreate} variant="primary">
            Create
          </AdminButton>
        </div>
      </div>
    </div>
  )
}

function ContentDialog({
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

function ContentInput({
  label,
  onChange,
  type = "text",
  value,
}: {
  label: string
  onChange?: (value: string) => void
  type?: string
  value: string
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <input
        className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-950 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
        defaultValue={onChange ? undefined : value}
        onChange={(event) => onChange?.(event.target.value)}
        type={type}
        value={onChange ? value : undefined}
      />
    </label>
  )
}

function ContentSelect({
  disabled,
  label,
  onChange,
  options,
  value,
}: {
  disabled?: boolean
  label: string
  onChange?: (value: string) => void
  options: string[]
  value: string
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <select
        className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-950 outline-none transition disabled:bg-slate-50 disabled:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.value)}
        value={value}
      >
        {disabled ? <option>Top Level</option> : null}
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  )
}

function ContentTextArea({
  label,
  onChange,
  value,
}: {
  label: string
  onChange?: (value: string) => void
  value: string
}) {
  return (
    <label className="block md:col-span-2">
      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <textarea
        className="mt-2 min-h-28 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm font-medium text-slate-950 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
        defaultValue={onChange ? undefined : value}
        onChange={(event) => onChange?.(event.target.value)}
        value={onChange ? value : undefined}
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

function ProductPill({ product }: { product: string }) {
  const tone =
    product === "YETTEY"
      ? "bg-violet-50 text-violet-600 ring-violet-100"
      : product === "VPICK"
        ? "bg-blue-50 text-blue-600 ring-blue-100"
        : "bg-slate-100 text-slate-600 ring-slate-200"

  return (
    <span className={cn("inline-flex h-6 items-center rounded-full px-2.5 text-xs font-bold ring-1", tone)}>
      {product}
    </span>
  )
}
