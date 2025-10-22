import { NextResponse } from "next/server"
import { z } from "zod"

import { replaceCasEcPairs, getRawMaterial } from "@/lib/rm-store"
import { CasEcPairSchema } from "@/lib/validators"

const PatchSchema = z.object({
  casEcPairs: z.array(CasEcPairSchema),
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

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.issues },
      { status: 400 }
    )
  }

  const updated = replaceCasEcPairs(params.id, parsed.data.casEcPairs)

  if (!updated) {
    return NextResponse.json({ error: "Raw material not found" }, { status: 404 })
  }

  return NextResponse.json(updated)
}
