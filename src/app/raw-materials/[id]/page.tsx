import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { RawMaterialDetailView } from "@/components/raw-materials/raw-material-detail-view"
import { mockRawMaterials } from "@/lib/raw-materials-mock-data"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const material = mockRawMaterials.find((m) => m.id === id)

  if (!material) {
    return {
      title: "Matière première introuvable | GeberGuard PLM",
    }
  }

  return {
    title: `${material.commercialName} | Matières Premières | GeberGuard PLM`,
    description: `Détails de la matière première ${material.commercialName} - ${material.inciName}`,
  }
}

export default async function RawMaterialDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const material = mockRawMaterials.find((m) => m.id === id)

  if (!material) {
    notFound()
  }

  return <RawMaterialDetailView material={material} />
}
