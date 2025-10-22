import { NextResponse } from "next/server"

import { applySearch, parseQuery, type SearchFacets } from "@/lib/rm-search"
import { listRawMaterials } from "@/lib/rm-store"
import type { RMStatus } from "@/shared/types"

const STATUS_VALUES: RMStatus[] = [
  "Approuvé",
  "Actif",
  "En attente",
  "En revue",
  "Restreint",
  "Arrêté",
]

const STATUS_LOOKUP = new Map(STATUS_VALUES.map((status) => [normalizeKey(status), status]))

export async function GET(request: Request) {
  const url = new URL(request.url)
  const searchParams = url.searchParams
  const q = searchParams.get("q") ?? ""

  const parsed = parseQuery(q)
  const facets = resolveFacets(searchParams)

  const dataset = listRawMaterials()
  const results = applySearch(dataset, parsed, facets)
  const limit = resolveLimit(searchParams.get("limit"))
  const items = results.slice(0, limit)

  return NextResponse.json({
    items,
    order: items.map((item) => item.id),
    total: results.length,
    query: q,
  })
}

function resolveLimit(raw: string | null): number {
  const fallback = 50
  if (!raw) return fallback
  const parsed = Number.parseInt(raw, 10)
  if (Number.isNaN(parsed) || parsed <= 0) return fallback
  return Math.min(parsed, 200)
}

function resolveFacets(searchParams: URLSearchParams): SearchFacets {
  const facets: SearchFacets = {}

  const statusRaw = normalizeParam(searchParams.getAll("status"))
  if (statusRaw.length) {
    const status = statusRaw
      .map((value) => STATUS_LOOKUP.get(normalizeKey(value)))
      .filter((value): value is RMStatus => Boolean(value))
    if (status.length) facets.status = status
  }

  const site = normalizeParam(searchParams.getAll("site"))
  if (site.length) facets.site = site

  const supplier = normalizeParam(searchParams.getAll("supplier"))
  if (supplier.length) facets.supplier = supplier

  const origin = normalizeParam(searchParams.getAll("origin"))
  if (origin.length) facets.originCountry = origin

  const grade = normalizeParam(searchParams.getAll("grade"))
  if (grade.length) facets.grade = grade

  const favorite = searchParams.get("favorite")
  if (favorite && favorite.toLowerCase() === "true") {
    facets.favorite = true
  }

  return facets
}

function normalizeParam(values: string[]): string[] {
  const allValues = values.flatMap((value) => value.split(","))
  return Array.from(
    new Set(
      allValues
        .map((value) => value.trim())
        .filter((value) => value.length > 0)
    )
  )
}

function normalizeKey(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
}
