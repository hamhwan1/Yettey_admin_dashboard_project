export type ServiceFilter = "Overall" | "Yettey" | "VPICK"

export const overviewKpis = [
  {
    label: "Total Visitors",
    value: "842,390",
    detail: "+18.4% vs previous period",
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
  },
]

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
