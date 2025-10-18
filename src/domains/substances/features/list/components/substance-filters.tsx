"use client"

import { useMemo } from "react"

import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import { Checkbox } from "@/shared/ui/checkbox"
import {
  RadioGroup,
  RadioGroupItem
} from "@/shared/ui/radio-group"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/shared/ui/sheet"
import { Switch } from "@/shared/ui/switch"

type Allergen26Filter = "any" | "yes" | "no"

export interface FilterState {
  classes: string[]
  families: string[]
  allergenGroups: string[]
  allergen26: Allergen26Filter
  functions: string[]
  countries: string[]
  restrictionTypes: string[]
  blacklists: string[]
  showArchived: boolean
}

interface SubstanceFiltersProps {
  filters: FilterState
  onChange: (next: FilterState) => void
  onReset: () => void
  options: {
    classes: string[]
    families: string[]
    allergenGroups: string[]
    functions: string[]
    countries: string[]
    restrictionTypes: readonly string[]
    blacklists: string[]
  }
}

const sectionTitleClass = "text-xs font-semibold uppercase tracking-wider text-slate-500"

export function SubstanceFilters({ filters, onChange, onReset, options }: SubstanceFiltersProps) {
  const activeCount = useMemo(() => {
    let count = 0
    if (filters.classes.length) count += 1
    if (filters.families.length) count += 1
    if (filters.allergenGroups.length) count += 1
    if (filters.allergen26 !== "any") count += 1
    if (filters.functions.length) count += 1
    if (filters.countries.length) count += 1
    if (filters.restrictionTypes.length) count += 1
    if (filters.blacklists.length) count += 1
    if (filters.showArchived) count += 1
    return count
  }, [filters])

  const toggleValue = (key: keyof FilterState, value: string) => {
    const current = filters[key]
    if (!Array.isArray(current)) return
    const exists = current.includes(value)
    const next = exists ? current.filter((item) => item !== value) : [...current, value]
    onChange({ ...filters, [key]: next })
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative flex items-center gap-2">
          Filtres avancés
          {activeCount > 0 ? (
            <Badge className="absolute -right-2 -top-2 h-5 min-w-5 justify-center rounded-full bg-primary text-[11px] text-white">
              {activeCount}
            </Badge>
          ) : null}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full max-w-xl overflow-y-auto">
        <SheetHeader className="space-y-1 text-left">
          <SheetTitle>Filtres avancés</SheetTitle>
          <p className="text-sm text-slate-500">
            Combinez les filtres pour isoler les substances selon les exigences
            réglementaires ou marketing.
          </p>
        </SheetHeader>
        <div className="mt-6 space-y-6 text-sm">
          <section>
            <h3 className={sectionTitleClass}>Classification</h3>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {options.classes.map((value) => (
                <label
                  key={value}
                  className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 hover:border-primary/50"
                >
                  <Checkbox
                    checked={filters.classes.includes(value)}
                    onCheckedChange={() => toggleValue("classes", value)}
                  />
                  {value}
                </label>
              ))}
            </div>
          </section>

          <section>
            <h3 className={sectionTitleClass}>Familles</h3>
            <div className="mt-3 grid max-h-40 grid-cols-2 gap-2 overflow-y-auto pr-1">
              {options.families.map((value) => (
                <label
                  key={value}
                  className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 hover:border-primary/50"
                >
                  <Checkbox
                    checked={filters.families.includes(value)}
                    onCheckedChange={() => toggleValue("families", value)}
                  />
                  {value}
                </label>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className={sectionTitleClass}>Allergènes</h3>
              <span className="text-xs text-slate-400">26 allergènes parfum</span>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <h4 className="mb-2 text-xs font-semibold text-slate-500">Groupe allergène</h4>
              <div className="flex flex-col gap-2">
                {options.allergenGroups.map((value) => (
                  <label key={value} className="flex items-center gap-2">
                    <Checkbox
                      checked={filters.allergenGroups.includes(value)}
                      onCheckedChange={() => toggleValue("allergenGroups", value)}
                    />
                    {value}
                  </label>
                ))}
              </div>
              <div className="mt-4">
                <h4 className="mb-1 text-xs font-semibold text-slate-500">Présence allergènes 26</h4>
                <RadioGroup
                  value={filters.allergen26}
                  onValueChange={(value: Allergen26Filter) =>
                    onChange({ ...filters, allergen26: value })
                  }
                  className="grid gap-2 sm:grid-cols-3"
                >
                  <label className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2">
                    <RadioGroupItem value="any" />
                    Indifférent
                  </label>
                  <label className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2">
                    <RadioGroupItem value="yes" />
                    Oui
                  </label>
                  <label className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2">
                    <RadioGroupItem value="no" />
                    Non
                  </label>
                </RadioGroup>
              </div>
            </div>
          </section>

          <section>
            <h3 className={sectionTitleClass}>Fonctions</h3>
            <div className="mt-3 grid max-h-40 grid-cols-2 gap-2 overflow-y-auto pr-1">
              {options.functions.map((value) => (
                <label
                  key={value}
                  className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 hover:border-primary/50"
                >
                  <Checkbox
                    checked={filters.functions.includes(value)}
                    onCheckedChange={() => toggleValue("functions", value)}
                  />
                  {value}
                </label>
              ))}
            </div>
          </section>

          <section>
            <h3 className={sectionTitleClass}>Restrictions</h3>
            <div className="mt-3 space-y-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Pays / zone
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {options.countries.map((value) => (
                    <label
                      key={value}
                      className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 hover:border-primary/50"
                    >
                      <Checkbox
                        checked={filters.countries.includes(value)}
                        onCheckedChange={() => toggleValue("countries", value)}
                      />
                      {value}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Type de restriction
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {options.restrictionTypes.map((value) => (
                    <label
                      key={value}
                      className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 hover:border-primary/50"
                    >
                      <Checkbox
                        checked={filters.restrictionTypes.includes(value)}
                        onCheckedChange={() => toggleValue("restrictionTypes", value)}
                      />
                      {value}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className={sectionTitleClass}>Blacklists</h3>
            <div className="mt-3 grid gap-2">
              {options.blacklists.map((value) => (
                <label
                  key={value}
                  className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 hover:border-primary/50"
                >
                  <Checkbox
                    checked={filters.blacklists.includes(value)}
                    onCheckedChange={() => toggleValue("blacklists", value)}
                  />
                  {value}
                </label>
              ))}
            </div>
          </section>

          <section className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-700">Inclure les substances archivées</h3>
              <p className="text-xs text-slate-500">
                Affiche également les ingrédients retirés du référentiel actif.
              </p>
            </div>
            <Switch
              checked={filters.showArchived}
              onCheckedChange={(value) => onChange({ ...filters, showArchived: value })}
            />
          </section>
        </div>
        <SheetFooter className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4">
          <Button variant="ghost" onClick={onReset}>
            Réinitialiser
          </Button>
          <SheetClose asChild>
            <Button>Appliquer</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
