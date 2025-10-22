"use client"

import * as React from "react"
import { Clock, Star, GripVertical, Trash2, ArrowUp, ArrowDown } from "lucide-react"

import type { RawMaterialBookmark } from "@/shared/types"
import { Button } from "@/shared/ui/button"
import { Badge } from "@/shared/ui/badge"
import { ScrollArea } from "@/shared/ui/scroll-area"
import { cn, formatRelativeDate } from "@/shared/lib/utils"
import { analytics } from "@/lib/rm-store"

type RMRecentFavoritesProps = {
  recents: RawMaterialBookmark[]
  favorites: RawMaterialBookmark[]
  onSelect: (id: string, source: "recent" | "favorite") => void
  onToggleFavorite: (id: string) => void
  onRemoveRecent: (id: string) => void
  onReorderFavorites: (ids: string[]) => void
}

export function RMRecentFavorites({
  recents,
  favorites,
  onSelect,
  onToggleFavorite,
  onRemoveRecent,
  onReorderFavorites,
}: RMRecentFavoritesProps) {
  const [draggingId, setDraggingId] = React.useState<string | null>(null)
  const [dragOverId, setDragOverId] = React.useState<string | null>(null)

  const handleDragStart = (event: React.DragEvent<HTMLLIElement>, id: string) => {
    event.dataTransfer.effectAllowed = "move"
    setDraggingId(id)
  }

  const handleDragOver = (event: React.DragEvent<HTMLLIElement>, id: string) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
    if (dragOverId !== id) {
      setDragOverId(id)
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLLIElement>, targetId: string) => {
    event.preventDefault()
    if (!draggingId || draggingId === targetId) {
      setDraggingId(null)
      setDragOverId(null)
      return
    }

    const currentOrder = favorites.map((fav) => fav.id)
    const nextOrder = reorderList(currentOrder, draggingId, targetId)
    onReorderFavorites(nextOrder)
    analytics("reorder_favorite", { targetId, draggingId })
    setDraggingId(null)
    setDragOverId(null)
  }

  const handleKeyboardReorder = (id: string, direction: "up" | "down") => {
    const order = favorites.map((fav) => fav.id)
    const index = order.indexOf(id)
    if (index === -1) return
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= order.length) return

    const nextOrder = [...order]
    const [moved] = nextOrder.splice(index, 1)
    nextOrder.splice(targetIndex, 0, moved)
    onReorderFavorites(nextOrder)
    analytics("reorder_favorite_keyboard", { id, direction })
  }

  return (
    <div className="w-80">
      <ScrollArea className="max-h-[340px]">
        <section aria-label="Récents" className="px-3 py-2">
          <header className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Récents
            </h3>
            <span className="text-[11px] text-muted-foreground">
              {recents.length} élément{recents.length > 1 ? "s" : ""}
            </span>
          </header>
          <ul className="space-y-1.5">
            {recents.length === 0 ? (
              <li className="rounded-md border border-dashed border-muted px-3 py-4 text-center text-xs text-muted-foreground">
                Les matières consultées récemment apparaîtront ici.
              </li>
            ) : (
              recents.map((recent) => (
                <li
                  key={recent.id}
                  className="group flex items-start justify-between rounded-md border border-transparent px-2 py-1.5 hover:border-border hover:bg-muted focus-within:border-border"
                >
                  <button
                    type="button"
                    onClick={() => {
                      analytics("open_recent", { id: recent.id })
                      onSelect(recent.id, "recent")
                    }}
                    className="flex flex-1 flex-col text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="text-sm font-semibold text-foreground">
                      {recent.commercialName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {recent.inci} · {recent.site}
                    </span>
                    <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatRelativeDate(recent.timestamp)}
                    </span>
                  </button>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      aria-label="Retirer des récents"
                      onClick={() => onRemoveRecent(recent.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </li>
              ))
            )}
          </ul>
        </section>

        <section aria-label="Favoris" className="px-3 py-2">
          <header className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Favoris
            </h3>
            <span className="text-[11px] text-muted-foreground">
              {favorites.length} élément{favorites.length > 1 ? "s" : ""}
            </span>
          </header>
          <ul className="space-y-1.5">
            {favorites.length === 0 ? (
              <li className="rounded-md border border-dashed border-muted px-3 py-4 text-center text-xs text-muted-foreground">
                Marquez une matière en favori pour l’ajouter à cette liste.
              </li>
            ) : (
              favorites.map((favorite) => {
                const isDragging = draggingId === favorite.id
                const isDragOver = dragOverId === favorite.id
                return (
                  <li
                    key={favorite.id}
                    draggable
                    onDragStart={(event) => handleDragStart(event, favorite.id)}
                    onDragOver={(event) => handleDragOver(event, favorite.id)}
                    onDrop={(event) => handleDrop(event, favorite.id)}
                    onDragEnd={() => {
                      setDraggingId(null)
                      setDragOverId(null)
                    }}
                    className={cn(
                      "group flex items-center gap-2 rounded-md border px-2 py-1.5 transition",
                      isDragging && "opacity-50",
                      isDragOver && !isDragging && "border-primary bg-primary/5"
                    )}
                  >
                    <span className="flex items-center text-muted-foreground">
                      <GripVertical className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        analytics("open_favorite", { id: favorite.id })
                        onSelect(favorite.id, "favorite")
                      }}
                      className="flex flex-1 flex-col text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span className="text-sm font-semibold text-foreground">
                        {favorite.commercialName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {favorite.inci} · {favorite.site}
                      </span>
                    </button>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        aria-label="Déplacer vers le haut"
                        onClick={() => handleKeyboardReorder(favorite.id, "up")}
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        aria-label="Déplacer vers le bas"
                        onClick={() => handleKeyboardReorder(favorite.id, "down")}
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-primary hover:text-primary"
                        aria-label="Ouvrir le favori"
                        onClick={() => {
                          analytics("open_favorite_star", { id: favorite.id })
                          onSelect(favorite.id, "favorite")
                        }}
                      >
                        <Star className="h-3.5 w-3.5 fill-current" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        aria-label="Retirer des favoris"
                        onClick={() => onToggleFavorite(favorite.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </li>
                )
              })
            )}
          </ul>
        </section>
      </ScrollArea>
      <div className="border-t border-border px-3 py-2">
        <Badge variant="outline" className="text-[11px] uppercase tracking-wide">
          Glissez-déposez pour réordonner vos favoris
        </Badge>
      </div>
    </div>
  )
}

function reorderList(order: string[], draggingId: string, targetId: string): string[] {
  const current = [...order]
  const fromIndex = current.indexOf(draggingId)
  const toIndex = current.indexOf(targetId)
  if (fromIndex === -1 || toIndex === -1) return current

  const [moved] = current.splice(fromIndex, 1)
  current.splice(toIndex, 0, moved)
  return current
}
