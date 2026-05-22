"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { getActiveTopMenu, topNavigation } from "./navigation"

export default function Header() {
  const pathname = usePathname()
  const activeTopMenu = getActiveTopMenu(pathname)

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-6 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-[1536px] items-center justify-between gap-8">
        <div className="flex min-w-0 items-center gap-8">
          <Link href="/dashboard" className="flex shrink-0 items-center gap-4">
            <span className="flex size-9 items-center justify-center rounded-full bg-violet-600 text-base font-bold text-white shadow-sm shadow-violet-600/25">
              Y
            </span>
            <span className="text-2xl font-bold tracking-tight text-slate-950">
              Yettey
            </span>
          </Link>

          <nav className="hidden min-w-0 gap-2 overflow-x-auto lg:flex">
            {topNavigation.map((item) => {
              const isActive = activeTopMenu.key === item.key

              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={cn(
                    "flex h-10 shrink-0 items-center rounded-lg px-4 text-sm font-medium text-slate-700 transition-all hover:bg-slate-100 hover:text-slate-950",
                    isActive && "bg-slate-100 text-slate-950 shadow-inner"
                  )}
                >
                  {item.title}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-6">
          <button className="flex size-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-950">
            <Bell className="size-5" />
          </button>

          <div className="hidden text-left sm:block">
            <p className="text-sm font-semibold text-slate-950">Sarah Mitchell</p>
            <p className="mt-0.5 text-xs text-slate-500">
              sarah.mitchell@company.com
            </p>
          </div>

          <button className="flex size-10 items-center justify-center rounded-none border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 hover:text-slate-950">
            <ChevronDown className="size-5" />
          </button>
        </div>
      </div>
    </header>
  )
}
