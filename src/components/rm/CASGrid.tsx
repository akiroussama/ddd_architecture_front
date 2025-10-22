"use client"

import * as React from "react"
import { useForm, useFieldArray, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Plus, Save, Trash2 } from "lucide-react"
import { toast } from "sonner"

import type { CasEcPair } from "@/shared/types"
import { Button } from "@/shared/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table"
import { Input } from "@/shared/ui/input"
import { Textarea } from "@/shared/ui/textarea"
import { Badge } from "@/shared/ui/badge"
import { Form, FormField, FormItem, FormMessage } from "@/shared/ui/form"
import { Switch } from "@/shared/ui/switch"
import { MultiSelect } from "@/shared/ui/multi-select"
import { cn } from "@/shared/lib/utils"
import { CasEcPairSchema } from "@/lib/validators"

type CASGridProps = {
  materialId: string
  initialPairs: CasEcPair[]
  sourceOptions?: string[]
  className?: string
}

const SOURCE_DEFAULTS = [
  "CosIng 2014",
  "Supplier CoA",
  "ECHA",
  "IFRA 51e",
  "Internal QA",
]

const STORAGE_DENSITY_KEY = "gg:rm:cas-density"

const FormSchema = z
  .object({
    pairs: z.array(CasEcPairSchema),
  })
  .superRefine((data, ctx) => {
    const seen = new Map<string, number>()
    data.pairs.forEach((pair, index) => {
      const key = `${pair.cas.toLowerCase()}|${(pair.ec ?? "").toLowerCase()}`
      if (seen.has(key)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Ce couple CAS/EINECS existe déjà",
          path: ["pairs", index, "cas"],
        })
      } else {
        seen.set(key, index)
      }
    })
  })

type FormValues = z.infer<typeof FormSchema>

export function CASGrid({
  materialId,
  initialPairs,
  sourceOptions = SOURCE_DEFAULTS,
  className,
}: CASGridProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    mode: "onBlur",
    defaultValues: {
      pairs: initialPairs.length ? initialPairs : [createEmptyPair()],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "pairs",
  })

  const [density, setDensity] = React.useState<"normal" | "dense">("normal")
  const watchPairs = form.watch("pairs")
  const duplicateCas = React.useMemo(() => computeDuplicateCas(watchPairs), [watchPairs])

  React.useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_DENSITY_KEY)
    if (stored === "dense") {
      setDensity("dense")
    }
  }, [])

  const toggleDensity = React.useCallback(
    (checked: boolean) => {
      const next = checked ? "dense" : "normal"
      setDensity(next)
      window.localStorage.setItem(STORAGE_DENSITY_KEY, next)
    },
    []
  )

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const response = await fetch(`/api/raw-materials/${materialId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ casEcPairs: values.pairs }),
      })

      if (!response.ok) {
        throw new Error("Impossible d'enregistrer les identifiants CAS/EINECS")
      }

      const updated: CasEcPair[] = (await response.json()).casEcPairs ?? values.pairs
      form.reset({ pairs: updated })
      toast.success("Identifiants CAS/EINECS mis à jour")
    } catch (error) {
      console.error(error)
      toast.error("Une erreur est survenue lors de l'enregistrement")
    }
  })

  const handleAddRow = () => {
    append(createEmptyPair())
  }

  const handleCancel = () => {
    form.reset({ pairs: initialPairs })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={onSubmit}
        className={cn("space-y-4", className)}
        aria-label="Grille d'édition CAS / EINECS"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Couplages CAS ↔ EINECS</h3>
            <p className="text-sm text-muted-foreground">
              {form.getValues("pairs").length} couplage(s) — validation automatique via zod.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5">
              <span className="text-xs text-muted-foreground">Densité</span>
              <Switch
                checked={density === "dense"}
                onCheckedChange={toggleDensity}
                aria-label="Basculer la densité d'affichage"
              />
              <span className="text-xs">{density === "dense" ? "Dense" : "Normale"}</span>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={handleAddRow}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un couplage
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              disabled={!form.formState.isDirty}
            >
              Annuler
            </Button>
            <Button type="submit" size="sm" disabled={form.formState.isSubmitting}>
              <Save className="mr-2 h-4 w-4" />
              Enregistrer
            </Button>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-border">
          <Table role="grid" className={cn(density === "dense" && "text-sm")}>
            <TableHeader>
              <TableRow role="row">
                <TableHead role="columnheader" className="w-[180px]">
                  CAS
                </TableHead>
                <TableHead role="columnheader" className="w-[160px]">
                  EINECS / EC
                </TableHead>
                <TableHead role="columnheader">Sources</TableHead>
                <TableHead role="columnheader" className="w-[240px]">
                  Note
                </TableHead>
                <TableHead role="columnheader" className="w-[80px] text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((field, index) => (
                <TableRow key={field.id} role="row" className="align-top">
                  <TableCell role="gridcell">
                    <FormField
                      control={form.control}
                      name={`pairs.${index}.cas`}
                      render={({ field: casField }) => (
                        <FormItem>
                          <Input
                            {...casField}
                            placeholder="10191-41-0"
                            aria-invalid={Boolean(form.formState.errors.pairs?.[index]?.cas)}
                          />
                          <div className="mt-1 flex items-center gap-2">
                            <FormMessage />
                            {duplicateCas.has(casField.value.toLowerCase()) ? (
                              <Badge variant="destructive" className="text-[10px]">
                                Doublon
                              </Badge>
                            ) : null}
                          </div>
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell role="gridcell">
                    <FormField
                      control={form.control}
                      name={`pairs.${index}.ec`}
                      render={({ field: ecField }) => (
                        <FormItem>
                          <Input
                            {...ecField}
                            placeholder="233-466-0"
                            aria-invalid={Boolean(form.formState.errors.pairs?.[index]?.ec)}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell role="gridcell">
                    <Controller
                      control={form.control}
                      name={`pairs.${index}.sources`}
                      render={({ field: sourcesField }) => (
                        <FormItem>
                          <MultiSelect
                            options={sourceOptions.map((source) => ({
                              value: source,
                              label: source,
                            }))}
                            selected={sourcesField.value}
                            onChange={sourcesField.onChange}
                            placeholder="Sélectionner des sources"
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell role="gridcell">
                    <FormField
                      control={form.control}
                      name={`pairs.${index}.note`}
                      render={({ field: noteField }) => (
                        <FormItem>
                          <Textarea
                            {...noteField}
                            rows={density === "dense" ? 2 : 3}
                            placeholder="Information complémentaire (500 caractères max)"
                          />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell role="gridcell" className="text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      aria-label="Supprimer ce couplage"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </form>
    </Form>
  )
}

function createEmptyPair(): CasEcPair {
  return {
    id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `tmp-${Date.now()}`,
    cas: "",
    ec: undefined,
    sources: [],
    note: "",
  }
}

function computeDuplicateCas(pairs: CasEcPair[]): Set<string> {
  const counts = new Map<string, number>()
  pairs.forEach((pair) => {
    const key = pair.cas.trim().toLowerCase()
    if (!key) return
    counts.set(key, (counts.get(key) ?? 0) + 1)
  })
  return new Set(Array.from(counts.entries()).filter(([, count]) => count > 1).map(([cas]) => cas))
}
