"use client"

import { useMemo, useState } from "react"
import {
  AlertTriangle,
  CheckCircle,
  Download,
  FileText,
  GaugeCircle,
  ListChecks
} from "lucide-react"
import type { Blacklist, Document, RegulatoryNote, Substance } from "@/shared/types"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/shared/ui/card"
import { Checkbox } from "@/shared/ui/checkbox"
import { toast } from "sonner"

import { cn, formatDate, formatRelativeDate } from "@/shared/lib/utils"
import type { DossierChecklistItem, MarketingSummary } from "../detail-types"

interface OperationalSupportSectionProps {
  substance: Substance
  documents: Document[]
  notes: RegulatoryNote[]
  blacklists: Blacklist[]
  marketingSummary: MarketingSummary
  dossierChecklist: DossierChecklistItem[]
  dossierReadiness: number
}

export function OperationalSupportSection({
  substance,
  documents,
  notes,
  blacklists,
  marketingSummary,
  dossierChecklist,
  dossierReadiness
}: OperationalSupportSectionProps) {
  const [resolvedNotes, setResolvedNotes] = useState<Record<string, boolean>>({})

  const documentsByCategory = useMemo(() => {
    const grouped = new Map<string, Document[]>()

    documents.forEach((document) => {
      const category = document.category ?? "Autres"
      if (!grouped.has(category)) {
        grouped.set(category, [])
      }
      grouped.get(category)?.push(document)
    })

    return Array.from(grouped.entries()).map(([category, docs]) => {
      const sortedDocs = docs.slice().sort((a, b) => {
        const aExpires = a.expiresAt ? new Date(a.expiresAt).getTime() : Infinity
        const bExpires = b.expiresAt ? new Date(b.expiresAt).getTime() : Infinity
        return aExpires - bExpires
      })
      return [category, sortedDocs] as const
    })
  }, [documents])

  const expiringDocuments = useMemo(() => {
    const now = Date.now()

    return documents
      .filter((document) => document.expiresAt)
      .map((document) => {
        const expiresAt = new Date(document.expiresAt as string).getTime()
        const days = Math.ceil((expiresAt - now) / (24 * 60 * 60 * 1000))
        return {
          document,
          days
        }
      })
      .filter(({ days }) => days <= 30)
      .sort((a, b) => a.days - b.days)
  }, [documents])

  const notesTimeline = useMemo(
    () =>
      notes
        .slice()
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
    [notes]
  )

  const handleToggleNote = (noteId: string, checked: boolean) => {
    setResolvedNotes((previous) => ({
      ...previous,
      [noteId]: checked
    }))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Centre documentaire
          </CardTitle>
          <CardDescription>
            Visualisez les pièces critiques, les alertes d&apos;expiration et accédez aux actions immédiates.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {expiringDocuments.length ? (
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 text-xs text-orange-700">
              <p className="font-semibold">
                {expiringDocuments.length} document(s) expirent dans les 30 prochains jours.
              </p>
              <ul className="mt-2 space-y-1">
                {expiringDocuments.map(({ document, days }) => (
                  <li key={document.id}>
                    {document.name} – {days > 0 ? `expire dans ${days} jour(s)` : "déjà expiré"}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="space-y-6">
            {documentsByCategory.map(([category, docs]) => (
              <div key={category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {category}
                  </h3>
                  <span className="text-xs text-slate-400">{docs.length} document(s)</span>
                </div>
                <div className="space-y-2">
                  {docs.map((document) => {
                    const expiresIn = document.expiresAt
                      ? Math.ceil(
                          (new Date(document.expiresAt).getTime() - Date.now()) / (24 * 60 * 60 * 1000)
                        )
                      : null
                    const isCritical = (document.category ?? "").toLowerCase() === "critique"
                    const statusBadge =
                      expiresIn === null
                        ? {
                            label: "Pas d'expiration",
                            className: "bg-slate-100 text-slate-600"
                          }
                        : expiresIn <= 0
                          ? { label: "Expiré", className: "bg-rose-100 text-rose-700" }
                          : expiresIn <= 15
                            ? { label: `Expire dans ${expiresIn} j`, className: "bg-rose-100 text-rose-700" }
                            : expiresIn <= 30
                              ? { label: `Expire dans ${expiresIn} j`, className: "bg-amber-100 text-amber-700" }
                              : { label: `Valide (${expiresIn} j)`, className: "bg-emerald-100 text-emerald-700" }

                    return (
                      <div
                        key={document.id}
                        className={cn(
                          "flex flex-col gap-3 rounded-lg border p-3 transition hover:bg-slate-50",
                          isCritical ? "border-rose-200" : "border-slate-200"
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-3">
                            <FileText className="h-5 w-5 text-slate-400" />
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{document.name}</p>
                              <p className="text-xs text-slate-500">
                                {document.comment ?? "Pas de commentaire"}
                              </p>
                              <p className="text-[11px] text-slate-400">
                                Mis à jour {formatRelativeDate(document.updatedAt ?? document.createdAt)} • {document.updatedBy}
                              </p>
                            </div>
                          </div>
                          <Badge className={cn("rounded-full text-xs", statusBadge.className)}>
                            {statusBadge.label}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => toast.info("Téléchargement document (simulation).")}
                          >
                            <Download className="h-4 w-4" /> Télécharger
                          </Button>
                          {document.renewable ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-2 text-primary"
                              onClick={() => toast.success("Demande de renouvellement envoyée (simulation).")}
                            >
                              Renouveler / Demander MAJ
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GaugeCircle className="h-5 w-5 text-primary" />
            Préparation dossier PLM
          </CardTitle>
          <CardDescription>
            Check-list dynamique avant validation comité PLM / marketing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Readiness</span>
              <span>{dossierReadiness}%</span>
            </div>
            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  dossierReadiness >= 80
                    ? "bg-emerald-500"
                    : dossierReadiness >= 50
                      ? "bg-amber-500"
                      : "bg-rose-500"
                )}
                style={{ width: `${dossierReadiness}%` }}
              />
            </div>
          </div>
          <div className="space-y-3">
            {dossierChecklist.map((item) => (
              <div
                key={item.label}
                className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3"
              >
                {item.completed ? (
                  <CheckCircle className="mt-0.5 h-4 w-4 text-emerald-500" />
                ) : (
                  <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-500" />
                )}
                <div>
                  <p className="text-sm font-medium text-slate-900">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.helper}</p>
                </div>
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => toast.success("Synthèse dossier partagée aux parties prenantes (simulation).")}
          >
            Partager la synthèse de readiness
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            Blacklists & chartes marques
          </CardTitle>
          <CardDescription>
            Impact marketing et contraintes internes des portefeuilles de marques.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {blacklists.length ? (
            <>
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                {marketingSummary.hardBans} blocage(s) critique(s) • {marketingSummary.limited} limitation(s) sous conditions • {marketingSummary.monitoring} en veille.
              </div>
              {blacklists.map((blacklist) => {
                const entry = blacklist.substances.find(
                  (item) => item.substanceId === substance.id
                )
                return (
                  <div
                    key={blacklist.id}
                    className="rounded-lg border border-rose-200 bg-rose-50 p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-rose-700">{blacklist.name}</p>
                      <Badge className="rounded-full bg-white text-xs text-rose-600">
                        {blacklist.brand ?? "Portefeuille global"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-rose-600">
                      {entry?.comment ?? "Commentaire non renseigné"}
                    </p>
                    <p className="mt-2 text-[11px] text-rose-500">
                      Mise à jour {formatRelativeDate(blacklist.updatedAt)} • {blacklist.updatedBy}
                    </p>
                  </div>
                )
              })}
            </>
          ) : (
            <p className="text-sm text-slate-500">Aucune charte interne ne bloque la substance.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-primary" />
            Notes & tâches conformité
          </CardTitle>
          <CardDescription>
            Suivi opérationnel partagé entre affaires réglementaires et marketing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {notesTimeline.length ? (
            notesTimeline.map((note) => (
              <div
                key={note.id}
                className={cn(
                  "flex items-start gap-3 rounded-lg border border-slate-200 p-3",
                  resolvedNotes[note.id] ? "bg-emerald-50 opacity-80" : "bg-white"
                )}
              >
                <Checkbox
                  checked={resolvedNotes[note.id] ?? false}
                  onCheckedChange={(checked) =>
                    handleToggleNote(note.id, Boolean(checked))
                  }
                  className="mt-1"
                />
                <div className="space-y-1">
                  <p className={cn("text-sm text-slate-700", resolvedNotes[note.id] && "line-through")}>
                    {note.content}
                  </p>
                  <p className="text-xs text-slate-400">
                    {note.createdBy} • {formatDate(note.createdAt, "dd MMM yyyy")}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">Pas de note à afficher.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
