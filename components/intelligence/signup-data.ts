export const signupTrend = [
  { date: "05-01", visitors: 18400, signupStarted: 1480, signups: 980, paidUsers: 260, signupConversion: 5.3 },
  { date: "05-05", visitors: 22600, signupStarted: 1800, signups: 1260, paidUsers: 330, signupConversion: 5.6 },
  { date: "05-10", visitors: 24800, signupStarted: 2120, signups: 1480, paidUsers: 390, signupConversion: 6.0 },
  { date: "05-15", visitors: 29200, signupStarted: 2480, signups: 1760, paidUsers: 470, signupConversion: 6.0 },
  { date: "05-20", visitors: 31800, signupStarted: 2800, signups: 1980, paidUsers: 540, signupConversion: 6.2 },
  { date: "05-25", visitors: 35400, signupStarted: 3160, signups: 2240, paidUsers: 610, signupConversion: 6.3 },
  { date: "05-30", visitors: 38200, signupStarted: 3580, signups: 2510, paidUsers: 690, signupConversion: 6.6 },
]

export const signupSourceBreakdown = [
  {
    source: "Organic",
    group: "Organic",
    visitors: 226000,
    signups: 15380,
    signupConversion: "6.81%",
    paidConversion: "3.62%",
    retention: "54%",
  },
  {
    source: "YouTube",
    group: "Organic",
    visitors: 86200,
    signups: 4920,
    signupConversion: "5.71%",
    paidConversion: "4.91%",
    retention: "61%",
  },
  {
    source: "Direct",
    group: "Direct",
    visitors: 126400,
    signups: 7620,
    signupConversion: "6.03%",
    paidConversion: "3.67%",
    retention: "52%",
  },
  {
    source: "Referral",
    group: "Referral",
    visitors: 48200,
    signups: 3860,
    signupConversion: "8.01%",
    paidConversion: "5.02%",
    retention: "58%",
  },
  {
    source: "Instagram",
    group: "Paid",
    visitors: 62800,
    signups: 4210,
    signupConversion: "6.70%",
    paidConversion: "3.15%",
    retention: "38%",
  },
  {
    source: "Google Search",
    group: "Organic",
    visitors: 184200,
    signups: 12840,
    signupConversion: "6.97%",
    paidConversion: "3.84%",
    retention: "51%",
  },
  {
    source: "Paid Ads",
    group: "Paid",
    visitors: 39800,
    signups: 2420,
    signupConversion: "6.08%",
    paidConversion: "3.17%",
    retention: "34%",
  },
  {
    source: "Unknown",
    group: "Unknown",
    visitors: 28400,
    signups: 980,
    signupConversion: "3.45%",
    paidConversion: "1.34%",
    retention: "29%",
  },
]

export const utmPerformance = [
  {
    utmSource: "youtube",
    utmMedium: "creator",
    utmCampaign: "ai-shorts-demo",
    utmContent: "long-form-review",
    visitors: 38200,
    signups: 2460,
    signupConversion: "6.44%",
    paidConversion: "4.88%",
  },
  {
    utmSource: "google",
    utmMedium: "organic",
    utmCampaign: "seo-ai-video",
    utmContent: "how-to-guide",
    visitors: 62400,
    signups: 4180,
    signupConversion: "6.70%",
    paidConversion: "3.76%",
  },
  {
    utmSource: "instagram",
    utmMedium: "paid-social",
    utmCampaign: "thumbnail-launch",
    utmContent: "carousel-a",
    visitors: 28400,
    signups: 1920,
    signupConversion: "6.76%",
    paidConversion: "2.91%",
  },
  {
    utmSource: "naver",
    utmMedium: "organic",
    utmCampaign: "creator-tools",
    utmContent: "blog-search",
    visitors: 35800,
    signups: 2840,
    signupConversion: "7.93%",
    paidConversion: "3.22%",
  },
  {
    utmSource: "kakao",
    utmMedium: "cpc",
    utmCampaign: "vpick-product-picks",
    utmContent: "feed-video",
    visitors: 19400,
    signups: 1160,
    signupConversion: "5.98%",
    paidConversion: "2.74%",
  },
]

export const signupTrafficGroups = [
  { group: "Organic Traffic", visitors: 556000, signups: 36960, retention: 53 },
  { group: "Paid Traffic", visitors: 143800, signups: 9110, retention: 36 },
  { group: "Referral Traffic", visitors: 48200, signups: 3860, retention: 58 },
]

export const monthlySignupAnalytics = [
  { month: "Jan", signups: 32400, organic: 22600, paid: 6100, referral: 3700 },
  { month: "Feb", signups: 35600, organic: 24800, paid: 6900, referral: 3900 },
  { month: "Mar", signups: 38900, organic: 27100, paid: 7700, referral: 4100 },
  { month: "Apr", signups: 42100, organic: 29600, paid: 8100, referral: 4400 },
  { month: "May", signups: 48210, organic: 33380, paid: 9730, referral: 5100 },
]

export const regionBreakdown = [
  { country: "South Korea", region: "Seoul", signups: 18240, conversion: "7.82%", paidConversion: "4.42%" },
  { country: "United States", region: "California", signups: 8420, conversion: "5.91%", paidConversion: "3.82%" },
  { country: "Japan", region: "Tokyo", signups: 6180, conversion: "6.12%", paidConversion: "3.41%" },
  { country: "Vietnam", region: "Ho Chi Minh City", signups: 3840, conversion: "5.74%", paidConversion: "2.96%" },
  { country: "Indonesia", region: "Jakarta", signups: 2920, conversion: "5.31%", paidConversion: "2.64%" },
]

export const landingPagePerformance = [
  {
    landingPage: "/pricing",
    intent: "Pricing intent",
    visitors: 86200,
    signups: 6420,
    signupConversion: "7.45%",
    paidConversion: "5.28%",
  },
  {
    landingPage: "/vpick-shortform",
    intent: "VPICK creator workflow",
    visitors: 124800,
    signups: 9360,
    signupConversion: "7.50%",
    paidConversion: "4.18%",
  },
  {
    landingPage: "/studio",
    intent: "Product workspace",
    visitors: 284200,
    signups: 14820,
    signupConversion: "5.21%",
    paidConversion: "2.94%",
  },
  {
    landingPage: "/ai-video-generator",
    intent: "AI generation intent",
    visitors: 62800,
    signups: 5210,
    signupConversion: "8.30%",
    paidConversion: "4.92%",
  },
  {
    landingPage: "/thumbnail-generator",
    intent: "Image workflow intent",
    visitors: 54800,
    signups: 4180,
    signupConversion: "7.63%",
    paidConversion: "4.34%",
  },
]

export const loginProviderAnalytics = [
  {
    provider: "Google",
    signupStarted: 28400,
    signups: 21460,
    share: "44.5%",
    signupCompletion: "75.6%",
    paidConversion: "4.20%",
  },
  {
    provider: "Kakao",
    signupStarted: 13800,
    signups: 9460,
    share: "19.6%",
    signupCompletion: "68.6%",
    paidConversion: "3.42%",
  },
  {
    provider: "Naver",
    signupStarted: 12200,
    signups: 8840,
    share: "18.3%",
    signupCompletion: "72.5%",
    paidConversion: "3.36%",
  },
  {
    provider: "Email",
    signupStarted: 14020,
    signups: 8450,
    share: "17.6%",
    signupCompletion: "60.3%",
    paidConversion: "2.88%",
  },
]

export const signupConversionDrivers = [
  {
    title: "Referral has the strongest intent",
    metric: "8.01%",
    detail: "Referral visitors convert to signup at the highest rate and keep strong paid conversion.",
    tone: "positive",
  },
  {
    title: "/ai-video-generator is the best landing page",
    metric: "8.30%",
    detail: "Problem-aware visitors enter with a clear job-to-be-done and complete signup faster.",
    tone: "positive",
  },
  {
    title: "Unknown source needs attribution cleanup",
    metric: "3.45%",
    detail: "Unknown traffic has the weakest conversion and should be fixed with UTM enforcement.",
    tone: "negative",
  },
]

export const signupFunnel = [
  { stage: "Visitor", value: 842390, conversion: "100%", dropOff: "0%" },
  { stage: "Signup Started", value: 68420, conversion: "8.1%", dropOff: "91.9%" },
  { stage: "Signup Completed", value: 48210, conversion: "70.5%", dropOff: "29.5%" },
]
