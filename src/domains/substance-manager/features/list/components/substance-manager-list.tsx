"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  Filter,
  Download,
  Plus,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react"
import { toast } from "sonner"

import type { Substance, SubstanceStatus } from "@/types"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Badge } from "@/shared/ui/badge"
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

interface SubstanceManagerListProps {
  substances: Substance[]
}

const statusConfig: Record<
  SubstanceStatus,
  { label: string; icon: React.ElementType; className: string }
> = {
  active: {
    label: "Actif",
    icon: CheckCircle2,
    className: "bg-green-50 text-green-700 border-green-200",
  },
  archived: {
    label: "Archivé",
    icon: AlertCircle,
    className: "bg-gray-50 text-gray-700 border-gray-200",
  },
  "under-review": {
    label: "En révision",
    icon: Clock,
    className: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
}

export function SubstanceManagerList({ substances }: SubstanceManagerListProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<SubstanceStatus | "all">("all")
  const [classFilter, setClassFilter] = React.useState<string>("all")

  // Get unique classes for filter
  const classes = React.useMemo(() => {
    const uniqueClasses = new Set<string>()
    substances.forEach((s) => {
      if (s.class) uniqueClasses.add(s.class)
    })
    return Array.from(uniqueClasses).sort()
  }, [substances])

  // Filter substances
  const filteredSubstances = React.useMemo(() => {
    return substances.filter((substance) => {
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase()
        const matchesSearch =
          substance.inciEU.toLowerCase().includes(search) ||
          substance.inciUS.toLowerCase().includes(search) ||
          substance.casEinecsPairs.some((pair) =>
            pair.cas.toLowerCase().includes(search) ||
            pair.einecs?.toLowerCase().includes(search)
          ) ||
          substance.class?.toLowerCase().includes(search)

        if (!matchesSearch) return false
      }

      // Status filter
      if (statusFilter !== "all" && substance.status !== statusFilter) {
        return false
      }

      // Class filter
      if (classFilter !== "all" && substance.class !== classFilter) {
        return false
      }

      return true
    })
  }, [substances, searchTerm, statusFilter, classFilter])

  const handleRowClick = (substance: Substance) => {
    router.push(`/substance-manager/${substance.id}`)
  }

  const handleExport = () => {
    toast.success(`Export de ${filteredSubstances.length} substance(s) lancé`)
  }

  const handleCreateNew = () => {
    router.push("/manager")
  }

  const activeFilterCount = React.useMemo(() => {
    let count = 0
    if (searchTerm) count++
    if (statusFilter !== "all") count++
    if (classFilter !== "all") count++
    return count
  }, [searchTerm, statusFilter, classFilter])

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Rechercher par INCI, CAS, classe..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            Exporter
          </Button>
          <Button size="sm" onClick={handleCreateNew} className="gap-2">
            <Plus className="h-4 w-4" />
            Nouvelle substance
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-600">Filtres</span>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="rounded-full">
              {activeFilterCount}
            </Badge>
          )}
        </div>

        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as SubstanceStatus | "all")}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            {Object.entries(statusConfig).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                <div className="flex items-center gap-2">
                  <config.icon className="h-3 w-3" />
                  {config.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={classFilter} onValueChange={setClassFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les classes</SelectItem>
            {classes.map((cls) => (
              <SelectItem key={cls} value={cls}>
                {cls}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchTerm("")
              setStatusFilter("all")
              setClassFilter("all")
            }}
          >
            Réinitialiser
          </Button>
        )}
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <p className="text-sm text-slate-600">
          <span className="font-semibold text-slate-900">{filteredSubstances.length}</span>{" "}
          substance{filteredSubstances.length > 1 ? "s" : ""} trouvée{filteredSubstances.length > 1 ? "s" : ""}
        </p>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="font-semibold">INCI EU</TableHead>
              <TableHead className="font-semibold">INCI US</TableHead>
              <TableHead className="font-semibold">CAS / EINECS</TableHead>
              <TableHead className="font-semibold">Classe</TableHead>
              <TableHead className="font-semibold">Fonctions</TableHead>
              <TableHead className="font-semibold">Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubstances.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-slate-500"
                >
                  Aucune substance trouvée
                </TableCell>
              </TableRow>
            ) : (
              filteredSubstances.map((substance) => {
                const status = statusConfig[substance.status]
                const StatusIcon = status.icon

                return (
                  <TableRow
                    key={substance.id}
                    onClick={() => handleRowClick(substance)}
                    className="cursor-pointer transition-colors hover:bg-slate-50"
                  >
                    <TableCell className="font-medium text-slate-900">
                      {substance.inciEU}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {substance.inciUS}
                    </TableCell>
                    <TableCell className="text-sm">
                      {substance.casEinecsPairs.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          <code className="rounded bg-slate-100 px-2 py-1 text-xs font-mono">
                            {substance.casEinecsPairs[0].cas}
                          </code>
                          {substance.casEinecsPairs[0].einecs && (
                            <code className="rounded bg-slate-50 px-2 py-1 text-xs font-mono text-slate-500">
                              {substance.casEinecsPairs[0].einecs}
                            </code>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {substance.class || <span className="text-slate-400">—</span>}
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="flex flex-wrap gap-1">
                        {substance.functions.slice(0, 2).map((func, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-xs"
                          >
                            {func}
                          </Badge>
                        ))}
                        {substance.functions.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{substance.functions.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("gap-1.5 border", status.className)}>
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
