"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  CalendarClock,
  Beaker,
  ClipboardCheck,
  Download,
  GaugeCircle,
  Globe2,
  Percent,
  ShieldAlert
} from "lucide-react"
import type { Restriction } from "@/shared/types"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/shared/ui/card"
import { Input } from "@/shared/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/shared/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table"
import { toast } from "sonner"

import { cn, formatDate } from "@/shared/lib/utils"
import { formatPercentage } from "../detail-utils"
import { getComplianceRules } from "@/shared/lib/mock-data"
import { restrictionThemes, scenarioThemes, type ScenarioStatus } from "../detail-constants"
import type { ComplianceSnapshot, ScenarioResult } from "../detail-types"

interface RegulatoryInsightsSectionProps {
  restrictions: Restriction[]
  recommendedUsage: number
  complianceSnapshot: ComplianceSnapshot
  substanceId: string
}

export function RegulatoryInsightsSection({
  restrictions,
  recommendedUsage,
  complianceSnapshot,
  substanceId
}: RegulatoryInsightsSectionProps) {
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([])
  const [selectedApplication, setSelectedApplication] = useState<string>("")
  const [usagePercentage, setUsagePercentage] = useState<number>(recommendedUsage || 1)

  const availableMarkets = useMemo(() => {
    return Array.from(new Set(restrictions.map((restriction) => restriction.country))).sort(
      (a, b) => a.localeCompare(b, "fr", { sensitivity: "base" })
    )
  }, [restrictions])

  const availableApplications = useMemo(() => {
    const set = new Set<string>()
    restrictions.forEach((restriction) => {
      restriction.applications?.forEach((application) => {
        set.add(application)
      })
    })
    return Array.from(set).sort((a, b) => a.localeCompare(b, "fr", { sensitivity: "base" }))
  }, [restrictions])

  const applicationMatrix = useMemo(() => {
    const map = new Map<
      string,
      {
        maxPercentage: number | null
        countries: Set<string>
        restrictionTypes: Set<Restriction["type"]>
      }
    >()

    restrictions.forEach((restriction) => {
      restriction.applications?.forEach((application) => {
        const entry =
          map.get(application) ??
          {
            maxPercentage: null,
            countries: new Set<string>(),
            restrictionTypes: new Set<Restriction["type"]>()
          }

        if (
          typeof restriction.maxPercentage === "number" &&
          (entry.maxPercentage === null || restriction.maxPercentage < entry.maxPercentage)
        ) {
          entry.maxPercentage = restriction.maxPercentage
        }

        entry.countries.add(restriction.country)
        entry.restrictionTypes.add(restriction.type)
        map.set(application, entry)
      })
    })

    return Array.from(map.entries()).map(([application, entry]) => ({
      application,
      maxPercentage: entry.maxPercentage,
      countries: Array.from(entry.countries),
      restrictionTypes: Array.from(entry.restrictionTypes)
    }))
  }, [restrictions])

  const regulationTimeline = useMemo(() => {
    const items = restrictions
      .filter((restriction) => Boolean(restriction.revisionDate))
      .map((restriction) => {
        const dateObj = new Date(restriction.revisionDate as string)
        return {
          id: restriction.id,
          country: restriction.country,
          type: restriction.type,
          date: restriction.revisionDate as string,
          dateObj,
          reference: restriction.reference ?? "",
          observations: restriction.observations ?? ""
        }
      })
      .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())

    const now = Date.now()
    const upcoming = items.filter((item) => item.dateObj.getTime() >= now).slice(0, 3)
    const past = items.filter((item) => item.dateObj.getTime() < now).slice(-3)

    return { upcoming, past }
  }, [restrictions])

  const toggleMarket = useCallback((market: string) => {
    setSelectedMarkets((previous) => {
      if (previous.includes(market)) {
        return previous.filter((item) => item !== market)
      }
      return [...previous, market]
    })
  }, [])

  const handleUsageChange = useCallback((value: number) => {
    if (!Number.isFinite(value)) {
      setUsagePercentage(0)
      return
    }
    const clamped = Math.min(Math.max(value, 0), 100)
    setUsagePercentage(clamped)
  }, [])

  useEffect(() => {
    setUsagePercentage((previous) => {
      if (Math.abs(previous - recommendedUsage) < 0.01) {
        return previous
      }
      return recommendedUsage
    })
  }, [recommendedUsage])

  const scenarioResults = useMemo<ScenarioResult[]>(() => {
    if (!selectedMarkets.length) return []

    return selectedMarkets.map((country) => {
      const byCountry = restrictions.filter((restriction) => restriction.country === country)
      if (!byCountry.length) {
        return {
          country,
          status: "unknown",
          message: "Aucune contrainte référencée dans le référentiel.",
          maxPercentage: null,
          margin: null,
          references: []
        }
      }

      const applicationFiltered = byCountry.filter((restriction) => {
        if (!selectedApplication) return true
        if (!restriction.applications || restriction.applications.length === 0) return true
        return restriction.applications.includes(selectedApplication)
      })
      const restrictionSet = applicationFiltered.length ? applicationFiltered : byCountry

      const references = restrictionSet
        .map((restriction) => restriction.reference)
        .filter((reference): reference is string => Boolean(reference))

      const hasForbidden = restrictionSet.some(
        (restriction) => restriction.type === "forbidden" || restriction.maxPercentage === 0
      )

      const maxPercentages = restrictionSet
        .map((restriction) => restriction.maxPercentage)
        .filter((value): value is number => typeof value === "number")

      const minLimit =
        maxPercentages.length === 0 ? null : maxPercentages.reduce((acc, value) => Math.min(acc, value))

      if (hasForbidden) {
        return {
          country,
          status: "blocked",
          message: "Usage interdit dans cette configuration.",
          maxPercentage: 0,
          margin: null,
          references
        }
      }

      if (minLimit !== null && usagePercentage > minLimit) {
        return {
          country,
          status: "blocked",
          message: `Dépasse la limite de ${minLimit}%`,
          maxPercentage: minLimit,
          margin: minLimit - usagePercentage,
          references
        }
      }

      const nearThreshold = minLimit !== null && usagePercentage >= minLimit * 0.8

      if (nearThreshold) {
        return {
          country,
          status: "exceeds",
          message:
            minLimit !== null
              ? `Marge disponible de ${(minLimit - usagePercentage).toFixed(2)} point(s).`
              : "Surveillance recommandée.",
          maxPercentage: minLimit,
          margin: minLimit !== null ? minLimit - usagePercentage : null,
          references
        }
      }

      return {
        country,
        status: "ok",
        message:
          minLimit !== null
            ? `Conforme (limite ${minLimit}%)`
            : "Aucune restriction connue pour cette configuration.",
        maxPercentage: minLimit,
        margin: minLimit !== null ? minLimit - usagePercentage : null,
        references
      }
    })
  }, [restrictions, selectedApplication, selectedMarkets, usagePercentage])

  const complianceRules = useMemo(() => getComplianceRules(substanceId), [substanceId])

  const [calcProductType, setCalcProductType] = useState<string>("")
  const [calcBodyZone, setCalcBodyZone] = useState<string>("")
  const [calcConcentration, setCalcConcentration] = useState<number>(recommendedUsage || 1)

  const complianceProductTypes = useMemo(() => {
    return Array.from(new Set(complianceRules.map((rule) => rule.productType))).sort((a, b) =>
      a.localeCompare(b, "fr", { sensitivity: "base" })
    )
  }, [complianceRules])

  useEffect(() => {
    setCalcProductType((previous) => {
      if (previous && complianceProductTypes.includes(previous)) return previous
      return complianceProductTypes[0] ?? ""
    })
  }, [complianceProductTypes])

  const complianceBodyZones = useMemo(() => {
    const zones = complianceRules
      .filter((rule) => (calcProductType ? rule.productType === calcProductType : true))
      .map((rule) => rule.bodyZone)
    return Array.from(new Set(zones)).sort((a, b) => a.localeCompare(b, "fr", { sensitivity: "base" }))
  }, [calcProductType, complianceRules])

  useEffect(() => {
    setCalcBodyZone((previous) => {
      if (previous && complianceBodyZones.includes(previous)) return previous
      return complianceBodyZones[0] ?? ""
    })
  }, [complianceBodyZones])

  useEffect(() => {
    setCalcConcentration((previous) => {
      if (Math.abs(previous - (recommendedUsage || 1)) < 0.01) {
        return previous
      }
      return recommendedUsage || previous
    })
  }, [recommendedUsage])

  const complianceResults = useMemo(() => {
    if (!complianceRules.length || !calcProductType || !calcBodyZone) return []

    const relevantRules = complianceRules.filter(
      (rule) => rule.productType === calcProductType && rule.bodyZone === calcBodyZone
    )

    const regions = Array.from(new Set(relevantRules.map((rule) => rule.region)))

    return regions.map((region) => {
      const rule = relevantRules.find((entry) => entry.region === region)
      if (!rule) {
        return {
          region,
          status: "unknown" as ScenarioStatus,
          message: "Pas de règle référencée.",
          maxPercentage: null,
          note: undefined
        }
      }

      if (rule.status === "forbidden" || rule.maxPercentage === 0) {
        return {
          region: rule.region,
          status: "blocked" as ScenarioStatus,
          message: rule.note ?? "Usage interdit dans cette configuration.",
          maxPercentage: 0,
          note: rule.note
        }
      }

      if (rule.maxPercentage !== null && calcConcentration > rule.maxPercentage) {
        return {
          region: rule.region,
          status: "blocked" as ScenarioStatus,
          message: `Dépasse la limite de ${rule.maxPercentage}%`,
          maxPercentage: rule.maxPercentage,
          note: rule.note
        }
      }

      const nearThreshold =
        rule.maxPercentage !== null && calcConcentration >= rule.maxPercentage * 0.8

      if (rule.status === "warning" || nearThreshold) {
        return {
          region: rule.region,
          status: "exceeds" as ScenarioStatus,
          message:
            rule.note ??
            (rule.maxPercentage !== null
              ? `À surveiller (limite ${rule.maxPercentage}%)`
              : "Conforme avec vigilance"),
          maxPercentage: rule.maxPercentage,
          note: rule.note
        }
      }

      return {
        region: rule.region,
        status: "ok" as ScenarioStatus,
        message:
          rule.maxPercentage !== null
            ? `OK (max ${rule.maxPercentage}%)`
            : rule.note ?? "Conforme",
        maxPercentage: rule.maxPercentage,
        note: rule.note
      }
    })
  }, [calcBodyZone, calcConcentration, calcProductType, complianceRules])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-primary" />
            Veille réglementaire multi-régions
          </CardTitle>
          <CardDescription>
            Visualisation des restrictions officielles et internes pour anticiper les blocages de mise sur le marché.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {restrictions.length ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pays / zone</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Applications</TableHead>
                    <TableHead>Limite</TableHead>
                    <TableHead>Révision</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {restrictions.map((restriction) => (
                    <TableRow key={restriction.id}>
                      <TableCell className="font-medium text-slate-900">
                        {restriction.country}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            "border text-xs font-semibold",
                            restrictionThemes[restriction.type].className
                          )}
                        >
                          {restrictionThemes[restriction.type].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {restriction.applications?.length
                          ? restriction.applications.join(", ")
                          : "—"}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {formatPercentage(restriction.maxPercentage)}
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">
                        {restriction.revisionDate
                          ? formatDate(restriction.revisionDate, "dd MMM yyyy")
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="rounded-md border border-dashed border-primary/30 bg-primary/5 p-4 text-sm text-primary">
                <p className="font-semibold">
                  {complianceSnapshot.forbidden.length} interdictions •{" "}
                  {complianceSnapshot.regulated.length} contraintes fortes •{" "}
                  {complianceSnapshot.listed.length} obligations de déclaration.
                </p>
                <p className="text-xs">
                  Explorer les annexes et anticiper les demandes locales.
                </p>
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-500">
              Aucune restriction n&apos;est actuellement renseignée pour cette substance.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Beaker className="h-5 w-5 text-primary" />
            Assistant formulation instantané
          </CardTitle>
          <CardDescription>
            Simulez l&apos;usage cible par marché pour valider en quelques secondes vos hypothèses de dosage.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Type d&apos;application
            </p>
            {availableApplications.length ? (
              <div className="flex flex-wrap gap-2">
                {availableApplications.map((application) => {
                  const isActive = selectedApplication === application
                  return (
                    <Button
                      key={application}
                      size="sm"
                      variant={isActive ? "default" : "outline"}
                      className="h-8"
                      onClick={() => setSelectedApplication(application)}
                    >
                      {application}
                    </Button>
                  )
                })}
                <Button
                  size="sm"
                  variant={selectedApplication === "" ? "default" : "outline"}
                  className="h-8"
                  onClick={() => setSelectedApplication("")}
                >
                  Global
                </Button>
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                Aucune application spécifique n&apos;est renseignée pour cette substance.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Marchés ciblés
            </p>
            {availableMarkets.length ? (
              <div className="flex flex-wrap gap-2">
                {availableMarkets.map((market) => {
                  const isActive = selectedMarkets.includes(market)
                  return (
                    <Button
                      key={market}
                      size="sm"
                      variant={isActive ? "default" : "outline"}
                      className="h-8"
                      onClick={() => toggleMarket(market)}
                    >
                      {market}
                    </Button>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                Aucun marché n&apos;a encore été associé à cette substance.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Dosage intentionné</span>
              <span>{usagePercentage.toFixed(2)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={0.1}
              value={usagePercentage}
              onChange={(event) => handleUsageChange(Number(event.target.value))}
              className="h-2 w-full cursor-pointer rounded-lg bg-slate-200"
            />
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                max={100}
                step={0.1}
                value={usagePercentage}
                onChange={(event) => handleUsageChange(Number(event.target.value))}
                className="w-24"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUsageChange(recommendedUsage)}
                className="gap-2"
              >
                <Percent className="h-4 w-4" />
                Aligné sur {recommendedUsage.toFixed(1)}%
              </Button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {scenarioResults.length ? (
              scenarioResults.map((result) => {
                const theme = scenarioThemes[result.status]
                const Icon = theme.icon
                return (
                  <div
                    key={`${result.country}-${result.status}`}
                    className={cn(
                      "flex flex-col gap-2 rounded-lg border p-4",
                      result.status === "ok"
                        ? "border-emerald-200 bg-emerald-50"
                        : result.status === "exceeds"
                          ? "border-amber-200 bg-amber-50"
                          : result.status === "blocked"
                            ? "border-rose-200 bg-rose-50"
                            : "border-slate-200 bg-slate-50"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{result.country}</p>
                          <p className="text-xs text-slate-500">{theme.description}</p>
                        </div>
                      </div>
                      <Badge className={cn("rounded-full text-xs", theme.badgeClass)}>
                        {theme.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-700">{result.message}</p>
                    {result.maxPercentage !== null ? (
                      <p className="text-xs text-slate-500">
                        Limite réglementaire: {result.maxPercentage}%
                      </p>
                    ) : null}
                    {result.references.length ? (
                      <p className="text-[11px] text-slate-400">
                        Réf: {result.references.join(", ")}
                      </p>
                    ) : null}
                  </div>
                )
              })
            ) : (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                Sélectionnez au moins un marché pour évaluer la conformité instantanément.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GaugeCircle className="h-5 w-5 text-primary" />
            Calculateur conformité multi-zones
          </CardTitle>
          <CardDescription>
            Vérifiez simultanément l&apos;adéquation d&apos;un dosage par type de produit et zone corporelle.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {complianceRules.length ? (
            <>
              <div className="grid gap-3 md:grid-cols-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Concentration (%)
                  </p>
                  <Input
                    type="number"
                    min={0}
                    step={0.1}
                    value={calcConcentration}
                    onChange={(event) => {
                      const value = Number.parseFloat(event.target.value)
                      if (Number.isNaN(value)) {
                        setCalcConcentration(0)
                      } else {
                        setCalcConcentration(Math.max(0, value))
                      }
                    }}
                    className="mt-1"
                  />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Type produit
                  </p>
                  <Select value={calcProductType} onValueChange={setCalcProductType}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Type de produit" />
                    </SelectTrigger>
                    <SelectContent>
                      {complianceProductTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Zone corporelle
                  </p>
                  <Select value={calcBodyZone} onValueChange={setCalcBodyZone}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Zone" />
                    </SelectTrigger>
                    <SelectContent>
                      {complianceBodyZones.map((zone) => (
                        <SelectItem key={zone} value={zone}>
                          {zone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Résultats instantanés
                </p>
                {complianceResults.length ? (
                  <div className="space-y-2">
                    {complianceResults.map((result) => {
                      const theme = scenarioThemes[result.status]
                      const icon =
                        result.status === "blocked"
                          ? "🔴"
                          : result.status === "exceeds"
                            ? "🟠"
                            : result.status === "ok"
                              ? "🟢"
                              : "⚪"
                      return (
                        <div
                          key={result.region}
                          className={cn(
                            "flex items-start justify-between gap-3 rounded-lg border px-3 py-2 text-sm",
                            result.status === "blocked"
                              ? "border-rose-200 bg-rose-50 text-rose-700"
                              : result.status === "exceeds"
                                ? "border-amber-200 bg-amber-50 text-amber-700"
                                : result.status === "ok"
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                  : "border-slate-200 bg-slate-50 text-slate-600"
                          )}
                        >
                          <div>
                            <p className="font-semibold">
                              {icon} {result.region}
                            </p>
                            <p className="text-xs text-slate-600">
                              {theme.description}
                            </p>
                          </div>
                          <div className="text-right text-xs">
                            <p className="font-medium text-slate-800">{result.message}</p>
                            {result.maxPercentage !== null ? (
                              <p className="text-[11px] text-slate-500">
                                Limite: {result.maxPercentage}%
                              </p>
                            ) : null}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">
                    Sélectionnez une configuration pour afficher les règles disponibles.
                  </p>
                )}
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-500">
              Aucune règle de conformité n&apos;a encore été renseignée pour cette substance.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            Garde-fous formulation
          </CardTitle>
          <CardDescription>
            Synthèse des limites par type d&apos;application et zones impactées.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {applicationMatrix.length ? (
            <>
              <div className="space-y-3">
                {applicationMatrix.map((entry) => (
                  <div
                    key={entry.application}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{entry.application}</p>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                          {entry.countries.map((country) => (
                            <Badge
                              key={country}
                              className="rounded-full border-slate-200 text-[11px]"
                            >
                              {country}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Badge className="rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        Max {entry.maxPercentage !== null ? `${entry.maxPercentage}%` : "—"}
                      </Badge>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
                      <span className="font-medium">Statuts:</span>
                      {entry.restrictionTypes.map((type) => (
                        <Badge
                          key={type}
                          className={cn(
                            "rounded-full border text-[11px]",
                            restrictionThemes[type].className
                          )}
                        >
                          {restrictionThemes[type].label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2"
                onClick={() => toast.success("Matrix formulation exportée (simulation).")}
              >
                <Download className="h-4 w-4" />
                Exporter la matrice formulation
              </Button>
            </>
          ) : (
            <p className="text-sm text-slate-500">
              Aucune règle renseignée pour cette combinaison produit / zone.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe2 className="h-5 w-5 text-primary" />
            Radar échéances marché
          </CardTitle>
          <CardDescription>
            Visualisez les prochaines révisions réglementaires et anticipez les demandes marketing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {regulationTimeline.upcoming.length ? (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                À venir
              </p>
              {regulationTimeline.upcoming.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold">{item.country}</span>
                    <Badge className={cn("rounded-full text-xs", restrictionThemes[item.type].className)}>
                      {restrictionThemes[item.type].label}
                    </Badge>
                  </div>
                  <p className="text-xs text-amber-700">
                    Révision prévue le {formatDate(item.date, "dd MMM yyyy")}
                  </p>
                  {item.observations ? (
                    <p className="mt-1 text-xs text-amber-800">{item.observations}</p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              Aucune révision future n&apos;est enregistrée pour cette substance.
            </p>
          )}

          {regulationTimeline.past.length ? (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Révisions passées
              </p>
              {regulationTimeline.past.map((item) => (
                <div
                  key={`${item.id}-past`}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600"
                >
                  {item.country} • {formatDate(item.date, "dd MMM yyyy")}
                  {item.reference ? ` • ${item.reference}` : ""}
                </div>
              ))}
            </div>
          ) : null}

          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2"
            onClick={() => toast.info("Synchronisation calendrier conformité (simulation).")}
          >
            <CalendarClock className="h-4 w-4" />
            Exporter dans le calendrier conformité
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
