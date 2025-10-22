"use client"

import * as React from "react"
import {
  ChevronLeft,
  ChevronRight,
  GitCompare,
  History,
  Menu,
  List,
  ListFilter,
  Search,
  Star,
} from "lucide-react"

import { RMRecentFavorites } from "@/components/rm/RMRecentFavorites"
import type {
  RawMaterial,
  RawMaterialBookmark,
  RawMaterialSavedView,
} from "@/shared/types"
import { Button } from "@/shared/ui/button"
import { Badge } from "@/shared/ui/badge"
import { Separator } from "@/shared/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/ui/tooltip"
import { cn, formatRelativeDate } from "@/shared/lib/utils"
import { analytics } from "@/lib/rm-store"

type RMTopBarProps = {
  material: RawMaterial
  query: string
  order: string[]
  density: "comfortable" | "compact"
  recents: RawMaterialBookmark[]
  favorites: RawMaterialBookmark[]
  views: RawMaterialSavedView[]
  onNavigate: (id: string, options?: { query?: string; newTab?: boolean }) => void
  onOpenCommand: () => void
  onToggleFavorite: () => Promise<void> | void
  onToggleFavoriteBookmark: (id: string) => void
  onSelectBookmark: (id: string, source: "recent" | "favorite") => void
  onRemoveRecent: (id: string) => void
  onReorderFavorites: (ids: string[]) => void
  onSaveView: (name: string) => void
  onApplyView: (view: RawMaterialSavedView) => void
  onDeleteView: (id: string) => void
  onCompare: (targetId?: string) => void
  onDensityChange: (value: "comfortable" | "compact") => void
}

export function RMTopBar({
  material,
  query,
  order,
  density,
  recents,
  favorites,
  views,
  onNavigate,
  onOpenCommand,
  onToggleFavorite,
  onSelectBookmark,
  onRemoveRecent,
  onReorderFavorites,
  onSaveView,
  onApplyView,
  onDeleteView,
  onCompare,
  onDensityChange,
  onToggleFavoriteBookmark,
}: RMTopBarProps) {
  const prevId = React.useMemo(() => {
    const index = order.indexOf(material.id)
    return index > 0 ? order[index - 1] : undefined
  }, [material.id, order])

  const nextId = React.useMemo(() => {
    const index = order.indexOf(material.id)
    return index !== -1 && index < order.length - 1 ? order[index + 1] : undefined
  }, [material.id, order])

  const handlePrev = () => {
    if (!prevId) return
    analytics("navigate_prev", { from: material.id, to: prevId })
    onNavigate(prevId, { query })
  }

  const handleNext = () => {
    if (!nextId) return
    analytics("navigate_next", { from: material.id, to: nextId })
    onNavigate(nextId, { query })
  }

  const handleSaveView = () => {
    const defaultName = `${material.status} • ${material.site}`
    const name = window.prompt("Nom de la vue à enregistrer :", defaultName)
    if (!name) return
    onSaveView(name)
    analytics("save_view", { name, query })
  }

  const handleApplyView = (view: RawMaterialSavedView) => {
    onApplyView(view)
    analytics("open_view", { id: view.id })
  }

  const handleToggleFavorite = () => {
    onToggleFavorite()
    analytics("toggle_favorite", { id: material.id, next: !material.favorite })
  }

  const handleCompare = () => {
    const fallback = nextId ?? prevId
    onCompare(fallback)
    analytics("compare_click", { id: material.id, with: fallback })
  }

  const handleDensityToggle = () => {
    const next = density === "comfortable" ? "compact" : "comfortable"
    onDensityChange(next)
    analytics("toggle_density", { density: next })
  }

  return (
    <div className="border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-[60px] max-w-7xl items-center gap-3 px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Matière précédente"
            disabled={!prevId}
            onClick={handlePrev}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Matière suivante"
            disabled={!nextId}
            onClick={handleNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex min-w-0 items-center gap-2">
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant="outline"
                    className="shrink-0 border border-primary/30 bg-primary/10 text-xs font-semibold uppercase tracking-wide text-primary"
                  >
                    {material.status}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>Statut de la matière première</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="truncate text-sm font-semibold text-foreground sm:text-base">
                    {material.commercialName}
                  </span>
                </TooltipTrigger>
                <TooltipContent>{material.commercialName}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Separator orientation="vertical" className="hidden h-4 sm:block" />
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="hidden truncate text-xs text-muted-foreground sm:inline-flex">
                    {material.inci}
                  </span>
                </TooltipTrigger>
                <TooltipContent>{material.inci}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground sm:text-xs">
            <span className="truncate">
              <strong>Site</strong> {material.site}
            </span>
            <span className="hidden truncate sm:inline">
              <strong>Fournisseur</strong> {material.supplier}
            </span>
            <span className="truncate">
              <strong>Mis à jour</strong> {formatRelativeDate(material.updatedAt)}
            </span>
            {material.grade ? (
              <span className="hidden truncate md:inline">
                <strong>Grade</strong> {material.grade}
              </span>
            ) : null}
          </div>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <Button
            variant={material.favorite ? "default" : "ghost"}
            size="icon"
            aria-label={material.favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
            onClick={handleToggleFavorite}
          >
            <Star className={cn("h-4 w-4", material.favorite && "fill-current")} />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              analytics("open_palette", { query })
              onOpenCommand()
            }}
            aria-haspopup="dialog"
            className="hidden items-center gap-2 sm:inline-flex"
          >
            <Search className="h-4 w-4" />
            <span>Rechercher</span>
            <kbd className="hidden rounded bg-muted px-1 py-[2px] text-[10px] font-medium text-muted-foreground md:inline">
              ⌘K
            </kbd>
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <History className="h-4 w-4" />
                Historique
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="p-0 shadow-lg">
              <RMRecentFavorites
                recents={recents}
                favorites={favorites}
                onSelect={onSelectBookmark}
                onToggleFavorite={(id) => {
                  onToggleFavoriteBookmark(id)
                  analytics("toggle_favorite_shortcut", { id })
                }}
                onRemoveRecent={onRemoveRecent}
                onReorderFavorites={onReorderFavorites}
              />
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <Menu className="h-4 w-4" />
                Vues
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel>Vues sauvegardées</DropdownMenuLabel>
              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault()
                  handleSaveView()
                }}
              >
                Sauvegarder la requête actuelle…
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {views.length === 0 ? (
                <DropdownMenuItem disabled>Aucune vue enregistrée</DropdownMenuItem>
              ) : (
                views.map((view) => (
                  <DropdownMenuSub key={view.id}>
                    <DropdownMenuSubTrigger>
                      <span className="truncate font-medium">{view.name}</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem
                        onSelect={(event) => {
                          event.preventDefault()
                          handleApplyView(view)
                        }}
                      >
                        Appliquer
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={(event) => {
                          event.preventDefault()
                          onDeleteView(view.id)
                          analytics("delete_view", { id: view.id })
                        }}
                      >
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="sm" className="gap-2" onClick={handleCompare}>
            <GitCompare className="h-4 w-4" />
            Comparer
          </Button>

          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Changer la densité d’affichage"
                  onClick={handleDensityToggle}
                >
                  {density === "comfortable" ? (
                    <List className="h-4 w-4" />
                  ) : (
                    <ListFilter className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Basculer en mode {density === "comfortable" ? "compact" : "confort"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Rechercher"
            onClick={() => {
              analytics("open_palette_mobile", { query })
              onOpenCommand()
            }}
          >
            <Search className="h-4 w-4" />
          </Button>
          <Button
            variant={material.favorite ? "default" : "ghost"}
            size="icon"
            aria-label={material.favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
            onClick={handleToggleFavorite}
          >
            <Star className={cn("h-4 w-4", material.favorite && "fill-current")} />
          </Button>
        </div>
      </div>
    </div>
  )
}
