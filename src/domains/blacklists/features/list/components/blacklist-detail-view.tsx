"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, AlertTriangle, CheckCircle, FileText, Calendar, Users } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { toast } from "sonner"

import type { Blacklist, Substance } from "@/types"

import { Button } from "@/shared/ui/button"
import { Badge } from "@/shared/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card"
import { Separator } from "@/shared/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table"
import { cn } from "@/shared/lib/utils"

interface BlacklistDetailViewProps {
  blacklist: Blacklist
  substances: Substance[]
}

type ImpactLevel = "forbidden" | "restricted" | "monitoring"

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

function isOverdue(updatedAt: string, thresholdDays = 365) {
  const updatedTime = new Date(updatedAt).getTime()
  if (Number.isNaN(updatedTime)) return false
  const diffMs = Date.now() - updatedTime
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  return diffDays > thresholdDays
}

export function BlacklistDetailView({ blacklist, substances }: BlacklistDetailViewProps) {
  const router = useRouter()

  const substanceMap = React.useMemo(() => {
    return new Map(substances.map((substance) => [substance.id, substance]))
  }, [substances])

  const { impactLevel, hardBans, limitedUse, monitoringOnly } = React.useMemo(
    () => classifyImpact(blacklist.substances),
    [blacklist.substances]
  )

  const overdue = React.useMemo(() => isOverdue(blacklist.updatedAt), [blacklist.updatedAt])

  const uniqueSubstances = React.useMemo(
    () => new Set(blacklist.substances.map((entry) => entry.substanceId)).size,
    [blacklist.substances]
  )

  return (
    <div className="flex min-h-full flex-col gap-6">
      {/* Header with back button and title */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/blacklists")}
            className="w-fit gap-2 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux blacklists
          </Button>
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-slate-900">{blacklist.name}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                className={cn(
                  "rounded-full text-xs font-semibold",
                  impactLevelThemes[impactLevel].badgeClass
                )}
              >
                Impact {impactLevelThemes[impactLevel].label}
              </Badge>
              {overdue ? (
                <Badge className="rounded-full bg-rose-100 text-rose-700">
                  Revue en retard
                </Badge>
              ) : (
                <Badge className="rounded-full bg-emerald-100 text-emerald-700">
                  À jour
                </Badge>
              )}
              <Badge className="rounded-full bg-slate-100 text-slate-600">
                {uniqueSubstances} substances concernées
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {blacklist.brand ?? "Portefeuille global"} • {impactLevelThemes[impactLevel].description}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Substances
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-slate-900">{uniqueSubstances}</div>
            <p className="text-xs text-muted-foreground">entrées totales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Interdites
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-slate-900">{hardBans}</div>
            <p className="text-xs text-muted-foreground">substances bloquées</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Limitées
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-slate-900">{limitedUse}</div>
            <p className="text-xs text-muted-foreground">sous conditions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Documents
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-slate-900">{blacklist.documents.length}</div>
            <p className="text-xs text-muted-foreground">versions disponibles</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Substances List */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Substances Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="h-5 w-5 text-primary" />
                Substances impactées
              </CardTitle>
              <CardDescription>
                Cartographie des ingrédients concernés et niveau d&apos;exigence
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-slate-200">
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
                    {blacklist.substances.map((entry) => {
                      const substance = substanceMap.get(entry.substanceId)
                      const severity =
                        entry.maxPercentage === 0
                          ? "forbidden"
                          : typeof entry.maxPercentage === "number"
                            ? "restricted"
                            : "monitoring"
                      const severityTheme = impactLevelThemes[severity]
                      return (
                        <TableRow key={`${blacklist.id}-${entry.substanceId}`}>
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
                            <div className="space-y-1">
                              <Badge className={cn("rounded-full text-xs", severityTheme.badgeClass)}>
                                {severityTheme.label}
                                {typeof entry.maxPercentage === "number"
                                  ? ` • max ${entry.maxPercentage}%`
                                  : ""}
                              </Badge>
                              {entry.comment ? (
                                <p className="text-xs text-slate-500">{entry.comment}</p>
                              ) : null}
                            </div>
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
                                Watchlist
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Documents Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-primary" />
                Documents & pièces jointes
              </CardTitle>
              <CardDescription>
                Historique des versions mis à disposition par les équipes brand
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                {blacklist.documents.length ? (
                  blacklist.documents.map((document) => (
                    <div
                      key={document.id}
                      className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{document.name}</p>
                        <p className="text-xs text-slate-500">
                          Version {document.version} • {document.versionComment ?? "—"}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Publié le {format(new Date(document.uploadDate), "d MMM yyyy", { locale: fr })} par{" "}
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
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Info & Actions */}
        <div className="flex flex-col gap-6">
          {/* Metadata Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-4 w-4 text-primary" />
                Suivi mise à jour
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Dernière édition
                </p>
                <p className="text-sm text-slate-700">
                  {format(new Date(blacklist.updatedAt), "d MMMM yyyy 'à' HH:mm", {
                    locale: fr,
                  })}
                </p>
                <p className="text-xs text-muted-foreground">par {blacklist.updatedBy}</p>
              </div>

              <Separator />

              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Création
                </p>
                <p className="text-sm text-slate-700">
                  {format(new Date(blacklist.createdAt), "d MMMM yyyy 'à' HH:mm", {
                    locale: fr,
                  })}
                </p>
                <p className="text-xs text-muted-foreground">par {blacklist.createdBy}</p>
              </div>
            </CardContent>
          </Card>

          {/* Actions Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4 text-primary" />
                Actions rapides
              </CardTitle>
              <CardDescription>Coordination avec marketing & formulation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
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
              <Button
                size="sm"
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => toast.success("Pack charte exporté (simulation).")}
              >
                <FileText className="h-4 w-4" />
                Exporter pack charte
              </Button>
            </CardContent>
          </Card>

          {/* Statistics Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Statistiques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Total substances:</span>
                <span className="font-semibold text-slate-900">{uniqueSubstances}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Interdites:</span>
                <span className="font-semibold text-rose-700">{hardBans}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Limitées:</span>
                <span className="font-semibold text-amber-700">{limitedUse}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Veille uniquement:</span>
                <span className="font-semibold text-slate-700">{monitoringOnly}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
