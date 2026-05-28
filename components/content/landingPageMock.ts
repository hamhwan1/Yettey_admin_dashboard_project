export type LandingPageStatus = "Published" | "Draft" | "Scheduled"

export type LandingProduct = "YETTEY" | "VPICK" | "Shared/Common"

export type LandingImageAsset = {
  alt: string
  id: string
  label: string
  type: "Hero" | "OG" | "Banner" | "Feature"
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

export type LandingPageRow = {
  contentBlocks: LandingContentBlock[]
  id: string
  images: LandingImageAsset[]
  keywords: string
  lastUpdated: string
  locale: string
  metaDescription: string
  metaTitle: string
  name: string
  ogDescription: string
  ogImage: string
  ogTitle: string
  product: LandingProduct
  shortDescription: string
  status: LandingPageStatus
  updatedBy: string
  url: string
}

const commonImages = (id: string, label: string): LandingImageAsset[] => [
  {
    alt: `${label} hero visual`,
    id: `${id}-hero`,
    label: "Hero image",
    type: "Hero",
    url: `https://cdn.yettey.com/landing/${id}/hero.png`,
  },
  {
    alt: `${label} social sharing image`,
    id: `${id}-og`,
    label: "OG image",
    type: "OG",
    url: `https://cdn.yettey.com/landing/${id}/og.png`,
  },
  {
    alt: `${label} campaign banner`,
    id: `${id}-banner`,
    label: "Banner image",
    type: "Banner",
    url: `https://cdn.yettey.com/landing/${id}/banner.png`,
  },
  {
    alt: `${label} feature thumbnail`,
    id: `${id}-feature-thumbnail`,
    label: "Feature thumbnail",
    type: "Feature",
    url: `https://cdn.yettey.com/landing/${id}/feature-thumbnail.png`,
  },
]

export const landingPages: LandingPageRow[] = [
  {
    contentBlocks: [
      {
        description: "Primary headline, product promise, and homepage CTA.",
        fields: [
          { label: "Title", value: "AI media workflows for modern teams" },
          {
            label: "Subtitle",
            value:
              "Create, manage, and publish campaign assets from one workspace.",
          },
          { label: "Primary CTA", value: "Start creating" },
          { label: "Secondary CTA", value: "View workflows" },
        ],
        name: "Hero",
        status: "Ready",
      },
      {
        description: "Homepage feature cards for platform positioning.",
        fields: [
          { label: "Feature 1", value: "Manage every asset in one DAM" },
          { label: "Feature 2", value: "Generate campaign visuals with AI" },
          { label: "Feature 3", value: "Turn long videos into short clips" },
        ],
        name: "Features",
        status: "Ready",
      },
      {
        description: "Short FAQ answers used near the end of the homepage.",
        fields: [
          { label: "FAQ 1", value: "Can I use Yettey and VPICK together?" },
          { label: "FAQ 2", value: "Can my team manage shared assets?" },
        ],
        name: "FAQ",
        status: "Needs Review",
      },
      {
        description: "Final conversion copy before footer.",
        fields: [
          { label: "CTA Title", value: "Build your AI media workspace today" },
          { label: "CTA Button", value: "Get started" },
        ],
        name: "CTA",
        status: "Ready",
      },
    ],
    id: "homepage",
    images: commonImages("homepage", "Homepage"),
    keywords: "ai media workflow, content operations, yettey, vpick",
    lastUpdated: "May 28, 2026",
    locale: "en-US",
    metaDescription:
      "Create, manage, and publish AI-powered media workflows for modern teams.",
    metaTitle: "Yettey - AI media workflow platform",
    name: "Homepage",
    ogDescription:
      "The workspace for AI-powered content creation, assets, and shortform workflows.",
    ogImage: "https://cdn.yettey.com/landing/homepage/og.png",
    ogTitle: "Yettey - AI media workflows",
    product: "Shared/Common",
    shortDescription: "Primary product homepage for platform positioning.",
    status: "Published",
    updatedBy: "Sarah Mitchell",
    url: "/",
  },
  {
    contentBlocks: [
      {
        description: "Pricing headline and plan selection copy.",
        fields: [
          { label: "Title", value: "Choose the plan that fits your workflow" },
          {
            label: "Subtitle",
            value:
              "Compare credits, projects, seats, and monthly subscription pricing.",
          },
          { label: "Primary CTA", value: "Start with Starter" },
          { label: "Short Description", value: "Yettey and VPICK pricing overview" },
        ],
        name: "Hero",
        status: "Ready",
      },
      {
        description: "Plan cards for current subscription pricing.",
        fields: [
          { label: "Yettey Starter", value: "KRW 49,000 / month" },
          { label: "Yettey Growth", value: "KRW 99,000 / month" },
          { label: "Yettey Pro", value: "KRW 249,000 / month" },
          { label: "VPICK Basic", value: "KRW 20,000 / month VAT included" },
          {
            label: "VPICK Professional",
            value: "KRW 40,000 / month VAT included",
          },
        ],
        name: "Pricing",
        status: "Ready",
      },
      {
        description: "FAQ content for billing, credits, and plan differences.",
        fields: [
          { label: "FAQ 1", value: "Can I buy extra credits?" },
          { label: "FAQ 2", value: "Do purchased credits expire monthly?" },
          { label: "FAQ 3", value: "Can I change plans later?" },
        ],
        name: "FAQ",
        status: "Ready",
      },
    ],
    id: "pricing",
    images: commonImages("pricing", "Pricing"),
    keywords: "yettey pricing, vpick pricing, ai credits, subscription plans",
    lastUpdated: "May 27, 2026",
    locale: "ko-KR",
    metaDescription:
      "Compare Yettey and VPICK plans, credits, storage, and subscription pricing.",
    metaTitle: "Pricing - Yettey",
    name: "Pricing",
    ogDescription:
      "Review current Yettey and VPICK monthly plans, included credits, and product limits.",
    ogImage: "https://cdn.yettey.com/landing/pricing/og.png",
    ogTitle: "Yettey Pricing and VPICK Pricing",
    product: "Shared/Common",
    shortDescription: "Pricing and plan comparison page.",
    status: "Published",
    updatedBy: "Minjun Ops",
    url: "/pricing",
  },
  {
    contentBlocks: [
      {
        description: "VPICK product headline and video workflow promise.",
        fields: [
          { label: "Title", value: "Turn long videos into short clips faster" },
          {
            label: "Subtitle",
            value:
              "Analyze uploads, find highlight moments, and create shortform content.",
          },
          { label: "Primary CTA", value: "Try VPICK" },
          { label: "Short Description", value: "AI video analysis for creators" },
        ],
        name: "Hero",
        status: "Ready",
      },
      {
        description: "VPICK-specific feature cards.",
        fields: [
          { label: "Feature 1", value: "Video analysis count tracking" },
          { label: "Feature 2", value: "Shortform generation workflow" },
          { label: "Feature 3", value: "Credit-based processing" },
        ],
        name: "Features",
        status: "Ready",
      },
      {
        description: "Workflow copy for video upload to short clip export.",
        fields: [
          { label: "Step 1", value: "Upload long-form video" },
          { label: "Step 2", value: "Analyze key moments" },
          { label: "Step 3", value: "Generate short clips" },
        ],
        name: "Workflow",
        status: "Needs Review",
      },
    ],
    id: "vpick",
    images: commonImages("vpick", "VPICK Landing"),
    keywords: "vpick, shortform generator, video analysis, ai clips",
    lastUpdated: "May 25, 2026",
    locale: "en-US",
    metaDescription:
      "Analyze videos and create short clips faster with VPICK AI workflows.",
    metaTitle: "VPICK - AI shortform video workflow",
    name: "VPICK Landing",
    ogDescription:
      "VPICK helps teams analyze long videos and create shortform clips with AI.",
    ogImage: "https://cdn.yettey.com/landing/vpick/og.png",
    ogTitle: "VPICK - AI shortform workflow",
    product: "VPICK",
    shortDescription: "VPICK product landing page for video creators.",
    status: "Draft",
    updatedBy: "Growth Team",
    url: "/vpick",
  },
  {
    contentBlocks: [
      {
        description: "SEO landing hero for AI video generation intent.",
        fields: [
          { label: "Title", value: "Generate AI videos from one workspace" },
          {
            label: "Subtitle",
            value:
              "Create marketing videos, thumbnails, and campaign content with AI.",
          },
          { label: "Primary CTA", value: "Generate a video" },
          { label: "Short Description", value: "AI video generator landing page" },
        ],
        name: "Hero",
        status: "Ready",
      },
      {
        description: "Lightweight benefit cards for search visitors.",
        fields: [
          { label: "Benefit 1", value: "AI-assisted video creation" },
          { label: "Benefit 2", value: "Reusable media assets" },
          { label: "Benefit 3", value: "Campaign-ready exports" },
        ],
        name: "Features",
        status: "Needs Review",
      },
      {
        description: "Search-intent FAQ section.",
        fields: [
          { label: "FAQ 1", value: "Can I create videos without editing skills?" },
          { label: "FAQ 2", value: "Can I reuse generated assets?" },
        ],
        name: "FAQ",
        status: "Ready",
      },
    ],
    id: "ai-video-generator",
    images: commonImages("ai-video-generator", "AI Video Generator"),
    keywords: "ai video generator, ai marketing video, yettey ai",
    lastUpdated: "May 24, 2026",
    locale: "en-US",
    metaDescription:
      "Generate AI-powered video content and marketing assets from one workspace.",
    metaTitle: "AI Video Generator - Yettey",
    name: "AI Video Generator",
    ogDescription:
      "Generate AI-powered video content, thumbnails, and campaign assets in Yettey.",
    ogImage: "https://cdn.yettey.com/landing/ai-video-generator/og.png",
    ogTitle: "AI Video Generator for marketing teams",
    product: "YETTEY",
    shortDescription: "SEO landing page for AI video generation intent.",
    status: "Draft",
    updatedBy: "Content Ops",
    url: "/ai-video-generator",
  },
  {
    contentBlocks: [
      {
        description: "Seasonal campaign message and promotional CTA.",
        fields: [
          { label: "Title", value: "Summer content production campaign" },
          {
            label: "Subtitle",
            value:
              "Limited campaign benefits for teams scaling AI media workflows.",
          },
          { label: "Primary CTA", value: "Claim campaign benefit" },
          { label: "Banner Text", value: "Available through June 2026" },
        ],
        name: "Hero",
        status: "Needs Review",
      },
      {
        description: "Campaign-specific benefits and eligibility copy.",
        fields: [
          { label: "Benefit 1", value: "Extra credits for campaign teams" },
          { label: "Benefit 2", value: "Priority onboarding support" },
          { label: "Benefit 3", value: "Template setup assistance" },
        ],
        name: "Features",
        status: "Ready",
      },
      {
        description: "Campaign closing CTA.",
        fields: [
          { label: "CTA Title", value: "Launch summer campaigns faster" },
          { label: "CTA Button", value: "Contact sales" },
        ],
        name: "CTA",
        status: "Ready",
      },
    ],
    id: "summer-event",
    images: commonImages("summer-event", "Summer Event Campaign"),
    keywords: "summer campaign, ai media promotion, yettey event",
    lastUpdated: "Jun 01, 2026",
    locale: "ko-KR",
    metaDescription:
      "Summer campaign offers for teams creating AI-powered media content.",
    metaTitle: "Summer Event Campaign - Yettey",
    name: "Summer Event Campaign",
    ogDescription:
      "Campaign benefits for teams creating AI-powered media content this summer.",
    ogImage: "https://cdn.yettey.com/landing/summer-event/og.png",
    ogTitle: "Yettey Summer Event Campaign",
    product: "YETTEY",
    shortDescription: "Seasonal campaign page for promotion traffic.",
    status: "Scheduled",
    updatedBy: "Sarah Mitchell",
    url: "/campaign/summer-event",
  },
]

export function getLandingPage(id: string) {
  return landingPages.find((page) => page.id === id) ?? null
}
