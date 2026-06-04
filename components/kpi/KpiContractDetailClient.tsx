"use client"

import Link from "next/link"
import { useMemo, useState, type ReactNode } from "react"
import { ArrowLeft, Building2, FileText, Save, Settings2 } from "lucide-react"

import AdminButton from "@/components/admin/AdminButton"
import PageHeader from "@/components/admin/PageHeader"
import StatusBadge from "@/components/admin/StatusBadge"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { useKpiManagementStore } from "@/lib/kpi-management-store"
import {
  formatKpiValue,
  getActiveEnterpriseRevenue,
  type EnterpriseContract,
  type EnterpriseContractStatus,
} from "./kpi-data"

type ContractEditForm = Pick<
  EnterpriseContract,
  | "companyName"
  | "contractAmount"
  | "contractEndDate"
  | "contractStartDate"
  | "contractStatus"
  | "notes"
>

const contractStatuses: EnterpriseContractStatus[] = ["Active", "Expired", "Pending"]

export default function KpiContractDetailClient({
  contractId,
  initialEditOpen = false,
}: {
  contractId: string
  initialEditOpen?: boolean
}) {
  const { contracts, updateContract } = useKpiManagementStore()
  const contract = useMemo(
    () => contracts.find((item) => item.id === contractId),
    [contractId, contracts]
  )
  const [editOpen, setEditOpen] = useState(initialEditOpen)
  const [feedback, setFeedback] = useState("Contract detail loaded")
  const [form, setForm] = useState<ContractEditForm | null>(() =>
    contract ? toContractEditForm(contract) : null
  )

  if (!contract) {
    return (
      <DashboardLayout>
        <PageHeader
          breadcrumbs={[{ label: "Dashboards" }, { label: "KPI" }, { label: "Contracts" }]}
          title="Contract Not Found"
          description="The selected enterprise revenue contract is not available."
          actions={<BackLink />}
        />
      </DashboardLayout>
    )
  }

  const activeEnterpriseRevenue = getActiveEnterpriseRevenue(contracts)
  const recognizedRevenue =
    !contract.archived && contract.contractStatus === "Active"
      ? contract.contractAmount
      : 0

  const handleSave = () => {
    if (!form) {
      return
    }

    updateContract(contract.id, form)
    setFeedback(`${form.companyName} contract saved with field history`)
    setEditOpen(false)
  }

  return (
    <DashboardLayout>
      <PageHeader
        breadcrumbs={[
          { label: "Dashboards" },
          { label: "KPI" },
          { label: "Contracts" },
          { label: contract.companyName },
        ]}
        title={contract.companyName}
        description="Review enterprise contract details, revenue contribution, notes, and field history."
        actions={
          <>
            <BackLink />
            <AdminButton
              onClick={() => {
                setForm(toContractEditForm(contract))
                setEditOpen(true)
              }}
              variant="primary"
            >
              <Settings2 className="size-4" />
              Edit Contract
            </AdminButton>
          </>
        }
      />

      <div className="mb-6 rounded-2xl border border-violet-100 bg-violet-50 px-5 py-4 text-sm font-bold text-violet-700">
        {feedback}
      </div>

      <div className="grid gap-8 xl:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <ContractInformation contract={contract} />
          <NotesSection notes={contract.notes} />
          <HistorySection contract={contract} />
        </div>

        <RevenueInformation
          activeEnterpriseRevenue={activeEnterpriseRevenue}
          contract={contract}
          recognizedRevenue={recognizedRevenue}
        />
      </div>

      {editOpen && form ? (
        <ContractEditModal
          form={form}
          onCancel={() => setEditOpen(false)}
          onChange={setForm}
          onSave={handleSave}
        />
      ) : null}
    </DashboardLayout>
  )
}

function ContractInformation({ contract }: { contract: EnterpriseContract }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_16px_40px_rgba(15,23,42,0.06)]">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-950">
            Contract Information
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Enterprise revenue contract metadata and status.
          </p>
        </div>
        <StatusBadge tone={contractStatusTone(contract.contractStatus)}>
          {contract.contractStatus}
        </StatusBadge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <InfoItem label="Company Name" value={contract.companyName} />
        <InfoItem label="Contract Status" value={contract.contractStatus} />
        <InfoItem label="Contract Start Date" value={contract.contractStartDate} />
        <InfoItem label="Contract End Date" value={contract.contractEndDate} />
        <InfoItem label="Last Updated" value={contract.lastUpdated} />
        <InfoItem label="Archive State" value={contract.archived ? "Archived" : "Active"} />
      </div>
    </section>
  )
}

function RevenueInformation({
  activeEnterpriseRevenue,
  contract,
  recognizedRevenue,
}: {
  activeEnterpriseRevenue: number
  contract: EnterpriseContract
  recognizedRevenue: number
}) {
  return (
    <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-950">
            Revenue Information
          </h2>
          <p className="mt-1 text-sm text-slate-500">Manual enterprise revenue.</p>
        </div>
        <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <Building2 className="size-5" />
        </span>
      </div>

      <dl className="mt-6 space-y-4">
        <MetricRow
          label="Contract Amount"
          value={formatKpiValue(contract.contractAmount, "currency")}
        />
        <MetricRow
          label="Recognized Revenue"
          value={formatKpiValue(recognizedRevenue, "currency")}
        />
        <MetricRow
          label="Active Enterprise Total"
          value={formatKpiValue(activeEnterpriseRevenue, "currency")}
        />
      </dl>
    </aside>
  )
}

function NotesSection({ notes }: { notes: string }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_16px_40px_rgba(15,23,42,0.06)]">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
          <FileText className="size-5" />
        </span>
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-950">
            Notes
          </h2>
          <p className="mt-3 text-sm font-medium leading-6 text-slate-600">{notes}</p>
        </div>
      </div>
    </section>
  )
}

function HistorySection({ contract }: { contract: EnterpriseContract }) {
  const history = contract.history ?? []

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06),0_16px_40px_rgba(15,23,42,0.06)]">
      <div className="border-b border-slate-100 p-6">
        <h2 className="text-xl font-semibold tracking-tight text-slate-950">
          Contract History
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Field-level changes created by contract edits.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-[860px] w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Changed By</th>
              <th className="px-6 py-4">Field</th>
              <th className="px-6 py-4">Previous Value</th>
              <th className="px-6 py-4">New Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {history.length ? (
              history.map((record) => (
                <tr key={record.id}>
                  <td className="whitespace-nowrap px-6 py-5 font-semibold text-slate-700">
                    {record.date}
                  </td>
                  <td className="whitespace-nowrap px-6 py-5 font-semibold text-slate-700">
                    {record.changedBy}
                  </td>
                  <td className="whitespace-nowrap px-6 py-5 font-semibold text-slate-700">
                    {record.field}
                  </td>
                  <td className="px-6 py-5 font-semibold text-slate-500">
                    {record.previousValue}
                  </td>
                  <td className="px-6 py-5 font-bold text-slate-950">
                    {record.newValue}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-6 py-8 text-sm font-semibold text-slate-500" colSpan={5}>
                  No contract history yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function ContractEditModal({
  form,
  onCancel,
  onChange,
  onSave,
}: {
  form: ContractEditForm
  onCancel: () => void
  onChange: (form: ContractEditForm) => void
  onSave: () => void
}) {
  const updateForm = (patch: Partial<ContractEditForm>) => {
    onChange({ ...form, ...patch })
  }

  return (
    <ModalShell title="Edit Contract" onCancel={onCancel}>
      <div className="grid gap-4">
        <Field
          label="Company Name"
          onChange={(value) => updateForm({ companyName: value })}
          value={form.companyName}
        />
        <NumberField
          label="Contract Amount"
          onChange={(value) => updateForm({ contractAmount: value })}
          step={1000000}
          value={form.contractAmount}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Start Date"
            onChange={(value) => updateForm({ contractStartDate: value })}
            type="date"
            value={form.contractStartDate}
          />
          <Field
            label="End Date"
            onChange={(value) => updateForm({ contractEndDate: value })}
            type="date"
            value={form.contractEndDate}
          />
        </div>
        <SelectField
          label="Status"
          onChange={(value) =>
            updateForm({ contractStatus: value as EnterpriseContractStatus })
          }
          options={contractStatuses.map((status) => ({ label: status, value: status }))}
          value={form.contractStatus}
        />
        <TextAreaField
          label="Notes"
          onChange={(value) => updateForm({ notes: value })}
          value={form.notes}
        />
      </div>

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <AdminButton className="sm:w-28" onClick={onCancel}>
          Cancel
        </AdminButton>
        <AdminButton className="sm:w-40" onClick={onSave} variant="primary">
          <Save className="size-4" />
          Save Contract
        </AdminButton>
      </div>
    </ModalShell>
  )
}

const fieldClassName =
  "mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-950 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"

function BackLink() {
  return (
    <Link
      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-950 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:shadow-md"
      href="/dashboard/kpi/goals"
    >
      <ArrowLeft className="size-4" />
      Back
    </Link>
  )
}

function Field({
  label,
  onChange,
  type = "text",
  value,
}: {
  label: string
  onChange: (value: string) => void
  type?: string
  value: string
}) {
  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      <input
        className={fieldClassName}
        onChange={(event) => onChange(event.target.value)}
        type={type}
        value={value}
      />
    </label>
  )
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
      {children}
    </span>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-sm font-bold text-slate-950">{value}</p>
    </div>
  )
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
      <dt className="text-sm font-bold text-slate-500">{label}</dt>
      <dd className="text-lg font-bold text-slate-950">{value}</dd>
    </div>
  )
}

function ModalShell({
  children,
  onCancel,
  title,
}: {
  children: ReactNode
  onCancel: () => void
  title: string
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-950">
              {title}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Saving changes adds contract history records.
            </p>
          </div>
          <button
            className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
            onClick={onCancel}
            type="button"
          >
            x
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function NumberField({
  label,
  onChange,
  step = 1,
  value,
}: {
  label: string
  onChange: (value: number) => void
  step?: number
  value: number
}) {
  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      <input
        className={fieldClassName}
        min={0}
        onChange={(event) => onChange(Number(event.target.value))}
        step={step}
        type="number"
        value={value}
      />
    </label>
  )
}

function SelectField({
  label,
  onChange,
  options,
  value,
}: {
  label: string
  onChange: (value: string) => void
  options: Array<{ label: string; value: string }>
  value: string
}) {
  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      <select
        className={fieldClassName}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function TextAreaField({
  label,
  onChange,
  value,
}: {
  label: string
  onChange: (value: string) => void
  value: string
}) {
  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      <textarea
        className="mt-2 min-h-28 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm font-medium text-slate-950 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      />
    </label>
  )
}

function contractStatusTone(status: EnterpriseContractStatus) {
  if (status === "Active") {
    return "success"
  }

  if (status === "Expired") {
    return "danger"
  }

  return "neutral"
}

function toContractEditForm(contract: EnterpriseContract): ContractEditForm {
  return {
    companyName: contract.companyName,
    contractAmount: contract.contractAmount,
    contractEndDate: contract.contractEndDate,
    contractStartDate: contract.contractStartDate,
    contractStatus: contract.contractStatus,
    notes: contract.notes,
  }
}
