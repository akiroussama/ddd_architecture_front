import { notFound } from "next/navigation"

import { RMDetailClient } from "@/components/rm/RMDetailClient"
import { applySearch, parseQuery } from "@/lib/rm-search"
import { getRawMaterial, listRawMaterials } from "@/lib/rm-store"

type PageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ q?: string }>
}

export default async function RawMaterialDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params
  const { q } = await searchParams
  const query = typeof q === "string" ? q : ""
  const material = getRawMaterial(id)

  if (!material) {
    notFound()
  }

  // Compute initial search results
  const dataset = listRawMaterials()
  const parsed = parseQuery(query)
  const searchComputation = applySearch(dataset, parsed)
  const initialResults = searchComputation.matches
  const initialOrder = searchComputation.order

  return (
    <RMDetailClient
      material={material}
      initialResults={initialResults}
      initialOrder={initialOrder}
      initialQuery={query}
    />
  )
}
