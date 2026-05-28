import LandingPageDetailClient from "@/components/content/LandingPageDetailClient"

export default async function LandingPageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <LandingPageDetailClient pageId={id} />
}
