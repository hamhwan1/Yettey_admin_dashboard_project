export type LandingPageStatus = "Published" | "Draft" | "Scheduled"

export type LandingPageRow = {
  id: string
  lastUpdated: string
  locale: string
  metaDescription: string
  metaTitle: string
  name: string
  shortDescription: string
  status: LandingPageStatus
  updatedBy: string
  url: string
}

export type LandingContentBlock = {
  description: string
  fields: {
    label: string
    value: string
  }[]
  name: string
  status: "Ready" | "Needs Review"
}

export const landingPages: LandingPageRow[] = [
  {
    id: "homepage",
    lastUpdated: "May 28, 2026",
    locale: "en-US",
    metaDescription:
      "Create, manage, and publish AI-powered media workflows for modern teams.",
    metaTitle: "Yettey - AI media workflow platform",
    name: "Homepage",
    shortDescription: "Primary product homepage for platform positioning.",
    status: "Published",
    updatedBy: "Sarah Mitchell",
    url: "/",
  },
  {
    id: "pricing",
    lastUpdated: "May 27, 2026",
    locale: "ko-KR",
    metaDescription:
      "Compare Yettey and VPICK plans, credits, storage, and subscription pricing.",
    metaTitle: "Pricing - Yettey",
    name: "Pricing",
    shortDescription: "Pricing and plan comparison page.",
    status: "Published",
    updatedBy: "Minjun Ops",
    url: "/pricing",
  },
  {
    id: "vpick",
    lastUpdated: "May 25, 2026",
    locale: "en-US",
    metaDescription:
      "Analyze videos and create short clips faster with VPICK AI workflows.",
    metaTitle: "VPICK - AI shortform video workflow",
    name: "VPICK Landing",
    shortDescription: "VPICK product landing page for video creators.",
    status: "Draft",
    updatedBy: "Growth Team",
    url: "/vpick",
  },
  {
    id: "ai-video-generator",
    lastUpdated: "May 24, 2026",
    locale: "en-US",
    metaDescription:
      "Generate AI-powered video content and marketing assets from one workspace.",
    metaTitle: "AI Video Generator - Yettey",
    name: "AI Video Generator",
    shortDescription: "SEO landing page for AI video generation intent.",
    status: "Draft",
    updatedBy: "Content Ops",
    url: "/ai-video-generator",
  },
  {
    id: "summer-event",
    lastUpdated: "Jun 01, 2026",
    locale: "ko-KR",
    metaDescription:
      "Summer campaign offers for teams creating AI-powered media content.",
    metaTitle: "Summer Event Campaign - Yettey",
    name: "Summer Event Campaign",
    shortDescription: "Seasonal campaign page for promotion traffic.",
    status: "Scheduled",
    updatedBy: "Sarah Mitchell",
    url: "/campaign/summer-event",
  },
]

export const landingContentBlocks: LandingContentBlock[] = [
  {
    description: "Main headline, subcopy, primary CTA, and hero media.",
    fields: [
      { label: "Title", value: "AI media workflows for modern teams" },
      {
        label: "Description",
        value: "Create, manage, and publish content with one AI-powered workspace.",
      },
      { label: "CTA Button", value: "Start creating" },
      { label: "Banner Text", value: "New VPICK workflow is now available." },
    ],
    name: "Hero",
    status: "Ready",
  },
  {
    description: "Feature cards used for conversion-focused product messaging.",
    fields: [
      { label: "Feature Card 1", value: "Manage assets in one DAM workspace" },
      { label: "Feature Card 2", value: "Generate campaign images with AI" },
      { label: "Feature Card 3", value: "Create short clips from long videos" },
    ],
    name: "Features",
    status: "Ready",
  },
  {
    description: "Step-based flow for user education and onboarding.",
    fields: [
      { label: "Step 1", value: "Upload content" },
      { label: "Step 2", value: "Create with AI" },
      { label: "Step 3", value: "Publish or export" },
    ],
    name: "Workflow",
    status: "Needs Review",
  },
  {
    description: "Customer proof, creator quotes, and brand trust content.",
    fields: [
      { label: "Quote", value: "Yettey helps our team ship campaigns faster." },
      { label: "Customer Name", value: "Studio Alpha" },
      { label: "Customer Role", value: "Marketing Operations" },
    ],
    name: "Testimonials",
    status: "Ready",
  },
  {
    description: "Plan messaging, pricing CTA, and conversion copy.",
    fields: [
      { label: "Pricing Headline", value: "Choose the workflow that fits your team" },
      { label: "Pricing CTA", value: "Compare plans" },
    ],
    name: "Pricing",
    status: "Ready",
  },
  {
    description: "Common objections and support answers.",
    fields: [
      { label: "FAQ 1", value: "Can I manage both Yettey and VPICK content?" },
      { label: "FAQ 2", value: "Can I upload my own media assets?" },
    ],
    name: "FAQ",
    status: "Ready",
  },
  {
    description: "Final conversion section before footer.",
    fields: [
      { label: "CTA Title", value: "Start building your AI media workflow" },
      { label: "CTA Button", value: "Get started" },
    ],
    name: "CTA",
    status: "Needs Review",
  },
  {
    description: "Footer text, legal links, and social links.",
    fields: [
      { label: "Footer Headline", value: "Yettey" },
      { label: "Support Link", value: "/help" },
    ],
    name: "Footer",
    status: "Ready",
  },
]

export function getLandingPage(id: string) {
  return landingPages.find((page) => page.id === id) ?? landingPages[0]
}
