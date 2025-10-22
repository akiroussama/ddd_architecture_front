import type {
  CasEcPair,
  RawMaterial,
  RawMaterialBookmark,
  RawMaterialSavedView,
} from "@/shared/types"
import { mockRawMaterials } from "@/shared/lib/raw-materials-mock-data"

type StorageLike = {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

const MEMORY_STORAGE = new Map<string, string>()

const memoryStore: StorageLike = {
  getItem(key) {
    return MEMORY_STORAGE.get(key) ?? null
  },
  setItem(key, value) {
    MEMORY_STORAGE.set(key, value)
  },
  removeItem(key) {
    MEMORY_STORAGE.delete(key)
  },
}

function getStorage(): StorageLike {
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage
  }
  return memoryStore
}

const STORAGE_KEYS = {
  recents: "gg:rm:recents",
  favorites: "gg:rm:favorites",
  views: "gg:rm:views",
  density: "gg:rm:density",
} as const

const MAX_RECENTS = 30
const FAVORITES_LIMIT = 100

type CachedSearch = {
  items: RawMaterial[]
  order: string[]
  queryEcho: string
  timestamp: number
}

let rawMaterialsStore: RawMaterial[] = structuredClone(mockRawMaterials)
const searchCache = new Map<string, CachedSearch>()

bootstrapFavorites()

function bootstrapFavorites() {
  const favorites = listFavorites()
  if (!favorites.length) return
  const favoriteIds = new Set(favorites.map((fav) => fav.id))
  rawMaterialsStore = rawMaterialsStore.map((material) => ({
    ...material,
    favorite: favoriteIds.has(material.id),
  }))
}

function buildBookmark(material: RawMaterial, timestamp?: string): RawMaterialBookmark {
  return {
    id: material.id,
    commercialName: material.commercialName,
    code: material.code,
    inci: material.inci,
    supplier: material.supplier,
    site: material.site,
    status: material.status,
    updatedAt: material.updatedAt,
    timestamp: timestamp ?? new Date().toISOString(),
  }
}

function readStorageArray<T>(key: string): T[] {
  const storage = getStorage()
  try {
    const raw = storage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw) as T[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeStorageArray<T>(key: string, values: T[]) {
  const storage = getStorage()
  storage.setItem(key, JSON.stringify(values))
}

function ensureUniqueById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>()
  const result: T[] = []
  for (const item of items) {
    if (seen.has(item.id)) continue
    seen.add(item.id)
    result.push(item)
  }
  return result
}

export function listRawMaterials(): RawMaterial[] {
  return rawMaterialsStore
}

export function getRawMaterial(id: string): RawMaterial | undefined {
  return rawMaterialsStore.find((material) => material.id === id)
}

export function setRawMaterials(items: RawMaterial[]): void {
  rawMaterialsStore = structuredClone(items)
}

export function replaceCasEcPairs(id: string, pairs: CasEcPair[]): RawMaterial | undefined {
  const index = rawMaterialsStore.findIndex((material) => material.id === id)
  if (index === -1) return undefined

  const updated: RawMaterial = {
    ...rawMaterialsStore[index],
    casEcPairs: structuredClone(pairs),
    updatedAt: new Date().toISOString(),
  }

  rawMaterialsStore[index] = updated
  return updated
}

export function toggleFavorite(id: string, next?: boolean): RawMaterial | undefined {
  const material = getRawMaterial(id)
  if (!material) return undefined

  const target = typeof next === "boolean" ? next : !material.favorite
  material.favorite = target

  const favorites = listFavorites()
  const existingIndex = favorites.findIndex((entry) => entry.id === id)

  if (target) {
    const bookmark = buildBookmark(material)
    const updatedFavorites = ensureUniqueById([bookmark, ...favorites]).slice(0, FAVORITES_LIMIT)
    writeStorageArray(STORAGE_KEYS.favorites, updatedFavorites)
  } else if (existingIndex !== -1) {
    favorites.splice(existingIndex, 1)
    writeStorageArray(STORAGE_KEYS.favorites, favorites)
  }

  return material
}

export function reorderFavorites(ids: string[]): RawMaterialBookmark[] {
  const favorites = listFavorites()
  const map = new Map(favorites.map((fav) => [fav.id, fav] as const))
  const reordered: RawMaterialBookmark[] = []

  ids.forEach((id) => {
    const entry = map.get(id)
    if (entry) reordered.push(entry)
  })

  favorites.forEach((entry) => {
    if (!ids.includes(entry.id)) {
      reordered.push(entry)
    }
  })

  writeStorageArray(STORAGE_KEYS.favorites, reordered.slice(0, FAVORITES_LIMIT))
  return listFavorites()
}

export function listFavorites(): RawMaterialBookmark[] {
  const favorites = readStorageArray<RawMaterialBookmark>(STORAGE_KEYS.favorites)
  favorites.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )
  return favorites
}

export function listRecents(limit: number = MAX_RECENTS): RawMaterialBookmark[] {
  const recents = readStorageArray<RawMaterialBookmark>(STORAGE_KEYS.recents)
  recents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  return recents.slice(0, limit)
}

export function recordRecent(material: RawMaterial): void {
  const bookmark = buildBookmark(material)
  const recents = readStorageArray<RawMaterialBookmark>(STORAGE_KEYS.recents)
  const updated = ensureUniqueById([bookmark, ...recents]).slice(0, MAX_RECENTS)
  writeStorageArray(STORAGE_KEYS.recents, updated)
}

export function removeRecent(id: string): RawMaterialBookmark[] {
  const recents = readStorageArray<RawMaterialBookmark>(STORAGE_KEYS.recents).filter(
    (entry) => entry.id !== id
  )
  writeStorageArray(STORAGE_KEYS.recents, recents)
  return recents
}

export function saveView(
  payload: Omit<RawMaterialSavedView, "id" | "createdAt">
): RawMaterialSavedView {
  const view: RawMaterialSavedView = {
    id: cryptoId(),
    name: payload.name,
    query: payload.query,
    createdAt: new Date().toISOString(),
    color: payload.color,
  }

  const views = listViews()
  const updated = [view, ...views].slice(0, 50)
  writeStorageArray(STORAGE_KEYS.views, updated)
  return view
}

export function deleteView(id: string): RawMaterialSavedView[] {
  const views = listViews().filter((view) => view.id !== id)
  writeStorageArray(STORAGE_KEYS.views, views)
  return views
}

export function listViews(): RawMaterialSavedView[] {
  const views = readStorageArray<RawMaterialSavedView>(STORAGE_KEYS.views)
  views.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
  return views
}

export function updateView(
  id: string,
  updates: Partial<Omit<RawMaterialSavedView, "id" | "createdAt">>
): RawMaterialSavedView | undefined {
  const views = listViews()
  const index = views.findIndex((view) => view.id === id)
  if (index === -1) return undefined

  const updated: RawMaterialSavedView = {
    ...views[index],
    ...updates,
  }

  views[index] = updated
  writeStorageArray(STORAGE_KEYS.views, views)
  return updated
}

export function setDensityPreference(value: "comfortable" | "compact"): void {
  const storage = getStorage()
  storage.setItem(STORAGE_KEYS.density, value)
}

export function getDensityPreference(): "comfortable" | "compact" {
  const storage = getStorage()
  const raw = storage.getItem(STORAGE_KEYS.density)
  return raw === "compact" ? "compact" : "comfortable"
}

export function getCachedSearch(query: string): CachedSearch | undefined {
  return searchCache.get(query)
}

export function setCachedSearch(query: string, data: CachedSearch): void {
  searchCache.set(query, data)
}

export function clearSearchCache(): void {
  searchCache.clear()
}

export function analytics(event: string, detail: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return
  window.dispatchEvent(
    new CustomEvent("rm:analytics", { detail: { event, timestamp: Date.now(), ...detail } })
  )
}

function cryptoId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `id-${Math.random().toString(36).slice(2, 10)}`
}
