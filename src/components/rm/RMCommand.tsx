"use client"

import * as React from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import {
  ArrowUpRight,
  Clock,
  Filter,
  Loader2,
  Save,
  Search,
  Sparkles,
  Star,
  Trash2,
  X,
} from "lucide-react"

import { RMQueryPills } from "@/components/rm/RMQueryPills"
import type {
  ParsedQuery,
  ParsedToken,
} from "@/lib/rm-search"
import {
  parseQuery,
  serializeParsedQuery,
  removeTokenFromQuery,
} from "@/lib/rm-search"
import {
  analytics,
  listRawMaterials,
  recordRecent,
} from "@/lib/rm-store"
import type {
  RawMaterial,
  RawMaterialBookmark,
  RawMaterialSavedView,
} from "@/shared/types"
import { Button } from "@/shared/ui/button"
import { Badge } from "@/shared/ui/badge"
import { Command, CommandInput } from "@/shared/ui/command"
import { Dialog, DialogContent, DialogTitle } from "@/shared/ui/dialog"
import { Separator } from "@/shared/ui/separator"
import { ScrollArea } from "@/shared/ui/scroll-area"
import { cn, formatRelativeDate } from "@/shared/lib/utils"

type CommandEntry =
  | { kind: "recent"; item: RawMaterialBookmark }
  | { kind: "favorite"; item: RawMaterialBookmark }
  | { kind: "result"; item: RawMaterial; index: number }

type SelectedFacet = {
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
  initialResults: RawMaterial[]
  initialOrder: string[]
  recents: RawMaterialBookmark[]
  favorites: RawMaterialBookmark[]
  views: RawMaterialSavedView[]
  density: "comfortable" | "compact"
  onNavigateMaterial: (
    material: RawMaterial,
    meta: { query: string; order: string[]; newTab?: boolean }
  ) => void
  onNavigateBookmark: (
    bookmark: RawMaterialBookmark,
    source: "recent" | "favorite",
    meta: { query: string; newTab?: boolean }
  ) => void
  onRemoveRecent: (id: string) => void
  onSaveView: (name: string, query: string) => void
  onApplyView: (view: RawMaterialSavedView) => void
  onDeleteView: (id: string) => void
  onToggleFavorite: (id: string, next?: boolean) => void
  onQueryChange: (query: string, order: string[], results: RawMaterial[]) => void
  onPeek: (material: RawMaterial | null) => void
  onRefreshBookmarks: () => void
}

const DEBOUNCE_MS = 160
const ITEM_HEIGHT_COMFORT = 60
const ITEM_HEIGHT_COMPACT = 48
const OVERSCAN = 6

export function RMCommand({
  open,
  onOpenChange,
  query,
  initialResults,
  initialOrder,
  recents,
  favorites,
  views,
  density,
  onNavigateMaterial,
  onNavigateBookmark,
  onRemoveRecent,
  onSaveView,
  onApplyView,
  onDeleteView,
  onToggleFavorite,
  onQueryChange,
  onPeek,
  onRefreshBookmarks,
}: RMCommandProps) {
  const [inputValue, setInputValue] = useState(query)
  const [results, setResults] = useState<RawMaterial[]>(initialResults)
  const [order, setOrder] = useState<string[]>(initialOrder)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [highlightIndex, setHighlightIndex] = useState(0)
  const [peekedId, setPeekedId] = useState<string | null>(null)
  const [scrollOffset, setScrollOffset] = useState(0)
  const [viewportHeight, setViewportHeight] = useState(320)
  const listRef = useRef<HTMLDivElement>(null)
  const lastQueryRef = useRef(query)

  const dataset = useMemo(() => listRawMaterials(), [])
  const parsedQuery = useMemo<ParsedQuery>(() => parseQuery(inputValue), [inputValue])
  const positiveTokens = useMemo<ParsedToken[]>(
    () => parsedQuery.allTokens.filter((token) => !token.negated),
    [parsedQuery]
  )

  const facetOptions = useMemo(() => buildFacetOptions(dataset), [dataset])
  const [selectedFacets, setSelectedFacets] = useState<SelectedFacet>({
    status: [],
    site: [],
    supplier: [],
    origin: [],
    grade: [],
    favorite: false,
  })

  const recentsShown = useMemo(
    () => recents.slice(0, 5),
    [recents]
  )
  const favoritesShown = useMemo(
    () => favorites.slice(0, 10),
    [favorites]
  )

  const resultBaseIndex = recentsShown.length + favoritesShown.length
  const entries: CommandEntry[] = useMemo(() => {
    const recentsEntries: CommandEntry[] = recentsShown.map((item) => ({
      kind: "recent",
      item,
    }))
    const favoriteEntries: CommandEntry[] = favoritesShown.map((item) => ({
      kind: "favorite",
      item,
    }))
    const resultEntries: CommandEntry[] = results.map((item, idx) => ({
      kind: "result",
      item,
      index: idx,
    }))
    return [...recentsEntries, ...favoriteEntries, ...resultEntries]
  }, [recentsShown, favoritesShown, results])

  const itemHeight = density === "compact" ? ITEM_HEIGHT_COMPACT : ITEM_HEIGHT_COMFORT
  const totalResultsHeight = results.length * itemHeight
  const startIndex = Math.max(0, Math.floor(scrollOffset / itemHeight) - OVERSCAN)
  const endIndex = Math.min(
    results.length,
    Math.ceil((scrollOffset + viewportHeight) / itemHeight) + OVERSCAN
  )
  const visibleResults = results.slice(startIndex, endIndex)
  const translateY = startIndex * itemHeight

  useEffect(() => {
    if (open) {
      setInputValue(query)
      setResults(initialResults)
      setOrder(initialOrder)
      lastQueryRef.current = query
      setHighlightIndex(0)
      setPeekedId(null)
      onPeek(null)
      analytics("open_palette", { query })
    }
  }, [open, query, initialOrder, initialResults, onPeek])

  useEffect(() => {
    if (!open) return
    const controller = new AbortController()
    const timeout = window.setTimeout(async () => {
      const nextQuery = inputValue.trim()
      if (nextQuery === lastQueryRef.current) return
      setLoading(true)
      try {
        const response = await fetch(
          `/api/raw-materials/search?q=${encodeURIComponent(nextQuery)}`,
          { signal: controller.signal, cache: "no-store" }
        )
        if (!response.ok) {
          throw new Error("Impossible d'exécuter la recherche")
        }
        const payload = (await response.json()) as {
          items: RawMaterial[]
          order: string[]
          queryEcho: string
        }
        setResults(payload.items)
        setOrder(payload.order)
        onQueryChange(nextQuery, payload.order, payload.items)
        lastQueryRef.current = payload.queryEcho
        setHighlightIndex(0)
        setScrollOffset(0)
        setError(null)
        analytics("execute_query", { query: payload.queryEcho, hits: payload.items.length })
      } catch (err) {
        if (controller.signal.aborted) return
        const message =
          err instanceof Error ? err.message : "Erreur inconnue lors de la recherche."
        setError(message)
      } finally {
        setLoading(false)
      }
    }, DEBOUNCE_MS)

    return () => {
      controller.abort()
      window.clearTimeout(timeout)
    }
  }, [inputValue, open, onQueryChange])

  useEffect(() => {
    const element = listRef.current
    if (!element) return
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setViewportHeight(entry.contentRect.height)
      }
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!open) return
    if (highlightIndex >= entries.length) {
      setHighlightIndex(recentsShown.length + favoritesShown.length)
    }
}, [open, query, initialOrder, initialResults, onPeek, recentsShown.length, favoritesShown.length])


  const highlightedEntry = entries[highlightIndex] ?? null

  useEffect(() => {
    if (!highlightedEntry || highlightedEntry.kind !== "result") return
    const index = highlightedEntry.index
    const top = index * itemHeight
    const bottom = top + itemHeight
    if (!listRef.current) return
    if (top < scrollOffset) {
      listRef.current.scrollTo({ top, behavior: "smooth" })
    } else if (bottom > scrollOffset + viewportHeight) {
      listRef.current.scrollTo({
        top: bottom - viewportHeight,
        behavior: "smooth",
      })
    }
  }, [highlightedEntry, itemHeight, scrollOffset, viewportHeight])

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    setScrollOffset(event.currentTarget.scrollTop)
  }

  const handleSelectEntry = (
    entry: CommandEntry,
    options: { newTab?: boolean }
  ) => {
    if (entry.kind === "result") {
      recordRecent(entry.item)
      onNavigateMaterial(entry.item, {
        query: inputValue.trim(),
        order,
        newTab: options.newTab,
      })
    } else {
      onNavigateBookmark(entry.item, entry.kind, {
        query: inputValue.trim(),
        newTab: options.newTab,
      })
    }
    onOpenChange(false)
    onPeek(null)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!entries.length) return
    if (event.key === "ArrowDown") {
      event.preventDefault()
      setHighlightIndex((previous) => Math.min(entries.length - 1, previous + 1))
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      setHighlightIndex((previous) => Math.max(0, previous - 1))
    } else if (event.key === "Enter") {
      event.preventDefault()
      const entry = entries[highlightIndex]
      if (!entry) return
      handleSelectEntry(entry, {
        newTab: event.metaKey || event.ctrlKey,
      })
    } else if (event.key === " " && highlightedEntry?.kind === "result") {
      event.preventDefault()
      if (peekedId === highlightedEntry.item.id) {
        setPeekedId(null)
        onPeek(null)
      } else {
        setPeekedId(highlightedEntry.item.id)
        onPeek(highlightedEntry.item)
      }
    } else if (event.key === "Escape") {
      event.preventDefault()
      onOpenChange(false)
      onPeek(null)
    } else if (
      (event.key === "Backspace" || event.key === "Delete") &&
      highlightedEntry?.kind === "recent" &&
      inputValue.trim() === ""
    ) {
      event.preventDefault()
      onRemoveRecent(highlightedEntry.item.id)
      analytics("remove_recent", { id: highlightedEntry.item.id })
    }
  }

  const handleFacetToggle = (field: keyof SelectedFacet, value: string) => {
    setSelectedFacets((previous) => {
      if (field === "favorite") {
        const next = { ...previous, favorite: !previous.favorite }
        updateQueryForFacet("favorite", next.favorite ? "true" : undefined)
        return next
      }
      const list = new Set(previous[field])
      if (list.has(value)) {
        list.delete(value)
      } else {
        list.add(value)
      }
      const next = { ...previous, [field]: Array.from(list) }
      updateQueryForFacet(field, list)
      return next
    })
  }

  const updateQueryForFacet = (
    field: keyof SelectedFacet,
    values?: Set<string> | string | undefined
  ) => {
    const baseQuery = parseQuery(inputValue)
    const remainingTokens = baseQuery.clauses.flatMap((clause) =>
      clause.tokens.filter(
        (token) =>
          token.type !== "field" ||
          !token.field ||
          token.field !== mapFacetField(field)
      )
    )
    let rebuilt = remainingTokens
      .map((token) => serializeTokenStandalone(token))
      .filter(Boolean)
      .join(" ")
    const canonical = mapFacetField(field)

    if (field === "favorite" && typeof values === "string") {
      if (values === "true") {
        rebuilt = `${rebuilt} favorite:true`.trim()
      }
    } else if (values instanceof Set) {
      values.forEach((value) => {
        rebuilt = `${rebuilt} ${canonical}:${quoteIfNeeded(value)}`.trim()
      })
    }

    setInputValue(rebuilt)
  }

  const handleRemoveToken = (tokenId: string) => {
    const nextQuery = removeTokenFromQuery(inputValue, tokenId)
    setInputValue(nextQuery)
    analytics("remove_query_token", { tokenId })
  }

  const handleSaveCurrentView = () => {
    const alias = window.prompt("Nom de la vue :", inputValue || "Nouvelle vue")
    if (!alias) return
    onSaveView(alias, inputValue.trim())
    analytics("save_view_palette", { name: alias })
  }

  const handleApplyView = (view: RawMaterialSavedView) => {
    onApplyView(view)
    setInputValue(view.query)
    analytics("open_view_palette", { id: view.id })
  }

  const statsLabel =
    results.length === 0
      ? "Aucun résultat"
      : results.length === 1
        ? "1 résultat"
        : `${results.length} résultats`

  const removeRecentAndRefresh = (bookmark: RawMaterialBookmark) => {
    onRemoveRecent(bookmark.id)
    onRefreshBookmarks()
  }

  const toggleFavoriteAndRefresh = (bookmark: RawMaterialBookmark) => {
    onToggleFavorite(bookmark.id)
    onRefreshBookmarks()
  }

// avant:
// const highlightedMaterial =
//   highlightedEntry?.kind === "result" ? highlightedEntry.item : null;

// après:
const highlightedMaterial =
  highlightedEntry
    ? highlightedEntry.kind === "result"
      ? highlightedEntry.item
      : dataset.find((m) => m.id === highlightedEntry.item.id) ?? null
    : null


  return (
     <Dialog open={open} onOpenChange={onOpenChange}>
         <DialogContent
  className="
    max-w-none sm:max-w-none
    w-[min(98vw,1600px)] min-w-[50vw]
    overflow-hidden rounded-2xl border border-border p-0
  "
>
         <DialogTitle className="sr-only">
           Palette de recherche matières premières
         </DialogTitle>
        <div className="flex min-h-[520px] max-h-[80vh] flex-col md:flex-row">
          <div className="flex flex-1 flex-col border-b border-border md:border-b-0 md:border-r">
            <div className="px-4 pb-2 pt-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                  <Search className="h-4 w-4" />
                  Palette matières premières
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setInputValue(query)}
                    disabled={inputValue.trim() === query.trim()}
                  >
                    <Filter className="mr-2 h-3.5 w-3.5" />
                    Réinitialiser
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleSaveCurrentView}>
                    <Save className="mr-2 h-3.5 w-3.5" />
                    Sauvegarder
                  </Button>
                </div>
              </div>
              <Command shouldFilter={false} className="mt-3 rounded-md border border-border">
                <CommandInput
                  value={inputValue}
                  onValueChange={setInputValue}
                  placeholder='Ex: inci:tocopherol cas:10191-41-0 fourn:"BASF"'
                />
              </Command>
              <RMQueryPills tokens={positiveTokens} onRemoveToken={handleRemoveToken} />
              <FacetBar
                facets={selectedFacets}
                options={facetOptions}
                onToggle={handleFacetToggle}
              />
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Vues
                </span>
                {views.length === 0 ? (
                  <span className="text-[11px] text-muted-foreground">
                    Aucune vue enregistrée.
                  </span>
                ) : (
                  views.slice(0, 6).map((view) => (
                    <Badge
                      key={view.id}
                      variant="secondary"
                      className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px]"
                    >
                      <button
                        type="button"
                        onClick={() => handleApplyView(view)}
                        className="max-w-[140px] truncate text-left"
                      >
                        {view.name}
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteView(view.id)}
                        className="text-muted-foreground hover:text-destructive"
                        aria-label={`Supprimer la vue ${view.name}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))
                )}
              </div>
              <div className="sr-only" aria-live="polite">
                {loading ? "Recherche en cours" : statsLabel}
              </div>
            </div>
            <Separator />
            <div className="flex flex-1">
              <Command shouldFilter={false} className="flex-1 overflow-hidden">
                <div
                  ref={listRef}
                  onScroll={handleScroll}
                  onKeyDown={handleKeyDown}
                  tabIndex={0}
                  className="max-h-[360px] flex-1 overflow-auto focus-visible:outline-none"
                >
                  <div className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Récents
                  </div>
                  <ScrollSection
                    entries={recentsShown.map((item) => ({
                      kind: "recent" as const,
                      item,
                    }))}
                    highlightIndex={highlightIndex}
                    baseIndex={0}
                    onClick={(bookmark) =>
                      handleSelectEntry(
                        { kind: "recent", item: bookmark },
                        { newTab: false }
                      )
                    }
                    onRemove={removeRecentAndRefresh}
                  />
                  <div className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Favoris
                  </div>
                  <ScrollSection
                    entries={favoritesShown.map((item) => ({
                      kind: "favorite" as const,
                      item,
                    }))}
                    highlightIndex={highlightIndex}
                    baseIndex={recentsShown.length}
                    onClick={(bookmark) =>
                      handleSelectEntry(
                        { kind: "favorite", item: bookmark },
                        { newTab: false }
                      )
                    }
                    onFavoriteToggle={toggleFavoriteAndRefresh}
                  />
                  <div className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Résultats
                  </div>
                  <div
                    className="relative"
                    style={{ height: totalResultsHeight }}
                    role="listbox"
                    aria-activedescendant={highlightedMaterial?.id ?? undefined}
                  >
                    <div
                      className="absolute inset-x-0"
                      style={{ transform: `translateY(${translateY}px)` }}
                    >
                      {visibleResults.map((material, idx) => {
                        const globalIndex = resultBaseIndex + startIndex + idx
                        const isActive = highlightIndex === globalIndex
                        return (
                          <ResultRow
                            key={material.id}
                            material={material}
                            isActive={isActive}
                            height={itemHeight}
                            onDoubleClick={() =>
                              handleSelectEntry(
                                { kind: "result", item: material, index: startIndex + idx },
                                { newTab: false }
                              )
                            }
                          />
                        )
                      })}
                    </div>
                  </div>
                </div>
                {error ? (
                  <div className="border-t border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {error}
                  </div>
                ) : null}
                {loading ? (
                  <div className="border-t border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                    <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                    Recherche en cours…
                  </div>
                ) : (
                  <div className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
                    {statsLabel}
                  </div>
                )}
              </Command>
            </div>
          </div>
          <aside className="hidden w-[300px] flex-none border-l border-border bg-muted/30 md:block">
            <PreviewPane material={highlightedMaterial} />
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  )
}

type ScrollSectionProps = {
  entries: Array<{ kind: "recent" | "favorite"; item: RawMaterialBookmark }>
  highlightIndex: number
  baseIndex: number
  onClick: (bookmark: RawMaterialBookmark) => void
  onRemove?: (bookmark: RawMaterialBookmark) => void
  onFavoriteToggle?: (bookmark: RawMaterialBookmark) => void
}

function ScrollSection({
  entries,
  highlightIndex,
  baseIndex,
  onClick,
  onRemove,
  onFavoriteToggle,
}: ScrollSectionProps) {
  if (!entries.length) {
    return (
      <div className="px-4 py-3 text-xs text-muted-foreground">
        Aucun élément pour le moment.
      </div>
    )
  }
  return (
    <ul className="px-2 pb-2">
      {entries.map((entry, idx) => {
        const bookmark = entry.item
        const globalIndex = baseIndex + idx
        const isActive = globalIndex === highlightIndex
        return (
          <li key={`${entry.kind}-${bookmark.id}`}>
            <button
              type="button"
              onClick={() => onClick(bookmark)}
              className={cn(
                "flex w-full flex-col gap-1 rounded-md px-2 py-2 text-left transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive && "bg-muted"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-foreground">
                  {bookmark.commercialName}
                </span>
                <Badge variant="outline" className="text-[10px] font-mono">
                  {bookmark.site}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{bookmark.inci}</span>
                <span>· {bookmark.status}</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <ClockIcon />
                {formatRelativeDate(bookmark.timestamp)}
              </div>
            </button>
            <div className="px-2 pb-2 text-right">
              {onFavoriteToggle ? (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => onFavoriteToggle(bookmark)}
                >
                  <Star className="mr-1 h-3 w-3" />
                  Retirer
                </Button>
              ) : null}
              {onRemove ? (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => onRemove(bookmark)}
                >
                  <Trash2 className="mr-1 h-3 w-3" />
                  Supprimer
                </Button>
              ) : null}
            </div>
          </li>
        )
      })}
    </ul>
  )
}

type ResultRowProps = {
  material: RawMaterial
  isActive: boolean
  height: number
  onDoubleClick: () => void
}

function ResultRow({ material, isActive, height, onDoubleClick }: ResultRowProps) {
  return (
    <button
      type="button"
      onClick={onDoubleClick}
      role="option"
      id={material.id}
      aria-selected={isActive}
      className={cn(
        "flex w-full items-start gap-3 border-b border-border/60 px-4 py-3 text-left transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isActive && "bg-muted"
      )}
      style={{ height }}
    >
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-foreground">
            {material.commercialName}
          </span>
          <Badge variant="outline" className="text-[10px] font-mono">
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
      <ArrowUpRight className="mt-1 h-4 w-4 text-muted-foreground" />
    </button>
  )
}

type PreviewPaneProps = {
  material: RawMaterial | null
}

function PreviewPane({ material }: PreviewPaneProps) {
  if (!material) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center text-sm text-muted-foreground">
        <Sparkles className="h-6 w-6" />
        Sélectionnez une matière pour afficher un aperçu détaillé.
      </div>
    )
  }

  const firstPairs = material.casEcPairs.slice(0, 3)
  const truncated = material.casEcPairs.length - firstPairs.length

  return (
    <div className="flex h-full flex-col gap-4 px-4 py-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">{material.commercialName}</h3>
        <p className="text-xs text-muted-foreground">{material.inci}</p>
      </div>
      <div className="space-y-2 rounded-md border border-border bg-background px-3 py-3 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Fournisseur</span>
          <span className="font-medium text-foreground">{material.supplier}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Site</span>
          <span className="font-medium text-foreground">{material.site}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Statut</span>
          <Badge variant="outline" className="text-[10px]">
            {material.status}
          </Badge>
        </div>
        {material.grade ? (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Grade</span>
            <span className="font-medium text-foreground">{material.grade}</span>
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
    </div>
  )
}

type FacetBarProps = {
  facets: SelectedFacet
  options: FacetOptions
  onToggle: (field: keyof SelectedFacet, value: string) => void
}

type FacetOptions = {
  status: string[]
  site: string[]
  supplier: string[]
  origin: string[]
  grade: string[]
}

function FacetBar({ facets, options, onToggle }: FacetBarProps) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <FacetGroup
        label="Statut"
        values={options.status}
        selected={facets.status}
        onToggle={(value) => onToggle("status", value)}
      />
      <FacetGroup
        label="Site"
        values={options.site}
        selected={facets.site}
        onToggle={(value) => onToggle("site", value)}
      />
      <FacetGroup
        label="Fournisseur"
        values={options.supplier}
        selected={facets.supplier}
        onToggle={(value) => onToggle("supplier", value)}
      />
      <FacetGroup
        label="Origine"
        values={options.origin}
        selected={facets.origin}
        onToggle={(value) => onToggle("origin", value)}
      />
      <FacetGroup
        label="Grade"
        values={options.grade}
        selected={facets.grade}
        onToggle={(value) => onToggle("grade", value)}
      />
      <Button
        size="sm"
        variant={facets.favorite ? "default" : "outline"}
        className="rounded-full px-3 text-[11px]"
        onClick={() => onToggle("favorite", facets.favorite ? "false" : "true")}
        aria-pressed={facets.favorite}
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

function buildFacetOptions(materials: RawMaterial[]): FacetOptions {
  const status = new Set<string>()
  const site = new Set<string>()
  const supplier = new Set<string>()
  const origin = new Set<string>()
  const grade = new Set<string>()

  for (const material of materials) {
    status.add(material.status)
    site.add(material.site)
    supplier.add(material.supplier)
    if (material.originCountry) origin.add(material.originCountry)
    if (material.grade) grade.add(material.grade)
  }

  const sort = (values: Set<string>) =>
    Array.from(values.values()).sort((a, b) => a.localeCompare(b, "fr"))

  return {
    status: sort(status),
    site: sort(site),
    supplier: sort(supplier),
    origin: sort(origin),
    grade: sort(grade),
  }
}

function mapFacetField(field: keyof SelectedFacet): string {
  switch (field) {
    case "status":
      return "statut"
    case "site":
      return "site"
    case "supplier":
      return "fourn"
    case "origin":
      return "origine"
    case "grade":
      return "grade"
    case "favorite":
      return "favorite"
    default:
      return field
  }
}

function quoteIfNeeded(value: string): string {
  return /\s/.test(value) ? `"${value}"` : value
}

function serializeTokenStandalone(token: ParsedToken): string {
  if (token.type === "field" && token.field) {
    const prefix = token.negated ? "-" : ""
    const needsQuotes = /\s/.test(token.value)
    return `${prefix}${token.field}:${needsQuotes ? `"${token.value}"` : token.value}`
  }
  const prefix = token.negated ? "-" : ""
  const needsQuotes = /\s/.test(token.value)
  return `${prefix}${needsQuotes ? `"${token.value}"` : token.value}`
}

function ClockIcon() {
  return <Clock className="h-3 w-3" aria-hidden="true" />
}
