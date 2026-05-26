import Link from "next/link"
import { ArrowRight } from "lucide-react"

import StatusBadge from "@/components/admin/StatusBadge"
import { intelligenceInsights } from "./dashboard-data"

export default function InsightCards() {
  return (
    <section className="mb-8">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">
            Decision Insights
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Signals translated into likely causes and recommended next actions.
          </p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-4">
        {intelligenceInsights.map((insight) => (
          <Link
            key={insight.title}
            href={insight.href}
            className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-[0_2px_4px_rgba(15,23,42,0.08),0_16px_32px_rgba(15,23,42,0.07)]"
          >
            <div className="flex items-center justify-between gap-3">
              <StatusBadge tone={insight.impact === "High" ? "danger" : "neutral"}>
                {insight.area}
              </StatusBadge>
              <ArrowRight className="size-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-violet-600" />
            </div>
            <h3 className="mt-4 text-base font-bold leading-6 text-slate-950">
              {insight.title}
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              {insight.explanation}
            </p>
            <p className="mt-4 text-sm font-semibold leading-6 text-slate-700">
              {insight.recommendation}
            </p>
            <div className="mt-auto pt-5">
              <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-sm font-semibold text-violet-600">
                <span>View intelligence detail</span>
                <ArrowRight className="size-4 transition group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
