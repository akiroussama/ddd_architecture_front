import { Metadata } from "next"

import { SubstanceList } from "@/components/substances/substance-list"
import { mockSubstances, pageSizeOptions } from "@/lib/mock-data"

export const metadata: Metadata = {
  title: "Substances | GeberGuard PLM",
}

export default function SubstancesPage() {
  return (
    <div className="space-y-6">
      <SubstanceList
        pageSizeOptions={pageSizeOptions}
        substances={mockSubstances}
      />
    </div>
  )
}
