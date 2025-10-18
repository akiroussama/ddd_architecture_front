"use client"

import * as React from "react"
import { useMemo } from "react"
import type { ComponentProps } from "react"
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  CalendarDays,
  CheckCircle2,
  Filter,
  Leaf,
  MapPin,
  MoveRight,
  PlayCircle,
  Plus,
  Search,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  XCircle,
  ZoomIn
} from "lucide-react"
import { toast } from "sonner"

import type { RestrictionType, Substance } from "@/shared/types"

import { getRegulatoryTimeline, type RegulatoryTimelineEvent } from "@/shared/lib/mock-data"

import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card"
import { ScrollArea } from "@/shared/ui/scroll-area"

import { cn, formatRelativeDate } from "@/shared/lib/utils"

const MARKETS = [
  { id: "EU", label: "EU" },
  { id: "US", label: "US" },
  { id: "CN", label: "China" },
  { id: "JP", label: "Japan" }
] as const

const MARKET_LABELS: Record<string, string> = {
  EU: "Union Européenne",
  US: "États-Unis",
  CN: "Chine",
  JP: "Japon"
}

const RESTRICTION_SEVERITY: Record<RestrictionType, number> = {
  forbidden: 4,
  regulated: 3,
  listed: 2,
  unlisted: 1
}

const RESTRICTION_LABELS: Record<RestrictionType, string> = {
  forbidden: "Interdite",
  regulated: "Sous seuil",
  listed: "Listée",
  unlisted: "Non listée"
}

const RISK_TOKEN: Record<RestrictionType, string> = {
  forbidden: "Critique",
  regulated: "Surveiller",
  listed: "Conforme",
  unlisted: "OK"
}

const MARKET_DEFAULT_IMPACT = 42

const IMPACT_COLORS: Record<RestrictionType | "none", string> = {
  forbidden: "bg-red-500/90 hover:bg-red-500 text-white",
  regulated: "bg-amber-500/90 hover:bg-amber-500 text-white",
  listed: "bg-emerald-500/90 hover:bg-emerald-500 text-white",
  unlisted: "bg-slate-400/80 hover:bg-slate-400 text-white",
  none: "bg-slate-200 hover:bg-slate-300 text-slate-700"
}

const SUPPLIER_POOL = [
  { id: "supplier-a", name: "Fournisseur A", region: "EU" },
  { id: "supplier-b", name: "Fournisseur B", region: "Asie" },
  { id: "supplier-c", name: "Fournisseur C", region: "Amériques" }
]

type MarketId = (typeof MARKETS)[number]["id"]

function hashString(input: string) {
  let hash = 0
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index)
    hash |= 0
  }
  return Math.abs(hash)
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function formatEuro(amount: number) {
  if (!Number.isFinite(amount)) return "—"
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}M€`
  }
  if (amount >= 1_000) {
    return `${Math.round(amount / 1_000)}k€`
  }
  return `${Math.round(amount)}€`
}

export type DashboardAction =
  | { type: "focus-substance"; substance: Substance }
  | { type: "filter"; market?: MarketId; restriction?: RestrictionType }
  | { type: "focus-status"; status: Substance["status"] }
  | { type: "open-smart-docs" }

interface HeatmapCell {
  restriction?: RestrictionType
  severity: number
  label: string
  impact: number
}

interface HeatmapRow {
  substance: Substance
  score: number
  cells: Record<MarketId, HeatmapCell>
  totalImpact: number
}

interface TimelineEvent {
  id: string
  label: string
  substance: Substance
  documentName: string
  status: "urgent" | "critique" | "important" | "planifie" | "anticipe"
  daysUntil: number
  actionLabel: string
}

interface SupplierEntry {
  supplier: string
  region: string
  totalImpact: number
  critical: Array<{ substance: Substance; summary: string }>
  watch: Array<{ substance: Substance; summary: string }>
  optimised: Array<{ substance: Substance; summary: string }>
}

interface FormulationMetric {
  id: string
  tone: "error" | "warning" | "success"
  label: string
  count: number
  turnover: number
  cta: string
  badge: string
}

interface RegulatoryEvent {
  id: string
  tone: "flash" | "update" | "opportunity" | "loop"
  message: string
  action: string
  updatedAt?: string
}

interface CostVolatilityEntry {
  id: string
  substance: Substance
  change: number
  impact: number
  volatility: number
  suggestion?: string
  lastUpdated: string
}

interface AllergenPoint {
  id: string
  allergen: string
  concentration: number
  formulasImpacted: number
  proximity: "critical" | "warning" | "safe"
}

interface NaturalitySegment {
  id: string
  label: string
  naturalPercent: number
  organicPercent: number
  trend: number
  objective: number
}

interface WorkloadMember {
  id: string
  name: string
  reviews: number
  urgent: number
  capacity: number
  avatar: string
}

interface ClaimValidation {
  id: string
  claim: string
  support: string
  status: "valid" | "warning" | "invalid"
  impact?: string
}

interface RegWatchAlert {
  id: string
  event: RegulatoryTimelineEvent
  substance: Substance
  severity: "critical" | "warning" | "positive"
  daysUntil: number
  businessValue: number
  formulasImpacted: number
  action: string
  projectBudget: number
  projectDurationWeeks: number
  kickoffInWeeks: number
}

interface MainDashboardProps {
  substances: Substance[]
  onNavigate?: (action: DashboardAction) => void
}

export function MainDashboard({ substances, onNavigate }: MainDashboardProps) {
  const heatmapRows = useMemo<HeatmapRow[]>(() => {
    return substances
      .map<HeatmapRow>((substance, index) => {
        const cells = MARKETS.reduce((acc, market) => {
          const restriction = substance.restrictions.find((item) => item.country === market.id)
          if (restriction) {
            const severity = RESTRICTION_SEVERITY[restriction.type]
            const impact =
              (substance.documents?.length ?? 1) * severity * 11 +
              (substance.notes?.length ?? 0) * 7 +
              MARKET_DEFAULT_IMPACT +
              index * 3
            acc[market.id] = {
              restriction: restriction.type,
              severity,
              label: RISK_TOKEN[restriction.type],
              impact
            }
          } else {
            acc[market.id] = {
              severity: 0,
              label: "Non suivi",
              impact: MARKET_DEFAULT_IMPACT / 2
            }
          }
          return acc
        }, {} as Record<MarketId, HeatmapCell>)
        const score = Object.values(cells).reduce((total, cell) => total + cell.severity, 0)
        const totalImpact = Object.values(cells).reduce((total, cell) => total + cell.impact, 0)
        return {
          substance,
          cells,
          score,
          totalImpact
        }
      })
      .sort((a, b) => {
        if (b.score === a.score) {
          return b.totalImpact - a.totalImpact
        }
        return b.score - a.score
      })
      .slice(0, 5)
  }, [substances])

  const timelineEvents = useMemo<TimelineEvent[]>(() => {
    const now = Date.now()
    const MS_IN_DAY = 86_400_000

    const events = substances.flatMap((substance) =>
      (substance.documents ?? [])
        .filter(
          (
            document
          ): document is typeof document & {
            expiresAt: string
          } => Boolean(document.expiresAt)
        )
        .map((document) => {
          const timeDiff = new Date(document.expiresAt).getTime() - now
          const daysUntil = Math.ceil(timeDiff / MS_IN_DAY)
          let status: TimelineEvent["status"] = "anticipe"
          let actionLabel = "Planifier"

          if (daysUntil <= 0) {
            status = "urgent"
            actionLabel = "Renouveler"
          } else if (daysUntil <= 7) {
            status = "urgent"
            actionLabel = "Renouveler"
          } else if (daysUntil <= 15) {
            status = "critique"
            actionLabel = "Prioriser"
          } else if (daysUntil <= 30) {
            status = "important"
            actionLabel = "Assigner"
          } else if (daysUntil <= 60) {
            status = "planifie"
            actionLabel = "Préparer"
          }

          return {
            id: `${substance.id}-${document.id}`,
            label: document.category ?? "Document critique",
            substance,
            documentName: document.name,
            status,
            daysUntil,
            actionLabel
          }
        })
    )

    return events.sort((a, b) => a.daysUntil - b.daysUntil).slice(0, 12)
  }, [substances])

  const formulationMetrics = useMemo<FormulationMetric[]>(() => {
    let nonConforme = 0
    let atRisk = 0
    let optimisable = 0

    substances.forEach((substance) => {
      const hasForbidden = substance.restrictions.some((item) => item.type === "forbidden")
      const hasRegulated = substance.restrictions.some((item) => item.type === "regulated")
      if (hasForbidden || substance.status === "archived") {
        nonConforme += 1
      } else if (hasRegulated || substance.status === "under-review") {
        atRisk += 1
      } else {
        optimisable += 1
      }
    })

    const toTurnover = (count: number, multiplier: number) =>
      Math.max(Math.round(count * multiplier * 100) / 100, 0.1)

    return [
      {
        id: "non-conforme",
        tone: "error",
        label: "Non conforme",
        count: nonConforme,
        turnover: toTurnover(nonConforme, 0.19),
        cta: "Voir détail",
        badge: "🔴"
      },
      {
        id: "a-risque",
        tone: "warning",
        label: "À risque",
        count: atRisk,
        turnover: toTurnover(atRisk, 0.42),
        cta: "Anticiper",
        badge: "🟠"
      },
      {
        id: "optimisable",
        tone: "success",
        label: "Optimisable",
        count: optimisable,
        turnover: toTurnover(optimisable, 0.31),
        cta: "Substituer",
        badge: "🟢"
      }
    ]
  }, [substances])

  const regulatoryPulse = useMemo<RegulatoryEvent[]>(() => {
    const events: RegulatoryEvent[] = []

    substances.forEach((substance) => {
      substance.restrictions.forEach((restriction) => {
        const severity = RESTRICTION_SEVERITY[restriction.type]
        if (severity >= 4) {
          events.push({
            id: `${substance.id}-${restriction.country}-flash`,
            tone: "flash",
            message: `⚡ ${restriction.country}: ${substance.inciEU ?? substance.inciUS} ${RESTRICTION_LABELS[restriction.type]} — ${substance.restrictions.length} impacts`,
            action: "Action requise",
            updatedAt: substance.updatedAt
          })
        } else if (severity === 3) {
          events.push({
            id: `${substance.id}-${restriction.country}-watch`,
            tone: "update",
            message: `📋 ${restriction.country}: Ajuster seuil ${substance.inciEU} (${restriction.maxPercentage ?? "n.a."}%)`,
            action: "Surveiller",
            updatedAt: substance.updatedAt
          })
        } else {
          events.push({
            id: `${substance.id}-${restriction.country}-opportunity`,
            tone: "opportunity",
            message: `✅ ${substance.inciEU} exploitable sur ${restriction.country}`,
            action: "Explorer",
            updatedAt: substance.updatedAt
          })
        }
      })
    })

    return events
      .sort((a, b) => {
        const toneWeight = (tone: RegulatoryEvent["tone"]) =>
          tone === "flash" ? 3 : tone === "update" ? 2 : tone === "opportunity" ? 1 : 0
        const toneComparison = toneWeight(b.tone) - toneWeight(a.tone)
        if (toneComparison !== 0) return toneComparison
        const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0
        const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0
        return bTime - aTime
      })
      .slice(0, 12)
  }, [substances])

  const supplierIntelligence = useMemo<SupplierEntry[]>(() => {
    const map = new Map<string, SupplierEntry>()

    substances.forEach((substance, index) => {
      const supplier = SUPPLIER_POOL[index % SUPPLIER_POOL.length]
      const entry =
        map.get(supplier.id) ??
        {
          supplier: supplier.name,
          region: supplier.region,
          totalImpact: 0,
          critical: [],
          watch: [],
          optimised: []
        }

      const impact =
        (substance.restrictions.length + 1) * (substance.documents?.length ?? 1) * 0.12 +
        (substance.notes?.length ?? 0) * 0.05 +
        0.1

      entry.totalImpact += impact

      if (substance.restrictions.some((item) => item.type === "forbidden")) {
        entry.critical.push({
          substance,
          summary: `${MARKET_LABELS[substance.restrictions[0]?.country ?? "EU"] ?? "Marché"}: Blocage`
        })
      } else if (substance.restrictions.some((item) => item.type === "regulated")) {
        entry.watch.push({
          substance,
          summary: `${substance.restrictions.length} marchés sous seuil`
        })
      } else {
        entry.optimised.push({
          substance,
          summary: `${substance.families[0] ?? "Usage"} stable`
        })
      }

      map.set(supplier.id, entry)
    })

    return Array.from(map.values()).map((entry) => ({
      ...entry,
      totalImpact: Math.round(entry.totalImpact * 100) / 100
    }))
  }, [substances])

  const costVolatility = useMemo<CostVolatilityEntry[]>(() => {
    return substances.slice(0, 8).map((substance, index) => {
      const hash = hashString(`${substance.id}-${index}`)
      const rawChange = ((hash % 900) / 10) - 45
      const roundedChange = clamp(Math.round(rawChange * 10) / 10, -35, 55)
      const impact = Math.max(12, (hash % 240) + 20)
      const volatility = clamp(((hash >> 3) % 65) + 20, 18, 95)
      const suggestion =
        roundedChange >= 25
          ? "Proposer substitution"
          : roundedChange <= -20
            ? "Opportunité d'achat"
            : undefined

      return {
        id: `${substance.id}-volatility`,
        substance,
        change: roundedChange,
        impact,
        volatility,
        suggestion,
        lastUpdated: substance.updatedAt ?? substance.createdAt ?? new Date().toISOString()
      }
    })
  }, [substances])

  const allergenRadar = useMemo<AllergenPoint[]>(() => {
    const map = new Map<string, AllergenPoint>()

    substances.forEach((substance) => {
      ;(substance.allergens26 ?? []).forEach((allergen, allergenIndex) => {
        const key = allergen.toLowerCase()
        const hash = hashString(`${substance.id}-${key}-${allergenIndex}`)
        const concentration = clamp(((hash % 260) + 40) / 100, 0.05, 2.5)
        const formulasImpacted = Math.max(
          8,
          Math.round(((hash >> 4) % 160) + (substance.documents?.length ?? 1) * 6)
        )
        const proximity: AllergenPoint["proximity"] =
          concentration >= 1.0 ? "critical" : concentration >= 0.45 ? "warning" : "safe"

        const current = map.get(key)
        if (current) {
          current.formulasImpacted += formulasImpacted
          current.concentration = Math.max(current.concentration, concentration)
          current.proximity =
            proximity === "critical"
              ? "critical"
              : proximity === "warning" && current.proximity !== "critical"
                ? "warning"
                : current.proximity
          map.set(key, current)
        } else {
          map.set(key, {
            id: key,
            allergen,
            concentration,
            formulasImpacted,
            proximity
          })
        }
      })
    })

    const entries = Array.from(map.values()).sort((a, b) => {
      const weight = (value: AllergenPoint["proximity"]) =>
        value === "critical" ? 3 : value === "warning" ? 2 : 1
      const proximityDiff = weight(b.proximity) - weight(a.proximity)
      if (proximityDiff !== 0) {
        return proximityDiff
      }
      return b.formulasImpacted - a.formulasImpacted
    })

    if (entries.length === 0) {
      return [
        {
          id: "linalool",
          allergen: "Linalool",
          concentration: 1.2,
          formulasImpacted: 180,
          proximity: "critical"
        },
        {
          id: "limonene",
          allergen: "Limonene",
          concentration: 0.68,
          formulasImpacted: 125,
          proximity: "warning"
        },
        {
          id: "citral",
          allergen: "Citral",
          concentration: 0.24,
          formulasImpacted: 64,
          proximity: "safe"
        }
      ]
    }

    return entries.slice(0, 8)
  }, [substances])

  const naturalitySegments = useMemo<NaturalitySegment[]>(() => {
    const segments = ["Gamme Bio", "Gamme Premium", "Gamme Classique"]
    return segments.map((label, index) => {
      const hash = hashString(`${label}-${substances.length}-${index}`)
      const naturalPercent = clamp(48 + (hash % 52), 40, 95)
      const organicPercent = clamp(12 + ((hash >> 4) % 55), 5, naturalPercent - 5)
      const trend = clamp(((hash % 21) - 8) / 2, -6, 12)
      const objective = label === "Gamme Bio" ? 85 : label === "Gamme Premium" ? 70 : 55
      return {
        id: label.toLowerCase().replace(/\s+/g, "-"),
        label,
        naturalPercent,
        organicPercent,
        trend,
        objective
      }
    })
  }, [substances])

  const workloadMembers = useMemo<WorkloadMember[]>(() => {
    const names = new Set<string>()
    substances.forEach((substance) => {
      if (substance.updatedBy) names.add(substance.updatedBy)
      if (substance.createdBy) names.add(substance.createdBy)
    })

    const defaultNames = ["Sophie Martin", "Marc Lopez", "Lisa Chen", "Amélie Fournier"]
    const roster = Array.from(names.size ? names : new Set(defaultNames)).slice(0, 4)

    return roster.map((name, index) => {
      const hash = hashString(`${name}-${index}`)
      const reviews = clamp((hash % 9) + 4, 3, 12)
      const capacity = clamp(12 + ((hash >> 3) % 6), reviews + 2, 18)
      const urgent = clamp(hash % 4, 0, reviews)
      const initials = name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
      return {
        id: `${name.toLowerCase().replace(/\s+/g, "-")}`,
        name,
        reviews,
        urgent,
        capacity,
        avatar: initials
      }
    })
  }, [substances])

  const claimValidations = useMemo<ClaimValidation[]>(() => {
    const parabenCount = substances.filter((substance) =>
      [substance.inciEU, substance.inciUS, substance.inciMixed]
        .filter(Boolean)
        .some((label) => label?.toLowerCase().includes("paraben"))
    ).length
    const hasParaben = parabenCount > 0
    const sulfateCount = substances.filter((substance) =>
      [substance.inciEU, substance.inciUS, substance.inciMixed]
        .filter(Boolean)
        .some((label) => /sulfate/i.test(label ?? ""))
    ).length
    const averageNaturality =
      naturalitySegments.reduce((total, segment) => total + segment.naturalPercent, 0) /
      naturalitySegments.length
    const allergenCritical = allergenRadar.filter((entry) => entry.proximity === "critical")
    return [
      {
        id: "claim-parabens",
        claim: "Sans Parabènes",
        support: hasParaben
          ? `⚠️ ${parabenCount} substance${parabenCount > 1 ? "s" : ""} à vérifier`
          : "✓ 0 paraben détecté",
        status: hasParaben ? "warning" : "valid",
        impact: hasParaben ? "Prioriser revue réglementaire" : undefined
      },
      {
        id: "claim-natural",
        claim: "95% Naturel",
        support: `${averageNaturality.toFixed(1)}% naturalité moyenne`,
        status: averageNaturality >= 95 ? "valid" : averageNaturality >= 85 ? "warning" : "invalid",
        impact:
          averageNaturality >= 95
            ? undefined
            : `Reste ${Math.max(0, Math.round(95 - averageNaturality))}% pour atteindre l'objectif`
      },
      {
        id: "claim-hypo",
        claim: "Hypoallergénique",
        support:
          allergenCritical.length > 0
            ? `⚠️ ${allergenCritical.length} allergènes critiques`
            : "✓ Aucun allergène critique",
        status: allergenCritical.length > 0 ? "invalid" : "valid",
        impact:
          allergenCritical.length > 0
            ? `${allergenCritical[0]?.allergen} impacte ${allergenCritical[0]?.formulasImpacted} formules`
            : undefined
      },
      {
        id: "claim-vegan",
        claim: "Vegan",
        support: "✓ Matières premières sans origine animale détectée",
        status: "valid"
      },
      {
        id: "claim-sulfate",
        claim: "Sans Sulfates",
        support:
          sulfateCount > 0
            ? `⚠️ ${sulfateCount} ingrédients sulfatés détectés`
            : "✓ Aucun sulfate",
        status: sulfateCount > 0 ? "invalid" : "valid",
        impact:
          sulfateCount > 0
            ? `${Math.max(sulfateCount * 12, 45)} formules concernées`
            : "Claim prêt pour activation marketing"
      }
    ]
  }, [allergenRadar, naturalitySegments, substances])

  const regWatchAlerts = useMemo<RegWatchAlert[]>(() => {
    const today = new Date()
    const toStartOfDay = (value: Date) => new Date(value.getFullYear(), value.getMonth(), value.getDate())
    const baseDate = toStartOfDay(today)

    const alerts = substances.flatMap((substance) => {
      const timeline = getRegulatoryTimeline(substance.id)
      const upcoming = timeline.filter((event) => {
        const eventDate = new Date(event.date)
        return eventDate.getTime() >= baseDate.getTime()
      })

      const eventsToProcess = upcoming.length ? upcoming : timeline.slice(0, 1)

      return eventsToProcess.map((event) => {
          const eventDate = new Date(event.date)
          const diffDays = Math.max(
            0,
            Math.round((toStartOfDay(eventDate).getTime() - baseDate.getTime()) / 86_400_000)
          )
          const severity: RegWatchAlert["severity"] =
            event.type === "restriction" ? "critical" : event.type === "warning" ? "warning" : "positive"

          const formulasImpacted = event.impact?.formulas ?? Math.max(6, Math.round((hashString(event.id) % 12) + 6))
          const businessValue =
            event.impact?.businessValue ?? Math.round(formulasImpacted * 0.42 * 1_000_000 * 0.1)

          const projectBudget = Math.max(50_000, Math.round(businessValue * 0.18 / 1000) * 1000)
          const projectDurationWeeks = Math.max(8, Math.round(formulasImpacted / 2) * 2)
          const kickoffInWeeks = clamp(Math.max(1, Math.ceil(diffDays / 7) - 4), 1, 12)

          let action = "Préparer plan de reformulation"
          if (event.type === "restriction") {
            action = `Remplacement ${substance.inciEU ?? substance.inciUS}`
          } else if (event.type === "warning") {
            action = `Réduire dosage ${substance.inciEU ?? substance.inciUS}`
          } else if (event.type === "approval") {
            action = "Capitaliser sur opportunité"
          }

        return {
          id: `${event.id}-alert`,
          event,
          substance,
          severity,
          daysUntil: diffDays,
          businessValue,
          formulasImpacted,
          action,
          projectBudget,
          projectDurationWeeks,
          kickoffInWeeks
        }
      })
    })

    return alerts
      .sort((a, b) => {
        const severityWeight = (value: RegWatchAlert["severity"]) =>
          value === "critical" ? 3 : value === "warning" ? 2 : 1
        const severityDiff = severityWeight(b.severity) - severityWeight(a.severity)
        if (severityDiff !== 0) return severityDiff
        return a.daysUntil - b.daysUntil
      })
      .slice(0, 3)
  }, [substances])

  const handleNavigate = (action: DashboardAction) => {
    onNavigate?.(action)
    if (action.type === "open-smart-docs") {
      toast.success("Ouverture des Smart Documents…")
    }
  }

  return (
    <div className="relative">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        <div className="md:col-span-8">
          <RiskHeatmap rows={heatmapRows} onNavigate={handleNavigate} />
        </div>
        <div className="md:col-span-4">
          <FormulationImpactMeters metrics={formulationMetrics} onNavigate={handleNavigate} />
        </div>
        <div className="md:col-span-12">
          <ExpiryTimeline events={timelineEvents} onNavigate={handleNavigate} />
        </div>
        <div className="md:col-span-7">
          <RegulatoryPulse events={regulatoryPulse} onNavigate={handleNavigate} />
        </div>
        <div className="md:col-span-12">
          <RegWatchImpact alerts={regWatchAlerts} onNavigate={handleNavigate} />
        </div>
        <div className="md:col-span-5">
          <SupplierIntelligenceMap entries={supplierIntelligence} onNavigate={handleNavigate} />
        </div>
        <div className="md:col-span-6">
          <CostVolatilityTracker entries={costVolatility} onNavigate={handleNavigate} />
        </div>
        <div className="md:col-span-6">
          <AllergenRadarWidget points={allergenRadar} onNavigate={handleNavigate} />
        </div>
        <div className="md:col-span-7">
          <NaturalityIndexWidget segments={naturalitySegments} onNavigate={handleNavigate} />
        </div>
        <div className="md:col-span-5">
          <WorkloadEqualizer members={workloadMembers} onNavigate={handleNavigate} />
        </div>
        <div className="md:col-span-12">
          <ClaimValidator entries={claimValidations} onNavigate={handleNavigate} />
        </div>
      </div>
      <FloatingActionButtons onNavigate={handleNavigate} />
    </div>
  )
}

interface RiskHeatmapProps {
  rows: HeatmapRow[]
  onNavigate: (action: DashboardAction) => void
}

function RiskHeatmap({ rows, onNavigate }: RiskHeatmapProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Risk Heatmap</CardTitle>
            <CardDescription>Matrice substances × marchés critiques</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              toast.message("Instantané exporté", {
                description: "Capture du tableau enregistrée pour vos réunions."
              })
            }}
          >
            <DownloadIcon className="mr-2 h-4 w-4" />
            Snapshot
          </Button>
        </div>
      </CardHeader>
      <CardContent className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max border-separate border-spacing-y-2 text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
                <th className="pb-2 pr-4">Substance</th>
                {MARKETS.map((market) => (
                  <th key={market.id} className="pb-2 pr-4 text-center">
                    {market.label}
                  </th>
                ))}
                <th className="pb-2 text-right">Impact</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.substance.id} className="rounded-lg border border-slate-200 bg-white/80">
                  <td className="whitespace-nowrap px-4 py-3">
                    <button
                      type="button"
                      className="flex items-center gap-2 font-medium text-slate-900 transition hover:text-primary"
                      onClick={() => onNavigate({ type: "focus-substance", substance: row.substance })}
                    >
                      <ZoomIn className="h-4 w-4 text-slate-400" />
                      {row.substance.inciEU ?? row.substance.inciUS}
                    </button>
                    <p className="text-xs text-slate-500">
                      {row.substance.functions.join(", ") || "Fonction non renseignée"}
                    </p>
                  </td>
                  {MARKETS.map((market) => {
                    const cell = row.cells[market.id]
                    const tone = cell.restriction ?? "none"
                    return (
                      <td key={market.id} className="px-4 py-3">
                        <button
                          type="button"
                          className={cn(
                            "flex w-full flex-col items-center gap-1 rounded-lg px-3 py-2 text-center text-xs font-semibold shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                            IMPACT_COLORS[tone]
                          )}
                          onClick={() => {
                            toast.info(
                              `${row.substance.inciEU ?? row.substance.inciUS} • ${market.label}`,
                              {
                                description: `${cell.label} • ${Math.max(cell.impact, 0)} formules impactées`
                              }
                            )
                            onNavigate({
                              type: "filter",
                              market: market.id,
                              restriction: cell.restriction
                            })
                          }}
                        >
                          <span className="text-lg">
                            {cell.restriction === "forbidden"
                              ? "🔴"
                              : cell.restriction === "regulated"
                                ? "🟠"
                                : cell.restriction === "listed"
                                  ? "🟢"
                                  : "⚪"}
                          </span>
                          <span>{cell.label}</span>
                          <span className="text-[10px] uppercase tracking-wide text-white/80">
                            → {Math.max(cell.impact, 0)} formules
                          </span>
                        </button>
                      </td>
                    )
                  })}
                  <td className="whitespace-nowrap px-4 py-3 text-right text-xs text-slate-500">
                    Impact total&nbsp;
                    <span className="font-semibold text-slate-900">
                      {Math.max(row.totalImpact, 0)} formules
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

interface FormulationImpactMetersProps {
  metrics: FormulationMetric[]
  onNavigate: (action: DashboardAction) => void
}

function FormulationImpactMeters({ metrics, onNavigate }: FormulationImpactMetersProps) {
  const toneStyles: Record<FormulationMetric["tone"], string> = {
    error: "border-red-200 bg-red-50 text-red-700",
    warning: "border-amber-200 bg-amber-50 text-amber-700",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700"
  }

  return (
    <div className="grid gap-3">
      {metrics.map((metric) => (
        <Card
          key={metric.id}
          className={cn(
            "border-l-4 shadow-sm transition hover:translate-y-0.5 hover:shadow-md",
            metric.tone === "error"
              ? "border-l-red-500"
              : metric.tone === "warning"
                ? "border-l-amber-500"
                : "border-l-emerald-500"
          )}
        >
          <CardContent className="flex flex-col gap-3 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">{metric.badge}</span>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                    {metric.label}
                  </p>
                  <p className="text-2xl font-bold text-slate-900">{metric.count}</p>
                </div>
              </div>
              <div className={cn("rounded-md border px-3 py-1 text-xs font-semibold", toneStyles[metric.tone])}>
                {metric.turnover.toFixed(1)}M€ CA
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                onNavigate({
                  type: "focus-status",
                  status: metric.id === "non-conforme" ? "archived" : metric.id === "a-risque" ? "under-review" : "active"
                })
              }
              className="justify-between text-xs"
            >
              {metric.cta}
              <MoveRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

interface ExpiryTimelineProps {
  events: TimelineEvent[]
  onNavigate: (action: DashboardAction) => void
}

function ExpiryTimeline({ events, onNavigate }: ExpiryTimelineProps) {
  const statusColors: Record<TimelineEvent["status"], string> = {
    urgent: "border-red-200 bg-red-50 text-red-700",
    critique: "border-amber-200 bg-amber-50 text-amber-700",
    important: "border-blue-200 bg-blue-50 text-blue-700",
    planifie: "border-teal-200 bg-teal-50 text-teal-700",
    anticipe: "border-slate-200 bg-slate-50 text-slate-600"
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Expiry Timeline</CardTitle>
            <CardDescription>Documents critiques à échéance</CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              toast.info("Mode focus activé", {
                description: "Utilisez la molette pour zoomer par période."
              })
            }}
          >
            <FocusIcon className="mr-2 h-4 w-4" />
            Mode focus
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full">
          <div className="flex min-w-max items-stretch gap-4 pb-2">
            {events.map((event) => (
              <div
                key={event.id}
                className={cn(
                  "flex w-48 flex-col justify-between rounded-lg border px-3 py-3 text-xs shadow-sm transition hover:shadow-md",
                  statusColors[event.status]
                )}
              >
                <div className="space-y-2">
                  <p className="font-semibold">{event.label}</p>
                  <p className="text-slate-500">{event.documentName}</p>
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">
                    {event.daysUntil <= 0
                      ? "ÉCHU"
                      : `Échéance ${event.daysUntil}j`}
                  </p>
                </div>
                <Button
                  size="sm"
                  className="mt-2 w-full text-xs"
                  onClick={() => onNavigate({ type: "focus-substance", substance: event.substance })}
                >
                  {event.actionLabel}
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

interface RegulatoryPulseProps {
  events: RegulatoryEvent[]
  onNavigate: (action: DashboardAction) => void
}

function RegulatoryPulse({ events, onNavigate }: RegulatoryPulseProps) {
  const toneDecor: Record<RegulatoryEvent["tone"], string> = {
    flash: "border-l-4 border-l-red-500 bg-red-50",
    update: "border-l-4 border-l-amber-400 bg-amber-50",
    opportunity: "border-l-4 border-l-emerald-400 bg-emerald-50",
    loop: "border border-slate-200 bg-white"
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Regulatory Pulse</CardTitle>
            <CardDescription>Flux priorisé par criticité</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleShare()}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Partage IA
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <ScrollArea className="h-80">
          <div className="space-y-3 pr-3">
            {events.map((event) => (
              <div key={event.id} className={cn("rounded-lg p-3 text-sm shadow-sm", toneDecor[event.tone])}>
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{event.message}</p>
                  {event.updatedAt ? (
                    <span className="text-xs text-slate-400">
                      {formatRelativeDate(event.updatedAt)}
                    </span>
                  ) : null}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Bell className="h-3 w-3" />
                    {event.action}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() =>
                      onNavigate({
                        type: "filter",
                        restriction: event.tone === "flash" ? "forbidden" : event.tone === "update" ? "regulated" : undefined
                      })
                    }
                  >
                    Ouvrir
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

interface SupplierIntelligenceMapProps {
  entries: SupplierEntry[]
  onNavigate: (action: DashboardAction) => void
}

function SupplierIntelligenceMap({ entries, onNavigate }: SupplierIntelligenceMapProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Supplier Intelligence</CardTitle>
            <CardDescription>Résilience chaîne d&apos;approvisionnement</CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onNavigate({ type: "open-smart-docs" })}
          >
            <MapPin className="mr-2 h-4 w-4" />
            Cartographie
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {entries.map((entry) => (
          <div key={entry.supplier} className="rounded-lg border border-slate-200 p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{entry.supplier}</p>
                <p className="text-xs text-slate-500">Zone {entry.region} • Impact {entry.totalImpact.toFixed(2)}M€</p>
              </div>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Filter className="h-3 w-3" />
                {entry.critical.length} critiques
              </Badge>
            </div>
            <div className="mt-3 space-y-2 text-xs text-slate-600">
              {entry.critical.map((item) => (
                <button
                  key={`${entry.supplier}-critical-${item.substance.id}`}
                  type="button"
                  className="flex w-full items-center justify-between rounded-md border border-red-200 bg-red-50 px-3 py-2 text-left font-medium text-red-700 transition hover:bg-red-100"
                  onClick={() => onNavigate({ type: "focus-substance", substance: item.substance })}
                >
                  <span>{item.substance.inciEU ?? item.substance.inciUS}</span>
                  <MoveRight className="h-4 w-4" />
                </button>
              ))}
              {entry.watch.map((item) => (
                <button
                  key={`${entry.supplier}-watch-${item.substance.id}`}
                  type="button"
                  className="flex w-full items-center justify-between rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-left text-amber-700 transition hover:bg-amber-100"
                  onClick={() =>
                    onNavigate({
                      type: "filter",
                      restriction: "regulated"
                    })
                  }
                >
                  <span>{item.substance.inciEU ?? item.substance.inciUS}</span>
                  <span className="text-[11px] uppercase text-amber-600">{item.summary}</span>
                </button>
              ))}
              {entry.optimised.map((item) => (
                <div
                  key={`${entry.supplier}-optim-${item.substance.id}`}
                  className="flex w-full items-center justify-between rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-left text-emerald-700"
                >
                  <span>{item.substance.inciEU ?? item.substance.inciUS}</span>
                  <span className="text-[11px] uppercase text-emerald-600">{item.summary}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

interface RegWatchImpactProps {
  alerts: RegWatchAlert[]
  onNavigate: (action: DashboardAction) => void
}

function RegWatchImpact({ alerts, onNavigate }: RegWatchImpactProps) {
  const severityTheme: Record<
    RegWatchAlert["severity"],
    { badge: string; label: string; accent: string }
  > = {
    critical: {
      badge: "bg-red-500/15 text-red-600 border border-red-500/20",
      label: "Restriction critique",
      accent: "border-red-200 bg-red-50"
    },
    warning: {
      badge: "bg-amber-500/15 text-amber-700 border border-amber-500/20",
      label: "Alerte veille",
      accent: "border-amber-200 bg-amber-50"
    },
    positive: {
      badge: "bg-emerald-500/15 text-emerald-700 border border-emerald-500/20",
      label: "Opportunité",
      accent: "border-emerald-200 bg-emerald-50"
    }
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Reg-watch Impact Planner</CardTitle>
            <CardDescription>
              Alertes réglementaires avec calcul CA et plan de mitigation
            </CardDescription>
          </div>
          <Badge variant="outline" className="border-violet-300 bg-violet-50 text-violet-700">
            Analyse proactive
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            Aucune alerte proactive pour le moment. La veille continue de surveiller vos marchés clés.
          </div>
        ) : null}
        {alerts.map((alert) => {
          const theme = severityTheme[alert.severity]
          const eventDateLabel = formatRelativeDate(alert.event.date)
          return (
            <div
              key={alert.id}
              className="rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm transition hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold", theme.badge)}>
                      <Bell className="h-3.5 w-3.5" />
                      {theme.label}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                      {alert.event.country}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 capitalize">
                      {alert.event.type}
                    </span>
                  </div>
                  <h4 className="text-base font-semibold text-slate-900">
                    {alert.event.title}
                  </h4>
                  <p className="text-sm text-slate-600">
                    {alert.event.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" />
                      Échéance {alert.daysUntil} j • {eventDateLabel}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      Kickoff projet dans {alert.kickoffInWeeks} sem.
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 md:items-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      onNavigate({ type: "focus-substance", substance: alert.substance })
                      toast.success("Feuille de route ouverte", {
                        description: `Les formules impactées par ${alert.substance.inciEU ?? alert.substance.inciUS} sont filtrées.`
                      })
                    }}
                  >
                    Diagnostiquer
                  </Button>
                  <Button
                    size="sm"
                    className="text-xs"
                    onClick={() =>
                      toast.success("Projet de reformulation créé", {
                        description: `Budget prévisionnel ${formatEuro(alert.projectBudget)} sur ${alert.projectDurationWeeks} sem.`
                      })
                    }
                  >
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Lancer plan
                  </Button>
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-4">
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">Formules impactées</p>
                  <p className="text-lg font-semibold text-slate-900">{alert.formulasImpacted}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">CA à risque</p>
                  <p className="text-lg font-semibold text-red-600">{formatEuro(alert.businessValue)}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">Budget projet</p>
                  <p className="text-lg font-semibold text-slate-900">{formatEuro(alert.projectBudget)}</p>
                </div>
                <div className={cn("rounded-lg px-3 py-2", theme.accent)}>
                  <p className="text-[11px] uppercase tracking-wide text-slate-600">Plan recommandé</p>
                  <p className="text-sm font-semibold text-slate-900">{alert.action}</p>
                  <p className="text-[11px] text-slate-600">
                    Horizon {alert.projectDurationWeeks} sem. • Kickoff dans {alert.kickoffInWeeks} sem.
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

interface CostVolatilityTrackerProps {
  entries: CostVolatilityEntry[]
  onNavigate: (action: DashboardAction) => void
}

function CostVolatilityTracker({ entries, onNavigate }: CostVolatilityTrackerProps) {
  const significant = entries.slice(0, 5)
  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Cost Volatility Tracker</CardTitle>
            <CardDescription>Prix matières vs impact production</CardDescription>
          </div>
          <Badge variant="outline" className="gap-1 text-[11px] uppercase tracking-wide text-emerald-600">
            <BarChart3 className="h-3 w-3" />
            Live
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-4 text-slate-100 shadow-inner">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">
            Budget formulation
          </p>
          <p className="mt-1 flex items-center gap-2 text-lg font-semibold">
            +{Math.max(0, Math.round(significant.reduce((acc, entry) => acc + entry.change, 0)))}%
            <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-medium text-red-200">
              {significant.filter((entry) => entry.change > 25).length} alertes
            </span>
          </p>
          <p className="text-xs text-slate-400">
            {significant.filter((entry) => entry.change > 25).length} matières dépassent les seuils •{" "}
            {significant.filter((entry) => entry.change < -20).length} opportunités achat
          </p>
        </div>
        <div className="space-y-3">
          {significant.map((entry) => {
            const isIncrease = entry.change >= 0
            const toneClasses = isIncrease
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
            return (
              <div
                key={entry.id}
                className="rounded-xl border border-slate-200 bg-white/80 p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <button
                      type="button"
                      onClick={() => onNavigate({ type: "focus-substance", substance: entry.substance })}
                      className="text-sm font-semibold text-slate-900 transition hover:text-primary"
                    >
                      {entry.substance.inciEU ?? entry.substance.inciUS}
                    </button>
                    <p className="text-xs text-slate-500">
                      {entry.substance.functions.slice(0, 2).join(" • ") || "Fonction à préciser"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold shadow-inner",
                        toneClasses
                      )}
                    >
                      {isIncrease ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {isIncrease ? "+" : ""}
                      {entry.change.toFixed(1)}%
                    </span>
                    <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
                      {entry.impact} formules impactées
                    </span>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          isIncrease ? "bg-red-500/80" : "bg-emerald-500/80"
                        )}
                        style={{ width: `${clamp(entry.volatility, 5, 100)}%` }}
                        aria-hidden
                      />
                    </div>
                    <p className="mt-1 text-[11px] uppercase tracking-wide text-slate-400">
                      Volatilité {entry.volatility} • MAJ {formatRelativeDate(entry.lastUpdated)}
                    </p>
                  </div>
                  {entry.suggestion ? (
                    <Button
                      size="sm"
                      className="text-xs"
                      variant="outline"
                      onClick={() => onNavigate({ type: "focus-status", status: "under-review" })}
                    >
                      {entry.suggestion}
                    </Button>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

interface AllergenRadarWidgetProps {
  points: AllergenPoint[]
  onNavigate: (action: DashboardAction) => void
}

function AllergenRadarWidget({ points, onNavigate }: AllergenRadarWidgetProps) {
  const maxFormulas = points.length ? Math.max(...points.map((point) => point.formulasImpacted)) : 1
  const polarAngles = points.map((_, index) => (index / Math.max(points.length, 1)) * 360)

  const pointColor = (proximity: AllergenPoint["proximity"]) =>
    proximity === "critical"
      ? "bg-red-500 shadow-red-500/40"
      : proximity === "warning"
        ? "bg-amber-500 shadow-amber-500/40"
        : "bg-emerald-500 shadow-emerald-500/40"

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Allergen Radar</CardTitle>
            <CardDescription>Surveillance 26 allergènes EU</CardDescription>
          </div>
          <Badge variant="outline" className="border-amber-400/50 bg-amber-50 text-[11px] text-amber-700">
            Surveillance
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-[1fr,200px]">
        <div className="space-y-3">
          {points.map((point) => (
            <button
              key={point.id}
              type="button"
              onClick={() => onNavigate({ type: "filter", restriction: "regulated" })}
              className={cn(
                "flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition hover:border-primary hover:bg-primary/5",
                point.proximity === "critical"
                  ? "border-red-200 bg-red-50 text-red-700"
                  : point.proximity === "warning"
                    ? "border-amber-200 bg-amber-50 text-amber-700"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700"
              )}
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold">{point.allergen}</span>
                <span className="text-xs capitalize text-slate-500">
                  {point.proximity === "critical"
                    ? "Critique"
                    : point.proximity === "warning"
                      ? "Surveiller"
                      : "OK"}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span>{point.concentration.toFixed(2)}% concentration</span>
                <span>{point.formulasImpacted} formules</span>
              </div>
            </button>
          ))}
        </div>
        <div className="relative mx-auto hidden h-64 w-64 items-center justify-center sm:flex">
          <div className="absolute inset-6 rounded-full border border-slate-200" />
          <div className="absolute inset-3 rounded-full border border-slate-200/70" />
          <div className="absolute inset-0 rounded-full border border-primary/40" />
          <div className="absolute inset-[30%] rounded-full border border-slate-200/40" />
          <span className="absolute text-xs font-semibold uppercase tracking-wide text-slate-400">
            Vos formules
          </span>
          {points.map((point, index) => {
            const radius =
              point.proximity === "critical" ? 110 : point.proximity === "warning" ? 90 : 70
            const size = clamp((point.formulasImpacted / maxFormulas) * 28 + 12, 12, 36)
            return (
              <div
                key={point.id}
                className={cn(
                  "absolute flex items-center justify-center rounded-full shadow-lg transition hover:scale-110",
                  pointColor(point.proximity)
                )}
                style={{
                  width: size,
                  height: size,
                  transform: `rotate(${polarAngles[index]}deg) translate(${radius}px) rotate(-${
                    polarAngles[index]
                  }deg)`
                }}
              >
                <span className="text-[10px] font-semibold text-white">
                  {point.allergen.slice(0, 2).toUpperCase()}
                </span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

interface NaturalityIndexWidgetProps {
  segments: NaturalitySegment[]
  onNavigate: (action: DashboardAction) => void
}

function NaturalityIndexWidget({ segments, onNavigate }: NaturalityIndexWidgetProps) {
  const average =
    segments.reduce((total, segment) => total + segment.naturalPercent, 0) / segments.length
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Naturality Index</CardTitle>
            <CardDescription>Naturalité & Bio par gamme</CardDescription>
          </div>
          <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-700">
            Trend: {average.toFixed(1)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {segments.map((segment) => {
          const delta = segment.naturalPercent - segment.objective
          const trendPositive = segment.trend >= 0
          return (
            <div key={segment.id} className="rounded-xl border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{segment.label}</p>
                  <p className="text-xs text-slate-500">Objectif {segment.objective}% naturalité</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-emerald-600">
                    {segment.naturalPercent}%
                  </span>
                  <span className="text-xs text-slate-400">Bio {segment.organicPercent}%</span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                      trendPositive ? "bg-emerald-500/15 text-emerald-700" : "bg-red-500/15 text-red-600"
                    )}
                  >
                    {trendPositive ? "+" : ""}
                    {segment.trend.toFixed(1)} pts vs N-1
                  </span>
                </div>
              </div>
              <div className="mt-3 space-y-2">
                <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600"
                    style={{ width: `${clamp(segment.naturalPercent, 0, 100)}%` }}
                    aria-hidden
                  />
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-emerald-100">
                  <div
                    className="h-full rounded-full bg-emerald-600/80"
                    style={{ width: `${clamp(segment.organicPercent, 0, 100)}%` }}
                    aria-hidden
                  />
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span
                  className={cn(
                    "flex items-center gap-1 font-semibold",
                    delta >= 0 ? "text-emerald-600" : "text-red-500"
                  )}
                >
                  <Leaf className="h-3 w-3" />
                  {delta >= 0 ? "Au-dessus" : "Sous"} objectif {Math.abs(delta).toFixed(1)} pts
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs text-primary"
                  onClick={() => onNavigate({ type: "filter", market: "EU" })}
                >
                  Voir substances à optimiser
                </Button>
              </div>
            </div>
          )
        })}
        <div className="flex items-center justify-between rounded-lg border border-dashed border-emerald-300 bg-emerald-50 px-4 py-3 text-xs text-emerald-700">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Objectif global 2025 : 70% naturalité
          </div>
          <span className="font-semibold">
            {average >= 70 ? "Sur la bonne voie ✓" : "Plan d'action requis"}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

interface WorkloadEqualizerProps {
  members: WorkloadMember[]
  onNavigate: (action: DashboardAction) => void
}

function WorkloadEqualizer({ members, onNavigate }: WorkloadEqualizerProps) {
  const totalReviews = members.reduce((total, member) => total + member.reviews, 0)
  const totalCapacity = members.reduce((total, member) => total + member.capacity, 0)
  const teamLoad = Math.round((totalReviews / Math.max(totalCapacity, 1)) * 100)
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Workload Equalizer</CardTitle>
            <CardDescription>Répartition charge régulation</CardDescription>
          </div>
          <Badge variant="outline" className="border-slate-300 bg-slate-100 text-slate-700">
            Team load {clamp(teamLoad, 0, 120)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-4 text-slate-100">
          <p className="text-xs uppercase tracking-wide text-slate-400">Capacité semaine</p>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="font-semibold">{totalReviews} revues en cours</span>
            <span>{totalCapacity - totalReviews} slots disponibles</span>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-emerald-400 transition-all"
              style={{ width: `${clamp(teamLoad, 0, 110)}%` }}
              aria-hidden
            />
          </div>
        </div>
        <div className="space-y-3">
          {members.map((member) => {
            const load = Math.round((member.reviews / Math.max(member.capacity, 1)) * 100)
            const overload = load > 100
            return (
              <div
                key={member.id}
                className={cn(
                  "rounded-lg border px-3 py-3 shadow-sm transition hover:shadow-md",
                  overload ? "border-red-200 bg-red-50" : "border-slate-200 bg-white"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/40 text-sm font-semibold text-primary-900">
                      {member.avatar}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{member.name}</p>
                      <p className="text-xs text-slate-500">
                        {member.reviews} revues • capacité {member.capacity}
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold",
                      overload
                        ? "bg-red-500/15 text-red-600"
                        : load > 80
                          ? "bg-amber-500/20 text-amber-700"
                          : "bg-emerald-500/20 text-emerald-700"
                    )}
                  >
                    <Activity className="h-3 w-3" />
                    {load}%
                  </span>
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      overload ? "bg-red-500" : load > 80 ? "bg-amber-500" : "bg-emerald-500"
                    )}
                    style={{ width: `${clamp(load, 0, 120)}%` }}
                    aria-hidden
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>{member.urgent} urgences</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs text-primary"
                    onClick={() => onNavigate({ type: "focus-status", status: "under-review" })}
                  >
                    Réassigner
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

interface ClaimValidatorProps {
  entries: ClaimValidation[]
  onNavigate: (action: DashboardAction) => void
}

function ClaimValidator({ entries, onNavigate }: ClaimValidatorProps) {
  const statusDecor: Record<ClaimValidation["status"], { label: string; className: string; icon: React.ReactElement }> = {
    valid: {
      label: "Validé",
      className: "bg-emerald-500/15 text-emerald-700",
      icon: <CheckCircle2 className="h-3.5 w-3.5" />
    },
    warning: {
      label: "À surveiller",
      className: "bg-amber-500/15 text-amber-700",
      icon: <AlertTriangle className="h-3.5 w-3.5" />
    },
    invalid: {
      label: "Non conforme",
      className: "bg-red-500/15 text-red-600",
      icon: <XCircle className="h-3.5 w-3.5" />
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Claim Validator</CardTitle>
            <CardDescription>Marketing vs conformité en temps réel</CardDescription>
          </div>
          <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary">
            0 litige consommateur
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[540px] border-separate border-spacing-y-3 text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-3">Claim</th>
                <th className="px-3">Support</th>
                <th className="px-3">Statut</th>
                <th className="px-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => {
                const decor = statusDecor[entry.status]
                return (
                  <tr
                    key={entry.id}
                    className="rounded-xl border border-slate-200 bg-white shadow-sm transition hover:border-primary/40 hover:shadow-md"
                  >
                    <td className="px-3 py-3">
                      <p className="font-medium text-slate-900">{entry.claim}</p>
                      {entry.impact ? (
                        <p className="text-xs text-slate-500">{entry.impact}</p>
                      ) : null}
                    </td>
                    <td className="px-3 py-3">
                      <p className="text-sm text-slate-600">{entry.support}</p>
                    </td>
                    <td className="px-3 py-3">
                      <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold", decor.className)}>
                        {decor.icon}
                        {decor.label}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => onNavigate({ type: "open-smart-docs" })}
                      >
                        Ouvrir dossier preuve
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

interface FloatingActionButtonsProps {
  onNavigate: (action: DashboardAction) => void
}

function FloatingActionButtons({ onNavigate }: FloatingActionButtonsProps) {
  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-20 flex flex-col items-end gap-3">
      <Button
        size="lg"
        className="pointer-events-auto h-12 w-12 rounded-full shadow-lg"
        onClick={() => toast("Nouvelle substance", { description: "Workflow création initié." })}
      >
        <Plus className="h-5 w-5" />
      </Button>
      <Button
        variant="secondary"
        size="icon"
        className="pointer-events-auto h-12 w-12 rounded-full shadow-lg"
        onClick={() =>
          onNavigate({
            type: "filter",
            restriction: "forbidden"
          })
        }
      >
        <Search className="h-5 w-5" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="pointer-events-auto h-12 w-12 rounded-full border-2 border-primary shadow-lg"
        onClick={() => toast("Notifications synchronisées")}
      >
        <Bell className="h-5 w-5 text-primary" />
      </Button>
    </div>
  )
}

function DownloadIcon(props: ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  )
}

function FocusIcon(props: ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="3" />
      <line x1="12" x2="12" y1="2" y2="6" />
      <line x1="12" x2="12" y1="18" y2="22" />
      <line x1="2" x2="6" y1="12" y2="12" />
      <line x1="18" x2="22" y1="12" y2="12" />
    </svg>
  )
}

function handleShare() {
  toast.success("Flux partagé", {
    description: "Un lien a été généré pour votre équipe."
  })
}
