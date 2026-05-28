import LandingPageDetailClient from "@/components/content/LandingPageDetailClient"
import { landingPages } from "@/components/content/landingPageMock"
import { notFound } from "next/navigation"

export default async function LandingPageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const hasPage = landingPages.some((page) => page.id === id)

  if (!hasPage) {
    notFound()
  }

  return <LandingPageDetailClient pageId={id} />
}

export function generateStaticParams() {
  return landingPages.map((page) => ({ id: page.id }))
}
