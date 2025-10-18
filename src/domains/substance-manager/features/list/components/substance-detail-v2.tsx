"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Edit, FileText, AlertCircle } from "lucide-react"

import type { Substance, Restriction, Blacklist } from "@/shared/types"
import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { Badge } from "@/shared/ui/badge"
import { Separator } from "@/shared/ui/separator"
import { cn, formatRelativeDate } from "@/shared/lib/utils"

interface SubstanceDetailV2Props {
  substance: Substance
  restrictions: Restriction[]
  blacklists: Blacklist[]
}

export function SubstanceDetailV2({
  substance,
  restrictions,
  blacklists,
}: SubstanceDetailV2Props) {
  const router = useRouter()

  // Marketing restrictions summary
  const marketingRestrictions = React.useMemo(() => {
    return blacklists.map((blacklist) => {
      const entry = blacklist.substances.find(
        (s) => s.substanceId === substance.id
      )
      if (!entry) return null

      const severity: "forbidden" | "restricted" | "monitoring" =
        entry.maxPercentage === 0
          ? "forbidden"
          : typeof entry.maxPercentage === "number"
            ? "restricted"
            : "monitoring"

      return {
        name: blacklist.name,
        brand: blacklist.brand || "Portefeuille global",
        severity,
        maxPercentage: entry.maxPercentage,
        comment: entry.comment,
      }
    }).filter(Boolean)
  }, [blacklists, substance.id])

  const severityConfig: Record<"forbidden" | "restricted" | "monitoring", { label: string; className: string }> = {
    forbidden: {
      label: "Interdit",
      className: "bg-rose-100 text-rose-700 border-rose-200",
    },
    restricted: {
      label: "Limité",
      className: "bg-amber-100 text-amber-700 border-amber-200",
    },
    monitoring: {
      label: "Veille",
      className: "bg-slate-100 text-slate-700 border-slate-200",
    },
  } as const

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/substance-manager")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {substance.inciEU}
            </h1>
            <p className="text-sm text-muted-foreground">
              Substance Manager • Fiche détaillée V2
            </p>
          </div>
        </div>
        <Button className="gap-2">
          <Edit className="h-4 w-4" />
          Modifier
        </Button>
      </div>

      {/* Section 1: Identification */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">1. Identification</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <p className="text-sm font-medium text-slate-600">ID Substance</p>
              <p className="mt-1 font-mono text-sm text-slate-900">
                {substance.id}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">INCI Europe</p>
              <p className="mt-1 text-sm text-slate-900">{substance.inciEU}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">INCI USA</p>
              <p className="mt-1 text-sm text-slate-900">{substance.inciUS}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Alias INCI (si disponible) */}
      {substance.inciMixed ||
      substance.inciBrazil ||
      substance.inciChina ||
      substance.technicalName ||
      substance.canadianTrivialName ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">2. Alias INCI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {substance.inciMixed && (
                <div>
                  <Badge variant="outline" className="mb-1">
                    Mixed
                  </Badge>
                  <p className="text-sm text-slate-900">{substance.inciMixed}</p>
                </div>
              )}
              {substance.inciBrazil && (
                <div>
                  <Badge variant="outline" className="mb-1">
                    Brazil
                  </Badge>
                  <p className="text-sm text-slate-900">{substance.inciBrazil}</p>
                </div>
              )}
              {substance.inciChina && (
                <div>
                  <Badge variant="outline" className="mb-1">
                    China
                  </Badge>
                  <p className="text-sm text-slate-900">{substance.inciChina}</p>
                </div>
              )}
              {substance.technicalName && (
                <div>
                  <Badge variant="outline" className="mb-1">
                    Nom Technique
                  </Badge>
                  <p className="text-sm text-slate-900">
                    {substance.technicalName}
                  </p>
                </div>
              )}
              {substance.canadianTrivialName && (
                <div>
                  <Badge variant="outline" className="mb-1">
                    Canada
                  </Badge>
                  <p className="text-sm text-slate-900">
                    {substance.canadianTrivialName}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Section 3: CAS/EINECS Pairs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            3. Identifiants CAS/EINECS
            {substance.casEinecsPairs.length > 1 && (
              <Badge variant="secondary" className="ml-2">
                {substance.casEinecsPairs.length} pairs
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {substance.casEinecsPairs.length > 0 ? (
            <div className="space-y-4">
              {substance.casEinecsPairs.map((pair, index) => (
                <div
                  key={pair.id}
                  className={cn(
                    "rounded-lg border p-4",
                    index === 0
                      ? "border-primary/20 bg-primary/5"
                      : "border-slate-200 bg-slate-50"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase mb-1">
                          N° CAS
                        </p>
                        <code className="font-mono text-sm text-slate-900">
                          {pair.cas}
                        </code>
                      </div>
                      {pair.einecs && (
                        <div>
                          <p className="text-xs font-medium text-slate-500 uppercase mb-1">
                            N° EINECS
                          </p>
                          <code className="font-mono text-sm text-slate-900">
                            {pair.einecs}
                          </code>
                        </div>
                      )}
                    </div>
                    {index === 0 && (
                      <Badge variant="outline" className="ml-2">
                        Principal
                      </Badge>
                    )}
                  </div>
                  {pair.source && (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <p className="text-xs text-slate-600">
                        <span className="font-medium">Source:</span> {pair.source}
                      </p>
                    </div>
                  )}
                  <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                    <span>Ajouté par {pair.createdBy}</span>
                    <span>•</span>
                    <span>{formatRelativeDate(pair.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              Aucun identifiant CAS/EINECS défini
            </p>
          )}
        </CardContent>
      </Card>

      {/* Section 4: Classification */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">4. Classification</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-slate-600">Classe</p>
                <p className="mt-1 text-sm text-slate-900">
                  {substance.class || "—"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Familles</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  {substance.families.length > 0 ? (
                    substance.families.map((family) => (
                      <Badge key={family} variant="outline">
                        {family}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500">—</span>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  Groupe allergènes
                </p>
                <p className="mt-1 text-sm text-slate-900">
                  {substance.allergenGroup || "Aucun"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">
                  Allergènes 26
                </p>
                <div className="mt-1 flex flex-wrap gap-2">
                  {substance.allergens26.length > 0 ? (
                    substance.allergens26.map((allergen) => (
                      <Badge
                        key={allergen}
                        className="bg-orange-100 text-orange-700"
                      >
                        {allergen}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500">Aucun</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 5: Fonctions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">5. Fonctions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {substance.functions.length > 0 ? (
              substance.functions.map((func) => (
                <Badge key={func} variant="secondary">
                  {func}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-slate-500">Aucune fonction définie</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Section 6: Restrictions Marketing */}
      {marketingRestrictions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              6. Restrictions Marketing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {marketingRestrictions.map((restriction, idx) => {
                if (!restriction) return null
                const config = severityConfig[restriction.severity]

                return (
                  <div
                    key={idx}
                    className="rounded-lg border border-slate-200 bg-white p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-slate-900">
                          {restriction.name}
                        </p>
                        <p className="text-sm text-slate-500">
                          {restriction.brand}
                        </p>
                      </div>
                      <Badge className={cn("border", config.className)}>
                        {config.label}
                        {typeof restriction.maxPercentage === "number" &&
                          restriction.maxPercentage > 0 &&
                          ` • max ${restriction.maxPercentage}%`}
                      </Badge>
                    </div>
                    {restriction.comment && (
                      <p className="mt-2 text-sm text-slate-600">
                        {restriction.comment}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section 7: Notes Réglementaires */}
      {substance.notes && substance.notes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5" />
              7. Notes réglementaires
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {substance.notes.map((note) => (
                <div
                  key={note.id}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="mb-2 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
                      {note.createdBy.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {note.createdBy}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatRelativeDate(note.createdAt)}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-700">{note.content}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metadata Footer */}
      <Card className="bg-slate-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <div>
              Créé le {formatRelativeDate(substance.createdAt)} par{" "}
              {substance.createdBy}
            </div>
            <div>
              Mis à jour le {formatRelativeDate(substance.updatedAt)} par{" "}
              {substance.updatedBy}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
