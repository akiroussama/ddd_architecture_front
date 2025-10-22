"use client"

import * as React from "react"
import { useId } from "react"
import {
  ArrowUpRight,
  Filter,
  Loader2,
  Save,
  Search,
  Sparkles,
  Star,
} from "lucide-react"
import { toast } from "sonner"

import type { RawMaterial } from "@/shared/types"
import { Dialog, DialogContent } from "@/shared/ui/dialog"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/ui/command"
import { Button } from "@/shared/ui/button"
import { Badge } from "@/shared/ui/badge"
import { ScrollArea } from "@/shared/ui/scroll-area"
import { Separator } from "@/shared/ui/separator"
import { cn } from "@/shared/lib/utils"
import type { RMHistoryEntry } from "@/components/rm/RMTopBar"

export type RMCommandSavedView = {
  id: string
  name: string
  query: string
  description?: string
}

type SelectedFacets = {
  status: string[]
  site: string[]
  supplier: string[]
  origin: string[]
  grade: string[]
  favorite: boolean
}

type RMCommandProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  query: string
  initialItems?: RawMaterial[]
  onSelect: (material: RawMaterial, options?: { newTab?: boolean; query?: string }) => void
  savedViews: RMCommandSavedView[]
  onApplyView: (view: RMCommandSavedView) => void
  onSaveView: (view: RMCommandSavedView) => void
  favorites: RMHistoryEntry[]
  recents: RMHistoryEntry[]
  runSearch: (
    query: string,
    facets?: URLSearchParams | Record<string, string | string[] | undefined>
  ) => Promise<{ items: RawMaterial[]; order: string[]; total: number; query: string }>
}

const INITIAL_FACETS: SelectedFacets = {
  status: [],
  site: [],
  supplier: [],
  origin: [],
  grade: [],
  favorite: false,
}

const STATUS_CHIPS = [
  "Approuvé",
  "Actif",
  "En attente",
  "En revue",
  "Restreint",
  "Arrêté",
]

const FACET_LABELS: Record<keyof SelectedFacets, string> = {
  status: "Statut",
  site: "Site",
  supplier: "Fournisseur",
  origin: "Pays d’origine",
  grade: "Grade",
  favorite: "Favoris",
}

export function RMCommand({
  open,
  onOpenChange,
  query,
  initialItems = [],
  onSelect,
  savedViews,
  onApplyView,
  onSaveView,
  favorites,
  recents,
  runSearch,
}: RMCommandProps) {
  const [inputValue, setInputValue] = React.useState(query)
  const [selectedFacets, setSelectedFacets] = React.useState<SelectedFacets>(INITIAL_FACETS)
  const [results, setResults] = React.useState<RawMaterial[]>(initialItems)
  const [order, setOrder] = React.useState<string[]>([])
  const [total, setTotal] = React.useState<number>(initialItems.length)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [activeId, setActiveId] = React.useState<string | null>(initialItems[0]?.id ?? null)
  const [hasLoadedOnce, setHasLoadedOnce] = React.useState(false)

  const liveRegionId = useId()

  React.useEffect(() => {
    if (open) {
      setInputValue(query)
      setSelectedFacets(INITIAL_FACETS)
      if (results.length === 0) {
        setActiveId(null)
      }
    }
  }, [open, query])

  React.useEffect(() => {
    if (!open) return
    const controller = new AbortController()
    setLoading(true)
    setError(null)

    const timeout = window.setTimeout(() => {
      const params = facetsToParams(selectedFacets)
      runSearch(inputValue, params)
        .then((payload) => {
          setResults(payload.items)
          setOrder(payload.order)
          setTotal(payload.total)
          setHasLoadedOnce(true)
          if (payload.items.length) {
            setActiveId((prev) => prev ?? payload.items[0].id)
          } else {
            setActiveId(null)
          }
        })
        .catch((err) => {
          console.error(err)
          setError(err instanceof Error ? err.message : "Erreur lors de la recherche")
        })
        .finally(() => setLoading(false))
    }, 220)

    return () => {
      controller.abort()
      window.clearTimeout(timeout)
    }
  }, [inputValue, open, runSearch, selectedFacets])

  const facetOptions = React.useMemo(() => buildFacetOptions(results, initialItems), [
    initialItems,
    results,
  ])

  const activeMaterial = React.useMemo(() => {
    if (!activeId) return null
    return results.find((item) => item.id === activeId) ?? null
  }, [activeId, results])

  const handleSelect = React.useCallback(
    (material: RawMaterial, options?: { newTab?: boolean }) => {
      onSelect(material, { newTab: options?.newTab, query: inputValue })
      if (!options?.newTab) {
        onOpenChange(false)
      }
    },
    [inputValue, onOpenChange, onSelect]
  )

  const handleSaveView = React.useCallback(() => {
    const name = window.prompt("Nom de la vue à enregistrer :", inputValue || "Nouvelle vue")
    if (!name) return
    const saved: RMCommandSavedView = {
      id: `view-${Date.now()}`,
      name,
      query: inputValue,
      description: `Vue sauvegardée le ${new Date().toLocaleDateString()}`,
    }
    onSaveView(saved)
  }, [inputValue, onSaveView])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl overflow-hidden border border-border p-0">
        <div className="flex min-h-[520px] flex-col md:flex-row">
          <div className="flex flex-1 flex-col border-b border-border md:border-b-0 md:border-r">
            <div className="px-4 pb-2 pt-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Palette matières premières
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedFacets(INITIAL_FACETS)}
                    disabled={
                      !selectedFacets.favorite &&
                      !selectedFacets.grade.length &&
                      !selectedFacets.origin.length &&
                      !selectedFacets.site.length &&
                      !selectedFacets.status.length &&
                      !selectedFacets.supplier.length
                    }
                  >
                    <Filter className="mr-2 h-3.5 w-3.5" />
                    Réinitialiser
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleSaveView}>
                    <Save className="mr-2 h-3.5 w-3.5" />
                    Enregistrer
                  </Button>
                </div>
              </div>
              <Command className="mt-3 rounded-md border border-border">
                <CommandInput
                  value={inputValue}
                  onValueChange={setInputValue}
                  placeholder='Ex: inci:tocopherol cas:10191-41-0 fournisseur:"BASF"'
                  aria-describedby={liveRegionId}
                />
              </Command>
              <FacetBar
                selected={selectedFacets}
                options={facetOptions}
                onChange={setSelectedFacets}
              />
              <div
                id={liveRegionId}
                className="sr-only"
                aria-live="polite"
              >{`${loading ? "Recherche en cours" : `${total} résultat(s)`}`}</div>
            </div>

            <Separator />
            <div className="flex flex-1">
              <Command shouldFilter={false} className="flex-1 overflow-hidden">
                <CommandList className="max-h-[360px]">
                  {loading ? (
                    <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Recherche en cours…
                    </div>
                  ) : null}
                  <CommandGroup heading="Vues enregistrées">
                    {savedViews.map((view) => (
                      <CommandItem
                        key={view.id}
                        onSelect={() => onApplyView(view)}
                        className="flex items-center justify-between pr-6"
                      >
                        <span className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-purple-500" />
                          {view.name}
                        </span>
                        <span className="text-xs text-muted-foreground">{view.description}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  <CommandGroup heading="Favoris">
                    {favorites.length ? (
                      favorites.map((entry) => (
                        <CommandItem
                          key={`fav-${entry.id}`}
                          onSelect={() =>
                            onSelectFromHistory(entry, onSelect, onOpenChange, inputValue)
                          }
                        >
                          <span className="mr-2 inline-flex items-center justify-center">
                            <Star className="h-4 w-4 text-yellow-500" />
                          </span>
                          <div className="flex flex-1 flex-col gap-1">
                            <span className="text-sm font-medium">{entry.commercialName}</span>
                            <span className="text-xs text-muted-foreground">
                              {entry.inci} · {entry.site}
                            </span>
                          </div>
                        </CommandItem>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-xs text-muted-foreground">
                        Ajoutez des favoris pour les voir ici.
                      </div>
                    )}
                  </CommandGroup>
                  <CommandGroup heading="Récents">
                    {recents.length ? (
                      recents.map((entry) => (
                        <CommandItem
                          key={`recent-${entry.id}`}
                          onSelect={() =>
                            onSelectFromHistory(entry, onSelect, onOpenChange, inputValue)
                          }
                        >
                          <div className="flex flex-1 flex-col gap-1">
                            <span className="text-sm font-medium">{entry.commercialName}</span>
                            <span className="text-xs text-muted-foreground">
                              {entry.inci} · {entry.site}
                            </span>
                          </div>
                        </CommandItem>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-xs text-muted-foreground">
                        Pas encore de matière consultée.
                      </div>
                    )}
                  </CommandGroup>
                  <Separator />
                  <CommandGroup heading="Résultats">
                    {results.map((material) => {
                      const isActive = material.id === activeId
                      return (
                        <CommandItem
                          key={material.id}
                          onSelect={() => handleSelect(material)}
                          onPointerMove={() => setActiveId(material.id)}
                          onFocus={() => setActiveId(material.id)}
                          data-active={isActive ? "true" : undefined}
                          className={cn(
                            "flex items-center gap-3 pr-6",
                            isActive && "bg-muted"
                          )}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                              event.preventDefault()
                              handleSelect(material, { newTab: true })
                            }
                          }}
                        >
                          <div className="flex flex-1 flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-foreground">
                                {material.commercialName}
                              </span>
                              <Badge variant="outline" className="text-[10px]">
                                {material.site}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                              <span>{material.inci}</span>
                              <span>· {material.supplier}</span>
                              <span>· {material.status}</span>
                              {material.casEcPairs.slice(0, 2).map((pair) => (
                                <Badge key={pair.id} variant="secondary" className="text-[10px]">
                                  {pair.cas}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <ArrowUpRight className="h-4 w-4 opacity-50" />
                        </CommandItem>
                      )
                    })}
                  </CommandGroup>
                </CommandList>
                {error && (
                  <div className="border-t border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {error}
                  </div>
                )}
                {!loading && hasLoadedOnce && !results.length && !error ? (
                  <CommandEmpty>Aucun résultat correspondant à votre requête.</CommandEmpty>
                ) : null}
              </Command>
            </div>
          </div>

          <div className="hidden w-[300px] flex-col md:flex">
            <div className="flex-1 overflow-hidden px-4 py-4">
              <ScrollArea className="h-full pr-2">
                {activeMaterial ? (
                  <PreviewCard material={activeMaterial} />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center text-center text-sm text-muted-foreground">
                    <Sparkles className="mb-2 h-6 w-6" />
                    Sélectionnez une matière pour afficher son aperçu détaillé.
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

type FacetBarProps = {
  selected: SelectedFacets
  options: FacetOptions
  onChange: (facets: SelectedFacets) => void
}

function FacetBar({ selected, options, onChange }: FacetBarProps) {
  const toggle = (key: keyof SelectedFacets, value: string) => {
    if (key === "favorite") {
      onChange({ ...selected, favorite: !selected.favorite })
      return
    }

    const current = new Set(selected[key] as string[])
    if (current.has(value)) {
      current.delete(value)
    } else {
      current.add(value)
    }
    onChange({ ...selected, [key]: Array.from(current) })
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <FacetGroup
        label={FACET_LABELS.status}
        values={STATUS_CHIPS}
        selected={selected.status}
        onToggle={(value) => toggle("status", value)}
      />
      <FacetGroup
        label={FACET_LABELS.site}
        values={options.site}
        selected={selected.site}
        onToggle={(value) => toggle("site", value)}
      />
      <FacetGroup
        label={FACET_LABELS.supplier}
        values={options.supplier}
        selected={selected.supplier}
        onToggle={(value) => toggle("supplier", value)}
      />
      <FacetGroup
        label={FACET_LABELS.origin}
        values={options.origin}
        selected={selected.origin}
        onToggle={(value) => toggle("origin", value)}
      />
      <FacetGroup
        label={FACET_LABELS.grade}
        values={options.grade}
        selected={selected.grade}
        onToggle={(value) => toggle("grade", value)}
      />
      <Button
        size="xs"
        variant={selected.favorite ? "default" : "outline"}
        className="rounded-full px-3 text-[11px]"
        onClick={() => toggle("favorite", "true")}
        aria-pressed={selected.favorite}
      >
        <Star className="mr-1.5 h-3 w-3" />
        Favoris
      </Button>
    </div>
  )
}

type FacetGroupProps = {
  label: string
  values: string[]
  selected: string[]
  onToggle: (value: string) => void
}

function FacetGroup({ label, values, selected, onToggle }: FacetGroupProps) {
  if (!values.length) return null
  return (
    <div className="flex items-center gap-1">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">
        {values.map((value) => {
          const active = selected.includes(value)
          return (
            <button
              key={value}
              type="button"
              onClick={() => onToggle(value)}
              className={cn(
                "rounded-full border px-2.5 py-[3px] text-[11px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-primary/40"
              )}
            >
              {value}
            </button>
          )
        })}
      </div>
    </div>
  )
}

type FacetOptions = {
  site: string[]
  supplier: string[]
  origin: string[]
  grade: string[]
}

function buildFacetOptions(results: RawMaterial[], seed: RawMaterial[]): FacetOptions {
  const source = results.length ? results : seed

  const extract = (selector: (item: RawMaterial) => string | undefined) => {
    const set = new Set<string>()
    source.forEach((item) => {
      const value = selector(item)
      if (value) set.add(value)
    })
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }

  return {
    site: extract((item) => item.site),
    supplier: extract((item) => item.supplier),
    origin: extract((item) => item.originCountry),
    grade: extract((item) => item.grade),
  }
}

function facetsToParams(selected: SelectedFacets): Record<string, string | string[]> {
  const params: Record<string, string | string[]> = {}

  if (selected.status.length) params.status = selected.status
  if (selected.site.length) params.site = selected.site
  if (selected.supplier.length) params.supplier = selected.supplier
  if (selected.origin.length) params.origin = selected.origin
  if (selected.grade.length) params.grade = selected.grade
  if (selected.favorite) params.favorite = "true"

  return params
}

type PreviewCardProps = {
  material: RawMaterial
}

function PreviewCard({ material }: PreviewCardProps) {
  const firstPairs = material.casEcPairs.slice(0, 3)
  const truncated = material.casEcPairs.length - firstPairs.length

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-foreground">{material.commercialName}</h3>
          <Badge variant="outline" className="text-[10px] uppercase">
            {material.status}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">{material.inci}</p>
      </div>

      <div className="space-y-2 rounded-md border border-border bg-muted/50 p-3 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Fournisseur</span>
          <span className="font-medium text-foreground">{material.supplier}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Site</span>
          <span className="font-medium text-foreground">{material.site}</span>
        </div>
        {material.grade ? (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Grade</span>
            <span className="font-medium text-foreground">{material.grade}</span>
          </div>
        ) : null}
        {material.originCountry ? (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Origine</span>
            <span className="font-medium text-foreground">{material.originCountry}</span>
          </div>
        ) : null}
      </div>

      <div>
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Identifiants CAS / EINECS
        </span>
        <div className="mt-2 space-y-1.5">
          {firstPairs.map((pair) => (
            <div key={pair.id} className="rounded border border-border px-2 py-1">
              <div className="flex items-center justify-between text-xs font-medium">
                <span>{pair.cas}</span>
                {pair.ec ? <span className="text-muted-foreground">{pair.ec}</span> : null}
              </div>
              <div className="mt-1 flex flex-wrap gap-1">
                {pair.sources.map((source) => (
                  <Badge key={source} variant="secondary" className="text-[10px]">
                    {source}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
          {truncated > 0 ? (
            <span className="text-xs text-muted-foreground">+{truncated} identifiant(s)</span>
          ) : null}
        </div>
      </div>

      {material.risks?.length ? (
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Risques
          </span>
          <div className="mt-2 flex flex-wrap gap-1">
            {material.risks.map((risk) => (
              <Badge key={risk} variant="destructive" className="text-[10px]">
                {risk}
              </Badge>
            ))}
          </div>
        </div>
      ) : null}

      {material.allergens?.length ? (
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Allergènes
          </span>
          <div className="mt-2 flex flex-wrap gap-1">
            {material.allergens.map((allergen) => (
              <Badge key={allergen} variant="outline" className="text-[10px]">
                {allergen}
              </Badge>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function onSelectFromHistory(
  entry: RMHistoryEntry,
  onSelect: RMCommandProps["onSelect"],
  onOpenChange: (open: boolean) => void,
  query: string
) {
  const material: RawMaterial = {
    id: entry.id,
    commercialName: entry.commercialName,
    code: entry.code,
    site: entry.site,
    status: entry.status,
    inci: entry.inci,
    supplier: entry.supplier ?? "",
    updatedAt: new Date().toISOString(),
    casEcPairs: [],
  }

  onSelect(material, { query })
  onOpenChange(false)
}
