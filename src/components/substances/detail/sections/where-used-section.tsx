"use client"

import { useMemo } from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { AlertTriangle, Ban, Download, Globe2, Layers, Sparkles, Star, CheckCircle } from "lucide-react"
import type { Substance } from "@/types"

import { cn, formatDate } from "@/lib/utils"
import { costComparisonLabel, formatCurrency } from "../detail-utils"
import { getCascadeImpact, getRegulatoryTimeline } from "@/lib/mock-data"
import type { AlternativeOption } from "@/lib/mock-data"
import { restrictionThemes, timelineThemes } from "../detail-constants"

interface AlternativeOptionsResult {
  recommended: AlternativeOption[]
  new: AlternativeOption[]
}

interface WhereUsedSectionProps {
  substance: Substance
  recommendedUsage: number
  alternativeOptions: AlternativeOptionsResult
  onOpenComparison: (alternativeId: string) => void
}

interface SummaryTileProps {
  title: string
  count: number
  helper: string
  variant?: "default" | "warning"
}

function SummaryTile({ title, count, helper, variant = "default" }: SummaryTileProps) {
  const accentClass =
    variant === "warning"
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : "border-slate-200 bg-slate-50 text-slate-700"
  return (
    <div className={cn("rounded-lg border p-4", accentClass)}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      <p className="text-2xl font-semibold text-slate-900">{count}</p>
      <p className="text-xs text-slate-600">{helper}</p>
    </div>
  )
}

export function WhereUsedSection({
  substance,
  recommendedUsage,
  alternativeOptions,
  onOpenComparison
}: WhereUsedSectionProps) {
  const cascade = useMemo(() => getCascadeImpact(substance.id), [substance.id])

  const whereUsedData = useMemo(() => {
    const rawMaterials = cascade.nodes.map((node) => ({
      id: node.rawMaterial.id,
      code: node.rawMaterial.code,
      name: node.rawMaterial.name,
      supplier: node.rawMaterial.supplier,
      status: node.rawMaterial.status,
      percentage: node.percentageInMaterial,
      isNonCompliant: node.isNonCompliant
    }))

    const formulaMap = new Map<
      string,
      {
        id: string
        code: string
        name: string
        productType: string
        status: string
        resultingPercentage: number
        markets: string[]
        isNonCompliant: boolean
        nearLimit: boolean
      }
    >()

    const productMap = new Map<
      string,
      {
        id: string
        name: string
        sku: string
        brand: string
        markets: string[]
        businessValue: number
        isNonCompliant: boolean
      }
    >()

    cascade.nodes.forEach((node) => {
      node.formulas.forEach((formula) => {
        const existingFormula = formulaMap.get(formula.formula.id)
        const nearLimit =
          typeof recommendedUsage === "number" && recommendedUsage > 0
            ? !formula.isNonCompliant && formula.resultingPercentage >= recommendedUsage * 0.8
            : false

        const mergedMarkets = existingFormula
          ? Array.from(new Set([...existingFormula.markets, ...formula.formula.marketPresence]))
          : formula.formula.marketPresence

        formulaMap.set(formula.formula.id, {
          id: formula.formula.id,
          code: formula.formula.code,
          name: formula.formula.name,
          productType: formula.formula.productType,
          status: formula.formula.status,
          resultingPercentage: existingFormula
            ? Math.max(existingFormula.resultingPercentage, formula.resultingPercentage)
            : formula.resultingPercentage,
          markets: mergedMarkets,
          isNonCompliant: (existingFormula?.isNonCompliant ?? false) || formula.isNonCompliant,
          nearLimit: (existingFormula?.nearLimit ?? false) || nearLimit
        })

        formula.products.forEach((product) => {
          const existingProduct = productMap.get(product.product.id)
          const mergedProductMarkets = existingProduct
            ? Array.from(new Set([...existingProduct.markets, ...product.product.markets]))
            : product.product.markets

          productMap.set(product.product.id, {
            id: product.product.id,
            name: product.product.name,
            sku: product.product.sku,
            brand: product.product.brand,
            markets: mergedProductMarkets,
            businessValue: product.product.businessValue,
            isNonCompliant: (existingProduct?.isNonCompliant ?? false) || product.isNonCompliant
          })
        })
      })
    })

    const formulas = Array.from(formulaMap.values())
    const products = Array.from(productMap.values())

    const marketAccumulator = new Map<string, number>()
    products.forEach((product) => {
      product.markets.forEach((market) => {
        marketAccumulator.set(market, (marketAccumulator.get(market) ?? 0) + 1)
      })
    })

    const marketDistribution = Array.from(marketAccumulator.entries()).map(([market, count]) => ({
      market,
      count
    }))

    const criticalFormulas = formulas.filter((formula) => formula.isNonCompliant || formula.nearLimit)

    return {
      rawMaterials,
      formulas,
      products,
      marketDistribution,
      totals: {
        rawMaterials: rawMaterials.length,
        formulas: formulas.length,
        products: products.length,
        all: rawMaterials.length + formulas.length + products.length,
        criticalFormulas: criticalFormulas.length
      }
    }
  }, [cascade, recommendedUsage])

  const regulatoryTimeline = useMemo(() => getRegulatoryTimeline(substance.id), [substance.id])

  const regulatoryTimelineByYear = useMemo(() => {
    const grouped = new Map<string, ReturnType<typeof getRegulatoryTimeline>>()
    regulatoryTimeline.forEach((event) => {
      const year = new Date(event.date).getFullYear().toString()
      if (!grouped.has(year)) grouped.set(year, [])
      grouped.get(year)?.push(event)
    })
    return Array.from(grouped.entries())
      .map(([year, events]) => [
        year,
        events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      ] as const)
      .sort((a, b) => Number(b[0]) - Number(a[0]))
  }, [regulatoryTimeline])

  return (
    <Card className="border border-slate-200 bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          Where Used – traçabilité inverse
        </CardTitle>
        <CardDescription>
          Identifiez instantanément où {substance.inciEU} est utilisée dans votre portefeuille.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="utilisations" className="space-y-6">
          <TabsList className="flex w-full flex-wrap gap-2 rounded-lg bg-slate-100 p-1">
            <TabsTrigger value="utilisations" className="flex items-center gap-2">
              Utilisations
              <Badge variant="secondary" className="rounded-full text-[11px]">
                {whereUsedData.totals.all}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="historique" className="flex items-center gap-2">
              Historique
              <Badge variant="outline" className="rounded-full text-[11px]">
                {regulatoryTimeline.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="alternatives" className="flex items-center gap-2">
              Alternatives
              <Badge variant="outline" className="rounded-full text-[11px]">
                {alternativeOptions.recommended.length + alternativeOptions.new.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="insights" className="space-y-3 text-sm text-slate-600">
            <p>
              <strong>{whereUsedData.totals.rawMaterials}</strong> matières premières référencées,{" "}
              <strong>{whereUsedData.totals.formulas}</strong> formules et{" "}
              <strong>{whereUsedData.totals.products}</strong> produits finis consomment cette substance.
            </p>
            <p>
              Utilisez l&apos;onglet utilisa­tions pour filtrer par fournisseur, statut ou marché, puis
              déclencher une action ciblée.
            </p>
          </TabsContent>

          <TabsContent value="utilisations" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <SummaryTile
                title="Matières Premières"
                count={whereUsedData.totals.rawMaterials}
                helper="Export ciblé en un clic"
              />
              <SummaryTile
                title="Formules"
                count={whereUsedData.totals.formulas}
                helper={`${whereUsedData.totals.criticalFormulas} critiques à surveiller`}
                variant={whereUsedData.totals.criticalFormulas ? "warning" : "default"}
              />
              <SummaryTile
                title="Produits finis"
                count={whereUsedData.totals.products}
                helper={`${whereUsedData.marketDistribution.length} marché(s) impacté(s)`}
              />
            </div>

            <Accordion
              defaultValue={
                whereUsedData.totals.criticalFormulas ? ["raw-materials", "formulas"] : ["raw-materials"]
              }
            >
              <AccordionItem value="raw-materials">
                <AccordionTrigger>
                  Matières Premières ({whereUsedData.totals.rawMaterials})
                </AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                    <span>Traçabilité fournisseur et concentration de la substance.</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toast.success("Export matières premières (simulation).")}
                    >
                      Exporter la liste complète
                    </Button>
                  </div>
                  <div className="rounded-lg border border-slate-200">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Code MP</TableHead>
                          <TableHead>Nom commercial</TableHead>
                          <TableHead>% Substance</TableHead>
                          <TableHead>Fournisseur</TableHead>
                          <TableHead>Statut</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {whereUsedData.rawMaterials.slice(0, 15).map((material) => (
                          <TableRow key={material.id}>
                            <TableCell className="font-medium text-slate-900">{material.code}</TableCell>
                            <TableCell className="text-sm text-slate-600">{material.name}</TableCell>
                            <TableCell className="text-xs text-slate-500">
                              {material.percentage.toFixed(2)}%
                            </TableCell>
                            <TableCell className="text-xs text-slate-500">{material.supplier}</TableCell>
                            <TableCell>
                              <Badge
                                className={cn(
                                  "rounded-full text-xs",
                                  material.isNonCompliant
                                    ? "bg-rose-100 text-rose-700"
                                    : "bg-emerald-100 text-emerald-700"
                                )}
                              >
                                {material.isNonCompliant ? "À risque" : "OK"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="formulas">
                <AccordionTrigger>Formules ({whereUsedData.totals.formulas})</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                    <span>Production & marchés alignés avec la veille conformité.</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toast.info("Export formules (simulation).")}
                    >
                      Exporter le fichier d&apos;impact
                    </Button>
                  </div>
                  <div className="rounded-lg border border-slate-200">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Code</TableHead>
                          <TableHead>Nom</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead>Résultante</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {whereUsedData.formulas.slice(0, 15).map((formula) => (
                          <TableRow key={formula.id}>
                            <TableCell className="font-medium text-slate-900">{formula.code}</TableCell>
                            <TableCell className="text-sm text-slate-600">{formula.name}</TableCell>
                            <TableCell className="text-xs text-slate-500">{formula.productType}</TableCell>
                            <TableCell>
                              <Badge
                                className={cn(
                                  "rounded-full text-xs",
                                  formula.isNonCompliant
                                    ? "bg-rose-100 text-rose-700"
                                    : formula.nearLimit
                                      ? "bg-amber-100 text-amber-700"
                                      : "bg-emerald-100 text-emerald-700"
                                )}
                              >
                                {formula.isNonCompliant
                                  ? "Blocage"
                                  : formula.nearLimit
                                    ? "Surveillance"
                                    : "OK"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-slate-500">
                              {formula.resultingPercentage.toFixed(2)}%
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="products">
                <AccordionTrigger>Produits finis ({whereUsedData.totals.products})</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                    <span>Accès rapide aux circuits de distribution impactés.</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toast.info("Export produits finis (simulation).")}
                    >
                      Exporter la vue commerciale
                    </Button>
                  </div>
                  <div className="rounded-lg border border-slate-200">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nom</TableHead>
                          <TableHead>SKU</TableHead>
                          <TableHead>Marque</TableHead>
                          <TableHead>Marchés</TableHead>
                          <TableHead>Statut</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {whereUsedData.products.slice(0, 20).map((product) => (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium text-slate-900">{product.name}</TableCell>
                            <TableCell className="text-xs text-slate-500">{product.sku}</TableCell>
                            <TableCell className="text-xs text-slate-500">{product.brand}</TableCell>
                            <TableCell className="text-xs text-slate-500">
                              {product.markets.join(", ")}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={cn(
                                  "rounded-full text-xs",
                                  product.isNonCompliant
                                    ? "bg-rose-100 text-rose-700"
                                    : "bg-emerald-100 text-emerald-700"
                                )}
                              >
                                {product.isNonCompliant ? "À risque" : "OK"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>

          <TabsContent value="historique" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Globe2 className="h-4 w-4 text-primary" />
                  Timeline des changements réglementaires
                </CardTitle>
                <CardDescription>
                  Retour sur 24 mois de décisions (restrictions, opportunités, warnings) sur {substance.inciEU}.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {regulatoryTimeline.length ? (
                  <div className="space-y-10">
                    {regulatoryTimelineByYear.map(([year, events]) => (
                      <div key={year} className="space-y-4">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                            {year}
                          </span>
                          <div className="h-px flex-1 bg-slate-200" />
                        </div>
                        <div className="relative pl-8">
                          <div className="absolute left-3 top-1 bottom-3 w-0.5 bg-slate-200" aria-hidden />
                          <div className="space-y-6">
                            {events.map((event) => {
                              const theme = timelineThemes[event.type]
                              return (
                                <div key={event.id} className="relative flex gap-4">
                                  <div
                                    className={cn(
                                      "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border",
                                      theme.circleClass
                                    )}
                                  >
                                    {event.type === "restriction" ? (
                                      <Ban className={cn("h-5 w-5", theme.iconClass)} />
                                    ) : event.type === "approval" ? (
                                      <CheckCircle className={cn("h-5 w-5", theme.iconClass)} />
                                    ) : (
                                      <AlertTriangle className={cn("h-5 w-5", theme.iconClass)} />
                                    )}
                                  </div>
                                  <Card className="flex-1 border border-slate-200 bg-slate-50">
                                    <CardContent className="space-y-3 p-4">
                                      <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                          <Badge
                                            className={cn(
                                              "rounded-full text-xs",
                                              event.type === "restriction"
                                                ? "bg-rose-100 text-rose-700"
                                                : event.type === "approval"
                                                  ? "bg-emerald-100 text-emerald-700"
                                                  : "bg-amber-100 text-amber-700"
                                            )}
                                          >
                                            {event.country}
                                          </Badge>
                                          <span className="text-xs text-slate-500">
                                            {formatDate(event.date, "dd MMM yyyy")}
                                          </span>
                                        </div>
                                      </div>
                                      <div>
                                        <p className="text-sm font-semibold text-slate-900">{event.title}</p>
                                        <p className="text-sm text-slate-600">{event.description}</p>
                                      </div>
                                      {event.impact ? (
                                        <div className="flex flex-wrap items-center gap-4 border-t border-slate-200 pt-3 text-xs text-slate-500">
                                          <span>
                                            Impact:{" "}
                                            <span className="font-semibold text-amber-600">
                                              {event.impact.formulas} formule(s)
                                            </span>
                                          </span>
                                          {event.impact.businessValue ? (
                                            <span>
                                              Valeur à risque:{" "}
                                              <span className="font-semibold text-rose-600">
                                                {formatCurrency(event.impact.businessValue)}
                                              </span>
                                            </span>
                                          ) : null}
                                          <Button
                                            variant="link"
                                            size="sm"
                                            className="h-auto p-0 text-primary"
                                            onClick={() => toast.info("Plan d'action dédié (simulation).")}
                                          >
                                            Voir le plan d&apos;action →
                                          </Button>
                                        </div>
                                      ) : null}
                                    </CardContent>
                                  </Card>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">
                    Aucun événement réglementaire enregistré pour cette substance.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alternatives" className="space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Alternatives validées
                </CardTitle>
                <CardDescription>
                  Recommandations basées sur vos usages et sur les validations réglementaires internes.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="mb-4 flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                      Recommandées (déjà dans vos formules)
                    </h3>
                  </div>
                  <div className="grid gap-3">
                    {alternativeOptions.recommended.length ? (
                      alternativeOptions.recommended.map((alt) => (
                        <Card key={alt.id} className="border border-slate-200 bg-slate-50 p-4">
                          <div className="flex flex-col gap-3">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-slate-900">{alt.inciName}</p>
                                <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-600">
                                  <span>✓ Marchés validés: {alt.markets.join(", ")}</span>
                                  <span>{costComparisonLabel(alt.costComparison)}</span>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onOpenComparison(alt.id)}
                                >
                                  Comparer
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => toast.success("Demande d'échantillon envoyée (simulation).")}
                                >
                                  Demander échantillon
                                </Button>
                              </div>
                            </div>
                            {(alt.pros.length || alt.cons.length) && (
                              <div className="flex flex-wrap gap-2 text-xs">
                                {alt.pros.map((pro) => (
                                  <Badge
                                    key={`${alt.id}-pros-${pro}`}
                                    variant="outline"
                                    className="border-emerald-200 text-emerald-700"
                                  >
                                    ✓ {pro}
                                  </Badge>
                                ))}
                                {alt.cons.map((con) => (
                                  <Badge
                                    key={`${alt.id}-cons-${con}`}
                                    variant="outline"
                                    className="border-amber-200 text-amber-700"
                                  >
                                    ⚠ {con}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </Card>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">
                        Aucune alternative validée n&apos;est actuellement référencée.
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <div className="mb-4 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                      Nouvelles opportunités
                    </h3>
                  </div>
                  <div className="grid gap-3">
                    {alternativeOptions.new.length ? (
                      alternativeOptions.new.map((alt) => (
                        <Card key={alt.id} className="border border-dashed border-slate-200 bg-white p-4">
                          <div className="flex flex-col gap-3">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-slate-900">{alt.inciName}</p>
                                <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-600">
                                  <span>✓ Marchés validés: {alt.markets.join(", ")}</span>
                                  <span>{costComparisonLabel(alt.costComparison)}</span>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onOpenComparison(alt.id)}
                                >
                                  Comparer
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => toast.success("Demande d'échantillon envoyée (simulation).")}
                                >
                                  Demander échantillon
                                </Button>
                              </div>
                            </div>
                            {(alt.pros.length || alt.cons.length) && (
                              <div className="flex flex-wrap gap-2 text-xs">
                                {alt.pros.map((pro) => (
                                  <Badge
                                    key={`${alt.id}-pros-${pro}`}
                                    variant="outline"
                                    className="border-emerald-200 text-emerald-700"
                                  >
                                    ✓ {pro}
                                  </Badge>
                                ))}
                                {alt.cons.map((con) => (
                                  <Badge
                                    key={`${alt.id}-cons-${con}`}
                                    variant="outline"
                                    className="border-amber-200 text-amber-700"
                                  >
                                    ⚠ {con}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </Card>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">
                        Aucune alternative validée supplémentaire n&apos;est disponible pour le moment.
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
