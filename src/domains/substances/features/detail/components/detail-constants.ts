"use client"

import type React from "react"
import {
  AlertTriangle,
  Beaker,
  CheckCircle,
  FlaskConical,
  GaugeCircle,
  Layers,
  Percent,
  ShieldAlert,
  Timer,
  TrendingUp,
  type LucideIcon
} from "lucide-react"

import type { Blacklist, Restriction, Substance } from "@/types"
import type { RegulatoryTimelineEvent } from "@/shared/lib/mock-data"

export const statusThemes: Record<
  Substance["status"],
  { label: string; badgeClass: string; borderClass: string; icon: React.ComponentType<{ className?: string }> }
> = {
  active: {
    label: "Active",
    badgeClass: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    borderClass: "border-emerald-200",
    icon: TrendingUp
  },
  "under-review": {
    label: "En revue",
    badgeClass: "bg-amber-100 text-amber-700 border border-amber-200",
    borderClass: "border-amber-200",
    icon: Timer
  },
  archived: {
    label: "Archivée",
    badgeClass: "bg-slate-200 text-slate-700 border border-slate-300",
    borderClass: "border-slate-300",
    icon: Layers
  }
}

export const restrictionThemes: Record<
  Restriction["type"],
  { label: string; className: string; accent: string }
> = {
  forbidden: {
    label: "Interdite",
    className: "bg-red-100 text-red-700 border-red-200",
    accent: "text-red-600"
  },
  regulated: {
    label: "Réglementée",
    className: "bg-amber-100 text-amber-700 border-amber-200",
    accent: "text-amber-600"
  },
  listed: {
    label: "Listée",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
    accent: "text-emerald-600"
  },
  unlisted: {
    label: "Non listée",
    className: "bg-slate-100 text-slate-700 border-slate-200",
    accent: "text-slate-600"
  }
}

export type ScenarioStatus = "blocked" | "exceeds" | "ok" | "unknown"

export const scenarioThemes: Record<
  ScenarioStatus,
  { label: string; badgeClass: string; description: string; icon: React.ComponentType<{ className?: string }> }
> = {
  blocked: {
    label: "Interdit",
    badgeClass: "bg-rose-100 text-rose-700 border border-rose-200",
    description: "Blocage marketing ou réglementaire",
    icon: AlertTriangle
  },
  exceeds: {
    label: "Au-delà du seuil",
    badgeClass: "bg-amber-100 text-amber-700 border border-amber-200",
    description: "Réduire le dosage ou ajuster le positionnement",
    icon: GaugeCircle
  },
  ok: {
    label: "Conforme",
    badgeClass: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    description: "Usage autorisé selon les paramètres actuels",
    icon: CheckCircle
  },
  unknown: {
    label: "Non documenté",
    badgeClass: "bg-slate-100 text-slate-700 border border-slate-200",
    description: "Aucune donnée référencée – vérifier en local",
    icon: Layers
  }
}

export const timelineThemes: Record<RegulatoryTimelineEvent["type"], { circleClass: string; iconClass: string }> = {
  restriction: {
    circleClass: "bg-rose-100 border-rose-200",
    iconClass: "text-rose-600"
  },
  approval: {
    circleClass: "bg-emerald-100 border-emerald-200",
    iconClass: "text-emerald-600"
  },
  warning: {
    circleClass: "bg-amber-100 border-amber-200",
    iconClass: "text-amber-600"
  }
}

export const compatibilityBreakdownMeta: Record<
  "regulatory" | "technical" | "economic" | "formulation",
  { label: string; icon: LucideIcon; accent: string }
> = {
  regulatory: {
    label: "Réglementaire",
    icon: ShieldAlert,
    accent: "text-emerald-600"
  },
  technical: {
    label: "Technique",
    icon: FlaskConical,
    accent: "text-sky-600"
  },
  economic: {
    label: "Économique",
    icon: Percent,
    accent: "text-amber-600"
  },
  formulation: {
    label: "Formulation",
    icon: Beaker,
    accent: "text-indigo-600"
  }
}

export type MarketingHighlightSeverity = "forbidden" | "restricted" | "monitoring"

export interface MarketingHighlight {
  id: Blacklist["id"]
  name: string
  brand: string
  severity: MarketingHighlightSeverity
  comment: string
  updatedAt?: string
  updatedBy?: string
}
