"use client"

import Link from "next/link"
import { useMemo, useState, type ReactNode } from "react"
import {
  Archive,
  Building2,
  CalendarRange,
  Eye,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Search,
  Settings2,
} from "lucide-react"

import AdminButton from "@/components/admin/AdminButton"
import PageHeader from "@/components/admin/PageHeader"
import StatusBadge from "@/components/admin/StatusBadge"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { useKpiManagementStore } from "@/lib/kpi-management-store"
import { cn } from "@/lib/utils"
import {
  createKpiId,
  formatEditableNumber,
  formatKpiTarget,
  formatKpiValue,
  getActiveEnterpriseRevenue,
  getKpiCurrentValue,
  getKpiStatus,
  initialKpiConfigurations,
  kpiNameOptions,
  kpiPeriodTypes,
  kpiServices,
  parseEditableNumber,
  type EnterpriseContract,
  type EnterpriseContractStatus,
  type KpiCalculationType,
  type KpiConfiguration,
  type KpiDirection,
  type KpiFormat,
  type KpiPeriodType,
  type KpiService,
  type KpiTone,
} from "./kpi-data"

type ContractForm = Omit<
  EnterpriseContract,
  "archived" | "history" | "id" | "lastUpdated"
>

type KpiForm = Pick<
  KpiConfiguration,
  | "calculationType"
  | "description"
  | "direction"
  | "displayOrder"
  | "format"
  | "name"
  | "periodType"
  | "pinned"
  | "representative"
  | "service"
  | "showOnOverview"
  | "targetValue"
>

type ArchiveFilter = "active" | "all" | "archived"

const contractStatuses: EnterpriseContractStatus[] = ["Active", "Expired", "Pending"]

const kpiCalculationTypes: Array<{ label: string; value: KpiCalculationType }> = [
  { label: "Manual", value: "manual" },
  { label: "Total Revenue", value: "totalRevenue" },
  { label: "Enterprise Revenue", value: "enterpriseRevenue" },
]

const kpiDirections: Array<{ label: string; value: KpiDirection }> = [
  { label: "Higher is better", value: "higher" },
  { label: "Lower is better", value: "lower" },
]

const kpiFormats: Array<{ label: string; value: KpiFormat }> = [
  { label: "Percentage", value: "percentage" },
  { label: "Currency", value: "currency" },
  { label: "Number", value: "number" },
]

const kpiTones: KpiTone[] = ["violet", "sky", "emerald", "amber", "rose"]

const emptyContractForm: ContractForm = {
  companyName: "New Enterprise Account",
  contractAmount: 50000000,
  contractEndDate: "2026-12-31",
  contractStartDate: "2026-06-01",
  contractStatus: "Pending",
  notes: "Contract notes and revenue recognition context.",
}

const emptyKpiForm: KpiForm = {
  calculationType: "manual",
  description: "Describe why this KPI matters and how administrators should interpret it.",
  direction: "higher",
  displayOrder: 12,
  format: "percentage",
  name: "New KPI",
  periodType: "Monthly",
  pinned: false,
  representative: false,
  service: "Overall",
  showOnOverview: false,
  targetValue: 0,
}

export default function KpiGoalsClient() {
  const {
    addContract,
    addKpi,
    archiveContract,
    archiveKpi,
    contracts,
    kpis,
    resetKpiManagement,
    restoreContract,
    restoreKpi,
  } = useKpiManagementStore()
  const [kpiModalOpen, setKpiModalOpen] = useState(false)
  const [contractModalOpen, setContractModalOpen] = useState(false)
  const [contractArchiveFilter, setContractArchiveFilter] =
    useState<ArchiveFilter>("active")
  const [contractSearch, setContractSearch] = useState("")
  const [kpiArchiveFilter, setKpiArchiveFilter] = useState<ArchiveFilter>("active")
  const [kpiForm, setKpiForm] = useState<KpiForm>(() => ({
    ...emptyKpiForm,
    displayOrder: getNextKpiOrder(initialKpiConfigurations),
  }))
  const [kpiSearch, setKpiSearch] = useState("")
  const [contractForm, setContractForm] =
    useState<ContractForm>(emptyContractForm)
  const [feedback, setFeedback] = useState("KPI list architecture ready")

  const filteredKpis = useMemo(
    () =>
      kpis
        .filter((kpi) => matchesArchiveFilter(kpi.archived, kpiArchiveFilter))
        .filter((kpi) =>
          matchesSearch(kpiSearch, [
            kpi.name,
            kpi.description,
            kpi.service,
            kpi.periodLabel,
            kpi.periodType,
          ])
        )
        .sort((a, b) => a.displayOrder - b.displayOrder),
    [kpiArchiveFilter, kpiSearch, kpis]
  )
  const filteredContracts = useMemo(
    () =>
      contracts
        .filter((contract) =>
          matchesArchiveFilter(contract.archived, contractArchiveFilter)
        )
        .filter((contract) =>
          matchesSearch(contractSearch, [
            contract.companyName,
            contract.contractStatus,
            contract.contractStartDate,
            contract.contractEndDate,
            contract.notes,
          ])
        )
        .sort((a, b) => a.companyName.localeCompare(b.companyName)),
    [contractArchiveFilter, contractSearch, contracts]
  )
  const activeEnterpriseRevenue = getActiveEnterpriseRevenue(contracts)
  const activeKpiCount = kpis.filter((kpi) => !kpi.archived).length
  const archivedKpiCount = kpis.filter((kpi) => kpi.archived).length
  const activeContractCount = contracts.filter((contract) => !contract.archived).length
  const archivedContractCount = contracts.filter((contract) => contract.archived).length

  const openKpiModal = () => {
    setKpiForm({ ...emptyKpiForm, displayOrder: getNextKpiOrder(kpis) })
    setKpiModalOpen(true)
  }

  const openContractModal = () => {
    setContractForm(emptyContractForm)
    setContractModalOpen(true)
  }

  const handleAddKpi = () => {
    const normalizedForm = normalizeKpiForm(kpiForm)
    const nextKpi: KpiConfiguration = {
      ...normalizedForm,
      archived: false,
      currentValue: 0,
      history: [
        {
          changedBy: "Ham Hwan",
          date: "2026-06-04",
          id: `kpi-history-created-${Date.now()}`,
          newValue: formatFormValue(
            normalizedForm.targetValue,
            normalizedForm.format,
            normalizedForm.direction
          ),
          previousValue: "-",
          reason: "Initial KPI target configured",
        },
      ],
      id: createKpiId(normalizedForm.name),
      lastUpdated: "2026-06-04",
      periodLabel: getDefaultPeriodLabel(normalizedForm.periodType),
      precision: normalizedForm.format === "percentage" ? 1 : 0,
      riskThreshold: normalizedForm.direction === "lower" ? 100 : 80,
      targetPrefix: normalizedForm.direction === "lower" ? "<" : undefined,
      tone: kpiTones[(normalizedForm.displayOrder - 1) % kpiTones.length],
      trend: {
        direction: normalizedForm.direction === "lower" ? "down" : "up",
        unit: normalizedForm.format === "percentage" ? "pp" : "%",
        value: 0,
      },
    }

    addKpi(nextKpi)
    setFeedback(`${nextKpi.name} added to KPI definitions`)
    setKpiModalOpen(false)
  }

  const handleAddContract = () => {
    const nextContract: EnterpriseContract = {
      ...contractForm,
      archived: false,
      history: [
        {
          changedBy: "Ham Hwan",
          date: "2026-06-04",
          field: "Contract Created",
          id: `contract-history-created-${Date.now()}`,
          newValue: formatKpiValue(contractForm.contractAmount, "currency"),
          previousValue: "-",
        },
      ],
      id: `enterprise-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      lastUpdated: "2026-06-04",
    }

    addContract(nextContract)
    setFeedback(`${nextContract.companyName} contract added`)
    setContractModalOpen(false)
  }

  const handleResetMock = () => {
    resetKpiManagement()
    setFeedback("KPI and enterprise revenue mock data reset")
  }

  return (
    <DashboardLayout>
      <PageHeader
        breadcrumbs={[{ label: "Dashboards" }, { label: "KPI" }, { label: "Goals" }]}
        title="KPI Goals"
        description="Browse KPI definitions, manage overview visibility, and track enterprise revenue contracts through detail pages and history."
        actions={
          <>
            <AdminButton onClick={handleResetMock}>
              <RotateCcw className="size-4" />
              Reset Mock
            </AdminButton>
            <AdminButton onClick={openKpiModal} variant="primary">
              <Plus className="size-4" />
              Add KPI
            </AdminButton>
          </>
        }
      />

      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-violet-100 bg-violet-50 px-5 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Settings2 className="size-5 shrink-0 text-violet-600" />
          <p className="font-bold text-violet-700">{feedback}</p>
        </div>
        <p className="font-semibold text-violet-600">
          {activeKpiCount} active KPIs / {archivedKpiCount} archived
        </p>
      </div>

      <div className="space-y-8">
        <KpiListTable
          archiveFilter={kpiArchiveFilter}
          contracts={contracts}
          kpis={filteredKpis}
          onArchive={(kpi) => {
            archiveKpi(kpi.id)
            setFeedback(`${kpi.name} archived from active KPI list`)
          }}
          onFilterChange={setKpiArchiveFilter}
          onRestore={(kpi) => {
            restoreKpi(kpi.id)
            setFeedback(`${kpi.name} restored to active KPI list`)
          }}
          onSearchChange={setKpiSearch}
          search={kpiSearch}
          totals={{
            active: activeKpiCount,
            archived: archivedKpiCount,
            all: kpis.length,
          }}
        />

        <EnterpriseRevenueList
          activeEnterpriseRevenue={activeEnterpriseRevenue}
          archiveFilter={contractArchiveFilter}
          contracts={filteredContracts}
          onAdd={openContractModal}
          onArchive={(contract) => {
            archiveContract(contract.id)
            setFeedback(`${contract.companyName} contract archived`)
          }}
          onFilterChange={setContractArchiveFilter}
          onRestore={(contract) => {
            restoreContract(contract.id)
            setFeedback(`${contract.companyName} contract restored`)
          }}
          onSearchChange={setContractSearch}
          search={contractSearch}
          totals={{
            active: activeContractCount,
            archived: archivedContractCount,
            all: contracts.length,
          }}
        />
      </div>

      {kpiModalOpen ? (
        <KpiCreateModal
          form={kpiForm}
          onCancel={() => setKpiModalOpen(false)}
          onChange={setKpiForm}
          onSave={handleAddKpi}
        />
      ) : null}

      {contractModalOpen ? (
        <ContractCreateModal
          form={contractForm}
          onCancel={() => setContractModalOpen(false)}
          onChange={setContractForm}
          onSave={handleAddContract}
        />
      ) : null}
    </DashboardLayout>
  )
}

function KpiListTable({
  archiveFilter,
  contracts,
  kpis,
  onArchive,
  onFilterChange,
  onRestore,
  onSearchChange,
  search,
  totals,
}: {
  archiveFilter: ArchiveFilter
  contracts: EnterpriseContract[]
  kpis: KpiConfiguration[]
  onArchive: (kpi: KpiConfiguration) => void
  onFilterChange: (filter: ArchiveFilter) => void
  onRestore: (kpi: KpiConfiguration) => void
  onSearchChange: (value: string) => void
  search: string
  totals: Record<ArchiveFilter, number>
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06),0_16px_40px_rgba(15,23,42,0.06)]">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-950">
            KPI List
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Active business KPIs with current status and target ownership.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchField
            onChange={onSearchChange}
            placeholder="Search KPIs"
            value={search}
          />
          <ArchiveFilterControl
            activeFilter={archiveFilter}
            onChange={onFilterChange}
            totals={totals}
          />
          <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-600">
            <CalendarRange className="size-4 text-violet-600" />
            Monthly / Quarterly / Yearly
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[1120px] w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-6 py-4">KPI Name</th>
              <th className="px-6 py-4">Service</th>
              <th className="px-6 py-4">Period</th>
              <th className="px-6 py-4">Current Value</th>
              <th className="px-6 py-4">Target Value</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Last Updated</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {kpis.map((kpi) => {
              const status = getKpiStatus(kpi, contracts)

              return (
                <tr key={kpi.id} className="transition hover:bg-violet-50/40">
                  <td className="px-6 py-5">
                    <Link
                      className="font-bold text-slate-950 transition hover:text-violet-700"
                      href={`/dashboard/kpi/goals/${kpi.id}`}
                    >
                      {kpi.name}
                    </Link>
                    <p className="mt-1 line-clamp-1 max-w-80 text-xs font-semibold text-slate-500">
                      {kpi.description}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <MiniFlag active={kpi.showOnOverview}>Overview</MiniFlag>
                      <MiniFlag active={kpi.representative}>Representative</MiniFlag>
                      <MiniFlag active={kpi.pinned}>Pinned</MiniFlag>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-5 font-semibold text-slate-700">
                    {kpi.service}
                  </td>
                  <td className="whitespace-nowrap px-6 py-5 text-slate-700">
                    <p className="font-semibold">{kpi.periodLabel}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      {kpi.periodType}
                    </p>
                  </td>
                  <td
                    className="whitespace-nowrap px-6 py-5 font-semibold text-slate-800"
                    title={getRevenueTitle(kpi, contracts)}
                  >
                    {formatKpiValue(
                      getKpiCurrentValue(kpi, contracts),
                      kpi.format,
                      kpi.precision
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-5 font-semibold text-slate-700">
                    {formatKpiTarget(kpi)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-5">
                    <StatusBadge tone={statusTone(status)}>{status}</StatusBadge>
                  </td>
                  <td className="whitespace-nowrap px-6 py-5 font-semibold text-slate-500">
                    {kpi.lastUpdated}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-end gap-2">
                      <ActionLink href={`/dashboard/kpi/goals/${kpi.id}`} label="View">
                        <Eye className="size-4" />
                      </ActionLink>
                      <ActionLink
                        href={`/dashboard/kpi/goals/${kpi.id}?edit=true`}
                        label="Edit"
                      >
                        <Pencil className="size-4" />
                      </ActionLink>
                      {kpi.archived ? (
                        <ActionButton label="Restore" onClick={() => onRestore(kpi)}>
                          <RotateCcw className="size-4" />
                        </ActionButton>
                      ) : (
                        <ActionButton label="Archive" onClick={() => onArchive(kpi)}>
                          <Archive className="size-4" />
                        </ActionButton>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
            {!kpis.length ? (
              <tr>
                <td
                  className="px-6 py-8 text-sm font-semibold text-slate-500"
                  colSpan={8}
                >
                  No KPI records match this filter.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function EnterpriseRevenueList({
  activeEnterpriseRevenue,
  archiveFilter,
  contracts,
  onAdd,
  onArchive,
  onFilterChange,
  onRestore,
  onSearchChange,
  search,
  totals,
}: {
  activeEnterpriseRevenue: number
  archiveFilter: ArchiveFilter
  contracts: EnterpriseContract[]
  onAdd: () => void
  onArchive: (contract: EnterpriseContract) => void
  onFilterChange: (filter: ArchiveFilter) => void
  onRestore: (contract: EnterpriseContract) => void
  onSearchChange: (value: string) => void
  search: string
  totals: Record<ArchiveFilter, number>
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06),0_16px_40px_rgba(15,23,42,0.06)]">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-950">
            Enterprise Revenue List
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Dedicated contract records used in total revenue calculations.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <SearchField
            onChange={onSearchChange}
            placeholder="Search contracts"
            value={search}
          />
          <ArchiveFilterControl
            activeFilter={archiveFilter}
            onChange={onFilterChange}
            totals={totals}
          />
          <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">
            <Building2 className="size-4" />
            {formatKpiValue(activeEnterpriseRevenue, "currency")} active
          </div>
          <AdminButton className="h-10" onClick={onAdd} variant="primary">
            <Plus className="size-4" />
            Add Contract
          </AdminButton>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[1040px] w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-6 py-4">Company Name</th>
              <th className="px-6 py-4">Contract Amount</th>
              <th className="px-6 py-4">Start Date</th>
              <th className="px-6 py-4">End Date</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Last Updated</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {contracts.map((contract) => {
              const displayStatus = contract.archived
                ? "Archived"
                : contract.contractStatus

              return (
                <tr key={contract.id} className="transition hover:bg-violet-50/40">
                <td className="whitespace-nowrap px-6 py-5">
                  <Link
                    className="font-bold text-slate-950 transition hover:text-violet-700"
                    href={`/dashboard/kpi/contracts/${contract.id}`}
                  >
                    {contract.companyName}
                  </Link>
                </td>
                <td className="whitespace-nowrap px-6 py-5 font-semibold text-slate-700">
                  {formatKpiValue(contract.contractAmount, "currency")}
                </td>
                <td className="whitespace-nowrap px-6 py-5 font-semibold text-slate-700">
                  {contract.contractStartDate}
                </td>
                <td className="whitespace-nowrap px-6 py-5 font-semibold text-slate-700">
                  {contract.contractEndDate}
                </td>
                <td className="whitespace-nowrap px-6 py-5">
                  <StatusBadge
                    tone={
                      contract.archived
                        ? "danger"
                        : contractStatusTone(contract.contractStatus)
                    }
                  >
                    {displayStatus}
                  </StatusBadge>
                </td>
                <td className="whitespace-nowrap px-6 py-5 font-semibold text-slate-500">
                  {contract.lastUpdated}
                </td>
                <td className="px-6 py-5">
                  <div className="flex justify-end gap-2">
                    <ActionLink
                      href={`/dashboard/kpi/contracts/${contract.id}`}
                      label="View"
                    >
                      <Eye className="size-4" />
                    </ActionLink>
                    <ActionLink
                      href={`/dashboard/kpi/contracts/${contract.id}?edit=true`}
                      label="Edit"
                    >
                      <Pencil className="size-4" />
                    </ActionLink>
                    {contract.archived ? (
                      <ActionButton
                        label="Restore"
                        onClick={() => onRestore(contract)}
                      >
                        <RotateCcw className="size-4" />
                      </ActionButton>
                    ) : (
                      <ActionButton
                        label="Archive"
                        onClick={() => onArchive(contract)}
                      >
                        <Archive className="size-4" />
                      </ActionButton>
                    )}
                  </div>
                </td>
                </tr>
              )
            })}
            {!contracts.length ? (
              <tr>
                <td
                  className="px-6 py-8 text-sm font-semibold text-slate-500"
                  colSpan={7}
                >
                  No enterprise revenue records match this filter.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function KpiCreateModal({
  form,
  onCancel,
  onChange,
  onSave,
}: {
  form: KpiForm
  onCancel: () => void
  onChange: (form: KpiForm) => void
  onSave: () => void
}) {
  const updateForm = (patch: Partial<KpiForm>) => {
    onChange({ ...form, ...patch })
  }

  return (
    <ModalShell title="Add KPI" onCancel={onCancel}>
      <div className="grid gap-4">
        <label className="block">
          <FieldLabel>KPI Name</FieldLabel>
          <input
            className={fieldClassName}
            list="kpi-name-options"
            onChange={(event) => updateForm({ name: event.target.value })}
            value={form.name}
          />
          <datalist id="kpi-name-options">
            {kpiNameOptions.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </label>

        <TextAreaField
          label="Description"
          onChange={(value) => updateForm({ description: value })}
          value={form.description}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Service"
            onChange={(value) => updateForm({ service: value as KpiService })}
            options={kpiServices.map((service) => ({ label: service, value: service }))}
            value={form.service}
          />
          <SelectField
            label="Period Type"
            onChange={(value) => updateForm({ periodType: value as KpiPeriodType })}
            options={kpiPeriodTypes.map((periodType) => ({
              label: periodType,
              value: periodType,
            }))}
            value={form.periodType}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Format"
            onChange={(value) => updateForm({ format: value as KpiFormat })}
            options={kpiFormats}
            value={form.format}
          />
          <SelectField
            label="Direction"
            onChange={(value) => updateForm({ direction: value as KpiDirection })}
            options={kpiDirections}
            value={form.direction}
          />
        </div>

        <SelectField
          label="Calculation Type"
          onChange={(value) =>
            updateForm({
              calculationType: value as KpiCalculationType,
              format: value === "manual" ? form.format : "currency",
            })
          }
          options={kpiCalculationTypes}
          value={form.calculationType}
        />

        <div className="grid gap-3 sm:grid-cols-3">
          <ToggleField
            checked={form.showOnOverview}
            label="Show on KPI Overview"
            onChange={() => updateForm({ showOnOverview: !form.showOnOverview })}
          />
          <ToggleField
            checked={form.representative}
            label="Representative KPI"
            onChange={() => updateForm({ representative: !form.representative })}
          />
          <ToggleField
            checked={form.pinned}
            label="Pin KPI"
            onChange={() => updateForm({ pinned: !form.pinned })}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <NumberField
            label="Display Order"
            onChange={(value) => updateForm({ displayOrder: value })}
            value={form.displayOrder}
          />
          <NumberField
            label="Target Value"
            onChange={(value) => updateForm({ targetValue: value })}
            step={form.format === "currency" ? 1000000 : 0.1}
            suffix={form.format === "percentage" ? "%" : undefined}
            value={form.targetValue}
          />
        </div>
      </div>

      <ModalActions onCancel={onCancel} onSave={onSave} saveLabel="Save" />
    </ModalShell>
  )
}

function ContractCreateModal({
  form,
  onCancel,
  onChange,
  onSave,
}: {
  form: ContractForm
  onCancel: () => void
  onChange: (form: ContractForm) => void
  onSave: () => void
}) {
  const updateForm = (patch: Partial<ContractForm>) => {
    onChange({ ...form, ...patch })
  }

  return (
    <ModalShell title="Add Contract" onCancel={onCancel}>
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

      <ModalActions onCancel={onCancel} onSave={onSave} saveLabel="Save" />
    </ModalShell>
  )
}

const fieldClassName =
  "mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-950 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"

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

function NumberField({
  label,
  onChange,
  suffix,
  value,
}: {
  label: string
  onChange: (value: number) => void
  step?: number
  suffix?: string
  value: number
}) {
  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      <div className="mt-2 flex h-11 overflow-hidden rounded-xl border border-slate-200 bg-white focus-within:border-violet-400 focus-within:ring-4 focus-within:ring-violet-500/10">
        <input
          className="min-w-0 flex-1 px-3 text-sm font-semibold text-slate-950 outline-none"
          inputMode="decimal"
          onChange={(event) => onChange(parseEditableNumber(event.target.value))}
          type="text"
          value={formatEditableNumber(value)}
        />
        {suffix ? (
          <span className="flex items-center border-l border-slate-100 bg-slate-50 px-3 text-sm font-bold text-slate-500">
            {suffix}
          </span>
        ) : null}
      </div>
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

function ToggleField({
  checked,
  label,
  onChange,
}: {
  checked: boolean
  label: string
  onChange: () => void
}) {
  return (
    <button
      className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-left"
      onClick={onChange}
      type="button"
    >
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <span
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition",
          checked ? "bg-violet-600" : "bg-slate-300"
        )}
      >
        <span
          className={cn(
            "inline-block size-5 rounded-full bg-white shadow-sm transition",
            checked ? "translate-x-5" : "translate-x-0.5"
          )}
        />
      </span>
    </button>
  )
}

function ArchiveFilterControl({
  activeFilter,
  onChange,
  totals,
}: {
  activeFilter: ArchiveFilter
  onChange: (filter: ArchiveFilter) => void
  totals: Record<ArchiveFilter, number>
}) {
  const filters: ArchiveFilter[] = ["active", "archived", "all"]

  return (
    <div className="inline-flex h-10 w-fit rounded-xl border border-slate-200 bg-slate-50 p-1">
      {filters.map((filter) => (
        <button
          className={cn(
            "rounded-lg px-3 text-xs font-bold capitalize transition",
            activeFilter === filter
              ? "bg-white text-violet-700 shadow-sm"
              : "text-slate-500 hover:text-slate-900"
          )}
          key={filter}
          onClick={() => onChange(filter)}
          type="button"
        >
          {filter} {totals[filter]}
        </button>
      ))}
    </div>
  )
}

function MiniFlag({
  active,
  children,
}: {
  active: boolean
  children: ReactNode
}) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-full px-2 text-[11px] font-bold",
        active ? "bg-violet-50 text-violet-700" : "bg-slate-100 text-slate-500"
      )}
    >
      {children}
    </span>
  )
}

function SearchField({
  onChange,
  placeholder,
  value,
}: {
  onChange: (value: string) => void
  placeholder: string
  value: string
}) {
  return (
    <label className="relative block w-full sm:w-56">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
      <input
        className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type="search"
        value={value}
      />
    </label>
  )
}

function ActionButton({
  children,
  label,
  onClick,
}: {
  children: ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button
      className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 shadow-sm transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
      onClick={onClick}
      type="button"
    >
      {children}
      {label}
    </button>
  )
}

function ActionLink({
  children,
  href,
  label,
}: {
  children: ReactNode
  href: string
  label: string
}) {
  return (
    <Link
      className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 shadow-sm transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
      href={href}
    >
      {children}
      {label}
    </Link>
  )
}

function ModalActions({
  onCancel,
  onSave,
  saveLabel,
}: {
  onCancel: () => void
  onSave: () => void
  saveLabel: string
}) {
  return (
    <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <AdminButton className="sm:w-28" onClick={onCancel}>
        Cancel
      </AdminButton>
      <AdminButton className="sm:w-28" onClick={onSave} variant="primary">
        <Save className="size-4" />
        {saveLabel}
      </AdminButton>
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
              Mock data changes stay in the admin browser state.
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

function contractStatusTone(status: EnterpriseContractStatus) {
  if (status === "Active") {
    return "success"
  }

  if (status === "Expired") {
    return "danger"
  }

  return "neutral"
}

function formatFormValue(
  value: number,
  format: KpiFormat,
  direction: KpiDirection
) {
  return `${direction === "lower" ? "<" : ""}${formatKpiValue(
    value,
    format,
    format === "percentage" ? 1 : 0
  )}`
}

function getDefaultPeriodLabel(periodType: KpiPeriodType) {
  if (periodType === "Quarterly") {
    return "Q2 2026"
  }

  if (periodType === "Yearly") {
    return "2026"
  }

  return "June 2026"
}

function getNextKpiOrder(kpis: KpiConfiguration[]) {
  return Math.max(0, ...kpis.map((kpi) => Number(kpi.displayOrder) || 0)) + 1
}

function matchesArchiveFilter(
  archived: boolean | undefined,
  filter: ArchiveFilter
) {
  if (filter === "all") {
    return true
  }

  return filter === "archived" ? Boolean(archived) : !archived
}

function matchesSearch(search: string, values: string[]) {
  const query = search.trim().toLowerCase()

  if (!query) {
    return true
  }

  return values.some((value) => value.toLowerCase().includes(query))
}

function getRevenueTitle(
  kpi: KpiConfiguration,
  contracts: EnterpriseContract[]
) {
  if (kpi.calculationType !== "totalRevenue") {
    return kpi.description
  }

  const enterpriseRevenue = getActiveEnterpriseRevenue(contracts)
  const totalRevenue = kpi.currentValue + enterpriseRevenue

  return `Subscription Revenue ${formatKpiValue(
    kpi.currentValue,
    "currency"
  )} + Enterprise Revenue ${formatKpiValue(
    enterpriseRevenue,
    "currency"
  )} = Total Revenue ${formatKpiValue(totalRevenue, "currency")}`
}

function normalizeKpiForm(form: KpiForm): KpiForm {
  return {
    ...form,
    displayOrder: Math.max(1, Math.floor(form.displayOrder || 1)),
  }
}

function statusTone(status: string) {
  if (status === "Healthy") {
    return "success"
  }

  if (status === "At Risk") {
    return "danger"
  }

  return "neutral"
}
