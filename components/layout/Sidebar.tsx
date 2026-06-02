"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  getActiveTopMenu,
  sidebarNavigation,
  type SidebarItem,
} from "./navigation"

export default function Sidebar() {
  const pathname = usePathname()
  const activeTopMenu = getActiveTopMenu(pathname)
  const navigation = sidebarNavigation[activeTopMenu.key]

  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white px-3 py-4 lg:block">
      <nav className="space-y-2">
        {navigation.map((item) => (
          <SidebarLink key={item.title} item={item} pathname={pathname} />
        ))}
      </nav>
    </aside>
  )
}

function SidebarLink({
  item,
  pathname,
}: {
  item: SidebarItem
  pathname: string
}) {
  const Icon = item.icon
  const hasChildren = Boolean(item.children?.length)
  const isActive = isSidebarItemActive(item, pathname)
  const [expandedOverride, setExpandedOverride] = useState<boolean | null>(null)
  const expanded = expandedOverride ?? isActive

  return (
    <div>
      {item.href ? (
        <div
          className={cn(
            "flex h-9 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-950",
            isActive && "bg-slate-200/70 text-slate-950 shadow-inner"
          )}
        >
          <Link href={item.href} className="flex min-w-0 flex-1 items-center gap-3">
            {Icon ? <Icon className="size-4 shrink-0" aria-hidden="true" /> : null}
            <span className="min-w-0 flex-1 truncate">{item.title}</span>
          </Link>
          {hasChildren ? (
            <button
              aria-label={expanded ? `Collapse ${item.title}` : `Expand ${item.title}`}
              className="flex size-6 shrink-0 items-center justify-center rounded-md text-slate-500 transition hover:bg-white hover:text-slate-950 hover:shadow-sm"
              onClick={() => setExpandedOverride(!expanded)}
              type="button"
            >
              {expanded ? (
                <ChevronDown className="size-4" aria-hidden="true" />
              ) : (
                <ChevronRight className="size-4" aria-hidden="true" />
              )}
            </button>
          ) : null}
        </div>
      ) : (
        <div className="flex h-9 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-slate-600">
          {Icon ? <Icon className="size-4" aria-hidden="true" /> : null}
          {item.title}
        </div>
      )}

      {item.children?.length && expanded ? (
        <div className="mt-2 space-y-2 pl-3">
          {item.children.map((child) => (
            <ChildSidebarLink key={child.title} item={child} pathname={pathname} />
          ))}
        </div>
      ) : null}
    </div>
  )
}

function isSidebarItemActive(item: SidebarItem, pathname: string) {
  if (!item.href) {
    return false
  }

  if (pathname === item.href) {
    return true
  }

  if (item.href === "/dashboard") {
    return false
  }

  return pathname.startsWith(`${item.href}/`)
}

function ChildSidebarLink({
  item,
  pathname,
}: {
  item: SidebarItem
  pathname: string
}) {
  const isActive = item.href ? pathname === item.href : false

  return (
    <Link
      href={item.href ?? "#"}
      className={cn(
        "flex h-9 items-center rounded-lg px-4 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-950",
        isActive && "bg-slate-200/70 text-slate-950 shadow-inner"
      )}
    >
      <ChevronRight className="mr-2 size-3 text-slate-400" />
      {item.title}
    </Link>
  )
}
