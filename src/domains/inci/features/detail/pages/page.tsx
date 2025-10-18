import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { InciDetailView } from "@/domains/inci/features/list/components/inci-detail-view"
import { mockInciEntries } from "@/shared/lib/mock-data"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const entry = mockInciEntries.find((e) => e.id === id)

  if (!entry) {
    return {
      title: "Entrée INCI introuvable | GeberGuard PLM",
    }
  }

  return {
    title: `${entry.name} | Référentiel INCI | GeberGuard PLM`,
    description: `Détails de l'entrée INCI ${entry.name} - ${entry.euInventorySource}`,
  }
}

export default async function InciDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const entry = mockInciEntries.find((e) => e.id === id)

  if (!entry) {
    notFound()
  }

  return <InciDetailView entry={entry} />
}
