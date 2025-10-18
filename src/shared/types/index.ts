// CAS/EINECS Pair for substance identification
export interface CasEinecsPair {
  id: string
  cas: string // Can be "Not Available" or actual CAS number
  einecs?: string // Optional EINECS number
  source?: string // Origin of data (e.g., "Supplier documentation", "Regulatory list", "Literature reference")
  createdAt: string
  createdBy: string
}

export interface Substance {
  id: string
  // Required INCI Names (linked to INCI Table)
  inciEU: string
  inciUS: string

  // Optional INCI Aliases
  inciMixed?: string
  inciBrazil?: string
  inciChina?: string
  technicalName?: string
  canadianTrivialName?: string

  // CAS/EINECS Identifiers (can have multiple pairs)
  casEinecsPairs: CasEinecsPair[]

  // Classification
  class?: string
  families: string[]
  allergenGroup?: string
  allergens26: string[] // List of 26 allergens present in this substance

  // Functions
  functions: string[] // From defined list
  functionsInventory: string[] // As per official inventory

  // Regulatory data
  restrictions: RestrictionSummary[]
  blacklists: string[]
  documents: Document[]
  notes: RegulatoryNote[]

  // Metadata
  status: SubstanceStatus
  createdAt: string
  createdBy: string
  updatedAt: string
  updatedBy: string
}

export interface Restriction {
  id: string
  substanceId: string
  country: string
  type: "listed" | "unlisted" | "regulated" | "forbidden"
  maxPercentage?: number
  applications: string[]
  observations?: string
  internalComment?: string
  labelingRequirements?: string
  reference?: string
  revisionDate?: string
  createdAt: string
  createdBy: string
  updatedAt: string
  updatedBy: string
}

export interface RestrictionSummary {
  country: string
  type: "listed" | "unlisted" | "regulated" | "forbidden"
  maxPercentage?: number
}

export interface Blacklist {
  id: string
  name: string
  brand?: string
  substancesCount: number
  substances: BlacklistSubstance[]
  documents: BlacklistDocument[]
  createdAt: string
  createdBy: string
  updatedAt: string
  updatedBy: string
}

export interface BlacklistSubstance {
  substanceId: string
  inciEU: string
  maxPercentage: number
  minPercentage?: number
  comment?: string
  createdAt: string
  createdBy: string
  updatedAt: string
  updatedBy: string
}

export interface BlacklistDocument {
  id: string
  name: string
  version: string
  versionComment?: string
  uploadDate: string
  uploadedBy: string
  fileUrl: string
}

export interface Document {
  id: string
  name: string
  comment?: string
  fileUrl: string
  category?: string
  renewable?: boolean
  expiresAt?: string
  createdAt: string
  createdBy: string
  updatedAt: string
  updatedBy: string
}

export interface NoteAttachment {
  id: string
  name: string
  type: "pdf" | "excel" | "word" | "image" | "other"
  url: string
  size?: string
  uploadedAt: string
}

export interface RegulatoryNote {
  id: string
  content: string
  createdAt: string
  createdBy: string
  attachments?: NoteAttachment[]
}

export interface InciEntry {
  id: string
  name: string
  annexReference?: string
  usMonograph?: string
  euInventorySource: string
  usInventorySource: string
  comment?: string
  synonyms?: string[]
  createdAt: string
  createdBy: string
  updatedAt: string
  updatedBy: string
}

export type RestrictionType = Restriction["type"]
export type RestrictionCountry = Restriction["country"]
export type SubstanceStatus = "active" | "archived" | "under-review"

// Substance Manager Types
export interface InciAlias {
  id: string
  type: "synonym" | "variant" | "deprecated" | "regional"
  linkedInci: string
}

export interface SubstanceFormData {
  // Section 1: Identification
  id: string
  inciEU: string
  inciUS: string

  // Section 2: Alias INCI
  aliases: InciAlias[]

  // Section 3: CAS/EINECS (using CasEinecsPair)
  casEinecsPairs: CasEinecsPair[]

  // Section 4: Classification
  class?: string
  families: string[]
  allergenGroup?: string
  allergens26: string[] // List of 26 allergens present

  // Section 5: Functions
  functions: string[]
  functionsInventory: string[]

  // Section 6: Notes
  notes: RegulatoryNote[]
}

// Raw Materials Module Types
export type RawMaterialStatus =
  | "active"
  | "pending"
  | "discontinued"
  | "restricted"
  | "approved"
  | "review"

export interface Site {
  id: string
  code: string
  name: string
  location: string
  country: string
  codePattern: string // e.g., "PAR-{year}-{seq}"
  active: boolean
}

export interface Company {
  id: string
  name: string
  type: "supplier" | "manufacturer" | "both"
  logo?: string
  contact?: string
  email?: string
  country?: string
}

export interface RawMaterial {
  id: string
  commercialName: string
  supplierId: string
  siteId: string
  siteCode: string // Site-specific code (e.g., PAR-2024-001)
  status: RawMaterialStatus

  // INCI & Composition
  inciName: string
  inciId?: string // Reference to InciEntry
  cas?: string
  einecs?: string
  percentage?: number

  // Additional Info
  grade?: string
  origin?: string
  batch?: string
  expiryDate?: string
  certifications?: string[]

  // Metadata
  createdAt: string
  createdBy: string
  updatedAt: string
  updatedBy: string

  // References
  documents?: Document[]
  notes?: RegulatoryNote[]
}

export interface RawMaterialFilters {
  searchTerm: string
  siteId: string | null
  siteCode: string | null
  status: RawMaterialStatus | "all"
  supplierId: string | null
  inciName: string | null
}
