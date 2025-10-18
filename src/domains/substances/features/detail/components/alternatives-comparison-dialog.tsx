"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  ClipboardCheck,
  FileText,
  Globe2,
  ListChecks,
  Share2,
  Sparkles,
  TrendingUp,
  XCircle
} from "lucide-react"
import type { Substance } from "@/shared/types"

import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/shared/ui/card"
import { Dialog, DialogContent } from "@/shared/ui/dialog"
import { Progress } from "@/shared/ui/progress"
import { ScrollArea } from "@/shared/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/shared/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/shared/ui/tabs"
import { toast } from "sonner"

import { cn } from "@/shared/lib/utils"
import type { AlternativeOption } from "@/shared/lib/mock-data"
import { compatibilityBreakdownMeta, restrictionThemes } from "./detail-constants"
import {
  compatibilityColor,
  compatibilityHex,
  costComparisonInsight,
  costComparisonLabel,
  formatPercentage,
  radialBackground
} from "./detail-utils"
import { RadarComparisonChart } from "./radar-comparison-chart"

const MAX_COMPARISON_SELECTION = 3

interface AlternativesComparisonDialogProps {
  substance: Substance
  open: boolean
  onOpenChange: (open: boolean) => void
  comparisonAlternativeId: string | null
  onAlternativeChange: (id: string | null) => void
  alternativeOptions: {
    recommended: AlternativeOption[]
    new: AlternativeOption[]
  }
}

export function AlternativesComparisonDialog({
  substance,
  open,
  onOpenChange,
  comparisonAlternativeId,
  onAlternativeChange,
  alternativeOptions
}: AlternativesComparisonDialogProps) {
  const allAlternatives = useMemo(
    () => [...alternativeOptions.recommended, ...alternativeOptions.new],
    [alternativeOptions]
  )

  const [comparisonSelectedIds, setComparisonSelectedIds] = useState<string[]>([])

  const comparisonAlternative = useMemo(() => {
    if (!allAlternatives.length) return null
    if (comparisonAlternativeId) {
      const found = allAlternatives.find((alt) => alt.id === comparisonAlternativeId)
      if (found) return found
    }
    if (comparisonSelectedIds.length) {
      const fallback = allAlternatives.find((alt) => alt.id === comparisonSelectedIds[0])
      if (fallback) return fallback
    }
    return allAlternatives[0]
  }, [allAlternatives, comparisonAlternativeId, comparisonSelectedIds])

  useEffect(() => {
    if (!open) {
      setComparisonSelectedIds([])
      return
    }
    if (!allAlternatives.length) return
    const activeId =
      comparisonAlternativeId ?? comparisonAlternative?.id ?? allAlternatives[0]?.id ?? null
    if (!activeId) return
    setComparisonSelectedIds((current) => {
      if (current.includes(activeId)) return current
      return [activeId, ...current]
    })
  }, [open, comparisonAlternativeId, comparisonAlternative?.id, allAlternatives])

  useEffect(() => {
    if (!allAlternatives.length) {
      setComparisonSelectedIds([])
      return
    }
    setComparisonSelectedIds((current) => {
      const allowed = new Set(allAlternatives.map((alt) => alt.id))
      const filtered = current.filter((id) => allowed.has(id))
      if (filtered.length === current.length) return current
      return filtered
    })
  }, [allAlternatives])

  const comparisonSelectedAlternatives = useMemo(() => {
    if (!comparisonSelectedIds.length) {
      return comparisonAlternative ? [comparisonAlternative] : []
    }
    const byId = new Map(allAlternatives.map((alt) => [alt.id, alt]))
    const items = comparisonSelectedIds
      .map((id) => byId.get(id))
      .filter((alt): alt is (typeof allAlternatives)[number] => Boolean(alt))
    if (!comparisonAlternative) return items
    const reordered = [
      comparisonAlternative,
      ...items.filter((alt) => alt.id !== comparisonAlternative.id)
    ]
    return reordered
  }, [allAlternatives, comparisonAlternative, comparisonSelectedIds])

  const canAddMoreComparisons =
    comparisonSelectedIds.length < Math.min(MAX_COMPARISON_SELECTION, allAlternatives.length)

  const handleFocusComparisonAlternative = useCallback(
    (id: string) => {
      onAlternativeChange(id)
      setComparisonSelectedIds((current) => {
        if (current.includes(id)) return current
        return [id, ...current]
      })
    },
    [onAlternativeChange]
  )

  const handleAddComparisonAlternative = useCallback(() => {
    if (!canAddMoreComparisons) {
      toast.info("Vous comparez déjà le maximum d'alternatives.")
      return
    }
    const nextAlternative = allAlternatives.find((alt) => !comparisonSelectedIds.includes(alt.id))
    if (!nextAlternative) {
      toast.info("Toutes les alternatives disponibles sont déjà sélectionnées.")
      return
    }
    setComparisonSelectedIds((current) => {
      if (current.includes(nextAlternative.id)) return current
      return [...current, nextAlternative.id]
    })
    onAlternativeChange(nextAlternative.id)
  }, [allAlternatives, canAddMoreComparisons, comparisonSelectedIds, onAlternativeChange])

  const handleRemoveComparisonAlternative = useCallback(
    (id: string) => {
      setComparisonSelectedIds((current) => {
        if (!current.includes(id)) return current
        const filtered = current.filter((selectedId) => selectedId !== id)
        if (!filtered.length) {
          const fallback = allAlternatives.find((alt) => alt.id !== id)?.id ?? null
          onAlternativeChange(fallback)
          return fallback ? [fallback] : []
        }
        if (comparisonAlternativeId === id) {
          onAlternativeChange(filtered[0] ?? null)
        }
        return filtered
      })
    },
    [allAlternatives, comparisonAlternativeId, onAlternativeChange]
  )

  const comparisonMatrix = useMemo(() => {
    if (!comparisonAlternative) return []
    const radarLookup = Object.fromEntries(
      comparisonAlternative.radar.map((entry) => [entry.criteria, entry])
    )

    const formatValue = (criteria: string, key: "current" | "alternative") => {
      const value = radarLookup[criteria]?.[key]
      if (value === undefined) return "—"
      return `${value}%`
    }

    const costLabel =
      comparisonAlternative.costComparison === "<"
        ? "Inférieur"
        : comparisonAlternative.costComparison === ">"
          ? "Supérieur"
          : "Similarité"

    return [
      {
        section: "Réglementaire",
        label: "Conformité EU",
        current: formatValue("Conformité EU", "current"),
        alternative: formatValue("Conformité EU", "alternative"),
        advantage:
          (radarLookup["Conformité EU"]?.alternative ?? 0) -
            (radarLookup["Conformité EU"]?.current ?? 0) >
          0
      },
      {
        section: "Réglementaire",
        label: "Conformité US",
        current: formatValue("Conformité US", "current"),
        alternative: formatValue("Conformité US", "alternative"),
        advantage:
          (radarLookup["Conformité US"]?.alternative ?? 0) -
            (radarLookup["Conformité US"]?.current ?? 0) >
          0
      },
      {
        section: "Sécurité",
        label: "Allergènes",
        current: formatValue("Allergènes", "current"),
        alternative: formatValue("Allergènes", "alternative"),
        advantage:
          (radarLookup["Allergènes"]?.alternative ?? 0) -
            (radarLookup["Allergènes"]?.current ?? 0) >
          0
      },
      {
        section: "Sécurité",
        label: "Sensibilité",
        current: formatValue("Sensibilité", "current"),
        alternative: formatValue("Sensibilité", "alternative"),
        advantage:
          (radarLookup["Sensibilité"]?.alternative ?? 0) -
            (radarLookup["Sensibilité"]?.current ?? 0) >
          0
      },
      {
        section: "Économique",
        label: "Coût estimé",
        current: "Baseline",
        alternative: costLabel,
        advantage: comparisonAlternative.costComparison !== ">"
      },
      {
        section: "Performance",
        label: "Efficacité",
        current: formatValue("Efficacité", "current"),
        alternative: formatValue("Efficacité", "alternative"),
        advantage:
          (radarLookup["Efficacité"]?.alternative ?? 0) -
            (radarLookup["Efficacité"]?.current ?? 0) >
          0
      },
      {
        section: "Technique",
        label: "Stabilité",
        current: formatValue("Stabilité", "current"),
        alternative: formatValue("Stabilité", "alternative"),
        advantage:
          (radarLookup["Stabilité"]?.alternative ?? 0) -
            (radarLookup["Stabilité"]?.current ?? 0) >
          0
      },
      {
        section: "Marketing",
        label: "Naturalité",
        current: formatValue("Naturalité", "current"),
        alternative: formatValue("Naturalité", "alternative"),
        advantage:
          (radarLookup["Naturalité"]?.alternative ?? 0) -
            (radarLookup["Naturalité"]?.current ?? 0) >
          0
      }
    ]
  }, [comparisonAlternative])

  const comparisonBreakdown = useMemo(() => {
    if (!comparisonAlternative) return []
    return Object.entries(comparisonAlternative.compatibility.breakdown) as Array<[
      keyof typeof comparisonAlternative.compatibility.breakdown,
      number
    ]>
  }, [comparisonAlternative])

  const comparisonImpact = comparisonAlternative?.impact ?? {
    compatible: [],
    minor: [],
    major: []
  }
  const costInsight = comparisonAlternative
    ? costComparisonInsight(comparisonAlternative.costComparison)
    : null

  return (
    <Dialog
      open={open && Boolean(comparisonAlternative)}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen)
        if (!nextOpen) {
          onAlternativeChange(null)
          setComparisonSelectedIds([])
        }
      }}
    >
      <DialogContent className="max-w-7xl h-[90vh] overflow-hidden rounded-2xl border border-slate-200 bg-white p-0">
        {comparisonAlternative ? (
          <div className="flex h-full flex-col">
            <div className="border-b bg-slate-50 p-4">
              <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr]">
                <div className="text-center">
                  <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-wide">
                    Substance actuelle
                  </Badge>
                  <h3 className="mt-2 text-base font-semibold text-slate-900">{substance.inciEU}</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    CAS principal&nbsp;: {substance.casEinecsPairs[0]?.cas ?? "—"}
                  </p>
                </div>
                <div className="flex items-center justify-center">
                  <span className="text-2xl font-bold text-slate-400">VS</span>
                </div>
                <div className="space-y-2 text-center">
                  <Select value={comparisonAlternative.id} onValueChange={handleFocusComparisonAlternative}>
                    <SelectTrigger className="mx-auto w-full md:w-80">
                      <SelectValue placeholder="Choisir une alternative" />
                    </SelectTrigger>
                    <SelectContent>
                      {allAlternatives.map((alt) => (
                        <SelectItem key={alt.id} value={alt.id}>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between text-sm">
                              <span>{alt.inciName}</span>
                              {alt.currentlyUsed ? (
                                <Badge variant="secondary" className="h-5 rounded-full px-2 text-[10px] uppercase">
                                  ⭐ Recommandée
                                </Badge>
                              ) : null}
                            </div>
                            <span className="text-xs text-slate-500">
                              Marchés: {alt.markets.join(", ")}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                    {(() => {
                      const theme =
                        restrictionThemes[
                          (comparisonAlternative as any).regulatoryStatus as keyof typeof restrictionThemes
                        ] ?? restrictionThemes.unlisted
                      return (
                        <Badge className={cn("rounded-full text-xs", theme.className)}>
                          {theme.label}
                        </Badge>
                      )
                    })()}
                    <span>{comparisonAlternative.compatibility.overall}% compatibilité</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid flex-1 gap-6 overflow-hidden p-6 lg:grid-cols-[320px,1fr]">
              <div className="flex flex-col gap-6">
                <Card className="border border-slate-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-base">
                      <span>Alternatives comparées</span>
                      <Badge variant="outline" className="rounded-full text-xs text-slate-500">
                        {comparisonSelectedAlternatives.length} sélection(s)
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Sélectionnez jusqu&apos;à {MAX_COMPARISON_SELECTION} alternatives pour un benchmark rapide.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {comparisonSelectedAlternatives.map((alt) => {
                        const isActive = comparisonAlternative?.id === alt.id
                        return (
                          <div
                            key={alt.id}
                            className={cn(
                              "flex items-start justify-between gap-3 rounded-lg border p-3 transition",
                              isActive
                                ? "border-primary bg-primary/5"
                                : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                            )}
                          >
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center gap-2">
                                <ClipboardCheck className={cn("h-4 w-4", isActive ? "text-primary" : "text-slate-400")} />
                                <span className="font-semibold text-slate-900">{alt.inciName}</span>
                              </div>
                              <p className="text-xs text-slate-500">
                                Marchés: {alt.markets.join(", ")}
                              </p>
                              <p className="text-xs text-slate-400">
                                {alt.formulasCount} formule(s)
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {(() => {
                                const theme =
                                  restrictionThemes[
                                    (alt as any).regulatoryStatus as keyof typeof restrictionThemes
                                  ] ?? restrictionThemes.unlisted
                                return (
                                  <Badge className={cn("rounded-full text-xs", theme.className)}>
                                    {theme.label}
                                  </Badge>
                                )
                              })()}
                              {comparisonSelectedAlternatives.length > 1 ? (
                                <button
                                  type="button"
                                  className="text-slate-300 transition hover:text-rose-500"
                                  onClick={() => handleRemoveComparisonAlternative(alt.id)}
                                  aria-label={`Retirer ${alt.inciName} de la comparaison`}
                                >
                                  <XCircle className="h-3.5 w-3.5" />
                                </button>
                              ) : null}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={handleAddComparisonAlternative}
                      disabled={!canAddMoreComparisons}
                    >
                      Ajouter une alternative
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border border-slate-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Insights rapides
                    </CardTitle>
                    <CardDescription>
                      Synthèse automatique des impacts réglementaires et métiers.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm text-slate-600">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Contexte réglementaire
                      </p>
                      <p className="mt-1 text-sm text-slate-700">
                        Profil réglementaire estimé : {comparisonAlternative.compatibility.breakdown.regulatory}% • Marchés couverts : {comparisonAlternative.markets.join(", ")}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Comparaison coût &amp; disponibilité
                      </p>
                      <p className="text-sm">
                        {costComparisonLabel(comparisonAlternative.costComparison)}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Pourquoi elle est suggérée ?
                      </p>
                      <ul className="space-y-1 text-sm">
                        {comparisonAlternative.pros.map((item) => (
                          <li key={item} className="flex items-center gap-2">
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-slate-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <ClipboardCheck className="h-4 w-4 text-primary" />
                      Actions rapides
                    </CardTitle>
                    <CardDescription>
                      Engagez vos équipes directement depuis la comparaison.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-slate-600">
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                      onClick={() => toast.success("Demande d'échantillons envoyée (simulation).")}
                    >
                      Demander des échantillons
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                      onClick={() => toast.success("Plan de validation créé (simulation).")}
                    >
                      Créer un plan de validation
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                      onClick={() => toast.success("Analyse supply chain lancée (simulation).")}
                    >
                      Lancer l&apos;analyse supply chain
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <ScrollArea className="flex-1 bg-white">
                <div className="space-y-6 p-6">
                  <Card className="border border-slate-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Sparkles className="h-5 w-5 text-yellow-500" />
                        Score de compatibilité
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-6 lg:grid-cols-[minmax(0,320px),minmax(0,1fr)]">
                      <div className="flex flex-col items-center gap-4 text-center">
                        <div
                          className="relative inline-flex h-36 w-36 items-center justify-center rounded-full shadow-inner"
                          style={radialBackground(
                            comparisonAlternative.compatibility.overall,
                            compatibilityHex(comparisonAlternative.compatibility.overall)
                          )}
                        >
                          <div className="absolute inset-3 flex items-center justify-center rounded-full bg-white">
                            <span
                              className={cn(
                                "text-4xl font-semibold",
                                compatibilityColor(comparisonAlternative.compatibility.overall)
                              )}
                            >
                              {comparisonAlternative.compatibility.overall}%
                            </span>
                          </div>
                        </div>
                        <p className="max-w-xs text-sm text-slate-600">
                          {comparisonAlternative.compatibility.overall >= 85
                            ? "Excellente alternative : validation quasi immédiate."
                            : comparisonAlternative.compatibility.overall >= 70
                              ? "Alternative prometteuse : quelques vérifications ciblées."
                              : "Analyse approfondie recommandée avant arbitrage."}
                        </p>
                        <div className="w-full max-w-xs space-y-3 text-left">
                          {comparisonBreakdown.map(([key, value]) => {
                            const meta = compatibilityBreakdownMeta[key]
                            const Icon = meta.icon
                            return (
                              <div key={key} className="space-y-2">
                                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500">
                                  <div className="flex items-center gap-2">
                                    <Icon className={cn("h-4 w-4", meta.accent)} />
                                    <span>{meta.label}</span>
                                  </div>
                                  <span className="text-slate-900">{value}%</span>
                                </div>
                                <Progress value={value} className="h-2 bg-slate-100" />
                              </div>
                            )
                          })}
                        </div>
                      </div>
                      <div className="space-y-4">
                        {costInsight ? (
                          <div
                            className={cn(
                              "rounded-lg border p-4 text-sm",
                              costInsight.tone === "text-emerald-700"
                                ? "border-emerald-200 bg-emerald-50"
                                : costInsight.tone === "text-amber-700"
                                  ? "border-amber-200 bg-amber-50"
                                  : "border-slate-200 bg-slate-50"
                            )}
                          >
                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                              <Sparkles className="h-4 w-4 text-yellow-500" />
                              <span>Impact économique</span>
                            </div>
                            <p className={cn("mt-2 text-sm font-medium", costInsight.tone)}>
                              {costInsight.message}
                            </p>
                            <p className="mt-1 text-xs text-slate-600">
                              Projection basée sur vos référentiels matières et validations achats.
                            </p>
                          </div>
                        ) : null}
                        <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
                          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                            Points à retenir
                          </div>
                          <div className="mt-3 space-y-2 text-sm">
                            {comparisonAlternative.pros.map((pro) => (
                              <div key={`${comparisonAlternative.id}-pro-${pro}`} className="flex items-center gap-2">
                                <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                                <span>{pro}</span>
                              </div>
                            ))}
                            {comparisonAlternative.cons.map((con) => (
                              <div key={`${comparisonAlternative.id}-con-${con}`} className="flex items-center gap-2">
                                <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                                <span>{con}</span>
                              </div>
                            ))}
                          </div>
                          <div className="mt-4 space-y-2 text-xs">
                            <div className="flex items-center gap-2">
                              <ListChecks className="h-4 w-4 text-slate-400" />
                              <span>
                                {comparisonAlternative.formulasCount
                                  ? `${comparisonAlternative.formulasCount} formule(s) déjà qualifiée(s)`
                                  : "Pas encore utilisée dans vos formules"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Globe2 className="h-4 w-4 text-slate-400" />
                              <span>Marchés validés : {comparisonAlternative.markets.join(", ")}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-slate-400" />
                              <span>
                                {comparisonImpact.compatible.length} swap direct(s) • {comparisonImpact.minor.length} ajustement(s) léger(s)
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-slate-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Comparaison détaillée</CardTitle>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                            <th className="w-48 px-3 py-2">Critère</th>
                            <th className="px-3 py-2">{substance.inciEU}</th>
                            <th className="px-3 py-2">{comparisonAlternative.inciName}</th>
                            <th className="w-20 px-3 py-2 text-center">Avantage</th>
                          </tr>
                        </thead>
                        <tbody>
                          {comparisonMatrix.map((row) => (
                            <tr key={`${row.section}-${row.label}`} className="border-t border-slate-200">
                              <td className="align-top px-3 py-2 text-slate-600">
                                <Badge variant="outline" className="mb-1 text-[11px]">
                                  {row.section}
                                </Badge>
                                <div className="text-sm font-medium text-slate-900">{row.label}</div>
                              </td>
                              <td className="align-top px-3 py-2 text-slate-700">{row.current}</td>
                              <td className="align-top px-3 py-2 text-slate-700">{row.alternative}</td>
                              <td className="px-3 py-2 text-center">
                                {row.advantage ? (
                                  <ArrowRight className="mx-auto h-4 w-4 text-emerald-600" />
                                ) : (
                                  <span className="text-xs text-slate-400">—</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </CardContent>
                  </Card>

                  <Card className="border border-slate-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Profil comparatif</CardTitle>
                      <CardDescription>
                        Visualisation radar et lecture détaillée des critères clés.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr),minmax(0,1fr)]">
                        <RadarComparisonChart
                          data={comparisonAlternative.radar}
                          currentLabel={substance.inciEU}
                          alternativeLabel={comparisonAlternative.inciName}
                        />
                        <div className="space-y-3">
                          {comparisonAlternative.radar.map((entry) => {
                            const delta = entry.alternative - entry.current
                            const deltaLabel = delta > 0 ? `+${delta}` : `${delta}`
                            return (
                              <div
                                key={entry.criteria}
                                className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
                              >
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                  {entry.criteria}
                                </p>
                                <div className="mt-3 space-y-2">
                                  <div className="flex items-center justify-between text-sm text-slate-600">
                                    <span className="font-medium text-slate-900">{substance.inciEU}</span>
                                    <span>{entry.current}%</span>
                                  </div>
                                  <Progress value={entry.current} className="h-1.5 bg-slate-100" />
                                  <div className="flex items-center justify-between text-sm text-emerald-600">
                                    <span className="font-medium">{comparisonAlternative.inciName}</span>
                                    <span>{entry.alternative}%</span>
                                  </div>
                                  <Progress value={entry.alternative} className="h-1.5 bg-emerald-100" />
                                  <div
                                    className={cn(
                                      "flex items-center justify-between text-xs font-medium",
                                      delta >= 0 ? "text-emerald-600" : "text-rose-600"
                                    )}
                                  >
                                    <span>Différence alternative</span>
                                    <span>{deltaLabel}%</span>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>

              <div className="border-t bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toast.success("Export comparaison (simulation).")}
                    >
                      <FileText className="mr-2 h-4 w-4" /> Exporter comparaison PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toast.success("Lien partagé avec l'équipe (simulation).")}
                    >
                      <Share2 className="mr-2 h-4 w-4" /> Partager avec l'équipe
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => toast.success("Demande d'échantillons envoyée (simulation).")}
                    >
                      Demander échantillons
                    </Button>
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => toast.success("Alternative validée (simulation).")}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" /> Valider cette alternative
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
