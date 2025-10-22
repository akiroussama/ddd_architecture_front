import { notFound } from "next/navigation"

import { RMTopBar } from "@/components/rm/RMTopBar"
import { RMSectionNav } from "@/components/rm/RMSectionNav"
import { CASGrid } from "@/components/rm/CASGrid"
import { applySearch, parseQuery } from "@/lib/rm-search"
import { getRawMaterial, listRawMaterials } from "@/lib/rm-store"
import type { RawMaterial } from "@/shared/types"
import { formatDate, formatRelativeDate } from "@/shared/lib/utils"
import { Badge } from "@/shared/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { Separator } from "@/shared/ui/separator"

type PageProps = {
  params: { id: string }
  searchParams: { q?: string }
}

export default function RawMaterialDetailPage({ params, searchParams }: PageProps) {
  const query = typeof searchParams.q === "string" ? searchParams.q : ""
  const material = getRawMaterial(params.id)

  if (!material) {
    notFound()
  }

  const dataset = listRawMaterials()
  const parsed = parseQuery(query)
  const searchResults = applySearch(dataset, parsed)
  const orderedIds = (query ? searchResults : dataset).map((item) => item.id)
  const initialItems = (query ? searchResults : dataset).slice(0, 40)

  return (
    <>
      <RMTopBar
        current={material}
        query={query}
        order={orderedIds}
        initialItems={initialItems}
      />
      <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 pb-16 pt-6 sm:px-6">
        <RMSectionNav rightRail={<RightRail material={material} />} />
        <main className="flex-1 space-y-12">
          <OverviewSection material={material} />
          <GeneralSection material={material} />
          <CompositionSection material={material} />
          <CasSection material={material} />
          <DocumentsSection material={material} />
          <NotesSection material={material} />
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

function RightRail({ material }: { material: RawMaterial }) {
  const expiration =
    material.expirationDate && !Number.isNaN(Date.parse(material.expirationDate))
      ? formatDate(material.expirationDate)
      : "—"
  return (
    <aside className="sticky top-[88px] hidden w-[260px] flex-none xl:block">
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              Activité récente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Mise à jour</span>
              <span className="font-medium text-foreground">
                {formatRelativeDate(material.updatedAt)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Dernier lot</span>
              <span className="font-medium text-foreground">{material.lot ?? "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Expiration</span>
              <span className="font-medium text-foreground">
                {expiration}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              Résumé risques
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {material.risks?.length ? (
              material.risks.map((risk) => (
                <Badge key={risk} variant="destructive" className="text-[11px]">
                  {risk}
                </Badge>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">Pas de risque déclaré</span>
            )}
          </CardContent>
        </Card>
      </div>
    </aside>
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
