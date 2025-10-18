"use client"

import * as React from "react"
import { ArrowLeft, BookOpen, CheckCircle, FileText, Globe, MapPin, Pencil } from "lucide-react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

import type { InciEntry } from "@/types"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"

interface InciDetailViewProps {
  entry: InciEntry
  onUpdate?: (updatedEntry: InciEntry) => void
}

const inciFormSchema = z.object({
  name: z.string().min(1, "Le nom INCI est requis"),
  annexReference: z.string().optional(),
  usMonograph: z.string().optional(),
  euInventorySource: z.string().min(1, "La source inventaire UE est requise"),
  usInventorySource: z.string().min(1, "La source inventaire US est requise"),
  comment: z.string().optional(),
})

type InciFormValues = z.infer<typeof inciFormSchema>

export function InciDetailView({ entry: initialEntry, onUpdate }: InciDetailViewProps) {
  const router = useRouter()
  const [entry, setEntry] = React.useState<InciEntry>(initialEntry)
  const [isEditing, setIsEditing] = React.useState(false)

  const form = useForm<InciFormValues>({
    resolver: zodResolver(inciFormSchema),
    defaultValues: {
      name: entry.name,
      annexReference: entry.annexReference || "",
      usMonograph: entry.usMonograph || "",
      euInventorySource: entry.euInventorySource,
      usInventorySource: entry.usInventorySource,
      comment: entry.comment || "",
    },
  })

  const handleEdit = () => {
    form.reset({
      name: entry.name,
      annexReference: entry.annexReference || "",
      usMonograph: entry.usMonograph || "",
      euInventorySource: entry.euInventorySource,
      usInventorySource: entry.usInventorySource,
      comment: entry.comment || "",
    })
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    form.reset()
  }

  const handleSave = (data: InciFormValues) => {
    const timestamp = new Date().toISOString()
    const updatedEntry: InciEntry = {
      ...entry,
      name: data.name.trim(),
      annexReference: data.annexReference?.trim() || undefined,
      usMonograph: data.usMonograph?.trim() || undefined,
      euInventorySource: data.euInventorySource.trim(),
      usInventorySource: data.usInventorySource.trim(),
      comment: data.comment?.trim() || undefined,
      updatedAt: timestamp,
      updatedBy: "Marie Dubois",
    }

    setEntry(updatedEntry)
    setIsEditing(false)

    if (onUpdate) {
      onUpdate(updatedEntry)
    }

    toast.success("INCI mis à jour avec succès", {
      icon: <CheckCircle className="h-5 w-5 text-primary" />,
    })
  }

  return (
    <>
      <div className="flex min-h-full flex-col gap-6">
        {/* Header with back button and title */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/inci")}
              className="w-fit gap-2 text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour au référentiel
            </Button>
            <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-bold text-slate-900">{entry.name}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>ID: {entry.id}</span>
                <span>•</span>
                <span>
                  Mis à jour le {format(new Date(entry.updatedAt), "d MMMM yyyy", { locale: fr })}
                </span>
              </div>
            </div>
          </div>
          <Button onClick={handleEdit} className="gap-2">
            <Pencil className="h-4 w-4" />
            Modifier
          </Button>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Inventaire UE
              </CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-base font-semibold text-slate-900">
                {entry.euInventorySource}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Inventaire US
              </CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-base font-semibold text-slate-900">
                {entry.usInventorySource}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Annexe Réglementaire
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-base font-semibold text-slate-900">
                {entry.annexReference || "—"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Monographie US
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-base font-semibold text-slate-900">
                {entry.usMonograph || "—"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Main Info */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            {/* Regulatory Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-primary" />
                  Informations réglementaires
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Nom INCI
                    </p>
                    <p className="text-sm font-medium text-slate-900">{entry.name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Référence Annexe
                    </p>
                    <p className="text-sm text-slate-700">
                      {entry.annexReference || "—"}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Source Inventaire UE
                    </p>
                    <Badge variant="secondary" className="font-mono text-xs">
                      {entry.euInventorySource}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Source Inventaire US
                    </p>
                    <Badge variant="secondary" className="font-mono text-xs">
                      {entry.usInventorySource}
                    </Badge>
                  </div>
                </div>

                {entry.usMonograph && (
                  <>
                    <Separator />
                    <div className="space-y-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Monographie US
                      </p>
                      <p className="text-sm text-slate-700">{entry.usMonograph}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Synonyms Section */}
            {entry.synonyms && entry.synonyms.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Synonymes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {entry.synonyms.map((synonym, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="border-slate-300 bg-slate-50 text-sm font-normal text-slate-700"
                      >
                        {synonym}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Notes & Metadata */}
          <div className="flex flex-col gap-6">
            {/* Comment Section */}
            {entry.comment && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Commentaire</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-slate-700">{entry.comment}</p>
                </CardContent>
              </Card>
            )}

            {/* Metadata Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Métadonnées</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Créé le
                  </p>
                  <p className="text-sm text-slate-700">
                    {format(new Date(entry.createdAt), "d MMMM yyyy 'à' HH:mm", {
                      locale: fr,
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground">par {entry.createdBy}</p>
                </div>

                <Separator />

                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Dernière modification
                  </p>
                  <p className="text-sm text-slate-700">
                    {format(new Date(entry.updatedAt), "d MMMM yyyy 'à' HH:mm", {
                      locale: fr,
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground">par {entry.updatedBy}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={(open) => !open && handleCancel()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier l&apos;entrée INCI</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nom INCI *</Label>
              <Input
                id="edit-name"
                {...form.register("name")}
                placeholder="Ex: Aqua / Water"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-annex">Référence Annexe</Label>
                <Input
                  id="edit-annex"
                  {...form.register("annexReference")}
                  placeholder="Ex: Annexe VI — Point 29"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-monograph">Monographie US</Label>
                <Input
                  id="edit-monograph"
                  {...form.register("usMonograph")}
                  placeholder="Ex: USP Purified Water"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-eu-source">Source Inventaire UE *</Label>
                <Input
                  id="edit-eu-source"
                  {...form.register("euInventorySource")}
                  placeholder="Ex: CosIng Inventory"
                />
                {form.formState.errors.euInventorySource && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.euInventorySource.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-us-source">Source Inventaire US *</Label>
                <Input
                  id="edit-us-source"
                  {...form.register("usInventorySource")}
                  placeholder="Ex: USP-NF"
                />
                {form.formState.errors.usInventorySource && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.usInventorySource.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-comment">Commentaire</Label>
              <Textarea
                id="edit-comment"
                {...form.register("comment")}
                rows={4}
                placeholder="Notes techniques, observations réglementaires..."
              />
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="ghost" onClick={handleCancel}>
                Annuler
              </Button>
              <Button type="submit">Sauvegarder</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
