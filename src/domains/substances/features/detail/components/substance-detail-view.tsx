"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, ClipboardCopy, Edit, FileText, Package, Shield, AlertCircle, Beaker } from "lucide-react"
import { toast } from "sonner"

import type { Blacklist, Restriction, Substance } from "@/shared/types"
import { Button } from "@/shared/ui/button"
import { Badge } from "@/shared/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card"
import { Separator } from "@/shared/ui/separator"
import { Textarea } from "@/shared/ui/textarea"
import { cn, formatDate, formatRelativeDate } from "@/shared/lib/utils"

interface SubstanceDetailViewProps {
  substance: Substance
  restrictions: Restriction[]
  blacklists: Blacklist[]
  similarSubstances: Substance[]
}

export function SubstanceDetailView({
  substance,
  restrictions,
  blacklists,
}: SubstanceDetailViewProps) {
  const [newNote, setNewNote] = useState("")

  const documents = substance.documents ?? []
  const notes = substance.notes ?? []

  const inciEurope = substance.inciEU?.trim() || ""
  const inciUSA = substance.inciUS?.trim() || ""
  const primaryTitle = inciEurope || inciUSA || substance.technicalName || substance.id
  const titleSuffix = "INCI Europe / INCI USA"
  const fullTitle = `${primaryTitle} – ${titleSuffix}`
  const primaryCas = substance.casEinecsPairs?.[0]?.cas?.trim()

  const statusConfig = {
    active: { label: "Actif", className: "bg-green-50 text-green-700 border-green-200" },
    archived: { label: "Archivé", className: "bg-gray-50 text-gray-700 border-gray-200" },
    "under-review": { label: "En revue", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  }

  const statusTheme = statusConfig[substance.status] || statusConfig.active

  // Calculate restriction count by type
  const restrictionsByType = useMemo(() => {
    return restrictions.reduce((acc, r) => {
      acc[r.type] = (acc[r.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }, [restrictions])

  // Quick stats matching raw material layout
  const quickStats = useMemo(() => {
    const totalRestrictions = restrictions.length
    const forbiddenCount = restrictions.filter(r => r.type === "forbidden").length
    const regulatedCount = restrictions.filter(r => r.type === "regulated").length

    return [
      {
        title: "Restrictions",
        value: totalRestrictions,
        icon: Shield,
        description: forbiddenCount > 0
          ? `${forbiddenCount} interdiction(s)`
          : regulatedCount > 0
            ? `${regulatedCount} régulation(s)`
            : "Aucune restriction",
        accentClass: forbiddenCount > 0
          ? "bg-red-50 text-red-700 border-red-200"
          : regulatedCount > 0
            ? "bg-yellow-50 text-yellow-700 border-yellow-200"
            : "bg-green-50 text-green-700 border-green-200",
      },
      {
        title: "Blacklists",
        value: blacklists.length,
        icon: AlertCircle,
        description: blacklists.length > 0 ? `${blacklists.length} liste(s)` : "Aucune",
        accentClass: blacklists.length > 0
          ? "bg-orange-50 text-orange-700 border-orange-200"
          : "bg-slate-100 text-slate-700 border-slate-200",
      },
      {
        title: "Documents",
        value: documents.length,
        icon: FileText,
        description: "Pièces jointes",
        accentClass: "bg-slate-100 text-slate-700 border-slate-200",
      },
      {
        title: "Familles",
        value: substance.families?.length || 0,
        icon: Beaker,
        description: substance.families?.[0] || "Aucune",
        accentClass: "bg-blue-50 text-blue-700 border-blue-200",
      },
    ]
  }, [restrictions, blacklists, documents, substance.families])

  const handleCopy = () => {
    const text = `${substance.id} - ${fullTitle}`
    navigator.clipboard?.writeText(text).then(() => {
      toast.success("Référence copiée")
    })
  }

  const handleAddNote = () => {
    if (!newNote.trim()) return
    toast.success("Note ajoutée")
    setNewNote("")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={cn("rounded-full border px-3 py-1 text-xs font-semibold", statusTheme.className)}>
                {statusTheme.label}
              </Badge>
              <Badge className="rounded-full border border-slate-200 bg-slate-100 font-mono text-xs text-slate-600">
                {substance.id}
              </Badge>
              {substance.class && (
                <Badge className="rounded-full border border-primary/20 bg-primary/10 text-xs text-primary">
                  {substance.class}
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-semibold text-slate-900">
              {fullTitle}
            </h1>
            {primaryCas ? (
              <p className="text-sm text-slate-600">CAS: {primaryCas}</p>
            ) : null}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>Créé le {formatDate(substance.createdAt, "dd MMM yyyy")}</span>
              <span className="text-slate-300">•</span>
              <span>Par {substance.updatedBy}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 md:items-end">
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy}>
                <ClipboardCopy className="mr-2 h-4 w-4" />
                Copier réf.
              </Button>
              <Button variant="outline" size="sm">
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </Button>
            </div>
            <Link
              href="/substance-manager"
              className="flex items-center gap-2 text-xs text-slate-500 hover:text-primary"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Retour à la liste
            </Link>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {quickStats.map((stat) => (
            <Card key={stat.title} className={cn("border border-dashed", stat.accentClass)}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <stat.icon className="h-4 w-4" />
                  {stat.title}
                </CardTitle>
                <CardDescription>{stat.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Left Column - Detailed Info */}
        <div className="space-y-6">
          {/* Card 1: Identification */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Identification</CardTitle>
              <CardDescription>Informations techniques et composition chimique</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic INCI Names */}
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="text-xs font-medium text-slate-600">ID Substance</label>
                  <p className="mt-1 font-mono text-sm font-medium text-slate-900">{substance.id}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600">INCI Europe</label>
                  <p className="mt-1 text-sm font-medium text-slate-900">{substance.inciEU}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600">INCI USA</label>
                  <p className="mt-1 text-sm font-medium text-slate-900">{substance.inciUS}</p>
                </div>
              </div>

              {/* Optional Aliases */}
              {(substance.technicalName || substance.inciMixed || substance.inciBrazil || substance.inciChina || substance.canadianTrivialName) && (
                <>
                  <Separator />
                  <div>
                    <label className="mb-3 block text-xs font-semibold text-slate-700">Alias INCI (Optionnels)</label>
                    <div className="grid gap-3 md:grid-cols-2">
                      {substance.technicalName && (
                        <div>
                          <label className="text-xs font-medium text-slate-600">Nom Technique / OTC</label>
                          <p className="mt-1 text-sm text-slate-700">{substance.technicalName}</p>
                        </div>
                      )}
                      {substance.inciMixed && (
                        <div>
                          <label className="text-xs font-medium text-slate-600">INCI Mixte</label>
                          <p className="mt-1 text-sm text-slate-700">{substance.inciMixed}</p>
                        </div>
                      )}
                      {substance.inciBrazil && (
                        <div>
                          <label className="text-xs font-medium text-slate-600">INCI Brésil</label>
                          <p className="mt-1 text-sm text-slate-700">{substance.inciBrazil}</p>
                        </div>
                      )}
                      {substance.inciChina && (
                        <div>
                          <label className="text-xs font-medium text-slate-600">INCI Chine</label>
                          <p className="mt-1 text-sm text-slate-700">{substance.inciChina}</p>
                        </div>
                      )}
                      {substance.canadianTrivialName && (
                        <div>
                          <label className="text-xs font-medium text-slate-600">Nom Trivial Canadien</label>
                          <p className="mt-1 text-sm text-slate-700">{substance.canadianTrivialName}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* CAS/EINECS Identifiers */}
              <Separator />
              <div>
                <label className="mb-3 block text-xs font-semibold text-slate-700">Identifiants CAS/EINECS</label>
                <div className="space-y-3">
                  {substance.casEinecsPairs && substance.casEinecsPairs.length > 0 ? (
                    substance.casEinecsPairs.map((pair, index) => (
                      <div
                        key={pair.id}
                        className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                      >
                        <div className="grid gap-3 md:grid-cols-2">
                          <div>
                            <label className="text-xs font-medium text-slate-600">N° CAS</label>
                            <p className="mt-1 font-mono text-sm font-medium text-slate-900">{pair.cas}</p>
                          </div>
                          {pair.einecs && (
                            <div>
                              <label className="text-xs font-medium text-slate-600">N° EINECS</label>
                              <p className="mt-1 font-mono text-sm text-slate-700">{pair.einecs}</p>
                            </div>
                          )}
                        </div>
                        {pair.source && (
                          <div className="mt-2">
                            <label className="text-xs font-medium text-slate-600">Source</label>
                            <p className="mt-0.5 text-xs text-slate-500">{pair.source}</p>
                          </div>
                        )}
                        {index === 0 && (
                          <Badge className="mt-2 rounded-sm bg-primary/10 text-xs text-primary">
                            Principal
                          </Badge>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="py-4 text-center text-sm text-slate-500">Aucun identifiant</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Classification & Fonctions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Classification & Fonctions</CardTitle>
              <CardDescription>Catégorisation et utilisation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Classification */}
              <div>
                <label className="mb-3 block text-xs font-semibold text-slate-700">Classification</label>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-xs font-medium text-slate-600">Classe</label>
                    <p className="mt-1 text-sm text-slate-700">{substance.class || "—"}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600">Familles</label>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {substance.families && substance.families.length > 0 ? (
                        substance.families.map((family) => (
                          <Badge key={family} variant="outline" className="text-xs">
                            {family}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-slate-500">—</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600">Groupe allergènes</label>
                    <p className="mt-1 text-sm text-slate-700">{substance.allergenGroup || "None"}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600">Allergènes 26</label>
                    <p className="mt-1 text-sm text-slate-700">
                      {substance.allergens26 && substance.allergens26.length > 0
                        ? substance.allergens26.join(", ")
                        : "Aucun"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Functions */}
              {((substance.functions && substance.functions.length > 0) || (substance.functionsInventory && substance.functionsInventory.length > 0)) && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    {substance.functions && substance.functions.length > 0 && (
                      <div>
                        <label className="mb-2 block text-xs font-semibold text-slate-700">Fonctions (Liste définie)</label>
                        <div className="flex flex-wrap gap-2">
                          {substance.functions.map((func) => (
                            <Badge key={func} variant="secondary" className="text-xs">
                              {func}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {substance.functionsInventory && substance.functionsInventory.length > 0 && (
                      <div>
                        <label className="mb-2 block text-xs font-semibold text-slate-700">Fonctions (Inventaire officiel)</label>
                        <div className="flex flex-wrap gap-2">
                          {substance.functionsInventory.map((func) => (
                            <Badge key={func} variant="outline" className="text-xs">
                              {func}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Card 3: Restrictions Marketing */}
          {restrictions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-yellow-700">
                  <AlertCircle className="h-4 w-4" />
                  Restrictions Marketing
                </CardTitle>
                <CardDescription>Limitations réglementaires par zone géographique</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(restrictionsByType).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                      <span className="text-sm capitalize text-slate-700">{type}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Notes */}
        <div className="space-y-6">
          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Notes
              </CardTitle>
              <CardDescription>Historique des observations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Note */}
              <div className="space-y-2">
                <Textarea
                  placeholder="Ajouter une note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="min-h-[80px]"
                />
                <Button
                  size="sm"
                  onClick={handleAddNote}
                  disabled={!newNote.trim()}
                  className="w-full"
                >
                  Ajouter la note
                </Button>
              </div>

              <Separator />

              {/* Notes List */}
              <div className="space-y-3">
                {notes.length > 0 ? (
                  notes.map((note) => (
                    <div
                      key={note.id}
                      className="rounded-lg border border-slate-200 bg-white p-3"
                      style={{ borderLeft: "1px solid oklch(0.205 0 0)" }}
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
                          {note.createdBy.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-900">{note.createdBy}</p>
                          <p className="text-xs text-slate-500">
                            {formatRelativeDate(note.createdAt)}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-slate-700">{note.content}</p>

                      {/* Attachments */}
                      {note.attachments && note.attachments.length > 0 && (
                        <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-2">
                          {note.attachments.map((attachment) => (
                            <a
                              key={attachment.id}
                              href={attachment.url}
                              className="flex items-center gap-2 rounded-md bg-slate-50 px-2.5 py-1.5 text-xs text-slate-700 transition-colors hover:bg-slate-100"
                            >
                              <FileText className="h-3.5 w-3.5 text-slate-500" />
                              <span className="flex-1 truncate font-medium">{attachment.name}</span>
                              {attachment.size && (
                                <span className="text-slate-500">{attachment.size}</span>
                              )}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="py-6 text-center text-sm text-slate-500">Aucune note</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
