"use client"

import Link from "next/link"
import { useState } from "react"
import { ArrowRight, TrendingDown, TrendingUp } from "lucide-react"

import DataTable, { type DataTableColumn } from "@/components/admin/DataTable"
import PageHeader from "@/components/admin/PageHeader"
import StatusBadge from "@/components/admin/StatusBadge"
import DashboardLayout from "@/components/layout/DashboardLayout"
import {
  acquisitionChannels,
  formatNumber,
  intelligenceDashboards,
  topFeatures,
} from "@/components/dashboard/dashboard-data"
import { cn } from "@/lib/utils"
import IntelligenceCharts from "./IntelligenceCharts"

type DashboardKey = keyof typeof intelligenceDashboards

type IntelligenceDashboardProps = {
  dashboardKey: DashboardKey
  focusLabel?: string
  focusType?: "Channel" | "Feature" | "Funnel Stage"
}

const periods = ["Last 7 Days", "Last 30 Days", "Last 90 Days", "1Y", "Custom Range"]
const compareModes = [
  "This week vs last week",
  "This month vs previous month",
  "Before release vs after release",
  "Before campaign vs after campaign",
]

const decisionColumns: DataTableColumn<{
  signal: string
  cause: string
  action: string
  priority: string
}>[] = [
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

const riskColumns: DataTableColumn<{
  alert: string
  severity: string
  trend: string
  owner: string
  nextAction: string
}>[] = [
  {
    key: "alert",
    header: "Alert / Risk",
    render: (row) => <span className="font-semibold">{row.alert}</span>,
  },
  {
    key: "severity",
    header: "Severity",
    render: (row) => (
      <StatusBadge tone={row.severity === "High" ? "danger" : "neutral"}>
        {row.severity}
      </StatusBadge>
    ),
  },
  {
    key: "trend",
    header: "Trend",
    render: (row) => (
      <span
        className={cn(
          "inline-flex items-center gap-1 font-semibold",
          row.trend.startsWith("+") ? "text-rose-500" : "text-emerald-600"
        )}
      >
        {row.trend.startsWith("+") ? (
          <TrendingUp className="size-4" />
        ) : (
          <TrendingDown className="size-4" />
        )}
        {row.trend}
      </span>
    ),
  },
  {
    key: "owner",
    header: "Owner",
    render: (row) => row.owner,
  },
  {
    key: "nextAction",
    header: "Next Action",
    render: (row) => row.nextAction,
  },
]

export default function IntelligenceDashboard({
  dashboardKey,
  focusLabel,
  focusType,
}: IntelligenceDashboardProps) {
  const [period, setPeriod] = useState("Last 30 Days")
  const [compareMode, setCompareMode] = useState("This month vs previous month")
  const dashboard = intelligenceDashboards[dashboardKey]
  const focusPrefix = focusLabel ? `${focusType}: ${focusLabel}` : undefined
  const decisionRows = buildDecisionRows(dashboardKey, focusLabel)
  const riskRows = buildRiskRows(dashboardKey)
  const metrics = buildMetricCards(dashboardKey, dashboard.metrics)

  return (
    <DashboardLayout>
      <PageHeader
        breadcrumbs={[
          { label: "Dashboards" },
          { label: "Intelligence" },
          { label: focusLabel ?? dashboard.title },
        ]}
        eyebrow={focusPrefix}
        title={dashboard.title}
        description={dashboard.description}
      />

      <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
        <div className="grid gap-6 xl:grid-cols-[1.1fr_1.4fr]">
          <FilterGroup label="Period">
            {periods.map((item) => (
              <button
                key={item}
                className={filterClass(period === item)}
                onClick={() => setPeriod(item)}
              >
                {item}
              </button>
            ))}
          </FilterGroup>
          <FilterGroup label="Compare Mode">
            {compareModes.map((item) => (
              <button
                key={item}
                className={filterClass(compareMode === item)}
                onClick={() => setCompareMode(item)}
              >
                {item}
              </button>
            ))}
          </FilterGroup>
        </div>
      </section>

      <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricDeltaCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="mb-8">
        <IntelligenceCharts />
      </div>

      <section className="mb-8 rounded-2xl border border-violet-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-violet-600">
              Interpretation After Data
            </p>
            <p className="mt-3 max-w-4xl text-lg font-semibold leading-8 text-slate-950">
              {dashboard.thesis}
            </p>
          </div>
          <Link
            href="/dashboard/intelligence/funnel"
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 text-sm font-semibold text-white shadow-sm shadow-violet-600/20 transition hover:bg-violet-700"
          >
            Open Funnel
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      <section className="mb-8">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-slate-950">
            Recommendation Cards
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Action-oriented decisions generated from trend, anomaly, and cohort signals.
          </p>
        </div>
        <div className="grid gap-4 xl:grid-cols-3">
          {dashboard.decisions.map((decision, index) => (
            <div
              key={decision}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]"
            >
              <StatusBadge tone={index === 0 ? "danger" : "neutral"}>
                {index === 0 ? "High Impact" : "Decision"}
              </StatusBadge>
              <p className="mt-4 text-base font-bold leading-6 text-slate-950">
                {decision}
              </p>
              <div className="mt-5 flex gap-2">
                <Link
                  href="/dashboard/intelligence/retention"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  View Detail
                </Link>
                <Link
                  href="/dashboard/intelligence/funnel"
                  className="rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Open Funnel
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="mb-8">
        <DataTable
          columns={riskColumns}
          data={riskRows}
          summary={`Showing 1 to ${riskRows.length} of ${riskRows.length} operational risks`}
          compactPagination
        />
      </div>

      <DataTable
        columns={decisionColumns}
        data={decisionRows}
        summary={`Showing 1 to ${decisionRows.length} of ${decisionRows.length} intelligence signals`}
        compactPagination
      />

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
        <h2 className="text-lg font-semibold text-slate-950">
          Analytics Pipeline Readiness
        </h2>
        <div className="mt-5 grid gap-3 xl:grid-cols-2">
          {[
            "Track visitor_source, campaign_id, first_project_created, first_generation_completed, first_export_completed.",
            "Connect PostHog/Mixpanel cohorts to plan, feature, channel, release, and campaign dimensions.",
            "Separate operational metrics from product events: queue_latency, gpu_utilization, model_failure, retry_count.",
            "Materialize daily summary tables for dashboard speed, anomaly detection, and executive reporting.",
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
    </DashboardLayout>
  )
}

function FilterGroup({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

function filterClass(active: boolean) {
  return cn(
    "h-9 rounded-lg px-3 text-sm font-semibold transition hover:bg-slate-100 hover:text-slate-950",
    active
      ? "bg-violet-600 text-white shadow-sm shadow-violet-600/20 hover:bg-violet-600 hover:text-white"
      : "text-slate-600"
  )
}

function MetricDeltaCard({
  label,
  value,
  delta,
  detail,
}: {
  label: string
  value: string
  delta: string
  detail: string
}) {
  const isPositive = delta.startsWith("+")

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_10px_24px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold",
            isPositive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"
          )}
        >
          {isPositive ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
          {delta}
        </span>
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
        {value}
      </p>
      <p className="mt-2 text-sm text-slate-500">{detail}</p>
    </div>
  )
}

function buildMetricCards(
  dashboardKey: DashboardKey,
  metrics: readonly (readonly [string, string])[]
) {
  const deltas = {
    visitors: ["+18%", "+5.7%", "+2.4x", "-11%"],
    subscriptions: ["+9%", "+4,180", "-7%", "+22%"],
    "ai-operations": ["+14%", "-0.2%", "+0.8%", "+9%"],
    retention: ["+3%", "+5%", "+6%", "+2.8x"],
  } satisfies Record<DashboardKey, string[]>

  return metrics.map(([label, value], index) => ({
    label,
    value,
    delta: deltas[dashboardKey][index] ?? "+0%",
    detail: "Compared with selected baseline period",
  }))
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

function buildRiskRows(dashboardKey: DashboardKey) {
  const shared = [
    {
      alert: "Payment failure spike",
      severity: "High",
      trend: "+28%",
      owner: "Billing Ops",
      nextAction: "Review failed invoices and retry rules",
    },
    {
      alert: "Signup conversion dropped",
      severity: "Medium",
      trend: "-7%",
      owner: "Growth",
      nextAction: "Compare landing page variants by source",
    },
    {
      alert: "GPU queue latency high",
      severity: dashboardKey === "ai-operations" ? "High" : "Medium",
      trend: "+34%",
      owner: "AI Ops",
      nextAction: "Scale queue capacity during campaign windows",
    },
    {
      alert: "AI generation failures increased",
      severity: "Medium",
      trend: "+0.8%",
      owner: "Engineering",
      nextAction: "Inspect model retries and failure clusters",
    },
    {
      alert: "Traffic anomaly detected",
      severity: "Low",
      trend: "+12%",
      owner: "Marketing",
      nextAction: "Segment by campaign and referrer",
    },
  ]

  return shared
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}
