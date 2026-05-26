"use client"

import Link from "next/link"
import { useMemo, useState } from "react"

import DataTable, { type DataTableColumn } from "@/components/admin/DataTable"
import PageHeader from "@/components/admin/PageHeader"
import SideDrawer from "@/components/admin/SideDrawer"
import StatCard from "@/components/admin/StatCard"
import StatusBadge from "@/components/admin/StatusBadge"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { cn } from "@/lib/utils"
import ActivityPanels from "./ActivityPanels"
import { DashboardCharts } from "./DashboardCharts"
import {
  acquisitionChannels,
  alerts,
  formatNumber,
  overviewKpis,
  recentActivity,
  topFeatures,
  type ServiceFilter,
} from "./dashboard-data"
import FunnelCard from "./FunnelCard"
import InsightCards from "./InsightCards"

type AcquisitionChannel = (typeof acquisitionChannels)[number]
type TopFeature = (typeof topFeatures)[number]
type DrawerState =
  | { type: "channel"; item: AcquisitionChannel }
  | { type: "feature"; item: TopFeature }
  | { type: "activity"; item: (typeof recentActivity)[number] }
  | { type: "alert"; item: (typeof alerts)[number] }
  | null

const services: ServiceFilter[] = ["Overall", "Yettey", "VPICK"]
const periods = ["30D", "90D", "1Y", "Custom"]

export default function DashboardOverviewClient() {
  const [service, setService] = useState<ServiceFilter>("Overall")
  const [period, setPeriod] = useState("30D")
  const [channelPage, setChannelPage] = useState(1)
  const [featurePage, setFeaturePage] = useState(1)
  const [drawer, setDrawer] = useState<DrawerState>(null)

  const serviceMultiplier = service === "Overall" ? 1 : service === "Yettey" ? 0.62 : 0.38
  const periodMultiplier =
    period === "30D" ? 1 : period === "90D" ? 2.7 : period === "1Y" ? 9.8 : 1.4

  const kpis = useMemo(
    () =>
      overviewKpis.map((metric) => ({
        ...metric,
        value: metric.value.startsWith("$")
          ? `$${Math.round(
              Number(metric.value.replace(/[$KM.]/g, "")) *
                serviceMultiplier *
                periodMultiplier
            )}.4K`
          : metric.value,
      })),
    [periodMultiplier, serviceMultiplier]
  )

  const filteredFeatures = topFeatures.filter(
    (feature) => service === "Overall" || feature.service === service
  )

  const acquisitionColumns: DataTableColumn<AcquisitionChannel>[] = [
    {
      key: "channel",
      header: "Channel",
      render: (row) => <span className="font-semibold">{row.channel}</span>,
    },
    {
      key: "visitors",
      header: "Visitors",
      render: (row) => formatNumber(Math.round(row.visitors * periodMultiplier)),
    },
    {
      key: "signups",
      header: "Signups",
      render: (row) => formatNumber(Math.round(row.signups * periodMultiplier)),
    },
    {
      key: "paidUsers",
      header: "Paid Users",
      render: (row) => formatNumber(Math.round(row.paidUsers * periodMultiplier)),
    },
    {
      key: "conversionRate",
      header: "Conversion Rate",
      render: (row) => (
        <span className="font-semibold text-violet-600">
          {row.conversionRate}
        </span>
      ),
    },
  ]

  const featureColumns: DataTableColumn<TopFeature>[] = [
    {
      key: "featureName",
      header: "Feature Name",
      render: (row) => <span className="font-semibold">{row.featureName}</span>,
    },
    {
      key: "service",
      header: "Service",
      render: (row) => row.service,
    },
    {
      key: "users",
      header: "Users",
      render: (row) => formatNumber(row.users),
    },
    {
      key: "usageCount",
      header: "Usage Count",
      render: (row) => formatNumber(row.usageCount),
    },
    {
      key: "creditUsed",
      header: "Credit Used",
      render: (row) => formatNumber(row.creditUsed),
    },
    {
      key: "conversionImpact",
      header: "Conversion Impact",
      render: (row) => (
        <StatusBadge
          tone={row.conversionImpact === "High" ? "success" : "neutral"}
        >
          {row.conversionImpact}
        </StatusBadge>
      ),
    },
  ]

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Dashboards"
        title="Overview"
        description="Interactive mock overview for service health, marketing acquisition, conversion, retention, revenue, credit usage, and AI operations."
      />

      <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
        <div className="grid gap-6 md:grid-cols-2">
          <FilterGroup label="Service">
            {services.map((item) => (
              <button
                key={item}
                className={filterClass(service === item)}
                onClick={() => setService(item)}
              >
                {item}
              </button>
            ))}
          </FilterGroup>
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
        </div>
        <button
          className="mt-5 rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
          onClick={() => {
            setService("Overall")
            setPeriod("30D")
            setChannelPage(1)
            setFeaturePage(1)
          }}
        >
          Reset All
        </button>
      </section>

      <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((metric) =>
          metric.href ? (
            <Link key={metric.label} href={metric.href}>
              <StatCard
                label={metric.label}
                value={metric.value}
                detail={metric.detail}
              />
            </Link>
          ) : (
            <StatCard
              key={metric.label}
              label={metric.label}
              value={metric.value}
              detail={metric.detail}
            />
          )
        )}
      </div>

      <InsightCards />

      <div className="mb-8">
        <DashboardCharts />
      </div>

      <div className="mb-8">
        <FunnelCard />
      </div>

      <div className="mb-8">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-slate-950">
            Acquisition Channels
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Click a row to preview channel details.
          </p>
        </div>
        <DataTable
          columns={acquisitionColumns}
          data={acquisitionChannels}
          summary={`Showing page ${channelPage} of 4 acquisition channel pages`}
          compactPagination
          page={channelPage}
          totalPages={4}
          onPageChange={setChannelPage}
          onRowClick={(item) => {
            window.location.href = `/dashboard/intelligence/acquisition/${slugify(item.channel)}`
          }}
        />
      </div>

      <div className="mb-8">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-slate-950">
            Top Used Features TOP 10
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Click a feature to inspect usage and conversion impact.
          </p>
        </div>
        <DataTable
          columns={featureColumns}
          data={filteredFeatures}
          summary={`Showing page ${featurePage} of 3 feature pages`}
          compactPagination
          page={featurePage}
          totalPages={3}
          onPageChange={setFeaturePage}
          onRowClick={(item) => {
            window.location.href = `/dashboard/intelligence/features/${slugify(item.featureName)}`
          }}
        />
      </div>

      <ActivityPanels
        onActivityClick={(item) => setDrawer({ type: "activity", item })}
        onAlertClick={(item) => setDrawer({ type: "alert", item })}
      />

      <DashboardDrawer drawer={drawer} onClose={() => setDrawer(null)} />
    </DashboardLayout>
  )
}

function slugify(value: string) {
  return value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
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

function DashboardDrawer({
  drawer,
  onClose,
}: {
  drawer: DrawerState
  onClose: () => void
}) {
  return (
    <SideDrawer
      open={Boolean(drawer)}
      title={
        drawer?.type === "channel"
          ? drawer.item.channel
          : drawer?.type === "feature"
            ? drawer.item.featureName
            : drawer?.type === "activity"
              ? drawer.item.type
              : drawer?.type === "alert"
                ? drawer.item.title
                : "Detail"
      }
      description="Interactive mock detail panel. Replace with API-backed detail view later."
      onClose={onClose}
    >
      {drawer ? (
        <div className="space-y-4">
          {Object.entries(drawer.item).map(([key, value]) => (
            <div key={key} className="rounded-xl border border-slate-100 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                {key}
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-950">
                {String(value)}
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </SideDrawer>
  )
}
