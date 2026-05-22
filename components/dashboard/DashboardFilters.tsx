import Link from "next/link"

const serviceFilters = ["Overall", "Yettey", "VPICK"]
const periodFilters = ["30D", "90D", "1Y", "Custom"]

export default function DashboardFilters() {
  return (
    <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            Service
          </p>
          <div className="flex flex-wrap gap-2">
            {serviceFilters.map((service, index) => (
              <button
                key={service}
                className={
                  index === 0
                    ? "h-9 rounded-lg bg-violet-600 px-3 text-sm font-semibold text-white shadow-sm shadow-violet-600/20"
                    : "h-9 rounded-lg px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
                }
              >
                {service}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            Period
          </p>
          <div className="flex flex-wrap gap-2">
            {periodFilters.map((period, index) => (
              <button
                key={period}
                className={
                  index === 0
                    ? "h-9 rounded-lg bg-slate-950 px-3 text-sm font-semibold text-white shadow-sm"
                    : "h-9 rounded-lg px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
                }
              >
                {period}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4 text-sm text-slate-500">
        Revenue drilldown is available from the KPI card or the{" "}
        <Link
          href="/dashboard/revenue"
          className="font-semibold text-violet-600 transition hover:text-violet-700"
        >
          Revenue Analytics
        </Link>{" "}
        section.
      </div>
    </section>
  )
}
