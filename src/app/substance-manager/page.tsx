import type { Metadata } from "next"

import { SubstanceManagerList } from "@/components/substance-manager/substance-manager-list"
import { mockSubstances } from "@/lib/mock-data"

export const metadata: Metadata = {
  title: "Substance Manager | GeberGuard PLM",
  description: "Gestionnaire de substances V2 - Interface simplifiée",
}

export default function SubstanceManagerPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900">Substance Manager</h1>
        <p className="text-muted-foreground">
          Interface simplifiée de gestion des substances INCI
        </p>
      </div>
      <SubstanceManagerList substances={mockSubstances} />
    </div>
  )
}
