import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { SubstanceDetailView } from "@/domains/substances/features/detail/components/substance-detail-view"
import {
  getBlacklistsBySubstanceId,
  getRestrictionsBySubstanceId,
  getSimilarSubstances,
  getSubstanceById
} from "@/shared/lib/mock-data"

interface SubstanceDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({ params }: SubstanceDetailPageProps): Promise<Metadata> {
  const { id } = await params
  const substance = getSubstanceById(id)

  if (!substance) {
    return {
      title: "Substance introuvable | GeberGuard PLM"
    }
  }

  const inciEurope = substance.inciEU?.trim() || ""
  const inciUSA = substance.inciUS?.trim() || ""
  const primaryTitle = inciEurope || inciUSA || substance.technicalName || substance.id
  const titleSuffix = "INCI Europe / INCI USA"

  return {
    title: `${primaryTitle} – ${titleSuffix} | GeberGuard PLM`,
    description: `Fiche réglementaire et opérationnelle pour la substance ${primaryTitle}.`
  }
}

export default async function SubstanceDetailPage({ params }: SubstanceDetailPageProps) {
  const { id } = await params
  const substance = getSubstanceById(id)

  if (!substance) {
    notFound()
  }

  const restrictions = getRestrictionsBySubstanceId(substance.id)
  const blacklists = getBlacklistsBySubstanceId(substance.id)
  const similarSubstances = getSimilarSubstances(substance)

  return (
    <SubstanceDetailView
      substance={substance}
      restrictions={restrictions}
      blacklists={blacklists}
      similarSubstances={similarSubstances}
    />
  )
}
