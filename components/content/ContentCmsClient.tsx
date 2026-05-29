"use client"

import { type ChangeEvent, useMemo, useState } from "react"
import {
  ChevronDown,
  ChevronRight,
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
  content?: string
  createdDate: string
  id: string
  originalUrl?: string
  seoDescription?: string
  seoTitle?: string
  status: "Draft" | "Hidden" | "Published" | "Review"
  tags: string[]
  thumbnail: string
  title: string
  type: "Imported URL" | "Manual Post"
  updatedDate: string
}

type GuidePost = {
  author: string
  category: string
  createdDate: string
  id: string
  language: "English" | "Korean"
  originalUrl?: string
  status: "Draft" | "Hidden" | "Published"
  thumbnail: string
  title: string
  type: "Imported URL" | "Manual Guide"
  updatedBy: string
  updatedDate: string
}

type FaqItem = {
  answer: string
  category: string
  id: string
  language: "English" | "Korean"
  question: string
  sortOrder: number
  status: "Draft" | "Hidden" | "Published"
  updatedBy: string
  updatedDate: string
}

type PopupBannerType = "Announcement" | "Banner" | "Maintenance Notice" | "Popup"

type PopupBannerStatus = "Active" | "Archived" | "Draft" | "Expired" | "Scheduled"

type PopupBannerItem = {
  audiences: string[]
  buttonText: string
  buttonUrl: string
  description: string
  dismissBehavior: string
  endDate: string
  id: string
  image: string
  location: string
  name: string
  plans: string[]
  startDate: string
  status: PopupBannerStatus
  title: string
  type: PopupBannerType
  updatedBy: string
  updatedDate: string
}

type PopupBannerForm = PopupBannerItem & {
  imageFileName: string
  imageMode: ThumbnailInputMode
}

type BlogCategory = {
  id: string
  name: string
  order: number
  status: "Hidden" | "Visible"
}

type BlogImportForm = {
  category: string
  thumbnail: string
  thumbnailFileName: string
  thumbnailMode: ThumbnailInputMode
  title: string
  url: string
}

type ThumbnailInputMode = "file" | "url"

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

const blogCategories: BlogCategory[] = [
  { id: "ai-content", name: "AI Content", order: 1, status: "Visible" },
  { id: "video-editing", name: "Video Editing", order: 2, status: "Visible" },
  { id: "product-updates", name: "Product Updates", order: 3, status: "Visible" },
  { id: "social-media", name: "Social Media", order: 4, status: "Hidden" },
]

const blogPosts: BlogPost[] = [
  {
    author: "Sarah Mitchell",
    category: "AI Content",
    content:
      "AI video workflows reduce repetitive editing tasks and help marketing teams publish faster.",
    createdDate: "May 24, 2026",
    id: "ai-video-workflows",
    seoDescription: "Learn how AI video workflows reduce editing time for content teams.",
    seoTitle: "How AI Video Workflows Reduce Editing Time",
    status: "Draft",
    tags: ["AI", "workflow", "editing"],
    thumbnail: "https://cdn.yettey.com/blog/ai-video-workflows.jpg",
    title: "How AI Video Workflows Reduce Editing Time",
    type: "Manual Post",
    updatedDate: "May 28, 2026",
  },
  {
    author: "Growth Team",
    category: "Product Updates",
    createdDate: "May 25, 2026",
    id: "vpick-shortform-workflow",
    originalUrl: "https://medium.com/example/vpick-shortform-workflow",
    status: "Review",
    tags: ["VPICK", "shortform"],
    thumbnail: "https://cdn.yettey.com/blog/vpick-shortform-workflow.jpg",
    title: "VPICK Shortform Workflow Update",
    type: "Imported URL",
    updatedDate: "May 27, 2026",
  },
  {
    author: "Content Ops",
    category: "Video Editing",
    content:
      "Thumbnail contrast, face visibility, and topic clarity affect click-through performance.",
    createdDate: "May 14, 2026",
    id: "thumbnail-patterns",
    seoDescription: "Thumbnail design patterns that improve click-through for shortform videos.",
    seoTitle: "Thumbnail Patterns That Improve Click-Through",
    status: "Published",
    tags: ["thumbnail", "video", "conversion"],
    thumbnail: "https://cdn.yettey.com/blog/thumbnail-patterns.jpg",
    title: "Thumbnail Patterns That Improve Click-Through",
    type: "Manual Post",
    updatedDate: "May 20, 2026",
  },
]

const guideCategories: BlogCategory[] = [
  { id: "getting-started", name: "Getting Started", order: 1, status: "Visible" },
  { id: "asset-management", name: "Asset Management", order: 2, status: "Visible" },
  { id: "ai-creation", name: "AI Creation", order: 3, status: "Visible" },
  { id: "video-automation", name: "Video Automation", order: 4, status: "Visible" },
  { id: "team-collaboration", name: "Team Collaboration", order: 5, status: "Visible" },
  { id: "billing", name: "Billing", order: 6, status: "Hidden" },
]

const guidePosts: GuidePost[] = [
  {
    author: "Support Ops",
    category: "Getting Started",
    createdDate: "May 19, 2026",
    id: "getting-started-guide",
    language: "English",
    status: "Published",
    thumbnail: "https://cdn.yettey.com/guides/getting-started.jpg",
    title: "Getting Started with Yettey",
    type: "Manual Guide",
    updatedBy: "Sarah Mitchell",
    updatedDate: "May 28, 2026",
  },
  {
    author: "Content Ops",
    category: "Video Automation",
    createdDate: "May 20, 2026",
    id: "vpick-upload-guide",
    language: "Korean",
    originalUrl: "https://help.yettey.ai/legacy/vpick-upload-guide",
    status: "Draft",
    thumbnail: "https://cdn.yettey.com/guides/vpick-upload.jpg",
    title: "VPICK Upload Guide",
    type: "Imported URL",
    updatedBy: "Growth Team",
    updatedDate: "May 27, 2026",
  },
  {
    author: "Billing Ops",
    category: "Billing",
    createdDate: "May 14, 2026",
    id: "credit-usage-guide",
    language: "English",
    status: "Hidden",
    thumbnail: "https://cdn.yettey.com/guides/credit-usage.jpg",
    title: "Credit Usage and Billing Guide",
    type: "Manual Guide",
    updatedBy: "Sarah Mitchell",
    updatedDate: "May 25, 2026",
  },
]

const faqItems: FaqItem[] = [
  {
    answer: "Yettey is an AI media workflow platform for managing, creating, and publishing content assets.",
    category: "Getting Started",
    id: "faq-what-is-yettey-en",
    language: "English",
    question: "What is Yettey?",
    sortOrder: 1,
    status: "Published",
    updatedBy: "Support Ops",
    updatedDate: "May 28, 2026",
  },
  {
    answer: "Credits are consumed when AI generation, video automation, and selected processing jobs are completed.",
    category: "Billing",
    id: "faq-credit-usage-en",
    language: "English",
    question: "How do credits work?",
    sortOrder: 2,
    status: "Draft",
    updatedBy: "Billing Ops",
    updatedDate: "May 27, 2026",
  },
  {
    answer: "Workspace owners can invite members from team settings and assign each member a role.",
    category: "Team Collaboration",
    id: "faq-invite-team-en",
    language: "English",
    question: "How do I invite team members?",
    sortOrder: 3,
    status: "Published",
    updatedBy: "Sarah Mitchell",
    updatedDate: "May 24, 2026",
  },
  {
    answer: "Yettey는 콘텐츠 자산을 관리하고 AI로 제작 및 게시하는 미디어 워크플로우 플랫폼입니다.",
    category: "Getting Started",
    id: "faq-what-is-yettey-ko",
    language: "Korean",
    question: "Yettey는 무엇인가요?",
    sortOrder: 1,
    status: "Published",
    updatedBy: "Support Ops",
    updatedDate: "May 28, 2026",
  },
  {
    answer: "크레딧은 AI 생성, 영상 자동화, 일부 처리 작업이 완료될 때 사용됩니다.",
    category: "Billing",
    id: "faq-credit-usage-ko",
    language: "Korean",
    question: "크레딧은 어떻게 사용되나요?",
    sortOrder: 2,
    status: "Hidden",
    updatedBy: "Billing Ops",
    updatedDate: "May 25, 2026",
  },
]

const popupBannerItems: PopupBannerItem[] = [
  {
    audiences: ["All Users"],
    buttonText: "View campaign",
    buttonUrl: "/campaign/summer-event",
    description: "Promote the summer launch campaign across homepage visitors.",
    dismissBehavior: "Don't Show Again For 7 Days",
    endDate: "2026-06-14",
    id: "summer-launch-banner",
    image: "https://cdn.yettey.com/campaigns/summer-launch-banner.jpg",
    location: "Homepage",
    name: "Summer launch banner",
    plans: [],
    startDate: "2026-06-01",
    status: "Active",
    title: "Summer creator campaign is live",
    type: "Banner",
    updatedBy: "Growth Team",
    updatedDate: "May 28, 2026",
  },
  {
    audiences: ["Logged-in Users", "Paid Users"],
    buttonText: "Open dashboard",
    buttonUrl: "/dashboard",
    description: "Inform active users about the short maintenance window.",
    dismissBehavior: "Close Only",
    endDate: "2026-05-31",
    id: "maintenance-dashboard-notice",
    image: "https://cdn.yettey.com/notices/maintenance-window.png",
    location: "Dashboard",
    name: "Dashboard maintenance notice",
    plans: ["Starter", "Growth", "Professional"],
    startDate: "2026-05-30",
    status: "Scheduled",
    title: "Scheduled maintenance on May 31",
    type: "Maintenance Notice",
    updatedBy: "Operations",
    updatedDate: "May 27, 2026",
  },
  {
    audiences: ["Guests Only", "Free Users"],
    buttonText: "Try VPICK",
    buttonUrl: "/vpick",
    description: "Introduce the VPICK shortform workflow to high-intent pricing page visitors.",
    dismissBehavior: "Don't Show Again Today",
    endDate: "2026-06-20",
    id: "vpick-promo-popup",
    image: "https://cdn.yettey.com/campaigns/vpick-promo-popup.jpg",
    location: "Pricing",
    name: "VPICK promo popup",
    plans: [],
    startDate: "2026-06-03",
    status: "Draft",
    title: "Create short clips from long videos",
    type: "Popup",
    updatedBy: "Sarah Mitchell",
    updatedDate: "May 26, 2026",
  },
  {
    audiences: ["All Users"],
    buttonText: "Read update",
    buttonUrl: "/blog/product-workflow-update",
    description: "Announce the new media library workflow update in content pages.",
    dismissBehavior: "Don't Show Again Until Campaign Ends",
    endDate: "2026-05-25",
    id: "media-library-announcement",
    image: "https://cdn.yettey.com/announcements/media-library-update.jpg",
    location: "Blog",
    name: "Media library announcement",
    plans: [],
    startDate: "2026-05-12",
    status: "Expired",
    title: "New media library workflow",
    type: "Announcement",
    updatedBy: "Content Ops",
    updatedDate: "May 25, 2026",
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
    action: "Manage Navigation",
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
  const router = useRouter()
  const [blogImportOpen, setBlogImportOpen] = useState(false)

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Content Operations"
        title={copy.title}
        description={copy.description}
        actions={
          section === "blog" ? (
            <>
              <AdminButton onClick={() => router.push("/content/blog/create")}>
                <Plus className="size-4" />
                New Post
              </AdminButton>
              <AdminButton variant="primary" onClick={() => setBlogImportOpen(true)}>
                <ExternalLink className="size-4" />
                Import URL
              </AdminButton>
            </>
          ) : section === "landing-pages" || section === "navigation" || section === "popups-banners" ? undefined : (
            section === "guides-faq" ? undefined : <AdminButton variant="primary">
              <Plus className="size-4" />
              {copy.action}
            </AdminButton>
          )
        }
      />

      {section === "blog" || section === "navigation" || section === "guides-faq" || section === "popups-banners" ? null : (
        <ContentSummary section={section} />
      )}

      <div className="mt-8">
        {section === "landing-pages" ? <LandingPagesFoundation /> : null}
        {section === "blog" ? (
          <BlogFoundation
            importOpen={blogImportOpen}
            onCloseImport={() => setBlogImportOpen(false)}
          />
        ) : null}
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

function BlogFoundation({
  importOpen,
  onCloseImport,
}: {
  importOpen: boolean
  onCloseImport: () => void
}) {
  const router = useRouter()
  const [posts, setPosts] = useState(blogPosts)
  const [categories, setCategories] = useState(blogCategories)
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const [draggedCategoryId, setDraggedCategoryId] = useState<string | null>(null)
  const [categoryDialog, setCategoryDialog] = useState<BlogCategory | "new" | null>(null)
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null)
  const [importForm, setImportForm] = useState<BlogImportForm>({
    category: blogCategories[0].name,
    thumbnail: "",
    thumbnailFileName: "",
    thumbnailMode: "url",
    title: "",
    url: "",
  })
  const selectedPost = posts.find((post) => post.id === selectedPostId) ?? null
  const deleteCategory = categories.find((category) => category.id === deleteCategoryId)

  const handleImportPost = () => {
    const title = importForm.title.trim() || "Imported external article"
    const post: BlogPost = {
      author: "Content Ops",
      category: importForm.category,
      createdDate: "Today",
      id: createBlogId("imported-post"),
      originalUrl: importForm.url.trim() || "https://example.com/imported-article",
      status: "Review",
      tags: ["imported"],
      thumbnail:
        importForm.thumbnail.trim() ||
        "https://cdn.yettey.com/blog/imported-reference.jpg",
      title,
      type: "Imported URL",
      updatedDate: "Today",
    }

    setPosts((current) => [post, ...current])
    setSelectedPostId(post.id)
    setImportForm({
      category: categories[0]?.name ?? "AI Content",
      thumbnail: "",
      thumbnailFileName: "",
      thumbnailMode: "url",
      title: "",
      url: "",
    })
    onCloseImport()
  }

  const handleCategoryDrop = (targetId: string) => {
    if (!draggedCategoryId || draggedCategoryId === targetId) {
      setDraggedCategoryId(null)
      return
    }

    const draggedIndex = categories.findIndex(
      (category) => category.id === draggedCategoryId
    )
    const targetIndex = categories.findIndex((category) => category.id === targetId)

    if (draggedIndex < 0 || targetIndex < 0) {
      setDraggedCategoryId(null)
      return
    }

    setCategories(normalizeBlogCategoryOrder(reorderArray(categories, draggedIndex, targetIndex)))
    setDraggedCategoryId(null)
  }

  const handleSaveCategory = (category: BlogCategory) => {
    if (categoryDialog === "new") {
      setCategories((current) =>
        normalizeBlogCategoryOrder([
          ...current,
          {
            ...category,
            id: createBlogId("category"),
            order: current.length + 1,
          },
        ])
      )
      setCategoryDialog(null)
      return
    }

    setCategories((current) =>
      current.map((item) => (item.id === category.id ? category : item))
    )
    setCategoryDialog(null)
  }

  const handleDeleteCategory = () => {
    if (!deleteCategoryId) return

    setCategories((current) =>
      normalizeBlogCategoryOrder(
        current.filter((category) => category.id !== deleteCategoryId)
      )
    )
    setDeleteCategoryId(null)
  }

  const handleUpdatePost = (postId: string, patch: Partial<BlogPost>) => {
    setPosts((current) =>
      current.map((post) => (post.id === postId ? { ...post, ...patch } : post))
    )
  }

  const handleDeletePost = (postId: string) => {
    setPosts((current) => current.filter((post) => post.id !== postId))
    setSelectedPostId(null)
  }

  const handleOpenPost = (postId: string) => {
    const post = posts.find((item) => item.id === postId)

    if (post?.type === "Manual Post") {
      router.push(`/content/blog/${post.id}`)
      return
    }

    setSelectedPostId(postId)
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
        <CategoryManager
          categories={categories}
          draggedCategoryId={draggedCategoryId}
          onAdd={() => setCategoryDialog("new")}
          onDelete={(categoryId) => setDeleteCategoryId(categoryId)}
          onDragStart={setDraggedCategoryId}
          onDrop={handleCategoryDrop}
          onEdit={setCategoryDialog}
          onToggleVisibility={(categoryId) =>
            setCategories((current) =>
              current.map((category) =>
                category.id === categoryId
                  ? {
                      ...category,
                      status: category.status === "Visible" ? "Hidden" : "Visible",
                    }
                  : category
              )
            )
          }
        />
        <PostTable posts={posts} onOpenPost={handleOpenPost} />
      </div>

      {importOpen ? (
        <ImportUrlDialog
          categories={categories}
          form={importForm}
          onCancel={onCloseImport}
          onChange={(patch) => setImportForm((current) => ({ ...current, ...patch }))}
          onImport={handleImportPost}
        />
      ) : null}

      {selectedPost ? (
        <BlogPostDetailDialog
          categories={categories}
          onClose={() => setSelectedPostId(null)}
          onDelete={handleDeletePost}
          onUpdate={handleUpdatePost}
          post={selectedPost}
        />
      ) : null}

      {categoryDialog ? (
        <CategoryDialog
          category={
            categoryDialog === "new"
              ? {
                  id: "new",
                  name: "",
                  order: categories.length + 1,
                  status: "Visible",
                }
              : categoryDialog
          }
          mode={categoryDialog === "new" ? "create" : "edit"}
          onCancel={() => setCategoryDialog(null)}
          onSave={handleSaveCategory}
        />
      ) : null}

      {deleteCategory ? (
        <ContentDialog
          confirmLabel="Delete"
          message="Are you sure you want to delete this category? Existing mock posts keep their current category label."
          onCancel={() => setDeleteCategoryId(null)}
          onConfirm={handleDeleteCategory}
          title={`Delete ${deleteCategory.name}`}
          tone="danger"
        />
      ) : null}
    </div>
  )
}

function CategoryManager({
  categories,
  draggedCategoryId,
  onAdd,
  onDelete,
  onDragStart,
  onDrop,
  onEdit,
  onToggleVisibility,
}: {
  categories: BlogCategory[]
  draggedCategoryId: string | null
  onAdd: () => void
  onDelete: (categoryId: string) => void
  onDragStart: (categoryId: string) => void
  onDrop: (categoryId: string) => void
  onEdit: (category: BlogCategory) => void
  onToggleVisibility: (categoryId: string) => void
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <SectionTitle title="Category Management" description="Add, edit, hide, delete, and reorder categories." />
        <AdminButton className="h-9 px-3" onClick={onAdd}>
          <Plus className="size-4" />
          Add Category
        </AdminButton>
      </div>
      <div className="mt-5 space-y-3">
        {categories.map((category) => (
          <div
            key={category.id}
            draggable
            className={cn(
              "flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 transition hover:border-violet-100 hover:bg-violet-50/40",
              draggedCategoryId === category.id && "opacity-60"
            )}
            onDragOver={(event) => event.preventDefault()}
            onDragStart={() => onDragStart(category.id)}
            onDrop={() => onDrop(category.id)}
          >
            <div className="flex min-w-0 items-center gap-3">
              <GripVertical className="size-4 shrink-0 text-slate-300" />
              <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-950">{category.name}</p>
              <p className="text-xs font-semibold text-slate-500">
                Order {category.order}
              </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <StatusPill status={category.status} />
              <button
                className="rounded-lg px-2 py-1 text-xs font-bold text-slate-500 transition hover:bg-white hover:text-violet-600"
                onClick={() => onToggleVisibility(category.id)}
                type="button"
              >
                {category.status === "Visible" ? "Hide" : "Show"}
              </button>
              <button
                className="rounded-lg px-2 py-1 text-xs font-bold text-slate-500 transition hover:bg-white hover:text-violet-600"
                onClick={() => onEdit(category)}
                type="button"
              >
                Edit
              </button>
              <button
                className="rounded-lg px-2 py-1 text-xs font-bold text-red-500 transition hover:bg-red-50"
                onClick={() => onDelete(category.id)}
                type="button"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function PostTable({
  onOpenPost,
  posts,
}: {
  onOpenPost: (postId: string) => void
  posts: BlogPost[]
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
      <SectionHeader description="Manage manual articles and imported external references." title="Blog Posts" />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1080px]">
          <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-6 py-4">Thumbnail</th>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Created Date</th>
              <th className="px-6 py-4">Updated Date</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {posts.map((post) => (
              <tr
                key={post.id}
                className="cursor-pointer transition hover:bg-violet-50/60"
                onClick={() => onOpenPost(post.id)}
              >
                <td className="px-6 py-5">
                  <div
                    className="flex size-14 items-center justify-center rounded-xl bg-slate-100 bg-cover bg-center ring-1 ring-slate-200"
                    style={
                      post.thumbnail
                        ? { backgroundImage: `url(${post.thumbnail})` }
                        : undefined
                    }
                  >
                    {post.thumbnail ? null : (
                      <ImageIcon className="size-5 text-slate-400" />
                    )}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <p className="text-sm font-bold text-slate-950">{post.title}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    {post.author}
                  </p>
                </td>
                <td className="px-6 py-5 text-sm text-slate-600">{post.category}</td>
                <td className="px-6 py-5 text-sm text-slate-600">{post.type}</td>
                <td className="px-6 py-5">
                  <StatusPill status={post.status} />
                </td>
                <td className="px-6 py-5 text-sm text-slate-600">{post.createdDate}</td>
                <td className="px-6 py-5 text-sm text-slate-600">{post.updatedDate}</td>
                <td className="px-6 py-5">
                  <button
                    className="text-sm font-bold text-violet-600 transition hover:text-violet-700"
                    onClick={(event) => {
                      event.stopPropagation()
                      onOpenPost(post.id)
                    }}
                    type="button"
                  >
                    {post.type === "Manual Post" ? "Edit" : "Open"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function ThumbnailPreview({ src }: { src: string }) {
  return (
    <div
      className="flex size-14 items-center justify-center rounded-xl bg-slate-100 bg-cover bg-center ring-1 ring-slate-200"
      style={src ? { backgroundImage: `url(${src})` } : undefined}
    >
      {src ? null : <ImageIcon className="size-5 text-slate-400" />}
    </div>
  )
}

function ImportUrlDialog({
  categories,
  description = "Store an external article as a managed reference. Imported URL posts do not expose article body editing.",
  form,
  onCancel,
  onChange,
  onImport,
  submitLabel = "Import",
  title = "Import URL",
}: {
  categories: BlogCategory[]
  description?: string
  form: BlogImportForm
  onCancel: () => void
  onChange: (patch: Partial<BlogImportForm>) => void
  onImport: () => void
  submitLabel?: string
  title?: string
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="border-b border-slate-100 p-6">
          <h2 className="text-lg font-bold text-slate-950">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {description}
          </p>
        </div>
        <div className="grid gap-5 p-6 md:grid-cols-2">
          <ContentInput
            label="URL"
            value={form.url}
            onChange={(value) => onChange({ url: value })}
          />
          <ContentInput
            label="Custom Title"
            value={form.title}
            onChange={(value) => onChange({ title: value })}
          />
          <ThumbnailSourceSelector
            fileName={form.thumbnailFileName}
            mode={form.thumbnailMode}
            value={form.thumbnail}
            onChange={(value) => onChange({ thumbnail: value })}
            onFileNameChange={(thumbnailFileName) => onChange({ thumbnailFileName })}
            onModeChange={(thumbnailMode) =>
              onChange({ thumbnail: "", thumbnailFileName: "", thumbnailMode })
            }
          />
          <ContentSelect
            label="Category"
            options={categories.map((category) => category.name)}
            value={form.category}
            onChange={(value) => onChange({ category: value })}
          />
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-100 p-6">
          <AdminButton onClick={onCancel} variant="secondary">
            Cancel
          </AdminButton>
          <AdminButton disabled={!form.url.trim()} onClick={onImport} variant="primary">
            {submitLabel}
          </AdminButton>
        </div>
      </div>
    </div>
  )
}

function ThumbnailSourceSelector({
  fileName,
  mode,
  onChange,
  onFileNameChange,
  onModeChange,
  value,
}: {
  fileName?: string
  mode: ThumbnailInputMode
  onChange: (value: string) => void
  onFileNameChange?: (value: string) => void
  onModeChange: (mode: ThumbnailInputMode) => void
  value: string
}) {
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onChange(reader.result)
        onFileNameChange?.(file.name)
      }
    }
    reader.readAsDataURL(file)
    event.currentTarget.value = ""
  }

  return (
    <div className="md:col-span-2">
      <fieldset>
        <legend className="text-xs font-bold uppercase tracking-wide text-slate-500">
          Thumbnail
        </legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {[
            { label: "Image URL", value: "url" as const },
            { label: "File Upload", value: "file" as const },
          ].map((option) => (
            <label
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 text-sm font-bold transition",
                mode === option.value
                  ? "border-violet-300 bg-violet-50 text-violet-700 ring-4 ring-violet-500/10"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              )}
              key={option.value}
            >
              <input
                checked={mode === option.value}
                className="size-4 accent-violet-600"
                onChange={() => onModeChange(option.value)}
                type="radio"
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-4 grid gap-4 md:grid-cols-[1fr_180px]">
        <div>
          {mode === "url" ? (
            <ContentInput
              label="Thumbnail URL"
              onChange={onChange}
              value={value}
            />
          ) : (
            <div>
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Upload Thumbnail
              </span>
              <label className="mt-2 flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center transition hover:border-violet-300 hover:bg-violet-50/50">
                <Upload className="size-5 text-violet-500" />
                <span className="mt-2 text-sm font-bold text-slate-800">
                  Choose image file
                </span>
                <span className="mt-1 text-xs font-semibold text-slate-500">
                  PNG, JPG, WEBP supported for mock upload
                </span>
                <input
                  accept="image/*"
                  className="sr-only"
                  onChange={handleFileChange}
                  type="file"
                />
              </label>
              {fileName ? (
                <p className="mt-2 text-xs font-semibold text-slate-500">
                  Selected: {fileName}
                </p>
              ) : null}
            </div>
          )}
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Preview
          </span>
          <div
            className="mt-2 flex h-28 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 bg-cover bg-center"
            style={value ? { backgroundImage: `url(${value})` } : undefined}
          >
            {value ? null : <ImageIcon className="size-6 text-slate-400" />}
          </div>
        </div>
      </div>
    </div>
  )
}

function BlogPostDetailDialog({
  categories,
  onClose,
  onDelete,
  onUpdate,
  post,
}: {
  categories: BlogCategory[]
  onClose: () => void
  onDelete: (postId: string) => void
  onUpdate: (postId: string, patch: Partial<BlogPost>) => void
  post: BlogPost
}) {
  const isImported = post.type === "Imported URL"
  const [thumbnailMode, setThumbnailMode] = useState<ThumbnailInputMode>("url")
  const [thumbnailFileName, setThumbnailFileName] = useState("")

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-slate-950">
                {isImported ? "Imported URL Detail" : "Manual Post Detail"}
              </h2>
              <StatusPill status={post.status} />
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {isImported
                ? "Manage external article metadata only. Article body editing is disabled for imported URLs."
                : "Edit, save draft, publish, or delete a manually written article."}
            </p>
          </div>
          <AdminButton onClick={onClose}>Close</AdminButton>
        </div>
        <div className="max-h-[calc(90vh-104px)] overflow-y-auto p-6">
          <div className="grid gap-5 md:grid-cols-2">
            <ContentInput
              label="Title"
              value={post.title}
              onChange={(value) => onUpdate(post.id, { title: value })}
            />
            <ContentSelect
              label="Category"
              options={categories.map((category) => category.name)}
              value={post.category}
              onChange={(value) => onUpdate(post.id, { category: value })}
            />
            {isImported ? (
              <ThumbnailSourceSelector
                fileName={thumbnailFileName}
                mode={thumbnailMode}
                onChange={(value) => onUpdate(post.id, { thumbnail: value })}
                onFileNameChange={setThumbnailFileName}
                onModeChange={setThumbnailMode}
                value={post.thumbnail}
              />
            ) : (
              <ContentInput
                label="Thumbnail"
                value={post.thumbnail}
                onChange={(value) => onUpdate(post.id, { thumbnail: value })}
              />
            )}
            <ContentInput label="Type" value={post.type} />
            {isImported ? (
              <ContentInput label="Original URL" value={post.originalUrl ?? ""} />
            ) : (
              <>
                <ContentInput
                  label="Tags"
                  value={post.tags.join(", ")}
                  onChange={(value) =>
                    onUpdate(post.id, {
                      tags: value
                        .split(",")
                        .map((tag) => tag.trim())
                        .filter(Boolean),
                    })
                  }
                />
                <ContentInput
                  label="SEO Title"
                  value={post.seoTitle ?? ""}
                  onChange={(value) => onUpdate(post.id, { seoTitle: value })}
                />
                <ContentTextArea
                  label="Content"
                  value={post.content ?? ""}
                  onChange={(value) => onUpdate(post.id, { content: value })}
                />
                <ContentTextArea
                  label="SEO Description"
                  value={post.seoDescription ?? ""}
                  onChange={(value) => onUpdate(post.id, { seoDescription: value })}
                />
              </>
            )}
          </div>
          <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-5">
            {isImported ? (
              <AdminButton
                disabled={!post.originalUrl}
                onClick={() =>
                  post.originalUrl &&
                  window.open(post.originalUrl, "_blank", "noopener,noreferrer")
                }
              >
                <ExternalLink className="size-4" />
                Open Original Post
              </AdminButton>
            ) : (
              <>
                <AdminButton
                  onClick={() => onUpdate(post.id, { status: "Draft" })}
                >
                  Save Draft
                </AdminButton>
                <AdminButton
                  onClick={() => onUpdate(post.id, { status: "Published" })}
                  variant="primary"
                >
                  Publish
                </AdminButton>
              </>
            )}
            <AdminButton
              className="border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50"
              onClick={() => onDelete(post.id)}
            >
              <Trash2 className="size-4" />
              Delete
            </AdminButton>
          </div>
        </div>
      </div>
    </div>
  )
}

function CategoryDialog({
  category,
  mode,
  onCancel,
  onSave,
}: {
  category: BlogCategory
  mode: "create" | "edit"
  onCancel: () => void
  onSave: (category: BlogCategory) => void
}) {
  const [draft, setDraft] = useState(category)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="border-b border-slate-100 p-6">
          <h2 className="text-lg font-bold text-slate-950">
            {mode === "create" ? "Add Category" : "Edit Category"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage category name, order, and visibility for blog operations.
          </p>
        </div>
        <div className="grid gap-5 p-6">
          <ContentInput
            label="Category Name"
            value={draft.name}
            onChange={(value) => setDraft((current) => ({ ...current, name: value }))}
          />
          <ContentInput
            label="Sort Order"
            type="number"
            value={String(draft.order)}
            onChange={(value) =>
              setDraft((current) => ({ ...current, order: Number(value) || 1 }))
            }
          />
          <ContentSelect
            label="Visibility"
            options={["Visible", "Hidden"]}
            value={draft.status}
            onChange={(value) =>
              setDraft((current) => ({
                ...current,
                status: value as BlogCategory["status"],
              }))
            }
          />
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-100 p-6">
          <AdminButton onClick={onCancel}>Cancel</AdminButton>
          <AdminButton
            disabled={!draft.name.trim()}
            onClick={() => onSave(draft)}
            variant="primary"
          >
            Save
          </AdminButton>
        </div>
      </div>
    </div>
  )
}

function GuidesFaqFoundation() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"faq" | "guides">("guides")
  const [guides, setGuides] = useState(guidePosts)
  const [categories, setCategories] = useState(guideCategories)
  const [draggedCategoryId, setDraggedCategoryId] = useState<string | null>(null)
  const [categoryDialog, setCategoryDialog] = useState<BlogCategory | "new" | null>(null)
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null)
  const [guideImportOpen, setGuideImportOpen] = useState(false)
  const [selectedGuideId, setSelectedGuideId] = useState<string | null>(null)
  const [guideImportForm, setGuideImportForm] = useState<BlogImportForm>({
    category: guideCategories[0].name,
    thumbnail: "",
    thumbnailFileName: "",
    thumbnailMode: "url",
    title: "",
    url: "",
  })
  const [faqs, setFaqs] = useState(faqItems)
  const [faqLanguage, setFaqLanguage] = useState<"English" | "Korean">("English")
  const [faqDialog, setFaqDialog] = useState<FaqItem | "new" | null>(null)
  const [deleteFaqId, setDeleteFaqId] = useState<string | null>(null)
  const [draggedFaqId, setDraggedFaqId] = useState<string | null>(null)
  const deleteCategory = categories.find((category) => category.id === deleteCategoryId)
  const selectedGuide = guides.find((guide) => guide.id === selectedGuideId) ?? null
  const deleteFaq = faqs.find((faq) => faq.id === deleteFaqId)

  const handleCategoryDrop = (targetId: string) => {
    if (!draggedCategoryId || draggedCategoryId === targetId) {
      setDraggedCategoryId(null)
      return
    }

    const draggedIndex = categories.findIndex(
      (category) => category.id === draggedCategoryId
    )
    const targetIndex = categories.findIndex((category) => category.id === targetId)

    if (draggedIndex < 0 || targetIndex < 0) {
      setDraggedCategoryId(null)
      return
    }

    setCategories(normalizeBlogCategoryOrder(reorderArray(categories, draggedIndex, targetIndex)))
    setDraggedCategoryId(null)
  }

  const handleSaveCategory = (category: BlogCategory) => {
    if (categoryDialog === "new") {
      setCategories((current) =>
        normalizeBlogCategoryOrder([
          ...current,
          { ...category, id: createBlogId("guide-category"), order: current.length + 1 },
        ])
      )
      setCategoryDialog(null)
      return
    }

    setCategories((current) =>
      current.map((item) => (item.id === category.id ? category : item))
    )
    setCategoryDialog(null)
  }

  const handleDeleteCategory = () => {
    if (!deleteCategoryId) return
    setCategories((current) =>
      normalizeBlogCategoryOrder(
        current.filter((category) => category.id !== deleteCategoryId)
      )
    )
    setDeleteCategoryId(null)
  }

  const handleImportGuide = () => {
    const title = guideImportForm.title.trim() || "Imported external guide"
    const guide: GuidePost = {
      author: "Content Ops",
      category: guideImportForm.category,
      createdDate: "Today",
      id: createBlogId("imported-guide"),
      language: "English",
      originalUrl: guideImportForm.url.trim() || "https://example.com/imported-guide",
      status: "Draft",
      thumbnail:
        guideImportForm.thumbnail.trim() ||
        "https://cdn.yettey.com/guides/imported-reference.jpg",
      title,
      type: "Imported URL",
      updatedBy: "Sarah Mitchell",
      updatedDate: "Today",
    }

    setGuides((current) => [guide, ...current])
    setSelectedGuideId(guide.id)
    setGuideImportForm({
      category: categories[0]?.name ?? "Getting Started",
      thumbnail: "",
      thumbnailFileName: "",
      thumbnailMode: "url",
      title: "",
      url: "",
    })
    setGuideImportOpen(false)
  }

  const handleOpenGuide = (guideId: string) => {
    const guide = guides.find((item) => item.id === guideId)

    if (guide?.type === "Manual Guide") {
      router.push(`/content/guides-faq/${guide.id}`)
      return
    }

    setSelectedGuideId(guideId)
  }

  const handleFaqDrop = (targetId: string) => {
    if (!draggedFaqId || draggedFaqId === targetId) {
      setDraggedFaqId(null)
      return
    }

    setFaqs((current) => {
      const sameLanguage = current
        .filter((item) => item.language === faqLanguage)
        .sort((a, b) => a.sortOrder - b.sortOrder)
      const draggedIndex = sameLanguage.findIndex((item) => item.id === draggedFaqId)
      const targetIndex = sameLanguage.findIndex((item) => item.id === targetId)

      if (draggedIndex < 0 || targetIndex < 0) return current

      const reordered = normalizeFaqOrder(
        reorderArray(sameLanguage, draggedIndex, targetIndex)
      )

      return current.map(
        (item) => reordered.find((reorderedItem) => reorderedItem.id === item.id) ?? item
      )
    })
    setDraggedFaqId(null)
  }

  const handleSaveFaq = (faq: FaqItem) => {
    if (faqDialog === "new") {
      setFaqs((current) => {
        const languageItems = current.filter((item) => item.language === faq.language)
        return [
          ...current,
          {
            ...faq,
            id: createBlogId("faq"),
            sortOrder: languageItems.length + 1,
            updatedBy: "Sarah Mitchell",
            updatedDate: "Today",
          },
        ]
      })
      setFaqDialog(null)
      return
    }

    setFaqs((current) =>
      current.map((item) =>
        item.id === faq.id ? { ...faq, updatedBy: "Sarah Mitchell", updatedDate: "Today" } : item
      )
    )
    setFaqDialog(null)
  }

  const handleDeleteFaq = () => {
    if (!deleteFaqId) return
    setFaqs((current) => current.filter((faq) => faq.id !== deleteFaqId))
    setDeleteFaqId(null)
  }

  return (
    <div className="space-y-6">
      <div className="inline-flex rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
        {[
          { label: "Guides", value: "guides" as const },
          { label: "FAQ", value: "faq" as const },
        ].map((tab) => (
          <button
            className={cn(
              "rounded-xl px-5 py-2 text-sm font-bold transition",
              activeTab === tab.value
                ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-950"
            )}
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "guides" ? (
        <div className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
          <CategoryManager
            categories={categories}
            draggedCategoryId={draggedCategoryId}
            onAdd={() => setCategoryDialog("new")}
            onDelete={(categoryId) => setDeleteCategoryId(categoryId)}
            onDragStart={setDraggedCategoryId}
            onDrop={handleCategoryDrop}
            onEdit={setCategoryDialog}
            onToggleVisibility={(categoryId) =>
              setCategories((current) =>
                current.map((category) =>
                  category.id === categoryId
                    ? {
                        ...category,
                        status: category.status === "Visible" ? "Hidden" : "Visible",
                      }
                    : category
                )
              )
            }
          />
          <GuideTable
            guides={guides}
            onDelete={(guideId) =>
              setGuides((current) => current.filter((guide) => guide.id !== guideId))
            }
            onImport={() => setGuideImportOpen(true)}
            onNewGuide={() => router.push("/content/guides-faq/create")}
            onOpenGuide={handleOpenGuide}
            onStatusChange={(guideId, status) =>
              setGuides((current) =>
                current.map((guide) =>
                  guide.id === guideId
                    ? { ...guide, status, updatedBy: "Sarah Mitchell", updatedDate: "Today" }
                    : guide
                )
              )
            }
          />
        </div>
      ) : (
        <FaqManagement
          draggedFaqId={draggedFaqId}
          faqs={faqs}
          language={faqLanguage}
          onAdd={() => setFaqDialog("new")}
          onDelete={setDeleteFaqId}
          onDragStart={setDraggedFaqId}
          onDrop={handleFaqDrop}
          onEdit={setFaqDialog}
          onLanguageChange={setFaqLanguage}
          onStatusChange={(faqId, status) =>
            setFaqs((current) =>
              current.map((faq) =>
                faq.id === faqId
                  ? { ...faq, status, updatedBy: "Sarah Mitchell", updatedDate: "Today" }
                  : faq
              )
            )
          }
        />
      )}

      {guideImportOpen ? (
        <ImportUrlDialog
          categories={categories}
          description="Store an external help article as a managed guide reference. Imported guides do not expose body editing."
          form={guideImportForm}
          onCancel={() => setGuideImportOpen(false)}
          onChange={(patch) =>
            setGuideImportForm((current) => ({ ...current, ...patch }))
          }
          onImport={handleImportGuide}
          submitLabel="Import Guide"
          title="Import Guide URL"
        />
      ) : null}

      {selectedGuide ? (
        <GuideReferenceDialog
          categories={categories}
          guide={selectedGuide}
          onClose={() => setSelectedGuideId(null)}
          onDelete={(guideId) => {
            setGuides((current) => current.filter((guide) => guide.id !== guideId))
            setSelectedGuideId(null)
          }}
          onUpdate={(guideId, patch) =>
            setGuides((current) =>
              current.map((guide) =>
                guide.id === guideId
                  ? { ...guide, ...patch, updatedBy: "Sarah Mitchell", updatedDate: "Today" }
                  : guide
              )
            )
          }
        />
      ) : null}

      {categoryDialog ? (
        <CategoryDialog
          category={
            categoryDialog === "new"
              ? {
                  id: "new",
                  name: "",
                  order: categories.length + 1,
                  status: "Visible",
                }
              : categoryDialog
          }
          mode={categoryDialog === "new" ? "create" : "edit"}
          onCancel={() => setCategoryDialog(null)}
          onSave={handleSaveCategory}
        />
      ) : null}

      {deleteCategory ? (
        <ContentDialog
          confirmLabel="Delete"
          message="Are you sure you want to delete this guide category? Existing mock guides keep their current category label."
          onCancel={() => setDeleteCategoryId(null)}
          onConfirm={handleDeleteCategory}
          title={`Delete ${deleteCategory.name}`}
          tone="danger"
        />
      ) : null}

      {faqDialog ? (
        <FaqDialog
          categories={categories}
          faq={
            faqDialog === "new"
              ? {
                  answer: "",
                  category: categories[0]?.name ?? "Getting Started",
                  id: "new",
                  language: faqLanguage,
                  question: "",
                  sortOrder:
                    faqs.filter((faq) => faq.language === faqLanguage).length + 1,
                  status: "Draft",
                  updatedBy: "Sarah Mitchell",
                  updatedDate: "Today",
                }
              : faqDialog
          }
          mode={faqDialog === "new" ? "create" : "edit"}
          onCancel={() => setFaqDialog(null)}
          onSave={handleSaveFaq}
        />
      ) : null}

      {deleteFaq ? (
        <ContentDialog
          confirmLabel="Delete"
          message="Are you sure you want to delete this FAQ item? This action only updates local mock data."
          onCancel={() => setDeleteFaqId(null)}
          onConfirm={handleDeleteFaq}
          title="Delete FAQ"
          tone="danger"
        />
      ) : null}
    </div>
  )
}

function GuideTable({
  guides,
  onDelete,
  onImport,
  onNewGuide,
  onOpenGuide,
  onStatusChange,
}: {
  guides: GuidePost[]
  onDelete: (guideId: string) => void
  onImport: () => void
  onNewGuide: () => void
  onOpenGuide: (guideId: string) => void
  onStatusChange: (guideId: string, status: GuidePost["status"]) => void
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
      <div className="flex flex-col gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-start sm:justify-between">
        <SectionTitle
          title="Guides CMS"
          description="Manage long-form help articles, imported references, language state, and publishing visibility."
        />
        <div className="flex flex-wrap gap-2">
          <AdminButton onClick={onNewGuide}>
            <Plus className="size-4" />
            New Guide
          </AdminButton>
          <AdminButton onClick={onImport} variant="primary">
            <ExternalLink className="size-4" />
            Import URL
          </AdminButton>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1120px]">
          <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-6 py-4">Thumbnail</th>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Language</th>
              <th className="px-6 py-4">Updated Date</th>
              <th className="px-6 py-4">Updated By</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {guides.map((guide) => (
              <tr
                className="cursor-pointer transition hover:bg-violet-50/60"
                key={guide.id}
                onClick={() => onOpenGuide(guide.id)}
              >
                <td className="px-6 py-5">
                  <ThumbnailPreview src={guide.thumbnail} />
                </td>
                <td className="px-6 py-5">
                  <p className="text-sm font-bold text-slate-950">{guide.title}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    {guide.type}
                  </p>
                </td>
                <td className="px-6 py-5 text-sm text-slate-600">{guide.category}</td>
                <td className="px-6 py-5">
                  <StatusPill status={guide.status} />
                </td>
                <td className="px-6 py-5 text-sm text-slate-600">{guide.language}</td>
                <td className="px-6 py-5 text-sm text-slate-600">{guide.updatedDate}</td>
                <td className="px-6 py-5 text-sm text-slate-600">{guide.updatedBy}</td>
                <td className="px-6 py-5">
                  <div className="flex flex-wrap gap-2">
                    <button
                      className="text-xs font-bold text-violet-600 hover:text-violet-700"
                      onClick={(event) => {
                        event.stopPropagation()
                        onOpenGuide(guide.id)
                      }}
                      type="button"
                    >
                      {guide.type === "Manual Guide" ? "Edit" : "Open"}
                    </button>
                    <button
                      className="text-xs font-bold text-slate-500 hover:text-violet-600"
                      onClick={(event) => {
                        event.stopPropagation()
                        onStatusChange(guide.id, guide.status === "Published" ? "Draft" : "Published")
                      }}
                      type="button"
                    >
                      {guide.status === "Published" ? "Draft" : "Publish"}
                    </button>
                    <button
                      className="text-xs font-bold text-slate-500 hover:text-orange-600"
                      onClick={(event) => {
                        event.stopPropagation()
                        onStatusChange(guide.id, "Hidden")
                      }}
                      type="button"
                    >
                      Hide
                    </button>
                    <button
                      className="text-xs font-bold text-red-500 hover:text-red-600"
                      onClick={(event) => {
                        event.stopPropagation()
                        onDelete(guide.id)
                      }}
                      type="button"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function GuideReferenceDialog({
  categories,
  guide,
  onClose,
  onDelete,
  onUpdate,
}: {
  categories: BlogCategory[]
  guide: GuidePost
  onClose: () => void
  onDelete: (guideId: string) => void
  onUpdate: (guideId: string, patch: Partial<GuidePost>) => void
}) {
  const [thumbnailMode, setThumbnailMode] = useState<ThumbnailInputMode>("url")
  const [thumbnailFileName, setThumbnailFileName] = useState("")

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-slate-950">
                Imported Guide Detail
              </h2>
              <StatusPill status={guide.status} />
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Imported guides are managed as external references. Body editing is disabled.
            </p>
          </div>
          <AdminButton onClick={onClose}>Close</AdminButton>
        </div>
        <div className="max-h-[calc(90vh-104px)] overflow-y-auto p-6">
          <div className="grid gap-5 md:grid-cols-2">
            <ContentInput
              label="Title"
              value={guide.title}
              onChange={(value) => onUpdate(guide.id, { title: value })}
            />
            <ContentSelect
              label="Category"
              options={categories.map((category) => category.name)}
              value={guide.category}
              onChange={(value) => onUpdate(guide.id, { category: value })}
            />
            <ContentSelect
              label="Language"
              options={["English", "Korean"]}
              value={guide.language}
              onChange={(value) =>
                onUpdate(guide.id, { language: value as GuidePost["language"] })
              }
            />
            <ContentSelect
              label="Status"
              options={["Draft", "Published", "Hidden"]}
              value={guide.status}
              onChange={(value) =>
                onUpdate(guide.id, { status: value as GuidePost["status"] })
              }
            />
            <ThumbnailSourceSelector
              fileName={thumbnailFileName}
              mode={thumbnailMode}
              onChange={(value) => onUpdate(guide.id, { thumbnail: value })}
              onFileNameChange={setThumbnailFileName}
              onModeChange={setThumbnailMode}
              value={guide.thumbnail}
            />
            <ContentInput label="Original URL" value={guide.originalUrl ?? ""} />
          </div>
          <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-5">
            <AdminButton
              disabled={!guide.originalUrl}
              onClick={() =>
                guide.originalUrl &&
                window.open(guide.originalUrl, "_blank", "noopener,noreferrer")
              }
            >
              <ExternalLink className="size-4" />
              Open Original Guide
            </AdminButton>
            <AdminButton
              className="border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50"
              onClick={() => onDelete(guide.id)}
            >
              <Trash2 className="size-4" />
              Delete
            </AdminButton>
          </div>
        </div>
      </div>
    </div>
  )
}

function FaqManagement({
  draggedFaqId,
  faqs,
  language,
  onAdd,
  onDelete,
  onDragStart,
  onDrop,
  onEdit,
  onLanguageChange,
  onStatusChange,
}: {
  draggedFaqId: string | null
  faqs: FaqItem[]
  language: "English" | "Korean"
  onAdd: () => void
  onDelete: (faqId: string) => void
  onDragStart: (faqId: string) => void
  onDrop: (faqId: string) => void
  onEdit: (faq: FaqItem) => void
  onLanguageChange: (language: "English" | "Korean") => void
  onStatusChange: (faqId: string, status: FaqItem["status"]) => void
}) {
  const visibleFaqs = faqs
    .filter((faq) => faq.language === language)
    .sort((a, b) => a.sortOrder - b.sortOrder)

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
      <div className="flex flex-col gap-4 border-b border-slate-100 p-6 lg:flex-row lg:items-start lg:justify-between">
        <SectionTitle
          title="FAQ CMS"
          description="Manage structured Q&A items by language, category, visibility, and display order."
        />
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
            {(["English", "Korean"] as const).map((item) => (
              <button
                className={cn(
                  "rounded-lg px-4 py-2 text-xs font-bold transition",
                  language === item
                    ? "bg-white text-violet-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-950"
                )}
                key={item}
                onClick={() => onLanguageChange(item)}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>
          <AdminButton onClick={onAdd} variant="primary">
            <Plus className="size-4" />
            Add FAQ
          </AdminButton>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px]">
          <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-6 py-4">Sort</th>
              <th className="px-6 py-4">Question</th>
              <th className="px-6 py-4">Answer</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Language</th>
              <th className="px-6 py-4">Visibility</th>
              <th className="px-6 py-4">Updated</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visibleFaqs.map((faq) => (
              <tr
                className={cn(
                  "transition hover:bg-violet-50/60",
                  draggedFaqId === faq.id && "opacity-60"
                )}
                draggable
                key={faq.id}
                onDragOver={(event) => event.preventDefault()}
                onDragStart={() => onDragStart(faq.id)}
                onDrop={() => onDrop(faq.id)}
              >
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                    <GripVertical className="size-4 text-slate-300" />
                    {faq.sortOrder}
                  </div>
                </td>
                <td className="max-w-[260px] px-6 py-5 text-sm font-bold text-slate-950">
                  {faq.question}
                </td>
                <td className="max-w-[360px] px-6 py-5 text-sm leading-6 text-slate-600">
                  {faq.answer}
                </td>
                <td className="px-6 py-5 text-sm text-slate-600">{faq.category}</td>
                <td className="px-6 py-5 text-sm text-slate-600">{faq.language}</td>
                <td className="px-6 py-5">
                  <StatusPill status={faq.status} />
                </td>
                <td className="px-6 py-5">
                  <p className="text-sm text-slate-600">{faq.updatedDate}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-400">
                    {faq.updatedBy}
                  </p>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-wrap gap-2">
                    <button
                      className="text-xs font-bold text-violet-600 hover:text-violet-700"
                      onClick={() => onEdit(faq)}
                      type="button"
                    >
                      Edit
                    </button>
                    <button
                      className="text-xs font-bold text-slate-500 hover:text-violet-600"
                      onClick={() =>
                        onStatusChange(
                          faq.id,
                          faq.status === "Published" ? "Draft" : "Published"
                        )
                      }
                      type="button"
                    >
                      {faq.status === "Published" ? "Draft" : "Publish"}
                    </button>
                    <button
                      className="text-xs font-bold text-slate-500 hover:text-orange-600"
                      onClick={() => onStatusChange(faq.id, "Hidden")}
                      type="button"
                    >
                      Hide
                    </button>
                    <button
                      className="text-xs font-bold text-red-500 hover:text-red-600"
                      onClick={() => onDelete(faq.id)}
                      type="button"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-slate-100 px-6 py-4 text-sm font-semibold text-slate-500">
        Showing {visibleFaqs.length} {language} FAQ items. Drag rows to control display order.
      </div>
    </section>
  )
}

function FaqDialog({
  categories,
  faq,
  mode,
  onCancel,
  onSave,
}: {
  categories: BlogCategory[]
  faq: FaqItem
  mode: "create" | "edit"
  onCancel: () => void
  onSave: (faq: FaqItem) => void
}) {
  const [draft, setDraft] = useState(faq)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="border-b border-slate-100 p-6">
          <h2 className="text-lg font-bold text-slate-950">
            {mode === "create" ? "Add FAQ" : "Edit FAQ"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage a structured question and answer for the selected help center language.
          </p>
        </div>
        <div className="grid gap-5 p-6 md:grid-cols-2">
          <ContentSelect
            label="Language"
            options={["English", "Korean"]}
            value={draft.language}
            onChange={(value) =>
              setDraft((current) => ({
                ...current,
                language: value as FaqItem["language"],
              }))
            }
          />
          <ContentSelect
            label="Category"
            options={categories.map((category) => category.name)}
            value={draft.category}
            onChange={(value) => setDraft((current) => ({ ...current, category: value }))}
          />
          <ContentInput
            label="Sort Order"
            type="number"
            value={String(draft.sortOrder)}
            onChange={(value) =>
              setDraft((current) => ({ ...current, sortOrder: Number(value) || 1 }))
            }
          />
          <ContentSelect
            label="Visibility"
            options={["Draft", "Published", "Hidden"]}
            value={draft.status}
            onChange={(value) =>
              setDraft((current) => ({
                ...current,
                status: value as FaqItem["status"],
              }))
            }
          />
          <div className="md:col-span-2">
            <ContentInput
              label="Question"
              value={draft.question}
              onChange={(value) =>
                setDraft((current) => ({ ...current, question: value }))
              }
            />
          </div>
          <div className="md:col-span-2">
            <ContentTextArea
              label="Answer"
              value={draft.answer}
              onChange={(value) =>
                setDraft((current) => ({ ...current, answer: value }))
              }
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-100 p-6">
          <AdminButton onClick={onCancel}>Cancel</AdminButton>
          <AdminButton
            disabled={!draft.question.trim() || !draft.answer.trim()}
            onClick={() => onSave(draft)}
            variant="primary"
          >
            Save
          </AdminButton>
        </div>
      </div>
    </div>
  )
}

function PopupsBannersFoundation() {
  const [items, setItems] = useState(popupBannerItems)
  const [query, setQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("All")
  const [statusFilter, setStatusFilter] = useState("All")
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | null>(null)
  const [draft, setDraft] = useState<PopupBannerForm | null>(null)
  const filteredItems = items.filter((item) => {
    const matchesQuery =
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.location.toLowerCase().includes(query.toLowerCase())
    const matchesType = typeFilter === "All" || item.type === typeFilter
    const matchesStatus = statusFilter === "All" || item.status === statusFilter

    return matchesQuery && matchesType && matchesStatus
  })

  const openCreateDialog = () => {
    setDraft(createPopupBannerForm())
    setDialogMode("create")
  }

  const openEditDialog = (item: PopupBannerItem) => {
    setDraft({
      ...item,
      imageFileName: "",
      imageMode: item.image ? "url" : "file",
    })
    setDialogMode("edit")
  }

  const closeDialog = () => {
    setDialogMode(null)
    setDraft(null)
  }

  const saveDraft = () => {
    if (!draft) return

    const item: PopupBannerItem = {
      audiences: draft.audiences,
      buttonText: draft.buttonText,
      buttonUrl: draft.buttonUrl,
      description: draft.description,
      dismissBehavior: draft.dismissBehavior,
      endDate: draft.endDate,
      id: draft.id,
      image: draft.image,
      location: draft.location,
      name: draft.name,
      plans: draft.plans,
      startDate: draft.startDate,
      status: draft.status,
      title: draft.title,
      type: draft.type,
      updatedBy: "Sarah Mitchell",
      updatedDate: "Today",
    }

    if (dialogMode === "create") {
      setItems((current) => [item, ...current])
    } else {
      setItems((current) => current.map((currentItem) => (currentItem.id === item.id ? item : currentItem)))
    }

    closeDialog()
  }

  const updateStatus = (itemId: string, status: PopupBannerStatus) => {
    setItems((current) =>
      current.map((item) =>
        item.id === itemId
          ? { ...item, status, updatedBy: "Sarah Mitchell", updatedDate: "Today" }
          : item
      )
    )
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <SectionTitle
              title="Campaign Display Manager"
              description="Control what appears, who sees it, where it appears, and when it remains visible."
            />
            <div className="mt-4 flex flex-wrap gap-2">
              {["Popup", "Banner", "Announcement", "Maintenance Notice"].map((type) => (
                <span
                  className="rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600 ring-1 ring-slate-200"
                  key={type}
                >
                  {type}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="block min-w-[240px]">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Search
              </span>
              <div className="mt-2 flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3">
                <Search className="size-4 text-slate-400" />
                <input
                  className="w-full bg-transparent text-sm font-semibold text-slate-950 outline-none placeholder:text-slate-400"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search campaigns..."
                  value={query}
                />
              </div>
            </label>
            <ContentSelect
              label="Type"
              options={["All", "Popup", "Banner", "Announcement", "Maintenance Notice"]}
              value={typeFilter}
              onChange={setTypeFilter}
            />
            <ContentSelect
              label="Status"
              options={["All", "Draft", "Scheduled", "Active", "Expired", "Archived"]}
              value={statusFilter}
              onChange={setStatusFilter}
            />
            <AdminButton className="h-11" onClick={openCreateDialog} variant="primary">
              <Plus className="size-4" />
              New Popup/Banner
            </AdminButton>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
        <SectionHeader
          description="Manage campaign visibility, schedule, audience targeting, and edit history without permanent deletion."
          title="Popups & Banners"
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1240px]">
            <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Target Audience</th>
                <th className="px-6 py-4">Date Range</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Updated</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => (
                <tr
                  className="cursor-pointer transition hover:bg-violet-50/60"
                  key={item.id}
                  onClick={() => openEditDialog(item)}
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <ThumbnailPreview src={item.image} />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-950">{item.name}</p>
                        <p className="mt-1 max-w-[260px] truncate text-xs font-semibold text-slate-500">
                          {item.title}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm font-semibold text-slate-700">{item.type}</td>
                  <td className="px-6 py-5 text-sm text-slate-600">{item.location}</td>
                  <td className="px-6 py-5">
                    <div className="flex max-w-[240px] flex-wrap gap-1.5">
                      {[...item.audiences, ...item.plans].slice(0, 4).map((target) => (
                        <span
                          className="rounded-full bg-slate-50 px-2 py-1 text-xs font-bold text-slate-500 ring-1 ring-slate-200"
                          key={target}
                        >
                          {target}
                        </span>
                      ))}
                      {item.audiences.length + item.plans.length > 4 ? (
                        <span className="rounded-full bg-violet-50 px-2 py-1 text-xs font-bold text-violet-600 ring-1 ring-violet-100">
                          +{item.audiences.length + item.plans.length - 4}
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-600">
                    {formatCampaignDate(item.startDate)} - {formatCampaignDate(item.endDate)}
                  </td>
                  <td className="px-6 py-5">
                    <StatusPill status={item.status} />
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-sm text-slate-600">{item.updatedDate}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-400">{item.updatedBy}</p>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="text-xs font-bold text-violet-600 hover:text-violet-700"
                        onClick={(event) => {
                          event.stopPropagation()
                          openEditDialog(item)
                        }}
                        type="button"
                      >
                        Edit
                      </button>
                      <button
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
                        onClick={(event) => {
                          event.stopPropagation()
                          updateStatus(item.id, "Active")
                        }}
                        type="button"
                      >
                        Enable
                      </button>
                      <button
                        className="text-xs font-bold text-slate-500 hover:text-orange-600"
                        onClick={(event) => {
                          event.stopPropagation()
                          updateStatus(item.id, "Draft")
                        }}
                        type="button"
                      >
                        Disable
                      </button>
                      <button
                        className="text-xs font-bold text-slate-500 hover:text-slate-700"
                        onClick={(event) => {
                          event.stopPropagation()
                          updateStatus(item.id, "Archived")
                        }}
                        type="button"
                      >
                        Archive
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-slate-100 px-6 py-4 text-sm font-semibold text-slate-500">
          Showing {filteredItems.length} campaign display records. Archived records remain available for history.
        </div>
      </section>

      {draft && dialogMode ? (
        <PopupBannerDialog
          draft={draft}
          mode={dialogMode}
          onCancel={closeDialog}
          onChange={(patch) =>
            setDraft((current) => (current ? { ...current, ...patch } : current))
          }
          onSave={saveDraft}
          onStatusChange={(status) =>
            setDraft((current) => (current ? { ...current, status } : current))
          }
        />
      ) : null}
    </div>
  )
}

function PopupBannerDialog({
  draft,
  mode,
  onCancel,
  onChange,
  onSave,
  onStatusChange,
}: {
  draft: PopupBannerForm
  mode: "create" | "edit"
  onCancel: () => void
  onChange: (patch: Partial<PopupBannerForm>) => void
  onSave: () => void
  onStatusChange: (status: PopupBannerStatus) => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-slate-950">
                {mode === "create" ? "Create Popup/Banner" : "Campaign Display Detail"}
              </h2>
              <StatusPill status={draft.status} />
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Manage content, targeting, schedule, dismiss behavior, and edit history.
            </p>
          </div>
          <AdminButton onClick={onCancel}>Close</AdminButton>
        </div>

        <div className="max-h-[calc(92vh-108px)] overflow-y-auto p-6">
          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <section className="rounded-2xl border border-slate-200 p-5">
              <SectionTitle
                title="Content"
                description="Control the message, CTA, image, and content type shown to users."
              />
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <ContentInput
                  label="Name"
                  value={draft.name}
                  onChange={(value) => onChange({ name: value })}
                />
                <ContentSelect
                  label="Type"
                  options={["Popup", "Banner", "Announcement", "Maintenance Notice"]}
                  value={draft.type}
                  onChange={(value) => onChange({ type: value as PopupBannerType })}
                />
                <ContentInput
                  label="Title"
                  value={draft.title}
                  onChange={(value) => onChange({ title: value })}
                />
                <ContentInput
                  label="Button Text"
                  value={draft.buttonText}
                  onChange={(value) => onChange({ buttonText: value })}
                />
                <ContentInput
                  label="Button URL"
                  value={draft.buttonUrl}
                  onChange={(value) => onChange({ buttonUrl: value })}
                />
                <ContentSelect
                  label="Status"
                  options={["Draft", "Scheduled", "Active", "Expired", "Archived"]}
                  value={draft.status}
                  onChange={(value) => onStatusChange(value as PopupBannerStatus)}
                />
                <ContentTextArea
                  label="Description"
                  value={draft.description}
                  onChange={(value) => onChange({ description: value })}
                />
                <ThumbnailSourceSelector
                  fileName={draft.imageFileName}
                  mode={draft.imageMode}
                  onChange={(value) => onChange({ image: value })}
                  onFileNameChange={(imageFileName) => onChange({ imageFileName })}
                  onModeChange={(imageMode) =>
                    onChange({ image: "", imageFileName: "", imageMode })
                  }
                  value={draft.image}
                />
              </div>
            </section>

            <div className="space-y-6">
              <section className="rounded-2xl border border-slate-200 p-5">
                <SectionTitle
                  title="Schedule & Location"
                  description="Set where and when this campaign display appears."
                />
                <div className="mt-5 grid gap-5">
                  <ContentSelect
                    label="Location"
                    options={["All Pages", "Homepage", "Pricing", "Dashboard", "Billing", "Blog"]}
                    value={draft.location}
                    onChange={(value) => onChange({ location: value })}
                  />
                  <div className="grid gap-5 sm:grid-cols-2">
                    <ContentInput
                      label="Start Date"
                      type="date"
                      value={draft.startDate}
                      onChange={(value) => onChange({ startDate: value })}
                    />
                    <ContentInput
                      label="End Date"
                      type="date"
                      value={draft.endDate}
                      onChange={(value) => onChange({ endDate: value })}
                    />
                  </div>
                  <ContentSelect
                    label="Dismiss Behavior"
                    options={[
                      "Close Only",
                      "Don't Show Again Today",
                      "Don't Show Again For 7 Days",
                      "Don't Show Again Until Campaign Ends",
                    ]}
                    value={draft.dismissBehavior}
                    onChange={(value) => onChange({ dismissBehavior: value })}
                  />
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 p-5">
                <SectionTitle
                  title="Audience Targeting"
                  description="Choose one or more user segments and paid plans."
                />
                <MultiSelectCheckboxes
                  label="User Targeting"
                  options={["All Users", "Logged-in Users", "Guests Only", "Paid Users", "Free Users"]}
                  value={draft.audiences}
                  onChange={(audiences) => onChange({ audiences })}
                />
                <MultiSelectCheckboxes
                  label="Specific Plans"
                  options={["Starter", "Growth", "Professional", "Enterprise"]}
                  value={draft.plans}
                  onChange={(plans) => onChange({ plans })}
                />
              </section>

              <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <SectionTitle
                  title="Edit History"
                  description="Recent operational update record for audit visibility."
                />
                <div className="mt-4 rounded-xl bg-white p-4 ring-1 ring-slate-200">
                  <p className="text-sm font-bold text-slate-950">{draft.updatedBy}</p>
                  <p className="mt-1 text-sm text-slate-500">Updated {draft.updatedDate}</p>
                  <p className="mt-3 text-xs font-semibold text-slate-400">
                    Permanent deletion is disabled. Use Archive to retain campaign history.
                  </p>
                </div>
              </section>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-5">
            {mode === "edit" ? (
              <>
                <AdminButton onClick={() => onStatusChange("Active")}>Enable</AdminButton>
                <AdminButton onClick={() => onStatusChange("Draft")}>Disable</AdminButton>
                <AdminButton onClick={() => onStatusChange("Archived")}>Archive</AdminButton>
              </>
            ) : null}
            <AdminButton onClick={onCancel} variant="secondary">
              Cancel
            </AdminButton>
            <AdminButton disabled={!draft.name.trim() || !draft.title.trim()} onClick={onSave} variant="primary">
              {mode === "create" ? "Create" : "Save Changes"}
            </AdminButton>
          </div>
        </div>
      </div>
    </div>
  )
}

function MultiSelectCheckboxes({
  label,
  onChange,
  options,
  value,
}: {
  label: string
  onChange: (value: string[]) => void
  options: string[]
  value: string[]
}) {
  const toggle = (option: string) => {
    onChange(
      value.includes(option)
        ? value.filter((item) => item !== option)
        : [...value, option]
    )
  }

  return (
    <div className="mt-5">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {options.map((option) => (
          <label
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 text-sm font-bold transition",
              value.includes(option)
                ? "border-violet-300 bg-violet-50 text-violet-700 ring-4 ring-violet-500/10"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
            )}
            key={option}
          >
            <input
              checked={value.includes(option)}
              className="size-4 accent-violet-600"
              onChange={() => toggle(option)}
              type="checkbox"
            />
            {option}
          </label>
        ))}
      </div>
    </div>
  )
}

function createPopupBannerForm(): PopupBannerForm {
  return {
    audiences: ["All Users"],
    buttonText: "",
    buttonUrl: "",
    description: "",
    dismissBehavior: "Close Only",
    endDate: "2026-06-14",
    id: createBlogId("display-campaign"),
    image: "",
    imageFileName: "",
    imageMode: "url",
    location: "Homepage",
    name: "",
    plans: [],
    startDate: "2026-06-01",
    status: "Draft",
    title: "",
    type: "Popup",
    updatedBy: "Sarah Mitchell",
    updatedDate: "Today",
  }
}

function formatCampaignDate(value: string) {
  const date = new Date(`${value}T00:00:00`)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
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
  const [expandedGroupIds, setExpandedGroupIds] = useState(() =>
    initialNavigationTree.map((group) => group.id)
  )
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
      setExpandedGroupIds((current) => [...current, item.id])
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
    setExpandedGroupIds((current) =>
      current.includes(menuForm.parentId)
        ? current
        : [...current, menuForm.parentId]
    )
    setMenuDialog(null)
  }

  const handleParentChange = (parentName: string) => {
    if (!parentMenu) return

    const targetParent = navigationTree.find((item) => item.name === parentName)
    if (!targetParent || targetParent.id === parentMenu.id) return

    markChanged(moveNavigationChild(navigationTree, selectedId, targetParent.id))
    setExpandedGroupIds((current) =>
      current.includes(targetParent.id)
        ? current
        : [...current, targetParent.id]
    )
  }

  const handleToggleExpand = (groupId: string) => {
    setExpandedGroupIds((current) =>
      current.includes(groupId)
        ? current.filter((id) => id !== groupId)
        : [...current, groupId]
    )
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
    if (navigationTree.some((group) => group.id === id)) {
      setExpandedGroupIds((current) => [...current, nextTree.newId])
    }
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
    setExpandedGroupIds((current) =>
      current.filter((id) => id !== deleteTargetId)
    )

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
          {navigationTree.map((group) => {
            const isExpanded = expandedGroupIds.includes(group.id)

            return (
              <div
                key={group.id}
                draggable
                onDragStart={() => setDraggedId(group.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => handleDrop(group.id)}
              >
                <TreeRow
                  active={selectedId === group.id}
                  childCount={group.children.length}
                  expanded={isExpanded}
                  item={group}
                  level={1}
                  onDelete={() => setDeleteTargetId(group.id)}
                  onDuplicate={() => handleDuplicate(group.id)}
                  onClick={() => setSelectedId(group.id)}
                  onToggleExpand={() => handleToggleExpand(group.id)}
                  onToggleVisibility={() => handleToggleVisibility(group.id)}
                />
                {isExpanded && group.children.length ? (
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
                ) : null}
                {isExpanded && !group.children.length ? (
                  <p className="ml-11 mt-2 text-xs font-semibold text-slate-400">
                    No dropdown items
                  </p>
                ) : null}
              </div>
            )
          })}
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

function normalizeBlogCategoryOrder(items: BlogCategory[]) {
  return items.map((item, index) => ({ ...item, order: index + 1 }))
}

function normalizeFaqOrder(items: FaqItem[]) {
  return items.map((item, index) => ({ ...item, sortOrder: index + 1 }))
}

function createBlogId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
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

function TreeRow({
  active,
  childCount = 0,
  expanded,
  item,
  level,
  onDelete,
  onDuplicate,
  onClick,
  onToggleExpand,
  onToggleVisibility,
}: {
  active: boolean
  childCount?: number
  expanded?: boolean
  item: NavigationChild
  level: 1 | 2
  onDelete: () => void
  onDuplicate: () => void
  onClick: () => void
  onToggleExpand?: () => void
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
        <button
          aria-label={expanded ? `Collapse ${item.name}` : `Expand ${item.name}`}
          className="inline-flex size-6 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white hover:text-slate-950 hover:shadow-sm"
          onClick={(event) => {
            event.stopPropagation()
            onToggleExpand?.()
          }}
          type="button"
        >
          {expanded ? (
            <ChevronDown className="size-4" />
          ) : (
            <ChevronRight className="size-4" />
          )}
        </button>
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
        {level === 1 && childCount ? childCount : item.sortOrder}
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
