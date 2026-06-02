"use client"

import { useMemo, useState } from "react"
import {
  CalendarRange,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Target,
  Trash2,
} from "lucide-react"

import AdminButton from "@/components/admin/AdminButton"
import PageHeader from "@/components/admin/PageHeader"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { cn } from "@/lib/utils"
import {
  formatKpiValue,
  initialKpiGoals,
  kpiPeriodTypes,
  kpiServices,
  type KpiGoal,
  type KpiPeriodType,
  type KpiService,
} from "./kpi-data"

type GoalForm = Omit<KpiGoal, "id">

const emptyGoalForm: GoalForm = {
  d7RetentionTarget: 70,
  d30RetentionTarget: 60,
  mrrTarget: 100000000,
  paidUsersTarget: 1500,
  periodLabel: "June 2026",
  periodType: "Monthly",
  service: "Overall",
  signupsTarget: 5000,
  visitorsTarget: 75000,
}

export default function KpiGoalsClient() {
  const [goals, setGoals] = useState<KpiGoal[]>(initialKpiGoals)
  const [editingId, setEditingId] = useState<string | null>(goals[0]?.id ?? null)
  const [form, setForm] = useState<GoalForm>(() => toGoalForm(goals[0] ?? emptyGoalForm))
  const [feedback, setFeedback] = useState("Mock targets ready")

  const editingGoal = useMemo(
    () => goals.find((goal) => goal.id === editingId) ?? null,
    [editingId, goals]
  )

  const handleAddGoal = () => {
    setEditingId(null)
    setForm(emptyGoalForm)
    setFeedback("New mock goal draft started")
  }

  const handleEditGoal = (goal: KpiGoal) => {
    setEditingId(goal.id)
    setForm(toGoalForm(goal))
    setFeedback(`Editing ${goal.service} ${goal.periodLabel}`)
  }

  const handleDeleteGoal = (goalId: string) => {
    const deletedGoal = goals.find((goal) => goal.id === goalId)
    const nextGoals = goals.filter((goal) => goal.id !== goalId)

    setGoals(nextGoals)

    if (editingId === goalId) {
      setEditingId(nextGoals[0]?.id ?? null)
      setForm(toGoalForm(nextGoals[0] ?? emptyGoalForm))
    }

    setFeedback(`${deletedGoal?.service ?? "Goal"} target deleted in mock state`)
  }

  const handleSaveGoal = () => {
    if (editingId) {
      setGoals((current) =>
        current.map((goal) => (goal.id === editingId ? { ...goal, ...form } : goal))
      )
      setFeedback(`${form.service} ${form.periodLabel} target saved`)
      return
    }

    const newGoal: KpiGoal = {
      ...form,
      id: `goal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    }

    setGoals((current) => [newGoal, ...current])
    setEditingId(newGoal.id)
    setFeedback(`${newGoal.service} ${newGoal.periodLabel} target added`)
  }

  return (
    <DashboardLayout>
      <PageHeader
        breadcrumbs={[{ label: "Dashboards" }, { label: "KPI" }, { label: "Goals" }]}
        title="KPI Goals"
        description="Manage service-level KPI targets with mock add, edit, delete, and save actions."
        actions={
          <AdminButton onClick={handleAddGoal} variant="primary">
            <Plus className="size-4" />
            Add Goal
          </AdminButton>
        }
      />

      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-violet-100 bg-violet-50 px-5 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Target className="size-5 shrink-0 text-violet-600" />
          <p className="font-bold text-violet-700">{feedback}</p>
        </div>
        <p className="font-semibold text-violet-600">
          {goals.length} goal sets in mock state
        </p>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1fr_420px]">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06),0_16px_40px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-950">
                Goal Sets
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Targets by service and reporting period.
              </p>
            </div>
            <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-600">
              <CalendarRange className="size-4 text-violet-600" />
              Monthly / Quarterly / Yearly
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[980px] w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-4">Service</th>
                  <th className="px-6 py-4">Period</th>
                  <th className="px-6 py-4">Visitors</th>
                  <th className="px-6 py-4">Signups</th>
                  <th className="px-6 py-4">Paid Users</th>
                  <th className="px-6 py-4">MRR</th>
                  <th className="px-6 py-4">Retention</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {goals.map((goal) => {
                  const active = editingId === goal.id

                  return (
                    <tr
                      key={goal.id}
                      className={cn(
                        "transition hover:bg-violet-50/40",
                        active && "bg-violet-50/70"
                      )}
                    >
                      <td className="px-6 py-5">
                        <ServicePill service={goal.service} />
                      </td>
                      <td className="whitespace-nowrap px-6 py-5">
                        <p className="font-bold text-slate-950">{goal.periodLabel}</p>
                        <p className="mt-1 text-xs font-semibold text-slate-500">
                          {goal.periodType}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-6 py-5 font-semibold text-slate-700">
                        {goal.visitorsTarget.toLocaleString()}
                      </td>
                      <td className="whitespace-nowrap px-6 py-5 font-semibold text-slate-700">
                        {goal.signupsTarget.toLocaleString()}
                      </td>
                      <td className="whitespace-nowrap px-6 py-5 font-semibold text-slate-700">
                        {goal.paidUsersTarget.toLocaleString()}
                      </td>
                      <td className="whitespace-nowrap px-6 py-5 font-semibold text-slate-700">
                        {formatKpiValue(goal.mrrTarget, "currency")}
                      </td>
                      <td className="whitespace-nowrap px-6 py-5 font-semibold text-slate-700">
                        D7 {goal.d7RetentionTarget}% / D30 {goal.d30RetentionTarget}%
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">
                          <button
                            aria-label={`Edit ${goal.service} ${goal.periodLabel}`}
                            className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
                            onClick={() => handleEditGoal(goal)}
                            type="button"
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            aria-label={`Delete ${goal.service} ${goal.periodLabel}`}
                            className="inline-flex size-9 items-center justify-center rounded-lg border border-rose-100 bg-white text-rose-500 shadow-sm transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                            onClick={() => handleDeleteGoal(goal.id)}
                            type="button"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        <GoalEditor
          editingGoal={editingGoal}
          form={form}
          onAddGoal={handleAddGoal}
          onChange={setForm}
          onSave={handleSaveGoal}
        />
      </div>
    </DashboardLayout>
  )
}

function GoalEditor({
  editingGoal,
  form,
  onAddGoal,
  onChange,
  onSave,
}: {
  editingGoal: KpiGoal | null
  form: GoalForm
  onAddGoal: () => void
  onChange: (form: GoalForm) => void
  onSave: () => void
}) {
  const updateForm = (patch: Partial<GoalForm>) => {
    onChange({ ...form, ...patch })
  }

  const metricFields: Array<{
    key: keyof Pick<
      GoalForm,
      | "d7RetentionTarget"
      | "d30RetentionTarget"
      | "mrrTarget"
      | "paidUsersTarget"
      | "signupsTarget"
      | "visitorsTarget"
    >
    label: string
    suffix?: string
  }> = [
    { key: "visitorsTarget", label: "Visitors Target" },
    { key: "signupsTarget", label: "Signups Target" },
    { key: "paidUsersTarget", label: "Paid Users Target" },
    { key: "mrrTarget", label: "MRR Target" },
    { key: "d7RetentionTarget", label: "D7 Retention Target", suffix: "%" },
    { key: "d30RetentionTarget", label: "D30 Retention Target", suffix: "%" },
  ]

  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-950">
            {editingGoal ? "Edit Goal" : "Add Goal"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {editingGoal
              ? `${editingGoal.service} ${editingGoal.periodLabel}`
              : "Create a new target set in mock state."}
          </p>
        </div>
        <button
          aria-label="Reset goal form"
          className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
          onClick={onAddGoal}
          type="button"
        >
          <RotateCcw className="size-4" />
        </button>
      </div>

      <div className="mt-6 grid gap-4">
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Service
          </span>
          <select
            className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-950 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
            onChange={(event) =>
              updateForm({ service: event.target.value as KpiService })
            }
            value={form.service}
          >
            {kpiServices.map((service) => (
              <option key={service}>{service}</option>
            ))}
          </select>
        </label>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Period Type
            </span>
            <select
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-950 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
              onChange={(event) =>
                updateForm({ periodType: event.target.value as KpiPeriodType })
              }
              value={form.periodType}
            >
              {kpiPeriodTypes.map((periodType) => (
                <option key={periodType}>{periodType}</option>
              ))}
            </select>
          </label>

          <Field
            label="Period Label"
            value={form.periodLabel}
            onChange={(value) => updateForm({ periodLabel: value })}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
          {metricFields.map((field) => (
            <NumberField
              key={field.key}
              label={field.label}
              suffix={field.suffix}
              value={form[field.key]}
              onChange={(value) => updateForm({ [field.key]: value })}
            />
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row xl:flex-col 2xl:flex-row">
        <AdminButton className="flex-1" onClick={onSave} variant="primary">
          <Save className="size-4" />
          Save Goal
        </AdminButton>
        <AdminButton className="flex-1" onClick={onAddGoal}>
          <Plus className="size-4" />
          Add Goal
        </AdminButton>
      </div>
    </aside>
  )
}

function Field({
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
      <input
        className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-950 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      />
    </label>
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

function ServicePill({ service }: { service: KpiService }) {
  const tone =
    service === "Yettey"
      ? "bg-violet-50 text-violet-600 ring-violet-100"
      : service === "VPICK"
        ? "bg-sky-50 text-sky-600 ring-sky-100"
        : "bg-slate-100 text-slate-700 ring-slate-200"

  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-full px-3 text-xs font-bold ring-1",
        tone
      )}
    >
      {service}
    </span>
  )
}

function toGoalForm(goal: GoalForm | KpiGoal): GoalForm {
  return {
    d7RetentionTarget: goal.d7RetentionTarget,
    d30RetentionTarget: goal.d30RetentionTarget,
    mrrTarget: goal.mrrTarget,
    paidUsersTarget: goal.paidUsersTarget,
    periodLabel: goal.periodLabel,
    periodType: goal.periodType,
    service: goal.service,
    signupsTarget: goal.signupsTarget,
    visitorsTarget: goal.visitorsTarget,
  }
}
