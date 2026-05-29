export type LandingPageStatus = "Published" | "Draft" | "Scheduled"

export type LandingProduct = "YETTEY" | "VPICK" | "Shared/Common"

export type SeoLanguage = "English" | "Korean"

export type LandingSeoSettings = {
  keywords: string
  metaDescription: string
  metaTitle: string
}

export type LandingPageRow = {
  id: string
  lastUpdated: string
  liveUrl: string
  locale: string
  name: string
  product: LandingProduct
  seo: Record<SeoLanguage, LandingSeoSettings>
  status: LandingPageStatus
  updatedBy: string
  url: string
}

export const seoLanguages: SeoLanguage[] = ["English", "Korean"]

export const landingPages: LandingPageRow[] = [
  {
    id: "homepage",
    lastUpdated: "May 28, 2026",
    liveUrl: "https://yettey.ai",
    locale: "en-US",
    name: "Homepage",
    product: "Shared/Common",
    seo: {
      English: {
        keywords: "ai media workflow, content operations, yettey, vpick",
        metaDescription:
          "Create, manage, and publish AI-powered media workflows for modern teams.",
        metaTitle: "Yettey - AI media workflow platform",
      },
      Korean: {
        keywords: "AI 미디어 워크플로우, 콘텐츠 운영, 예티, 브이픽",
        metaDescription:
          "팀을 위한 AI 기반 미디어 제작, 관리, 배포 워크플로우를 운영하세요.",
        metaTitle: "Yettey - AI 미디어 워크플로우 플랫폼",
      },
    },
    status: "Published",
    updatedBy: "Sarah Mitchell",
    url: "/",
  },
  {
    id: "pricing",
    lastUpdated: "May 27, 2026",
    liveUrl: "https://yettey.ai/pricing",
    locale: "ko-KR",
    name: "Pricing",
    product: "Shared/Common",
    seo: {
      English: {
        keywords: "yettey pricing, vpick pricing, ai credits, subscription plans",
        metaDescription:
          "Compare Yettey and VPICK plans, credits, storage, and subscription pricing.",
        metaTitle: "Pricing - Yettey",
      },
      Korean: {
        keywords: "예티 요금제, 브이픽 요금제, AI 크레딧, 구독 플랜",
        metaDescription:
          "Yettey와 VPICK 요금제, 크레딧, 저장 용량, 구독 가격을 비교하세요.",
        metaTitle: "요금제 - Yettey",
      },
    },
    status: "Published",
    updatedBy: "Minjun Ops",
    url: "/pricing",
  },
  {
    id: "vpick",
    lastUpdated: "May 25, 2026",
    liveUrl: "https://vpick.ai",
    locale: "en-US",
    name: "VPICK Landing",
    product: "VPICK",
    seo: {
      English: {
        keywords: "vpick, shortform generator, video analysis, ai clips",
        metaDescription:
          "Analyze videos and create short clips faster with VPICK AI workflows.",
        metaTitle: "VPICK - AI shortform video workflow",
      },
      Korean: {
        keywords: "브이픽, 숏폼 생성기, 영상 분석, AI 클립",
        metaDescription:
          "VPICK AI 워크플로우로 영상을 분석하고 숏폼 클립을 더 빠르게 제작하세요.",
        metaTitle: "VPICK - AI 숏폼 영상 워크플로우",
      },
    },
    status: "Draft",
    updatedBy: "Growth Team",
    url: "/vpick",
  },
  {
    id: "ai-video-generator",
    lastUpdated: "May 24, 2026",
    liveUrl: "https://yettey.ai/ai-video-generator",
    locale: "en-US",
    name: "AI Video Generator",
    product: "YETTEY",
    seo: {
      English: {
        keywords: "ai video generator, ai marketing video, yettey ai",
        metaDescription:
          "Generate AI-powered video content and marketing assets from one workspace.",
        metaTitle: "AI Video Generator - Yettey",
      },
      Korean: {
        keywords: "AI 영상 생성기, AI 마케팅 영상, 예티 AI",
        metaDescription:
          "하나의 워크스페이스에서 AI 기반 영상 콘텐츠와 마케팅 에셋을 생성하세요.",
        metaTitle: "AI 영상 생성기 - Yettey",
      },
    },
    status: "Draft",
    updatedBy: "Content Ops",
    url: "/ai-video-generator",
  },
  {
    id: "summer-event",
    lastUpdated: "Jun 01, 2026",
    liveUrl: "https://yettey.ai/campaign/summer-event",
    locale: "ko-KR",
    name: "Summer Event Campaign",
    product: "YETTEY",
    seo: {
      English: {
        keywords: "summer campaign, ai media promotion, yettey event",
        metaDescription:
          "Summer campaign offers for teams creating AI-powered media content.",
        metaTitle: "Summer Event Campaign - Yettey",
      },
      Korean: {
        keywords: "여름 캠페인, AI 미디어 프로모션, 예티 이벤트",
        metaDescription:
          "AI 기반 미디어 콘텐츠를 제작하는 팀을 위한 여름 캠페인 혜택입니다.",
        metaTitle: "여름 이벤트 캠페인 - Yettey",
      },
    },
    status: "Scheduled",
    updatedBy: "Sarah Mitchell",
    url: "/campaign/summer-event",
  },
]

export function getLandingPage(id: string) {
  return landingPages.find((page) => page.id === id) ?? null
}

export function getPrimarySeo(page: LandingPageRow) {
  return page.seo[page.locale === "ko-KR" ? "Korean" : "English"]
}
