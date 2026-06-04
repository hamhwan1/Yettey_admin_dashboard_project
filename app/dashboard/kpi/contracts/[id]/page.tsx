import KpiContractDetailClient from "@/components/kpi/KpiContractDetailClient"

export default async function KpiContractDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ edit?: string }>
}) {
  const { id } = await params
  const { edit } = await searchParams

  return <KpiContractDetailClient contractId={id} initialEditOpen={edit === "true"} />
}
