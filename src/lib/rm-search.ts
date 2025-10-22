import type { RawMaterial, RMStatus } from "@/shared/types"

import { getCachedSearch, setCachedSearch } from "@/lib/rm-store"

type FieldKey =
  | "cas"
  | "ec"
  | "inci"
  | "code"
  | "supplier"
  | "site"
  | "status"
  | "grade"
  | "origin"
  | "favorite"

const FIELD_ALIASES: Record<string, FieldKey> = {
  cas: "cas",
  einecs: "ec",
  ec: "ec",
  inci: "inci",
  ingredient: "inci",
  code: "code",
  mp: "code",
  fourn: "supplier",
  fournisseur: "supplier",
  supplier: "supplier",
  site: "site",
  statut: "status",
  status: "status",
  state: "status",
  origine: "origin",
  origin: "origin",
  pays: "origin",
  grade: "grade",
  favorite: "favorite",
  favoris: "favorite",
}

const FIELD_LABELS: Record<FieldKey, string> = {
  cas: "CAS",
  ec: "EINECS",
  inci: "INCI",
  code: "Code MP",
  supplier: "Fournisseur",
  site: "Site",
  status: "Statut",
  grade: "Grade",
  origin: "Origine",
  favorite: "Favori",
}

const SERIALIZE_FIELD_NAMES: Record<FieldKey, string> = {
  cas: "cas",
  ec: "ec",
  inci: "inci",
  code: "code",
  supplier: "fourn",
  site: "site",
  status: "statut",
  grade: "grade",
  origin: "origine",
  favorite: "favorite",
}

export type ParsedToken = {
  id: string
  clauseIndex: number
  type: "text" | "field"
  field?: FieldKey
  label: string
  value: string
  normalized: string
  negated: boolean
  raw: string
}

export type ParsedClause = {
  index: number
  tokens: ParsedToken[]
  order: string[]
  textTerms: string[]
  negatedTerms: string[]
  fieldTokens: Record<FieldKey, string[]>
  negatedFieldTokens: Record<FieldKey, string[]>
}

export type ParsedQuery = {
  raw: string
  clauses: ParsedClause[]
  allTokens: ParsedToken[]
}

export type SearchComputation = {
  matches: RawMaterial[]
  order: string[]
}

type MaskResult = {
  masked: string
  replacements: string[]
}

export function parseQuery(rawQuery: string): ParsedQuery {
  const sanitized = (rawQuery ?? "").trim()
  if (!sanitized) {
    return {
      raw: "",
      clauses: [
        {
          index: 0,
          tokens: [],
          order: [],
          textTerms: [],
          negatedTerms: [],
          fieldTokens: {} as Record<FieldKey, string[]>,
          negatedFieldTokens: {} as Record<FieldKey, string[]>,
        },
      ],
      allTokens: [],
    }
  }

  const { masked, replacements } = maskQuotedSegments(sanitized)
  const clauseStrings = splitByOr(masked).map((segment) =>
    restorePlaceholders(segment, replacements)
  )

  const clauses: ParsedClause[] = []
  const allTokens: ParsedToken[] = []

  clauseStrings.forEach((clauseString, clauseIndex) => {
    const clause = parseClause(clauseString, clauseIndex)
    clauses.push(clause)
    allTokens.push(...clause.tokens)
  })

  return {
    raw: sanitized,
    clauses,
    allTokens,
  }
}

function parseClause(clauseString: string, clauseIndex: number): ParsedClause {
  const tokens: ParsedToken[] = []
  const order: string[] = []
  const fieldTokens: Record<FieldKey, string[]> = Object.create(null)
  const negatedFieldTokens: Record<FieldKey, string[]> = Object.create(null)
  const textTerms: string[] = []
  const negatedTerms: string[] = []

  let working = clauseString
  const fieldRegex = /(-?)([a-zA-Z]+):(?:"([^"]*)"|([^\s]+))/g
  let fieldMatch: RegExpExecArray | null
  let counter = 0

  while ((fieldMatch = fieldRegex.exec(clauseString)) !== null) {
    const [, negPrefix, fieldName, quotedValue, bareValue] = fieldMatch
    const canonical = FIELD_ALIASES[fieldName.toLowerCase()]
    const value = (quotedValue ?? bareValue ?? "").trim()
    if (!value) continue

    if (!canonical) {
      continue
    }

    const normalized = normalize(value)
    const token: ParsedToken = {
      id: `field-${clauseIndex}-${counter++}`,
      clauseIndex,
      type: "field",
      field: canonical,
      label: `${FIELD_LABELS[canonical]}: ${value}`,
      value,
      normalized,
      negated: Boolean(negPrefix),
      raw: fieldMatch[0],
    }
    tokens.push(token)
    order.push(token.id)

    const targetMap = token.negated ? negatedFieldTokens : fieldTokens
    if (!targetMap[canonical]) {
      targetMap[canonical] = []
    }
    targetMap[canonical]!.push(normalized)

    working = working.replace(fieldMatch[0], " ")
  }

  const textRegex = /(-?)"([^"]+)"|(-?)([^\s"]+)/g
  let textMatch: RegExpExecArray | null
  while ((textMatch = textRegex.exec(working)) !== null) {
    const negated = Boolean(textMatch[1] ?? textMatch[3])
    const value = (textMatch[2] ?? textMatch[4] ?? "").trim()
    if (!value || value === "OR" || value === "or") continue
    const normalized = normalize(value)
    const token: ParsedToken = {
      id: `text-${clauseIndex}-${counter++}`,
      clauseIndex,
      type: "text",
      label: value,
      value,
      normalized,
      negated,
      raw: textMatch[0],
    }
    tokens.push(token)
    order.push(token.id)
    if (negated) {
      negatedTerms.push(normalized)
    } else {
      textTerms.push(normalized)
    }
  }

  return {
    index: clauseIndex,
    tokens,
    order,
    textTerms,
    negatedTerms,
    fieldTokens,
    negatedFieldTokens,
  }
}

function maskQuotedSegments(input: string): MaskResult {
  const replacements: string[] = []
  let masked = input.replace(/"([^"]*)"/g, (_match, value) => {
    const placeholder = `__Q${replacements.length}__`
    replacements.push(value)
    return placeholder
  })
  masked = masked.replace(/'([^']*)'/g, (_match, value) => {
    const placeholder = `__Q${replacements.length}__`
    replacements.push(value)
    return placeholder
  })
  return { masked, replacements }
}

function restorePlaceholders(segment: string, replacements: string[]): string {
  return segment.replace(/__Q(\d+)__/g, (_match, index) => {
    const replacement = replacements[Number(index)]
    return `"${replacement}"`
  })
}

function splitByOr(masked: string): string[] {
  if (!masked.includes("OR") && !masked.includes("or")) {
    return [masked]
  }
  const parts: string[] = []
  let buffer = ""
  let i = 0
  const length = masked.length
  while (i < length) {
    if (/\s/i.test(masked[i])) {
      buffer += masked[i]
      i++
      continue
    }

    if (
      (masked.slice(i, i + 2).toUpperCase() === "OR") &&
      (i === 0 || /\s/.test(masked[i - 1])) &&
      (i + 2 === length || /\s/.test(masked[i + 2]))
    ) {
      if (buffer.trim()) {
        parts.push(buffer.trim())
      }
      buffer = ""
      i += 2
      continue
    }

    buffer += masked[i]
    i++
  }

  if (buffer.trim()) {
    parts.push(buffer.trim())
  }

  return parts.length ? parts : [masked]
}

export function serializeParsedQuery(parsed: ParsedQuery): string {
  const clauses = parsed.clauses
    .map((clause) => {
      if (!clause.tokens.length) return ""
      const tokens = clause.order
        .map((tokenId) => clause.tokens.find((token) => token.id === tokenId))
        .filter((token): token is ParsedToken => Boolean(token))
      const clauseString = tokens
        .map((token) => serializeToken(token))
        .filter(Boolean)
        .join(" ")
      return clauseString.trim()
    })
    .filter(Boolean)

  return clauses.join(" OR ").trim()
}

function serializeToken(token: ParsedToken): string {
  if (token.type === "field" && token.field) {
    const alias = SERIALIZE_FIELD_NAMES[token.field] ?? token.field
    const needsQuotes = /\s|:/.test(token.value)
    const value = needsQuotes ? `"${token.value}"` : token.value
    return `${token.negated ? "-" : ""}${alias}:${value}`
  }
  const needsQuotes = /\s|:/.test(token.value)
  return `${token.negated ? "-" : ""}${needsQuotes ? `"${token.value}"` : token.value}`
}

export function removeTokenFromQuery(query: string, tokenId: string): string {
  const parsed = parseQuery(query)
  const updatedClauses = parsed.clauses.map((clause) => ({
    ...clause,
    tokens: clause.tokens.filter((token) => token.id !== tokenId),
    order: clause.order.filter((id) => id !== tokenId),
  }))
  const filteredClauses = updatedClauses.filter((clause) => clause.tokens.length > 0)
  const nextParsed: ParsedQuery = {
    raw: query,
    clauses: filteredClauses.length ? filteredClauses : updatedClauses.slice(0, 1),
    allTokens: parsed.allTokens.filter((token) => token.id !== tokenId),
  }
  return serializeParsedQuery(nextParsed)
}

export function applySearch(data: RawMaterial[], parsed: ParsedQuery): SearchComputation {
  const cacheKey = parsed.raw.trim()
  const cached = cacheKey ? getCachedSearch(cacheKey) : undefined
  if (cached) {
    return {
      matches: cached.items,
      order: cached.order,
    }
  }

  const results: Array<{ material: RawMaterial; score: number }> = []

  for (const material of data) {
    let bestScore = Number.NEGATIVE_INFINITY

    for (const clause of parsed.clauses) {
      const clauseResult = evaluateClause(material, clause)
      if (clauseResult === null) continue
      if (clauseResult > bestScore) {
        bestScore = clauseResult
      }
    }

    if (parsed.clauses.length === 0) {
      const defaultScore = baseScore(material)
      bestScore = Math.max(bestScore, defaultScore)
    }

    if (bestScore !== Number.NEGATIVE_INFINITY) {
      results.push({ material, score: bestScore })
    }
  }

  results.sort((a, b) => {
    if (b.score === a.score) {
      return a.material.commercialName.localeCompare(b.material.commercialName, "fr")
    }
    return b.score - a.score
  })

  const matches = results.map((entry) => entry.material)
  const order = matches.map((item) => item.id)

  if (cacheKey) {
    setCachedSearch(cacheKey, {
      items: matches,
      order,
      queryEcho: cacheKey,
      timestamp: Date.now(),
    })
  }

  return { matches, order }
}

function evaluateClause(material: RawMaterial, clause: ParsedClause): number | null {
  let score = 0

  if (!matchesFieldTokens(material, clause.fieldTokens)) {
    return null
  }
  if (!matchesNegatedFieldTokens(material, clause.negatedFieldTokens)) {
    return null
  }

  const textScore = scoreText(material, clause.textTerms)
  if (textScore === null) {
    return clause.textTerms.length ? null : baseScore(material)
  }
  score += textScore

  const negatedText = clause.negatedTerms
  if (negatedText.length && includesAnyText(material, negatedText)) {
    return null
  }

  score += baseScore(material)
  score += bonusForFields(material, clause.fieldTokens)
  return score
}

function matchesFieldTokens(
  material: RawMaterial,
  tokens: Record<FieldKey, string[]>
): boolean {
  for (const key in tokens) {
    const field = key as FieldKey
    const values = tokens[field]!
    if (!values.length) continue

    const matched = values.some((value) => matchesField(material, field, value))
    if (!matched) {
      return false
    }
  }
  return true
}

function matchesNegatedFieldTokens(
  material: RawMaterial,
  tokens: Record<FieldKey, string[]>
): boolean {
  for (const key in tokens) {
    const field = key as FieldKey
    const values = tokens[field]!
    if (!values.length) continue
    const matched = values.some((value) => matchesField(material, field, value))
    if (matched) {
      return false
    }
  }
  return true
}

function matchesField(material: RawMaterial, field: FieldKey, value: string): boolean {
  const target = normalizeFieldValue(material, field)
  switch (field) {
    case "cas":
      return material.casEcPairs.some((pair) => normalize(pair.cas) === value)
    case "ec":
      return material.casEcPairs.some(
        (pair) => pair.ec && normalize(pair.ec) === value
      )
    case "favorite":
      if (value === "false" || value === "0") {
        return !material.favorite
      }
      return Boolean(material.favorite)
    default:
      if (!target) return false
      if (field === "status" || field === "site") {
        return target === value
      }
      return target.includes(value)
  }
}

function normalizeFieldValue(material: RawMaterial, field: FieldKey): string | null {
  switch (field) {
    case "inci":
      return normalize(material.inci)
    case "code":
      return normalize(material.code)
    case "supplier":
      return normalize(material.supplier)
    case "site":
      return normalize(material.site)
    case "status":
      return normalize(material.status)
    case "grade":
      return material.grade ? normalize(material.grade) : null
    case "origin":
      return material.originCountry ? normalize(material.originCountry) : null
    default:
      return null
  }
}

function scoreText(material: RawMaterial, terms: string[]): number | null {
  if (!terms.length) return 0
  let score = 0
  for (const term of terms) {
    const maxScore = Math.max(
      fuzzy(normalize(material.commercialName), term),
      fuzzy(normalize(material.inci), term),
      fuzzy(normalize(material.code), term),
      fuzzy(normalize(material.supplier), term),
      fuzzy(normalize(material.site), term),
      fuzzy(normalize(material.status), term)
    )
    if (maxScore <= 0) {
      return null
    }
    score += maxScore
  }
  return score
}

function includesAnyText(material: RawMaterial, terms: string[]): boolean {
  const haystacks = [
    normalize(material.commercialName),
    normalize(material.inci),
    normalize(material.code),
    normalize(material.supplier),
    normalize(material.site),
    normalize(material.status),
  ]
  return terms.some((term) => haystacks.some((haystack) => haystack.includes(term)))
}

function baseScore(material: RawMaterial): number {
  let score = 10

  if (material.favorite) {
    score += 20
  }

  const updatedAt = Date.parse(material.updatedAt)
  if (!Number.isNaN(updatedAt)) {
    const diffDays = (Date.now() - updatedAt) / (1000 * 60 * 60 * 24)
    const recencyBoost = Math.max(0, 25 - diffDays / 2)
    score += recencyBoost
  }

  return score
}

function bonusForFields(
  material: RawMaterial,
  tokens: Record<FieldKey, string[]>
): number {
  let bonus = 0

  if (tokens.cas?.length) {
    const casValues = material.casEcPairs.map((pair) => normalize(pair.cas))
    if (tokens.cas.some((value) => casValues.includes(value))) {
      bonus += 30
    }
  }
  if (tokens.ec?.length) {
    const ecValues = material.casEcPairs
      .map((pair) => (pair.ec ? normalize(pair.ec) : null))
      .filter((value): value is string => Boolean(value))
    if (tokens.ec.some((value) => ecValues.includes(value))) {
      bonus += 25
    }
  }
  if (tokens.code?.length) {
    const code = normalize(material.code)
    if (tokens.code.includes(code)) {
      bonus += 35
    }
  }
  if (tokens.status?.length) {
    const status = normalize(material.status)
    if (tokens.status.includes(status)) {
      bonus += 10
    }
  }
  if (tokens.site?.length) {
    const site = normalize(material.site)
    if (tokens.site.includes(site)) {
      bonus += 8
    }
  }
  return bonus
}

function fuzzy(source: string, query: string): number {
  if (!source || !query) return 0
  if (source === query) return 90
  if (source.includes(query)) {
    const index = source.indexOf(query)
    return 70 - Math.min(index, 40)
  }

  let score = 0
  let sourceIndex = 0
  let queryIndex = 0

  while (sourceIndex < source.length && queryIndex < query.length) {
    if (source[sourceIndex] === query[queryIndex]) {
      score += 5
      queryIndex++
    } else if (
      sourceIndex > 0 &&
      source[sourceIndex - 1] === query[queryIndex]
    ) {
      score += 1
    }
    sourceIndex++
  }

  return queryIndex === query.length ? Math.max(15, score) : 0
}

function normalize(input: string): string {
  return input
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase()
}

export function formatStatusLabel(status: RMStatus): string {
  return status
}
