import type { RawMaterial, RMStatus } from "@/shared/types"

type TokenMap = Record<string, string[]>

export type ParsedQuery = {
  text: string[]
  tokens: TokenMap
}

export type SearchFacets = {
  status?: RMStatus[]
  site?: string[]
  supplier?: string[]
  originCountry?: string[]
  grade?: string[]
  favorite?: boolean
}

const FIELD_ALIASES: Record<string, string> = {
  cas: "cas",
  einecs: "ec",
  ec: "ec",
  inci: "inci",
  ingredient: "inci",
  fournisseur: "supplier",
  fourn: "supplier",
  supplier: "supplier",
  site: "site",
  statut: "status",
  status: "status",
  state: "status",
  code: "code",
  mp: "code",
  lot: "lot",
  origine: "originCountry",
  pays: "originCountry",
  grade: "grade",
}

const TOKEN_REGEX =
  /(?:(\w+):(?:"([^"]+)"|([^\s]+)))|(?:"([^"]+)"|([^\s]+))/g

const whitespaceRegex = /\s+/g

export function parseQuery(input: string): ParsedQuery {
  const text: string[] = []
  const tokens: TokenMap = {}

  if (!input.trim()) {
    return { text, tokens }
  }

  let match: RegExpExecArray | null
  const clone = input.trim()

  while ((match = TOKEN_REGEX.exec(clone)) !== null) {
    const [_, field, quotedFieldValue, fieldValue, quotedFree, free] = match

    if (field) {
      const normalizedField = FIELD_ALIASES[field.toLowerCase()]
      const value = (quotedFieldValue ?? fieldValue ?? "").trim()

      if (!value) continue

      if (normalizedField) {
        tokens[normalizedField] = tokens[normalizedField] ?? []
        tokens[normalizedField]!.push(value)
      } else {
        text.push(value)
      }
    } else {
      const value = (quotedFree ?? free ?? "").trim()
      if (value) {
        text.push(value)
      }
    }
  }

  return { text, tokens }
}

const CASE_INSENSITIVE_FIELDS = new Set(["cas", "ec", "code"])

export function applySearch(
  data: RawMaterial[],
  parsed: ParsedQuery,
  facets: SearchFacets = {}
): RawMaterial[] {
  if (!data.length) return []

  return data
    .map((item) => ({
      item,
      score: scoreMaterial(item, parsed, facets),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.item)
}

function scoreMaterial(
  material: RawMaterial,
  parsed: ParsedQuery,
  facets: SearchFacets
): number {
  if (!passesFacets(material, facets)) {
    return 0
  }

  if (!matchesTokens(material, parsed.tokens)) {
    return 0
  }

  const baseScore = parsed.text.reduce((total, query) => {
    const fieldScores = searchableFields(material).map((value) =>
      fuzzyScore(value, query)
    )
    const best = Math.max(...fieldScores)
    return best <= 0 ? -Infinity : total + best
  }, 0)

  if (!Number.isFinite(baseScore)) {
    return 0
  }

  const recencyBoost = recencyScore(material.updatedAt)
  const favoriteBoost = material.favorite ? 15 : 0

  return baseScore + recencyBoost + favoriteBoost
}

function passesFacets(material: RawMaterial, facets: SearchFacets): boolean {
  if (facets.status?.length && !facets.status.includes(material.status)) {
    return false
  }
  if (facets.site?.length && !facets.site.includes(material.site)) {
    return false
  }
  if (facets.supplier?.length && !facets.supplier.includes(material.supplier)) {
    return false
  }
  if (
    facets.originCountry?.length &&
    (!material.originCountry || !facets.originCountry.includes(material.originCountry))
  ) {
    return false
  }
  if (
    facets.grade?.length &&
    (!material.grade || !facets.grade.includes(material.grade))
  ) {
    return false
  }
  if (facets.favorite && !material.favorite) {
    return false
  }
  return true
}

function matchesTokens(material: RawMaterial, tokenMap: TokenMap): boolean {
  for (const [field, values] of Object.entries(tokenMap)) {
    const matcher = getFieldMatcher(field)
    if (!matcher) {
      continue
    }

    const matchesAll = values.every((value) => matcher(material, value))
    if (!matchesAll) {
      return false
    }
  }
  return true
}

type FieldMatcher = (material: RawMaterial, value: string) => boolean

function getFieldMatcher(field: string): FieldMatcher | undefined {
  const normalized = field.toLowerCase()

  const matchers: Record<string, FieldMatcher> = {
    cas: (material, value) =>
      material.casEcPairs.some((pair) =>
        compareField(pair.cas, value, CASE_INSENSITIVE_FIELDS.has("cas"))
      ),
    ec: (material, value) =>
      material.casEcPairs.some(
        (pair) => pair.ec && compareField(pair.ec, value, CASE_INSENSITIVE_FIELDS.has("ec"))
      ),
    inci: (material, value) =>
      compareField(material.inci, value),
    supplier: (material, value) =>
      compareField(material.supplier, value),
    site: (material, value) => compareField(material.site, value, true),
    status: (material, value) =>
      compareField(material.status, value),
    code: (material, value) =>
      compareField(material.code, value, true),
    lot: (material, value) =>
      material.lot ? compareField(material.lot, value, true) : false,
    origincountry: (material, value) =>
      material.originCountry ? compareField(material.originCountry, value) : false,
    grade: (material, value) =>
      material.grade ? compareField(material.grade, value) : false,
  }

  return matchers[normalized]
}

function compareField(source: string, query: string, exactOnly = false): boolean {
  const normalizedSource = normalize(source)
  const normalizedQuery = normalize(query)

  if (exactOnly) {
    return normalizedSource === normalizedQuery
  }

  return normalizedSource.includes(normalizedQuery)
}

function searchableFields(material: RawMaterial): string[] {
  return [
    material.commercialName,
    material.inci,
    material.code,
    material.supplier,
    material.site,
    material.status,
    material.originCountry ?? "",
    material.grade ?? "",
    ...(material.keywords ?? []),
  ].filter(Boolean)
}

function fuzzyScore(value: string, query: string): number {
  if (!value || !query) return 0

  const normalizedValue = normalize(value)
  const normalizedQuery = normalize(query)

  if (!normalizedValue || !normalizedQuery) return 0

  if (normalizedValue.includes(normalizedQuery)) {
    const index = normalizedValue.indexOf(normalizedQuery)
    return 80 - Math.min(index, 60)
  }

  const subsequenceScore = subsequence(normalizedValue, normalizedQuery)
  return subsequenceScore
}

function subsequence(value: string, query: string): number {
  let score = 0
  let qi = 0

  for (let vi = 0; vi < value.length && qi < query.length; vi++) {
    if (value[vi] === query[qi]) {
      score += 5
      qi++
    } else if (vi > 0 && value[vi - 1] === query[qi]) {
      score += 1
    }
  }

  return qi === query.length ? Math.max(10, score) : 0
}

function recencyScore(dateIso: string): number {
  const date = Date.parse(dateIso)
  if (Number.isNaN(date)) return 0

  const diffDays = (Date.now() - date) / (1000 * 60 * 60 * 24)
  if (diffDays <= 0) return 20
  if (diffDays > 180) return 0

  return Math.max(0, 20 - diffDays / 3)
}

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(whitespaceRegex, " ")
    .trim()
    .toLowerCase()
}
