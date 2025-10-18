"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowLeft, Plus, X } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Combobox } from "@/components/ui/combobox"
import { MultiSelect } from "@/components/ui/multi-select"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { formatRelativeDate } from "@/lib/utils"
import type { InciAlias, CasEinecsPair, RegulatoryNote } from "@/types"

// Validation Schemas
const casPattern = /^(\d{2,7}-\d{2}-\d|Not Available)$/
const einecsPattern = /^\d{3}-\d{3}-\d$/

const inciAliasSchema = z.object({
  id: z.string(),
  type: z.enum(["synonym", "variant", "deprecated", "regional"]),
  linkedInci: z.string().min(1, "INCI requis"),
})

const casEinecsPairSchema = z.object({
  id: z.string(),
  cas: z.string().regex(casPattern, "Format CAS invalide (XXX-XX-X) ou 'Not Available'"),
  einecs: z.string().regex(einecsPattern, "Format EINECS invalide (XXX-XXX-X)").optional(),
  source: z.string().optional(),
  createdAt: z.string(),
  createdBy: z.string(),
})

const substanceFormSchema = z.object({
  id: z.string(),
  inciEU: z.string().min(1, "INCI Europe requis"),
  inciUS: z.string().min(1, "INCI USA requis"),
  aliases: z.array(inciAliasSchema),
  casEinecsPairs: z.array(casEinecsPairSchema),
  class: z.string().optional(),
  families: z.array(z.string()),
  allergenGroup: z.string().optional(),
  allergens26: z.array(z.string()),
  functions: z.array(z.string()),
  functionsInventory: z.array(z.string()),
  notes: z.array(
    z.object({
      id: z.string(),
      content: z.string(),
      createdAt: z.string(),
      createdBy: z.string(),
    })
  ),
})

type SubstanceFormValues = z.infer<typeof substanceFormSchema>

// Mock Data
const mockInciOptions = [
  { value: "aqua", label: "Aqua", description: "(7732-18-5)" },
  { value: "glycerin", label: "Glycerin", description: "(56-81-5)" },
  { value: "parfum", label: "Parfum", description: "(No CAS)" },
  { value: "tocopherol", label: "Tocopherol", description: "(10191-41-0)" },
  { value: "retinol", label: "Retinol", description: "(68-26-8)" },
]

const mockClassOptions = [
  { value: "active", label: "Actif cosmétique" },
  { value: "preservative", label: "Conservateur" },
  { value: "fragrance", label: "Parfum" },
  { value: "colorant", label: "Colorant" },
  { value: "emulsifier", label: "Émulsifiant" },
]

const mockFamilyOptions = [
  { value: "solvents", label: "Solvants" },
  { value: "humectants", label: "Humectants" },
  { value: "emollients", label: "Émollients" },
  { value: "preservatives", label: "Conservateurs" },
  { value: "fragrances", label: "Parfums" },
  { value: "vitamins", label: "Vitamines" },
]

const mockAllergenGroups = [
  { value: "none", label: "Aucun" },
  { value: "fragrance", label: "Parfums allergènes" },
  { value: "preservative", label: "Conservateurs allergènes" },
  { value: "colorant", label: "Colorants allergènes" },
]

const aliasTypeLabels: Record<InciAlias["type"], { label: string; variant: string }> = {
  synonym: { label: "Synonyme", variant: "bg-blue-100 text-blue-700" },
  variant: { label: "Variante", variant: "bg-green-100 text-green-700" },
  deprecated: { label: "Déprécié", variant: "bg-orange-100 text-orange-700" },
  regional: { label: "Régional", variant: "bg-purple-100 text-purple-700" },
}

export function SubstanceManager() {
  const router = useRouter()
  const [newNote, setNewNote] = React.useState("")

  const form = useForm<SubstanceFormValues>({
    resolver: zodResolver(substanceFormSchema),
    defaultValues: {
      id: `SUB-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      inciEU: "",
      inciUS: "",
      aliases: [],
      casEinecsPairs: [],
      class: "",
      families: [],
      allergenGroup: "none",
      allergens26: [],
      functions: [],
      functionsInventory: [],
      notes: [],
    },
  })

  // Check for duplicate CAS/EINECS within pairs
  const checkDuplicates = (casEinecsPairs: CasEinecsPair[]) => {
    const casValues = casEinecsPairs.map((i) => i.cas).filter(Boolean)
    const einecsValues = casEinecsPairs.map((i) => i.einecs).filter(Boolean)

    const duplicateCas = casValues.filter(
      (val, idx) => casValues.indexOf(val) !== idx
    )
    const duplicateEinecs = einecsValues.filter(
      (val, idx) => einecsValues.indexOf(val) !== idx
    )

    return { duplicateCas, duplicateEinecs }
  }

  const addAlias = () => {
    const current = form.getValues("aliases")
    form.setValue("aliases", [
      ...current,
      {
        id: `alias-${Date.now()}`,
        type: "synonym",
        linkedInci: "",
      },
    ])
  }

  const removeAlias = (index: number) => {
    const current = form.getValues("aliases")
    form.setValue(
      "aliases",
      current.filter((_, i) => i !== index)
    )
  }

  const addIdentifier = () => {
    const current = form.getValues("casEinecsPairs")
    form.setValue("casEinecsPairs", [
      ...current,
      {
        id: `pair-${Date.now()}`,
        cas: "",
        einecs: "",
        source: "",
        createdAt: new Date().toISOString(),
        createdBy: "Current User",
      },
    ])
  }

  const removeIdentifier = (index: number) => {
    const current = form.getValues("casEinecsPairs")
    form.setValue(
      "casEinecsPairs",
      current.filter((_, i) => i !== index)
    )
  }

  const addNote = () => {
    if (!newNote.trim()) return

    const current = form.getValues("notes")
    form.setValue("notes", [
      {
        id: `note-${Date.now()}`,
        content: newNote,
        createdAt: new Date().toISOString(),
        createdBy: "Current User",
      },
      ...current,
    ])
    setNewNote("")
    toast.success("Note ajoutée")
  }

  const onSubmit = (data: SubstanceFormValues) => {
    const { duplicateCas, duplicateEinecs } = checkDuplicates(data.casEinecsPairs)

    if (duplicateCas.length > 0 || duplicateEinecs.length > 0) {
      toast.error("Des doublons ont été détectés dans les identifiants CAS/EINECS")
      return
    }

    console.log("Form submitted:", data)
    toast.success("Substance enregistrée avec succès")
    router.push("/substance-manager")
  }

  const handleCancel = () => {
    router.back()
  }

  const casEinecsPairs = form.watch("casEinecsPairs")
  const { duplicateCas, duplicateEinecs } = checkDuplicates(casEinecsPairs)

  return (
    <div className="flex min-h-screen flex-col">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 h-20 border-b bg-white shadow-sm">
        <div className="flex h-full items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCancel}
              aria-label="Retour"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-semibold text-slate-900">
              Nouvelle Substance
            </h1>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleCancel}>
              Annuler
            </Button>
            <Button onClick={form.handleSubmit(onSubmit)}>
              Enregistrer
            </Button>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <main className="flex-1 overflow-y-auto bg-slate-50 px-6 py-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto max-w-5xl space-y-6">
            {/* Section 1: Identification */}
            <Card>
              <CardHeader className="border-b border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900">
                  1. Identification
                </h2>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-6 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID Substance</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            readOnly
                            className="bg-slate-100 font-mono text-sm"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="inciEU"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>INCI Europe*</FormLabel>
                        <FormControl>
                          <Combobox
                            options={mockInciOptions}
                            value={field.value}
                            onValueChange={field.onChange}
                            placeholder="Sélectionner INCI EU..."
                            searchPlaceholder="Rechercher un INCI..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="inciUS"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>INCI USA*</FormLabel>
                        <FormControl>
                          <Combobox
                            options={mockInciOptions}
                            value={field.value}
                            onValueChange={field.onChange}
                            placeholder="Sélectionner INCI US..."
                            searchPlaceholder="Rechercher un INCI..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Section 2: Alias INCI */}
            <Card>
              <CardHeader className="border-b border-slate-200 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900">
                    2. Alias INCI
                  </h2>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addAlias}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter un alias
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {form.watch("aliases").length === 0 ? (
                  <div className="rounded-lg border-2 border-dashed border-slate-300 px-6 py-12 text-center">
                    <p className="text-sm text-slate-500">
                      Aucun alias défini
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {form.watch("aliases").map((alias, index) => (
                      <div
                        key={alias.id}
                        className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4"
                      >
                        <div className="grid flex-1 gap-3 md:grid-cols-[200px_1fr]">
                          <FormField
                            control={form.control}
                            name={`aliases.${index}.type`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">
                                  Type d'alias
                                </FormLabel>
                                <Select
                                  value={field.value}
                                  onValueChange={field.onChange}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue>
                                        {field.value && (
                                          <Badge
                                            className={cn(
                                              "rounded-sm text-xs font-semibold",
                                              aliasTypeLabels[field.value].variant
                                            )}
                                          >
                                            {aliasTypeLabels[field.value].label}
                                          </Badge>
                                        )}
                                      </SelectValue>
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {Object.entries(aliasTypeLabels).map(
                                      ([key, { label, variant }]) => (
                                        <SelectItem key={key} value={key}>
                                          <Badge
                                            className={cn(
                                              "rounded-sm text-xs font-semibold",
                                              variant
                                            )}
                                          >
                                            {label}
                                          </Badge>
                                        </SelectItem>
                                      )
                                    )}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`aliases.${index}.linkedInci`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">
                                  INCI lié
                                </FormLabel>
                                <FormControl>
                                  <Combobox
                                    options={mockInciOptions}
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    placeholder="Sélectionner INCI..."
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeAlias(index)}
                          className="mt-6 text-slate-400 hover:text-red-600"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Section 3: CAS/EINECS Identifiers */}
            <Card>
              <CardHeader className="border-b border-slate-200 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900">
                    3. Identifiants CAS/EINECS
                  </h2>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addIdentifier}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter un identifiant
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {form.watch("casEinecsPairs").length === 0 ? (
                  <div className="rounded-lg border-2 border-dashed border-slate-300 px-6 py-12 text-center">
                    <p className="text-sm text-slate-500">
                      Aucun identifiant défini
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {form.watch("casEinecsPairs").map((identifier, index) => {
                      const hasDuplicateCas = duplicateCas.includes(
                        identifier.cas
                      )
                      const hasDuplicateEinecs = duplicateEinecs.includes(
                        identifier.einecs
                      )

                      return (
                        <div
                          key={identifier.id}
                          className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4"
                        >
                          <div className="grid flex-1 gap-3 md:grid-cols-3">
                            <FormField
                              control={form.control}
                              name={`casEinecsPairs.${index}.cas`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs">
                                    N° CAS
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder="XXX-XX-X"
                                      className={cn(
                                        hasDuplicateCas &&
                                          "border-red-500 focus-visible:ring-red-500"
                                      )}
                                    />
                                  </FormControl>
                                  {hasDuplicateCas && (
                                    <p className="text-xs text-red-600">
                                      Doublon détecté
                                    </p>
                                  )}
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`casEinecsPairs.${index}.einecs`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs">
                                    N° EINECS
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder="XXX-XXX-X"
                                      className={cn(
                                        hasDuplicateEinecs &&
                                          "border-red-500 focus-visible:ring-red-500"
                                      )}
                                    />
                                  </FormControl>
                                  {hasDuplicateEinecs && (
                                    <p className="text-xs text-red-600">
                                      Doublon détecté
                                    </p>
                                  )}
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`casEinecsPairs.${index}.source`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs">
                                    Source (optionnel)
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder="ex: CosIng"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeIdentifier(index)}
                            className="mt-6 text-slate-400 hover:text-red-600"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Section 4: Classification */}
            <Card>
              <CardHeader className="border-b border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900">
                  4. Classification
                </h2>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="class"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Classe</FormLabel>
                          <FormControl>
                            <Combobox
                              options={mockClassOptions}
                              value={field.value || ""}
                              onValueChange={field.onChange}
                              placeholder="Sélectionner une classe..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="families"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Famille</FormLabel>
                          <FormControl>
                            <MultiSelect
                              options={mockFamilyOptions}
                              selected={field.value}
                              onChange={field.onChange}
                              placeholder="Sélectionner des familles..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="allergenGroup"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Groupe allergènes</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {mockAllergenGroups.map((group) => (
                                <SelectItem key={group.value} value={group.value}>
                                  {group.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 5: Notes Réglementaires */}
            <Card>
              <CardHeader className="border-b border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900">
                  5. Notes réglementaires
                </h2>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* New Note Input */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-700">
                      Ajouter une note
                    </label>
                    <div className="flex gap-2">
                      <Textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Saisir une note réglementaire..."
                        className="min-h-[100px]"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addNote}
                      disabled={!newNote.trim()}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Ajouter la note
                    </Button>
                  </div>

                  {/* Existing Notes */}
                  {form.watch("notes").length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-4">
                        <h3 className="text-sm font-medium text-slate-700">
                          Historique des notes
                        </h3>
                        <div className="space-y-3">
                          {form.watch("notes").map((note) => (
                            <div
                              key={note.id}
                              className="relative rounded-lg border border-slate-200 bg-white p-4 pl-5"
                              style={{
                                borderLeft: "1px solid oklch(0.205 0 0)",
                              }}
                            >
                              <div className="mb-2 flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
                                  {note.createdBy.charAt(0)}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-slate-900">
                                    {note.createdBy}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {formatRelativeDate(note.createdAt)}
                                  </p>
                                </div>
                              </div>
                              <p className="text-sm text-slate-700">
                                {note.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </form>
        </Form>
      </main>
    </div>
  )
}
