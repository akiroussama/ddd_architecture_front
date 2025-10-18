"use client"

import Link from "next/link"
import { useMemo } from "react"
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type OnChangeFn,
  type PaginationState,
  type RowSelectionState,
  type SortingState
} from "@tanstack/react-table"
import { ChevronDown, ExternalLink, MoreHorizontal } from "lucide-react"

import { formatDate, formatRelativeDate } from "@/lib/utils"
import type { Substance } from "@/types"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

const restrictionColors: Record<string, string> = {
  forbidden: "bg-error/10 text-error",
  regulated: "bg-warning/10 text-warning",
  listed: "bg-success/10 text-success",
  unlisted: "bg-slate-100 text-slate-700"
}

interface SubstanceTableProps {
  data: Substance[]
  sorting: SortingState
  onSortingChange: OnChangeFn<SortingState>
  rowSelection: RowSelectionState
  onRowSelectionChange: OnChangeFn<RowSelectionState>
  pagination: PaginationState
  onPaginationChange: OnChangeFn<PaginationState>
  pageSizeOptions: number[]
}

export function SubstanceTable({
  data,
  sorting,
  onSortingChange,
  rowSelection,
  onRowSelectionChange,
  pagination,
  onPaginationChange,
  pageSizeOptions
}: SubstanceTableProps) {
  const columns = useMemo<ColumnDef<Substance, unknown>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            aria-label="Sélectionner toutes les substances affichées"
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() ? "indeterminate" : false)
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            aria-label={`Sélectionner ${row.original.inciEU}`}
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 30
      },
      {
        accessorKey: "inciEU",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            INCI EU
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" aria-hidden />
          </button>
        ),
        cell: ({ row }) => (
          <div className="flex flex-col gap-1">
            <Link
              className="font-semibold text-slate-900 hover:text-primary"
              href={`/substances/${row.original.id}`}
            >
              {row.original.inciEU}
            </Link>
            {row.original.inciUS && row.original.inciUS !== row.original.inciEU ? (
              <span className="text-xs text-slate-500">{row.original.inciUS}</span>
            ) : null}
          </div>
        )
      },
      {
        id: "cas",
        accessorKey: "casEinecsPairs",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            CAS
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" aria-hidden />
          </button>
        ),
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.casEinecsPairs.map((pair, index) => (
              <Badge
                key={`${row.original.id}-cas-${pair.cas}-${index}`}
                variant="outline"
                className="rounded-full border-slate-200 bg-slate-100 text-xs font-medium text-slate-700"
              >
                {pair.cas}
              </Badge>
            ))}
          </div>
        )
      },
      {
        id: "families",
        header: "Famille",
        accessorKey: "families",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.families.map((family) => (
              <Badge
                key={`${row.original.id}-family-${family}`}
                className="rounded-full bg-primary/10 text-xs font-medium text-primary"
              >
                {family}
              </Badge>
            ))}
          </div>
        )
      },
      {
        id: "restrictions",
        header: "Restrictions",
        cell: ({ row }) => {
          const typeCounters = row.original.restrictions.reduce(
            (acc, restriction) => {
              acc[restriction.type] = (acc[restriction.type] ?? 0) + 1
              return acc
            },
            {} as Record<string, number>
          )

          return (
            <div className="flex flex-wrap gap-1">
              {Object.entries(typeCounters).map(([type, count]) => (
                <Badge
                  key={`${row.original.id}-${type}`}
                  className={`rounded-full text-xs font-medium ${restrictionColors[type] ?? "bg-slate-100 text-slate-600"}`}
                >
                  {type === "forbidden" ? "🔴" : type === "regulated" ? "🟠" : "🟢"} {count}
                </Badge>
              ))}
            </div>
          )
        }
      },
      {
        id: "blacklists",
        header: "Blacklists",
        cell: ({ row }) => (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                className="rounded-full bg-secondary/20 text-xs font-medium text-secondary-foreground"
                variant="secondary"
              >
                {row.original.blacklists.length || 0}
              </Badge>
            </TooltipTrigger>
            {row.original.blacklists.length ? (
              <TooltipContent>
                <ul className="space-y-1 text-left">
                  {row.original.blacklists.map((name) => (
                    <li key={`${row.original.id}-${name}`} className="text-xs">
                      {name}
                    </li>
                  ))}
                </ul>
              </TooltipContent>
            ) : null}
          </Tooltip>
        )
      },
      {
        accessorKey: "updatedAt",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Dernière MAJ
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" aria-hidden />
          </button>
        ),
        cell: ({ row }) => (
          <div className="flex flex-col text-xs text-slate-500">
            <span>{formatRelativeDate(row.original.updatedAt)}</span>
            <span>{formatDate(row.original.updatedAt, "dd MMM yyyy")}</span>
          </div>
        )
      },
      {
        id: "actions",
        enableSorting: false,
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button aria-label="Actions" size="icon" variant="ghost">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/substances/${row.original.id}`}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Ouvrir la fiche
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/substances/${row.original.id}?tab=restrictions`}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Voir restrictions
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }
    ],
    []
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      rowSelection,
      pagination
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange,
    onRowSelectionChange,
    onPaginationChange,
    enableRowSelection: true,
    getRowId: (row) => row.id,
    manualPagination: false
  })

  return (
    <div className="space-y-4 rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-xs uppercase tracking-wide text-slate-500">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  className="hover:bg-slate-50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="align-top text-sm text-slate-700">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center text-sm text-slate-500">
                  Aucune substance ne correspond aux filtres.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 px-4 py-3 text-sm text-slate-600 md:flex-row">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wide text-slate-500">Afficher</span>
          <select
            className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm"
            value={pagination.pageSize}
            onChange={(event) =>
              table.setPageSize(Number.parseInt(event.target.value, 10))
            }
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size} / page
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Page précédente
          </Button>
          <span className="text-xs text-slate-500">
            Page {table.getState().pagination.pageIndex + 1} sur {table.getPageCount() || 1}
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
    </div>
  )
}
