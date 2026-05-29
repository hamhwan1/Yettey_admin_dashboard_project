"use client"

import type { ReactNode } from "react"
import { useMemo, useState } from "react"
import {
  ChevronDown,
  Copy,
  GripVertical,
  Image as ImageIcon,
  Plus,
  Search,
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
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const selectedItem =
    findNavigationItem(navigationTree, selectedId) ?? navigationTree[0]
  const parentMenu = findParentMenu(navigationTree, selectedId)
  const parentOptions = navigationTree.map((item) => item.name)

  const markChanged = (nextTree: NavigationGroup[]) => {
    setNavigationTree(nextTree)
    setHasChanges(true)
  }

  const handleFieldChange = (
    field: keyof NavigationChild,
    value: string | number
  ) => {
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

  const handleAddTopMenu = () => {
    const item: NavigationGroup = {
      children: [],
      description: "New top navigation group",
      icon: "menu",
      id: `top-menu-${Date.now()}`,
      name: "New Top Menu",
      sortOrder: navigationTree.length + 1,
      url: "/new-menu",
      visibility: "Hidden",
    }

    markChanged([...navigationTree, item])
    setSelectedId(item.id)
  }

  const handleAddSubMenu = () => {
    const parent = parentMenu ?? navigationTree.find((item) => item.id === selectedId)
    const parentId = parent?.id ?? navigationTree[0].id
    const parentItem = navigationTree.find((item) => item.id === parentId)
    const child: NavigationChild = {
      description: "New dropdown menu item",
      icon: "link",
      id: `sub-menu-${Date.now()}`,
      name: "New Sub Menu",
      sortOrder: (parentItem?.children.length ?? 0) + 1,
      url: "/new-sub-menu",
      visibility: "Hidden",
    }

    markChanged(addNavigationChild(navigationTree, parentId, child))
    setSelectedId(child.id)
  }

  const handleParentChange = (parentName: string) => {
    if (!parentMenu) return

    const targetParent = navigationTree.find((item) => item.name === parentName)
    if (!targetParent || targetParent.id === parentMenu.id) return

    markChanged(moveNavigationChild(navigationTree, selectedId, targetParent.id))
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
            <AdminButton className="h-9 px-3" onClick={handleAddTopMenu}>
              <Plus className="size-4" />
              Add Top Menu
            </AdminButton>
            <AdminButton className="h-9 px-3" onClick={handleAddSubMenu}>
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
                onClick={() => setSelectedId(group.id)}
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
                        onClick={() => setSelectedId(child.id)}
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
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
        <SectionHeader
          description="Edit the selected menu item as it appears on the website."
          title="Selected Menu Detail"
        />
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
        <div className="flex flex-col gap-3 border-t border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-slate-950">
              Website navigation hierarchy
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Drag top menus or sibling submenu items to adjust visual order.
            </p>
          </div>
          <AdminButton
            disabled={!hasChanges}
            onClick={() => setShowSaveDialog(true)}
            variant="primary"
          >
            Save Changes
          </AdminButton>
        </div>
      </section>

      {showSaveDialog ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-950">Save Navigation</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Do you want to save navigation changes?
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <AdminButton
                variant="secondary"
                onClick={() => setShowSaveDialog(false)}
              >
                Cancel
              </AdminButton>
              <AdminButton
                onClick={() => {
                  setHasChanges(false)
                  setShowSaveDialog(false)
                }}
                variant="primary"
              >
                Save
              </AdminButton>
            </div>
          </div>
        </div>
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
  onClick,
}: {
  active: boolean
  item: NavigationChild
  level: 1 | 2
  onClick: () => void
}) {
  return (
    <button
      className={cn(
        "group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition",
        active
          ? "bg-violet-50 text-violet-700 ring-1 ring-violet-100"
          : "text-slate-700 hover:bg-slate-50 hover:text-slate-950"
      )}
      onClick={onClick}
      type="button"
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
    </button>
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
