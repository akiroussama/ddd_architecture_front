import type { CasEcPair, RawMaterial } from "@/shared/types"
import { mockRawMaterials } from "@/shared/lib/raw-materials-mock-data"

let rawMaterialsStore: RawMaterial[] = structuredClone(mockRawMaterials)

export function listRawMaterials(): RawMaterial[] {
  return rawMaterialsStore
}

export function getRawMaterial(id: string): RawMaterial | undefined {
  return rawMaterialsStore.find((material) => material.id === id)
}

export function replaceCasEcPairs(id: string, pairs: CasEcPair[]): RawMaterial | undefined {
  const index = rawMaterialsStore.findIndex((material) => material.id === id)
  if (index === -1) {
    return undefined
  }

  const material = rawMaterialsStore[index]

  const updated: RawMaterial = {
    ...material,
    casEcPairs: structuredClone(pairs),
    updatedAt: new Date().toISOString(),
  }

  rawMaterialsStore[index] = updated
  return updated
}

export function setRawMaterials(items: RawMaterial[]): void {
  rawMaterialsStore = structuredClone(items)
}
