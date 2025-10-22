import { NextResponse } from "next/server"

import { applySearch, parseQuery, serializeParsedQuery } from "@/lib/rm-search"
import { listRawMaterials } from "@/lib/rm-store"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const q = url.searchParams.get("q") ?? ""
  const limit = resolveLimit(url.searchParams.get("limit"))

  const parsed = parseQuery(q)
  const dataset = listRawMaterials()
  const { matches, order } = applySearch(dataset, parsed)
  const items = matches.slice(0, limit)

  return NextResponse.json(
    {
      items,
      order,
      queryEcho: serializeParsedQuery(parsed),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  )
}

function resolveLimit(raw: string | null): number {
  const fallback = 50
  if (!raw) return fallback
  const parsed = Number.parseInt(raw, 10)
  if (Number.isNaN(parsed) || parsed <= 0) return fallback
  return Math.min(parsed, 200)
}
