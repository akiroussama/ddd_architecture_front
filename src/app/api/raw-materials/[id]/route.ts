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
  params: {
    id: string
  }
}

export async function GET(_: Request, { params }: RouteParams) {
  const material = getRawMaterial(params.id)

  if (!material) {
    return NextResponse.json({ error: "Raw material not found" }, { status: 404 })
  }

  return NextResponse.json(material)
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const payload = await request.json()
  const parsed = PatchSchema.safeParse(payload)

  if (!parsed.success || (!parsed.data.casEcPairs && typeof parsed.data.favorite === "undefined")) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.issues },
      { status: 400 }
    )
  }

  const { casEcPairs, favorite } = parsed.data
  let updated: RawMaterial | undefined

  if (casEcPairs) {
    updated = replaceCasEcPairs(params.id, casEcPairs)
  }

  if (typeof favorite === "boolean") {
    updated = toggleFavorite(params.id, favorite) ?? updated
  }

  if (!updated) {
    return NextResponse.json({ error: "Raw material not found" }, { status: 404 })
  }

  return NextResponse.json(updated)
}
