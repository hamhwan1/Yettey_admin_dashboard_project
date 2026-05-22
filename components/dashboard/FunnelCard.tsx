import { funnel, formatNumber } from "./dashboard-data"

export default function FunnelCard() {
  const max = funnel[0]?.value ?? 1

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-950">User Funnel</h2>
        <p className="mt-1 text-sm text-slate-500">
          Visitor to paid user conversion path.
        </p>
      </div>

      <div className="space-y-4">
        {funnel.map((step) => {
          const width = Math.max((step.value / max) * 100, 12)

          return (
            <div key={step.label}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-800">{step.label}</span>
                <span className="text-slate-500">
                  {formatNumber(step.value)} / {step.rate}
                </span>
              </div>
              <div className="h-3 rounded-full bg-slate-100">
                <div
                  className="h-3 rounded-full bg-violet-600 transition-all"
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
