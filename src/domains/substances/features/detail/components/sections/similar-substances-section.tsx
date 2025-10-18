"use client"

import Link from "next/link"
import { Sparkles } from "lucide-react"
import type { Substance } from "@/types"
import { Badge } from "@/shared/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/shared/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs"

import { cn } from "@/shared/lib/utils"
import { restrictionThemes, statusThemes } from "../detail-constants"

interface SimilarSubstancesSectionProps {
  similarSubstances: Substance[]
}

export function SimilarSubstancesSection({ similarSubstances }: SimilarSubstancesSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Comparatif substances proches
        </CardTitle>
        <CardDescription>
          Alternatives potentielles partageant famille et fonction pour sécuriser les formules.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {similarSubstances.length ? (
          <Tabs defaultValue={similarSubstances[0]?.id}>
            <TabsList>
              {similarSubstances.map((item) => (
                <TabsTrigger key={item.id} value={item.id} className="flex items-center gap-2">
                  {item.inciEU}
                  <Badge
                    className={cn(
                      "rounded-full text-[10px]",
                      statusThemes[item.status].badgeClass
                    )}
                  >
                    {statusThemes[item.status].label}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>
            {similarSubstances.map((item) => (
              <TabsContent key={item.id} value={item.id}>
                <div className="mt-4 grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.inciEU}</p>
                      <p className="text-xs text-slate-500">
                        Fonctions: {item.functions.join(", ")}
                      </p>
                    </div>
                    <Link
                      href={`/substances/${item.id}`}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      Ouvrir la fiche
                    </Link>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                    {item.restrictions.map((restriction) => (
                      <Badge
                        key={`${item.id}-${restriction.country}-${restriction.type}`}
                        className={cn(
                          "rounded-full border",
                          restrictionThemes[restriction.type].className
                        )}
                      >
                        {restriction.country}: {restrictionThemes[restriction.type].label}
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <p className="text-sm text-slate-500">
            Aucune alternative pertinente n&apos;a été identifiée dans la base actuelle.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
