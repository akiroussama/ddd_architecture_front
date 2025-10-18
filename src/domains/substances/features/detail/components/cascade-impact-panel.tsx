"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import {
  AlertTriangle,
  Download,
  FileText,
  GaugeCircle,
  GitBranch,
  Layers,
  ListChecks,
  Sparkles,
  Target
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
import { Input } from "@/shared/ui/input"
import { Progress } from "@/shared/ui/progress"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/shared/ui/sheet"
import { toast } from "sonner"

import { cn } from "@/shared/lib/utils"
import {
  getCascadeImpact,
  type CascadeImpactData
} from "@/shared/lib/mock-data"
import { formatCurrency } from "./detail-utils"

interface CascadeImpactPanelProps {
  substance: Substance
  defaultLimit: number
}

export function CascadeImpactPanel({ substance, defaultLimit }: CascadeImpactPanelProps) {
  const [simulatedLimit, setSimulatedLimit] = useState<number>(defaultLimit)

  useEffect(() => {
    setSimulatedLimit(defaultLimit)
  }, [defaultLimit])

  const impactData = useMemo<CascadeImpactData>(() => {
    return getCascadeImpact(substance.id, simulatedLimit)
  }, [simulatedLimit, substance.id])

  const sliderMax = Math.max(20, defaultLimit * 2, simulatedLimit + 1)

  const nonCompliantMaterials = impactData.nodes.filter((node) => node.isNonCompliant)
  const nonCompliantFormulas = impactData.nodes.flatMap((node) =>
    node.formulas.filter((formula) => formula.isNonCompliant)
  )
  const nonCompliantProducts = impactData.nodes.flatMap((node) =>
    node.formulas.flatMap((formula) => formula.products.filter((product) => product.isNonCompliant))
  )

  const percent = (value: number, total: number) => {
    if (total === 0) return 0
    return Math.round((value / total) * 100)
  }

  const riskLevel = simulatedLimit <= 0 ? "Blocage total" : `Limite simulée: ${simulatedLimit.toFixed(1)}%`

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <GitBranch className="h-4 w-4" />
          Simuler cascade
          <Badge variant="destructive" className="uppercase">New</Badge>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full max-w-4xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>"Cascade Impact System"™ – {substance.inciEU}</SheetTitle>
          <SheetDescription>
            Explorez en temps réel l&apos;impact d&apos;un changement réglementaire sur les matières premières,
            formules et produits finis.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Target className="h-4 w-4 text-primary" />
                Simulation réglementaire
              </CardTitle>
              <CardDescription className="flex flex-col gap-1 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
                <span>{riskLevel}</span>
                <span>Ancrez la limite cible puis laissez le système propager automatiquement l&apos;impact.</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Nouvelle limite (%)</span>
                  <span>{simulatedLimit.toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={sliderMax}
                  step={0.1}
                  value={simulatedLimit}
                  onChange={(event) => setSimulatedLimit(Number(event.target.value))}
                  className="h-2 w-full cursor-pointer rounded-lg bg-slate-200"
                />
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    max={sliderMax}
                    step={0.1}
                    value={simulatedLimit}
                    onChange={(event) => setSimulatedLimit(Number(event.target.value))}
                    className="w-24"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSimulatedLimit(defaultLimit)}
                  >
                    Réinitialiser ({defaultLimit.toFixed(1)}%)
                  </Button>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <ImpactSummaryCard
                  title="MPs affectées"
                  value={impactData.summary.rawMaterialsNonCompliant}
                  total={impactData.summary.rawMaterialsTotal}
                  percentage={percent(
                    impactData.summary.rawMaterialsNonCompliant,
                    impactData.summary.rawMaterialsTotal
                  )}
                />
                <ImpactSummaryCard
                  title="Formules impactées"
                  value={impactData.summary.formulasNonCompliant}
                  total={impactData.summary.formulasTotal}
                  percentage={percent(
                    impactData.summary.formulasNonCompliant,
                    impactData.summary.formulasTotal
                  )}
                />
                <ImpactSummaryCard
                  title="Produits à risque"
                  value={impactData.summary.productsNonCompliant}
                  total={impactData.summary.productsTotal}
                  percentage={percent(
                    impactData.summary.productsNonCompliant,
                    impactData.summary.productsTotal
                  )}
                />
                <Card className="border border-slate-200 bg-slate-50">
                  <CardHeader className="pb-1">
                    <CardTitle className="text-sm">Valeur business exposée</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-semibold text-rose-600">
                      {formatCurrency(impactData.summary.businessValueAtRisk)}
                    </p>
                    <p className="text-xs text-slate-500">Basé sur le portefeuille concerné</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Layers className="h-4 w-4 text-primary" />
                Dependency Explorer
              </CardTitle>
              <CardDescription>
                Vue en cascade substances → matières premières → formules → produits.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {impactData.nodes.length ? (
                <div className="space-y-3">
                  {impactData.nodes.map((node) => (
                    <div
                      key={node.rawMaterial.id}
                      className={cn(
                        "rounded-lg border p-4",
                        node.isNonCompliant
                          ? "border-rose-200 bg-rose-50"
                          : "border-slate-200 bg-slate-50"
                      )}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {node.rawMaterial.code}: {node.rawMaterial.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            Contribution: {node.percentageInMaterial}% de la substance
                          </p>
                        </div>
                        <Badge
                          className={cn(
                            "rounded-full text-xs",
                            node.isNonCompliant
                              ? "bg-rose-100 text-rose-700"
                              : "bg-emerald-100 text-emerald-700"
                          )}
                        >
                          {node.isNonCompliant ? "Non conforme" : "OK"}
                        </Badge>
                      </div>

                      <div className="mt-3 space-y-3">
                        {node.formulas.map((formula) => (
                          <div
                            key={formula.formula.id}
                            className={cn(
                              "rounded-lg border bg-white p-3",
                              formula.isNonCompliant
                                ? "border-rose-200"
                                : "border-slate-200"
                            )}
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <p className="text-sm font-semibold text-slate-900">
                                  {formula.formula.code}: {formula.formula.name}
                                </p>
                                <p className="text-xs text-slate-500">
                                  Dosage MP: {formula.dosageInFormula}% • Résultant: {formula.resultingPercentage.toFixed(2)}%
                                </p>
                                <p className="text-[11px] text-slate-400">
                                  Marchés: {formula.formula.marketPresence.join(", ")}
                                </p>
                              </div>
                              <Badge
                                className={cn(
                                  "rounded-full text-xs",
                                  formula.isNonCompliant
                                    ? "bg-rose-100 text-rose-700"
                                    : "bg-emerald-100 text-emerald-700"
                                )}
                              >
                                {formula.isNonCompliant ? "Non conforme" : "OK"}
                              </Badge>
                            </div>
                            <div className="mt-3 space-y-3">
                              {formula.products.map((product) => (
                                <div
                                  key={product.product.id}
                                  className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                                >
                                  <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                                    <div>
                                      <p className="font-semibold text-slate-900">
                                        {product.product.sku}: {product.product.name}
                                      </p>
                                      <p className="text-xs text-slate-500">
                                        Marchés: {product.product.markets.join(", ")}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p>
                                        {product.resultingPercentage.toFixed(2)}%
                                      </p>
                                      {product.isNonCompliant ? (
                                        <p className="text-[11px] text-rose-600">
                                          À reformuler d&apos;urgence
                                        </p>
                                      ) : null}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">Aucune dépendance identifiée pour cette substance.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Target className="h-4 w-4 text-primary" />
                Actions recommandées
              </CardTitle>
              <CardDescription>
                Propagation assistée vers les équipes formulation, marketing et supply chain.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 md:grid-cols-3">
                <ActionCard
                  title="Appliquer et notifier"
                  description="Met à jour les limites et alerte automatiquement les owners de MP/Formule."
                  variant="destructive"
                  onClick={() => toast.success("Propagation en cascade simulée (notifications envoyées).")}
                />
                <ActionCard
                  title="Générer rapport d&apos;impact"
                  description="Crée un PDF détaillé pour l&apos;audit et le comité marketing."
                  onClick={() => toast.success("Rapport d'impact généré (simulation).")}
                />
                <ActionCard
                  title="Créer tâches de reformulation"
                  description="Ouvre des tickets par produit impacté (Jira / PLM)."
                  onClick={() => toast.success("Tâches de reformulation créées (simulation).")}
                />
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                Rollback possible pendant 24h après propagation grâce au suivi transactionnel.
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  )
}

interface ImpactSummaryCardProps {
  title: string
  value: number
  total: number
  percentage: number
}

function ImpactSummaryCard({ title, value, total, percentage }: ImpactSummaryCardProps) {
  return (
    <Card className="border border-slate-200 bg-slate-50">
      <CardHeader className="pb-1">
        <CardTitle className="text-sm">{title}</CardTitle>
        <CardDescription className="text-xs text-slate-500">
          {total} total • {percentage}%
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-2xl font-semibold text-rose-600">{value}</p>
        <Progress value={percentage} />
      </CardContent>
    </Card>
  )
}

interface ActionCardProps {
  title: string
  description: string
  onClick: () => void
  variant?: React.ComponentProps<typeof Button>["variant"]
}

function ActionCard({ title, description, onClick, variant = "outline" }: ActionCardProps) {
  return (
    <Card className="flex flex-col justify-between border border-slate-200 bg-slate-50 p-3">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      <Button variant={variant} size="sm" className="mt-3" onClick={onClick}>
        {title}
      </Button>
    </Card>
  )
}
