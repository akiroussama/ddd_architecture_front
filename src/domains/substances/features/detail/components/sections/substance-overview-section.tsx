"use client"

import Link from "next/link"
import { useMemo } from "react"
import { AlertTriangle, ArrowLeft, ClipboardCopy, FileText, GaugeCircle, ShieldAlert, Sparkles, Target } from "lucide-react"
import type { Document, Substance } from "@/shared/types"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/shared/ui/card"
import { Separator } from "@/shared/ui/separator"
import { toast } from "sonner"

import { cn, formatDate, formatRelativeDate } from "@/shared/lib/utils"
import { CascadeImpactPanel } from "../cascade-impact-panel"
import { restrictionThemes, statusThemes } from "../detail-constants"
import type { ComplianceSnapshot, MarketingSummary } from "../detail-types"

interface SubstanceOverviewSectionProps {
  substance: Substance
  documents: Document[]
  recommendedUsage: number
  complianceSnapshot: ComplianceSnapshot
  marketingSummary: MarketingSummary
  marketingHighlightsCount: number
  dossierReadiness: number
}

export function SubstanceOverviewSection({
  substance,
  documents,
  recommendedUsage,
  complianceSnapshot,
  marketingSummary,
  marketingHighlightsCount,
  dossierReadiness
}: SubstanceOverviewSectionProps) {
  const statusTheme = statusThemes[substance.status]

  const lastDocumentUpdate = useMemo(() => {
    if (!documents.length) return null
    return documents.slice().sort((a, b) => {
      return new Date(b.updatedAt ?? b.createdAt).getTime() - new Date(a.updatedAt ?? a.createdAt).getTime()
    })[0]
  }, [documents])

  const quickStats = useMemo(
    () => [
      {
        title: "Niveau de risque",
        value: restrictionThemes[complianceSnapshot.highestSeverity].label,
        icon: ShieldAlert,
        description: `${complianceSnapshot.total} fiches réglementaires`,
        accentClass: restrictionThemes[complianceSnapshot.highestSeverity].className
      },
      {
        title: "Documents clés",
        value: documents.length,
        icon: FileText,
        description: lastDocumentUpdate
          ? `Maj ${formatRelativeDate(lastDocumentUpdate.updatedAt ?? lastDocumentUpdate.createdAt)}`
          : "Aucun document référencé",
        accentClass: "bg-slate-100 text-slate-700 border-slate-200"
      },
      {
        title: "Préparation dossier",
        value: `${dossierReadiness}%`,
        icon: GaugeCircle,
        description:
          dossierReadiness >= 80
            ? "Prêt pour validation PLM"
            : "Compléter les éléments manquants",
        accentClass:
          dossierReadiness >= 80
            ? "bg-emerald-100 text-emerald-700 border-emerald-200"
            : "bg-amber-100 text-amber-700 border-amber-200"
      },
      {
        title: "Impact marketing",
        value: marketingHighlightsCount,
        icon: AlertTriangle,
        description:
          marketingHighlightsCount === 0
            ? "Aucune charte limitative"
            : `${marketingSummary.hardBans} blocage(s) • ${marketingSummary.limited} limitation(s)`,
        accentClass:
          marketingSummary.hardBans > 0
            ? "bg-rose-100 text-rose-700 border-rose-200"
            : marketingSummary.limited
              ? "bg-amber-100 text-amber-700 border-amber-200"
              : "bg-slate-100 text-slate-700 border-slate-200"
      }
    ],
    [
      complianceSnapshot.highestSeverity,
      complianceSnapshot.total,
      documents.length,
      dossierReadiness,
      lastDocumentUpdate,
      marketingHighlightsCount,
      marketingSummary.hardBans,
      marketingSummary.limited
    ]
  )

  const handleCopyInci = () => {
    const text = [substance.inciEU, substance.inciUS, substance.inciMixed]
      .filter(Boolean)
      .join(" / ")

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        toast.success("Dénomination copiée dans le presse-papiers.")
      })
    } else {
      toast.error("Copie impossible depuis cet environnement.")
    }
  }

  const handleGeneratePack = () => toast.success("Pack réglementaire généré (simulation).")
  const handleScheduleReview = () =>
    toast.info("Rappel de revue planifié pour l'équipe conformité.")

  return (
    <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Badge
              className={cn(
                "flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold",
                statusTheme.badgeClass
              )}
            >
              <statusTheme.icon className="h-3.5 w-3.5" />
              {statusTheme.label}
            </Badge>
            <Badge className="rounded-full border border-slate-200 bg-slate-100 text-xs text-slate-600">
              ID {substance.id.toUpperCase()}
            </Badge>
            <Badge className="rounded-full border border-primary/20 bg-primary/10 text-xs text-primary">
              {substance.functions.join(" / ")}
            </Badge>
          </div>
          <h1 className="text-3xl font-semibold text-slate-900">{substance.inciEU}</h1>
          {substance.technicalName ? (
            <p className="text-sm text-slate-600">
              {substance.technicalName}
              {substance.canadianTrivialName ? ` • ${substance.canadianTrivialName}` : ""}
            </p>
          ) : null}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span>Créée le {formatDate(substance.createdAt, "dd MMM yyyy")}</span>
            <span className="text-slate-300">•</span>
            <span>Dernière mise à jour {formatRelativeDate(substance.updatedAt)}</span>
            <span className="text-slate-300">•</span>
            <span>Référent: {substance.updatedBy ?? substance.createdBy}</span>
          </div>
        </div>
        <div className="flex flex-col gap-2 md:items-end">
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={handleCopyInci}>
              <ClipboardCopy className="h-4 w-4" />
              Copier INCI
            </Button>
            <CascadeImpactPanel substance={substance} defaultLimit={recommendedUsage || 1} />
            <Button variant="outline" size="sm" className="gap-2" onClick={handleScheduleReview}>
              <Target className="h-4 w-4" />
              Planifier revue
            </Button>
            <Button size="sm" className="gap-2" onClick={handleGeneratePack}>
              <Sparkles className="h-4 w-4" />
              Générer pack
            </Button>
          </div>
          <Link
            href="/substances"
            className="flex items-center gap-2 text-xs text-slate-500 hover:text-primary"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Retour au référentiel
          </Link>
        </div>
      </div>

      <Separator />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {quickStats.map((stat) => (
          <Card key={stat.title} className={cn("border border-dashed", stat.accentClass)}>
            <CardHeader className="pb-1">
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
  )
}
