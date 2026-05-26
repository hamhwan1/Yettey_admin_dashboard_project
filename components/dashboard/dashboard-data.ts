export type ServiceFilter = "Overall" | "Yettey" | "VPICK"

export const overviewKpis = [
  {
    label: "Total Visitors",
    value: "842,390",
    detail: "+18.4% vs previous period",
    href: "/dashboard/intelligence/visitors",
  },
  {
    label: "New Signups",
    value: "48,210",
    detail: "5.7% visitor signup rate",
  },
  {
    label: "Returning Users",
    value: "156,840",
    detail: "+9.8% repeat activity",
  },
  {
    label: "Paid Users",
    value: "52,480",
    detail: "32.1% of active users",
    href: "/dashboard/intelligence/subscriptions",
  },
  {
    label: "Revenue",
    value: "$286.4K",
    detail: "Open revenue analysis",
    href: "/dashboard/revenue",
  },
  {
    label: "Credit Usage",
    value: "8.2M",
    detail: "74% of monthly capacity",
    href: "/dashboard/intelligence/ai-operations",
  },
  {
    label: "Active Projects",
    value: "19,284",
    detail: "+2,104 this period",
  },
  {
    label: "AI Jobs",
    value: "684,920",
    detail: "96.8% completed",
    href: "/dashboard/intelligence/ai-operations",
  },
]

export const intelligenceInsights = [
  {
    title: "VPICK retention dropped 12% this week",
    area: "Retention",
    impact: "High",
    explanation:
      "The decline is concentrated in Instagram-acquired users who did not create a second project within 48 hours.",
    recommendation:
      "Prioritize onboarding prompts after first export and compare YouTube cohorts against Instagram cohorts.",
    href: "/dashboard/intelligence/retention",
  },
  {
    title: "Thumbnail Studio converts 2.4x higher",
    area: "Product",
    impact: "High",
    explanation:
      "Users who use Thumbnail Studio before their second session show higher paid conversion and stronger D7 retention.",
    recommendation:
      "Promote Thumbnail Studio inside first-project templates and test it as a paywall preview feature.",
    href: "/dashboard/intelligence/features/thumbnail-studio",
  },
  {
    title: "YouTube traffic has highest paid conversion",
    area: "Acquisition",
    impact: "Medium",
    explanation:
      "YouTube visitors arrive with higher intent, create projects faster, and convert to paid more often than paid ads.",
    recommendation:
      "Shift experiment budget toward creator demos and track CAC versus channel-level ARPU.",
    href: "/dashboard/intelligence/acquisition/youtube",
  },
  {
    title: "Credit exhaustion strongly correlates with upgrades",
    area: "Revenue",
    impact: "Medium",
    explanation:
      "Accounts that reach 80% credit usage are 3.1x more likely to upgrade within the same billing cycle.",
    recommendation:
      "Trigger upgrade prompts at 75% usage and route high-usage workspaces to sales follow-up.",
    href: "/dashboard/intelligence/ai-operations",
  },
]

export const advancedFunnel = [
  {
    label: "Visitor",
    value: 842390,
    conversionRate: "100%",
    dropOffRate: "0%",
    avgTimeToNext: "2m",
    sourceComparison: "YouTube visitors engage longest",
    planComparison: "N/A",
  },
  {
    label: "Signup",
    value: 48210,
    conversionRate: "5.7%",
    dropOffRate: "94.3%",
    avgTimeToNext: "11m",
    sourceComparison: "Referral converts 1.4x better",
    planComparison: "Starter trial most common",
  },
  {
    label: "First Project Created",
    value: 39280,
    conversionRate: "81.5%",
    dropOffRate: "18.5%",
    avgTimeToNext: "18m",
    sourceComparison: "Direct traffic fastest",
    planComparison: "Growth users create 2.1 projects avg",
  },
  {
    label: "First AI Generation",
    value: 35420,
    conversionRate: "90.2%",
    dropOffRate: "9.8%",
    avgTimeToNext: "23m",
    sourceComparison: "Google users need more guidance",
    planComparison: "Pro plan has highest generation depth",
  },
  {
    label: "First Export",
    value: 26840,
    conversionRate: "75.8%",
    dropOffRate: "24.2%",
    avgTimeToNext: "1h 12m",
    sourceComparison: "YouTube cohort exports more",
    planComparison: "Enterprise exports fastest",
  },
  {
    label: "Return Visit",
    value: 156840,
    conversionRate: "43.0%",
    dropOffRate: "57.0%",
    avgTimeToNext: "2d",
    sourceComparison: "YouTube retains better than Instagram",
    planComparison: "Users who exported retain 3x longer",
  },
  {
    label: "Paid User",
    value: 52480,
    conversionRate: "33.5%",
    dropOffRate: "66.5%",
    avgTimeToNext: "5d",
    sourceComparison: "Referral CAC is lowest",
    planComparison: "Growth has best ARPU",
  },
  {
    label: "Subscription Renewal",
    value: 41820,
    conversionRate: "79.7%",
    dropOffRate: "20.3%",
    avgTimeToNext: "30d",
    sourceComparison: "Direct users renew reliably",
    planComparison: "Enterprise renewal strongest",
  },
]

export const intelligenceDashboards = {
  visitors: {
    title: "Visitor Analytics Dashboard",
    description:
      "Understand traffic quality, source mix, signup intent, and visitor-to-product activation movement.",
    thesis:
      "Traffic volume is healthy, but quality differs sharply by source. YouTube and referral cohorts deserve more budget than broad paid ads.",
    metrics: [
      ["Qualified Visitors", "312,480"],
      ["Signup Conversion", "5.7%"],
      ["Best Source", "Referral"],
      ["Weakest Source", "Paid Ads"],
    ],
    decisions: [
      "Increase creator-led YouTube campaigns where paid conversion is strongest.",
      "Reduce low-intent paid ad spend until signup-to-activation improves.",
      "Add landing page variants for Google Search visitors with clearer first-project templates.",
    ],
  },
  subscriptions: {
    title: "Subscription Intelligence Dashboard",
    description:
      "Analyze paid conversion, net paid user growth, churn risk, plan movement, and renewal signals.",
    thesis:
      "Paid user growth is positive, but cancellations are clustered around users who hit value friction before first export.",
    metrics: [
      ["Active Paid Users", "52,480"],
      ["Net Paid Users", "+4,180"],
      ["Churn Risk", "Medium"],
      ["Best Plan", "Growth"],
    ],
    decisions: [
      "Improve first export guidance before pushing upgrade prompts.",
      "Route Growth plan users with high credit usage into sales-assist flows.",
      "Monitor cancelled subscribers separately from inactive free users.",
    ],
  },
  "ai-operations": {
    title: "AI Operations Dashboard",
    description:
      "Track queue status, inference latency, fail ratio, retry ratio, GPU utilization, model usage, and credit consumption.",
    thesis:
      "AI operations are stable overall, but VPICK queue latency is becoming a conversion risk during peak upload windows.",
    metrics: [
      ["Queue Latency", "2m 18s"],
      ["Fail Ratio", "0.64%"],
      ["Retry Ratio", "2.8%"],
      ["GPU Utilization", "78%"],
    ],
    decisions: [
      "Add queue alerting when latency exceeds 4 minutes for 15 minutes.",
      "Prioritize VPICK inference queue during marketing campaign spikes.",
      "Create credit exhaustion nudges before users hit hard limits.",
    ],
  },
  retention: {
    title: "Retention Intelligence Dashboard",
    description:
      "Compare feature-based, channel-based, and plan-based retention drivers.",
    thesis:
      "Users who export content retain 3x longer, and YouTube cohorts retain better than Instagram cohorts.",
    metrics: [
      ["D1 Retention", "74%"],
      ["D7 Retention", "51%"],
      ["D30 Retention", "34%"],
      ["Best Retention Driver", "First Export"],
    ],
    decisions: [
      "Move export milestone earlier in onboarding.",
      "Use Thumbnail Studio as a retention loop for returning users.",
      "Build channel-specific lifecycle messages for Instagram cohorts.",
    ],
  },
} as const

export const growthTrend = [
  {
    date: "05-01",
    visitors: 18400,
    signups: 980,
    returningUsers: 4200,
    paidConversions: 260,
  },
  {
    date: "05-05",
    visitors: 22600,
    signups: 1260,
    returningUsers: 5100,
    paidConversions: 330,
  },
  {
    date: "05-10",
    visitors: 24800,
    signups: 1480,
    returningUsers: 6200,
    paidConversions: 390,
  },
  {
    date: "05-15",
    visitors: 29200,
    signups: 1760,
    returningUsers: 7100,
    paidConversions: 470,
  },
  {
    date: "05-20",
    visitors: 31800,
    signups: 1980,
    returningUsers: 7800,
    paidConversions: 540,
  },
  {
    date: "05-25",
    visitors: 35400,
    signups: 2240,
    returningUsers: 8600,
    paidConversions: 610,
  },
  {
    date: "05-30",
    visitors: 38200,
    signups: 2510,
    returningUsers: 9400,
    paidConversions: 690,
  },
]

export const funnel = [
  {
    label: "Visitor",
    value: 842390,
    rate: "100%",
  },
  {
    label: "Signup",
    value: 48210,
    rate: "5.7%",
  },
  {
    label: "Activated User",
    value: 36480,
    rate: "75.7%",
  },
  {
    label: "Returning User",
    value: 156840,
    rate: "43.0%",
  },
  {
    label: "Paid User",
    value: 52480,
    rate: "33.5%",
  },
]

export const acquisitionChannels = [
  {
    channel: "Google Search",
    visitors: 284200,
    signups: 18240,
    paidUsers: 10280,
    conversionRate: "3.62%",
  },
  {
    channel: "Direct",
    visitors: 196400,
    signups: 11620,
    paidUsers: 7210,
    conversionRate: "3.67%",
  },
  {
    channel: "Naver",
    visitors: 124800,
    signups: 6940,
    paidUsers: 3840,
    conversionRate: "3.08%",
  },
  {
    channel: "YouTube",
    visitors: 86200,
    signups: 4920,
    paidUsers: 2510,
    conversionRate: "2.91%",
  },
  {
    channel: "Instagram",
    visitors: 62800,
    signups: 4210,
    paidUsers: 1980,
    conversionRate: "3.15%",
  },
  {
    channel: "Referral",
    visitors: 48200,
    signups: 3860,
    paidUsers: 2420,
    conversionRate: "5.02%",
  },
  {
    channel: "Paid Ads",
    visitors: 39800,
    signups: 2420,
    paidUsers: 1260,
    conversionRate: "3.17%",
  },
]

export const topFeatures = [
  {
    featureName: "AI Video Generator",
    service: "Yettey",
    users: 38420,
    usageCount: 182400,
    creditUsed: 2840000,
    conversionImpact: "High",
  },
  {
    featureName: "Script to Shorts",
    service: "Yettey",
    users: 29180,
    usageCount: 142600,
    creditUsed: 1940000,
    conversionImpact: "High",
  },
  {
    featureName: "Thumbnail Studio",
    service: "VPICK",
    users: 24680,
    usageCount: 118200,
    creditUsed: 820000,
    conversionImpact: "Medium",
  },
  {
    featureName: "Voice Dubbing",
    service: "Yettey",
    users: 21340,
    usageCount: 96400,
    creditUsed: 1360000,
    conversionImpact: "High",
  },
  {
    featureName: "Caption Generator",
    service: "Yettey",
    users: 19840,
    usageCount: 88400,
    creditUsed: 620000,
    conversionImpact: "Medium",
  },
  {
    featureName: "Product Picks",
    service: "VPICK",
    users: 17620,
    usageCount: 81200,
    creditUsed: 430000,
    conversionImpact: "Medium",
  },
  {
    featureName: "Image Upscaler",
    service: "Yettey",
    users: 14980,
    usageCount: 72600,
    creditUsed: 710000,
    conversionImpact: "Low",
  },
  {
    featureName: "Trend Finder",
    service: "VPICK",
    users: 12840,
    usageCount: 68800,
    creditUsed: 390000,
    conversionImpact: "Medium",
  },
  {
    featureName: "Brand Kit",
    service: "Yettey",
    users: 11280,
    usageCount: 52400,
    creditUsed: 280000,
    conversionImpact: "Low",
  },
  {
    featureName: "Auto Publish",
    service: "Yettey",
    users: 9840,
    usageCount: 41800,
    creditUsed: 260000,
    conversionImpact: "Medium",
  },
]

export const retentionTrend = [
  {
    date: "05-01",
    d1: 68,
    d7: 44,
    d30: 28,
    returningUsers: 4200,
  },
  {
    date: "05-08",
    d1: 69,
    d7: 46,
    d30: 29,
    returningUsers: 5600,
  },
  {
    date: "05-15",
    d1: 71,
    d7: 48,
    d30: 31,
    returningUsers: 7100,
  },
  {
    date: "05-22",
    d1: 73,
    d7: 49,
    d30: 32,
    returningUsers: 8400,
  },
  {
    date: "05-30",
    d1: 74,
    d7: 51,
    d30: 34,
    returningUsers: 9400,
  },
]

export const aiJobStatus = [
  {
    label: "Completed",
    value: "662,104",
    detail: "96.8% success rate",
  },
  {
    label: "Processing",
    value: "18,420",
    detail: "Current queue",
  },
  {
    label: "Failed",
    value: "4,396",
    detail: "0.64% failure rate",
  },
  {
    label: "Average Processing Time",
    value: "2m 18s",
    detail: "-14s vs previous period",
  },
]

export const recentActivity = [
  {
    type: "New Signup",
    message: "Studio Alpha joined Yettey Growth",
    time: "3 min ago",
  },
  {
    type: "Payment Success",
    message: "Cloudike Team renewed Pro subscription",
    time: "12 min ago",
  },
  {
    type: "Payment Failed",
    message: "Media Lab invoice payment failed",
    time: "28 min ago",
  },
  {
    type: "Credit Exhausted",
    message: "Creator Pack used 100% monthly credits",
    time: "42 min ago",
  },
  {
    type: "AI Job Failed",
    message: "Batch render job failed on retry",
    time: "1 hr ago",
  },
]

export const alerts = [
  {
    title: "Failed Payments",
    value: "38",
    severity: "High",
  },
  {
    title: "High Credit Usage",
    value: "12 accounts",
    severity: "Medium",
  },
  {
    title: "AI Job Failure Rate",
    value: "0.64%",
    severity: "Low",
  },
  {
    title: "Storage Limit Warning",
    value: "7 workspaces",
    severity: "Medium",
  },
]

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value)
}
