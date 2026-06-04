"use client"

import { useMemo, useState } from "react"
import {
  Building2,
  CalendarRange,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Settings2,
  Trash2,
} from "lucide-react"

import AdminButton from "@/components/admin/AdminButton"
import PageHeader from "@/components/admin/PageHeader"
import StatusBadge from "@/components/admin/StatusBadge"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { useKpiManagementStore } from "@/lib/kpi-management-store"
import { cn } from "@/lib/utils"
import {
  createKpiId,
  formatKpiTarget,
  formatKpiValue,
  getActiveEnterpriseRevenue,
  getKpiCurrentValue,
  initialEnterpriseContracts,
  initialKpiConfigurations,
  kpiNameOptions,
  kpiPeriodTypes,
  kpiServices,
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

type ContractForm = Omit<EnterpriseContract, "id">

type KpiForm = Omit<KpiConfiguration, "id">

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
  currentValue: 0,
  description: "Describe why this KPI matters and how admins should interpret it.",
  direction: "higher",
  displayOrder: 11,
  format: "percentage",
  name: "New KPI",
  periodLabel: "June 2026",
  periodType: "Monthly",
  pinned: false,
  precision: 1,
  riskThreshold: 80,
  service: "Overall",
  showOnOverview: false,
  targetValue: 0,
  tone: "violet",
  trend: { direction: "up", unit: "pp", value: 0 },
}

export default function KpiGoalsClient() {
  const {
    addContract,
    addKpi,
    contracts,
    deleteContract,
    deleteKpi,
    kpis,
    resetKpiManagement,
    updateContract,
    updateKpi,
  } = useKpiManagementStore()
  const sortedKpis = useMemo(
    () => [...kpis].sort((a, b) => a.displayOrder - b.displayOrder),
    [kpis]
  )
  const [selectedKpiId, setSelectedKpiId] = useState<string | null>(
    sortedKpis[0]?.id ?? null
  )
  const [kpiForm, setKpiForm] = useState<KpiForm>(() =>
    toKpiForm(sortedKpis[0] ?? initialKpiConfigurations[0])
  )
  const [selectedContractId, setSelectedContractId] = useState<string | null>(
    contracts[0]?.id ?? null
  )
  const [contractForm, setContractForm] = useState<ContractForm>(() =>
    toContractForm(contracts[0] ?? initialEnterpriseContracts[0])
  )
  const [feedback, setFeedback] = useState("Business KPI configuration ready")

  const selectedKpi = useMemo(
    () => kpis.find((kpi) => kpi.id === selectedKpiId) ?? null,
    [kpis, selectedKpiId]
  )
  const selectedContract = useMemo(
    () => contracts.find((contract) => contract.id === selectedContractId) ?? null,
    [contracts, selectedContractId]
  )
  const activeEnterpriseRevenue = getActiveEnterpriseRevenue(contracts)

  const handleAddKpi = () => {
    const nextOrder =
      Math.max(0, ...kpis.map((kpi) => Number(kpi.displayOrder) || 0)) + 1

    setSelectedKpiId(null)
    setKpiForm({ ...emptyKpiForm, displayOrder: nextOrder })
    setFeedback("New KPI definition draft started")
  }

  const handleEditKpi = (kpi: KpiConfiguration) => {
    setSelectedKpiId(kpi.id)
    setKpiForm(toKpiForm(kpi))
    setFeedback(`Editing ${kpi.name}`)
  }

  const handleDeleteKpi = (kpiId: string) => {
    const deleted = kpis.find((kpi) => kpi.id === kpiId)
    const nextKpis = sortedKpis.filter((kpi) => kpi.id !== kpiId)

    deleteKpi(kpiId)

    if (selectedKpiId === kpiId) {
      setSelectedKpiId(nextKpis[0]?.id ?? null)
      setKpiForm(nextKpis[0] ? toKpiForm(nextKpis[0]) : emptyKpiForm)
    }

    setFeedback(`${deleted?.name ?? "KPI"} removed from tracked KPI list`)
  }

  const handleSaveKpi = () => {
    const normalizedForm = normalizeKpiForm(kpiForm)

    if (selectedKpiId) {
      updateKpi(selectedKpiId, normalizedForm)
      setKpiForm(normalizedForm)
      setFeedback(`${normalizedForm.name} configuration saved`)
      return
    }

    const newKpi: KpiConfiguration = {
      ...normalizedForm,
      id: createKpiId(normalizedForm.name),
    }

    addKpi(newKpi)
    setSelectedKpiId(newKpi.id)
    setKpiForm(toKpiForm(newKpi))
    setFeedback(`${newKpi.name} added to tracked KPIs`)
  }

  const handleToggleKpi = (
    kpi: KpiConfiguration,
    key: "pinned" | "showOnOverview"
  ) => {
    const nextValue = !kpi[key]
    updateKpi(kpi.id, { [key]: nextValue })

    if (selectedKpiId === kpi.id) {
      setKpiForm((current) => ({ ...current, [key]: nextValue }))
    }
  }

  const handleAddContract = () => {
    setSelectedContractId(null)
    setContractForm(emptyContractForm)
    setFeedback("New enterprise revenue draft started")
  }

  const handleEditContract = (contract: EnterpriseContract) => {
    setSelectedContractId(contract.id)
    setContractForm(toContractForm(contract))
    setFeedback(`Editing ${contract.companyName}`)
  }

  const handleDeleteContract = (contractId: string) => {
    const deleted = contracts.find((contract) => contract.id === contractId)
    const nextContracts = contracts.filter((contract) => contract.id !== contractId)

    deleteContract(contractId)

    if (selectedContractId === contractId) {
      setSelectedContractId(nextContracts[0]?.id ?? null)
      setContractForm(
        nextContracts[0] ? toContractForm(nextContracts[0]) : emptyContractForm
      )
    }

    setFeedback(`${deleted?.companyName ?? "Enterprise contract"} removed`)
  }

  const handleSaveContract = () => {
    if (selectedContractId) {
      updateContract(selectedContractId, contractForm)
      setFeedback(`${contractForm.companyName} enterprise revenue saved`)
      return
    }

    const newContract: EnterpriseContract = {
      ...contractForm,
      id: `enterprise-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    }

    addContract(newContract)
    setSelectedContractId(newContract.id)
    setContractForm(toContractForm(newContract))
    setFeedback(`${newContract.companyName} enterprise revenue added`)
  }

  const handleResetMock = () => {
    resetKpiManagement()
    setSelectedKpiId(initialKpiConfigurations[0].id)
    setKpiForm(toKpiForm(initialKpiConfigurations[0]))
    setSelectedContractId(initialEnterpriseContracts[0].id)
    setContractForm(toContractForm(initialEnterpriseContracts[0]))
    setFeedback("Business KPI mock data reset")
  }

  return (
    <DashboardLayout>
      <PageHeader
        breadcrumbs={[{ label: "Dashboards" }, { label: "KPI" }, { label: "Management" }]}
        title="Business KPI Management"
        description="Define tracked KPIs, overview visibility, pinned placement, display order, targets, and manual enterprise revenue."
        actions={
          <>
            <AdminButton onClick={handleResetMock}>
              <RotateCcw className="size-4" />
              Reset Mock
            </AdminButton>
            <AdminButton onClick={handleAddKpi} variant="primary">
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
          {kpis.length} tracked KPIs / {kpis.filter((kpi) => kpi.showOnOverview).length} visible
        </p>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1fr_420px]">
        <KpiConfigurationTable
          contracts={contracts}
          kpis={sortedKpis}
          onDelete={handleDeleteKpi}
          onEdit={handleEditKpi}
          onToggle={handleToggleKpi}
          selectedKpiId={selectedKpiId}
        />

        <KpiEditor
          form={kpiForm}
          selectedKpi={selectedKpi}
          onAdd={handleAddKpi}
          onChange={setKpiForm}
          onSave={handleSaveKpi}
        />
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_420px]">
        <EnterpriseRevenueTable
          activeEnterpriseRevenue={activeEnterpriseRevenue}
          contracts={contracts}
          onAdd={handleAddContract}
          onDelete={handleDeleteContract}
          onEdit={handleEditContract}
          selectedContractId={selectedContractId}
        />

        <EnterpriseRevenueEditor
          form={contractForm}
          selectedContract={selectedContract}
          onAdd={handleAddContract}
          onChange={setContractForm}
          onSave={handleSaveContract}
        />
      </div>
    </DashboardLayout>
  )
}

function KpiConfigurationTable({
  contracts,
  kpis,
  onDelete,
  onEdit,
  onToggle,
  selectedKpiId,
}: {
  contracts: EnterpriseContract[]
  kpis: KpiConfiguration[]
  onDelete: (kpiId: string) => void
  onEdit: (kpi: KpiConfiguration) => void
  onToggle: (
    kpi: KpiConfiguration,
    key: "pinned" | "showOnOverview"
  ) => void
  selectedKpiId: string | null
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06),0_16px_40px_rgba(15,23,42,0.06)]">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-950">
            KPI Configuration
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Choose which KPIs exist, where they appear, and how they are ordered.
          </p>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-600">
          <CalendarRange className="size-4 text-violet-600" />
          Monthly / Quarterly / Yearly
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[1160px] w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-6 py-4">KPI</th>
              <th className="px-6 py-4">Overview</th>
              <th className="px-6 py-4">Pinned</th>
              <th className="px-6 py-4">Order</th>
              <th className="px-6 py-4">Service / Period</th>
              <th className="px-6 py-4">Current</th>
              <th className="px-6 py-4">Target</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {kpis.map((kpi) => (
              <tr
                key={kpi.id}
                className={cn(
                  "transition hover:bg-violet-50/40",
                  selectedKpiId === kpi.id && "bg-violet-50/70"
                )}
              >
                <td className="px-6 py-5">
                  <div className="max-w-72">
                    <p className="font-bold text-slate-950">{kpi.name}</p>
                    <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-slate-500">
                      {kpi.description}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <ToggleSwitch
                    checked={kpi.showOnOverview}
                    label={`Show ${kpi.name} on KPI Overview`}
                    onChange={() => onToggle(kpi, "showOnOverview")}
                  />
                </td>
                <td className="px-6 py-5">
                  <ToggleSwitch
                    checked={kpi.pinned}
                    label={`Pin ${kpi.name}`}
                    onChange={() => onToggle(kpi, "pinned")}
                  />
                </td>
                <td className="whitespace-nowrap px-6 py-5 font-bold text-slate-950">
                  {kpi.displayOrder}
                </td>
                <td className="whitespace-nowrap px-6 py-5">
                  <p className="font-bold text-slate-950">{kpi.service}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    {kpi.periodType} / {kpi.periodLabel}
                  </p>
                </td>
                <td className="whitespace-nowrap px-6 py-5 font-semibold text-slate-700">
                  {formatKpiValue(
                    getKpiCurrentValue(kpi, contracts),
                    kpi.format,
                    kpi.precision
                  )}
                </td>
                <td className="whitespace-nowrap px-6 py-5 font-semibold text-slate-700">
                  {formatKpiTarget(kpi)}
                </td>
                <td className="px-6 py-5">
                  <div className="flex justify-end gap-2">
                    <IconButton label={`Edit ${kpi.name}`} onClick={() => onEdit(kpi)}>
                      <Pencil className="size-4" />
                    </IconButton>
                    <IconButton
                      danger
                      label={`Delete ${kpi.name}`}
                      onClick={() => onDelete(kpi.id)}
                    >
                      <Trash2 className="size-4" />
                    </IconButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function KpiEditor({
  form,
  onAdd,
  onChange,
  onSave,
  selectedKpi,
}: {
  form: KpiForm
  onAdd: () => void
  onChange: (form: KpiForm) => void
  onSave: () => void
  selectedKpi: KpiConfiguration | null
}) {
  const updateForm = (patch: Partial<KpiForm>) => {
    onChange({ ...form, ...patch })
  }
  const valueStep = form.format === "currency" ? 1000000 : form.format === "number" ? 1 : 0.1
  const valueSuffix = form.format === "percentage" ? "%" : undefined

  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-950">
            {selectedKpi ? "Edit KPI" : "Add KPI"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {selectedKpi ? selectedKpi.name : "Create a new tracked business KPI."}
          </p>
        </div>
        <IconButton label="Start new KPI" onClick={onAdd}>
          <Plus className="size-4" />
        </IconButton>
      </div>

      <div className="mt-6 grid gap-4">
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
            KPI Name
          </span>
          <input
            className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-950 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
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

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
          <ToggleField
            checked={form.showOnOverview}
            label="Show on KPI Overview"
            onChange={() => updateForm({ showOnOverview: !form.showOnOverview })}
          />
          <ToggleField
            checked={form.pinned}
            label="Pinned KPI"
            onChange={() => updateForm({ pinned: !form.pinned })}
          />
        </div>

        <NumberField
          label="Display Order"
          onChange={(value) => updateForm({ displayOrder: value })}
          value={form.displayOrder}
        />

        <TextAreaField
          label="Description"
          onChange={(value) => updateForm({ description: value })}
          value={form.description}
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
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

        <Field
          label="Period Label"
          onChange={(value) => updateForm({ periodLabel: value })}
          value={form.periodLabel}
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
          <SelectField
            label="Format"
            onChange={(value) =>
              updateForm({ format: value as KpiFormat, precision: value === "percentage" ? 1 : 0 })
            }
            options={kpiFormats}
            value={form.format}
          />
          <SelectField
            label="Direction"
            onChange={(value) =>
              updateForm({
                direction: value as KpiDirection,
                targetPrefix: value === "lower" ? "<" : undefined,
              })
            }
            options={kpiDirections}
            value={form.direction}
          />
        </div>

        <SelectField
          label="Calculation"
          onChange={(value) =>
            updateForm({
              calculationType: value as KpiCalculationType,
              format: value === "manual" ? form.format : "currency",
            })
          }
          options={kpiCalculationTypes}
          value={form.calculationType}
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
          <NumberField
            label={
              form.calculationType === "totalRevenue"
                ? "Subscription Revenue"
                : "Current Value"
            }
            onChange={(value) => updateForm({ currentValue: value })}
            step={valueStep}
            suffix={valueSuffix}
            value={form.currentValue}
          />
          <NumberField
            label="Target Value"
            onChange={(value) => updateForm({ targetValue: value })}
            step={valueStep}
            suffix={valueSuffix}
            value={form.targetValue}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
          <NumberField
            label="Trend Value"
            onChange={(value) =>
              updateForm({ trend: { ...form.trend, value } })
            }
            step={form.trend.unit === "pp" ? 0.1 : 0.1}
            suffix={form.trend.unit}
            value={form.trend.value}
          />
          <SelectField
            label="Trend Direction"
            onChange={(value) =>
              updateForm({
                trend: { ...form.trend, direction: value as "down" | "up" },
              })
            }
            options={[
              { label: "Up", value: "up" },
              { label: "Down", value: "down" },
            ]}
            value={form.trend.direction}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
          <SelectField
            label="Trend Unit"
            onChange={(value) =>
              updateForm({ trend: { ...form.trend, unit: value as "%" | "pp" } })
            }
            options={[
              { label: "Percentage Point", value: "pp" },
              { label: "Percent", value: "%" },
            ]}
            value={form.trend.unit}
          />
          <SelectField
            label="Tone"
            onChange={(value) => updateForm({ tone: value as KpiTone })}
            options={kpiTones.map((tone) => ({ label: tone, value: tone }))}
            value={form.tone}
          />
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row xl:flex-col 2xl:flex-row">
        <AdminButton className="flex-1" onClick={onSave} variant="primary">
          <Save className="size-4" />
          Save KPI
        </AdminButton>
        <AdminButton className="flex-1" onClick={onAdd}>
          <Plus className="size-4" />
          Add KPI
        </AdminButton>
      </div>
    </aside>
  )
}

function EnterpriseRevenueTable({
  activeEnterpriseRevenue,
  contracts,
  onAdd,
  onDelete,
  onEdit,
  selectedContractId,
}: {
  activeEnterpriseRevenue: number
  contracts: EnterpriseContract[]
  onAdd: () => void
  onDelete: (contractId: string) => void
  onEdit: (contract: EnterpriseContract) => void
  selectedContractId: string | null
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06),0_16px_40px_rgba(15,23,42,0.06)]">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-950">
            Enterprise Revenue Management
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Manually manage enterprise contracts used in total revenue calculations.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">
            <Building2 className="size-4" />
            {formatKpiValue(activeEnterpriseRevenue, "currency")} active
          </div>
          <AdminButton className="h-10" onClick={onAdd}>
            <Plus className="size-4" />
            Add Contract
          </AdminButton>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[980px] w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-6 py-4">Company</th>
              <th className="px-6 py-4">Contract Amount</th>
              <th className="px-6 py-4">Contract Dates</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Notes</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {contracts.map((contract) => (
              <tr
                key={contract.id}
                className={cn(
                  "transition hover:bg-violet-50/40",
                  selectedContractId === contract.id && "bg-violet-50/70"
                )}
              >
                <td className="whitespace-nowrap px-6 py-5 font-bold text-slate-950">
                  {contract.companyName}
                </td>
                <td className="whitespace-nowrap px-6 py-5 font-semibold text-slate-700">
                  {formatKpiValue(contract.contractAmount, "currency")}
                </td>
                <td className="whitespace-nowrap px-6 py-5 text-slate-700">
                  <p className="font-semibold">{contract.contractStartDate}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    to {contract.contractEndDate}
                  </p>
                </td>
                <td className="whitespace-nowrap px-6 py-5">
                  <StatusBadge tone={contractStatusTone(contract.contractStatus)}>
                    {contract.contractStatus}
                  </StatusBadge>
                </td>
                <td className="px-6 py-5">
                  <p className="line-clamp-2 max-w-72 text-sm font-medium leading-5 text-slate-600">
                    {contract.notes}
                  </p>
                </td>
                <td className="px-6 py-5">
                  <div className="flex justify-end gap-2">
                    <IconButton
                      label={`Edit ${contract.companyName}`}
                      onClick={() => onEdit(contract)}
                    >
                      <Pencil className="size-4" />
                    </IconButton>
                    <IconButton
                      danger
                      label={`Delete ${contract.companyName}`}
                      onClick={() => onDelete(contract.id)}
                    >
                      <Trash2 className="size-4" />
                    </IconButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function EnterpriseRevenueEditor({
  form,
  onAdd,
  onChange,
  onSave,
  selectedContract,
}: {
  form: ContractForm
  onAdd: () => void
  onChange: (form: ContractForm) => void
  onSave: () => void
  selectedContract: EnterpriseContract | null
}) {
  const updateForm = (patch: Partial<ContractForm>) => {
    onChange({ ...form, ...patch })
  }

  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-950">
            {selectedContract ? "Edit Contract" : "Add Contract"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {selectedContract
              ? selectedContract.companyName
              : "Create a new manual enterprise revenue item."}
          </p>
        </div>
        <IconButton label="Start new contract" onClick={onAdd}>
          <Plus className="size-4" />
        </IconButton>
      </div>

      <div className="mt-6 grid gap-4">
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
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
          <Field
            label="Contract Start Date"
            onChange={(value) => updateForm({ contractStartDate: value })}
            type="date"
            value={form.contractStartDate}
          />
          <Field
            label="Contract End Date"
            onChange={(value) => updateForm({ contractEndDate: value })}
            type="date"
            value={form.contractEndDate}
          />
        </div>
        <SelectField
          label="Contract Status"
          onChange={(value) =>
            updateForm({ contractStatus: value as EnterpriseContractStatus })
          }
          options={contractStatuses.map((status) => ({
            label: status,
            value: status,
          }))}
          value={form.contractStatus}
        />
        <TextAreaField
          label="Notes"
          onChange={(value) => updateForm({ notes: value })}
          value={form.notes}
        />
      </div>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row xl:flex-col 2xl:flex-row">
        <AdminButton className="flex-1" onClick={onSave} variant="primary">
          <Save className="size-4" />
          Save Contract
        </AdminButton>
        <AdminButton className="flex-1" onClick={onAdd}>
          <Plus className="size-4" />
          Add Contract
        </AdminButton>
      </div>
    </aside>
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
      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <input
        className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-950 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
        onChange={(event) => onChange(event.target.value)}
        type={type}
        value={value}
      />
    </label>
  )
}

function NumberField({
  label,
  onChange,
  step = 1,
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
      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <div className="mt-2 flex h-11 overflow-hidden rounded-xl border border-slate-200 bg-white focus-within:border-violet-400 focus-within:ring-4 focus-within:ring-violet-500/10">
        <input
          className="min-w-0 flex-1 px-3 text-sm font-semibold text-slate-950 outline-none"
          min={0}
          onChange={(event) => onChange(Number(event.target.value))}
          step={step}
          type="number"
          value={value}
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
      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <select
        className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-950 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
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
      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </span>
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
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <ToggleSwitch checked={checked} label={label} onChange={onChange} />
    </div>
  )
}

function ToggleSwitch({
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
      aria-checked={checked}
      aria-label={label}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-500/15",
        checked ? "bg-violet-600" : "bg-slate-300"
      )}
      onClick={onChange}
      role="switch"
      type="button"
    >
      <span
        className={cn(
          "inline-block size-5 rounded-full bg-white shadow-sm transition",
          checked ? "translate-x-5" : "translate-x-0.5"
        )}
      />
    </button>
  )
}

function IconButton({
  children,
  danger,
  label,
  onClick,
}: {
  children: React.ReactNode
  danger?: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      aria-label={label}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-lg border bg-white shadow-sm transition",
        danger
          ? "border-rose-100 text-rose-500 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
          : "border-slate-200 text-slate-600 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
      )}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
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

function normalizeKpiForm(form: KpiForm): KpiForm {
  return {
    ...form,
    displayOrder: Math.max(1, Math.floor(form.displayOrder || 1)),
    precision: form.format === "percentage" ? form.precision ?? 1 : 0,
    targetPrefix: form.direction === "lower" ? "<" : undefined,
  }
}

function toContractForm(contract: ContractForm | EnterpriseContract): ContractForm {
  return {
    companyName: contract.companyName,
    contractAmount: contract.contractAmount,
    contractEndDate: contract.contractEndDate,
    contractStartDate: contract.contractStartDate,
    contractStatus: contract.contractStatus,
    notes: contract.notes,
  }
}

function toKpiForm(kpi: KpiConfiguration): KpiForm {
  return {
    calculationType: kpi.calculationType,
    currentValue: kpi.currentValue,
    description: kpi.description,
    direction: kpi.direction,
    displayOrder: kpi.displayOrder,
    format: kpi.format,
    name: kpi.name,
    periodLabel: kpi.periodLabel,
    periodType: kpi.periodType,
    pinned: kpi.pinned,
    precision: kpi.precision,
    riskThreshold: kpi.riskThreshold,
    service: kpi.service,
    showOnOverview: kpi.showOnOverview,
    targetPrefix: kpi.targetPrefix,
    targetValue: kpi.targetValue,
    tone: kpi.tone,
    trend: kpi.trend,
  }
}
