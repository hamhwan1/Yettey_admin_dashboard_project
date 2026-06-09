"use client"

import { useEffect, useState } from "react"

import PageHeader from "@/components/admin/PageHeader"
import DashboardLayout from "@/components/layout/DashboardLayout"
import {
  type BillingAuditLog,
  defaultBillingAuditLogs,
  readBillingAuditLogs,
  subscribeToBillingAuditLogs,
} from "@/lib/billing-audit-logs"

export default function BillingLogsClient() {
  const [logs, setLogs] = useState<BillingAuditLog[]>(defaultBillingAuditLogs)

  useEffect(() => {
    queueMicrotask(() => setLogs(readBillingAuditLogs()))

    return subscribeToBillingAuditLogs(() => {
      setLogs(readBillingAuditLogs())
    })
  }, [])

  return (
    <DashboardLayout>
      <PageHeader
        title="Logs"
        description="Review billing policy, plan, subscription, invoice, and entitlement audit events."
        breadcrumbs={[{ label: "Billing" }, { label: "Logs" }]}
      />

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] border-separate border-spacing-0">
            <thead>
              <tr className="bg-white">
                {["Created At", "Action", "Scope", "Actor", "Details"].map(
                  (header) => (
                    <th
                      key={header}
                      className="border-b border-slate-100 px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500"
                    >
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="transition-colors hover:bg-slate-50">
                  <td className={cellClass}>{log.createdAt}</td>
                  <td className={cellClass}>
                    <span className="font-bold text-slate-950">{log.action}</span>
                  </td>
                  <td className={cellClass}>{log.scope}</td>
                  <td className={cellClass}>{log.actor}</td>
                  <td className={cellClass}>
                    <p className="max-w-xl leading-5 text-slate-600">
                      {log.details}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-slate-100 px-6 py-4 text-sm text-slate-500">
          {logs.length} billing audit events
        </div>
      </section>
    </DashboardLayout>
  )
}

const cellClass = "border-b border-slate-100 px-6 py-5 text-sm text-slate-900"
