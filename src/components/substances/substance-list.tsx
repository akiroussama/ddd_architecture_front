"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type { LucideIcon } from "lucide-react"
import {
  AlertTriangle,
  Droplets,
  History,
  ShieldAlert,
  Download,
  Plus,
  Search,
  Upload,
  X
} from "lucide-react"
import type { PaginationState, RowSelectionState, SortingState } from "@tanstack/react-table"

import type { RestrictionType, Substance, SubstanceStatus } from "@/types"

import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { formatDate } from "@/lib/utils"

import { SmartDocumentProcessor } from "../smart-documents/smart-document-processor"
import { MainDashboard, type DashboardAction } from "./main-dashboard"
import { SubstanceFilters, type FilterState } from "./substance-filters"
import { SubstanceTable } from "./substance-table"

type StatusFilter = SubstanceStatus | "all"
type SubstancesTab = "dashboard" | "library" | "smart-docs"

interface SubstanceListProps {
  substances: Substance[]
  pageSizeOptions: number[]
}

const createDefaultFilters = (): FilterState => ({
  classes: [],
  families: [],
  allergenGroups: [],
  allergen26: "any",
  functions: [],
  countries: [],
  restrictionTypes: [],
  blacklists: [],
  showArchived: false
})

const restrictionTypeOrder: RestrictionType[] = ["forbidden", "regulated", "listed", "unlisted"]
const restrictionDisplayOrder: RestrictionType[] = ["forbidden", "regulated", "listed", "unlisted"]
const restrictionLabels: Record<RestrictionType, string> = {
  forbidden: "Interdites",
  regulated: "Sous seuil",
  listed: "Listées",
  unlisted: "Non listées"
}

const csvDelimiter = ";"
const csvHeaders = [
  "INCI EU",
  "INCI US",
  "CAS",
  "Fonctions",
  "Familles",
  "Statut",
  "Restrictions",
  "Blacklists",
  "Dernière mise à jour",
  "Documents",
  "Notes"
]

function escapeCsvValue(value: string | number | boolean | null | undefined) {
  if (value === null || value === undefined) {
    return '""'
  }
  const stringValue = String(value)
  return `"${stringValue.replace(/"/g, '""')}"`
}

function joinCsvRow(values: Array<string | number | boolean | null | undefined>) {
  return values.map((value) => escapeCsvValue(value)).join(csvDelimiter)
}

const statusTabs: Array<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "Toutes" },
  { value: "active", label: "Actives" },
  { value: "under-review", label: "En revue" },
  { value: "archived", label: "Archivées" }
]

function sortStrings(values: Iterable<string>) {
  return Array.from(new Set(values)).filter(Boolean).sort((a, b) => a.localeCompare(b, "fr", { sensitivity: "base" }))
}

type DatasetStatusCounts = {
  total: number
  active: number
  "under-review": number
  archived: number
}

interface QuickFilterPreset {
  id: string
  label: string
  description: string
  icon: LucideIcon
  applyFilters: () => FilterState
  applyStatus?: StatusFilter
  predicate?: (substance: Substance) => boolean
}

const MS_IN_DAY = 86_400_000

function updatedWithinDays(timestamp: string | undefined, days: number) {
  if (!timestamp) return false
  const diff = Date.now() - new Date(timestamp).getTime()
  if (Number.isNaN(diff)) return false
  return diff <= days * MS_IN_DAY
}

const QUICK_FILTER_PRESETS: QuickFilterPreset[] = [
  {
    id: "criticalRestrictions",
    label: "Restrictions critiques",
    description: "Interdites ou seuils réglementés",
    icon: AlertTriangle,
    applyFilters: () => ({
      ...createDefaultFilters(),
      restrictionTypes: ["forbidden", "regulated"]
    })
  },
  {
    id: "allergenFocus",
    label: "Allergènes 26",
    description: "Déclaration allergènes parfum requise",
    icon: Droplets,
    applyFilters: () => ({
      ...createDefaultFilters(),
      allergen26: "yes"
    })
  },
  {
    id: "recentReviews",
    label: "Revue < 90 j",
    description: "Dossiers en revue récents",
    icon: History,
    applyFilters: () => createDefaultFilters(),
    applyStatus: "under-review",
    predicate: (substance) => updatedWithinDays(substance.updatedAt, 90)
  },
  {
    id: "blacklistWatch",
    label: "Surveillance marques",
    description: "Présentes dans des blacklists internes",
    icon: ShieldAlert,
    applyFilters: () => createDefaultFilters(),
    predicate: (substance) => substance.blacklists.length > 0
  }
]

export function SubstanceList({ substances, pageSizeOptions }: SubstanceListProps) {
  const [filters, setFilters] = useState<FilterState>(() => createDefaultFilters())
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [activePreset, setActivePreset] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<SubstancesTab>("dashboard")
  const [sorting, setSorting] = useState<SortingState>([{ id: "updatedAt", desc: true }])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: pageSizeOptions[0] ?? 25
  })

  const applyFilters = useCallback((nextFilters: FilterState, presetId: string | null) => {
    setFilters(nextFilters)
    setActivePreset(presetId)
    setPagination((previous) => ({ ...previous, pageIndex: 0 }))
    setRowSelection({})
  }, [])

  const handleFilterChange = useCallback(
    (next: FilterState) => {
      applyFilters(next, null)
    },
    [applyFilters]
  )

  const handlePresetApply = useCallback(
    (preset: QuickFilterPreset) => {
      if (preset.id === activePreset) {
        applyFilters(createDefaultFilters(), null)
        setStatusFilter("all")
        return
      }

      const nextFilters = preset.applyFilters()
      applyFilters(nextFilters, preset.id)
      if (preset.applyStatus) {
        setStatusFilter(preset.applyStatus)
      } else {
        setStatusFilter("all")
      }
      setSearchTerm("")
    },
    [activePreset, applyFilters]
  )

  const handleDashboardNavigate = useCallback(
    (action: DashboardAction) => {
      switch (action.type) {
        case "focus-substance": {
          const query =
            action.substance.inciEU ??
            action.substance.inciUS ??
            action.substance.inciMixed ??
            action.substance.casEinecsPairs[0]?.cas ??
            ""
          applyFilters(createDefaultFilters(), null)
          setStatusFilter("all")
          setSearchTerm(query)
          setActiveTab("library")
          setRowSelection({ [action.substance.id]: true })
          return
        }
        case "filter": {
          const nextFilters: FilterState = {
            ...createDefaultFilters(),
            countries: action.market ? [action.market] : [],
            restrictionTypes: action.restriction ? [action.restriction] : []
          }
          applyFilters(nextFilters, null)
          setStatusFilter("all")
          setSearchTerm("")
          setRowSelection({})
          setActiveTab("library")
          return
        }
        case "focus-status": {
          setSearchTerm("")
          setRowSelection({})
          setStatusFilter(action.status)
          setActiveTab("library")
          return
        }
        case "open-smart-docs": {
          setActiveTab("smart-docs")
          return
        }
        default:
          return
      }
    },
    [applyFilters, setActiveTab, setRowSelection, setSearchTerm, setStatusFilter]
  )

  const buildCsvContent = useCallback((items: Substance[]) => {
    const headerRow = joinCsvRow(csvHeaders)

    const rows = items.map((substance) => {
      const restrictionSummary = substance.restrictions.length
        ? substance.restrictions
            .map((restriction) => {
              const limit =
                restriction.maxPercentage !== undefined && restriction.maxPercentage !== null
                  ? ` ≤${restriction.maxPercentage}%`
                  : ""
              return `${restriction.country} ${restrictionLabels[restriction.type]}${limit}`
            })
            .join(" | ")
        : "Aucune"

      return joinCsvRow([
        substance.inciEU,
        substance.inciUS,
        substance.casEinecsPairs.map(p => p.cas).join(", "),
        substance.functions.join(", "),
        substance.families.join(", "),
        substance.status,
        restrictionSummary,
        substance.blacklists.join(", "),
        formatDate(substance.updatedAt, "yyyy-MM-dd"),
        substance.documents?.length ?? 0,
        substance.notes?.length ?? 0
      ])
    })

    return [headerRow, ...rows].join("\n")
  }, [])

  const triggerCsvDownload = useCallback(
    (items: Substance[], scopeLabel: string) => {
      if (!items.length) {
        toast.info("Aucune donnée à exporter pour l'instant.")
        return
      }

      if (typeof window === "undefined") {
        return
      }

      const csvContent = buildCsvContent(items)
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      const timestamp = new Date().toISOString().replace(/[:T]/g, "-").split(".")[0]
      link.href = url
      link.setAttribute("download", `substances-${scopeLabel}-${timestamp}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      toast.success(`Export ${scopeLabel} prêt (${items.length} lignes)`)
    },
    [buildCsvContent]
  )

  const filterOptions = useMemo(() => {
    const classes = new Set<string>()
    const families = new Set<string>()
    const allergenGroups = new Set<string>()
    const functions = new Set<string>()
    const countries = new Set<string>()
    const restrictionTypes = new Set<RestrictionType>()
    const blacklists = new Set<string>()

    substances.forEach((substance) => {
      if (substance.class) {
        classes.add(substance.class)
      }

      substance.families.forEach((family) => families.add(family))

      if (substance.allergenGroup) {
        allergenGroups.add(substance.allergenGroup)
      }

      substance.functions.forEach((fn) => functions.add(fn))

      substance.restrictions.forEach((restriction) => {
        countries.add(restriction.country)
        restrictionTypes.add(restriction.type)
      })

      substance.blacklists.forEach((item) => blacklists.add(item))
    })

    const sortedRestrictionTypes = restrictionTypeOrder.filter((type) => restrictionTypes.has(type))

    return {
      classes: sortStrings(classes),
      families: sortStrings(families),
      allergenGroups: sortStrings(allergenGroups),
      functions: sortStrings(functions),
      countries: sortStrings(countries),
      restrictionTypes: sortedRestrictionTypes.length
        ? (sortedRestrictionTypes as readonly string[])
        : (restrictionTypeOrder as readonly string[]),
      blacklists: sortStrings(blacklists)
    }
  }, [substances])

  const selectionCount = useMemo(
    () => Object.values(rowSelection).filter(Boolean).length,
    [rowSelection]
  )

  const datasetStatusCounts = useMemo<DatasetStatusCounts>(() => {
    return substances.reduce(
      (acc, substance) => {
        acc.total += 1
        acc[substance.status] = (acc[substance.status] ?? 0) + 1
        return acc
      },
      { total: 0, active: 0, "under-review": 0, archived: 0 }
    )
  }, [substances])

  const normalizedSearch = searchTerm.trim().toLowerCase()
  const activePresetDefinition = useMemo(
    () => QUICK_FILTER_PRESETS.find((preset) => preset.id === activePreset) ?? null,
    [activePreset]
  )

  const filteredBySearchAndFilters = useMemo(() => {
    return substances.filter((substance) => {
      if (!filters.showArchived && substance.status === "archived") {
        return false
      }

      if (normalizedSearch) {
        const haystack = [
          substance.inciEU,
          substance.inciUS,
          substance.inciMixed,
          substance.inciBrazil,
          substance.inciChina,
          substance.technicalName,
          substance.canadianTrivialName,
          ...substance.casEinecsPairs.map(p => p.cas),
          ...substance.casEinecsPairs.map(p => p.einecs).filter(Boolean),
          ...substance.families,
          ...substance.functions,
          substance.allergenGroup ?? ""
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()

        if (!haystack.includes(normalizedSearch)) {
          return false
        }
      }

      if (filters.classes.length) {
        if (!substance.class || !filters.classes.includes(substance.class)) {
          return false
        }
      }

      if (filters.families.length) {
        if (!substance.families.some((family) => filters.families.includes(family))) {
          return false
        }
      }

      if (filters.allergenGroups.length) {
        if (!substance.allergenGroup || !filters.allergenGroups.includes(substance.allergenGroup)) {
          return false
        }
      }

      if (filters.allergen26 === "yes" && substance.allergens26.length === 0) {
        return false
      }

      if (filters.allergen26 === "no" && substance.allergens26.length > 0) {
        return false
      }

      if (filters.functions.length) {
        if (!substance.functions.some((fn) => filters.functions.includes(fn))) {
          return false
        }
      }

      if (filters.countries.length) {
        const hasCountry = substance.restrictions.some((restriction) =>
          filters.countries.includes(restriction.country)
        )
        if (!hasCountry) {
          return false
        }
      }

      if (filters.restrictionTypes.length) {
        const hasRestrictionType = substance.restrictions.some((restriction) =>
          filters.restrictionTypes.includes(restriction.type)
        )
        if (!hasRestrictionType) {
          return false
        }
      }

      if (filters.blacklists.length) {
        const inBlacklist = substance.blacklists.some((item) =>
          filters.blacklists.includes(item)
        )
        if (!inBlacklist) {
          return false
        }
      }

      if (activePresetDefinition?.predicate && !activePresetDefinition.predicate(substance)) {
        return false
      }

      return true
    })
  }, [activePresetDefinition, filters, normalizedSearch, substances])

  const statusCounts = useMemo(() => {
    return filteredBySearchAndFilters.reduce(
      (acc, substance) => {
        acc[substance.status] = (acc[substance.status] ?? 0) + 1
        acc.all += 1
        return acc
      },
      { all: 0, active: 0, "under-review": 0, archived: 0 } as Record<StatusFilter, number>
    )
  }, [filteredBySearchAndFilters])

  const filteredSubstances = useMemo(() => {
    if (statusFilter === "all") {
      return filteredBySearchAndFilters
    }
    return filteredBySearchAndFilters.filter((substance) => substance.status === statusFilter)
  }, [filteredBySearchAndFilters, statusFilter])

  useEffect(() => {
    setRowSelection((previous) => {
      const next = Object.fromEntries(
        Object.entries(previous).filter(([id]) =>
          filteredSubstances.some((substance) => substance.id === id)
        )
      )
      if (Object.keys(next).length === Object.keys(previous).length) {
        return previous
      }
      return next
    })
  }, [filteredSubstances])

  useEffect(() => {
    setPagination((previous) => {
      const maxPageIndex = Math.max(
        0,
        Math.ceil(filteredSubstances.length / previous.pageSize) - 1
      )
      if (previous.pageIndex <= maxPageIndex) {
        return previous
      }
      return { ...previous, pageIndex: maxPageIndex }
    })
  }, [filteredSubstances.length])

  type RestrictionTotals = Record<RestrictionType, number> & { total: number }

  const regulatorySnapshot = useMemo(() => {
    const map = new Map<string, RestrictionTotals>()

    filteredSubstances.forEach((substance) => {
      substance.restrictions.forEach((restriction) => {
        const entry =
          map.get(restriction.country) ?? {
            forbidden: 0,
            regulated: 0,
            listed: 0,
            unlisted: 0,
            total: 0
          }
        entry.total += 1
        entry[restriction.type] += 1
        map.set(restriction.country, entry)
      })
    })

    return Array.from(map.entries())
      .map(([country, counts]) => ({
        country,
        ...counts,
        critical: counts.forbidden + counts.regulated
      }))
      .sort((a, b) => {
        if (b.critical === a.critical) {
          return b.total - a.total
        }
        return b.critical - a.critical
      })
  }, [filteredSubstances])

  const documentationStats = useMemo(() => {
    const total = filteredSubstances.length
    let missingDocs = 0
    let missingNotes = 0

    filteredSubstances.forEach((substance) => {
      if (!substance.documents || substance.documents.length === 0) {
        missingDocs += 1
      }
      if (!substance.notes || substance.notes.length === 0) {
        missingNotes += 1
      }
    })

    const documented = total - missingDocs
    const coverage = total ? Math.round((documented / total) * 100) : 0

    return {
      total,
      documented,
      missingDocs,
      missingNotes,
      coverage
    }
  }, [filteredSubstances])

  const selectedSubstances = useMemo(
    () => filteredSubstances.filter((substance) => rowSelection[substance.id]),
    [filteredSubstances, rowSelection]
  )

  const handleExportFiltered = useCallback(
    () => triggerCsvDownload(filteredSubstances, "vue-filtrée"),
    [filteredSubstances, triggerCsvDownload]
  )

  const handleExportSelection = useCallback(
    () => triggerCsvDownload(selectedSubstances, "selection"),
    [selectedSubstances, triggerCsvDownload]
  )

  const selectionSummary = useMemo(() => {
    if (!selectedSubstances.length) {
      return null
    }

    const restrictionCounts: Record<RestrictionType, number> = {
      forbidden: 0,
      regulated: 0,
      listed: 0,
      unlisted: 0
    }
    const countryCounts = new Map<string, number>()
    const blacklistCounts = new Map<string, number>()
    const functionCounts = new Map<string, number>()

    selectedSubstances.forEach((substance) => {
      substance.restrictions.forEach((restriction) => {
        restrictionCounts[restriction.type] += 1
        countryCounts.set(
          restriction.country,
          (countryCounts.get(restriction.country) ?? 0) + 1
        )
      })

      substance.blacklists.forEach((name) => {
        blacklistCounts.set(name, (blacklistCounts.get(name) ?? 0) + 1)
      })

      substance.functions.forEach((fn) => {
        functionCounts.set(fn, (functionCounts.get(fn) ?? 0) + 1)
      })
    })

    const topCountries = Array.from(countryCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
    const topFunctions = Array.from(functionCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
    const topBlacklists = Array.from(blacklistCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)

    return {
      total: selectedSubstances.length,
      restrictionCounts,
      topCountries,
      topFunctions,
      topBlacklists
    }
  }, [selectedSubstances])

  const activeFilterChips = useMemo(() => {
    const chips: Array<{ key: string; label: string; onClear: () => void }> = []

    if (filters.classes.length) {
      chips.push({
        key: "classes",
        label: `Classe: ${filters.classes.join(", ")}`,
        onClear: () => handleFilterChange({ ...filters, classes: [] })
      })
    }

    if (filters.families.length) {
      chips.push({
        key: "families",
        label: `Familles: ${filters.families.join(", ")}`,
        onClear: () => handleFilterChange({ ...filters, families: [] })
      })
    }

    if (filters.allergenGroups.length) {
      chips.push({
        key: "allergenGroups",
        label: `Groupes allergènes: ${filters.allergenGroups.join(", ")}`,
        onClear: () => handleFilterChange({ ...filters, allergenGroups: [] })
      })
    }

    if (filters.allergen26 !== "any") {
      chips.push({
        key: "allergen26",
        label: `Allergènes 26: ${filters.allergen26 === "yes" ? "Oui" : "Non"}`,
        onClear: () => handleFilterChange({ ...filters, allergen26: "any" })
      })
    }

    if (filters.functions.length) {
      chips.push({
        key: "functions",
        label: `Fonctions: ${filters.functions.join(", ")}`,
        onClear: () => handleFilterChange({ ...filters, functions: [] })
      })
    }

    if (filters.countries.length) {
      chips.push({
        key: "countries",
        label: `Zones: ${filters.countries.join(", ")}`,
        onClear: () => handleFilterChange({ ...filters, countries: [] })
      })
    }

    if (filters.restrictionTypes.length) {
      chips.push({
        key: "restrictionTypes",
        label: `Restrictions: ${filters.restrictionTypes.join(", ")}`,
        onClear: () => handleFilterChange({ ...filters, restrictionTypes: [] })
      })
    }

    if (filters.blacklists.length) {
      chips.push({
        key: "blacklists",
        label: `Blacklists: ${filters.blacklists.join(", ")}`,
        onClear: () => handleFilterChange({ ...filters, blacklists: [] })
      })
    }

    if (filters.showArchived) {
      chips.push({
        key: "showArchived",
        label: "Inclut archivées",
        onClear: () => handleFilterChange({ ...filters, showArchived: false })
      })
    }

    return chips
  }, [filters, handleFilterChange])

  function handleSearchChange(value: string) {
    setActivePreset(null)
    setSearchTerm(value)
    setPagination((previous) => ({ ...previous, pageIndex: 0 }))
    setRowSelection({})
  }

  function handleResetFilters() {
    applyFilters(createDefaultFilters(), null)
    setStatusFilter("all")
    setSearchTerm("")
  }

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => setActiveTab(value as SubstancesTab)}
      className="space-y-6"
    >
      <TabsList className="grid w-full grid-cols-1 gap-2 sm:w-fit sm:grid-cols-3">
        <TabsTrigger value="dashboard" className="flex items-center gap-1">
          Main Dashboard
          <Badge variant="outline" className="border-primary/40 text-[10px] font-semibold uppercase text-primary">
            Pro
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="library">Bibliothèque</TabsTrigger>
        <TabsTrigger value="smart-docs" className="flex items-center gap-2">
          Smart Documents
          <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">NEW AI</Badge>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="dashboard" className="pt-6">
        <MainDashboard substances={substances} onNavigate={handleDashboardNavigate} />
      </TabsContent>
      <TabsContent value="library" className="space-y-6 pt-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Total référentiel</CardTitle>
              <CardDescription>Nombre total de substances en base</CardDescription>
            </CardHeader>
            <CardContent className="text-3xl font-semibold text-slate-900">
              {datasetStatusCounts.total}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Actives</CardTitle>
              <CardDescription>Substances exploitables en formulation</CardDescription>
            </CardHeader>
            <CardContent className="text-3xl font-semibold text-emerald-600">
              {datasetStatusCounts.active}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>En revue</CardTitle>
              <CardDescription>Ingrédients en cours d&apos;évaluation</CardDescription>
            </CardHeader>
            <CardContent className="text-3xl font-semibold text-amber-600">
              {datasetStatusCounts["under-review"]}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Archivées</CardTitle>
              <CardDescription>Non disponibles pour les nouvelles formules</CardDescription>
            </CardHeader>
            <CardContent className="text-3xl font-semibold text-slate-600">
              {datasetStatusCounts.archived}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle>Veille réglementaire</CardTitle>
              <CardDescription>Priorités sur la vue courante</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {regulatorySnapshot.length ? (
                regulatorySnapshot.slice(0, 4).map((entry) => (
                  <div
                    key={entry.country}
                    className="flex items-center justify-between gap-4 rounded-md border border-slate-100 px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{entry.country}</p>
                      <p className="text-xs text-slate-500">
                        {entry.critical} restriction{entry.critical > 1 ? "s" : ""} critiques •{" "}
                        {entry.total} suivies
                      </p>
                    </div>
                    <div className="flex flex-wrap justify-end gap-2">
                      {entry.forbidden ? (
                        <Badge className="rounded-full bg-red-100 text-xs font-semibold text-red-700">
                          Interdites • {entry.forbidden}
                        </Badge>
                      ) : null}
                      {entry.regulated ? (
                        <Badge className="rounded-full bg-amber-100 text-xs font-semibold text-amber-700">
                          Réglementées • {entry.regulated}
                        </Badge>
                      ) : null}
                      {entry.listed ? (
                        <Badge className="rounded-full bg-emerald-100 text-xs font-medium text-emerald-700">
                          Listées • {entry.listed}
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  Aucune restriction recensée dans la vue actuelle.
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Couverture documentaire</CardTitle>
              <CardDescription>Complétude dossiers et notes internes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>Couverture dossiers</span>
                  <span>{documentationStats.coverage}%</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${documentationStats.coverage}%` }}
                    aria-hidden
                  />
                </div>
              </div>
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Total vue</p>
                  <p className="text-lg font-semibold text-slate-900">{documentationStats.total}</p>
                </div>
                <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Sans documents</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {documentationStats.missingDocs}
                  </p>
                </div>
                <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Sans notes</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {documentationStats.missingNotes}
                  </p>
                </div>
                <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Dossiers prêts</p>
                  <p className="text-lg font-semibold text-emerald-700">
                    {documentationStats.documented}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[2fr_auto_auto_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Recherche INCI, CAS, fonction, allergène…"
              className="pl-10"
            />
          </div>
          <SubstanceFilters
            filters={filters}
            onChange={handleFilterChange}
            onReset={handleResetFilters}
            options={filterOptions}
          />
          <Button variant="outline" size="sm" disabled>
            <Upload className="mr-2 h-4 w-4" />
            Importer
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!filteredSubstances.length}
            onClick={handleExportFiltered}
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle substance
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Vues express
            </span>
            {activePresetDefinition ? (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {activePresetDefinition.label}
              </span>
            ) : null}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {QUICK_FILTER_PRESETS.map((preset) => {
              const Icon = preset.icon
              const isActive = activePreset === preset.id
              return (
                <Button
                  key={preset.id}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  className="h-auto flex-1 flex-col items-start gap-1 px-3 py-2 text-left sm:flex-none"
                  onClick={() => handlePresetApply(preset)}
                >
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    <Icon className="h-4 w-4" />
                    {preset.label}
                  </span>
                  <span className="text-xs text-slate-500">{preset.description}</span>
                </Button>
              )
            })}
          </div>
        </div>

        <Tabs
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value as StatusFilter)
            setPagination((previous) => ({ ...previous, pageIndex: 0 }))
          }}
        >
          <TabsList className="grid w-full grid-cols-2 gap-2 sm:w-fit sm:grid-cols-4">
            {statusTabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
                <Badge variant="outline" className="ml-1 rounded-full border-slate-200 text-[10px] font-semibold">
                  {tab.value === "all" ? statusCounts.all : statusCounts[tab.value] ?? 0}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {activeFilterChips.length ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Filtres actifs
            </span>
            {activeFilterChips.map((chip) => (
              <Button
                key={chip.key}
                variant="outline"
                size="sm"
                className="h-7 rounded-full border-dashed text-xs"
                onClick={chip.onClear}
              >
                {chip.label}
                <X className="ml-1 h-3 w-3" />
              </Button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-slate-500"
              onClick={handleResetFilters}
            >
              Réinitialiser tout
            </Button>
          </div>
        ) : null}

        <div className="flex flex-col gap-2 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {filteredSubstances.length} substances correspondent aux critères affichés.
          </div>
          {selectionCount > 0 ? (
            <div className="flex items-center gap-2">
              <span>{selectionCount} sélectionnée{selectionCount > 1 ? "s" : ""}</span>
              <Button
                size="sm"
                variant="secondary"
                disabled={!selectedSubstances.length}
                onClick={handleExportSelection}
              >
                Exporter la sélection
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      <SubstanceTable
        data={filteredSubstances}
        sorting={sorting}
        onSortingChange={setSorting}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        pagination={pagination}
        onPaginationChange={setPagination}
        pageSizeOptions={pageSizeOptions}
      />

      {selectionSummary ? (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm text-primary">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold">
              Synthèse sélection ({selectionSummary.total} substance
              {selectionSummary.total > 1 ? "s" : ""})
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-primary hover:text-primary"
              onClick={() => setRowSelection({})}
            >
              Effacer la sélection
            </Button>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-primary/70">Restrictions</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {restrictionDisplayOrder.map((type) => {
                  const count = selectionSummary.restrictionCounts[type]
                  if (!count) return null
                  return (
                    <Badge
                      key={type}
                      className="rounded-full bg-white text-xs font-semibold text-primary shadow-sm"
                    >
                      {restrictionLabels[type]} • {count}
                    </Badge>
                  )
                })}
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-primary/70">Zones concernées</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {selectionSummary.topCountries.length ? (
                  selectionSummary.topCountries.map(([country, count]) => (
                    <Badge
                      key={country}
                      variant="outline"
                      className="rounded-full border-primary/40 bg-white text-xs font-medium text-primary"
                    >
                      {country} • {count}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-primary/60">Aucune restriction ciblée.</span>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-primary/70">Fonctions & marques</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {selectionSummary.topFunctions.length ? (
                  selectionSummary.topFunctions.map(([fn, count]) => (
                    <Badge
                      key={fn}
                      variant="secondary"
                      className="rounded-full bg-white text-xs font-medium text-primary"
                    >
                      {fn} • {count}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-primary/60">Fonctions non priorisées.</span>
                )}
              </div>
              {selectionSummary.topBlacklists.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectionSummary.topBlacklists.map(([name, count]) => (
                    <Badge
                      key={name}
                      className="rounded-full bg-secondary/40 text-xs font-medium text-primary"
                    >
                      {name} • {count}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-xs text-primary/60">
                  Aucune blacklist dans la sélection.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : null}
      </TabsContent>

      <TabsContent value="smart-docs" className="pt-6">
        <SmartDocumentProcessor />
      </TabsContent>
    </Tabs>
  )
}
