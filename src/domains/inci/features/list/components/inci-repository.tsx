"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowDown,
  ArrowUp,
  CheckCircle,
  FlaskRound,
  MoreHorizontal,
  Plus,
  Search,
  Trash2
} from "lucide-react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type FilterFn,
  type HeaderContext,
  type PaginationState,
  type SortingState
} from "@tanstack/react-table"

import type { InciEntry } from "@/types"

import { toast } from "sonner"

import { inciPageSizeOptions, mockInciEntries } from "@/shared/lib/mock-data"
import { cn } from "@/shared/lib/utils"

import { Button } from "@/shared/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table"
import { Textarea } from "@/shared/ui/textarea"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip"

type InciFormValues = {
  name: string
  annexReference: string
  usMonograph: string
  euInventorySource: string
  usInventorySource: string
  comment: string
}

const EMPTY_FORM: InciFormValues = {
  name: "",
  annexReference: "",
  usMonograph: "",
  euInventorySource: "",
  usInventorySource: "",
  comment: ""
}

const globalFilterFn: FilterFn<InciEntry> = (row, _columnId, value) => {
  if (!value) return true
  const haystack = [
    row.original.name,
    row.original.annexReference,
    row.original.usMonograph,
    row.original.euInventorySource,
    row.original.usInventorySource,
    row.original.comment,
    ...(row.original.synonyms ?? [])
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("fr-FR")

  return haystack.includes(String(value).toLocaleLowerCase("fr-FR"))
}

function useDebouncedValue<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(timer)
  }, [value, delay])

  return debounced
}

export function InciRepository() {
  const router = useRouter()
  const [entries, setEntries] = useState<InciEntry[]>(() => mockInciEntries)
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearch = useDebouncedValue(searchTerm.trim())
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([{ id: "name", desc: false }])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: inciPageSizeOptions[0]
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formValues, setFormValues] = useState<InciFormValues>(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof InciFormValues, string>>>({})
  const [editingEntry, setEditingEntry] = useState<InciEntry | null>(null)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [entryPendingDelete, setEntryPendingDelete] = useState<InciEntry | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 600)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }, [debouncedSearch, columnFilters])

  const euSources = useMemo(() => {
    const values = entries.map((entry) => entry.euInventorySource).filter(Boolean)
    return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b, "fr", { sensitivity: "base" }))
  }, [entries])

  const usSources = useMemo(() => {
    const values = entries.map((entry) => entry.usInventorySource).filter(Boolean)
    return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b, "fr", { sensitivity: "base" }))
  }, [entries])

  const handleCreateRequest = useCallback(() => {
    setEditingEntry(null)
    setFormValues(EMPTY_FORM)
    setFormErrors({})
    setIsFormOpen(true)
  }, [])

  const handleRowClick = useCallback(
    (entry: InciEntry) => {
      router.push(`/inci/${entry.id}`)
    },
    [router]
  )

  const handleDeleteRequest = useCallback((entry: InciEntry, event: React.MouseEvent) => {
    event.stopPropagation()
    setEntryPendingDelete(entry)
    setConfirmDeleteOpen(true)
  }, [])

  const columns = useMemo<ColumnDef<InciEntry>[]>(() => {
    const buildSortableHeader =
      (title: string) =>
      ({ column }: HeaderContext<InciEntry, unknown>) => {
      const isSorted = column.getIsSorted()
      const sortIndex = column.getSortIndex()
      return (
        <button
          className="flex w-full items-center justify-between gap-2 text-left text-sm font-semibold text-slate-600"
          onClick={() => column.toggleSorting(isSorted === "asc")}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault()
              column.toggleSorting(isSorted === "asc")
            }
          }}
          aria-label={`Trier par ${title}`}
        >
          <span>{title}</span>
          <span className="flex items-center gap-1 text-slate-400">
            {isSorted ? (
              isSorted === "asc" ? (
                <ArrowUp className="h-4 w-4" aria-hidden />
              ) : (
                <ArrowDown className="h-4 w-4" aria-hidden />
              )
            ) : (
              <ArrowUp className="h-4 w-4 opacity-20" aria-hidden />
            )}
            {sortIndex >= 0 && (
              <span className="text-[10px] font-semibold text-primary">{sortIndex + 1}</span>
            )}
          </span>
        </button>
      )
      }

    return [
      {
        accessorKey: "name",
        header: buildSortableHeader("Nom INCI"),
        cell: ({ row }) => (
          <div className="min-w-[200px] font-medium text-slate-900">{row.original.name}</div>
        ),
        sortingFn: "alphanumeric",
        filterFn: (row, id, value) => {
          if (!value) return true
          const cellValue = String(row.getValue(id) ?? "")
          return cellValue.toLocaleLowerCase("fr-FR").includes(String(value).toLocaleLowerCase("fr-FR"))
        }
      },
      {
        accessorKey: "annexReference",
        header: buildSortableHeader("Référence Annexe"),
        cell: ({ row }) => (
          <span className="w-[150px] text-sm text-slate-600">
            {row.original.annexReference || "—"}
          </span>
        ),
        size: 150
      },
      {
        accessorKey: "usMonograph",
        header: buildSortableHeader("Monographie US"),
        cell: ({ row }) => (
          <span className="w-[150px] text-sm text-slate-600">
            {row.original.usMonograph || "—"}
          </span>
        ),
        size: 150
      },
      {
        accessorKey: "euInventorySource",
        header: buildSortableHeader("Source Inventaire UE"),
        cell: ({ row }) => (
          <span className="w-[180px] text-sm text-slate-600">
            {row.original.euInventorySource}
          </span>
        ),
        size: 180,
        filterFn: (row, id, value) => {
          if (!value) return true
          return row.getValue<string>(id) === value
        }
      },
      {
        accessorKey: "usInventorySource",
        header: buildSortableHeader("Source Inventaire US"),
        cell: ({ row }) => (
          <span className="w-[180px] text-sm text-slate-600">
            {row.original.usInventorySource}
          </span>
        ),
        size: 180,
        filterFn: (row, id, value) => {
          if (!value) return true
          return row.getValue<string>(id) === value
        }
      },
      {
        accessorKey: "comment",
        header: buildSortableHeader("Commentaire"),
        cell: ({ row }) => {
          const comment = row.original.comment
          if (!comment) {
            return <span className="min-w-[200px] text-sm text-slate-400">—</span>
          }

          return (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="min-w-[200px] max-w-[280px] truncate text-sm text-slate-600">
                  {comment}
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm text-left text-xs leading-relaxed">
                {comment}
              </TooltipContent>
            </Tooltip>
          )
        },
        sortingFn: "alphanumeric"
      },
      {
        id: "actions",
        header: () => <span className="w-[100px] text-right text-sm font-semibold text-slate-600">Actions</span>,
        cell: ({ row }) => (
          <div className="flex w-[100px] justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full border border-slate-200"
                  aria-label={`Actions pour ${row.original.name}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" aria-hidden />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem
                  className="gap-2 text-destructive focus:text-destructive"
                  onClick={(e) => handleDeleteRequest(row.original, e)}
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
        enableSorting: false
      }
    ]
  }, [handleDeleteRequest])

  const table = useReactTable({
    data: entries,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter: debouncedSearch,
      pagination
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableMultiSort: true,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    globalFilterFn
  })

  const resetForm = useCallback(() => {
    setFormValues(EMPTY_FORM)
    setFormErrors({})
    setEditingEntry(null)
  }, [])

  const closeForm = useCallback(() => {
    setIsFormOpen(false)
    window.setTimeout(() => {
      resetForm()
    }, 200)
  }, [resetForm])

  const upsertEntry = useCallback(() => {
    const trimmedName = formValues.name.trim()
    const nextErrors: Partial<Record<keyof InciFormValues, string>> = {}

    if (!trimmedName) {
      nextErrors.name = "Le nom INCI est requis."
    }

    const isDuplicate = entries.some((entry) => {
      if (editingEntry && entry.id === editingEntry.id) return false
      return entry.name.localeCompare(trimmedName, "fr", { sensitivity: "accent" }) === 0
    })

    if (!trimmedName) {
      // already handled above
    } else if (isDuplicate) {
      nextErrors.name = "Ce nom INCI existe déjà dans le référentiel."
    }

    if (!formValues.euInventorySource.trim()) {
      nextErrors.euInventorySource = "Indiquez une source inventaire UE."
    }

    if (!formValues.usInventorySource.trim()) {
      nextErrors.usInventorySource = "Indiquez une source inventaire US."
    }

    if (Object.keys(nextErrors).length) {
      setFormErrors(nextErrors)
      return
    }

    const timestamp = new Date().toISOString()

    if (editingEntry) {
      const updated: InciEntry = {
        ...editingEntry,
        name: trimmedName,
        annexReference: formValues.annexReference.trim() || undefined,
        usMonograph: formValues.usMonograph.trim() || undefined,
        euInventorySource: formValues.euInventorySource.trim(),
        usInventorySource: formValues.usInventorySource.trim(),
        comment: formValues.comment.trim() || undefined,
        updatedAt: timestamp,
        updatedBy: "Marie Dubois"
      }

      setEntries((prev) => prev.map((entry) => (entry.id === editingEntry.id ? updated : entry)))
      toast.success("INCI mis à jour", {
        icon: <CheckCircle className="h-5 w-5 text-primary" aria-hidden />
      })
    } else {
      const newEntry: InciEntry = {
        id: `inci-${Date.now()}`,
        name: trimmedName,
        annexReference: formValues.annexReference.trim() || undefined,
        usMonograph: formValues.usMonograph.trim() || undefined,
        euInventorySource: formValues.euInventorySource.trim(),
        usInventorySource: formValues.usInventorySource.trim(),
        comment: formValues.comment.trim() || undefined,
        createdAt: timestamp,
        createdBy: "Marie Dubois",
        updatedAt: timestamp,
        updatedBy: "Marie Dubois"
      }
      setEntries((prev) => [newEntry, ...prev])
      toast.success("INCI créé avec succès", {
        icon: <CheckCircle className="h-5 w-5 text-primary" aria-hidden />
      })
    }

    closeForm()
  }, [closeForm, editingEntry, entries, formValues])

  const handleDelete = useCallback(() => {
    if (!entryPendingDelete) return

    const nextEntries = entries.filter((entry) => entry.id !== entryPendingDelete.id)
    setEntries(nextEntries)
    setConfirmDeleteOpen(false)
    setEntryPendingDelete(null)

    setPagination((current) => {
      const totalPages = Math.max(Math.ceil(nextEntries.length / current.pageSize), 1)
      const nextPageIndex = Math.min(current.pageIndex, totalPages - 1)
      if (nextPageIndex === current.pageIndex) {
        return current
      }
      return { ...current, pageIndex: nextPageIndex }
    })

    toast.success("INCI supprimé", {
      icon: <CheckCircle className="h-5 w-5 text-primary" aria-hidden />
    })
  }, [entries, entryPendingDelete])

  const nameColumn = table.getColumn("name")
  const euSourceColumn = table.getColumn("euInventorySource")
  const usSourceColumn = table.getColumn("usInventorySource")

  const visibleRows = table.getRowModel().rows

  return (
    <div className="flex min-h-full flex-col gap-6">
      <section className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold text-slate-900">Référentiel INCI</h2>
        <p className="text-sm text-muted-foreground">
          Base de données unifiée des dénominations ingrédients pour l&apos;ensemble du portfolio cosmétique.
        </p>
      </section>

      <section className="flex flex-1 flex-col rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-semibold text-slate-900">Repository centralisé</h3>
              <p className="text-sm text-muted-foreground">
                Recherchez, filtrez et maintenez vos entrées INCI avec des contrôles qualité prêts pour la production.
              </p>
            </div>
            <Button onClick={handleCreateRequest} className="ml-auto flex items-center gap-2" size="sm">
              <Plus className="h-4 w-4" aria-hidden />
              Nouvel INCI
            </Button>
          </div>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex w-full lg:max-w-xl">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Rechercher dans toutes les colonnes..."
                className="w-full rounded-md border border-slate-200 pl-9"
                aria-label="Recherche globale INCI"
              />
            </div>
            <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-end lg:justify-end">
              <div className="flex flex-col gap-1 lg:w-[220px]">
                <Label htmlFor="filter-name" className="text-xs uppercase tracking-wide text-muted-foreground">
                  Filtrer par nom
                </Label>
                <Input
                  id="filter-name"
                  placeholder="Nom INCI"
                  value={(nameColumn?.getFilterValue() as string) ?? ""}
                  onChange={(event) =>
                    nameColumn?.setFilterValue(event.target.value || undefined)
                  }
                />
              </div>
              <div className="flex flex-col gap-1 lg:w-[180px]">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                  Inventaire UE
                </Label>
                <Select
                  value={(euSourceColumn?.getFilterValue() as string) ?? ""}
                  onValueChange={(value) => {
                    if (value === "__all__") {
                      euSourceColumn?.setFilterValue(undefined)
                    } else {
                      euSourceColumn?.setFilterValue(value)
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tous" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">Tous</SelectItem>
                    {euSources.map((source) => (
                      <SelectItem key={source} value={source}>
                        {source}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1 lg:w-[180px]">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                  Inventaire US
                </Label>
                <Select
                  value={(usSourceColumn?.getFilterValue() as string) ?? ""}
                  onValueChange={(value) => {
                    if (value === "__all__") {
                      usSourceColumn?.setFilterValue(undefined)
                    } else {
                      usSourceColumn?.setFilterValue(value)
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tous" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">Tous</SelectItem>
                    {usSources.map((source) => (
                      <SelectItem key={source} value={source}>
                        {source}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto px-6 py-4">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="h-12 w-full rounded-md bg-muted/40 animate-shimmer"
                />
              ))}
            </div>
          ) : visibleRows.length ? (
            <Table>
              <TableHeader className="bg-slate-50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        style={{ width: header.getSize() !== 0 ? header.getSize() : undefined }}
                        className={cn(
                          "text-xs uppercase tracking-wide text-slate-500",
                          header.id === "comment" ? "min-w-[200px]" : undefined,
                          header.id === "name" ? "min-w-[200px]" : undefined
                        )}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {visibleRows.map((row, rowIndex) => (
                  <TableRow
                    key={row.id}
                    onClick={() => handleRowClick(row.original)}
                    className={cn(
                      "cursor-pointer transition-colors",
                      rowIndex % 2 === 0 ? "bg-white" : "bg-muted/20",
                      "hover:bg-muted/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary/40"
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="align-top text-sm text-slate-700">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-slate-200 bg-slate-50/60 py-16 text-center">
              <FlaskRound className="h-10 w-10 text-primary/70" aria-hidden />
              <div className="flex flex-col gap-1">
                <h4 className="text-base font-semibold text-slate-800">Aucun INCI trouvé</h4>
                <p className="text-sm text-muted-foreground">
                  Ajustez vos filtres ou créez une nouvelle entrée pour enrichir le référentiel.
                </p>
              </div>
              <Button variant="outline" onClick={handleCreateRequest} className="gap-2">
                <Plus className="h-4 w-4" aria-hidden />
                Ajouter une entrée
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className="text-xs uppercase tracking-wide text-slate-500">Afficher</span>
            <select
              className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm"
              value={pagination.pageSize}
              onChange={(event) => table.setPageSize(Number.parseInt(event.target.value, 10))}
              aria-label="Nombre d'éléments par page"
            >
              {inciPageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size} / page
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Page précédente
            </Button>
            <span className="text-xs text-slate-500">
              Page {pagination.pageIndex + 1} sur {table.getPageCount() || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Page suivante
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                if (!table.getCanNextPage()) return
                table.nextPage()
              }}
              disabled={!table.getCanNextPage()}
            >
              Charger plus
            </Button>
          </div>
        </div>
      </section>

      <Dialog open={isFormOpen} onOpenChange={(open) => (open ? setIsFormOpen(true) : closeForm())}>
        <DialogContent className="max-w-[600px]" aria-describedby="inci-form-description">
          <DialogHeader>
            <DialogTitle>{editingEntry ? "Modifier l'entrée INCI" : "Nouvelle entrée INCI"}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="inci-name">Nom INCI *</Label>
              <Input
                id="inci-name"
                value={formValues.name}
                onChange={(event) => {
                  setFormValues((prev) => ({ ...prev, name: event.target.value }))
                  if (formErrors.name) {
                    setFormErrors((prev) => ({ ...prev, name: undefined }))
                  }
                }}
                autoFocus
                aria-invalid={Boolean(formErrors.name)}
              />
              {formErrors.name ? (
                <p className="text-sm text-destructive">{formErrors.name}</p>
              ) : null}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="annex-reference">Référence Annexe</Label>
              <Input
                id="annex-reference"
                value={formValues.annexReference}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, annexReference: event.target.value }))
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="us-monograph">Monographie US</Label>
              <Input
                id="us-monograph"
                value={formValues.usMonograph}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, usMonograph: event.target.value }))
                }
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="eu-inventory">Source Inventaire UE *</Label>
                <Input
                  id="eu-inventory"
                  value={formValues.euInventorySource}
                  onChange={(event) => {
                    setFormValues((prev) => ({ ...prev, euInventorySource: event.target.value }))
                    if (formErrors.euInventorySource) {
                      setFormErrors((prev) => ({ ...prev, euInventorySource: undefined }))
                    }
                  }}
                  aria-invalid={Boolean(formErrors.euInventorySource)}
                />
                {formErrors.euInventorySource ? (
                  <p className="text-sm text-destructive">{formErrors.euInventorySource}</p>
                ) : null}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="us-inventory">Source Inventaire US *</Label>
                <Input
                  id="us-inventory"
                  value={formValues.usInventorySource}
                  onChange={(event) => {
                    setFormValues((prev) => ({ ...prev, usInventorySource: event.target.value }))
                    if (formErrors.usInventorySource) {
                      setFormErrors((prev) => ({ ...prev, usInventorySource: undefined }))
                    }
                  }}
                  aria-invalid={Boolean(formErrors.usInventorySource)}
                />
                {formErrors.usInventorySource ? (
                  <p className="text-sm text-destructive">{formErrors.usInventorySource}</p>
                ) : null}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="comment">Commentaire</Label>
              <Textarea
                id="comment"
                rows={4}
                value={formValues.comment}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, comment: event.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter className="mt-2 gap-2">
            <Button variant="ghost" onClick={closeForm}>
              Annuler
            </Button>
            <Button onClick={upsertEntry}>
              Sauvegarder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={confirmDeleteOpen}
        onOpenChange={(open) => {
          if (open) {
            setConfirmDeleteOpen(true)
          } else {
            setConfirmDeleteOpen(false)
            setEntryPendingDelete(null)
          }
        }}
      >
        <DialogContent className="max-w-md" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Supprimer l&apos;entrée INCI</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm text-slate-600">
            <p>
              Êtes-vous sûr de vouloir supprimer <span className="font-medium text-slate-900">{entryPendingDelete?.name}</span> ?
            </p>
            <p className="text-slate-500">
              Cette action est définitive et retirera l&apos;entrée du référentiel partagé.
            </p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmDeleteOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDelete} className="gap-2">
              <Trash2 className="h-4 w-4" aria-hidden />
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
