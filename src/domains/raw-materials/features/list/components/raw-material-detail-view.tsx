"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  ArrowLeft,
  Building2,
  Calendar,
  ClipboardCopy,
  Edit,
  FileText,
  MapPin,
  Package,
  Save,
  ShieldCheck,
  TrendingUp,
  X,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/shared/ui/button"
import { Badge } from "@/shared/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form"
import { Input } from "@/shared/ui/input"
import { Textarea } from "@/shared/ui/textarea"
import { Separator } from "@/shared/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"
import { Combobox } from "@/shared/ui/combobox"
import { cn, formatDate, formatRelativeDate } from "@/shared/lib/utils"
import {
  mockCompanies,
  mockSites,
  mockInciNames,
} from "@/shared/lib/raw-materials-mock-data"
import type { RawMaterial, RawMaterialStatus } from "@/types"

// Status configuration (same as list)
const statusConfig: Record<
  RawMaterialStatus,
  { label: string; className: string }
> = {
  active: { label: "Actif", className: "bg-green-50 text-green-700 border-green-200" },
  approved: { label: "Approuvé", className: "bg-blue-50 text-blue-700 border-blue-200" },
  pending: { label: "En attente", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  review: { label: "En revue", className: "bg-purple-50 text-purple-700 border-purple-200" },
  discontinued: { label: "Arrêté", className: "bg-gray-50 text-gray-700 border-gray-200" },
  restricted: { label: "Restreint", className: "bg-red-50 text-red-700 border-red-200" },
}

// Form schema
const materialSchema = z.object({
  commercialName: z.string().min(1, "Nom commercial requis"),
  supplierId: z.string().min(1, "Fournisseur requis"),
  siteId: z.string().min(1, "Site requis"),
  siteCode: z.string().min(1, "Code MP requis"),
  status: z.enum(["active", "pending", "discontinued", "restricted", "approved", "review"]),
  inciName: z.string().min(1, "Nom INCI requis"),
  cas: z.string().optional(),
  einecs: z.string().optional(),
  percentage: z.number().optional(),
  grade: z.string().optional(),
  origin: z.string().optional(),
  batch: z.string().optional(),
})

type MaterialFormValues = z.infer<typeof materialSchema>

interface RawMaterialDetailViewProps {
  material: RawMaterial
  onUpdate?: (material: RawMaterial) => void
}

export function RawMaterialDetailView({
  material: initialMaterial,
  onUpdate,
}: RawMaterialDetailViewProps) {
  const router = useRouter()
  const [material, setMaterial] = React.useState(initialMaterial)
  const [isEditing, setIsEditing] = React.useState(false)
  const [newNote, setNewNote] = React.useState("")

  // Form
  const form = useForm<MaterialFormValues>({
    resolver: zodResolver(materialSchema),
    defaultValues: {
      commercialName: material.commercialName,
      supplierId: material.supplierId,
      siteId: material.siteId,
      siteCode: material.siteCode,
      status: material.status,
      inciName: material.inciName,
      cas: material.cas,
      einecs: material.einecs,
      percentage: material.percentage,
      grade: material.grade,
      origin: material.origin,
      batch: material.batch,
    },
  })

  // Auto-update site code when site changes
  React.useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "siteId" && value.siteId) {
        const site = mockSites.find((s) => s.id === value.siteId)
        if (site) {
          const year = new Date().getFullYear()
          const seq = String(Math.floor(Math.random() * 999) + 1).padStart(3, "0")
          const newCode = site.codePattern
            .replace("{year}", String(year))
            .replace("{seq}", seq)
          form.setValue("siteCode", newCode)
        }
      }
    })
    return () => subscription.unsubscribe()
  }, [form])

  // Get related data
  const company = mockCompanies.find((c) => c.id === material.supplierId)
  const site = mockSites.find((s) => s.id === material.siteId)
  const statusTheme = statusConfig[material.status]

  // Handlers
  const handleSave = (values: MaterialFormValues) => {
    const updated: RawMaterial = {
      ...material,
      ...values,
      updatedAt: new Date().toISOString(),
      updatedBy: "Current User",
    }
    setMaterial(updated)
    onUpdate?.(updated)
    setIsEditing(false)
    toast.success("Matière première mise à jour")
  }

  const handleCopy = () => {
    const text = `${material.commercialName} (${material.siteCode})`
    navigator.clipboard?.writeText(text).then(() => {
      toast.success("Référence copiée")
    })
  }

  const handleAddNote = () => {
    if (!newNote.trim()) return

    const updatedNotes = [
      {
        id: `note-${Date.now()}`,
        content: newNote,
        createdAt: new Date().toISOString(),
        createdBy: "Current User",
      },
      ...(material.notes || []),
    ]

    setMaterial({ ...material, notes: updatedNotes })
    setNewNote("")
    toast.success("Note ajoutée")
  }

  // Stats
  const quickStats = React.useMemo(
    () => [
      {
        title: "Fournisseur",
        value: company?.name || "—",
        icon: Building2,
        description: company?.country || "—",
        accentClass: "bg-blue-50 text-blue-700 border-blue-200",
      },
      {
        title: "Site de production",
        value: site?.code || "—",
        icon: MapPin,
        description: site?.name || "—",
        accentClass: "bg-purple-50 text-purple-700 border-purple-200",
      },
      {
        title: "Documents",
        value: material.documents?.length || 0,
        icon: FileText,
        description: "Pièces jointes",
        accentClass: "bg-slate-100 text-slate-700 border-slate-200",
      },
      {
        title: "Certifications",
        value: material.certifications?.length || 0,
        icon: ShieldCheck,
        description: material.certifications?.[0] || "Aucune",
        accentClass: "bg-green-50 text-green-700 border-green-200",
      },
    ],
    [company, site, material.documents, material.certifications]
  )

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={cn("rounded-full border px-3 py-1 text-xs font-semibold", statusTheme.className)}>
                  {statusTheme.label}
                </Badge>
                <Badge className="rounded-full border border-slate-200 bg-slate-100 font-mono text-xs text-slate-600">
                  {material.siteCode}
                </Badge>
                {material.grade && (
                  <Badge className="rounded-full border border-primary/20 bg-primary/10 text-xs text-primary">
                    {material.grade}
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-semibold text-slate-900">
                {material.commercialName}
              </h1>
              <p className="text-sm text-slate-600">
                INCI: {material.inciName}
                {material.cas && ` • CAS: ${material.cas}`}
              </p>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>Créé le {formatDate(material.createdAt, "dd MMM yyyy")}</span>
                <span className="text-slate-300">•</span>
                <span>Mis à jour {formatRelativeDate(material.updatedAt)}</span>
                <span className="text-slate-300">•</span>
                <span>Par {material.updatedBy}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 md:items-end">
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  <ClipboardCopy className="mr-2 h-4 w-4" />
                  Copier réf.
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Modifier
                </Button>
              </div>
              <Link
                href="/raw-materials"
                className="flex items-center gap-2 text-xs text-slate-500 hover:text-primary"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Retour à la liste
              </Link>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {quickStats.map((stat) => (
              <Card key={stat.title} className={cn("border border-dashed", stat.accentClass)}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <stat.icon className="h-4 w-4" />
                    {stat.title}
                  </CardTitle>
                  <CardDescription>{stat.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          {/* Left Column - Detailed Info */}
          <div className="space-y-6">
            {/* Composition & Specifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Composition & Spécifications
                </CardTitle>
                <CardDescription>
                  Informations techniques et composition chimique
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-xs font-medium text-slate-600">Nom INCI</label>
                    <p className="mt-1 text-sm font-medium text-slate-900">{material.inciName}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600">Code MP</label>
                    <p className="mt-1 font-mono text-sm font-medium text-slate-900">
                      {material.siteCode}
                    </p>
                  </div>
                  {material.cas && (
                    <div>
                      <label className="text-xs font-medium text-slate-600">N° CAS</label>
                      <p className="mt-1 font-mono text-sm text-slate-700">{material.cas}</p>
                    </div>
                  )}
                  {material.einecs && (
                    <div>
                      <label className="text-xs font-medium text-slate-600">N° EINECS</label>
                      <p className="mt-1 font-mono text-sm text-slate-700">{material.einecs}</p>
                    </div>
                  )}
                  {material.percentage !== undefined && (
                    <div>
                      <label className="text-xs font-medium text-slate-600">Pureté</label>
                      <p className="mt-1 text-sm text-slate-700">{material.percentage}%</p>
                    </div>
                  )}
                  {material.grade && (
                    <div>
                      <label className="text-xs font-medium text-slate-600">Grade</label>
                      <p className="mt-1 text-sm text-slate-700">{material.grade}</p>
                    </div>
                  )}
                  {material.origin && (
                    <div>
                      <label className="text-xs font-medium text-slate-600">Origine</label>
                      <p className="mt-1 text-sm text-slate-700">{material.origin}</p>
                    </div>
                  )}
                  {material.batch && (
                    <div>
                      <label className="text-xs font-medium text-slate-600">Lot</label>
                      <p className="mt-1 font-mono text-sm text-slate-700">{material.batch}</p>
                    </div>
                  )}
                </div>

                {material.certifications && material.certifications.length > 0 && (
                  <div>
                    <label className="mb-2 block text-xs font-medium text-slate-600">
                      Certifications
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {material.certifications.map((cert, idx) => (
                        <Badge key={idx} variant="outline" className="gap-1.5">
                          <ShieldCheck className="h-3 w-3 text-green-600" />
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Supplier & Site Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Approvisionnement
                </CardTitle>
                <CardDescription>
                  Informations fournisseur et site de production
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-xs font-medium text-slate-600">Fournisseur</label>
                    <p className="mt-1 text-sm font-medium text-slate-900">{company?.name || "—"}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Type: {company?.type || "—"}
                      {company?.country && ` • ${company.country}`}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600">Site de production</label>
                    <p className="mt-1 text-sm font-medium text-slate-900">
                      {site?.name || "—"}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {site?.location || "—"}
                      {site?.country && ` • ${site.country}`}
                    </p>
                  </div>
                  {material.expiryDate && (
                    <div>
                      <label className="text-xs font-medium text-slate-600">Date d'expiration</label>
                      <p className="mt-1 flex items-center gap-2 text-sm text-slate-700">
                        <Calendar className="h-4 w-4" />
                        {formatDate(material.expiryDate, "dd MMM yyyy")}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Notes & Documents */}
          <div className="space-y-6">
            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Notes
                </CardTitle>
                <CardDescription>Historique des observations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Note */}
                <div className="space-y-2">
                  <Textarea
                    placeholder="Ajouter une note..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <Button
                    size="sm"
                    onClick={handleAddNote}
                    disabled={!newNote.trim()}
                    className="w-full"
                  >
                    Ajouter la note
                  </Button>
                </div>

                <Separator />

                {/* Notes List */}
                <div className="space-y-3">
                  {material.notes && material.notes.length > 0 ? (
                    material.notes.map((note) => (
                      <div
                        key={note.id}
                        className="rounded-lg border border-slate-200 bg-white p-3"
                        style={{ borderLeft: "1px solid oklch(0.205 0 0)" }}
                      >
                        <div className="mb-2 flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
                            {note.createdBy.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-slate-900">{note.createdBy}</p>
                            <p className="text-xs text-slate-500">
                              {formatRelativeDate(note.createdAt)}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-slate-700">{note.content}</p>
                      </div>
                    ))
                  ) : (
                    <p className="py-6 text-center text-sm text-slate-500">Aucune note</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Modifier la matière première</DialogTitle>
            <DialogDescription>
              Mise à jour des informations de {material.commercialName}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="commercialName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom Commercial*</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="inciName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom INCI*</FormLabel>
                      <FormControl>
                        <Combobox
                          options={mockInciNames.map((name) => ({ value: name, label: name }))}
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Sélectionner..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="supplierId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fournisseur*</FormLabel>
                      <FormControl>
                        <Combobox
                          options={mockCompanies.map((c) => ({ value: c.id, label: c.name }))}
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Sélectionner..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="siteId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Site*</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {mockSites.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.code} — {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="siteCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code MP*</FormLabel>
                      <FormControl>
                        <Input {...field} className="font-mono" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Statut*</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(statusConfig).map(([key, config]) => (
                            <SelectItem key={key} value={key}>
                              <Badge className={cn("border", config.className)}>
                                {config.label}
                              </Badge>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>N° CAS</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="XXX-XX-X" className="font-mono" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="grade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grade</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  <X className="mr-2 h-4 w-4" />
                  Annuler
                </Button>
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  Enregistrer
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}
