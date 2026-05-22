"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
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
  const isActive = item.href
    ? pathname === item.href ||
      (hasChildren && pathname.startsWith(`${item.href}/`))
    : false

  return (
    <div>
      {item.href ? (
        <Link
          href={item.href}
          className={cn(
            "flex h-9 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-950",
            isActive && "bg-slate-200/70 text-slate-950 shadow-inner"
          )}
        >
          {Icon ? <Icon className="size-4" aria-hidden="true" /> : null}
          <span className="min-w-0 flex-1">{item.title}</span>
          {hasChildren ? (
            <ChevronDown className="size-4 text-slate-500" aria-hidden="true" />
          ) : null}
        </Link>
      ) : (
        <div className="flex h-9 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-slate-600">
          {Icon ? <Icon className="size-4" aria-hidden="true" /> : null}
          {item.title}
        </div>
      )}

      {item.children?.length ? (
        <div className="mt-2 space-y-2 pl-3">
          {item.children.map((child) => (
            <ChildSidebarLink key={child.title} item={child} pathname={pathname} />
          ))}
        </div>
      ) : null}
    </div>
  )
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
