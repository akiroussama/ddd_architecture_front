"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  History,
  Search,
  Star,
} from "lucide-react"
import { toast } from "sonner"

import { RMCommand, type RMCommandSavedView } from "@/components/rm/RMCommand"
import type { RawMaterial, RMStatus } from "@/shared/types"
import { Button } from "@/shared/ui/button"
import { Badge } from "@/shared/ui/badge"
import { Separator } from "@/shared/ui/separator"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui/popover"
import { ScrollArea } from "@/shared/ui/scroll-area"
import { cn } from "@/shared/lib/utils"

type HistoryEntry = {
  id: string
  commercialName: string
  code: string
  site: string
  status: RMStatus
  inci: string
  supplier?: string
}

type RMTopBarProps = {
  current: RawMaterial
  query: string
  order: string[]
  initialItems?: RawMaterial[]
}

const STORAGE_KEYS = {
  recents: "gg:rm:recents",
  favorites: "gg:rm:favorites",
  views: "gg:rm:views",
}

const DEFAULT_VIEWS: RMCommandSavedView[] = [
  {
    id: "view-approved-fr",
    name: "Approuvées France",
    query: 'statut:"Approuvé" site:FR',
    description: "Matières approuvées sur sites FR",
  },
  {
    id: "view-restricted-alert",
    name: "Restreintes",
    query: "statut:Restreint",
    description: "Suivi des matières restreintes",
  },
  {
    id: "view-favorites",
    name: "Favoris",
    query: "favoris:true",
    description: "Sélection personnelle",
  },
]

const RECENTS_LIMIT = 15
const FAVORITES_LIMIT = 50

export function RMTopBar({ current, query, order, initialItems = [] }: RMTopBarProps) {
  const router = useRouter()
  const pathname = usePathname()

  const [isCommandOpen, setIsCommandOpen] = React.useState(false)
  const [recents, setRecents] = React.useState<HistoryEntry[]>([])
  const [favorites, setFavorites] = React.useState<HistoryEntry[]>([])
  const [views, setViews] = React.useState<RMCommandSavedView[]>([])
  const [isHydrated, setIsHydrated] = React.useState(false)

  const navigationOrder = React.useMemo(() => {
    if (order.includes(current.id)) return order
    return [current.id, ...order]
  }, [current.id, order])

  const currentIndex = navigationOrder.indexOf(current.id)
  const prevId = currentIndex > 0 ? navigationOrder[currentIndex - 1] : undefined
  const nextId =
    currentIndex >= 0 && currentIndex < navigationOrder.length - 1
      ? navigationOrder[currentIndex + 1]
      : undefined

  const isFavorite = favorites.some((item) => item.id === current.id)

  React.useEffect(() => {
    const loadStorage = () => {
      try {
        const recentsRaw = localStorage.getItem(STORAGE_KEYS.recents)
        const favoritesRaw = localStorage.getItem(STORAGE_KEYS.favorites)
        const viewsRaw = localStorage.getItem(STORAGE_KEYS.views)

        if (recentsRaw) {
          setRecents(safelyParse<HistoryEntry[]>(recentsRaw))
        }
        if (favoritesRaw) {
          setFavorites(safelyParse<HistoryEntry[]>(favoritesRaw))
        }
        if (viewsRaw) {
          const parsed = safelyParse<RMCommandSavedView[]>(viewsRaw)
          setViews(mergeDefaultViews(parsed))
        } else {
          setViews(DEFAULT_VIEWS)
        }
      } catch (error) {
        console.error("Failed to parse RM storage", error)
        setViews(DEFAULT_VIEWS)
      } finally {
        setIsHydrated(true)
      }
    }

    loadStorage()
  }, [])

  React.useEffect(() => {
    if (!isHydrated) return
    const entry = materialToEntry(current)

    setRecents((previous) => {
      const updated = [entry, ...previous.filter((item) => item.id !== entry.id)].slice(
        0,
        RECENTS_LIMIT
      )
      localStorage.setItem(STORAGE_KEYS.recents, JSON.stringify(updated))
      return updated
    })
  }, [current, isHydrated])

  React.useEffect(() => {
    if (!isHydrated || !current.favorite) return
    const entry = materialToEntry(current)
    setFavorites((previous) => {
      if (previous.some((item) => item.id === entry.id)) return previous
      const updated = [entry, ...previous].slice(0, FAVORITES_LIMIT)
      localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(updated))
      return updated
    })
  }, [current, isHydrated])

  React.useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLElement &&
        ["INPUT", "TEXTAREA"].includes(event.target.tagName)
      ) {
        return
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setIsCommandOpen((prev) => !prev)
      }

      if (event.key === "[" && prevId) {
        event.preventDefault()
        navigate(prevId, query)
      }

      if (event.key === "]" && nextId) {
        event.preventDefault()
        navigate(nextId, query)
      }
    }

    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  })

  const navigate = React.useCallback(
    (id: string, q: string, options?: { newTab?: boolean }) => {
      const search = q ? `?q=${encodeURIComponent(q)}` : ""
      const href = `/raw-materials/${id}${search}`

      if (options?.newTab) {
        window.open(href, "_blank", "noopener,noreferrer")
        return
      }

      if (pathname === `/raw-materials/${id}` && q === query) {
        router.replace(href)
      } else {
        router.push(href)
      }
    },
    [pathname, query, router]
  )

  const toggleFavorite = React.useCallback(() => {
    const entry = materialToEntry(current)
    setFavorites((previous) => {
      const exists = previous.some((item) => item.id === entry.id)
      const updated = exists
        ? previous.filter((item) => item.id !== entry.id)
        : [entry, ...previous].slice(0, FAVORITES_LIMIT)
      localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(updated))
      toast.success(
        exists ? "Retiré des favoris" : `${current.commercialName} ajouté aux favoris`
      )
      return updated
    })
  }, [current])

  const runSearch = React.useCallback(
    async (
      searchQuery: string,
      facets?: URLSearchParams | Record<string, string | string[] | undefined>
    ) => {
      const params =
        facets instanceof URLSearchParams ? new URLSearchParams(facets) : new URLSearchParams()

      if (!(facets instanceof URLSearchParams) && facets) {
        Object.entries(facets).forEach(([key, value]) => {
          if (!value) return
          if (Array.isArray(value)) {
            value.forEach((item) => params.append(key, item))
          } else {
            params.append(key, value)
          }
        })
      }

      params.set("q", searchQuery)
      const response = await fetch(`/api/raw-materials/search?${params.toString()}`)
      if (!response.ok) {
        throw new Error("Impossible d'exécuter la recherche")
      }
      return (await response.json()) as {
        items: RawMaterial[]
        order: string[]
        total: number
        query: string
      }
    },
    []
  )

  const handleApplyView = React.useCallback(
    async (view: RMCommandSavedView) => {
      try {
        const result = await runSearch(view.query)
        if (!result.items.length) {
          toast.info("Aucun résultat pour cette vue sauvegardée")
          return
        }
        navigate(result.items[0].id, view.query)
      } catch (error) {
        console.error(error)
        toast.error("Impossible d'appliquer la vue")
      }
    },
    [navigate, runSearch]
  )

  const handleSaveView = React.useCallback(
    (view: RMCommandSavedView) => {
      setViews((previous) => {
        const next = mergeDefaultViews([view, ...previous.filter((v) => v.id !== view.id)])
        localStorage.setItem(STORAGE_KEYS.views, JSON.stringify(next))
        toast.success(`Vue "${view.name}" enregistrée`)
        return next
      })
    },
    []
  )

  return (
    <>
      <div className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-[60px] max-w-7xl items-center gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Matière précédente"
              disabled={!prevId}
              onClick={() => prevId && navigate(prevId, query)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Matière suivante"
              disabled={!nextId}
              onClick={() => nextId && navigate(nextId, query)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex min-w-0 flex-1 items-center gap-3 rounded-md border border-border bg-muted/50 px-3 py-2">
            <div className="flex flex-1 items-center gap-3">
              <Badge variant="outline" className="shrink-0 text-xs uppercase">
                {current.status}
              </Badge>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {current.commercialName}
                  </p>
                  <Badge variant="secondary" className="font-normal">
                    {current.site}
                  </Badge>
                </div>
                <p className="truncate text-xs text-muted-foreground">{current.inci}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={isFavorite ? "default" : "ghost"}
                size="icon"
                aria-pressed={isFavorite}
                aria-label={
                  isFavorite
                    ? "Retirer des favoris"
                    : "Ajouter aux favoris (disponible dans le menu favoris)"
                }
                onClick={toggleFavorite}
              >
                <Star className={cn("h-4 w-4", isFavorite && "fill-current")} />
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:inline-flex"
                onClick={() => setIsCommandOpen(true)}
              >
                <Search className="mr-2 h-4 w-4" />
                <span>Rechercher</span>
                <kbd className="ml-2 hidden rounded bg-muted px-1 py-[2px] text-[10px] font-medium text-muted-foreground md:inline-block">
                  ⌘K
                </kbd>
              </Button>
            </div>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            {views.slice(0, 3).map((view) => (
              <Button
                key={view.id}
                variant="ghost"
                size="sm"
                className="rounded-full bg-transparent text-xs"
                onClick={() => handleApplyView(view)}
              >
                {view.name}
              </Button>
            ))}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <History className="h-4 w-4" />
                  Récents
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-0">
                <div className="border-b border-border px-3 py-2 text-xs font-semibold text-muted-foreground">
                  Dernières matières & favoris
                </div>
                <ScrollArea className="h-64">
                  <div className="px-3 py-2">
                    <SectionList
                      title="Récents"
                      items={recents.slice(0, 5)}
                      onSelect={(item) => navigate(item.id, query)}
                    />
                    <SectionList
                      title="Favoris"
                      emptyHint="Ajoutez des favoris pour y accéder rapidement."
                      items={favorites.slice(0, 8)}
                      onSelect={(item) => navigate(item.id, query)}
                    />
                  </div>
                </ScrollArea>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      <RMCommand
        open={isCommandOpen}
        onOpenChange={setIsCommandOpen}
        query={query}
        initialItems={initialItems}
        onSelect={(item, options) => navigate(item.id, options?.query ?? query, options)}
        savedViews={views}
        onApplyView={handleApplyView}
        onSaveView={handleSaveView}
        favorites={favorites}
        recents={recents}
        runSearch={runSearch}
      />
    </>
  )
}

type SectionListProps = {
  title: string
  items: HistoryEntry[]
  onSelect: (item: HistoryEntry) => void
  emptyHint?: string
}

function SectionList({ title, items, onSelect, emptyHint }: SectionListProps) {
  return (
    <div className="mb-4">
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </div>
      {items.length ? (
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onSelect(item)}
                className="w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">{item.commercialName}</span>
                  <Badge variant="outline" className="text-[10px]">
                    {item.site}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{item.inci}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {item.status}
                  </span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      ) : emptyHint ? (
        <p className="text-xs text-muted-foreground">{emptyHint}</p>
      ) : null}
    </div>
  )
}

function materialToEntry(material: RawMaterial): HistoryEntry {
  return {
    id: material.id,
    commercialName: material.commercialName,
    code: material.code,
    site: material.site,
    status: material.status,
    inci: material.inci,
    supplier: material.supplier,
  }
}

function safelyParse<T>(value: string): T {
  try {
    return JSON.parse(value) as T
  } catch {
    return [] as unknown as T
  }
}

function mergeDefaultViews(views: RMCommandSavedView[]): RMCommandSavedView[] {
  const map = new Map<string, RMCommandSavedView>()
  DEFAULT_VIEWS.forEach((view) => map.set(view.id, view))
  views.forEach((view) => map.set(view.id, view))
  return Array.from(map.values())
}

export type RMHistoryEntry = HistoryEntry
