"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { RMTopBar } from "@/components/rm/RMTopBar"
import { RMCommand } from "@/components/rm/RMCommand"
import { RMSectionNav } from "@/components/rm/RMSectionNav"
import { CASGrid } from "@/components/rm/CASGrid"
import { analytics } from "@/lib/rm-store"
import {
  listRecents,
  listFavorites,
  listViews,
  saveView,
  deleteView,
  recordRecent,
  toggleFavorite,
  setDensityPreference,
  getDensityPreference,
  removeRecent,
} from "@/lib/rm-store"
import type {
  RawMaterial,
  RawMaterialBookmark,
  RawMaterialSavedView,
} from "@/shared/types"
import { parseQuery, applySearch, serializeParsedQuery } from "@/lib/rm-search"
import { listRawMaterials } from "@/lib/rm-store"
import { formatDate, formatRelativeDate } from "@/shared/lib/utils"
import { Badge } from "@/shared/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { Separator } from "@/shared/ui/separator"

type RMDetailClientProps = {
  material: RawMaterial
  initialResults: RawMaterial[]
  initialOrder: string[]
  initialQuery: string
}

const DATASET = listRawMaterials()

export function RMDetailClient({
  material,
  initialResults,
  initialOrder,
  initialQuery,
}: RMDetailClientProps) {
  const router = useRouter()
  const [activeMaterial, setActiveMaterial] = React.useState(material)
  const [displayMaterial, setDisplayMaterial] = React.useState<RawMaterial | null>(null)
  const [commandOpen, setCommandOpen] = React.useState(false)
  const [currentQuery, setCurrentQuery] = React.useState(initialQuery)
  const [currentOrder, setCurrentOrder] = React.useState(initialOrder)
  const [currentResults, setCurrentResults] = React.useState(initialResults)
  const [recents, setRecents] = React.useState<RawMaterialBookmark[]>([])
  const [favorites, setFavorites] = React.useState<RawMaterialBookmark[]>([])
  const [views, setViews] = React.useState<RawMaterialSavedView[]>([])
  const [density, setDensity] = React.useState<"comfortable" | "compact">(
    getDensityPreference()
  )

  React.useEffect(() => {
    setActiveMaterial(material)
    setDisplayMaterial(null)
    recordRecent(material)
    refreshRecents()
  }, [material])

  React.useEffect(() => {
    refreshFavorites()
    refreshViews()
  }, [])

  const refreshRecents = React.useCallback(() => {
    setRecents(listRecents())
  }, [])

  const refreshFavorites = React.useCallback(() => {
    setFavorites(listFavorites())
  }, [])

  const refreshViews = React.useCallback(() => {
    setViews(listViews())
  }, [])

  const refreshBookmarks = React.useCallback(() => {
    refreshRecents()
    refreshFavorites()
  }, [refreshRecents, refreshFavorites])

  const applyQueryState = React.useCallback(
    (nextQuery: string, order: string[], results: RawMaterial[], navigateToFirst = false) => {
      setCurrentQuery(nextQuery)
      setCurrentOrder(order)
      setCurrentResults(results)
      setDisplayMaterial(null)
      const params = new URLSearchParams()
      if (nextQuery.trim().length > 0) {
        params.set("q", nextQuery.trim())
      }
      const url = params.toString()
        ? `/raw-materials/${activeMaterial.id}?${params.toString()}`
        : `/raw-materials/${activeMaterial.id}`
      router.replace(url, { scroll: false })
      if (navigateToFirst && order.length) {
        navigateToMaterial(order[0], nextQuery)
      }
    },
    [activeMaterial.id, router]
  )

  const executeSearch = React.useCallback(async (nextQuery: string) => {
    const response = await fetch(
      `/api/raw-materials/search?q=${encodeURIComponent(nextQuery.trim())}`,
      { cache: "no-store" }
    )
    if (!response.ok) {
      throw new Error("La recherche a échoué.")
    }
    return (await response.json()) as {
      items: RawMaterial[]
      order: string[]
      queryEcho: string
    }
  }, [])

  const handleQueryChange = React.useCallback(
    (nextQuery: string, order: string[], items: RawMaterial[]) => {
      applyQueryState(nextQuery, order, items)
    },
    [applyQueryState]
  )

  const navigateToMaterial = React.useCallback(
    (id: string, queryOverride?: string, options?: { newTab?: boolean }) => {
      const q = (queryOverride ?? currentQuery).trim()
      const params = new URLSearchParams()
      if (q.length > 0) params.set("q", q)
      const href = params.toString() ? `/raw-materials/${id}?${params}` : `/raw-materials/${id}`
      if (options?.newTab) {
        window.open(href, "_blank", "noopener,noreferrer")
      } else {
        router.push(href)
      }
    },
    [currentQuery, router]
  )

  const handleNavigate = React.useCallback(
    (id: string, options?: { query?: string; newTab?: boolean }) => {
      analytics("navigate_detail", { to: id })
      navigateToMaterial(id, options?.query, { newTab: options?.newTab })
    },
    [navigateToMaterial]
  )

  const handleBookmarkSelect = React.useCallback(
    (id: string, source: "recent" | "favorite") => {
      analytics("open_bookmark", { id, source })
      navigateToMaterial(id)
      setCommandOpen(false)
    },
    [navigateToMaterial]
  )

  const handleRemoveRecent = React.useCallback(
    (id: string) => {
      removeRecent(id)
      refreshRecents()
    },
    [refreshRecents]
  )

  const handleReorderFavorites = React.useCallback(() => {
    refreshFavorites()
  }, [refreshFavorites])

  const handleToggleFavorite = React.useCallback(
    async (id: string, next?: boolean) => {
      try {
        const response = await fetch(`/api/raw-materials/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ favorite: next }),
        })
        if (!response.ok) {
          throw new Error("Impossible de mettre à jour le favori.")
        }
        const updated = (await response.json()) as RawMaterial
        if (updated.id === activeMaterial.id) {
          setActiveMaterial(updated)
        }
        setCurrentResults((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item))
        )
        if (displayMaterial && displayMaterial.id === updated.id) {
          setDisplayMaterial(updated)
        }
        refreshBookmarks()
      } catch (error) {
        console.error(error)
        toast.error("Impossible de mettre à jour le favori.")
      }
    },
    [activeMaterial.id, displayMaterial, refreshBookmarks]
  )

  const handleSaveView = React.useCallback(
    (name: string) => {
      const trimmed = currentQuery.trim()
      if (!trimmed) {
        toast.error("Aucune requête à sauvegarder.")
        return
      }
      saveView({ name, query: trimmed })
      refreshViews()
      toast.success(`Vue "${name}" sauvegardée`)
    },
    [currentQuery, refreshViews]
  )

  const handleSaveViewWithQuery = React.useCallback(
    (name: string, queryValue: string) => {
      saveView({ name, query: queryValue })
      refreshViews()
      toast.success(`Vue "${name}" sauvegardée`)
    },
    [refreshViews]
  )

  const handleApplyView = React.useCallback(
    async (view: RawMaterialSavedView) => {
      try {
        const { items, order, queryEcho } = await executeSearch(view.query)
        applyQueryState(queryEcho, order, items, !order.includes(activeMaterial.id))
        setCommandOpen(false)
      } catch (error) {
        console.error(error)
        toast.error("Impossible d'appliquer la vue.")
      }
    },
    [activeMaterial.id, applyQueryState, executeSearch]
  )

  const handleDeleteView = React.useCallback(
    (id: string) => {
      deleteView(id)
      refreshViews()
      toast.success("Vue supprimée.")
    },
    [refreshViews]
  )

  const handleCompare = React.useCallback(
    (targetId?: string) => {
      const fallback = targetId ?? currentOrder.find((item) => item !== activeMaterial.id)
      const url = fallback
        ? `/raw-materials/compare?id=${activeMaterial.id}&with=${fallback}`
        : `/raw-materials/${activeMaterial.id}`
      window.open(url, "_blank", "noopener,noreferrer")
    },
    [activeMaterial.id, currentOrder]
  )

  const handleDensityChange = React.useCallback(
    (value: "comfortable" | "compact") => {
      setDensity(value)
      setDensityPreference(value)
    },
    []
  )

  const handlePeek = React.useCallback(
    (material: RawMaterial | null) => {
      setDisplayMaterial(material)
    },
    []
  )

  const handleRemoveToken = React.useCallback(
    async (tokenId: string) => {
      const nextParsed = parseQuery(currentQuery)
      const nextQuery = serializeParsedQuery(nextParsed)
      const { items, order } = applySearch(DATASET, parseQuery(nextQuery))
      applyQueryState(nextQuery, order, items)
    },
    [applyQueryState, currentQuery]
  )

  return (
    <>
      <RMTopBar
        material={activeMaterial}
        display={displayMaterial}
        query={currentQuery}
        order={currentOrder}
        density={density}
        recents={recents}
        favorites={favorites}
        views={views}
        onNavigate={handleNavigate}
        onOpenCommand={() => setCommandOpen(true)}
        onToggleFavorite={handleToggleFavorite}
        onToggleFavoriteBookmark={(id) => handleToggleFavorite(id)}
        onSelectBookmark={handleBookmarkSelect}
        onRemoveRecent={handleRemoveRecent}
        onReorderFavorites={() => handleReorderFavorites()}
        onSaveView={handleSaveView}
        onApplyView={handleApplyView}
        onDeleteView={handleDeleteView}
        onCompare={handleCompare}
        onDensityChange={handleDensityChange}
      />
      <RMCommand
        open={commandOpen}
        onOpenChange={setCommandOpen}
        query={currentQuery}
        initialResults={currentResults}
        initialOrder={currentOrder}
        recents={recents}
        favorites={favorites}
        views={views}
        density={density}
        onNavigateMaterial={(material, meta) => {
          navigateToMaterial(material.id, meta.query, { newTab: meta.newTab })
        }}
        onNavigateBookmark={(bookmark, source, meta) => {
          handleBookmarkSelect(bookmark.id, source)
        }}
        onRemoveRecent={(id) => handleRemoveRecent(id)}
        onSaveView={(name, queryValue) => handleSaveViewWithQuery(name, queryValue)}
        onApplyView={handleApplyView}
        onDeleteView={handleDeleteView}
        onToggleFavorite={(id, next) => handleToggleFavorite(id, next)}
        onQueryChange={handleQueryChange}
        onPeek={handlePeek}
        onRefreshBookmarks={refreshBookmarks}
      />
      <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 pb-16 pt-6 sm:px-6">
        <RMSectionNav />
        <main className="flex-1 space-y-12">
          <OverviewSection material={activeMaterial} />
          <GeneralSection material={activeMaterial} />
          <CompositionSection material={activeMaterial} />
          <CasSection material={activeMaterial} />
          <DocumentsSection material={activeMaterial} />
          <NotesSection material={activeMaterial} />
        </main>
      </div>
    </>
  )
}

function OverviewSection({ material }: { material: RawMaterial }) {
  return (
    <section id="overview" aria-labelledby="overview-title" className="space-y-4">
      <div>
        <h2 id="overview-title" className="text-2xl font-semibold text-foreground">
          Aperçu
        </h2>
        <p className="text-sm text-muted-foreground">
          Résumé des informations clés de la matière première.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Statut</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <Badge className="text-sm">{material.status}</Badge>
            <span className="text-xs text-muted-foreground">
              Mis à jour {formatRelativeDate(material.updatedAt)}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Fournisseur</CardTitle>
          </CardHeader>
          <CardContent className="text-sm font-semibold text-foreground">
            {material.supplier}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Site de référence</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-sm">
            <Badge variant="outline">{material.site}</Badge>
            <span>{material.productionSiteName ?? "Site principal"}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Documents</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <span className="font-semibold text-foreground">{material.documentsCount ?? 0}</span>{" "}
            document(s) disponible(s)
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Certifications</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <span className="font-semibold text-foreground">
              {material.certificationsCount ?? 0}
            </span>{" "}
            certification(s) associée(s)
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Code MP</CardTitle>
          </CardHeader>
          <CardContent className="text-sm font-semibold text-foreground">
            {material.code}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

function GeneralSection({ material }: { material: RawMaterial }) {
  return (
    <section id="general" aria-labelledby="general-title" className="space-y-4">
      <div>
        <h2 id="general-title" className="text-2xl font-semibold text-foreground">
          Général
        </h2>
        <p className="text-sm text-muted-foreground">
          Identité et informations principales de la matière première.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <InfoRow label="Nom commercial" value={material.commercialName} />
        <InfoRow label="Code MP" value={material.code} />
        <InfoRow label="INCI" value={material.inci} />
        <InfoRow label="Fournisseur" value={material.supplier} />
        <InfoRow label="Site" value={material.site} />
        <InfoRow label="Dernière mise à jour" value={formatRelativeDate(material.updatedAt)} />
      </div>
    </section>
  )
}

function CompositionSection({ material }: { material: RawMaterial }) {
  const expiration =
    material.expirationDate && !Number.isNaN(Date.parse(material.expirationDate))
      ? formatDate(material.expirationDate)
      : "—"
  return (
    <section id="composition" aria-labelledby="composition-title" className="space-y-4">
      <div>
        <h2 id="composition-title" className="text-2xl font-semibold text-foreground">
          Composition &amp; Spécifications
        </h2>
        <p className="text-sm text-muted-foreground">
          Grade, origine, et points de vigilance réglementaires.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <InfoRow label="Grade" value={material.grade ?? "Non renseigné"} />
        <InfoRow label="Pays d’origine" value={material.originCountry ?? "Non renseigné"} />
        <InfoRow label="Lot" value={material.lot ?? "—"} />
        <InfoRow label="Date d’expiration" value={expiration} />
        <InfoRow label="IFRA" value={material.ifraCategory ?? "Non applicable"} />
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Allergènes</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {material.allergens?.length ? (
              material.allergens.map((allergen) => (
                <Badge key={allergen} variant="outline" className="text-[11px]">
                  {allergen}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">Aucun allergène déclaré</span>
            )}
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Risques</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {material.risks?.length ? (
              material.risks.map((risk) => (
                <Badge key={risk} variant="destructive" className="text-[11px]">
                  {risk}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">Aucun signalement actif</span>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function CasSection({ material }: { material: RawMaterial }) {
  return (
    <section id="cas" aria-labelledby="cas-title" className="space-y-4">
      <div>
        <h2 id="cas-title" className="text-2xl font-semibold text-foreground">
          CAS / EINECS
        </h2>
        <p className="text-sm text-muted-foreground">
          Gestion des couplages CAS ↔ EINECS avec validation automatique et contrôle des doublons.
        </p>
      </div>
      <CASGrid materialId={material.id} initialPairs={material.casEcPairs} />
    </section>
  )
}

function DocumentsSection({ material }: { material: RawMaterial }) {
  return (
    <section id="documents" aria-labelledby="documents-title" className="space-y-4">
      <div>
        <h2 id="documents-title" className="text-2xl font-semibold text-foreground">
          Documents &amp; Certifs
        </h2>
        <p className="text-sm text-muted-foreground">
          Derniers documents de conformité et certificats associés.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-muted-foreground">
            Synthèse documentaire
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span>Documents disponibles</span>
            <Badge variant="secondary">{material.documentsCount ?? 0}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Certifications</span>
            <Badge variant="secondary">{material.certificationsCount ?? 0}</Badge>
          </div>
          <Separator />
          <p className="text-xs text-muted-foreground">
            L’intégration documentaire est simulée pour la démonstration. Les actions de
            téléchargement peuvent être branchées sur le back-office.
          </p>
        </CardContent>
      </Card>
    </section>
  )
}

function NotesSection({ material }: { material: RawMaterial }) {
  const notes = material.notes ?? []
  return (
    <section id="notes" aria-labelledby="notes-title" className="space-y-4">
      <div>
        <h2 id="notes-title" className="text-2xl font-semibold text-foreground">
          Notes &amp; Historique
        </h2>
        <p className="text-sm text-muted-foreground">
          Fil d’activité consolidé pour les équipes R&amp;D, Qualité et Réglementaire.
        </p>
      </div>
      {notes.length ? (
        <div className="space-y-4">
          {notes.map((note) => (
            <Card key={note.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-foreground">
                  {note.createdBy}
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  {formatRelativeDate(note.createdAt)}
                </p>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-foreground">
                <p>{note.content}</p>
                {note.attachments?.length ? (
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p className="font-semibold uppercase">Pièces jointes</p>
                    <ul className="space-y-1">
                      {note.attachments.map((attachment) => (
                        <li key={attachment.id} className="flex items-center justify-between">
                          <span>{attachment.name}</span>
                          {attachment.size ? (
                            <span className="text-muted-foreground">{attachment.size}</span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-6 text-sm text-muted-foreground">
            Aucune note disponible pour cette matière première.
          </CardContent>
        </Card>
      )}
    </section>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm text-foreground">{value}</p>
    </div>
  )
}
