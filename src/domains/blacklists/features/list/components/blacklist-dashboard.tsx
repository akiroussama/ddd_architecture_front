"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useMemo, useState } from "react"
import {
  AlertTriangle,
  BarChart3,
  CalendarClock,
  CheckCircle,
  Filter,
  Layers,
  ListChecks,
  Sparkles
} from "lucide-react"
import type { Blacklist, Substance } from "@/shared/types"

import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/shared/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/shared/ui/dialog"
import { Input } from "@/shared/ui/input"
import { Separator } from "@/shared/ui/separator"
import { Switch } from "@/shared/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table"
import { toast } from "sonner"

import { cn, formatDate, formatRelativeDate } from "@/shared/lib/utils"

type ImpactLevel = "forbidden" | "restricted" | "monitoring"

interface BlacklistWithDetails extends Blacklist {
  impactLevel: ImpactLevel
  impactLabel: string
  uniqueSubstances: number
  hardBans: number
  limitedUse: number
  monitoringOnly: number
  lastUpdatedDistance: string
  overdue: boolean
  classBreakdown: Record<string, number>
  familiesBreakdown: Record<string, number>
}

interface BlacklistDashboardProps {
  blacklists: Blacklist[]
  substances: Substance[]
}

interface FilterState {
  brands: string[]
  impactLevels: ImpactLevel[]
  classes: string[]
  search: string
  overdueOnly: boolean
}

const defaultFilters: FilterState = {
  brands: [],
  impactLevels: [],
  classes: [],
  search: "",
  overdueOnly: false
}

const impactLevelThemes: Record<
  ImpactLevel,
  { label: string; badgeClass: string; description: string }
> = {
  forbidden: {
    label: "Blocage",
    badgeClass: "bg-rose-100 text-rose-700 border border-rose-200",
    description: "Substances totalement interdites"
  },
  restricted: {
    label: "Limité",
    badgeClass: "bg-amber-100 text-amber-700 border border-amber-200",
    description: "Substances autorisées sous conditions"
  },
  monitoring: {
    label: "Veille",
    badgeClass: "bg-slate-100 text-slate-700 border border-slate-200",
    description: "Suivi informatif / pas de restriction"
  }
}

function classifyImpact(entries: Blacklist["substances"]) {
  let hardBans = 0
  let limitedUse = 0
  let monitoringOnly = 0
  entries.forEach((entry) => {
    if (entry.maxPercentage === 0) {
      hardBans += 1
    } else if (typeof entry.maxPercentage === "number") {
      limitedUse += 1
    } else {
      monitoringOnly += 1
    }
  })

  const impactLevel: ImpactLevel = hardBans
    ? "forbidden"
    : limitedUse
      ? "restricted"
      : "monitoring"

  return { impactLevel, hardBans, limitedUse, monitoringOnly }
}

function computeClassBreakdown(
  entries: Blacklist["substances"],
  substanceMap: Map<string, Substance | undefined>
) {
  const classBreakdown: Record<string, number> = {}
  const familiesBreakdown: Record<string, number> = {}

  entries.forEach((entry) => {
    const substance = substanceMap.get(entry.substanceId)
    if (!substance) return
    if (substance.class) {
      classBreakdown[substance.class] = (classBreakdown[substance.class] ?? 0) + 1
    }
    substance.families.forEach((family) => {
      familiesBreakdown[family] = (familiesBreakdown[family] ?? 0) + 1
    })
  })

  return { classBreakdown, familiesBreakdown }
}

function isOverdue(updatedAt: string, thresholdDays = 365) {
  const updatedTime = new Date(updatedAt).getTime()
  if (Number.isNaN(updatedTime)) return false
  const diffMs = Date.now() - updatedTime
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  return diffDays > thresholdDays
}

export function BlacklistDashboard({ blacklists, substances }: BlacklistDashboardProps) {
  const router = useRouter()
  const [filters, setFilters] = useState<FilterState>(defaultFilters)
  const [selectedBlacklistId, setSelectedBlacklistId] = useState<string | null>(null)

  const substanceMap = useMemo(() => {
    return new Map(substances.map((substance) => [substance.id, substance]))
  }, [substances])

  const enhancedBlacklists = useMemo<BlacklistWithDetails[]>(() => {
    return blacklists.map((blacklist) => {
      const { impactLevel, hardBans, limitedUse, monitoringOnly } = classifyImpact(
        blacklist.substances
      )
      const { classBreakdown, familiesBreakdown } = computeClassBreakdown(
        blacklist.substances,
        substanceMap
      )
      const uniqueSubstances = new Set(blacklist.substances.map((entry) => entry.substanceId))
        .size

      return {
        ...blacklist,
        impactLevel,
        impactLabel: impactLevelThemes[impactLevel].label,
        hardBans,
        limitedUse,
        monitoringOnly,
        uniqueSubstances,
        lastUpdatedDistance: formatRelativeDate(blacklist.updatedAt),
        overdue: isOverdue(blacklist.updatedAt),
        classBreakdown,
        familiesBreakdown
      }
    })
  }, [blacklists, substanceMap])

  const brands = useMemo(() => {
    return Array.from(
      new Set(
        enhancedBlacklists
          .map((item) => item.brand ?? "Portefeuille global")
      )
    ).sort()
  }, [enhancedBlacklists])

  const classes = useMemo(() => {
    const set = new Set<string>()
    enhancedBlacklists.forEach((blacklist) => {
      Object.keys(blacklist.classBreakdown).forEach((className) => {
        set.add(className)
      })
    })
    return Array.from(set).sort((a, b) => a.localeCompare(b, "fr", { sensitivity: "base" }))
  }, [enhancedBlacklists])

  const filteredBlacklists = useMemo(() => {
    return enhancedBlacklists.filter((blacklist) => {
      if (filters.brands.length) {
        const brandLabel = blacklist.brand ?? "Portefeuille global"
        if (!filters.brands.includes(brandLabel)) {
          return false
        }
      }

      if (filters.impactLevels.length && !filters.impactLevels.includes(blacklist.impactLevel)) {
        return false
      }

      if (filters.classes.length) {
        const matchesClass = filters.classes.some(
          (className) => blacklist.classBreakdown[className]
        )
        if (!matchesClass) {
          return false
        }
      }

      if (filters.overdueOnly && !blacklist.overdue) {
        return false
      }

      if (filters.search.trim()) {
        const query = filters.search.trim().toLowerCase()
        const haystack = [
          blacklist.name,
          blacklist.brand,
          blacklist.documents.map((doc) => doc.name).join(" "),
          blacklist.substances.map((entry) => entry.inciEU).join(" "),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()

        if (!haystack.includes(query)) {
          return false
        }
      }

      return true
    })
  }, [enhancedBlacklists, filters])

  const impactStats = useMemo(() => {
    const byImpact: Record<ImpactLevel, number> = {
      forbidden: 0,
      restricted: 0,
      monitoring: 0
    }
    enhancedBlacklists.forEach((blacklist) => {
      byImpact[blacklist.impactLevel] += 1
    })
    return byImpact
  }, [enhancedBlacklists])

  const overdueCount = enhancedBlacklists.filter((item) => item.overdue).length
  const totalImpactedSubstances = enhancedBlacklists.reduce(
    (acc, item) => acc + item.uniqueSubstances,
    0
  )

  const topClasses = useMemo(() => {
    const aggregated: Record<string, number> = {}
    enhancedBlacklists.forEach((blacklist) => {
      Object.entries(blacklist.classBreakdown).forEach(([className, count]) => {
        aggregated[className] = (aggregated[className] ?? 0) + count
      })
    })
    return Object.entries(aggregated)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
  }, [enhancedBlacklists])

  const activeFilterChips = useMemo(() => {
    const chips: Array<{ label: string; onRemove: () => void }> = []
    if (filters.brands.length) {
      filters.brands.forEach((brand) => {
        chips.push({
          label: `Marque: ${brand}`,
          onRemove: () =>
            setFilters((prev) => ({
              ...prev,
              brands: prev.brands.filter((item) => item !== brand)
            }))
        })
      })
    }

    if (filters.impactLevels.length) {
      filters.impactLevels.forEach((level) => {
        chips.push({
          label: `Impact: ${impactLevelThemes[level].label}`,
          onRemove: () =>
            setFilters((prev) => ({
              ...prev,
              impactLevels: prev.impactLevels.filter((item) => item !== level)
            }))
        })
      })
    }

    if (filters.classes.length) {
      filters.classes.forEach((className) => {
        chips.push({
          label: `Classe: ${className}`,
          onRemove: () =>
            setFilters((prev) => ({
              ...prev,
              classes: prev.classes.filter((item) => item !== className)
            }))
        })
      })
    }

    if (filters.overdueOnly) {
      chips.push({
        label: "Revue en retard",
        onRemove: () =>
          setFilters((prev) => ({
            ...prev,
            overdueOnly: false
          }))
      })
    }

    return chips
  }, [filters])

  const selectedBlacklist = useMemo(
    () => enhancedBlacklists.find((item) => item.id === selectedBlacklistId) ?? null,
    [enhancedBlacklists, selectedBlacklistId]
  )

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters)
  }, [])

  const handleExportOverview = useCallback(() => {
    toast.success("Export synthèse blacklists lancé (simulation).")
  }, [])

  return (
    <div className="space-y-8">
      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Veille chartes & blacklists marques
            </h1>
            <p className="text-sm text-slate-600">
              Analyse centralisée des restrictions marketing pour sécuriser la formulation et anticiper les arbitrages avec les équipes brand.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={handleExportOverview}>
              <BarChart3 className="h-4 w-4" />
              Export synthèse
            </Button>
            <Button
              size="sm"
              className="gap-2"
              onClick={() => toast.info("Workflow de validation à implémenter.")}
            >
              <Sparkles className="h-4 w-4" />
              Lancer revue collective
            </Button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="flex items-center gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-primary" />
                Chartes référencées
              </CardTitle>
              <CardDescription>Total des blacklists actives</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-slate-900">{enhancedBlacklists.length}</p>
              <p className="text-xs text-slate-500">
                {impactStats.forbidden} blocage{impactStats.forbidden > 1 ? "s" : ""} •{" "}
                {impactStats.restricted} limitatif{impactStats.restricted > 1 ? "s" : ""} •{" "}
                {impactStats.monitoring} veille
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Layers className="h-4 w-4 text-primary" />
                Substances impactées
              </CardTitle>
              <CardDescription>Entrées à surveiller dans les formules</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-slate-900">{totalImpactedSubstances}</p>
              <p className="text-xs text-slate-500">
                {topClasses.length
                  ? `Top focus: ${topClasses
                      .map(([className, count]) => `${className} (${count})`)
                      .join(", ")}`
                  : "Classes non renseignées"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="flex items-center gap-2 text-sm">
                <CalendarClock className="h-4 w-4 text-primary" />
                Revues attendues
              </CardTitle>
              <CardDescription>Charte à réviser (&gt; 12 mois)</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-slate-900">{overdueCount}</p>
              <p className="text-xs text-slate-500">
                Filtrer par statut & planifier une mise à jour ciblée.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="flex items-center gap-2 text-sm">
                <ListChecks className="h-4 w-4 text-primary" />
                Actions rapides
              </CardTitle>
              <CardDescription>Automatiser la communication brand</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-xs text-slate-600">
                <p>• Exporter pack marketing en un clic.</p>
                <p>• Envoyer synthèse substances sensibles.</p>
                <p>• Planifier revue trimestrielle automatique.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <Filter className="h-4 w-4 text-slate-500" />
            <Input
              placeholder="Rechercher une charte, une marque ou une substance..."
              value={filters.search}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  search: event.target.value
                }))
              }
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Switch
                checked={filters.overdueOnly}
                onCheckedChange={(checked) =>
                  setFilters((prev) => ({
                    ...prev,
                    overdueOnly: checked
                  }))
                }
              />
              <span className="text-sm text-slate-600">Revues en retard</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
            >
              Réinitialiser
            </Button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Marques
            </p>
            <div className="flex flex-wrap gap-2">
              {brands.map((brand) => {
                const isSelected = filters.brands.includes(brand)
                return (
                  <Button
                    key={brand}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    className="h-8"
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        brands: isSelected
                          ? prev.brands.filter((item) => item !== brand)
                          : [...prev.brands, brand]
                      }))
                    }
                  >
                    {brand}
                  </Button>
                )
              })}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Impact
            </p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(impactLevelThemes) as ImpactLevel[]).map((level) => {
                const theme = impactLevelThemes[level]
                const isSelected = filters.impactLevels.includes(level)
                return (
                  <Button
                    key={level}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    className="h-8"
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        impactLevels: isSelected
                          ? prev.impactLevels.filter((item) => item !== level)
                          : [...prev.impactLevels, level]
                      }))
                    }
                  >
                    {theme.label}
                  </Button>
                )
              })}
            </div>
          </div>
          {classes.length ? (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Classes sensibles
              </p>
              <div className="flex flex-wrap gap-2">
                {classes.map((className) => {
                  const isSelected = filters.classes.includes(className)
                  return (
                    <Button
                      key={className}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      className="h-8"
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          classes: isSelected
                            ? prev.classes.filter((item) => item !== className)
                            : [...prev.classes, className]
                        }))
                      }
                    >
                      {className}
                    </Button>
                  )
                })}
              </div>
            </div>
          ) : null}
        </div>

        {activeFilterChips.length ? (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {activeFilterChips.map((chip) => (
              <Badge
                key={chip.label}
                variant="secondary"
                className="flex items-center gap-2 rounded-full bg-slate-100 text-xs text-slate-600"
              >
                {chip.label}
                <button
                  className="text-slate-400 transition hover:text-slate-600"
                  onClick={chip.onRemove}
                  aria-label={`Retirer filtre ${chip.label}`}
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        ) : null}

        <Separator className="my-6" />

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Charte</TableHead>
                <TableHead>Marque / portefeuille</TableHead>
                <TableHead>Impact</TableHead>
                <TableHead>Substances</TableHead>
                <TableHead>Dernière mise à jour</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBlacklists.length ? (
                filteredBlacklists.map((blacklist) => (
                  <TableRow
                    key={blacklist.id}
                    onClick={() => router.push(`/blacklists/${blacklist.id}`)}
                    className="cursor-pointer transition-colors hover:bg-slate-50"
                  >
                    <TableCell className="font-semibold text-slate-900">
                      {blacklist.name}
                      <div className="text-xs text-slate-500">
                        {blacklist.documents.length} document
                        {blacklist.documents.length > 1 ? "s" : ""} versionnés
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {blacklist.brand ?? "Portefeuille global"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          "rounded-full text-xs font-semibold",
                          impactLevelThemes[blacklist.impactLevel].badgeClass
                        )}
                      >
                        {impactLevelThemes[blacklist.impactLevel].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      <div className="flex flex-col gap-1">
                        <span>{blacklist.uniqueSubstances} substances</span>
                        <div className="flex flex-wrap gap-2 text-xs">
                          {blacklist.hardBans ? (
                            <Badge className="rounded-full bg-rose-100 text-rose-700">
                              Interdites • {blacklist.hardBans}
                            </Badge>
                          ) : null}
                          {blacklist.limitedUse ? (
                            <Badge className="rounded-full bg-amber-100 text-amber-700">
                              Limitées • {blacklist.limitedUse}
                            </Badge>
                          ) : null}
                          {blacklist.monitoringOnly && !blacklist.hardBans && !blacklist.limitedUse ? (
                            <Badge className="rounded-full bg-slate-100 text-slate-600">
                              Veille
                            </Badge>
                          ) : null}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {formatDate(blacklist.updatedAt, "dd MMM yyyy")}
                      <div className="text-[11px]">{blacklist.lastUpdatedDistance}</div>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          toast.success("Pack charte exporté (simulation).")
                        }
                      >
                        Exporter
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-sm text-slate-500">
                    Aucun résultat ne correspond aux filtres sélectionnés.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog
        open={Boolean(selectedBlacklist)}
        onOpenChange={(open) => {
          if (!open) setSelectedBlacklistId(null)
        }}
      >
        {selectedBlacklist ? (
          <DialogContent className="max-w-3xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedBlacklist.name}</DialogTitle>
              <DialogDescription>
                Charte marketing {selectedBlacklist.brand ?? "Portefeuille global"} •{" "}
                {impactLevelThemes[selectedBlacklist.impactLevel].description}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  className={cn(
                    "rounded-full text-xs font-semibold",
                    impactLevelThemes[selectedBlacklist.impactLevel].badgeClass
                  )}
                >
                  Impact {impactLevelThemes[selectedBlacklist.impactLevel].label}
                </Badge>
                {selectedBlacklist.overdue ? (
                  <Badge className="rounded-full bg-rose-100 text-rose-700">
                    Revue en retard
                  </Badge>
                ) : (
                  <Badge className="rounded-full bg-emerald-100 text-emerald-700">
                    À jour
                  </Badge>
                )}
                <Badge className="rounded-full bg-slate-100 text-slate-600">
                  {selectedBlacklist.uniqueSubstances} substances concernées
                </Badge>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card className="border border-slate-200 bg-slate-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Suivi mise à jour</CardTitle>
                    <CardDescription>
                      Dernière édition le {formatDate(selectedBlacklist.updatedAt, "dd MMM yyyy")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs text-slate-600">
                    <p>
                      Créée le {formatDate(selectedBlacklist.createdAt, "dd MMM yyyy")} par{" "}
                      {selectedBlacklist.createdBy}
                    </p>
                    <p>
                      Dernière mise à jour par {selectedBlacklist.updatedBy ?? selectedBlacklist.createdBy}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border border-slate-200 bg-slate-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Actions rapides</CardTitle>
                    <CardDescription>Coordination avec marketing & formulation</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full justify-start gap-2"
                      onClick={() => toast.info("Notification brand envoyée (simulation).")}
                    >
                      <AlertTriangle className="h-4 w-4" />
                      Notifier les équipes brand
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full justify-start gap-2"
                      onClick={() => toast.info("Analyse d'impact initiée (simulation).")}
                    >
                      <CheckCircle className="h-4 w-4" />
                      Lancer analyse d&apos;impact formulation
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-900">Substances impactées</h3>
                <p className="text-xs text-slate-500">
                  Cartographie des ingrédients concernés et niveau d&apos;exigence.
                </p>
                <div className="mt-3 rounded-lg border border-slate-200">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Substance</TableHead>
                        <TableHead>Classe</TableHead>
                        <TableHead>Condition</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedBlacklist.substances.map((entry) => {
                        const substance = substanceMap.get(entry.substanceId)
                        const severity =
                          entry.maxPercentage === 0
                            ? "forbidden"
                            : typeof entry.maxPercentage === "number"
                              ? "restricted"
                              : "monitoring"
                        const severityTheme = impactLevelThemes[severity]
                        return (
                          <TableRow key={`${selectedBlacklist.id}-${entry.substanceId}`}>
                            <TableCell className="text-sm font-medium text-slate-900">
                              {entry.inciEU}
                              {substance?.status ? (
                                <span className="ml-2 text-xs text-slate-500">
                                  Statut PLM: {substance.status}
                                </span>
                              ) : null}
                            </TableCell>
                            <TableCell className="text-xs text-slate-600">
                              {substance?.class ?? "—"}
                            </TableCell>
                            <TableCell>
                              <Badge className={cn("rounded-full text-xs", severityTheme.badgeClass)}>
                                {severityTheme.label}
                                {typeof entry.maxPercentage === "number"
                                  ? ` • max ${entry.maxPercentage}%`
                                  : ""}
                              </Badge>
                              {entry.comment ? (
                                <p className="mt-1 text-xs text-slate-500">{entry.comment}</p>
                              ) : null}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-2">
                                <Link
                                  href={`/substances/${entry.substanceId}`}
                                  className="text-xs font-semibold text-primary hover:underline"
                                >
                                  Ouvrir fiche
                                </Link>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-xs text-slate-500"
                                  onClick={() => toast.info("Ajout à la watchlist (simulation).")}
                                >
                                  Ajouter à la watchlist
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-900">Documents & pièces jointes</h3>
                <p className="text-xs text-slate-500">
                  Historique des versions mis à disposition par les équipes brand.
                </p>
                <div className="mt-3 flex flex-col gap-2">
                  {selectedBlacklist.documents.length ? (
                    selectedBlacklist.documents.map((document) => (
                      <div
                        key={document.id}
                        className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{document.name}</p>
                          <p className="text-xs text-slate-500">
                            Version {document.version} • {document.versionComment ?? "—"}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Publié le {formatDate(document.uploadDate, "dd MMM yyyy")} par{" "}
                            {document.uploadedBy}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toast.info("Téléchargement non disponible en maquette.")}
                        >
                          Télécharger
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">
                      Aucun document n&apos;est associé à cette charte.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        ) : null}
      </Dialog>
    </div>
  )
}
