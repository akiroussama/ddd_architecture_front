import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { SubstanceDetailView } from "@/domains/substances/features/detail/components/substance-detail-view"
import { mockSubstances, mockRestrictions, mockBlacklists } from "@/shared/lib/mock-data"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const substance = mockSubstances.find((s) => s.id === id)

  if (!substance) {
    return {
      title: "Substance non trouvée",
    }
  }

  const inciEurope = substance.inciEU?.trim() || ""
  const inciUSA = substance.inciUS?.trim() || ""
  const primaryTitle = inciEurope || inciUSA || substance.technicalName || substance.id
  const titleSuffix = "INCI Europe / INCI USA"

  return {
    title: `${primaryTitle} – ${titleSuffix} | Substance Manager`,
  }
}

export default async function SubstanceDetailPage({ params }: PageProps) {
  const { id } = await params
  const substance = mockSubstances.find((s) => s.id === id)

  if (!substance) {
    notFound()
  }

  const restrictions = mockRestrictions.filter((r) => r.substanceId === id)
  const blacklists = mockBlacklists.filter((bl) =>
    bl.substances.some((s) => s.substanceId === id)
  )

  return (
    <div className="space-y-6">
      <SubstanceDetailView
        substance={substance}
        restrictions={restrictions}
        blacklists={blacklists}
        similarSubstances={[]}
      />
    </div>
  )
}
