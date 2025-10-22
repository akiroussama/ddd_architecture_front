"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  type ColumnDef,
  type SortingState,
  type RowSelectionState,
  type PaginationState,
} from "@tanstack/react-table"
import { toast } from "sonner"
import {
  ArrowUpDown,
  Filter,
  Trash2,
  Download,
  X,
  CheckCircle2,
  Clock,
  XCircle,
  ShieldAlert,
  Eye,
} from "lucide-react"

import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Badge } from "@/shared/ui/badge"
import { Checkbox } from "@/shared/ui/checkbox"
import { Combobox } from "@/shared/ui/combobox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table"
import { cn } from "@/shared/lib/utils"
import { formatRelativeDate } from "@/shared/lib/utils"
import { mockRawMaterials } from "@/shared/lib/raw-materials-mock-data"
import type { RawMaterial, RawMaterialFilters, RMStatus } from "@/shared/types"

// Status configuration with colors
const statusConfig: Record<RMStatus, { label: string; icon: React.ElementType; className: string }> = {
  Approuvé: {
    label: "Approuvé",
    icon: CheckCircle2,
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  Actif: {
    label: "Actif",
    icon: CheckCircle2,
    className: "bg-green-50 text-green-700 border-green-200",
  },
  "En attente": {
    label: "En attente",
    icon: Clock,
    className: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
  "En revue": {
    label: "En revue",
    icon: Eye,
    className: "bg-purple-50 text-purple-700 border-purple-200",
  },
  Restreint: {
    label: "Restreint",
    icon: ShieldAlert,
    className: "bg-red-50 text-red-700 border-red-200",
  },
  "Arrêté": {
    label: "Arrêté",
    icon: XCircle,
    className: "bg-gray-50 text-gray-700 border-gray-200",
  },
}

export function RawMaterialsList() {
  const router = useRouter()
  // State
  const [materials, setMaterials] = React.useState<RawMaterial[]>(mockRawMaterials)
  const [filters, setFilters] = React.useState<RawMaterialFilters>({
    searchTerm: "",
    site: null,
    status: "all",
    supplier: null,
    inci: null,
    favoriteOnly: false,
  })
  const [showFilters, setShowFilters] = React.useState(false)
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "updatedAt", desc: true },
  ])
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  })

  // Filtered materials
  const filteredMaterials = React.useMemo(() => {
    return materials.filter((material) => {
      const searchTerm = filters.searchTerm.trim().toLowerCase()
      if (searchTerm) {
        const haystack = [
          material.commercialName,
          material.inci,
          material.supplier,
          material.code,
          material.site,
        ]
        const matches = haystack.some((value) => value.toLowerCase().includes(searchTerm))
        if (!matches) return false
      }

      if (filters.site && material.site !== filters.site) return false
      if (filters.status !== "all" && material.status !== filters.status) return false
      if (filters.supplier && material.supplier !== filters.supplier) return false
      if (filters.inci && material.inci !== filters.inci) return false
      if (filters.favoriteOnly && !material.favorite) return false

      return true
    })
  }, [materials, filters])

  const activeFilterCount = React.useMemo(() => {
    let count = 0
    if (filters.searchTerm) count++
    if (filters.site) count++
    if (filters.status !== "all") count++
    if (filters.supplier) count++
    if (filters.inci) count++
    if (filters.favoriteOnly) count++
    return count
  }, [filters])

  // Table columns
  const columns = React.useMemo<ColumnDef<RawMaterial>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Tout sélectionner"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Sélectionner la ligne"
          />
        ),
        enableSorting: false,
      },
      {
        accessorKey: "commercialName",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-3"
          >
            Nom Commercial
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="font-medium text-slate-900">{row.original.commercialName}</span>
        ),
      },
      {
        accessorKey: "siteCode",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-3"
          >
            Code MP
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <code className="rounded bg-slate-100 px-2 py-1 text-xs font-mono">
            {row.original.siteCode}
          </code>
        ),
      },
      {
        accessorKey: "inciName",
        header: "INCI",
        cell: ({ row }) => (
          <span className="text-sm text-slate-600">{row.original.inciName}</span>
        ),
      },
      {
        accessorKey: "supplierId",
        header: "Fournisseur",
        cell: ({ row }) => {
          const company = mockCompanies.find((c) => c.id === row.original.supplierId)
          return <span className="text-sm text-slate-600">{company?.name || "—"}</span>
        },
      },
      {
        accessorKey: "siteId",
        header: "Site",
        cell: ({ row }) => {
          const site = mockSites.find((s) => s.id === row.original.siteId)
          return (
            <Badge variant="outline" className="font-mono text-xs">
              {site?.code || "—"}
            </Badge>
          )
        },
      },
      {
        accessorKey: "status",
        header: "Statut",
        cell: ({ row }) => {
          const status = row.original.status
          const config = statusConfig[status]
          const Icon = config.icon
          return (
            <Badge className={cn("gap-1.5 border", config.className)}>
              <Icon className="h-3 w-3" />
              {config.label}
            </Badge>
          )
        },
      },
      {
        accessorKey: "updatedAt",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-3"
          >
            Mis à jour
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-xs text-slate-500">
            {formatRelativeDate(row.original.updatedAt)}
          </span>
        ),
      },
    ],
    []
  )

  // Table instance
  const table = useReactTable({
    data: filteredMaterials,
    columns,
    state: { sorting, rowSelection, pagination },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    enableRowSelection: true,
  })

  // Handlers
  const handleRowClick = (material: RawMaterial) => {
    router.push(`/raw-materials/${material.id}`)
  }

  const handleBulkDelete = () => {
    const selectedIds = Object.keys(rowSelection)
    if (selectedIds.length === 0) return

    // Check for dependencies (simplified)
    const hasReferences = materials
      .filter((m) => selectedIds.includes(m.id))
      .some((m) => m.status === "active")

    if (hasReferences) {
      toast.error("Impossible de supprimer des matières actives. Changez d'abord leur statut.")
      return
    }

    setMaterials((prev) => prev.filter((m) => !selectedIds.includes(m.id)))
    setRowSelection({})
    toast.success(`${selectedIds.length} matière(s) supprimée(s)`)
  }

  const handleBulkExport = () => {
    const selectedIds = Object.keys(rowSelection)
    const selectedMaterials = materials.filter((m) => selectedIds.includes(m.id))
    console.log("Exporting:", selectedMaterials)
    toast.success(`Export de ${selectedIds.length} matière(s) lancé`)
  }

  const clearFilters = () => {
    setFilters({
      searchTerm: "",
      siteId: null,
      siteCode: null,
      status: "all",
      supplierId: null,
      inciName: null,
    })
    setShowFilters(false)
  }

  const selectedCount = Object.keys(rowSelection).length

  return (
    <div className="flex min-h-screen flex-col">
      {/* Two-Tier Sticky Header */}
      <div className="sticky top-0 z-10 bg-white shadow-md">
        {/* Top Section - Main Fields (80px) */}
        <div className="border-b border-slate-200 bg-background px-6 py-4">
          <div className="grid gap-4 md:grid-cols-[2fr_1fr_1fr_1fr_1fr]">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Nom Commercial
              </label>
              <Input
                placeholder="Rechercher par nom commercial..."
                value={filters.searchTerm}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, searchTerm: e.target.value }))
                }
                className="text-xl font-medium"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Fournisseur
              </label>
              <Combobox
                options={mockCompanies.map((c) => ({ value: c.id, label: c.name }))}
                value={filters.supplierId || ""}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, supplierId: value || null }))
                }
                placeholder="Tous"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Site
              </label>
              <Select
                value={filters.siteId || "all"}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, siteId: value === "all" ? null : value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les sites</SelectItem>
                  {mockSites.map((site) => (
                    <SelectItem key={site.id} value={site.id}>
                      <span className="font-mono text-xs font-semibold">{site.code}</span>
                      <span className="ml-2 text-slate-600">— {site.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Code MP
              </label>
              <Input
                placeholder="Rechercher par code..."
                value={filters.siteCode || ""}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, siteCode: e.target.value || null }))
                }
                className="font-mono text-sm"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Statut
              </label>
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    status: value as RawMaterialStatus | "all",
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <Badge className={cn("gap-1.5 border text-xs", config.className)}>
                        <config.icon className="h-3 w-3" />
                        {config.label}
                      </Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Bottom Section - Filter Bar (40px) */}
        <div className="flex items-center justify-between bg-muted/50 px-6 py-2">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "gap-2",
                showFilters && "bg-primary/10 text-primary border-primary"
              )}
            >
              <Filter className="h-4 w-4" />
              Filtrer
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1 rounded-full px-1.5 py-0.5 text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>

            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2">
                <X className="h-4 w-4" />
                Effacer les filtres
              </Button>
            )}

            {/* Active filter badges */}
            {filters.siteId && (
              <Badge variant="outline" className="gap-1.5">
                Site:{" "}
                {mockSites.find((s) => s.id === filters.siteId)?.code}
                <button
                  onClick={() => setFilters((prev) => ({ ...prev, siteId: null }))}
                  className="ml-1"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {filters.status !== "all" && (
              <Badge variant="outline" className="gap-1.5">
                Statut: {statusConfig[filters.status as RawMaterialStatus].label}
                <button
                  onClick={() => setFilters((prev) => ({ ...prev, status: "all" }))}
                  className="ml-1"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-4">
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-slate-900">{filteredMaterials.length}</span>{" "}
              résultat{filteredMaterials.length > 1 ? "s" : ""}
            </p>

            {selectedCount > 0 && (
              <div className="flex items-center gap-2 border-l border-slate-300 pl-4">
                <Badge variant="secondary" className="px-2 py-1">
                  {selectedCount} sélectionné{selectedCount > 1 ? "s" : ""}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBulkExport}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Exporter
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBulkDelete}
                  className="gap-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  Supprimer
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto bg-slate-50 px-6 py-4">
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="bg-slate-50">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="font-semibold text-slate-700">
                      {header.isPlaceholder
                        ? null
                        : header.column.columnDef.header
                          ? typeof header.column.columnDef.header === "function"
                            ? header.column.columnDef.header(header.getContext())
                            : header.column.columnDef.header
                          : null}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-32 text-center text-slate-500"
                  >
                    Aucune matière première trouvée
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    onClick={() => handleRowClick(row.original)}
                    className="cursor-pointer transition-colors hover:bg-slate-50"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        onClick={(e) => {
                          // Prevent row click when clicking checkbox
                          if (cell.column.id === "select") {
                            e.stopPropagation()
                          }
                        }}
                      >
                        {typeof cell.column.columnDef.cell === "function"
                          ? cell.column.columnDef.cell(cell.getContext())
                          : null}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span>Lignes par page:</span>
              <Select
                value={String(pagination.pageSize)}
                onValueChange={(value) => table.setPageSize(Number(value))}
              >
                <SelectTrigger className="h-8 w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 25, 50, 100].map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Précédent
              </Button>
              <span className="text-sm text-slate-600">
                Page {table.getState().pagination.pageIndex + 1} sur {table.getPageCount()}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Suivant
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
