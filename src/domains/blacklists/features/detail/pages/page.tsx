import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { BlacklistDetailView } from "@/domains/blacklists/features/list/components/blacklist-detail-view"
import { mockBlacklists, mockSubstances } from "@/shared/lib/mock-data"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const blacklist = mockBlacklists.find((b) => b.id === id)

  if (!blacklist) {
    return {
      title: "Blacklist introuvable | GeberGuard PLM",
    }
  }

  return {
    title: `${blacklist.name} | Blacklists | GeberGuard PLM`,
    description: `Détails de la charte ${blacklist.name} - ${blacklist.brand ?? "Portefeuille global"}`,
  }
}

export default async function BlacklistDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const blacklist = mockBlacklists.find((b) => b.id === id)

  if (!blacklist) {
    notFound()
  }

  return <BlacklistDetailView blacklist={blacklist} substances={mockSubstances} />
}
