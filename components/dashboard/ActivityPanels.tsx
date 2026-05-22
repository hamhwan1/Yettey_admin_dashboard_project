import StatusBadge from "@/components/admin/StatusBadge"

import { aiJobStatus, alerts, recentActivity } from "./dashboard-data"

export default function ActivityPanels({
  onActivityClick,
  onAlertClick,
}: {
  onActivityClick?: (item: (typeof recentActivity)[number]) => void
  onAlertClick?: (item: (typeof alerts)[number]) => void
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
        <h2 className="text-lg font-semibold text-slate-950">AI Job Status</h2>
        <div className="mt-5 space-y-4">
          {aiJobStatus.map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-slate-100 bg-slate-50 p-4 transition hover:border-slate-200 hover:bg-white"
            >
              <p className="text-sm font-medium text-slate-500">{item.label}</p>
              <p className="mt-1 text-2xl font-bold text-slate-950">
                {item.value}
              </p>
              <p className="mt-1 text-sm text-slate-500">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
        <h2 className="text-lg font-semibold text-slate-950">Recent Activity</h2>
        <div className="mt-5 divide-y divide-slate-100">
          {recentActivity.map((activity) => (
            <div
              key={`${activity.type}-${activity.time}`}
              className="cursor-pointer py-4 transition hover:bg-slate-50"
              onClick={() => onActivityClick?.(activity)}
            >
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-semibold text-slate-900">
                  {activity.type}
                </p>
                <span className="text-xs text-slate-400">{activity.time}</span>
              </div>
              <p className="mt-1 text-sm text-slate-500">{activity.message}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
        <h2 className="text-lg font-semibold text-slate-950">Alerts</h2>
        <div className="mt-5 space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.title}
              className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4 transition hover:border-slate-200 hover:bg-white hover:shadow-sm"
              onClick={() => onAlertClick?.(alert)}
            >
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {alert.title}
                </p>
                <p className="mt-1 text-sm text-slate-500">{alert.value}</p>
              </div>
              <StatusBadge
                tone={alert.severity === "High" ? "danger" : "neutral"}
              >
                {alert.severity}
              </StatusBadge>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
