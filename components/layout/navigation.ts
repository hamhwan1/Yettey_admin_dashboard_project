import type { LucideIcon } from "lucide-react"
import {
  BarChart3,
  BookOpen,
  CreditCard,
  FileQuestion,
  Files,
  Flag,
  Image,
  LayoutDashboard,
  ListChecks,
  Megaphone,
  ReceiptText,
  TrendingUp,
  Search,
  Settings,
  Sparkles,
  UserPlus,
  Users,
} from "lucide-react"

export type TopMenuKey =
  | "dashboards"
  | "users"
  | "content"
  | "analytics"
  | "billing"
  | "settings"

export type SidebarItem = {
  title: string
  href?: string
  icon?: LucideIcon
  children?: SidebarItem[]
}

export type TopMenuItem = {
  key: TopMenuKey
  title: string
  href: string
  icon: LucideIcon
}

export const topNavigation: TopMenuItem[] = [
  {
    key: "dashboards",
    title: "Dashboards",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    key: "users",
    title: "Users",
    href: "/users",
    icon: Users,
  },
  {
    key: "content",
    title: "Content",
    href: "/content/landing-pages",
    icon: Files,
  },
  {
    key: "analytics",
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    key: "billing",
    title: "Billing",
    href: "/billing",
    icon: CreditCard,
  },
  {
    key: "settings",
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

export const sidebarNavigation: Record<TopMenuKey, SidebarItem[]> = {
  dashboards: [
    {
      title: "Overview",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Signups",
      href: "/dashboard/intelligence/signups",
      icon: UserPlus,
    },
    {
      title: "Revenue",
      href: "/dashboard/revenue",
      icon: TrendingUp,
    },
  ],
  users: [
    {
      title: "Users",
      href: "/users",
      icon: Users,
    },
  ],
  content: [
    {
      title: "Landing Pages",
      href: "/content/landing-pages",
      icon: Flag,
    },
    {
      title: "Blog",
      href: "/content/blog",
      icon: BookOpen,
    },
    {
      title: "Guides & FAQ",
      href: "/content/guides-faq",
      icon: FileQuestion,
    },
    {
      title: "Popups & Banners",
      href: "/content/popups-banners",
      icon: Megaphone,
    },
    {
      title: "SEO",
      href: "/content/seo",
      icon: Search,
    },
    {
      title: "Media Library",
      href: "/content/media-library",
      icon: Image,
    },
  ],
  analytics: [
    {
      title: "Overview",
      href: "/analytics",
      icon: BarChart3,
    },
  ],
  billing: [
    {
      title: "Overview",
      href: "/billing",
      icon: LayoutDashboard,
    },
    {
      title: "Plans",
      href: "/billing/plans",
      icon: Sparkles,
      children: [
        {
          title: "Yettey",
          href: "/billing/plans/yettey",
        },
        {
          title: "Vpick",
          href: "/billing/plans/vpick",
        },
      ],
    },
    {
      title: "Features",
      href: "/billing/features",
      icon: ListChecks,
    },
    {
      title: "Billing Rules",
      href: "/billing/billing-rules",
      icon: ReceiptText,
    },
    {
      title: "Subscriptions",
      href: "/billing/subscriptions",
      icon: CreditCard,
    },
    {
      title: "Logs",
      href: "/billing/logs",
      icon: Files,
    },
  ],
  settings: [
    {
      title: "Overview",
      href: "/settings",
      icon: Settings,
    },
  ],
}

export function getActiveTopMenu(pathname: string): TopMenuItem {
  if (pathname.startsWith("/users")) {
    return topNavigation[1]
  }

  if (pathname.startsWith("/content")) {
    return topNavigation[2]
  }

  if (pathname.startsWith("/analytics")) {
    return topNavigation[3]
  }

  if (pathname.startsWith("/billing")) {
    return topNavigation[4]
  }

  if (pathname.startsWith("/settings")) {
    return topNavigation[5]
  }

  return topNavigation[0]
}
