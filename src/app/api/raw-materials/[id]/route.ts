import { NextResponse } from "next/server"
import { z } from "zod"

import { getRawMaterial, replaceCasEcPairs, toggleFavorite } from "@/lib/rm-store"
import { CasEcPairSchema } from "@/lib/validators"
import type { RawMaterial } from "@/shared/types"

const PatchSchema = z.object({
  casEcPairs: z.array(CasEcPairSchema).optional(),
  favorite: z.boolean().optional(),
})

type RouteParams = {
  params: Promise<{
    id: string
  }>
}

export async function GET(_: Request, { params }: RouteParams) {
  const { id } = await params
  const material = getRawMaterial(id)

  if (!material) {
    return NextResponse.json({ error: "Raw material not found" }, { status: 404 })
  }

  return NextResponse.json(material)
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params
  const payload = await request.json()
  const parsed = PatchSchema.safeParse(payload)

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error?.issues },
      { status: 400 }
    )
  }

  if (!parsed.data.casEcPairs && typeof parsed.data.favorite === "undefined") {
    return NextResponse.json(
      { error: "At least one field (casEcPairs or favorite) is required" },
      { status: 400 }
    )
  }

  const { casEcPairs, favorite } = parsed.data
  let updated: RawMaterial | undefined

  if (casEcPairs) {
    updated = replaceCasEcPairs(id, casEcPairs)
  }

  if (typeof favorite === "boolean") {
    updated = toggleFavorite(id, favorite) ?? updated
  }

  if (!updated) {
    return NextResponse.json({ error: "Raw material not found" }, { status: 404 })
  }

  return NextResponse.json(updated)
}
