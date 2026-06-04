import KpiGoalDetailClient from "@/components/kpi/KpiGoalDetailClient"

export default async function KpiGoalDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ edit?: string }>
}) {
  const { id } = await params
  const { edit } = await searchParams

  return <KpiGoalDetailClient initialEditOpen={edit === "true"} kpiId={id} />
}
