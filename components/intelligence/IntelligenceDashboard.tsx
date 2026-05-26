"use client"

import DataTable, { type DataTableColumn } from "@/components/admin/DataTable"
import PageHeader from "@/components/admin/PageHeader"
import StatCard from "@/components/admin/StatCard"
import StatusBadge from "@/components/admin/StatusBadge"
import DashboardLayout from "@/components/layout/DashboardLayout"
import {
  acquisitionChannels,
  formatNumber,
  intelligenceDashboards,
  topFeatures,
} from "@/components/dashboard/dashboard-data"

type DashboardKey = keyof typeof intelligenceDashboards

type IntelligenceDashboardProps = {
  dashboardKey: DashboardKey
  focusLabel?: string
  focusType?: "Channel" | "Feature" | "Funnel Stage"
}

const decisionColumns: DataTableColumn<{ signal: string; cause: string; action: string; priority: string }>[] = [
  {
    key: "signal",
    header: "Signal",
    render: (row) => <span className="font-semibold">{row.signal}</span>,
  },
  {
    key: "cause",
    header: "Likely Cause",
    render: (row) => row.cause,
  },
  {
    key: "action",
    header: "Recommended Action",
    render: (row) => row.action,
  },
  {
    key: "priority",
    header: "Priority",
    render: (row) => (
      <StatusBadge tone={row.priority === "High" ? "danger" : "neutral"}>
        {row.priority}
      </StatusBadge>
    ),
  },
]

export default function IntelligenceDashboard({
  dashboardKey,
  focusLabel,
  focusType,
}: IntelligenceDashboardProps) {
  const dashboard = intelligenceDashboards[dashboardKey]
  const focusPrefix = focusLabel ? `${focusType}: ${focusLabel}` : undefined
  const rows = buildDecisionRows(dashboardKey, focusLabel)

  return (
    <DashboardLayout>
      <PageHeader
        breadcrumbs={[
          {
            label: "Dashboards",
          },
          {
            label: "Intelligence",
          },
          {
            label: focusLabel ?? dashboard.title,
          },
        ]}
        eyebrow={focusPrefix}
        title={dashboard.title}
        description={dashboard.description}
      />

      <section className="mb-8 rounded-2xl border border-violet-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
        <p className="text-xs font-bold uppercase tracking-wide text-violet-600">
          Executive Thesis
        </p>
        <p className="mt-3 max-w-4xl text-lg font-semibold leading-8 text-slate-950">
          {dashboard.thesis}
        </p>
      </section>

      <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboard.metrics.map(([label, value]) => (
          <StatCard key={label} label={label} value={value} />
        ))}
      </div>

      <div className="mb-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
          <h2 className="text-lg font-semibold text-slate-950">
            Decision Queue
          </h2>
          <div className="mt-5 space-y-3">
            {dashboard.decisions.map((decision, index) => (
              <div
                key={decision}
                className="rounded-xl border border-slate-100 bg-slate-50 p-4"
              >
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Decision {index + 1}
                </p>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-950">
                  {decision}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
          <h2 className="text-lg font-semibold text-slate-950">
            BI / Event Tracking Plan
          </h2>
          <div className="mt-5 grid gap-3">
            {[
              "Track visitor_source, campaign_id, first_project_created, first_generation_completed, first_export_completed.",
              "Connect PostHog/Mixpanel cohorts to plan, feature, and channel dimensions.",
              "Separate operational metrics from product events: queue_latency, gpu_utilization, model_failure, retry_count.",
              "Materialize daily summary tables for dashboard speed and executive reporting.",
            ].map((item) => (
              <div
                key={item}
                className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm font-medium leading-6 text-slate-700"
              >
                {item}
              </div>
            ))}
          </div>
        </section>
      </div>

      <DataTable
        columns={decisionColumns}
        data={rows}
        summary={`Showing 1 to ${rows.length} of ${rows.length} intelligence signals`}
        compactPagination
      />
    </DashboardLayout>
  )
}

function buildDecisionRows(dashboardKey: DashboardKey, focusLabel?: string) {
  const feature = topFeatures.find(
    (item) => slugify(item.featureName) === slugify(focusLabel ?? "")
  )
  const channel = acquisitionChannels.find(
    (item) => slugify(item.channel) === slugify(focusLabel ?? "")
  )

  if (feature) {
    return [
      {
        signal: `${feature.featureName} has ${feature.conversionImpact.toLowerCase()} conversion impact`,
        cause: `${formatNumber(feature.users)} users generated ${formatNumber(feature.usageCount)} actions.`,
        action: "Compare exposed users against non-exposed users in retention cohorts.",
        priority: feature.conversionImpact === "High" ? "High" : "Medium",
      },
      {
        signal: `${formatNumber(feature.creditUsed)} credits consumed`,
        cause: "Credit usage may be an upgrade trigger or margin pressure.",
        action: "Add upgrade prompts at 75% credit usage and track conversion.",
        priority: "Medium",
      },
    ]
  }

  if (channel) {
    return [
      {
        signal: `${channel.channel} generated ${formatNumber(channel.paidUsers)} paid users`,
        cause: `${channel.conversionRate} paid conversion with ${formatNumber(channel.visitors)} visitors.`,
        action: "Compare CAC and ARPU before reallocating acquisition budget.",
        priority: channel.channel === "Referral" ? "High" : "Medium",
      },
      {
        signal: `${formatNumber(channel.signups)} signups from ${channel.channel}`,
        cause: "Signup quality should be evaluated against first export and return visit.",
        action: "Add source-level activation and retention dashboards.",
        priority: "Medium",
      },
    ]
  }

  const base = {
    visitors: [
      ["Traffic quality split", "Volume is strong, but source quality varies.", "Prioritize high-intent channels.", "High"],
      ["Activation lag", "Some visitors sign up but do not create a first project.", "Test guided first-project templates.", "Medium"],
    ],
    subscriptions: [
      ["Churn concentration", "Cancellation risk is highest before first export.", "Create retention nudges before billing renewal.", "High"],
      ["Plan movement", "Growth plan produces strongest ARPU.", "Route high-usage Pro accounts to Growth upsell.", "Medium"],
    ],
    "ai-operations": [
      ["Queue latency high", "VPICK peak hours are pressuring inference queues.", "Add GPU capacity threshold alerts.", "High"],
      ["Credit exhaustion", "High usage strongly correlates with upgrades.", "Trigger upgrade prompt at 75% credits.", "Medium"],
    ],
    retention: [
      ["Export retention driver", "Users who export content retain 3x longer.", "Move first export earlier in onboarding.", "High"],
      ["Channel retention gap", "YouTube cohorts retain better than Instagram.", "Customize lifecycle messaging by source.", "Medium"],
    ],
  } satisfies Record<DashboardKey, string[][]>

  return base[dashboardKey].map(([signal, cause, action, priority]) => ({
    signal,
    cause,
    action,
    priority,
  }))
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}
