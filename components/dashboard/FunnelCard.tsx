import Link from "next/link"

import { advancedFunnel, formatNumber } from "./dashboard-data"

export default function FunnelCard() {
  const max = advancedFunnel[0]?.value ?? 1

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">
            Advanced Funnel
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Visitor to renewal path with drop-off, time-to-next, source, and plan comparisons.
          </p>
        </div>
        <Link
          href="/dashboard/intelligence/funnel"
          className="rounded-lg px-3 py-2 text-sm font-semibold text-violet-600 transition hover:bg-violet-50"
        >
          Analyze
        </Link>
      </div>

      <div className="space-y-4">
        {advancedFunnel.map((step) => {
          const width = Math.max((step.value / max) * 100, 12)

          return (
            <Link
              key={step.label}
              href={`/dashboard/intelligence/funnel?stage=${encodeURIComponent(step.label)}`}
              className="block rounded-xl p-2 transition hover:bg-slate-50"
            >
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="font-semibold text-slate-800">
                  {step.label}
                </span>
                <span className="text-slate-500">
                  {formatNumber(step.value)} / {step.conversionRate} conversion /{" "}
                  {step.dropOffRate} drop-off
                </span>
              </div>
              <div className="h-3 rounded-full bg-slate-100">
                <div
                  className="h-3 rounded-full bg-violet-600 transition-all"
                  style={{ width: `${width}%` }}
                />
              </div>
              <div className="mt-2 grid gap-2 text-xs text-slate-500 md:grid-cols-3">
                <span>Next: {step.avgTimeToNext}</span>
                <span>{step.sourceComparison}</span>
                <span>{step.planComparison}</span>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
