import type { LucideIcon } from "lucide-react"
import {
  BookOpen,
  CreditCard,
  FileQuestion,
  Files,
  Flag,
  LayoutDashboard,
  ListChecks,
  Megaphone,
  ReceiptText,
  TrendingUp,
  Settings,
  Sparkles,
  Target,
  UserPlus,
  Users,
} from "lucide-react"

export type TopMenuKey =
  | "dashboards"
  | "users"
  | "content"
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
    {
      title: "KPI",
      href: "/dashboard/kpi",
      icon: Target,
      children: [
        {
          title: "KPI Overview",
          href: "/dashboard/kpi",
        },
        {
          title: "KPI Goals",
          href: "/dashboard/kpi/goals",
        },
      ],
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
      title: "Navigation",
      href: "/content/navigation",
      icon: ListChecks,
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

  if (pathname.startsWith("/billing")) {
    return topNavigation[3]
  }

  if (pathname.startsWith("/settings")) {
    return topNavigation[4]
  }

  return topNavigation[0]
}
