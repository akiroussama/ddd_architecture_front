"use client"

import type { ElementType } from "react"
import {
  AlertTriangle,
  CheckCircle2,
  Globe2,
  Loader2,
  ShieldAlert,
  XCircle
} from "lucide-react"

import type { Substance } from "@/types"

import { Badge } from "@/shared/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card"

import type {
  GlobalComplianceEntry,
  GlobalComplianceMatrix,
  GlobalComplianceStatus
} from "@/shared/lib/mock-data"
import { cn, formatRelativeDate } from "@/shared/lib/utils"

interface GlobalComplianceSectionProps {
  substance: Substance
  matrix: GlobalComplianceMatrix
}

const REGION_LABELS: Record<GlobalComplianceEntry["region"], string> = {
  EU: "Union Européenne",
  US: "États-Unis",
  UK: "Royaume-Uni",
  CN: "Chine",
  ASEAN: "ASEAN"
}

const STATUS_THEME: Record<
  GlobalComplianceStatus,
  { label: string; badgeClass: string; icon: ElementType }
> = {
  compliant: {
    label: "Conforme",
    badgeClass: "bg-emerald-500/15 text-emerald-700 border border-emerald-500/20",
    icon: CheckCircle2
  },
  restricted: {
    label: "Sous condition",
    badgeClass: "bg-amber-500/15 text-amber-700 border border-amber-500/20",
    icon: AlertTriangle
  },
  "non-compliant": {
    label: "Non conforme",
    badgeClass: "bg-red-500/15 text-red-600 border border-red-500/20",
    icon: XCircle
  },
  "not-listed": {
    label: "Non listé",
    badgeClass: "bg-slate-400/15 text-slate-600 border border-slate-400/20",
    icon: ShieldAlert
  },
  investigate: {
    label: "Analyse en cours",
    badgeClass: "bg-slate-100 text-slate-600 border border-slate-200",
    icon: Loader2
  }
}

const ROWS: Array<{
  id: "status" | "limit" | "warning" | "source" | "action"
  label: string
}> = [
  { id: "status", label: "Statut global" },
  { id: "limit", label: "Limite de concentration" },
  { id: "warning", label: "Avertissements & mentions" },
  { id: "source", label: "Source réglementaire" },
  { id: "action", label: "Action recommandée" }
]

const REGION_ORDER: GlobalComplianceEntry["region"][] = ["EU", "US", "UK", "CN", "ASEAN"]

export function GlobalComplianceSection({ substance, matrix }: GlobalComplianceSectionProps) {
  const regionMap = new Map(matrix.entries.map((entry) => [entry.region, entry]))

  const ordered = REGION_ORDER.map((region) => {
    const fallback: GlobalComplianceEntry = {
      region,
      status: "investigate",
      source: "Cartographie en cours",
      reference: "Synchronisation en attente",
      warning: "Aucune donnée enregistrée",
      action: "Assigner analyste conformité",
      updatedAt: matrix.lastSyncedAt,
      matchedIdentifiers: []
    }
    return regionMap.get(region) ?? fallback
  })

  const unifiedIdentifiers = ordered
    .flatMap((entry) => entry.matchedIdentifiers ?? [])
    .reduce<Array<{ type: string; value: string }>>((acc, identifier) => {
      const existingIndex = acc.findIndex(
        (item) => item.type === identifier.type && item.value === identifier.value
      )
      if (existingIndex === -1) {
        acc.push(identifier)
      }
      return acc
    }, [])

  const summaryChips = [
    {
      label: "Conformes",
      value: matrix.summary.compliant,
      className: "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20"
    },
    {
      label: "À surveiller",
      value: matrix.summary.review,
      className: "bg-amber-500/10 text-amber-700 border border-amber-500/20"
    },
    {
      label: "Bloqués",
      value: matrix.summary.blocked,
      className: "bg-red-500/10 text-red-600 border border-red-500/20"
    }
  ]

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Globe2 className="h-5 w-5 text-primary" />
              Compliance multi-région en temps réel
            </CardTitle>
            <CardDescription>
              Statut unifié de {substance.inciEU ?? substance.inciUS} sur les 5 zones clés
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {summaryChips.map((chip) => (
              <Badge
                key={chip.label}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold",
                  chip.className
                )}
              >
                {chip.label}: {chip.value}
              </Badge>
            ))}
            <span className="text-xs text-slate-500">
              Sync {formatRelativeDate(matrix.lastSyncedAt)}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-separate border-spacing-y-2">
            <thead>
              <tr>
                <th className="w-48 px-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  &nbsp;
                </th>
                {ordered.map((entry) => (
                  <th
                    key={`col-${entry.region}`}
                    className="px-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    {REGION_LABELS[entry.region]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.id} className="align-top text-sm">
                  <td className="whitespace-nowrap px-3 py-3 font-semibold text-slate-600">
                    {row.label}
                  </td>
                  {ordered.map((entry) => (
                    <td key={`${row.id}-${entry.region}`} className="px-3 py-3">
                      {renderCell(row.id, entry)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            <p className="font-semibold text-slate-900">Identifiants harmonisés</p>
            <p>
              {unifiedIdentifiers.length
                ? unifiedIdentifiers
                    .map((identifier) => `${identifier.type}: ${identifier.value}`)
                    .join(" • ")
                : "Aucun identifiant synchronisé"}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            <p className="font-semibold text-slate-900">Expérience proposée</p>
            <p>
              Visualisez en un tableau les divergences réglementaires pour réduire à 0 les erreurs
              de lancement global.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function renderCell(rowId: (typeof ROWS)[number]["id"], entry: GlobalComplianceEntry) {
  switch (rowId) {
    case "status": {
      const theme = STATUS_THEME[entry.status]
      const Icon = theme.icon
      return (
        <Badge className={cn("flex items-center gap-1 rounded-full px-3 py-1", theme.badgeClass)}>
          <Icon className="h-3.5 w-3.5" />
          {theme.label}
        </Badge>
      )
    }
    case "limit": {
      return <span className="text-sm text-slate-700">{entry.limit ?? "—"}</span>
    }
    case "warning": {
      return (
        <div className="space-y-1 text-xs text-slate-600">
          <p>{entry.warning ?? "—"}</p>
        </div>
      )
    }
    case "source": {
      return (
        <div className="space-y-1 text-xs text-slate-600">
          <p className="font-semibold text-slate-800">{entry.source}</p>
          <p className="text-slate-500">{entry.reference}</p>
        </div>
      )
    }
    case "action": {
      return (
        <div className="space-y-1 text-xs text-slate-600">
          <p className="font-semibold text-slate-800">{entry.action ?? "—"}</p>
          <p className="text-slate-500">
            Mise à jour {formatRelativeDate(entry.updatedAt)}
          </p>
        </div>
      )
    }
    default:
      return null
  }
}
